'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  LayoutDashboard, Users, CalendarCheck, Video, CreditCard,
  FileText, Star, MessageSquare, BarChart3, Package, Wallet,
  BookOpen, X, Home, ClipboardCheck, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { adminApi } from '@/lib/api/admin';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: { en: string; ar: string };
  href: string;
  icon: any;
  exact?: boolean;
  group?: 'main' | 'operations' | 'content' | 'system';
  badgeKey?: string;
}

const menuItems: MenuItem[] = [
  // Main
  { label: { en: 'Dashboard', ar: 'لوحة التحكم' }, href: '/admin', icon: LayoutDashboard, exact: true, group: 'main' },

  // Operations (urgent / daily)
  { label: { en: 'Pending Reports', ar: 'التقارير المعلقة' }, href: '/admin/reports', icon: ClipboardCheck, group: 'operations', badgeKey: 'reports' },
  { label: { en: 'Bookings', ar: 'الحجوزات' }, href: '/admin/bookings', icon: CalendarCheck, group: 'operations' },
  { label: { en: 'Sessions', ar: 'الجلسات' }, href: '/admin/sessions', icon: Video, group: 'operations' },

  // Content
  { label: { en: 'Users', ar: 'المستخدمون' }, href: '/admin/users', icon: Users, group: 'content' },
  { label: { en: 'Subscriptions', ar: 'الاشتراكات' }, href: '/admin/subscriptions', icon: Package, group: 'content' },
  { label: { en: 'Payments', ar: 'المدفوعات' }, href: '/admin/payments', icon: CreditCard, group: 'content' },
  { label: { en: 'Teacher Wallets', ar: 'محافظ المعلمين' }, href: '/admin/wallets', icon: Wallet, group: 'content' },

  // System
  { label: { en: 'Blog Posts', ar: 'المقالات' }, href: '/admin/blog', icon: FileText, group: 'system' },
  { label: { en: 'Testimonials', ar: 'الشهادات' }, href: '/admin/testimonials', icon: Star, group: 'system' },
  { label: { en: 'Contacts', ar: 'الرسائل' }, href: '/admin/contacts', icon: MessageSquare, group: 'system' },
  { label: { en: 'Analytics', ar: 'التحليلات' }, href: '/admin/analytics', icon: BarChart3, group: 'system' },
];

const GROUP_LABELS: Record<string, { en: string; ar: string }> = {
  operations: { en: 'OPERATIONS', ar: 'العمليات' },
  content:    { en: 'MANAGEMENT', ar: 'الإدارة' },
  system:     { en: 'SYSTEM', ar: 'النظام' },
};

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const { user } = useAuthStore();
  const isRTL = locale === 'ar';

  const [badges, setBadges] = useState<Record<string, number>>({ reports: 0 });

  // Fetch counters periodically
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await adminApi.getPendingReports();
        const data = Array.isArray(res) ? res : (res as any)?.data || [];
        setBadges((b) => ({ ...b, reports: data.length }));
      } catch (e) {
        console.error('[AdminSidebar] badges error:', e);
      }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [pathname]);

  const isActive = (href: string, exact = false) => {
    const cleanPath = pathname.replace(/^\/(en|ar)/, '') || '/';
    if (exact) return cleanPath === href;
    return cleanPath.startsWith(href);
  };

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'AD';

  const groupedItems = {
    main: menuItems.filter((i) => i.group === 'main'),
    operations: menuItems.filter((i) => i.group === 'operations'),
    content: menuItems.filter((i) => i.group === 'content'),
    system: menuItems.filter((i) => i.group === 'system'),
  };

  const renderMenuItem = (item: MenuItem) => {
    const active = isActive(item.href, item.exact);
    const Icon = item.icon;
    const badge = item.badgeKey ? badges[item.badgeKey] : 0;

    return (
      <Link
        key={item.href}
        href={`/${locale}${item.href}`}
        onClick={onClose}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          active
            ? 'bg-white/15 text-white shadow-lg'
            : 'text-white/60 hover:text-white hover:bg-white/10',
        )}
      >
        <Icon
          className={cn(
            'w-[18px] h-[18px] shrink-0',
            active ? 'text-[#C8A96E]' : 'text-white/60 group-hover:text-white',
          )}
        />
        <span className="flex-1">{item.label[locale as 'en' | 'ar']}</span>

        {badge > 0 && (
          <span className={cn(
            'min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center',
            active
              ? 'bg-[#C8A96E] text-[#0D4F4F]'
              : 'bg-red-500 text-white animate-pulse',
          )}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}

        {active && !badge && (
          <div className="w-1.5 h-1.5 rounded-full bg-[#C8A96E]" />
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#C8A96E]/30 to-[#C8A96E]/10 backdrop-blur-sm rounded-xl flex items-center justify-center ring-1 ring-[#C8A96E]/20">
            <BookOpen className="w-5 h-5 text-[#C8A96E]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base">IQA Admin</h1>
            <p className="text-white/50 text-[10px] uppercase tracking-widest mt-0.5">
              {locale === 'ar' ? 'لوحة الإدارة' : 'Management Panel'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Main */}
        <div className="space-y-0.5">
          {groupedItems.main.map(renderMenuItem)}
        </div>

        {/* Operations */}
        <div>
          <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#C8A96E]/80">
            {GROUP_LABELS.operations[locale as 'en' | 'ar']}
          </p>
          <div className="space-y-0.5">
            {groupedItems.operations.map(renderMenuItem)}
          </div>
        </div>

        {/* Content */}
        <div>
          <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            {GROUP_LABELS.content[locale as 'en' | 'ar']}
          </p>
          <div className="space-y-0.5">
            {groupedItems.content.map(renderMenuItem)}
          </div>
        </div>

        {/* System */}
        <div>
          <p className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            {GROUP_LABELS.system[locale as 'en' | 'ar']}
          </p>
          <div className="space-y-0.5">
            {groupedItems.system.map(renderMenuItem)}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/10 space-y-2 shrink-0">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>{locale === 'ar' ? 'العودة للموقع' : 'Back to Site'}</span>
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C8A96E]/30 to-[#C8A96E]/10 flex items-center justify-center ring-1 ring-[#C8A96E]/20">
            <span className="text-[#C8A96E] text-xs font-bold">{userInitials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-white/40 text-[10px] truncate flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#C8A96E]" />
              {locale === 'ar' ? 'مدير عام' : 'Administrator'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'fixed top-0 bottom-0 w-[272px] z-40 hidden lg:block',
          isRTL ? 'right-0' : 'left-0',
        )}
        style={{
          background: 'linear-gradient(180deg, #0a3d3d 0%, #0D4F4F 50%, #0a3d3d 100%)',
        }}
      >
        {sidebarContent}
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 w-[272px] z-50 lg:hidden transition-transform duration-300 ease-out',
          isRTL
            ? open ? 'right-0 translate-x-0' : 'right-0 translate-x-full'
            : open ? 'left-0 translate-x-0' : 'left-0 -translate-x-full',
        )}
        style={{
          background: 'linear-gradient(180deg, #0a3d3d 0%, #0D4F4F 50%, #0a3d3d 100%)',
        }}
      >
        <button
          onClick={onClose}
          className={cn(
            'absolute top-4 z-10 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors',
            isRTL ? 'left-4' : 'right-4',
          )}
        >
          <X className="w-4 h-4" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}