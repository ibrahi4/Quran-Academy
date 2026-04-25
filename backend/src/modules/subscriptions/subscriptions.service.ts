import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ===== PLANS =====

  async createPlan(dto: CreatePlanDto) {
    const existing = await this.prisma.plan.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Plan slug already exists');
    }

    return await this.prisma.plan.create({
      data: {
        slug: dto.slug,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr ?? '',
        descriptionEn: dto.descriptionEn,
        descriptionAr: dto.descriptionAr,
        priceMonthly: dto.priceMonthly,
        priceYearly: dto.priceYearly,
        sessionsPerWeek: dto.sessionsPerWeek,
        sessionDuration: dto.sessionDuration,
        features: dto.features ?? [],
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async findAllPlans(activeOnly = false) {
    const where: Prisma.PlanWhereInput = {};
    if (activeOnly) {
      where.isActive = true;
    }
    return await this.prisma.plan.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findPlan(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }

  async updatePlan(id: string, dto: UpdatePlanDto) {
    await this.findPlan(id);

    if (dto.slug) {
      const existing = await this.prisma.plan.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Slug already in use');
      }
    }

    const data: Prisma.PlanUpdateInput = {};
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.nameEn !== undefined) data.nameEn = dto.nameEn;
    if (dto.nameAr !== undefined) data.nameAr = dto.nameAr;
    if (dto.descriptionEn !== undefined) data.descriptionEn = dto.descriptionEn;
    if (dto.descriptionAr !== undefined) data.descriptionAr = dto.descriptionAr;
    if (dto.priceMonthly !== undefined) data.priceMonthly = dto.priceMonthly;
    if (dto.priceYearly !== undefined) data.priceYearly = dto.priceYearly;
    if (dto.sessionsPerWeek !== undefined) data.sessionsPerWeek = dto.sessionsPerWeek;
    if (dto.sessionDuration !== undefined) data.sessionDuration = dto.sessionDuration;
    if (dto.features !== undefined) data.features = dto.features;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    return await this.prisma.plan.update({
      where: { id },
      data,
    });
  }

  async removePlan(id: string) {
    await this.findPlan(id);
    await this.prisma.plan.delete({ where: { id } });
    return { message: 'Plan deleted successfully' };
  }

  // ===== SUBSCRIPTIONS =====

  async createSubscription(dto: CreateSubscriptionDto) {
    const activeExists = await this.prisma.subscription.findFirst({
      where: { userId: dto.userId, status: 'ACTIVE' },
    });
    if (activeExists) {
      throw new ConflictException(
        'User already has an active subscription',
      );
    }

    return await this.prisma.subscription.create({
      data: {
        user: { connect: { id: dto.userId } },
        plan: dto.plan,
        sessionsPerWeek: dto.sessionsPerWeek ?? 2,
        priceMonthly: dto.priceMonthly ?? 0,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAllSubscriptions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findSubscription(id: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payments: true,
      },
    });
    if (!sub) {
      throw new NotFoundException('Subscription not found');
    }
    return sub;
  }

  async findUserSubscription(userId: string) {
    return await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async updateSubscription(id: string, dto: UpdateSubscriptionDto) {
    await this.findSubscription(id);

    const data: Prisma.SubscriptionUpdateInput = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.sessionsPerWeek !== undefined)
      data.sessionsPerWeek = dto.sessionsPerWeek;
    if (dto.priceMonthly !== undefined) data.priceMonthly = dto.priceMonthly;
    if (dto.stripeSubId !== undefined) data.stripeSubId = dto.stripeSubId;
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.status === 'CANCELLED') data.cancelledAt = new Date();

    return await this.prisma.subscription.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async cancelSubscription(id: string) {
    return await this.updateSubscription(id, { status: 'CANCELLED' });
  }
}
