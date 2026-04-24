"use client";

import { useLocale as useNextIntlLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function useLocale() {
  const locale = useNextIntlLocale() as "en" | "ar";
  const pathname = usePathname();
  const router = useRouter();

  const isRTL = locale === "ar";

  const switchLocale = (newLocale: "en" | "ar") => {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  };

  return {
    locale,
    isRTL,
    switchLocale,
    isEnglish: locale === "en",
    isArabic: locale === "ar",
  };
}
