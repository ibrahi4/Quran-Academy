'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

// Map pathname to page title
const pageTitles: Record<string, { en: string; ar: string }> = {
  '/admin': { en: 'Dashboard', ar: 'لوحة التحكم' },
  '/admin/users': { en: 'Users', ar: 'المستخدمون' },
  '/admin/bookings': { en: 'Bookings', ar: 'الحجوزات' },
  '/admin/sessions': { en: 'Sessions', ar: 'الجلسات' },
  '/admin/payments': { en: 'Payments', ar: 'المدفوعات' },
  '/admin/subscriptions': { en: 'Subscriptions', ar: 'الاشتراكات' },
  '/admin/blog': { en: 'Blog Posts', ar: 'المقالات' },
  '/admin/testimonials': { en: 'Testimonials', ar: 'الشهادات' },
  '/admin/contacts': { en: 'Contacts', ar: 'الرسائل' },
  '/admin/analytics': { en: 'Analytics', ar: 'التحليلات' },
};

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const { user } = useAuthStore();

  const cleanPath = pathname.replace(/^\/(en|ar)/, '') || '/';
  const pageTitle = pageTitles[cleanPath] || pageTitles['/admin'];

  const now = new Date();
  const greeting = now.getHours() < 12
    ? (locale === 'ar' ? 'صباح الخير' : 'Good Morning')
    : now.getHours() < 18
    ? (locale === 'ar' ? 'مساء الخير' : 'Good Afternoon')
    : (locale === 'ar' ? 'مساء الخير' : 'Good Evening');

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {pageTitle?.[locale as 'en' | 'ar'] || 'Dashboard'}
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              {greeting}, {user?.firstName} 👋
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search (desktop) */}
          <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
              className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User avatar (desktop) */}
          <div className="hidden sm:flex items-center gap-2 pl-2 rtl:pr-2 rtl:pl-0 border-l rtl:border-l-0 rtl:border-r border-gray-200 ml-1 rtl:mr-1 rtl:ml-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.firstName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}