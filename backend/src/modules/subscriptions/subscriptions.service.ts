import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Prisma, SubscriptionStatus, SubscriptionPlan, Role } from '@prisma/client';

const PLANS_DATA = [
  {
    id: 'trial', slug: 'trial', plan: SubscriptionPlan.TRIAL,
    nameEn: 'Trial Plan', nameAr: 'الخطة التجريبية',
    descriptionEn: 'Try our service for free', descriptionAr: 'جرب خدمتنا مجانًا',
    priceMonthly: 0, priceYearly: 0, sessionsPerWeek: 1, sessionDuration: 60,
    features: ['1 session per week', 'Basic support'], isActive: true, sortOrder: 0,
  },
  {
    id: 'basic', slug: 'basic', plan: SubscriptionPlan.BASIC,
    nameEn: 'Basic Plan', nameAr: 'الخطة الأساسية',
    descriptionEn: 'Perfect for beginners', descriptionAr: 'مثالية للمبتدئين',
    priceMonthly: 49.99, priceYearly: 499.99, sessionsPerWeek: 2, sessionDuration: 60,
    features: ['2 sessions per week', 'Progress tracking', 'Email support'], isActive: true, sortOrder: 1,
  },
  {
    id: 'premium', slug: 'premium', plan: SubscriptionPlan.PREMIUM,
    nameEn: 'Premium Plan', nameAr: 'الخطة المميزة',
    descriptionEn: 'For serious learners', descriptionAr: 'للمتعلمين الجادين',
    priceMonthly: 99.99, priceYearly: 999.99, sessionsPerWeek: 4, sessionDuration: 60,
    features: ['4 sessions per week', 'Priority support', 'Progress reports', 'Recordings'], isActive: true, sortOrder: 2,
  },
  {
    id: 'family', slug: 'family', plan: SubscriptionPlan.FAMILY,
    nameEn: 'Family Plan', nameAr: 'خطة العائلة',
    descriptionEn: 'For the whole family', descriptionAr: 'للعائلة بأكملها',
    priceMonthly: 149.99, priceYearly: 1499.99, sessionsPerWeek: 6, sessionDuration: 60,
    features: ['Up to 4 students', '6 sessions per week', 'VIP support', 'Progress dashboard'], isActive: true, sortOrder: 3,
  },
];

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private prisma: PrismaService) {}

  // ==================== PLANS ====================

  async findAllPlans(onlyActive = true) {
    return onlyActive
      ? PLANS_DATA.filter(p => p.isActive).sort((a,b) => a.sortOrder - b.sortOrder)
      : PLANS_DATA.sort((a,b) => a.sortOrder - b.sortOrder);
  }

  async findPlan(id: string) {
    const plan = PLANS_DATA.find(p => p.id === id || p.slug === id);
    if (!plan) throw new NotFoundException(`Plan "${id}" not found`);
    return plan;
  }

  async createPlan(dto: any) {
    throw new ConflictException('Plans are statically defined.');
  }

  async updatePlan(id: string, dto: any) {
    await this.findPlan(id);
    throw new ConflictException('Plans are statically defined.');
  }

  async removePlan(id: string) {
    await this.findPlan(id);
    throw new ConflictException('Plans are statically defined.');
  }

  // ==================== SUBSCRIPTIONS ====================

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const existing = await this.prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    if (existing) throw new ConflictException('User already has an active subscription');

    let priceMonthly = dto.priceMonthly;
    if (!priceMonthly) {
      const plan = PLANS_DATA.find(p => p.plan === dto.plan);
      priceMonthly = plan?.priceMonthly ?? 0;
    }

    return this.prisma.subscription.create({
      data: {
        userId,
        plan: dto.plan,
        sessionsPerWeek: dto.sessionsPerWeek ?? 2,
        priceMonthly,
        status: SubscriptionStatus.ACTIVE,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  // ==================== UPGRADE FROM TRIAL ====================
  async upgradeFromTrial(userId: string, dto: CreateSubscriptionDto) {
    // 1) Verify user exists and is TRIAL_STUDENT
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.role !== Role.TRIAL_STUDENT && user.role !== Role.STUDENT) {
      throw new BadRequestException('Only trial students can upgrade');
    }

    // 2) Check no active subscription already
    const existing = await this.prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    if (existing) throw new ConflictException('User already has an active subscription');

    // 3) Get plan price
    let priceMonthly = dto.priceMonthly;
    if (!priceMonthly) {
      const plan = PLANS_DATA.find(p => p.plan === dto.plan);
      priceMonthly = plan?.priceMonthly ?? 0;
    }

    const sessionsPerWeek = dto.sessionsPerWeek ?? PLANS_DATA.find(p => p.plan === dto.plan)?.sessionsPerWeek ?? 2;

    // 4) Transaction: create subscription + upgrade role
    const result = await this.prisma.$transaction(async (tx) => {
      // Create subscription
      const subscription = await tx.subscription.create({
        data: {
          userId,
          plan: dto.plan,
          sessionsPerWeek,
          priceMonthly,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
        },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
        },
      });

      // Upgrade role to STUDENT
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          role: Role.STUDENT,
          mustChangePassword: false,
          trialEndsAt: null,
          setupToken: null,
          setupTokenExpiresAt: null,
        },
        select: {
          id: true, email: true, firstName: true,
          lastName: true, role: true, locale: true, avatar: true,
          mustChangePassword: true,
        },
      });

      return { subscription, user: updatedUser };
    });

    this.logger.log(`Trial upgraded to STUDENT: ${user.email} → plan: ${dto.plan}`);

    return {
      subscription: result.subscription,
      user: result.user,
      message: 'Successfully upgraded from trial to paid subscription!',
    };
  }

  // ==================== QUERIES ====================

  async findAllSubscriptions(query?: {
    userId?: string; status?: SubscriptionStatus; page?: number; limit?: number;
  }) {
    const where: Prisma.SubscriptionWhereInput = {};
    if (query?.userId) where.userId = query.userId;
    if (query?.status) where.status = query.status;

    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          payments: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneSubscription(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return subscription;
  }

  async updateSubscription(id: string, dto: UpdateSubscriptionDto) {
    await this.findOneSubscription(id);
    const data: Prisma.SubscriptionUpdateInput = {};
    if (dto.status) data.status = dto.status;
    if (dto.sessionsPerWeek) data.sessionsPerWeek = dto.sessionsPerWeek;
    if (dto.priceMonthly) data.priceMonthly = dto.priceMonthly;
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.stripeSubId) data.stripeSubId = dto.stripeSubId;
    if (dto.status === SubscriptionStatus.CANCELLED) data.cancelledAt = new Date();
    return this.prisma.subscription.update({
      where: { id }, data,
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
  }

  async cancelSubscription(id: string) {
    await this.findOneSubscription(id);
    return this.prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() },
    });
  }

  async deleteSubscription(id: string) {
    await this.findOneSubscription(id);
    await this.prisma.subscription.delete({ where: { id } });
    return { message: 'Subscription deleted successfully' };
  }

  async getMySubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!subscription) return null;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const student = await this.prisma.student.findUnique({ where: { userId } });

    let sessionsUsed = 0;
    if (student) {
      sessionsUsed = await this.prisma.session.count({
        where: { studentId: student.id, status: 'COMPLETED', completedAt: { gte: startOfMonth } },
      });
    }

    const totalSessionsThisMonth = subscription.sessionsPerWeek * 4;
    return {
      ...subscription,
      sessionsUsed,
      sessionsRemaining: Math.max(0, totalSessionsThisMonth - sessionsUsed),
    };
  }
}