import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  AddBonusDto, DeductDto, RecordPayoutDto,
} from './dto/adjust-wallet.dto';
import {
  WalletTransactionType, Prisma,
} from '@prisma/client';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================
  // GET or CREATE wallet for teacher
  // ============================================
  async getOrCreate(teacherId: string) {
    let wallet = await this.prisma.teacherWallet.findUnique({
      where: { teacherId },
    });

    if (!wallet) {
      wallet = await this.prisma.teacherWallet.create({
        data: { teacherId },
      });
      this.logger.log(`Created wallet for teacher ${teacherId}`);
    }

    return wallet;
  }

  // ============================================
  // GET WALLET WITH STATS (by teacherId)
  // ============================================
  async getWalletByTeacherId(teacherId: string) {
    const wallet = await this.getOrCreate(teacherId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthAgg = await this.prisma.walletTransaction.aggregate({
      where: {
        walletId: wallet.id,
        type: 'SESSION_EARNING',
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
      _count: true,
    });

    return {
      ...wallet,
      thisMonthEarnings: Number(thisMonthAgg._sum.amount || 0),
      thisMonthSessions: thisMonthAgg._count,
    };
  }

  // ============================================
  // GET WALLET BY USER ID (for teacher's own view)
  // ============================================
  async getWalletByUserId(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    return this.getWalletByTeacherId(teacher.id);
  }

  // ============================================
  // LIST TRANSACTIONS
  // ============================================
  async getTransactions(
    teacherId: string,
    params: {
      page?: number;
      limit?: number;
      type?: WalletTransactionType;
      from?: string;
      to?: string;
    } = {},
  ) {
    const wallet = await this.getOrCreate(teacherId);

    const { page = 1, limit = 20, type, from, to } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.WalletTransactionWhereInput = { walletId: wallet.id };
    if (type) where.type = type;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          session: {
            select: {
              id: true,
              title: true,
              date: true,
              duration: true,
              student: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ============================================
  // GET TRANSACTIONS BY USER ID
  // ============================================
  async getTransactionsByUserId(userId: string, params: any = {}) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    return this.getTransactions(teacher.id, params);
  }

  // ============================================
  // AUTO-CREDIT (called from sessions service)
  // ============================================
  async creditSessionEarning(
    sessionId: string,
    teacherId: string,
    amount: number,
    description: string,
    adminId: string,
    adminName: string,
  ) {
    const wallet = await this.getOrCreate(teacherId);

    return this.prisma.$transaction(async (tx) => {
      const newBalance = Number(wallet.balance) + amount;

      const updated = await tx.teacherWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: amount },
          totalEarned: { increment: amount },
        },
      });

      const txn = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'SESSION_EARNING',
          amount,
          category: 'Session',
          description,
          sessionId,
          createdById: adminId,
          createdByName: adminName,
          balanceAfter: newBalance,
        },
      });

      this.logger.log(
        `Session earning credited: +${amount} to teacher ${teacherId} (session ${sessionId})`,
      );

      return { wallet: updated, transaction: txn };
    });
  }

  // ============================================
  // ADD BONUS
  // ============================================
  async addBonus(
    teacherId: string,
    dto: AddBonusDto,
    adminId: string,
    adminName: string,
  ) {
    const wallet = await this.getOrCreate(teacherId);

    return this.prisma.$transaction(async (tx) => {
      const newBalance = Number(wallet.balance) + dto.amount;

      const updated = await tx.teacherWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: dto.amount },
          totalBonuses: { increment: dto.amount },
        },
      });

      const txn = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'BONUS',
          amount: dto.amount,
          category: dto.category,
          description: dto.description,
          createdById: adminId,
          createdByName: adminName,
          balanceAfter: newBalance,
        },
      });

      this.logger.log(`Bonus +${dto.amount} added to teacher ${teacherId}`);
      return { wallet: updated, transaction: txn };
    });
  }

  // ============================================
  // DEDUCT
  // ============================================
  async deduct(
    teacherId: string,
    dto: DeductDto,
    adminId: string,
    adminName: string,
  ) {
    const wallet = await this.getOrCreate(teacherId);

    return this.prisma.$transaction(async (tx) => {
      const newBalance = Number(wallet.balance) - dto.amount;

      const updated = await tx.teacherWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: dto.amount },
          totalDeductions: { increment: dto.amount },
        },
      });

      const txn = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEDUCTION',
          amount: -dto.amount,
          category: dto.category,
          description: dto.description,
          createdById: adminId,
          createdByName: adminName,
          balanceAfter: newBalance,
        },
      });

      this.logger.log(`Deduction -${dto.amount} from teacher ${teacherId}`);
      return { wallet: updated, transaction: txn };
    });
  }

  // ============================================
  // RECORD PAYOUT
  // ============================================
  async recordPayout(
    teacherId: string,
    dto: RecordPayoutDto,
    adminId: string,
    adminName: string,
  ) {
    const wallet = await this.getOrCreate(teacherId);

    if (Number(wallet.balance) < dto.amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: $${Number(wallet.balance).toFixed(2)}, Requested: $${dto.amount.toFixed(2)}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const newBalance = Number(wallet.balance) - dto.amount;

      const updated = await tx.teacherWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: dto.amount },
          totalPaid: { increment: dto.amount },
        },
      });

      const txn = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'PAYOUT',
          amount: -dto.amount,
          category: dto.payoutMethod,
          description: dto.description || `Payout via ${dto.payoutMethod}`,
          payoutMethod: dto.payoutMethod,
          payoutReference: dto.payoutReference,
          receiptDate: dto.receiptDate ? new Date(dto.receiptDate) : new Date(),
          createdById: adminId,
          createdByName: adminName,
          balanceAfter: newBalance,
        },
      });

      this.logger.log(`Payout -${dto.amount} paid to teacher ${teacherId}`);
      return { wallet: updated, transaction: txn };
    });
  }

  // ============================================
  // ADMIN: List all wallets summary
  // ============================================
  async getAllWalletsSummary() {
    const teachers = await this.prisma.teacher.findMany({
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        wallet: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return teachers.map((t) => ({
      teacherId: t.id,
      userId: t.userId,
      name: `${t.user.firstName} ${t.user.lastName}`,
      email: t.user.email,
      hourlyRate: Number(t.hourlyRate),
      wallet: t.wallet
        ? {
            balance: Number(t.wallet.balance),
            totalEarned: Number(t.wallet.totalEarned),
            totalPaid: Number(t.wallet.totalPaid),
            totalBonuses: Number(t.wallet.totalBonuses),
            totalDeductions: Number(t.wallet.totalDeductions),
          }
        : null,
    }));
  }
}