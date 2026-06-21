"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { logoutApi } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Calendar, DollarSign, BookOpen,
  LogOut, ChevronLeft, ChevronRight, Menu, X,
  ClipboardList,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/teacher/dashboard",   icon: LayoutDashboard, en: "Dashboard",   ar: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645" },
  { href: "/teacher/sessions",    icon: Calendar,        en: "Sessions",    ar: "\u0627\u0644\u062C\u0644\u0633\u0627\u062A" },
  { href: "/teacher/assignments", icon: BookOpen,        en: "Assignments", ar: "\u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A" },
  { href: "/teacher/earnings",    icon: DollarSign,      en: "Earnings",    ar: "\u0627\u0644\u0623\u0631\u0628\u0627\u062D" },
];

export function TeacherSidebar() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    return pathname === fullPath || pathname.startsWith(fullPath + "/");
  };

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    clearAuth();
    toast.success(isRTL ? "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C" : "Logged out");
    window.location.href = `/${locale}/auth/login`;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/teacher/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-primary text-sm truncate">
                {t("Quran Academy", "\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0627\u0644\u0642\u0631\u0622\u0646")}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                {t("Teacher Portal", "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0645\u0639\u0644\u0645")}
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", active && "text-white")} />
              {!collapsed && <span>{isRTL ? item.ar : item.en}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-gray-100 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>{t("Logout", "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C")}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={cn(
          "lg:hidden fixed top-4 z-50 p-2 rounded-xl bg-white shadow-md border border-gray-100",
          isRTL ? "right-4" : "left-4"
        )}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 z-40 h-full w-64 bg-white border-r border-gray-100 shadow-xl transition-transform duration-300",
          isRTL ? "right-0" : "left-0",
          mobileOpen
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
          "hidden lg:flex relative flex-col bg-white border-r border-gray-100 transition-all duration-300 shrink-0",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          style={isRTL ? { left: "-12px" } : { right: "-12px" }}
        >
          {collapsed ? (
            isRTL ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          ) : (
            isRTL ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>
    </>
  );
}