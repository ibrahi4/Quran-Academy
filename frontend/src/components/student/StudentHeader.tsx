"use client";

import { useLocale } from "@/hooks/useLocale";
import { useAuthStore } from "@/stores/useAuthStore";
import { Menu, Globe, Crown, ClipboardList } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

interface StudentHeaderProps {
  onMenuClick: () => void;
}

export default function StudentHeader({ onMenuClick }: StudentHeaderProps) {
  const { isRTL, locale, switchLocale } = useLocale();
  const { user } = useAuthStore();
  const pathname = usePathname();

  const t = (en: string, ar: string) => (isRTL ? ar : en);
  const cleanPath = pathname.replace(/^\/(en|ar)/, "") || "/";
  const isTrial = user?.role === "TRIAL_STUDENT";

  const titleMap: Record<string, { en: string; ar: string; sub: { en: string; ar: string } }> = {
    "/student/dashboard": {
      en: "Dashboard",
      ar: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629",
      sub: { en: "Your learning journey overview", ar: "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629 \u0639\u0644\u0649 \u0631\u062D\u0644\u062A\u0643" },
    },
    "/student/sessions": {
      en: "My Sessions",
      ar: "\u062C\u0644\u0633\u0627\u062A\u064A",
      sub: { en: "Manage your classes & schedule", ar: "\u0625\u062F\u0627\u0631\u0629 \u062D\u0635\u0635\u0643 \u0648\u062C\u062F\u0648\u0644\u0643" },
    },
    "/student/assignments": {
      en: "Assignments",
      ar: "\u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A",
      sub: { en: "Submit homework and review feedback", ar: "\u0623\u0631\u0633\u0644 \u0627\u0644\u0648\u0627\u062C\u0628 \u0648\u0631\u0627\u062C\u0639 \u0627\u0644\u062A\u0642\u064A\u064A\u0645" },
    },
    "/student/profile": {
      en: "My Profile",
      ar: "\u0645\u0644\u0641\u064A \u0627\u0644\u0634\u062E\u0635\u064A",
      sub: { en: "Account information & settings", ar: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628 \u0648\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" },
    },
  };

  const matched = Object.keys(titleMap).find(k => cleanPath.startsWith(k));
  const item = matched ? titleMap[matched] : null;
  const title    = item ? (isRTL ? item.ar     : item.en)     : t("Welcome", "\u0623\u0647\u0644\u0627\u064B");
  const subtitle = item ? (isRTL ? item.sub.ar : item.sub.en) : "";

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "S";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t("Good morning",   "\u0635\u0628\u0627\u062D \u0627\u0644\u062E\u064A\u0631");
    if (h < 18) return t("Good afternoon", "\u0637\u0627\u0628\u062A \u0623\u0648\u0642\u0627\u062A\u0643");
    return           t("Good evening",    "\u0645\u0633\u0627\u0621 \u0627\u0644\u062E\u064A\u0631");
  })();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-sand-200/70">
      {isTrial && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-white flex items-center gap-2">
            <Crown className="w-3.5 h-3.5" />
            {t(
              "You are on a free trial. Subscribe to unlock all features.",
              "\u0623\u0646\u062A \u0639\u0644\u0649 \u062D\u0633\u0627\u0628 \u062A\u062C\u0631\u064A\u0628\u064A. \u0627\u0634\u062A\u0631\u0643 \u0644\u0641\u062A\u062D \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u064A\u0632\u0627\u062A."
            )}
          </p>
          <Link href="/pricing"
            className="shrink-0 px-3 py-1 rounded-lg bg-white text-amber-600 text-xs font-bold hover:bg-amber-50 transition-colors">
            {t("Subscribe Now", "\u0627\u0634\u062A\u0631\u0643 \u0627\u0644\u0622\u0646")}
          </Link>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl hover:bg-sand-100 transition-colors"
            aria-label="Open menu">
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent">{greeting},</p>
              <span className="text-[11px] font-semibold text-gray-500 truncate">{user?.firstName}</span>
              {isTrial && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold uppercase">
                  <Crown className="w-2.5 h-2.5" /> Trial
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight truncate">{title}</h1>
            {subtitle && (
              <p className="hidden sm:block text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => switchLocale(locale === "en" ? "ar" : "en")}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-sand-200 bg-white hover:bg-sand-50 transition-all">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-gray-700 uppercase">
              {locale === "en" ? "AR" : "EN"}
            </span>
          </button>

          <div className={cn("flex items-center gap-3 ps-2 sm:ps-3 border-sand-200", isRTL ? "border-r" : "border-l")}>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-gray-900 leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isTrial ? t("Trial Student", "\u0637\u0627\u0644\u0628 \u062A\u062C\u0631\u064A\u0628\u064A") : t("Student", "\u0637\u0627\u0644\u0628")}
              </p>
            </div>
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shadow-premium ring-2 ring-white",
              isTrial ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-hero-gradient"
            )}>
              <span className="text-sm font-bold text-white">{initials}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}