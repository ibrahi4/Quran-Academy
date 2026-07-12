import React from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import LayoutShellClient from "@/components/layout/LayoutShellClient";

const locales = ["en", "ar"] as const;
type Locale = (typeof locales)[number];

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const title = isArabic
    ? "\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u062A\u062C\u0648\u064A\u062F\u0648"
    : "Tajwedo Academy";

  const description = isArabic
    ? "\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u062A\u0639\u0644\u064A\u0645 \u0627\u0644\u0642\u0631\u0622\u0646 \u0623\u0648\u0646\u0644\u0627\u064A\u0646 \u0644\u0644\u062A\u0644\u0627\u0648\u0629 \u0648\u0627\u0644\u062A\u062C\u0648\u064A\u062F \u0648\u0627\u0644\u062D\u0641\u0638 \u0648\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629."
    : "Online Quran academy for recitation, Tajweed, memorization, and Islamic studies.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ["/Tajwedo-Public-Assets/herosection.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/Tajwedo-Public-Assets/herosection.png"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LayoutShellClient>{children}</LayoutShellClient>
    </NextIntlClientProvider>
  );
}