import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAssignmentDto, ReviewSubmissionDto } from './dto/create-assignment.dto';

const ASSIGNMENT_INCLUDE = {
  student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
  teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
  submissions: true,
};

@Injectable()
export class AssignmentsService {
  private readonly logger = new Logger(AssignmentsService.name);

  constructor(private prisma: PrismaService) {}

  // ── Teacher: Create Assignment ──────────────────────────────
  async create(teacherUserId: string, dto: CreateAssignmentDto) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: teacherUserId } });
    if (!teacher) throw new ForbiddenException('Teacher profile not found');

    return this.prisma.assignment.create({
      data: {
        title: dto.title,
        instructions: dto.instructions,
        studentId: dto.studentId,
        teacherId: teacher.id,
        reportId: dto.reportId,
        sessionId: dto.sessionId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        maxScore: dto.maxScore ?? 100,
        status: dto.reportId ? 'DRAFT' : 'PUBLISHED',
      },
      include: ASSIGNMENT_INCLUDE,
    });
  }

  // ── Teacher: Get My Assignments ─────────────────────────────
  async getTeacherAssignments(teacherUserId: string, status?: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: teacherUserId } });
    if (!teacher) return [];

    const where: any = { teacherId: teacher.id };
    if (status) where.status = status;

    return this.prisma.assignment.findMany({
      where,
      include: {
        ...ASSIGNMENT_INCLUDE,
        submissions: {
          include: {
            student: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Teacher: Get Pending Submissions ────────────────────────
  async getPendingSubmissions(teacherUserId: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: teacherUserId } });
    if (!teacher) return [];

    return this.prisma.assignmentSubmission.findMany({
      where: {
        assignment: { teacherId: teacher.id },
        status: { in: ['SUBMITTED', 'LATE'] },
      },
      include: {
        assignment: true,
        student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  // ── Teacher: Review Submission ──────────────────────────────
  async reviewSubmission(teacherUserId: string, submissionId: string, dto: ReviewSubmissionDto) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: teacherUserId } });
    if (!teacher) throw new ForbiddenException('Not authorized');

    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.assignment.teacherId !== teacher.id) throw new ForbiddenException('Not your assignment');

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: dto.score,
        feedback: dto.feedback,
        revisionRequested: dto.revisionRequested ?? false,
        status: dto.revisionRequested ? 'RETURNED_FOR_REVISION' : 'GRADED',
        reviewedAt: new Date(),
        reviewedByTeacherId: teacher.id,
      },
      include: {
        assignment: true,
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  // ── Student: Get My Assignments ─────────────────────────────
  async getStudentAssignments(studentUserId: string, status?: string) {
    const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
    if (!student) return [];

    const where: any = {
      studentId: student.id,
      status: { in: ['PUBLISHED', 'CLOSED'] },
    };
    if (status) where.status = status;

    const assignments = await this.prisma.assignment.findMany({
      where,
      include: {
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        submissions: { where: { studentId: student.id } },
        session: { select: { title: true, date: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    return assignments.map(a => ({
      ...a,
      mySubmission: a.submissions[0] ?? null,
      isOverdue: a.dueDate ? new Date(a.dueDate) < new Date() : false,
    }));
  }

  // ── Student: Submit Assignment ──────────────────────────────
  async submitAssignment(
    studentUserId: string,
    assignmentId: string,
    data: { content?: string; linkUrl?: string; fileUrl?: string },
  ) {
    const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
    if (!student) throw new ForbiddenException('Student not found');

    const assignment = await this.prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.studentId !== student.id) throw new ForbiddenException('Not your assignment');
    if (assignment.status !== 'PUBLISHED') throw new BadRequestException('Assignment not available');

    const isLate = assignment.dueDate ? new Date(assignment.dueDate) < new Date() : false;

    // Check if already submitted
    const existing = await this.prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId: student.id } },
    });

    if (existing) {
      if (existing.status === 'GRADED') throw new BadRequestException('Already graded');
      // Allow resubmit if returned for revision
      return this.prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: {
          content: data.content,
          linkUrl: data.linkUrl,
          fileUrl: data.fileUrl,
          status: isLate ? 'LATE' : 'SUBMITTED',
          submittedAt: new Date(),
          revisionRequested: false,
        },
      });
    }

    return this.prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: student.id,
        content: data.content,
        linkUrl: data.linkUrl,
        fileUrl: data.fileUrl,
        status: isLate ? 'LATE' : 'SUBMITTED',
      },
    });
  }

  // ── Admin: Get All Assignments ──────────────────────────────
  async getAll(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.assignment.findMany({
      where,
      include: ASSIGNMENT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }
}