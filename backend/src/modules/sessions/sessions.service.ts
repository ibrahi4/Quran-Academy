import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { WalletService } from '../wallet/wallet.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  // ============================================
  // CREATE SESSION
  // ============================================
  async create(dto: CreateSessionDto) {
    const sessionDate = new Date(dto.date);
    const duration = dto.duration || 60;

    const student = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException('Student not found');

    if (dto.teacherId) {
      const teacher = await this.prisma.teacher.findUnique({ where: { id: dto.teacherId } });
      if (!teacher) throw new NotFoundException('Teacher not found');

      const conflict = await this.checkTeacherConflict(dto.teacherId, sessionDate, duration);
      if (conflict) {
        throw new ConflictException(
          `Teacher already has a session at this time: "${conflict.title}"`,
        );
      }
    }

    const session = await this.prisma.$transaction(async (tx) => {
      const newSession = await tx.session.create({
        data: {
          studentId: dto.studentId,
          teacherId: dto.teacherId,
          bookingId: dto.bookingId,
          title: dto.title,
          date: sessionDate,
          duration,
          status: dto.status || 'SCHEDULED',
          platform: dto.platform || 'ZOOM',
          meetingLink: dto.meetingLink,
          recordingUrl: dto.recordingUrl,
          notes: dto.notes,
        },
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
          teacher: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        },
      });

      if (dto.teacherId && student.teacherId !== dto.teacherId) {
        await tx.student.update({
          where: { id: dto.studentId },
          data: { teacherId: dto.teacherId },
        });
      }

      return newSession;
    });

    return session;
  }

  // ============================================
  // FIND ALL
  // ============================================
  async findAll(query: QuerySessionsDto) {
    const { page = 1, limit = 20, studentId, teacherId, status, from, to } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SessionWhereInput = {};
    if (studentId) where.studentId = studentId;
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.prisma.session.findMany({
        where, skip, take: limit,
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
          teacher: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.session.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findMy(userId: string, query: QuerySessionsDto) {
    const student = await this.prisma.student.findUnique({ where: { userId } });
    if (!student) return { data: [], meta: { total: 0, page: 1, limit: query.limit || 20, totalPages: 0 } };
    return this.findAll({ ...query, studentId: student.id });
  }

  async findOne(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        teacher: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        booking: true,
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  // ============================================
  // UPDATE SESSION
  // ============================================
  async update(id: string, dto: UpdateSessionDto) {
    const existing = await this.findOne(id);

    const newDate = dto.date ? new Date(dto.date) : existing.date;
    const newDuration = dto.duration || existing.duration;
    const newTeacherId = dto.teacherId ?? existing.teacherId;

    if (newTeacherId && (dto.date || dto.teacherId || dto.duration)) {
      const conflict = await this.checkTeacherConflict(newTeacherId, newDate, newDuration, id);
      if (conflict) {
        throw new ConflictException(`Teacher already has a session at this time: "${conflict.title}"`);
      }
    }

    const data: any = { ...dto };
    if (dto.date) data.date = newDate;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.session.update({
        where: { id }, data,
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
          teacher: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        },
      });

      if (dto.teacherId && dto.teacherId !== existing.teacherId) {
        await tx.student.update({
          where: { id: existing.studentId },
          data: { teacherId: dto.teacherId },
        });
      }

      return updated;
    });
  }

  // ============================================
  // ✅ CONFIRM ATTENDANCE (auto-credit if teacher attended)
  // ============================================
  async confirmAttendance(
    sessionId: string,
    data: {
      teacherAttended: boolean;
      studentAttended: boolean;
      teacherLateMins?: number;
      studentLateMins?: number;
      teacherNotes?: string;
    },
    adminId: string,
    adminName: string,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        teacher: true,
        student: { include: { user: true } },
      },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.status === 'COMPLETED') {
      throw new BadRequestException('Session already confirmed');
    }
    if (!session.teacherId || !session.teacher) {
      throw new BadRequestException('No teacher assigned to this session');
    }

    // Update session
    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        teacherAttended: data.teacherAttended,
        studentAttended: data.studentAttended,
        teacherLateMins: data.teacherLateMins ?? 0,
        studentLateMins: data.studentLateMins ?? 0,
        teacherNotes: data.teacherNotes,
      },
    });

    // ✅ AUTO-CREDIT only if teacher attended
    let walletResult = null;
    if (data.teacherAttended && session.teacher) {
      const hourlyRate = Number(session.teacher.hourlyRate);
      const amount = Math.round((session.duration / 60) * hourlyRate * 100) / 100;

      const studentName = session.student?.user
        ? `${session.student.user.firstName} ${session.student.user.lastName}`
        : 'Student';

      const description = `${session.title} - ${studentName} (${session.duration} min @ $${hourlyRate}/hr)`;

      walletResult = await this.walletService.creditSessionEarning(
        sessionId,
        session.teacherId,
        amount,
        description,
        adminId,
        adminName,
      );

      this.logger.log(
        `Session ${sessionId} confirmed: +$${amount} credited to teacher ${session.teacherId}`,
      );
    } else {
      this.logger.log(
        `Session ${sessionId} confirmed but NO credit (teacher absent)`,
      );
    }

    return {
      session: updated,
      credited: data.teacherAttended,
      walletResult,
    };
  }

  // ============================================
  // GET PENDING CONFIRMATIONS
  // ============================================
  async getPendingConfirmations() {
    const now = new Date();

    const sessions = await this.prisma.session.findMany({
      where: {
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        date: { lt: now },
      },
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { date: 'desc' },
    });

    // Filter: session ended (date + duration < now)
    return sessions.filter((s) => {
      const endTime = new Date(s.date).getTime() + (s.duration || 60) * 60 * 1000;
      return endTime < now.getTime();
    });
  }

  // ============================================
  // DELETE
  // ============================================
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.session.delete({ where: { id } });
    return { message: 'Session deleted successfully' };
  }

  // ============================================
  // UPCOMING
  // ============================================
  async getUpcoming(studentId?: string) {
    const where: Prisma.SessionWhereInput = {
      date: { gte: new Date() },
      status: 'SCHEDULED',
    };
    if (studentId) where.studentId = studentId;

    return this.prisma.session.findMany({
      where,
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { date: 'asc' },
      take: 10,
    });
  }

  // ============================================
  // CONFLICT CHECK + SLOTS
  // ============================================
  async checkConflict(teacherId: string, date: string, duration = 60, excludeId?: string) {
    const conflict = await this.checkTeacherConflict(teacherId, new Date(date), duration, excludeId);
    return {
      hasConflict: !!conflict,
      conflict: conflict ? { id: conflict.id, title: conflict.title, date: conflict.date, duration: conflict.duration } : null,
    };
  }

  async getTeacherAvailableSlots(teacherId: string, date: string) {
    const targetDate = new Date(date);
    const dayStart = new Date(targetDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate); dayEnd.setHours(23, 59, 59, 999);

    const daySessions = await this.prisma.session.findMany({
      where: {
        teacherId,
        date: { gte: dayStart, lte: dayEnd },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
      select: { date: true, duration: true, title: true },
    });

    const slots: any[] = [];
    for (let hour = 8; hour < 22; hour++) {
      const slotStart = new Date(targetDate); slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
      const conflict = daySessions.find((s) => {
        const sStart = new Date(s.date).getTime();
        const sEnd = sStart + (s.duration || 60) * 60 * 1000;
        return sStart < slotEnd.getTime() && sEnd > slotStart.getTime();
      });
      slots.push({
        time: `${String(hour).padStart(2, '0')}:00`,
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        isAvailable: !conflict,
        conflictWith: conflict?.title,
      });
    }

    return { date, teacherId, slots, availableSlots: slots.filter(s => s.isAvailable).length };
  }

  private async checkTeacherConflict(teacherId: string, date: Date, duration: number, excludeId?: string) {
    const endDate = new Date(date.getTime() + duration * 60 * 1000);
    const candidates = await this.prisma.session.findMany({
      where: {
        teacherId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        ...(excludeId && { NOT: { id: excludeId } }),
        date: { gte: new Date(date.getTime() - 4 * 60 * 60 * 1000), lt: endDate },
      },
      select: { id: true, date: true, duration: true, title: true },
    });
    return candidates.find((s) => {
      const sStart = new Date(s.date).getTime();
      const sEnd = sStart + (s.duration || 60) * 60 * 1000;
      return sStart < endDate.getTime() && sEnd > date.getTime();
    });
  }
}