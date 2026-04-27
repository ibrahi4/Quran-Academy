'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  Users,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Video,
  MessageSquare,
  FileText,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Clock,
  UserPlus,
  CreditCard,
} from 'lucide-react';
import { adminApi, type DashboardStats } from '@/lib/api/admin';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DashboardContent() {
  const locale = useLocale();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [s, b, sess, c, p] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRecentBookings(5),
        adminApi.getUpcomingSessions(5),
        adminApi.getRecentContacts(5),
        adminApi.getRecentPayments(5),
      ]);
      setStats(s);
      setRecentBookings(b);
      setUpcomingSessions(sess);
      setRecentContacts(c);
      setRecentPayments(p);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {locale === 'ar' ? 'جاري التحميل...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const revenueGrowth = parseFloat(stats.revenue.growthPercent);
  const isPositiveGrowth = revenueGrowth > 0;

  return (
    <div className="space-y-6">
      {/* ==================== Stats Cards ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={locale === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
          value={stats.users.total}
          subtitle={`+${stats.users.newThisMonth} ${locale === 'ar' ? 'هذا الشهر' : 'this month'}`}
          icon={Users}
          color="primary"
        />
        <StatCard
          title={locale === 'ar' ? 'الحجوزات المعلقة' : 'Pending Bookings'}
          value={stats.bookings.pending}
          subtitle={`${stats.bookings.total} ${locale === 'ar' ? 'إجمالي' : 'total'}`}
          icon={CalendarCheck}
          color="amber"
        />
        <StatCard
          title={locale === 'ar' ? 'إيرادات الشهر' : "This Month's Revenue"}
          value={`$${stats.revenue.thisMonth.toLocaleString()}`}
          subtitle={
            <span className={cn('flex items-center gap-1 text-xs', isPositiveGrowth ? 'text-green-600' : 'text-red-500')}>
              {isPositiveGrowth ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(revenueGrowth)}%
            </span>
          }
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title={locale === 'ar' ? 'الجلسات القادمة' : 'Upcoming Sessions'}
          value={stats.sessions.upcoming}
          subtitle={`${stats.sessions.total} ${locale === 'ar' ? 'إجمالي' : 'total'}`}
          icon={Video}
          color="blue"
        />
      </div>

      {/* ==================== Secondary Stats ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat
          icon={UserPlus}
          label={locale === 'ar' ? 'طلاب نشطون' : 'Active Students'}
          value={stats.users.students}
        />
        <MiniStat
          icon={Star}
          label={locale === 'ar' ? 'شهادات معلقة' : 'Pending Reviews'}
          value={stats.testimonials.pending}
          accent
        />
        <MiniStat
          icon={MessageSquare}
          label={locale === 'ar' ? 'رسائل جديدة' : 'New Messages'}
          value={stats.contacts.unread}
          accent
        />
        <MiniStat
          icon={FileText}
          label={locale === 'ar' ? 'مقالات منشورة' : 'Published Posts'}
          value={stats.blog.published}
        />
      </div>

      {/* ==================== Tables Grid ==================== */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <DashboardCard title={locale === 'ar' ? 'آخر الحجوزات' : 'Recent Bookings'}>
          {recentBookings.length === 0 ? (
            <EmptyState text={locale === 'ar' ? 'لا توجد حجوزات' : 'No bookings yet'} />
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{b.name}</p>
                      <p className="text-xs text-gray-500 truncate">{b.email}</p>
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        {/* Upcoming Sessions */}
        <DashboardCard title={locale === 'ar' ? 'الجلسات القادمة' : 'Upcoming Sessions'}>
          {upcomingSessions.length === 0 ? (
            <EmptyState text={locale === 'ar' ? 'لا توجد جلسات' : 'No upcoming sessions'} />
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(s.date).toLocaleDateString(locale, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{s.duration}m</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        {/* Recent Contacts */}
        <DashboardCard title={locale === 'ar' ? 'آخر الرسائل' : 'Recent Messages'}>
          {recentContacts.length === 0 ? (
            <EmptyState text={locale === 'ar' ? 'لا توجد رسائل' : 'No messages yet'} />
          ) : (
            <div className="space-y-3">
              {recentContacts.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-500 truncate">{c.subject || c.message?.substring(0, 40)}</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        {/* Recent Payments */}
        <DashboardCard title={locale === 'ar' ? 'آخر المدفوعات' : 'Recent Payments'}>
          {recentPayments.length === 0 ? (
            <EmptyState text={locale === 'ar' ? 'لا توجد مدفوعات' : 'No payments yet'} />
          ) : (
            <div className="space-y-3">
              {recentPayments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {p.user?.firstName} {p.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{p.description || p.method}</p>
                    </div>
                  </div>
                  <div className="text-right rtl:text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      ${Number(p.amount).toFixed(2)}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

// ==================== Sub Components ====================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: React.ReactNode;
  icon: any;
  color: 'primary' | 'amber' | 'green' | 'blue';
}) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
      <div className="mt-2">{typeof subtitle === 'string' ? <span className="text-xs text-gray-400">{subtitle}</span> : subtitle}</div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', accent ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-500')}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function DashboardCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-5 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    CONFIRMED: 'bg-blue-50 text-blue-700',
    COMPLETED: 'bg-green-50 text-green-700',
    CANCELLED: 'bg-red-50 text-red-700',
    PAID: 'bg-green-50 text-green-700',
    FAILED: 'bg-red-50 text-red-700',
    NEW: 'bg-blue-50 text-blue-700',
    READ: 'bg-gray-100 text-gray-600',
    REPLIED: 'bg-green-50 text-green-700',
    SCHEDULED: 'bg-blue-50 text-blue-700',
    NO_SHOW: 'bg-red-50 text-red-700',
    ACTIVE: 'bg-green-50 text-green-700',
  };

  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold', styles[status] || 'bg-gray-100 text-gray-600')}>
      {status}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}