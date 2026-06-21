import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { CreateSessionReportDto } from './dto/create-report.dto';

const REPORT_INCLUDE = {
  session: {
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  },
  teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
  student: { include: { user: { select: { firstName: true, lastName: true } } } },
  assignments: true,
};

@Injectable()
export class SessionReportsService {
  private readonly logger = new Logger(SessionReportsService.name);

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  // ── Teacher: Submit Report ──────────────────────────────────
  async submitReport(teacherUserId: string, dto: CreateSessionReportDto) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: teacherUserId } });
    if (!teacher) throw new ForbiddenException('Teacher profile not found');

    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
      include: { student: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.teacherId !== teacher.id) throw new ForbiddenException('Not your session');

    const existing = await this.prisma.sessionReport.findUnique({ where: { sessionId: dto.sessionId } });
    if (existing) {
      if (existing.status === 'APPROVED') {
        throw new BadRequestException('Report already approved');
      }
      const updated = await this.prisma.sessionReport.update({
        where: { id: existing.id },
        data: {
          ...dto,
          status: 'SUBMITTED',
          submittedAt: new Date(),
          reviewedAt: null,
          reviewedByAdminId: null,
          adminDecisionNote: null,
        },
        include: REPORT_INCLUDE,
      });
      this.logger.log(`Report resubmitted: ${existing.id}`);
      return updated;
    }

    const report = await this.prisma.sessionReport.create({
      data: {
        sessionId: dto.sessionId,
        teacherId: teacher.id,
        studentId: session.studentId,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        studentAttended: dto.studentAttended,
        teacherAttended: dto.teacherAttended,
        studentLateMins: dto.studentLateMins ?? 0,
        teacherLateMins: dto.teacherLateMins ?? 0,
        lessonSummary: dto.lessonSummary,
        teacherNotes: dto.teacherNotes,
        nextLessonFocus: dto.nextLessonFocus,
        privateAdminNote: dto.privateAdminNote,
        participationScore: dto.participationScore,
        recitationScore: dto.recitationScore,
        tajweedScore: dto.tajweedScore,
        memorizationScore: dto.memorizationScore,
        overallScore: dto.overallScore,
        evaluationNotes: dto.evaluationNotes,
        isTrialAssessment: dto.isTrialAssessment ?? false,
        recommendedLevel: dto.recommendedLevel,
        recommendedPlanNotes: dto.recommendedPlanNotes,
      },
      include: REPORT_INCLUDE,
    });

    this.logger.log(`Report submitted: ${report.id} for session ${dto.sessionId}`);
    return report;
  }

  async getMyReports(teacherUserId: string, status?: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: teacherUserId } });
    if (!teacher) return [];
    const where: any = { teacherId: teacher.id };
    if (status) where.status = status;
    return this.prisma.sessionReport.findMany({
      where, include: REPORT_INCLUDE, orderBy: { createdAt: 'desc' },
    });
  }

  async getReportBySession(sessionId: string) {
    return this.prisma.sessionReport.findUnique({
      where: { sessionId }, include: REPORT_INCLUDE,
    });
  }

  async getPendingReports() {
    return this.prisma.sessionReport.findMany({
      where: { status: { in: ['SUBMITTED', 'CHANGES_REQUESTED'] } },
      include: REPORT_INCLUDE, orderBy: { submittedAt: 'asc' },
    });
  }

  async getAllReports(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.sessionReport.findMany({
      where, include: REPORT_INCLUDE, orderBy: { createdAt: 'desc' },
    });
  }

  // ── Admin: Approve Report ─────────────────────────────────
  // ⚠️ APPROVAL ONLY — DOES NOT complete session or credit wallet
  // ⚠️ Admin must then manually confirm the session
  async approveReport(reportId: string, adminId: string, adminName: string, adminNote?: string) {
    const report = await this.prisma.sessionReport.findUnique({
      where: { id: reportId },
      include: { session: true, assignments: true },
    });
    if (!report) throw new NotFoundException('Report not found');
    if (report.status === 'APPROVED') throw new BadRequestException('Already approved');

    return this.prisma.$transaction(async (tx) => {
      // 1. Mark report as approved
      const updatedReport = await tx.sessionReport.update({
        where: { id: reportId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedByAdminId: adminId,
          adminDecisionNote: adminNote,
        },
        include: REPORT_INCLUDE,
      });

      // 2. Publish assignments
      if (report.assignments.length > 0) {
        await tx.assignment.updateMany({
          where: { reportId: report.id, status: 'DRAFT' },
          data: { status: 'PUBLISHED' },
        });
      }

      // 3. Update student level if trial assessment
      if (report.isTrialAssessment && report.recommendedLevel && report.studentId) {
        await tx.student.update({
          where: { id: report.studentId },
          data: { level: report.recommendedLevel },
        });
        this.logger.log(`Student ${report.studentId} level updated to ${report.recommendedLevel}`);
      }

      this.logger.log(
        `Report ${reportId} APPROVED. Session ${report.sessionId} awaits manual confirmation.`,
      );

      return {
        report: updatedReport,
        sessionId: report.sessionId,
        nextStep: 'CONFIRM_SESSION',
      };
    });
  }

  async rejectReport(reportId: string, adminId: string, reason: string) {
    const report = await this.prisma.sessionReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    return this.prisma.sessionReport.update({
      where: { id: reportId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedByAdminId: adminId,
        adminDecisionNote: reason,
      },
      include: REPORT_INCLUDE,
    });
  }

  async requestChanges(reportId: string, adminId: string, notes: string) {
    const report = await this.prisma.sessionReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    return this.prisma.sessionReport.update({
      where: { id: reportId },
      data: {
        status: 'CHANGES_REQUESTED',
        reviewedAt: new Date(),
        reviewedByAdminId: adminId,
        adminDecisionNote: notes,
      },
      include: REPORT_INCLUDE,
    });
  }
}