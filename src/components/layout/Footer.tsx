"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Mail, Phone, MapPin, ArrowUpRight, Heart } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";
import Container from "@/components/shared/Container";
import Logo from "@/components/shared/Logo";

const quickLinkKeys = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "services", href: "/services" },
  { key: "testimonials", href: "/testimonials" },
  { key: "blog", href: "/blog" },
  { key: "faq", href: "/faq" },
  { key: "contact", href: "/contact" },
];

const serviceLinkKeys = [
  { key: "quranRecitation", href: "/services/quran-recitation" },
  { key: "tajweed", href: "/services/tajweed" },
  { key: "arabicLanguage", href: "/services/arabic-language" },
  { key: "islamicStudies", href: "/services/islamic-studies" },
  { key: "kidsProgram", href: "/services/kids-program" },
  { key: "newMuslims", href: "/services/new-muslims" },
];

export default function Footer() {
  const t = useTranslations("footer");
  const { isRTL } = useLocale();

  return (
    <footer className="relative bg-gray-900 text-gray-300 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

      <Container>
        {/* Top CTA */}
        <div className="py-12 md:py-16 border-b border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {t("cta.title")}
              </h3>
              <p className="text-gray-400 text-lg">
                {t("cta.subtitle")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/book-trial"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent/90 text-gray-900 font-bold rounded-xl transition-all duration-300"
              >
                {t("cta.bookTrial")}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <a
                href={siteConfig.contact.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/10 transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                {t("cta.whatsapp")}
              </a>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <Logo light className="mb-6" />
            <p className="text-gray-400 leading-relaxed mb-6">
              {t("about")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="h-[3px] w-6 bg-accent rounded-full" />
              {t("quickLinks")}
            </h4>
            <ul className="space-y-3">
              {quickLinkKeys.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-accent transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-accent transition-colors" />
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="h-[3px] w-6 bg-accent rounded-full" />
              {t("services")}
            </h4>
            <ul className="space-y-3">
              {serviceLinkKeys.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-accent transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-accent transition-colors" />
                    {t(`serviceLinks.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="h-[3px] w-6 bg-accent rounded-full" />
              {t("contact")}
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-start gap-3 text-gray-400 hover:text-accent transition-colors"
                >
                  <Mail className="w-5 h-5 mt-0.5 text-gray-500" />
                  <span className="text-sm">{siteConfig.contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-accent transition-colors"
                >
                  <Phone className="w-5 h-5 mt-0.5 text-gray-500" />
                  <span className="text-sm">{siteConfig.contact.whatsapp}</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 mt-0.5 text-gray-500" />
                  <span className="text-sm">{t("location")}</span>
                </div>
              </li>
            </ul>

            {/* Quran Verse */}
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-accent/80 text-right text-sm leading-loose mb-2" style={{ fontFamily: "var(--font-arabic, serif)" }}>
                ? ����� ������ ������� ������� ?
              </p>
              <p className="text-gray-500 text-xs italic">
                &quot;{t("verse")}&quot;
                <br />
                <span className="text-gray-600">� {t("verseRef")}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            � {new Date().getFullYear()} {t("copyright")}
          </p>
          <p className="text-gray-600 text-xs flex items-center gap-1">
            {t("builtWith")} <Heart className="w-3 h-3 text-red-500" /> {t("forUmmah")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
