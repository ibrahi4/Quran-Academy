import {
  Injectable, NotFoundException, BadRequestException,
  ConflictException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { Prisma } from '@prisma/client';

export interface GeneratedDate {
  date: Date;
  isAvailable: boolean;
  conflictWith?: string;
}

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================
  // PREVIEW: Generate dates + check conflicts (no DB writes)
  // ============================================
  async preview(dto: CreateRecurringDto) {
    this.validateInput(dto);

    const dates = this.generateDates(dto);
    const skipSet = new Set(
      (dto.skipDates || []).map((d) => new Date(d).toISOString().slice(0, 10)),
    );

    // Filter out manually skipped dates
    const candidateDates = dates.filter(
      (d) => !skipSet.has(d.toISOString().slice(0, 10)),
    );

    // Check conflicts for each date
    const results: GeneratedDate[] = [];
    for (const date of candidateDates) {
      const conflict = await this.checkConflict(
        dto.teacherId,
        date,
        dto.duration || 60,
      );
      results.push({
        date,
        isAvailable: !conflict,
        conflictWith: conflict?.title,
      });
    }

    const available = results.filter((r) => r.isAvailable);
    const conflicts = results.filter((r) => !r.isAvailable);

    return {
      totalDates: dates.length,
      skippedManually: dates.length - candidateDates.length,
      willCreate: available.length,
      conflicts: conflicts.length,
      dates: results,
      summary: {
        startDate: dto.startDate,
        endDate: dto.endDate,
        daysOfWeek: dto.daysOfWeek,
        time: dto.time,
        duration: dto.duration || 60,
      },
    };
  }

  // ============================================
  // CREATE: Generate sessions in transaction
  // ============================================
  async create(dto: CreateRecurringDto) {
    this.validateInput(dto);

    // Verify student + teacher exist
    const [student, teacher] = await Promise.all([
      this.prisma.student.findUnique({ where: { id: dto.studentId } }),
      this.prisma.teacher.findUnique({ where: { id: dto.teacherId } }),
    ]);

    if (!student) throw new NotFoundException('Student not found');
    if (!teacher) throw new NotFoundException('Teacher not found');

    // Generate all candidate dates
    const allDates = this.generateDates(dto);
    const skipSet = new Set(
      (dto.skipDates || []).map((d) => new Date(d).toISOString().slice(0, 10)),
    );
    const candidateDates = allDates.filter(
      (d) => !skipSet.has(d.toISOString().slice(0, 10)),
    );

    // Check conflicts for each
    const datesToCreate: Date[] = [];
    const conflicts: { date: Date; conflictWith: string }[] = [];

    for (const date of candidateDates) {
      const conflict = await this.checkConflict(
        dto.teacherId,
        date,
        dto.duration || 60,
      );
      if (conflict) {
        conflicts.push({ date, conflictWith: conflict.title });
      } else {
        datesToCreate.push(date);
      }
    }

    // If conflicts exist and skipOnConflict is false, throw error
    if (conflicts.length > 0 && !dto.skipOnConflict) {
      throw new ConflictException({
        message: `${conflicts.length} time conflicts detected. Enable "Skip on conflict" to proceed.`,
        conflicts: conflicts.map((c) => ({
          date: c.date.toISOString(),
          conflictWith: c.conflictWith,
        })),
      });
    }

    if (datesToCreate.length === 0) {
      throw new BadRequestException('No sessions to create after filtering');
    }

    // Create in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the recurring schedule
      const schedule = await tx.recurringSchedule.create({
        data: {
          studentId: dto.studentId,
          teacherId: dto.teacherId,
          title: dto.title,
          daysOfWeek: dto.daysOfWeek,
          time: dto.time,
          duration: dto.duration || 60,
          frequency: dto.frequency || 'WEEKLY',
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          skipDates: (dto.skipDates || []).map((d) => new Date(d)),
          platform: dto.platform || 'ZOOM',
          meetingLink: dto.meetingLink,
          notes: dto.notes,
          totalGenerated: datesToCreate.length,
          totalSkipped: conflicts.length + (allDates.length - candidateDates.length),
        },
      });

      // Bulk create all sessions
      await tx.session.createMany({
        data: datesToCreate.map((date) => ({
          studentId: dto.studentId,
          teacherId: dto.teacherId,
          recurringScheduleId: schedule.id,
          title: dto.title,
          date,
          duration: dto.duration || 60,
          status: 'SCHEDULED' as const,
          platform: dto.platform || 'ZOOM',
          meetingLink: dto.meetingLink,
          notes: dto.notes,
        })),
      });

      // AUTO-LINK: Update student.teacherId
      if (student.teacherId !== dto.teacherId) {
        await tx.student.update({
          where: { id: dto.studentId },
          data: { teacherId: dto.teacherId },
        });
      }

      return schedule;
    });

    this.logger.log(
      `Recurring schedule created: ${result.id} | ${datesToCreate.length} sessions | ${conflicts.length} skipped`,
    );

    return {
      schedule: result,
      stats: {
        created: datesToCreate.length,
        skippedConflicts: conflicts.length,
        skippedManually: allDates.length - candidateDates.length,
        total: allDates.length,
      },
      conflicts: conflicts.map((c) => ({
        date: c.date.toISOString(),
        conflictWith: c.conflictWith,
      })),
    };
  }

  // ============================================
  // LIST all recurring schedules
  // ============================================
  async findAll(params: { studentId?: string; teacherId?: string; isActive?: boolean } = {}) {
    const where: Prisma.RecurringScheduleWhereInput = {};
    if (params.studentId) where.studentId = params.studentId;
    if (params.teacherId) where.teacherId = params.teacherId;
    if (params.isActive !== undefined) where.isActive = params.isActive;

    return this.prisma.recurringSchedule.findMany({
      where,
      include: {
        student: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
        teacher: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
        _count: { select: { sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================
  // GET one with sessions
  // ============================================
  async findOne(id: string) {
    const schedule = await this.prisma.recurringSchedule.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        sessions: { orderBy: { date: 'asc' } },
      },
    });
    if (!schedule) throw new NotFoundException('Recurring schedule not found');
    return schedule;
  }

  // ============================================
  // CANCEL future sessions
  // ============================================
  async cancelFuture(id: string) {
    const schedule = await this.findOne(id);
    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      // Cancel future scheduled sessions
      const cancelled = await tx.session.updateMany({
        where: {
          recurringScheduleId: id,
          date: { gte: now },
          status: 'SCHEDULED',
        },
        data: { status: 'CANCELLED' },
      });

      // Mark schedule as inactive
      await tx.recurringSchedule.update({
        where: { id },
        data: { isActive: false },
      });

      return cancelled;
    });

    return {
      message: `Cancelled ${result.count} future sessions`,
      count: result.count,
    };
  }

  // ============================================
  // DELETE entire schedule (and all its sessions)
  // ============================================
  async remove(id: string) {
    await this.findOne(id);
    // Sessions have SetNull on delete, but we cascade manually for clarity
    await this.prisma.session.deleteMany({
      where: { recurringScheduleId: id, status: 'SCHEDULED' },
    });
    await this.prisma.recurringSchedule.delete({ where: { id } });
    return { message: 'Recurring schedule and future sessions deleted' };
  }

  // ============================================
  // PRIVATE: Generate dates from pattern
  // ============================================
  private generateDates(dto: CreateRecurringDto): Date[] {
    const dates: Date[] = [];
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const [hours, minutes] = dto.time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      throw new BadRequestException('Invalid time format. Use HH:MM (e.g., 09:00)');
    }

    const daysOfWeekSet = new Set(dto.daysOfWeek);
    const frequency = dto.frequency || 'WEEKLY';

    let weekCounter = 0;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);

    // Find first Sunday of the week to align frequency calculations
    const firstSunday = new Date(current);
    firstSunday.setDate(current.getDate() - current.getDay());

    while (current <= end) {
      // Frequency check
      const weeksSinceStart = Math.floor(
        (current.getTime() - firstSunday.getTime()) / (7 * 24 * 60 * 60 * 1000),
      );
      let includeThisWeek = true;

      if (frequency === 'BIWEEKLY' && weeksSinceStart % 2 !== 0) {
        includeThisWeek = false;
      } else if (frequency === 'MONTHLY') {
        // Only first occurrence of each day in the month
        const firstOccurrence = new Date(current.getFullYear(), current.getMonth(), 1);
        while (firstOccurrence.getDay() !== current.getDay()) {
          firstOccurrence.setDate(firstOccurrence.getDate() + 1);
        }
        if (current.getDate() !== firstOccurrence.getDate()) {
          includeThisWeek = false;
        }
      }

      if (includeThisWeek && daysOfWeekSet.has(current.getDay())) {
        const sessionDate = new Date(current);
        sessionDate.setHours(hours, minutes, 0, 0);
        dates.push(sessionDate);
      }

      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  // ============================================
  // PRIVATE: Check conflict for a specific datetime
  // ============================================
  private async checkConflict(teacherId: string, date: Date, duration: number) {
    const endDate = new Date(date.getTime() + duration * 60 * 1000);

    const candidates = await this.prisma.session.findMany({
      where: {
        teacherId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        date: {
          gte: new Date(date.getTime() - 4 * 60 * 60 * 1000),
          lt: endDate,
        },
      },
      select: { id: true, date: true, duration: true, title: true },
    });

    return candidates.find((s) => {
      const sStart = new Date(s.date).getTime();
      const sEnd = sStart + (s.duration || 60) * 60 * 1000;
      return sStart < endDate.getTime() && sEnd > date.getTime();
    });
  }

  // ============================================
  // PRIVATE: Validate input
  // ============================================
  private validateInput(dto: CreateRecurringDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end <= start) {
      throw new BadRequestException('End date must be after start date');
    }
    if (dto.daysOfWeek.length === 0) {
      throw new BadRequestException('Select at least one day of the week');
    }
    if (!/^\d{2}:\d{2}$/.test(dto.time)) {
      throw new BadRequestException('Time must be in HH:MM format');
    }
  }
}