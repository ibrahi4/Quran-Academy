import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  // ========== ADMIN CRUD ==========

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        ...dto,
        email: dto.email.toLowerCase().trim(),
        password: hashedPassword,
      },
      select: this.userSelect,
    });

    this.logger.log(`User created: ${user.email} [${user.role}]`);
    return user;
  }

  async findAll(query: QueryUsersDto) {
    const { page = 1, limit = 20, search, role, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const allowedSort = ['createdAt', 'firstName', 'lastName', 'email', 'lastLoginAt'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: this.userSelect,
        orderBy: { [safeSortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...this.userSelect,
        student: {
          select: {
            id: true,
            parentName: true,
            age: true,
            gender: true,
            country: true,
            city: true,
            timezone: true,
            level: true,
            goals: true,
          },
        },
        _count: {
          select: {
            payments: true,
            notifications: true,
            subscriptions: true,
            blogPosts: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email.toLowerCase().trim(), NOT: { id } },
      });
      if (existing) throw new ConflictException('Email already in use');
      dto.email = dto.email.toLowerCase().trim();
    }
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: this.userSelect,
    });
    this.logger.log(`User updated: ${user.email} by admin`);
    return user;
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: this.userSelect,
    });
    this.logger.log(`User ${updated.isActive ? 'activated' : 'deactivated'}: ${updated.email}`);
    return updated;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    this.logger.warn(`User soft-deleted: ${user.email}`);
    return { message: 'User deactivated successfully' };
  }

  // ========== PROFILE (Self) ==========

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...this.userSelect,
        student: {
          select: {
            id: true,
            parentName: true,
            age: true,
            gender: true,
            country: true,
            city: true,
            timezone: true,
            level: true,
            goals: true,
            progress: {
              select: {
                surahsCompleted: true,
                juzCompleted: true,
                tajweedScore: true,
                memorization: true,
                lastLesson: true,
              },
            },
          },
        },
        _count: {
          select: {
            payments: true,
            notifications: true,
            subscriptions: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Profile not found');

    // Get related counts through student
    let studentCounts = null;
    if (user.student) {
      const counts = await this.prisma.student.findUnique({
        where: { id: user.student.id },
        select: {
          _count: {
            select: {
              bookings: true,
              sessions: true,
            },
          },
        },
      });
      studentCounts = counts?._count;
    }

    return {
      ...user,
      studentCounts,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: any = {};
    if (dto.firstName) data.firstName = dto.firstName.trim();
    if (dto.lastName) data.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) data.phone = dto.phone?.trim() || null;
    if (dto.locale) data.locale = dto.locale;
    if (dto.avatar !== undefined) data.avatar = dto.avatar;

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: this.userSelect,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const isSame = await bcrypt.compare(dto.newPassword, user.password);
    if (isSame) throw new BadRequestException('New password must be different');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    await this.prisma.refreshToken.deleteMany({ where: { userId } });

    this.logger.log(`Password changed for user: ${userId}`);
    return { message: 'Password changed successfully. Please login again.' };
  }

  // ========== STATS (Admin) ==========

  async getStats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [total, active, students, teachers, admins, recentSignups] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { role: 'STUDENT' } }),
        this.prisma.user.count({ where: { role: 'TEACHER' } }),
        this.prisma.user.count({ where: { role: 'ADMIN' } }),
        this.prisma.user.count({
          where: { createdAt: { gte: thirtyDaysAgo } },
        }),
      ]);

    return {
      total,
      active,
      inactive: total - active,
      byRole: { students, teachers, admins },
      recentSignups,
    };
  }

  // ========== Private ==========

  private userSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    role: true,
    locale: true,
    avatar: true,
    isActive: true,
    emailVerified: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
  };
}
