import { Injectable, Logger, NotFoundException } from "@nestjs/common";
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
    return booking;
  }

  async findAll(page = 1, limit = 20, status?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
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
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { student: true, session: true },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    return booking;
  }

  async updateStatus(id: string, status: BookingStatus, adminNotes?: string) {
    await this.findOne(id);
    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status, adminNotes },
    });
    this.logger.log(`Booking ${id} status updated to ${status}`);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.booking.delete({ where: { id } });
    this.logger.log(`Booking deleted: ${id}`);
    return { message: "Booking deleted successfully" };
  }
}
