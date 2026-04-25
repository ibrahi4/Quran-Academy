import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentsDto } from './dto/query-payments.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        ...dto,
        currency: dto.currency || 'USD',
        method: dto.method || 'STRIPE',
        status: 'PENDING',
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async findAll(query: QueryPaymentsDto) {
    const { page = 1, limit = 20, userId, status, from, to } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where, skip, take: limit,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        subscription: true,
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async findUserPayments(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { userId };
    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.payment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async update(id: string, dto: UpdatePaymentDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.status === 'PAID') data.paidAt = new Date();
    return this.prisma.payment.update({
      where: { id }, data,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async markAsPaid(id: string, stripePaymentId?: string) {
    await this.findOne(id);
    return this.prisma.payment.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date(), stripePaymentId },
    });
  }

  async refund(id: string) {
    await this.findOne(id);
    return this.prisma.payment.update({
      where: { id },
      data: { status: 'REFUNDED' },
    });
  }

  async getRevenueStats() {
    const totalRevenue = await this.prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
      _count: true,
    });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await this.prisma.payment.aggregate({
      where: { status: 'PAID', paidAt: { gte: thisMonth } },
      _sum: { amount: true },
      _count: true,
    });

    return {
      total: { amount: totalRevenue._sum.amount || 0, count: totalRevenue._count },
      thisMonth: { amount: monthlyRevenue._sum.amount || 0, count: monthlyRevenue._count },
    };
  }
}
