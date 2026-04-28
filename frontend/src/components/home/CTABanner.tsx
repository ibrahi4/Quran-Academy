"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Phone, Star, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { siteConfig } from "@/config/site";
import { useTranslations, useLocale } from "next-intl";

export default function CTABanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const t = useTranslations("ctaBanner");
  const locale = useLocale();
  const isRTL = locale === "ar";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 md:py-20 relative overflow-hidden">
      <Container>
        <div
          className={`relative rounded-3xl overflow-hidden transition-all duration-1000 ${
            isInView ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-hero-gradient" />

          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.04]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cta-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <polygon points="40,8 46,26 64,20 50,34 64,48 46,42 40,60 34,42 16,48 30,34 16,20 34,26" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-pattern)" />
            </svg>
          </div>

          {/* Glowing Orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 px-6 md:px-12 lg:px-16 py-14 md:py-20 text-center">
            {/* Quran Verse */}
            <div className="inline-block px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-8">
              <p className="text-white/80 text-sm" style={{ fontFamily: "var(--font-arabic, serif)" }}>
                ﴾وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴿
              </p>
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              {t("headline")}
              <span className="text-accent"> {t("headlineHighlight")}</span>
              {locale === "en" ? "?" : "؟"}
            </h2>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              {t("subtitle")}
            </p>

            {/* Trust Points */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-10">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white/70 font-medium">
                    {t(`trustPoints.${i}`)}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/book-trial">
                <Button
                  size="lg"
                  className="rounded-xl px-10 py-6 text-base font-bold shadow-2xl bg-accent hover:bg-accent/90 text-gray-900"
                >
                  {t("bookTrial")}
                  <ArrowRight className={`w-4 h-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`} />
                </Button>
              </Link>

              <a
                href={siteConfig.contact.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/15 transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                {t("chatWhatsApp")}
              </a>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex items-center justify-center gap-3">
              <div className={`flex ${isRTL ? "-space-x-reverse -space-x-2" : "-space-x-2"}`}>
                {["S", "J", "F", "A", "E"].map((initial, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center"
                  >
                    <span className="text-xs font-bold text-white">{initial}</span>
                  </div>
                ))}
              </div>
              <div className={`${isRTL ? "text-right" : "text-left"}`}>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-white/60">
                  {t("socialProof")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}