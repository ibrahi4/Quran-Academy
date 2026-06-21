"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  Gamepad2,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import { useTranslations, useLocale as useNextIntlLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";
import { useAuthStore } from "@/stores/useAuthStore";
import { logoutApi } from "@/lib/api/auth";
import Logo from "@/components/shared/Logo";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "howItWorks", href: "/how-it-works" },
  { key: "games", href: "/games" },
  { key: "contact", href: "/contact" },
];

function getDashboardHref(role: string) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/teacher/dashboard";
    case "STUDENT":
    case "TRIAL_STUDENT":
      return "/student/dashboard";
    default:
      return "/";
  }
}

function getProfileHref(role: string) {
  if (role === "ADMIN") return "/admin/settings";
  if (role === "TEACHER") return "/teacher/profile";
  return "/student/profile";
}

function getSessionsHref(role: string) {
  return role === "TEACHER" ? "/teacher/sessions" : "/student/sessions";
}

function canViewSessions(role: string) {
  return ["STUDENT", "TRIAL_STUDENT", "TEACHER"].includes(role);
}

function getRoleLabel(role: string, isRTL: boolean) {
  const labels: Record<string, { en: string; ar: string }> = {
    ADMIN: { en: "ADMIN", ar: "\u0645\u062F\u064A\u0631" },
    TEACHER: { en: "TEACHER", ar: "\u0645\u0639\u0644\u0651\u0645" },
    STUDENT: { en: "STUDENT", ar: "\u0637\u0627\u0644\u0628" },
    TRIAL_STUDENT: { en: "TRIAL", ar: "\u062A\u062C\u0631\u064A\u0628\u064A" },
  };

  const label = labels[role];
  if (!label) return "";
  return isRTL ? label.ar : label.en;
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case "ADMIN":
      return "text-primary bg-primary/10";
    case "TEACHER":
      return "text-purple-700 bg-purple-50";
    case "TRIAL_STUDENT":
      return "text-amber-700 bg-amber-50";
    default:
      return "text-emerald-700 bg-emerald-50";
  }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const intlLocale = useNextIntlLocale();
  const { locale, switchLocale, isRTL } = useLocale();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const cleanPath = pathname.replace(/^\/(en|ar)/, "") || "/";
  const isHomePage = cleanPath === "/";
  const isSolidNavbar = true; // Always solid - professional light style

  const role = user?.role ?? "";
  const dashboardHref = getDashboardHref(role);
  const profileHref = getProfileHref(role);
  const sessionsHref = getSessionsHref(role);
  const showSessions = canViewSessions(role);
  const roleLabel = getRoleLabel(role, isRTL);
  const roleBadgeClass = getRoleBadgeClass(role);

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase()
    : "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return cleanPath === "/";
    return cleanPath.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {}

    clearAuth();
    setUserMenuOpen(false);
    setMobileOpen(false);

    toast.success(
      isRTL
        ? "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C"
        : "Logged out successfully"
    );

    router.push(`/${intlLocale}`);
  };

  const navLinkClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
      active
        ? isSolidNavbar
          ? "bg-primary/6 text-primary"
          : "bg-white/14 text-white"
        : isSolidNavbar
        ? "text-gray-700 hover:bg-gray-100 hover:text-primary"
        : "text-white/90 hover:bg-white/10 hover:text-white"
    }`;

  const subtleButtonClass = isSolidNavbar
    ? "text-gray-700 hover:bg-gray-100 hover:text-primary"
    : "text-white/90 hover:bg-white/10 hover:text-white";

  const userTriggerClass = isSolidNavbar
    ? "hover:bg-gray-100"
    : "hover:bg-white/10";

  const navShellClass = scrolled
    ? "bg-white/95 backdrop-blur-xl border-b border-stone-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
    : "bg-white/80 backdrop-blur-md border-b border-stone-100";

  return (
    <>
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${navShellClass}`}>
        <Container>
          <div className="flex h-16 items-center justify-between md:h-20">
            <div className="shrink-0">
              <Logo light={!isSolidNavbar} />
            </div>

            <div className="hidden lg:flex items-center gap-1 rounded-2xl px-2 py-1">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={navLinkClass(isActive(link.href))}>
                  {link.key === "games" && <Gamepad2 className="h-4 w-4" />}
                  {t(link.key)}
                  {link.key === "games" && (
                    <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                      NEW
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => switchLocale(locale === "en" ? "ar" : "en")}
                className={`hidden md:inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${subtleButtonClass}`}
                aria-label="Switch language"
              >
                <Globe className="h-4 w-4" />
                <span>{locale === "en" ? "Ar" : "EN"}</span>
              </button>

              {isAuthenticated && user ? (
                <div className="relative hidden md:block" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    aria-expanded={userMenuOpen}
                    className={`inline-flex items-center gap-2 rounded-2xl px-2 py-1.5 transition-all ${userTriggerClass}`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                      <span className="text-xs font-bold text-white">{userInitials}</span>
                    </div>

                    <div className="max-w-[120px] text-start">
                      <p className={`truncate text-sm font-semibold ${isSolidNavbar ? "text-gray-900" : "text-white"}`}>
                        {user.firstName}
                      </p>
                    </div>

                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        userMenuOpen ? "rotate-180" : ""
                      } ${isSolidNavbar ? "text-gray-500" : "text-white/70"}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                      <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                        {roleLabel && (
                          <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${roleBadgeClass}`}>
                            {roleLabel}
                          </span>
                        )}
                      </div>

                      <div className="p-2">
                        <Link
                          href={dashboardHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-primary/5 hover:text-primary"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          {isRTL ? "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645" : "Dashboard"}
                        </Link>

                        {showSessions && (
                          <Link
                            href={sessionsHref}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-primary/5 hover:text-primary"
                          >
                            <Calendar className="h-4 w-4" />
                            {isRTL ? "\u062C\u0644\u0633\u0627\u062A\u064A" : "My Sessions"}
                          </Link>
                        )}

                        <Link
                          href={profileHref}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-primary/5 hover:text-primary"
                        >
                          <Settings className="h-4 w-4" />
                          {role === "ADMIN"
                            ? isRTL
                              ? "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A"
                              : "Settings"
                            : isRTL
                            ? "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A"
                            : "My Profile"}
                        </Link>

                        <div className="my-2 border-t border-gray-100" />

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          {isRTL ? "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C" : "Sign Out"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/login" className="hidden md:block">
                    <button
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${subtleButtonClass}`}
                    >
                      <User className="h-4 w-4" />
                      {t("signIn")}
                    </button>
                  </Link>

                  <Link href="/book-trial" className="hidden md:block">
                    <Button
                      className={`rounded-xl px-5 text-sm font-semibold transition-all duration-200 ${
                        isSolidNavbar
                          ? "bg-primary text-white shadow-lg shadow-primary/15 hover:bg-primary/90"
                          : "bg-white text-primary shadow-lg shadow-black/10 hover:bg-white/90"
                      }`}
                    >
                      {t("bookTrial")}
                    </Button>
                  </Link>
                </>
              )}

              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className={`inline-flex items-center justify-center rounded-xl p-2 transition-all lg:hidden ${subtleButtonClass}`}
                aria-expanded={mobileOpen}
                aria-label="Open menu"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </Container>
      </nav>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />

          <div
            className={`fixed top-0 bottom-0 z-50 w-[88%] max-w-sm overflow-y-auto bg-white shadow-2xl lg:hidden ${
              isRTL ? "left-0" : "right-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-xl p-2 text-gray-500 transition-all hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isAuthenticated && user && (
              <div className="mx-5 mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
                    <span className="text-sm font-bold text-white">{userInitials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                    {roleLabel && (
                      <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${roleBadgeClass}`}>
                        {roleLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="p-5">
              <div className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-all ${
                      isActive(link.href)
                        ? "bg-primary/5 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {link.key === "games" && <Gamepad2 className="h-5 w-5" />}
                    {t(link.key)}
                    {link.key === "games" && (
                      <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                        NEW
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {isAuthenticated && user && (
                <>
                  <div className="my-4 border-t border-gray-100" />

                  <div className="space-y-1">
                    <Link
                      href={dashboardHref}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition-all hover:bg-gray-50"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      {isRTL ? "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645" : "Dashboard"}
                    </Link>

                    {showSessions && (
                      <Link
                        href={sessionsHref}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition-all hover:bg-gray-50"
                      >
                        <Calendar className="h-5 w-5" />
                        {isRTL ? "\u062C\u0644\u0633\u0627\u062A\u064A" : "My Sessions"}
                      </Link>
                    )}

                    <Link
                      href={profileHref}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition-all hover:bg-gray-50"
                    >
                      <Settings className="h-5 w-5" />
                      {role === "ADMIN"
                        ? isRTL
                          ? "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A"
                          : "Settings"
                        : isRTL
                        ? "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A"
                        : "My Profile"}
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="mt-auto border-t border-gray-100 p-5 space-y-3">
              <button
                onClick={() => switchLocale(locale === "en" ? "ar" : "en")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-200"
              >
                <Globe className="h-5 w-5" />
                {locale === "en" ? "\u0639\u0631\u0628\u064A" : "English"}
              </button>

              {isAuthenticated && user ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-600 transition-all hover:bg-red-100"
                >
                  <LogOut className="h-5 w-5" />
                  {isRTL ? "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C" : "Sign Out"}
                </button>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block">
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-200">
                      <User className="h-5 w-5" />
                      {isRTL ? "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" : "Sign In"}
                    </button>
                  </Link>

                  <Link href="/book-trial" onClick={() => setMobileOpen(false)} className="block">
                    <Button className="w-full rounded-xl bg-primary py-6 text-base font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
                      {t("bookTrial")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}