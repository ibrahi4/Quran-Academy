"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Phone,
  Globe,
  BookOpen,
  Mic,
  Languages,
  GraduationCap,
  Baby,
  Heart,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { navigationLinks } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import Logo from "../shared/Logo";
import Container from "../shared/Container";
import { Button } from "../ui/button";

const serviceIcons: Record<string, React.ReactNode> = {
  "Quran Recitation": <BookOpen className="w-4 h-4" />,
  Tajweed: <Mic className="w-4 h-4" />,
  "Arabic Language": <Languages className="w-4 h-4" />,
  "Islamic Studies": <GraduationCap className="w-4 h-4" />,
  "For Kids": <Baby className="w-4 h-4" />,
  "For New Muslims": <Heart className="w-4 h-4" />,
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const pathname = usePathname();

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsServicesOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-sand-200/50"
            : "bg-transparent"
        )}
      >
        <Container>
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* ===== LOGO ===== */}
            <Logo light={!isScrolled} />

            {/* ===== DESKTOP NAVIGATION ===== */}
            <div className="hidden lg:flex items-center gap-1">
              {navigationLinks.map((link) =>
                link.children ? (
                  // Services Dropdown
                  <div key={link.href} className="relative group">
                    <button
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                        isActive(link.href)
                          ? isScrolled
                            ? "text-primary bg-primary/5"
                            : "text-white bg-white/10"
                          : isScrolled
                            ? "text-gray-700 hover:text-primary hover:bg-primary/5"
                            : "text-white/90 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {link.label}
                      <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="bg-white rounded-2xl shadow-premium-hover border border-sand-200/50 p-3 min-w-[260px]">
                        {/* Dropdown Header */}
                        <div className="px-3 py-2 mb-2">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                            Our Programs
                          </p>
                        </div>

                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                              isActive(child.href)
                                ? "bg-primary/10 text-primary"
                                : "text-gray-700 hover:bg-sand-100 hover:text-primary"
                            )}
                          >
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 text-primary">
                              {serviceIcons[child.label] || (
                                <BookOpen className="w-4 h-4" />
                              )}
                            </span>
                            <span className="font-medium">{child.label}</span>
                          </Link>
                        ))}

                        {/* View All Services */}
                        <div className="mt-2 pt-2 border-t border-sand-200/50">
                          <Link
                            href="/services"
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-primary/5 transition-all"
                          >
                            View All Services →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Regular Link
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                      isActive(link.href)
                        ? isScrolled
                          ? "text-primary bg-primary/5"
                          : "text-white bg-white/10"
                        : isScrolled
                          ? "text-gray-700 hover:text-primary hover:bg-primary/5"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* ===== RIGHT SIDE ===== */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <button
                className={cn(
                  "hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                  isScrolled
                    ? "text-gray-600 hover:text-primary hover:bg-primary/5"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <Globe className="w-4 h-4" />
                <span>EN</span>
              </button>

              {/* Book Trial CTA */}
              <Link href="/book-trial" className="hidden md:block">
                <Button
                  className={cn(
                    "rounded-xl font-semibold text-sm px-5 transition-all duration-300",
                    isScrolled
                      ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                      : "bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10"
                  )}
                >
                  Book Free Trial
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className={cn(
                  "lg:hidden p-2 rounded-xl transition-all",
                  isScrolled
                    ? "text-gray-700 hover:bg-primary/5"
                    : "text-white hover:bg-white/10"
                )}
              >
                {isMobileOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </Container>
      </nav>

      {/* ===== MOBILE MENU ===== */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 lg:hidden overflow-y-auto"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-5 border-b border-sand-200/50">
                <Logo />
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-xl text-gray-500 hover:bg-sand-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Links */}
              <div className="p-5 space-y-1">
                {navigationLinks.map((link) =>
                  link.children ? (
                    <div key={link.href}>
                      <button
                        onClick={() => setIsServicesOpen(!isServicesOpen)}
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-3 rounded-xl text-base font-medium transition-all",
                          isActive(link.href)
                            ? "text-primary bg-primary/5"
                            : "text-gray-700 hover:bg-sand-100"
                        )}
                      >
                        <span>{link.label}</span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-300",
                            isServicesOpen && "rotate-180"
                          )}
                        />
                      </button>

                      <AnimatePresence>
                        {isServicesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 py-2 space-y-1">
                              {link.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all",
                                    isActive(child.href)
                                      ? "text-primary bg-primary/10"
                                      : "text-gray-600 hover:bg-sand-100 hover:text-primary"
                                  )}
                                >
                                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/5 text-primary">
                                    {serviceIcons[child.label] || (
                                      <BookOpen className="w-3.5 h-3.5" />
                                    )}
                                  </span>
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all",
                        isActive(link.href)
                          ? "text-primary bg-primary/5"
                          : "text-gray-700 hover:bg-sand-100"
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>

              {/* Mobile Bottom Actions */}
              <div className="p-5 space-y-3 border-t border-sand-200/50 mt-4">
                {/* Language */}
                <button className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-sand-100 transition-all">
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">العربية</span>
                </button>

                {/* WhatsApp */}
                <a
                  href={siteConfig.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Chat on WhatsApp
                </a>

                {/* Book Trial */}
                <Link href="/book-trial" className="block">
                  <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-base shadow-lg shadow-primary/20">
                    Book Free Trial
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}