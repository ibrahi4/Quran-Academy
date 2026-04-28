
"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Phone, Globe, Gamepad2, User, LogOut, LayoutDashboard, Settings, ChevronDown } from "lucide-react";
import { useTranslations, useLocale as useNextIntlLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";
import { useAuthStore } from "@/stores/useAuthStore";
import { logoutApi } from "@/lib/api/auth";
import Logo from "@/components/shared/Logo";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import toast from "react-hot-toast";

const navLinks = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "howItWorks", href: "/how-it-works" },
  { key: "games", href: "/games" },
  { key: "contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const { locale, switchLocale, isRTL } = useLocale();
  const intlLocale = useNextIntlLocale();

  const { user, isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileOpen]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (href: string) => {
    const cleanPath = pathname.replace(/^\/(en|ar)/, "") || "/";
    if (href === "/") return cleanPath === "/";
    return cleanPath.startsWith(href);
  };

  const handleSwitchLocale = () => {
    switchLocale(locale === "en" ? "ar" : "en");
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {}
    clearAuth();
    setIsUserMenuOpen(false);
    setIsMobileOpen(false);
    toast.success(locale === "ar" ? "تم تسجيل الخروج" : "Logged out successfully");
    router.push(`/${intlLocale}`);
  };

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase()
    : "";

  const isAdmin = user?.role === "ADMIN";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between h-16 md:h-20">
            <Logo light={!isScrolled} />

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-1.5 ${
                    isActive(link.href)
                      ? isScrolled
                        ? "text-primary bg-primary/5"
                        : "text-white bg-white/10"
                      : isScrolled
                        ? "text-gray-700 hover:text-primary hover:bg-primary/5"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.key === "games" && <Gamepad2 className="w-4 h-4" />}
                  {t(link.key)}
                  {link.key === "games" && (
                    <span className="bg-accent text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold leading-none">
                      NEW
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                onClick={handleSwitchLocale}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isScrolled
                    ? "text-gray-600 hover:text-primary hover:bg-primary/5"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>{locale === "en" ? "Ar" : "EN"}</span>
              </button>

              {/* Auth Section */}
              {isAuthenticated && user ? (
                /* User Menu (Logged In) */
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all ${
                      isScrolled
                        ? "hover:bg-gray-100"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{userInitials}</span>
                    </div>
                    <span className={`text-sm font-medium max-w-[100px] truncate ${
                      isScrolled ? "text-gray-700" : "text-white"
                    }`}>
                      {user.firstName}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    } ${isScrolled ? "text-gray-500" : "text-white/70"}`} />
                  </button>

                  {/* Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            ADMIN
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            {locale === "ar" ? "لوحة التحكم" : "Dashboard"}
                          </Link>
                        )}

                        <Link
                          href="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          {locale === "ar" ? "الملف الشخصي" : "My Profile"}
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          {locale === "ar" ? "تسجيل الخروج" : "Sign Out"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Login Button (Not Logged In) */
                <Link href="/auth/login" className="hidden md:block">
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isScrolled
                        ? "text-gray-700 hover:text-primary hover:bg-primary/5"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    {t("signIn")}
                  </button>
                </Link>
              )}

              {/* Book Trial CTA */}
              <Link href="/book-trial" className="hidden md:block">
                <Button
                  className={`rounded-xl font-semibold text-sm px-5 transition-all duration-300 ${
                    isScrolled
                      ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                      : "bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10"
                  }`}
                >
                  {t("bookTrial")}
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className={`lg:hidden p-2 rounded-xl transition-all ${
                  isScrolled
                    ? "text-gray-700 hover:bg-primary/5"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </Container>
      </nav>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div
            className={`fixed top-0 ${isRTL ? "left-0" : "right-0"} bottom-0 w-[85%] max-w-sm bg-white z-50 lg:hidden overflow-y-auto`}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <Logo />
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Info */}
            {isAuthenticated && user && (
              <div className="mx-5 mt-5 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{userInitials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <div className="p-5 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive(link.href)
                      ? "text-primary bg-primary/5"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.key === "games" && <Gamepad2 className="w-5 h-5" />}
                  {t(link.key)}
                  {link.key === "games" && (
                    <span className="bg-accent text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold">
                      NEW
                    </span>
                  )}
                </Link>
              ))}

              {/* Mobile Admin/Profile Links */}
              {isAuthenticated && user && (
                <>
                  <div className="h-px bg-gray-100 my-2" />
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      {locale === "ar" ? "لوحة التحكم" : "Dashboard"}
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="w-5 h-5" />
                    {locale === "ar" ? "الملف الشخصي" : "My Profile"}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Bottom Actions */}
            <div className="p-5 space-y-3 border-t border-gray-100 mt-4">
              <button
                onClick={handleSwitchLocale}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
              >
                <Globe className="w-5 h-5" />
                {locale === "en" ? "\u0639\u0631\u0628\u064A" : "English"}
              </button>

              {isAuthenticated && user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  {locale === "ar" ? "تسجيل الخروج" : "Sign Out"}
                </button>
              ) : (
                <Link href="/auth/login" onClick={() => setIsMobileOpen(false)} className="block">
                  <button className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all">
                    <User className="w-5 h-5" />
                    {locale === "ar" ? "تسجيل الدخول" : "Sign In"}
                  </button>
                </Link>
              )}

              <a
                href={siteConfig.contact.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all"
              >
                <Phone className="w-5 h-5" />
                {locale === "en" ? "Chat on WhatsApp" : "\u062A\u0648\u0627\u0635\u0644 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628"}
              </a>

              <Link href="/book-trial" onClick={() => setIsMobileOpen(false)} className="block">
                <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-base shadow-lg shadow-primary/20">
                  {t("bookTrial")}
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
