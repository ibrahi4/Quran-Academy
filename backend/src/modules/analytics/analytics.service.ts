import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';
import { Prisma, Locale } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(dto: TrackEventDto, ip?: string, userAgent?: string) {
    // Sanitize metadata
    const safeMeta =
      dto.metadata && typeof dto.metadata === 'object'
        ? JSON.parse(JSON.stringify(dto.metadata))
        : {};

    return await this.prisma.analyticsEvent.create({
      data: {
        event: dto.event.substring(0, 100),
        page: dto.page?.substring(0, 500) || null,
        metadata: safeMeta as Prisma.JsonObject,
        locale: dto.locale ? (dto.locale.toUpperCase() as Locale) : null,
        sessionId: dto.sessionId?.substring(0, 100) || null,
        ip: ip?.substring(0, 45) ?? null,
        userAgent: userAgent?.substring(0, 500) ?? null,
      },
    });
  }

  async findAll(query: QueryAnalyticsDto) {
    const { page = 1, limit = 50, event, page_path, from, to } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AnalyticsEventWhereInput = {};
    if (event) where.event = event;
    if (page_path) {
      where.page = { contains: page_path, mode: 'insensitive' };
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.prisma.analyticsEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.analyticsEvent.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPageViews(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await this.prisma.analyticsEvent.groupBy({
      by: ['page'],
      where: {
        event: 'page_view',
        createdAt: { gte: since },
        page: { not: null },
      },
      _count: true,
      orderBy: { _count: { page: 'desc' } },
      take: 20,
    });

    return events.map((e) => ({ page: e.page, views: e._count }));
  }

  async getEventCounts(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await this.prisma.analyticsEvent.groupBy({
      by: ['event'],
      where: { createdAt: { gte: since } },
      _count: true,
      orderBy: { _count: { event: 'desc' } },
    });

    return events.map((e) => ({ event: e.event, count: e._count }));
  }

  async getDailyStats(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Use Prisma groupBy instead of raw query for safety
    const events = await this.prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    // Group by date in JS (safer than raw query)
    const grouped: Record<string, number> = {};
    events.forEach((e) => {
      const dateKey = e.createdAt.toISOString().split('T')[0];
      grouped[dateKey] = (grouped[dateKey] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getOverview() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayCount, weekCount, monthCount, totalCount] =
      await Promise.all([
        this.prisma.analyticsEvent.count({ where: { createdAt: { gte: today } } }),
        this.prisma.analyticsEvent.count({ where: { createdAt: { gte: thisWeek } } }),
        this.prisma.analyticsEvent.count({ where: { createdAt: { gte: thisMonth } } }),
        this.prisma.analyticsEvent.count(),
      ]);

    return { today: todayCount, thisWeek: weekCount, thisMonth: monthCount, total: totalCount };
  }
}
