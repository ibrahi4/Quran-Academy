"use client";

import { useLocale } from "@/hooks/useLocale";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { logoutApi } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Calendar, User, LogOut, X,
  Sparkles, ChevronRight, ChevronLeft, Crown, ClipboardList,
} from "lucide-react";
import Logo from "@/components/shared/Logo";

interface StudentSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function StudentSidebar({ open, onClose }: StudentSidebarProps) {
  const { isRTL, locale } = useLocale();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  const t = (en: string, ar: string) => (isRTL ? ar : en);
  const cleanPath = pathname.replace(/^\/(en|ar)/, "") || "/";
  const isTrial = user?.role === "TRIAL_STUDENT";
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const menuItems = [
    { href: "/student/dashboard",   icon: LayoutDashboard, label: t("Dashboard",   "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629"), desc: t("Overview & stats", "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629") },
    { href: "/student/sessions",    icon: Calendar,        label: t("My Sessions", "\u062C\u0644\u0633\u0627\u062A\u064A"),               desc: t("Schedule & history", "\u0627\u0644\u062C\u062F\u0648\u0644 \u0648\u0627\u0644\u0633\u062C\u0644") },
    { href: "/student/assignments", icon: ClipboardList,   label: t("Assignments", "\u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A"),     desc: t("Homework & feedback", "\u0627\u0644\u0648\u0627\u062C\u0628 \u0648\u0627\u0644\u062A\u0642\u064A\u064A\u0645") },
    { href: "/student/profile",     icon: User,            label: t("My Profile",  "\u0645\u0644\u0641\u064A \u0627\u0644\u0634\u062E\u0635\u064A"), desc: t("Settings & info", "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A") },
  ];

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    clearAuth();
    toast.success(isRTL ? "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C" : "Logged out");
    window.location.href = `/${locale}/auth/login`;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-5 border-b border-sand-200/70 shrink-0">
        <div className="flex items-center justify-between">
          <Logo />
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-sand-100 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Welcome / Trial */}
      <div className="px-4 pt-4 shrink-0">
        {isTrial ? (
          <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-3 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Trial Account</span>
            </div>
            <p className="text-[11px] text-white/80 mb-2">
              {t("Upgrade to unlock all features", "\u0627\u0634\u062A\u0631\u0643 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u064A\u0632\u0627\u062A")}
            </p>
            <Link href="/pricing" onClick={onClose}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-white text-amber-600 text-[11px] font-bold hover:bg-amber-50 transition-colors">
              <Crown className="w-3 h-3" />
              {t("Subscribe Now", "\u0627\u0634\u062A\u0631\u0643 \u0627\u0644\u0622\u0646")}
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-hero-gradient p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-[9px] font-bold text-accent uppercase tracking-widest">
                {t("Welcome back", "\u0623\u0647\u0644\u0627\u064B")}
              </span>
            </div>
            <p className="text-white font-bold text-sm leading-tight truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-white/60 text-[10px] mt-0.5">
              {t("Student Portal", "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0637\u0627\u0644\u0628")}
            </p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {t("Navigation", "\u0627\u0644\u062A\u0646\u0642\u0644")}
        </p>
        {menuItems.map((item) => {
          const isActive = cleanPath.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive ? "bg-primary text-white shadow-premium" : "text-gray-700 hover:bg-sand-100"
              )}>
              <div className={cn(
                "flex items-center justify-center w-9 h-9 rounded-lg transition-colors shrink-0",
                isActive ? "bg-white/10" : "bg-sand-100 group-hover:bg-white"
              )}>
                <Icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-primary")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold leading-tight", isActive ? "text-white" : "text-gray-900")}>
                  {item.label}
                </p>
                <p className={cn("text-[10px] mt-0.5 truncate", isActive ? "text-white/60" : "text-gray-500")}>
                  {item.desc}
                </p>
              </div>
              {isActive && <Chevron className="w-3.5 h-3.5 text-accent shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer: logout only */}
      <div className="p-3 border-t border-sand-200/70 shrink-0">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">{t("Log out", "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-primary-900/40 backdrop-blur-sm z-40 lg:hidden" />}
      <aside className={cn(
        "fixed top-0 bottom-0 w-[280px] z-50 lg:hidden transition-transform duration-300 shadow-2xl",
        isRTL ? "right-0" : "left-0",
        open ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>
      <aside className={cn(
        "hidden lg:flex flex-col fixed top-0 bottom-0 w-[272px] z-30 border-sand-200/70",
        isRTL ? "right-0 border-l" : "left-0 border-r"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}