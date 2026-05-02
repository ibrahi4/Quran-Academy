"use client";

import { useLocale } from "@/hooks/useLocale";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
  X,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
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

  const menuItems = [
    {
      href: "/student/dashboard",
      icon: LayoutDashboard,
      label: t("Dashboard", "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629"),
      desc: t("Overview & stats", "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629"),
    },
    {
      href: "/student/sessions",
      icon: Calendar,
      label: t("My Sessions", "\u062C\u0644\u0633\u0627\u062A\u064A"),
      desc: t("Schedule & history", "\u0627\u0644\u062C\u062F\u0648\u0644 \u0648\u0627\u0644\u0633\u062C\u0644"),
    },
    {
      href: "/student/profile",
      icon: User,
      label: t("My Profile", "\u0645\u0644\u0641\u064A \u0627\u0644\u0634\u062E\u0635\u064A"),
      desc: t("Settings & info", "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A"),
    },
  ];

  const handleLogout = () => {
    clearAuth();
    window.location.href = `/${locale}/auth/login`;
  };

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b border-sand-200/70">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-sand-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="px-4 pt-5">
        <div className="relative overflow-hidden rounded-2xl bg-hero-gradient p-5 shadow-premium">
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-accent/15 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.15em]">
                {t("Welcome back", "\u0623\u0647\u0644\u0627\u064B \u0628\u0639\u0648\u062F\u062A\u0643")}
              </span>
            </div>
            <p className="text-white font-bold text-base leading-tight truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-white/60 text-xs mt-1">
              {t("Student Portal", "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0637\u0627\u0644\u0628")}
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
          {t("Navigation", "\u0627\u0644\u062A\u0646\u0642\u0644")}
        </p>
        {menuItems.map((item) => {
          const isActive = cleanPath.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary text-white shadow-premium"
                  : "text-gray-700 hover:bg-sand-100"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
                  isActive
                    ? "bg-white/10"
                    : "bg-sand-100 group-hover:bg-white"
                )}
              >
                <Icon
                  className={cn(
                    "w-4.5 h-4.5 transition-colors",
                    isActive ? "text-accent" : "text-primary"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold leading-tight", isActive ? "text-white" : "text-gray-900")}>
                  {item.label}
                </p>
                <p className={cn("text-[11px] mt-0.5 truncate", isActive ? "text-white/60" : "text-gray-500")}>
                  {item.desc}
                </p>
              </div>
              {isActive && (
                <Chevron className="w-4 h-4 text-accent shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-sand-200/70 space-y-2">
        <Link
          href="/book-trial"
          onClick={onClose}
          className="group flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/20 hover:from-accent/25 hover:to-accent/10 transition-all"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/20">
            <BookOpen className="w-4.5 h-4.5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary leading-tight">
              {t("Book a Session", "\u0627\u062D\u062C\u0632 \u062C\u0644\u0633\u0629")}
            </p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {t("Schedule trial class", "\u062D\u062F\u062F \u062C\u0644\u0633\u0629 \u062A\u062C\u0631\u064A\u0628\u064A\u0629")}
            </p>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50">
            <LogOut className="w-4.5 h-4.5" />
          </div>
          <span className="text-sm font-semibold">
            {t("Log out", "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C")}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-primary-900/40 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 w-[280px] z-50 lg:hidden transition-transform duration-300 shadow-2xl",
          isRTL ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full"
            : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block fixed top-0 bottom-0 w-[272px] z-30 border-sand-200/70",
          isRTL ? "right-0 border-l" : "left-0 border-r"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}