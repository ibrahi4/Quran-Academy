"use client";

import { usePathname, useRouter } from "next/navigation";

export function useLocale() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname.startsWith("/ar") ? "ar" : "en";
  const isRTL = currentLocale === "ar";

  const switchLocale = (locale: "en" | "ar") => {
    if (locale === currentLocale) return;

    let newPath: string;

    if (locale === "ar") {
      newPath = `/ar${pathname}`;
    } else {
      newPath = pathname.replace(/^\/ar/, "") || "/";
    }

    router.push(newPath);
  };

  return {
    locale: currentLocale,
    isRTL,
    switchLocale,
    isEnglish: currentLocale === "en",
    isArabic: currentLocale === "ar",
  };
}