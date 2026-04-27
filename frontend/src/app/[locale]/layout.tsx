import React from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import AuthProvider from "@/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import ScrollToTop from "@/components/layout/ScrollToTop";
import SetLocaleAttributes from "@/components/shared/SetLocaleAttributes";

export const metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = locale === "ar";

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <SetLocaleAttributes locale={locale} isRTL={isRTL} />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0D4F4F',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
          }}
        />
        <LayoutShell>{children}</LayoutShell>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

function LayoutShell({ children }: { children: React.ReactNode }) {
  return <LayoutShellClient>{children}</LayoutShellClient>;
}

import LayoutShellClient from "@/components/layout/LayoutShellClient";
