"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TeacherHeader() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const getTitle = () => {
    if (pathname.includes("/dashboard")) return t("Dashboard", "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645");
    if (pathname.includes("/sessions")) return t("Sessions", "\u0627\u0644\u062C\u0644\u0633\u0627\u062A");
    if (pathname.includes("/assignments")) return t("Assignments", "\u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A");
    if (pathname.includes("/earnings")) return t("Earnings", "\u0627\u0644\u0623\u0631\u0628\u0627\u062D");
    return t("Teacher", "\u0627\u0644\u0645\u0639\u0644\u0645");
  };

  const switchLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const newPath = pathname.startsWith(`/${locale}`)
      ? pathname.replace(`/${locale}`, `/${newLocale}`)
      : `/${newLocale}${pathname}`;
    router.push(newPath);
  };

  return (
    <header
      className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-lg font-bold text-gray-900">{getTitle()}</h1>
          <p className="text-xs text-gray-500">
            {new Date().toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={switchLocale}
            className="h-9 w-9 rounded-xl text-gray-500 hover:text-primary"
          >
            <Globe className="w-4 h-4" />
          </Button>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {user?.firstName?.[0] || ""}{user?.lastName?.[0] || ""}
          </div>
        </div>
      </div>
    </header>
  );
}