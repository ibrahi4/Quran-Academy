import React from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import AuthProvider from "@/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import SetLocaleAttributes from "@/components/shared/SetLocaleAttributes";
import LayoutShellClient from "@/components/layout/LayoutShellClient";

export const metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/Quranic_Public_Assets/icon.png", type: "image/png" },
      { url: "/Quranic_Public_Assets/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/Quranic_Public_Assets/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/Quranic_Public_Assets/apple-icon.png",
    shortcut: "/Quranic_Public_Assets/favicon.ico",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/Quranic_Public_Assets/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/Quranic_Public_Assets/og-image.jpg"],
  },
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
        <LayoutShellClient>{children}</LayoutShellClient>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}