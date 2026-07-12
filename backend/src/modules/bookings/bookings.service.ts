import {
  Injectable, Logger, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  private calculateAge(dob: Date | string): number {
    const birthDate = typeof dob === 'string' ? new Date(dob) : dob;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  private validateDateOfBirth(dob: string): Date {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      throw new BadRequestException('Invalid date of birth format');
    }
    const age = this.calculateAge(birthDate);
    if (age < 5) throw new BadRequestException('Student must be at least 5 years old');
    if (age > 100) throw new BadRequestException('Please enter a valid date of birth');
    return birthDate;
  }

  // ============================================
  // CHECK EMAIL AVAILABILITY
  // ============================================
  async checkEmailAvailability(email: string) {
    const normalized = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true, role: true, firstName: true },
    });

    if (!user) {
      return { available: true, exists: false };
    }

    // TRIAL_STUDENT with no completed bookings → still can rebook
    if (user.role === 'TRIAL_STUDENT') {
      return {
        available: true,
        exists: true,
        isTrial: true,
        message: 'Welcome back! Your existing trial account will be used.',
      };
    }

    return {
      available: false,
      exists: true,
      role: user.role,
      message: 'This email is already registered. Please login to book a session.',
    };
  }

  // ============================================
  // CREATE BOOKING
  // ============================================
  async create(dto: CreateBookingDto) {
    const email = dto.email.toLowerCase().trim();

    // Validate DOB
    let dobDate: Date | null = null;
    let calculatedAge: number | null = null;
    if (dto.dateOfBirth) {
      dobDate = this.validateDateOfBirth(dto.dateOfBirth);
      calculatedAge = this.calculateAge(dobDate);
    }

    // Check email uniqueness with smart logic
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { student: true },
    });

    if (existingUser && existingUser.role !== 'TRIAL_STUDENT') {
      throw new ConflictException(
        'This email is already registered. Please login to your account to book a session.',
      );
    }

    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const setupToken = crypto.randomBytes(32).toString('hex');
    const setupTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [firstName, ...lastParts] = dto.name.trim().split(' ');
    const lastName = lastParts.join(' ') || firstName;

    const result = await this.prisma.$transaction(async (tx) => {
      let user = existingUser;
      let isNewUser = false;

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone: dto.phone?.trim() || null,
            role: Role.TRIAL_STUDENT,
            mustChangePassword: true,
            setupToken,
            setupTokenExpiresAt,
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            isActive: true,
          },
          include: { student: true },
        });
        isNewUser = true;
        this.logger.log(`Auto-created TRIAL_STUDENT: ${email}`);
      } else {
        // Refresh setup token for returning trial user
        user = await tx.user.update({
          where: { id: existingUser!.id },
          data: {
            setupToken,
            setupTokenExpiresAt,
            mustChangePassword: true,
            phone: dto.phone?.trim() || existingUser!.phone,
          },
          include: { student: true },
        });
      }

      // Create or update student with all new fields
      let student = user.student;
      const studentData: any = {
        country: dto.country,
        timezone: dto.timezone,
        dateOfBirth: dobDate,
        age: calculatedAge,
        gender: dto.gender,
        nativeLanguage: dto.nativeLanguage,
        level: dto.currentLevel || 'BEGINNER',
        source: dto.serviceSlug,
        parentName: dto.parentName,
        parentPhone: dto.parentPhone,
        parentRelation: dto.parentRelation,
      };

      if (!student) {
        student = await tx.student.create({
          data: { userId: user.id, ...studentData, goals: [] },
        });
      } else {
        student = await tx.student.update({
          where: { id: student.id },
          data: studentData,
        });
      }

      // Create booking with all new fields
      const booking = await tx.booking.create({
        data: {
          studentId: student.id,
          name: dto.name,
          email,
          phone: dto.phone,
          country: dto.country,
          timezone: dto.timezone,
          dateOfBirth: dobDate,
          gender: dto.gender,
          studentType: dto.studentType,
          nativeLanguage: dto.nativeLanguage,
          currentLevel: dto.currentLevel,
          parentName: dto.parentName,
          parentPhone: dto.parentPhone,
          parentRelation: dto.parentRelation,
          preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : null,
          preferredTime: dto.preferredTime,
          serviceSlug: dto.serviceSlug,
          type: dto.type || 'TRIAL',
          notes: dto.notes,
        },
      });

      return { booking, user, isNewUser };
    });

    // Send emails async
    Promise.all([
      this.notifications.sendTrialWelcomeEmail({
        email,
        name: dto.name,
        tempPassword,
        setupToken,
        bookingDate: dto.preferredDate || undefined,
      }),
      this.notifications.sendBookingConfirmation(email, dto.name, dto.preferredDate),
    ]).catch((err) => this.logger.error('Failed to send emails', err));

    this.logger.log(`Booking created: ${result.booking.id} - ${email}`);

    return {
      ...result.booking,
      age: calculatedAge,
      message: result.isNewUser
        ? 'Booking created! Check your email to set up your account.'
        : 'Booking updated! Check your email for the new setup link.',
    };
  }

  // ============================================
  // FIND ALL
  // ============================================
  async findAll(page = 1, limit = 20, status?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: { user: { select: { firstName: true, lastName: true, email: true, role: true } } },
          },
          session: true,
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    const enriched = data.map((b: any) => ({
      ...b,
      age: b.dateOfBirth ? this.calculateAge(b.dateOfBirth) : null,
    }));

    return {
      data: enriched,
      meta: {
        total, page, limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
        session: { include: { teacher: { include: { user: true } } } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return {
      ...booking,
      age: booking.dateOfBirth ? this.calculateAge(booking.dateOfBirth) : null,
    };
  }

  // ============================================
  // CONFIRM BOOKING
  // ============================================
  async confirmBooking(id: string, data: {
    teacherId: string; date: string; time: string;
    duration?: number; meetingLink: string; adminNotes?: string;
  }) {
    const booking = await this.findOne(id);
    if (booking.status === 'CONFIRMED') throw new BadRequestException('Already confirmed');
    if (!booking.studentId) throw new BadRequestException('No student linked');

    const teacher = await this.prisma.teacher.findUnique({
      where: { id: data.teacherId },
      include: { user: true },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');

    const sessionDate = new Date(data.date);
    const [hours, minutes] = data.time.split(':').map(Number);
    sessionDate.setHours(hours, minutes || 0, 0, 0);
    const duration = data.duration || 30;

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: { status: 'CONFIRMED', adminNotes: data.adminNotes, meetingLink: data.meetingLink },
      });

      const session = await tx.session.create({
        data: {
          studentId: booking.studentId!,
          teacherId: data.teacherId,
          bookingId: booking.id,
          title: `Trial Session - ${booking.name}`,
          date: sessionDate,
          duration,
          status: 'SCHEDULED',
          platform: 'ZOOM',
          meetingLink: data.meetingLink,
          notes: booking.notes,
        },
      });

      await tx.student.update({
        where: { id: booking.studentId! },
        data: { teacherId: data.teacherId },
      });

      return { booking: updatedBooking, session, teacher };
    });

    const sessionDateStr = sessionDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const sessionTimeStr = sessionDate.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });

    this.notifications.sendTrialConfirmedEmail({
      email: booking.email,
      name: booking.name,
      sessionDate: sessionDateStr,
      sessionTime: sessionTimeStr,
      teacherName: `${teacher.user.firstName} ${teacher.user.lastName}`,
      meetingLink: data.meetingLink,
      duration,
    }).catch((err) => this.logger.error('Email failed', err));

    return result;
  }

  async updateStatus(id: string, status: BookingStatus, adminNotes?: string, meetingLink?: string) {
    const booking = await this.findOne(id);
    if (status === 'CONFIRMED' && booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Use /confirm endpoint');
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status, adminNotes, ...(meetingLink && { meetingLink }) },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.booking.delete({ where: { id } });
    return { message: 'Booking deleted successfully' };
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password + '!2';
  }
}