import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      totalStudents,
      activeSubscriptions,
      totalBookings,
      pendingBookings,
      totalSessions,
      upcomingSessions,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      newUsersThisMonth,
      totalContacts,
      unreadContacts,
      totalBlogPosts,
      publishedBlogPosts,
      pendingTestimonials,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.student.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.session.count(),
      this.prisma.session.count({
        where: { date: { gte: now }, status: 'SCHEDULED' },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: thisMonth } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: lastMonth, lt: thisMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
      this.prisma.contact.count(),
      this.prisma.contact.count({ where: { status: 'NEW' } }),
      this.prisma.blogPost.count(),
      this.prisma.blogPost.count({ where: { published: true } }),
      this.prisma.testimonial.count({ where: { approved: false } }),
    ]);

    const currentMonthRev = Number(monthlyRevenue._sum.amount) || 0;
    const lastMonthRev = Number(lastMonthRevenue._sum.amount) || 0;
    const revenueGrowth =
      lastMonthRev > 0
        ? (
            ((currentMonthRev - lastMonthRev) / lastMonthRev) *
            100
          ).toFixed(1)
        : '0';

    return {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        students: totalStudents,
      },
      subscriptions: { active: activeSubscriptions },
      bookings: { total: totalBookings, pending: pendingBookings },
      sessions: { total: totalSessions, upcoming: upcomingSessions },
      revenue: {
        total: Number(totalRevenue._sum.amount) || 0,
        thisMonth: currentMonthRev,
        lastMonth: lastMonthRev,
        growthPercent: revenueGrowth,
      },
      contacts: { total: totalContacts, unread: unreadContacts },
      blog: { total: totalBlogPosts, published: publishedBlogPosts },
      testimonials: { pending: pendingTestimonials },
    };
  }

  async getRecentBookings(limit = 10) {
    return await this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRecentContacts(limit = 10) {
    return await this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRecentPayments(limit = 10) {
    return await this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
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
    });
  }

  async getUpcomingSessions(limit = 10) {
    return await this.prisma.session.findMany({
      where: { date: { gte: new Date() }, status: 'SCHEDULED' },
      orderBy: { date: 'asc' },
      take: limit,
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  async getMonthlyRevenueChart(months = 12) {
    const results: Array<{ month: string; revenue: number }> = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        1,
      );

      const agg = await this.prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: start, lt: end } },
        _sum: { amount: true },
      });

      results.push({
        month: start.toISOString().substring(0, 7),
        revenue: Number(agg._sum.amount) || 0,
      });
    }

    return results;
  }

  async getUserGrowthChart(months = 12) {
    const results: Array<{ month: string; count: number }> = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        1,
      );

      const count = await this.prisma.user.count({
        where: { createdAt: { gte: start, lt: end } },
      });

      results.push({
        month: start.toISOString().substring(0, 7),
        count,
      });
    }

    return results;
  }
}
