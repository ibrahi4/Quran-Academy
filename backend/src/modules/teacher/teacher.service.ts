import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Role } from '@prisma/client';

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // CRUD (Admin)
  // ============================================

  async create(dto: CreateTeacherDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    if (user.role !== Role.TEACHER) {
      await this.prisma.user.update({
        where: { id: dto.userId },
        data: { role: Role.TEACHER },
      });
    }

    return this.prisma.teacher.create({
      data: {
        userId: dto.userId,
        hourlyRate: dto.hourlyRate ?? 15.0,
        bio: dto.bio,
        specialties: dto.specialties ?? [],
        isActive: dto.isActive ?? true,
      },
      include: {
        user: {
          select: {
            id: true, email: true, firstName: true,
            lastName: true, avatar: true, isActive: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true, email: true, firstName: true,
            lastName: true, avatar: true, isActive: true,
          },
        },
        _count: { select: { students: true, sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true, email: true, firstName: true,
            lastName: true, avatar: true, isActive: true,
          },
        },
        students: {
          select: {
            id: true,
            level: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        _count: { select: { sessions: true } },
      },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async findByUserId(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true, email: true, firstName: true,
            lastName: true, avatar: true,
          },
        },
      },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async update(id: string, dto: UpdateTeacherDto) {
    await this.findOne(id);
    return this.prisma.teacher.update({
      where: { id },
      data: {
        hourlyRate: dto.hourlyRate,
        bio: dto.bio,
        specialties: dto.specialties,
        isActive: dto.isActive,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.teacher.delete({ where: { id } });
  }

  // ============================================
  // DASHBOARD
  // ============================================

  async getDashboard(userId: string) {
    const teacher = await this.findByUserId(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todaySessions,
      upcomingSessions,
      totalStudents,
      monthlyStats,
      todaySessionsList,
    ] = await Promise.all([
      this.prisma.session.count({
        where: {
          teacherId: teacher.id,
          date: { gte: today, lt: tomorrow },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        },
      }),
      this.prisma.session.count({
        where: {
          teacherId: teacher.id,
          date: { gte: today },
          status: 'SCHEDULED',
        },
      }),
      this.prisma.student.count({
        where: { teacherId: teacher.id },
      }),
      this.getMonthlyStats(teacher.id),
      // Fetch today's actual sessions with student info
      this.prisma.session.findMany({
        where: {
          teacherId: teacher.id,
          date: { gte: today, lt: tomorrow },
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  firstName: true, lastName: true,
                  email: true, avatar: true,
                },
              },
            },
          },
        },
        orderBy: { date: 'asc' },
      }),
    ]);

    return {
      teacher,
      todaySessions,
      upcomingSessions,
      totalStudents,
      monthlyStats,
      todaySessionsList,
    };
  }

  // ============================================
  // SESSIONS
  // ============================================

  async getSessions(
    userId: string,
    query: { status?: string; from?: string; to?: string },
  ) {
    const teacher = await this.findByUserId(userId);

    const where: any = { teacherId: teacher.id };
    if (query.status) where.status = query.status;
    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    return this.prisma.session.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true, lastName: true,
                email: true, avatar: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  // ============================================
  // EARNINGS
  // ============================================

  async getEarnings(userId: string, month?: string) {
    const teacher = await this.findByUserId(userId);

    const targetMonth = month ? new Date(month) : new Date();
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

    const sessions = await this.prisma.session.findMany({
      where: {
        teacherId: teacher.id,
        status: 'COMPLETED',
        completedAt: { gte: startOfMonth, lte: endOfMonth },
      },
      select: {
        id: true, date: true, duration: true, completedAt: true, title: true,
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 60) / 60, 0);
    const totalEarnings = totalHours * Number(teacher.hourlyRate);

    return {
      teacher: { id: teacher.id, hourlyRate: teacher.hourlyRate },
      month: startOfMonth.toISOString().slice(0, 7),
      totalHours: Math.round(totalHours * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      sessionCount: sessions.length,
      sessions,
    };
  }

  // ============================================
  // COMPLETE SESSION
  // ============================================

  async completeSession(
    userId: string,
    sessionId: string,
    data: {
      teacherNotes?: string;
      studentAttended?: boolean;
      teacherAttended?: boolean;
      studentLateMins?: number;
      teacherLateMins?: number;
    },
  ) {
    const teacher = await this.findByUserId(userId);

    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, teacherId: teacher.id },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status === 'COMPLETED') {
      throw new ForbiddenException('Session already completed');
    }

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        teacherNotes: data.teacherNotes,
        studentAttended: data.studentAttended ?? true,
        teacherAttended: data.teacherAttended ?? true,
        studentLateMins: data.studentLateMins ?? 0,
        teacherLateMins: data.teacherLateMins ?? 0,
      },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  // ============================================
  // MY STUDENTS
  // ============================================

  async getMyStudents(userId: string) {
    const teacher = await this.findByUserId(userId);

    const students = await this.prisma.student.findMany({
      where: { teacherId: teacher.id },
      include: {
        user: {
          select: {
            id: true, firstName: true, lastName: true,
            email: true, avatar: true,
          },
        },
        sessions: {
          where: { teacherId: teacher.id },
          orderBy: { date: 'desc' },
          take: 1,
          select: { id: true, date: true, status: true, title: true },
        },
        _count: { select: { sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return students.map((s) => ({
      id: s.id,
      userId: s.userId,
      level: s.level,
      goals: s.goals,
      timezone: s.timezone,
      country: s.country,
      age: s.age,
      gender: s.gender,
      user: s.user,
      lastSession: s.sessions[0] || null,
      totalSessions: s._count.sessions,
    }));
  }

  // ============================================
  // WEEKLY SCHEDULE
  // ============================================

  async getWeeklySchedule(userId: string, startDate?: string) {
    const teacher = await this.findByUserId(userId);

    const weekStart = startDate ? new Date(startDate) : new Date();
    weekStart.setHours(0, 0, 0, 0);
    const day = weekStart.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + diff);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const sessions = await this.prisma.session.findMany({
      where: {
        teacherId: teacher.id,
        date: { gte: weekStart, lte: weekEnd },
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true, lastName: true,
                email: true, avatar: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    const days: Record<string, typeof sessions> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days[d.toISOString().slice(0, 10)] = [];
    }
    for (const session of sessions) {
      const key = new Date(session.date).toISOString().slice(0, 10);
      if (days[key]) days[key].push(session);
    }

    return {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      days,
      totalSessions: sessions.length,
    };
  }

  // ============================================
  // AVAILABILITY CHECK
  // ============================================

  async checkAvailability(userId: string, date: string, duration: number = 60) {
    const teacher = await this.findByUserId(userId);

    const targetDate = new Date(date);
    const endDate = new Date(targetDate.getTime() + duration * 60 * 1000);

    const candidates = await this.prisma.session.findMany({
      where: {
        teacherId: teacher.id,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        date: {
          gte: new Date(targetDate.getTime() - 120 * 60 * 1000),
          lt: endDate,
        },
      },
      select: {
        id: true, date: true, duration: true, title: true,
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const conflicts = candidates.filter((s) => {
      const sStart = new Date(s.date).getTime();
      const sEnd = sStart + (s.duration || 60) * 60 * 1000;
      return sStart < endDate.getTime() && sEnd > targetDate.getTime();
    });

    return {
      date,
      duration,
      isAvailable: conflicts.length === 0,
      conflicts: conflicts.map((s) => ({
        id: s.id,
        title: s.title,
        date: s.date,
        duration: s.duration,
        studentName: `${s.student.user.firstName} ${s.student.user.lastName}`.trim(),
      })),
    };
  }

  // ============================================
  // AVAILABLE SLOTS
  // ============================================

  async getAvailableSlots(userId: string, date: string) {
    const teacher = await this.findByUserId(userId);

    const targetDate = new Date(date);
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const daySessions = await this.prisma.session.findMany({
      where: {
        teacherId: teacher.id,
        date: { gte: dayStart, lte: dayEnd },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
      select: { date: true, duration: true, title: true },
      orderBy: { date: 'asc' },
    });

    const WORK_START = 8;
    const WORK_END = 22;
    const SLOT_MIN = 60;

    const slots: Array<{
      time: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
      conflictWith?: string;
    }> = [];

    for (let hour = WORK_START; hour < WORK_END; hour++) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + SLOT_MIN * 60 * 1000);

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

    return {
      date,
      teacherId: teacher.id,
      slots,
      totalSlots: slots.length,
      availableSlots: slots.filter((s) => s.isAvailable).length,
      bookedSlots: slots.filter((s) => !s.isAvailable).length,
    };
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private async getMonthlyStats(teacherId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [completedSessions, durationAgg] = await Promise.all([
      this.prisma.session.count({
        where: {
          teacherId,
          status: 'COMPLETED',
          completedAt: { gte: startOfMonth },
        },
      }),
      this.prisma.session.aggregate({
        where: {
          teacherId,
          status: 'COMPLETED',
          completedAt: { gte: startOfMonth },
        },
        _sum: { duration: true },
      }),
    ]);

    return {
      completedSessions,
      totalHours: Math.round(((durationAgg._sum.duration || 0) / 60) * 100) / 100,
    };
  }
}