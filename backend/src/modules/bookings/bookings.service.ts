import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingStatus } from "@prisma/client";

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBookingDto) {
    const booking = await this.prisma.booking.create({
      data: {
        ...dto,
        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : null,
      },
    });

    this.logger.log(`New booking created: ${booking.id} - ${booking.email}`);
    // TODO: Send email notification via queue
    return booking;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
      }),
      this.prisma.booking.count(),
    ]);
    return { bookings, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: { student: true, session: true },
    });
  }

  async updateStatus(id: string, status: BookingStatus, adminNotes?: string) {
    return this.prisma.booking.update({
      where: { id },
      data: { status, adminNotes },
    });
  }
}
