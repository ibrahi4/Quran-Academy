"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Globe, Gamepad2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";
import Logo from "@/components/shared/Logo";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const navLinks = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "howItWorks", href: "/how-it-works" },
  { key: "games", href: "/games" },
  { key: "testimonials", href: "/testimonials" },
  { key: "contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const { locale, switchLocale, isRTL } = useLocale();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const isActive = (href: string) => {
    const cleanPath = pathname.replace(/^\/(en|ar)/, "") || "/";
    if (href === "/") return cleanPath === "/";
    return cleanPath.startsWith(href);
  };

  const handleSwitchLocale = () => {
    switchLocale(locale === "en" ? "ar" : "en");
  };

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
            <div className="flex items-center gap-3">
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

            <div className="p-5 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
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
            </div>

            <div className="p-5 space-y-3 border-t border-gray-100 mt-4">
              <button
                onClick={handleSwitchLocale}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
              >
                <Globe className="w-5 h-5" />
                {locale === "en" ? "\u0639\u0631\u0628\u064A" : "English"}
              </button>

              <a
                href={siteConfig.contact.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all"
              >
                <Phone className="w-5 h-5" />
                {locale === "en" ? "Chat on WhatsApp" : "\u062A\u0648\u0627\u0635\u0644 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628"}
              </a>

              <Link href="/book-trial" className="block">
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
