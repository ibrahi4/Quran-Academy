import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSessionDto) {
    return this.prisma.session.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        duration: dto.duration || 60,
      },
      include: { student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
    });
  }

  async findAll(query: QuerySessionsDto) {
    const { page = 1, limit = 20, studentId, status, from, to } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SessionWhereInput = {};
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.prisma.session.findMany({
        where, skip, take: limit,
        include: { student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.session.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } }, booking: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async update(id: string, dto: UpdateSessionDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return this.prisma.session.update({
      where: { id }, data,
      include: { student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.session.delete({ where: { id } });
    return { message: 'Session deleted successfully' };
  }

  async getUpcoming(studentId?: string) {
    const where: Prisma.SessionWhereInput = {
      date: { gte: new Date() },
      status: 'SCHEDULED',
    };
    if (studentId) where.studentId = studentId;

    return this.prisma.session.findMany({
      where,
      include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { date: 'asc' },
      take: 10,
    });
  }
}
