"use client";

import React, { useEffect, useState } from "react";
import { Play, ArrowRight, ArrowLeft, Sparkles, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const { isRTL } = useLocale();

  // Rotating services that the academy offers
  const rotatingWords = isRTL
    ? ["القرآن الكريم", "اللغة العربية", "قواعد التجويد", "الدراسات الإسلامية"]
    : ["The Holy Quran", "Arabic Language", "Tajweed Rules", "Islamic Studies"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [rotatingWords.length]);

  const headingFont = isRTL ? "var(--font-arabic)" : "var(--font-display)";
  const bodyFont = isRTL ? "var(--font-arabic)" : "var(--font-body)";

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = isRTL
    ? {
        badge: "نستقبل طلاب جدد لعام 2026",
        titleLine1: "تعلّم",
        titleHighlight: rotatingWords[currentWord],
        titleLine3: "مع معلّم موثوق",
        subtitle:
          "انضم إلى أكاديمية تجويدو لتعليم القرآن واللغة العربية مع معلّمين معتمدين من الأزهر الشريف.",
        primaryCta: "ابدأ التعلّم",
        secondaryCta: "حصة تجريبية مجانية",
        students: "طالب",
        years: "سنوات",
        countries: "دولة",
        feature1: "معلّمون معتمدون",
        feature2: "جدول مرن",
        feature3: "حصص مجانية",
      }
    : {
        badge: "Now accepting students for 2026",
        titleLine1: "Learn",
        titleHighlight: rotatingWords[currentWord],
        titleLine3: "with a Trusted Teacher",
        subtitle:
          "Join Tajwedo Academy for premium Quran and Arabic education with certified Al-Azhar teachers.",
        primaryCta: "Start Learning",
        secondaryCta: "Book Free Trial",
        students: "Students",
        years: "Years",
        countries: "Countries",
        feature1: "Certified Teachers",
        feature2: "Flexible Schedule",
        feature3: "Free Trial",
      };

  return (
    <section
      className="relative min-h-screen w-full flex items-center overflow-hidden bg-[#F8F3EA]"
      aria-label="Hero"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ═══════════ BACKGROUND IMAGE ═══════════ */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className={`w-full h-full ${isRTL ? "scale-x-[-1]" : ""}`}
          style={{ transformOrigin: "center" }}
        >
          <img
            src="/Tajwedo-Public-Assets/herosection.png"
            alt=""
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
            loading="eager"
          />
        </div>

        {/* ─── MOBILE OVERLAY: stronger at bottom for readability ─── */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(248,243,234,0.4) 0%, rgba(248,243,234,0.75) 40%, rgba(248,243,234,0.92) 70%, rgba(248,243,234,0.98) 100%)",
          }}
        />

        {/* ─── DESKTOP OVERLAY ─── */}
        {isRTL ? (
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(to left, #F8F3EA 0%, #F8F3EA 45%, rgba(248,243,234,0.88) 58%, rgba(248,243,234,0) 80%)",
            }}
          />
        ) : (
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(to right, #F8F3EA 0%, #F8F3EA 45%, rgba(248,243,234,0.88) 58%, rgba(248,243,234,0) 80%)",
            }}
          />
        )}
      </div>

      {/* Decorative glow */}
      <div
        className={`absolute top-1/3 w-[300px] h-[300px] bg-gradient-to-br from-[#0D4F4F]/8 to-transparent rounded-full blur-3xl pointer-events-none ${
          isRTL ? "right-20" : "left-20"
        }`}
      />

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="relative z-10 w-full pt-32 pb-12 md:pt-36 lg:pt-32 lg:pb-20 flex justify-start">
        <div
          className={`w-full max-w-[620px] px-6 sm:px-10 lg:px-16 xl:px-24 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ fontFamily: bodyFont }}
        >
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2.5 ps-2 pe-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E8DFD0] shadow-[0_2px_12px_rgba(13,79,79,0.1)] mb-7">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#C9A567] to-[#A67B5B] shadow-[0_2px_6px_rgba(166,123,91,0.35)]">
              <Sparkles className="w-3 h-3 text-white" />
            </span>
            <span className="text-[#0D4F4F] text-xs font-semibold tracking-wide">
              {content.badge}
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0D4F4F] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0D4F4F]" />
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`font-bold leading-[1.08] tracking-[-0.02em] mb-6 ${
              isRTL
                ? "text-[2.5rem] sm:text-5xl md:text-[56px] lg:text-[64px]"
                : "text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[68px]"
            }`}
            style={{ fontFamily: headingFont }}
          >
            <span className="block text-[#0D4F4F]">{content.titleLine1}</span>
            <span className="block">
              <span
                key={currentWord}
                className="relative inline-block animate-word-fade"
                style={{
                  background:
                    "linear-gradient(135deg, #C9A567 0%, #A67B5B 50%, #8B6F47 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {content.titleHighlight}
              </span>
            </span>
            <span className="block text-[#0D4F4F]">{content.titleLine3}</span>
          </h1>

          {/* Subtle gold divider */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-px bg-gradient-to-r from-[#B8945F] to-transparent" />
            <div className="w-1 h-1 rotate-45 bg-[#B8945F]" />
          </div>

          {/* Subtitle */}
          <p
            className={`text-[#0D4F4F]/75 leading-[1.7] mb-7 ${
              isRTL ? "text-base md:text-[17px]" : "text-base md:text-[17px]"
            }`}
            style={{ fontFamily: bodyFont }}
          >
            {content.subtitle}
          </p>

          {/* Features */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8">
            {[content.feature1, content.feature2, content.feature3].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D4F4F] shrink-0" />
                <span className="text-sm text-[#0D4F4F] font-medium">{f}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="group relative overflow-hidden rounded-xl px-7 h-[54px] text-[15px] font-semibold bg-gradient-to-br from-[#0D4F4F] to-[#093838] hover:from-[#125e5e] hover:to-[#0D4F4F] text-white shadow-[0_8px_24px_rgba(13,79,79,0.3)] hover:shadow-[0_12px_32px_rgba(13,79,79,0.4)] transition-all duration-300 hover:-translate-y-0.5 border-0 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {content.primaryCta}
                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4 ms-2 group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 ms-2 group-hover:translate-x-1 transition-transform" />
                  )}
                </span>
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Button>
            </Link>

            <Link href="/book-trial">
              <button className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 h-[54px] rounded-xl text-[#0D4F4F] font-semibold text-[15px] bg-white/85 hover:bg-white border border-[#E8DFD0] hover:border-[#0D4F4F]/40 transition-all duration-300 backdrop-blur-sm shadow-[0_2px_8px_rgba(13,79,79,0.06)] hover:shadow-[0_6px_16px_rgba(13,79,79,0.12)]">
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#F4EBD9] border border-[#E8DFD0] group-hover:scale-110 group-hover:bg-[#EBDEC4] transition-all">
                  <Play className="w-3 h-3 fill-[#0D4F4F] text-[#0D4F4F] ms-0.5" />
                </span>
                <span>{content.secondaryCta}</span>
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 sm:gap-7 pt-7 border-t border-[#E8DFD0]">
            <div>
              <p
                className="text-2xl sm:text-3xl font-bold text-[#0D4F4F] leading-none mb-1.5"
                style={{ fontFamily: headingFont }}
              >
                500+
              </p>
              <p className="text-[10px] sm:text-[11px] text-[#0D4F4F]/60 font-semibold uppercase tracking-[0.12em]">
                {content.students}
              </p>
            </div>
            <div className="w-px h-9 bg-[#E8DFD0]" />
            <div>
              <p
                className="text-2xl sm:text-3xl font-bold text-[#0D4F4F] leading-none mb-1.5"
                style={{ fontFamily: headingFont }}
              >
                10+
              </p>
              <p className="text-[10px] sm:text-[11px] text-[#0D4F4F]/60 font-semibold uppercase tracking-[0.12em]">
                {content.years}
              </p>
            </div>
            <div className="w-px h-9 bg-[#E8DFD0]" />
            <div>
              <p
                className="text-2xl sm:text-3xl font-bold text-[#0D4F4F] leading-none mb-1.5"
                style={{ fontFamily: headingFont }}
              >
                15+
              </p>
              <p className="text-[10px] sm:text-[11px] text-[#0D4F4F]/60 font-semibold uppercase tracking-[0.12em]">
                {content.countries}
              </p>
            </div>
            <div className="hidden sm:block w-px h-9 bg-[#E8DFD0]" />
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C9A567] text-[#C9A567]" />
                ))}
              </div>
              <span className="text-xs text-[#0D4F4F] font-bold">4.9</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slow-zoom {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
        }
        @keyframes word-fade {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slow-zoom { animation: slow-zoom 30s ease-in-out infinite; }
        .animate-word-fade { animation: word-fade 0.6s ease-out; }
      `}</style>
    </section>
  );
}