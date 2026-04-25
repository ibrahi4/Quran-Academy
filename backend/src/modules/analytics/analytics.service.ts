import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';
import { Prisma, Locale } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackEvent(dto: TrackEventDto, ip?: string, userAgent?: string) {
    return await this.prisma.analyticsEvent.create({
      data: {
        event: dto.event,
        page: dto.page,
        metadata: (dto.metadata as Prisma.JsonObject) ?? {},
        locale: dto.locale ? (dto.locale as Locale) : null,
        sessionId: dto.sessionId,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
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
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPageViews(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await this.prisma.analyticsEvent.groupBy({
      by: ['page'],
      where: { event: 'page_view', createdAt: { gte: since } },
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

    const raw = await this.prisma.$queryRaw<
      Array<{ date: string; count: bigint }>
    >`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return raw.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async getOverview() {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayCount, weekCount, monthCount, totalCount] =
      await Promise.all([
        this.prisma.analyticsEvent.count({
          where: { createdAt: { gte: today } },
        }),
        this.prisma.analyticsEvent.count({
          where: { createdAt: { gte: thisWeek } },
        }),
        this.prisma.analyticsEvent.count({
          where: { createdAt: { gte: thisMonth } },
        }),
        this.prisma.analyticsEvent.count(),
      ]);

    return {
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      total: totalCount,
    };
  }
}
