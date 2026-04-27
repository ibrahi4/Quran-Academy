import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

type Props = { params: Promise<{ locale: string }> };

export default async function ResetPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
