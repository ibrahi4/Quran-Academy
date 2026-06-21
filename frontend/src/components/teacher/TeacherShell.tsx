'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
import { TeacherSidebar } from './TeacherSidebar';
import { TeacherHeader } from './TeacherHeader';
import { Loader2 } from 'lucide-react';

export function TeacherShell({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    if (!isLoading && user && user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      router.push(`/${locale}`);
    }
  }, [isLoading, isAuthenticated, user, router, locale]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className={cn('flex min-h-screen bg-gray-50/80', isRTL && 'flex-row-reverse')}>
      {/* Sidebar */}
      <TeacherSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <TeacherHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}