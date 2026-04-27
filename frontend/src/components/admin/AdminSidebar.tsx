'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Video,
  CreditCard,
  FileText,
  Star,
  MessageSquare,
  BarChart3,
  Package,
  BookOpen,
  X,
  Home,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    label: { en: 'Dashboard', ar: 'لوحة التحكم' },
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: { en: 'Users', ar: 'المستخدمون' },
    href: '/admin/users',
    icon: Users,
  },
  {
    label: { en: 'Bookings', ar: 'الحجوزات' },
    href: '/admin/bookings',
    icon: CalendarCheck,
  },
  {
    label: { en: 'Sessions', ar: 'الجلسات' },
    href: '/admin/sessions',
    icon: Video,
  },
  {
    label: { en: 'Payments', ar: 'المدفوعات' },
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    label: { en: 'Subscriptions', ar: 'الاشتراكات' },
    href: '/admin/subscriptions',
    icon: Package,
  },
  {
    label: { en: 'Blog Posts', ar: 'المقالات' },
    href: '/admin/blog',
    icon: FileText,
  },
  {
    label: { en: 'Testimonials', ar: 'الشهادات' },
    href: '/admin/testimonials',
    icon: Star,
  },
  {
    label: { en: 'Contacts', ar: 'الرسائل' },
    href: '/admin/contacts',
    icon: MessageSquare,
  },
  {
    label: { en: 'Analytics', ar: 'التحليلات' },
    href: '/admin/analytics',
    icon: BarChart3,
  },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const { user } = useAuthStore();
  const isRTL = locale === 'ar';

  const isActive = (href: string, exact = false) => {
    const cleanPath = pathname.replace(/^\/(en|ar)/, '') || '/';
    if (exact) return cleanPath === href;
    return cleanPath.startsWith(href);
  };

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'AD';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#C8A96E]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base">IQA Admin</h1>
            <p className="text-white/50 text-xs">
              {locale === 'ar' ? 'لوحة الإدارة' : 'Management Panel'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-white/15 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/10',
              )}
            >
              <Icon
                className={cn(
                  'w-[18px] h-[18px] shrink-0',
                  active ? 'text-[#C8A96E]' : 'text-white/60',
                )}
              />
              <span>{item.label[locale as 'en' | 'ar']}</span>
              {active && (
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full bg-[#C8A96E]',
                    isRTL ? 'mr-auto' : 'ml-auto',
                  )}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10 space-y-2">
        {/* Back to site */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <Home className="w-[18px] h-[18px]" />
          <span>{locale === 'ar' ? 'العودة للموقع' : 'Back to Site'}</span>
        </Link>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-lg bg-[#C8A96E]/20 flex items-center justify-center">
            <span className="text-[#C8A96E] text-xs font-bold">{userInitials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 w-[272px] z-40 hidden lg:block',
          isRTL ? 'right-0' : 'left-0',
        )}
        style={{
          background: 'linear-gradient(to bottom, #0a3d3d, #0D4F4F, #0a3d3d)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 w-[272px] z-50 lg:hidden transition-transform duration-300 ease-out',
          isRTL
            ? open
              ? 'right-0 translate-x-0'
              : 'right-0 translate-x-full'
            : open
              ? 'left-0 translate-x-0'
              : 'left-0 -translate-x-full',
        )}
        style={{
          background: 'linear-gradient(to bottom, #0a3d3d, #0D4F4F, #0a3d3d)',
        }}
      >
        {/* Mobile close button */}
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