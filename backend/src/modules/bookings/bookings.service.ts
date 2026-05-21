import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
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

  // ============================================
  // CREATE BOOKING (auto-create user + email)
  // ============================================
  async create(dto: CreateBookingDto) {
    const email = dto.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { student: true },
    });

    // Generate temp password and setup token
    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const setupToken = crypto.randomBytes(32).toString('hex');
    const setupTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [firstName, ...lastParts] = dto.name.trim().split(' ');
    const lastName = lastParts.join(' ') || firstName;

    // Use transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      let user = existingUser;
      let isNewUser = false;

      // Create user if doesn't exist
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
        this.logger.log(`Auto-created TRIAL_STUDENT account: ${email}`);
      } else if (existingUser && !existingUser.student) {
        // Update setup token if no student profile yet
        user = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            setupToken,
            setupTokenExpiresAt,
            mustChangePassword: true,
          },
          include: { student: true },
        });
      }

      // Create student profile if doesn't exist
      let student = user.student;
      if (!student) {
        student = await tx.student.create({
          data: {
            userId: user.id,
            country: dto.country,
            timezone: dto.timezone,
            level: 'BEGINNER',
            goals: [],
            source: dto.serviceSlug,
          },
        });
      }

      // Create the booking linked to the student
      const booking = await tx.booking.create({
        data: {
          studentId: student.id,
          name: dto.name,
          email,
          phone: dto.phone,
          country: dto.country,
          timezone: dto.timezone,
          preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : null,
          preferredTime: dto.preferredTime,
          serviceSlug: dto.serviceSlug,
          type: dto.type || 'TRIAL',
          notes: dto.notes,
        },
      });

      return { booking, user, isNewUser };
    });

    // Send emails AFTER transaction (don't block response)
    Promise.all([
      // Welcome email to new user
      result.isNewUser
        ? this.notifications.sendTrialWelcomeEmail({
            email,
            name: dto.name,
            tempPassword,
            setupToken,
            bookingDate: dto.preferredDate || undefined,
          })
        : Promise.resolve(),

      // Admin notification
      this.notifications.sendBookingConfirmation(email, dto.name, dto.preferredDate),
    ]).catch((err) => {
      this.logger.error('Failed to send booking emails', err);
    });

    this.logger.log(`Booking created: ${result.booking.id} - ${email}`);

    return {
      ...result.booking,
      message: result.isNewUser
        ? 'Booking created! Check your email to set up your account.'
        : 'Booking created successfully!',
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
          student: { include: { user: { select: { firstName: true, lastName: true, email: true, role: true } } } },
          session: true,
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
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
    return booking;
  }

  // ============================================
  // CONFIRM BOOKING (Admin assigns teacher + time)
  // ============================================
  async confirmBooking(
    id: string,
    data: {
      teacherId: string;
      date: string;
      time: string;
      duration?: number;
      meetingLink: string;
      adminNotes?: string;
    },
  ) {
    const booking = await this.findOne(id);

    if (booking.status === 'CONFIRMED') {
      throw new BadRequestException('Booking already confirmed');
    }
    if (!booking.studentId) {
      throw new BadRequestException('Booking has no student linked');
    }

    // Verify teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: data.teacherId },
      include: { user: true },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');

    // Build session date from date + time
    const sessionDate = new Date(data.date);
    const [hours, minutes] = data.time.split(':').map(Number);
    sessionDate.setHours(hours, minutes || 0, 0, 0);

    const duration = data.duration || 30;

    // Transaction: update booking + create session + link student to teacher
    const result = await this.prisma.$transaction(async (tx) => {
      // Update booking
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          adminNotes: data.adminNotes,
          meetingLink: data.meetingLink,
        },
      });

      // Create session
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

      // Link student to this teacher
      await tx.student.update({
        where: { id: booking.studentId! },
        data: { teacherId: data.teacherId },
      });

      return { booking: updatedBooking, session, teacher };
    });

    // Send confirmation email
    const sessionDateStr = sessionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const sessionTimeStr = sessionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    this.notifications.sendTrialConfirmedEmail({
      email: booking.email,
      name: booking.name,
      sessionDate: sessionDateStr,
      sessionTime: sessionTimeStr,
      teacherName: `${teacher.user.firstName} ${teacher.user.lastName}`,
      meetingLink: data.meetingLink,
      duration,
    }).catch((err) => this.logger.error('Failed to send confirmation email', err));

    this.logger.log(`Booking ${id} confirmed with teacher ${data.teacherId}`);
    return result;
  }

  // ============================================
  // UPDATE STATUS (basic - for other status changes)
  // ============================================
  async updateStatus(
    id: string,
    status: BookingStatus,
    adminNotes?: string,
    meetingLink?: string,
  ) {
    const booking = await this.findOne(id);

    // If confirming, use the dedicated method
    if (status === 'CONFIRMED' && booking.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Use /confirm endpoint to confirm booking with teacher + time',
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status,
        adminNotes,
        ...(meetingLink && { meetingLink }),
      },
    });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.booking.delete({ where: { id } });
    return { message: 'Booking deleted successfully' };
  }

  // ============================================
  // HELPERS
  // ============================================
  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password + '!2';
  }
}