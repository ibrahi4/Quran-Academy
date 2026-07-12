"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Award, BookOpen, GraduationCap, Heart, MessageCircle,
  Shield, Users, Globe, ArrowRight, ArrowLeft, Clock, Star,
  Sparkles, Target, TrendingUp, CheckCircle2, Compass,
  BookMarked, Languages, UserCheck, ShieldCheck, Zap,
  Quote, Play, Monitor, BarChart3, Lightbulb, School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";

/* ─────────────── Helpers ─────────────── */

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function FloatingShapes() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const shapes = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    size: Math.round((6 + seededRandom(i * 9 + 1) * 14) * 100) / 100,
    top: Math.round(seededRandom(i * 9 + 2) * 10000) / 100,
    left: Math.round(seededRandom(i * 9 + 4) * 10000) / 100,
    duration: Math.round((5 + seededRandom(i * 9 + 5) * 7) * 10) / 10,
    delay: Math.round(seededRandom(i * 9 + 6) * 40) / 10,
    opacity: Math.round((0.12 + seededRandom(i * 9 + 7) * 0.18) * 1000) / 1000,
    isCircle: seededRandom(i * 9 + 3) > 0.5,
    rotation: Math.round(seededRandom(i * 9 + 8) * 360),
  })), []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s, i) => (
        <motion.div key={i} className="absolute"
          style={{
            width: `${s.size}px`, height: `${s.size}px`,
            top: `${s.top}%`, left: `${s.left}%`,
            backgroundColor: `rgba(255,255,255,${s.opacity})`,
            borderRadius: s.isCircle ? "50%" : "4px",
            transform: `rotate(${s.rotation}deg)`,
          }}
          animate={{ y: [0, -20, 0], opacity: [s.opacity, s.opacity + 0.1, s.opacity] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const programIcons = [BookOpen, BookMarked, School, Languages];
const programColors = [
  { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", accent: "bg-blue-500" },
  { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", accent: "bg-emerald-500" },
  { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", accent: "bg-purple-500" },
  { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", accent: "bg-amber-500" },
];

const methodIcons = [Monitor, ShieldCheck, BarChart3, TrendingUp];
const facultyIcons = [Award, GraduationCap, Languages, Lightbulb, UserCheck, Heart];

/* ─────────────── Main Component ─────────────── */

export default function AboutPageContent() {
  const t = useTranslations("aboutPage");
  const { isRTL } = useLocale();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <main>
      {/* ═══════════════════════════ 1. HERO ═══════════════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 bg-hero-gradient" />
        <FloatingShapes />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent z-10" />

        <Container className="relative z-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div {...fadeUp}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-white/90 text-sm font-semibold">{t("hero.badge")}</span>
            </motion.div>

            <motion.h1 {...fadeUp} transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              {t("hero.title")}{" "}
              <span className="text-accent relative inline-block">
                {t("hero.titleHighlight")}
                <motion.span className="absolute -top-3 -right-4 text-accent"
                  animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}>
                  <Sparkles className="w-6 h-6" />
                </motion.span>
              </span>
            </motion.h1>

            <motion.p {...fadeUp} transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/75 leading-relaxed max-w-3xl mx-auto mb-10">
              {t("hero.subtitle")}
            </motion.p>

            <motion.div {...fadeUp} transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {[
                { Icon: Users, num: "500+", label: t("hero.stats.students") },
                { Icon: Globe, num: "25+", label: t("hero.stats.countries") },
                { Icon: GraduationCap, num: "50+", label: t("hero.stats.teachers") },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                    <s.Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-start">
                    <p className="font-bold text-white text-lg leading-none">{s.num}</p>
                    <p className="text-xs font-medium text-white/70 mt-1">{s.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </Container>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H0Z" className="fill-sand-50" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════ 2. MISSION / VISION / PROMISE ═══════════════════════════ */}
      <section className="section-padding bg-sand-50">
        <Container>
          <SectionHeader title={t("mission.sectionTitle")} />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { key: "mission", Icon: Target, color: "bg-primary" },
              { key: "vision", Icon: Compass, color: "bg-accent" },
              { key: "values", Icon: Shield, color: "bg-emerald-500" },
            ].map((item, i) => (
              <motion.div key={item.key} {...fadeUp} transition={{ delay: i * 0.15 }}
                className="relative bg-white rounded-3xl p-8 border border-sand-200/50 hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 group overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl" style={{ background: i === 0 ? '#0D4F4F' : i === 1 ? '#C8A96E' : '#10b981' }} />
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <item.Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t(`mission.${item.key}.title`)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(`mission.${item.key}.text`)}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════ 3. FOUNDING STORY ═══════════════════════════ */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader title={t("story.title")} subtitle={t("story.subtitle")} />
          <div className="max-w-4xl mx-auto space-y-8">
            {[
              { key: "problem", Icon: Zap, color: "bg-red-50", iconColor: "text-red-500", border: "border-red-100", accent: "bg-red-500" },
              { key: "solution", Icon: Lightbulb, color: "bg-emerald-50", iconColor: "text-emerald-500", border: "border-emerald-100", accent: "bg-emerald-500" },
              { key: "impact", Icon: TrendingUp, color: "bg-blue-50", iconColor: "text-blue-500", border: "border-blue-100", accent: "bg-blue-500" },
            ].map((item, i) => (
              <motion.div key={item.key} {...fadeUp} transition={{ delay: i * 0.15 }}
                className={`relative rounded-2xl p-8 ${item.color} border ${item.border} overflow-hidden`}>
                <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-1.5 h-full ${item.accent} rounded-full`} />
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0`}>
                    <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{t(`story.${item.key}.title`)}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{t(`story.${item.key}.text`)}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Hadith */}
            <motion.div {...fadeUp} transition={{ delay: 0.5 }}
              className="relative rounded-2xl p-8 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 text-center overflow-hidden">
              <div className="absolute top-4 left-8 opacity-10">
                <Quote className="w-16 h-16 text-primary" />
              </div>
              <p className="text-primary/90 text-2xl leading-loose mb-4 font-semibold relative z-10" style={{ fontFamily: "var(--font-arabic, serif)" }}>
                {"\uFD3E"} {"\u062E\u064E\u064A\u0652\u0631\u064F\u0643\u064F\u0645\u0652 \u0645\u064E\u0646\u0652 \u062A\u064E\u0639\u064E\u0644\u0651\u064E\u0645\u064E \u0627\u0644\u0642\u064F\u0631\u0622\u0646\u064E \u0648\u064E\u0639\u064E\u0644\u0651\u064E\u0645\u064E\u0647\u064F"} {"\uFD3F"}
              </p>
              <p className="text-sm text-gray-600 italic relative z-10">
                &quot;The best among you is the one who learns the Quran and teaches it.&quot;
                <span className="text-gray-500 font-semibold block mt-1">Sahih al-Bukhari</span>
              </p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════ 4. PROGRAMS ═══════════════════════════ */}
      <section className="section-padding" style={{ background: "linear-gradient(180deg, #FAFAF7 0%, #F5F0EB 100%)" }}>
        <Container>
          <SectionHeader title={t("programs.title")} subtitle={t("programs.subtitle")} />
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {programIcons.map((Icon, i) => {
              const c = programColors[i];
              return (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.12 }}
                  className={`bg-white rounded-2xl p-6 border ${c.border} hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 group`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${c.text}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{t(`programs.items.${i}.title`)}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{t(`programs.items.${i}.desc`)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((fi) => (
                      <div key={fi} className="flex items-center gap-2 text-xs text-gray-700">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${c.text} shrink-0`} />
                        <span>{t(`programs.items.${i}.features.${fi}`)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════ 5. METHODOLOGY ═══════════════════════════ */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader title={t("methodology.title")} subtitle={t("methodology.subtitle")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {methodIcons.map((Icon, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-hero-gradient shadow-lg mx-auto mb-5 flex items-center justify-center group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t(`methodology.pillars.${i}.title`)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(`methodology.pillars.${i}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════ 6. FACULTY ═══════════════════════════ */}
      <section className="section-padding" style={{ background: "linear-gradient(180deg, #FAFAF7 0%, #F5F0EB 100%)" }}>
        <Container>
          <SectionHeader title={t("faculty.title")} subtitle={t("faculty.subtitle")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facultyIcons.map((Icon, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-sand-200/50 hover:border-primary/20 hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 group">
                <div className="w-12 h-12 rounded-xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-all">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{t(`faculty.credentials.${i}.title`)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(`faculty.credentials.${i}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════ 7. GLOBAL IMPACT ═══════════════════════════ */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader title={t("impact.title")} subtitle={t("impact.subtitle")} />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}
                className="text-center p-5 rounded-2xl bg-sand-50 border border-sand-200/50 hover:shadow-md transition-all">
                <p className="text-2xl md:text-3xl font-bold text-primary mb-1">{t(`impact.stats.${i}.number`)}</p>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t(`impact.stats.${i}.label`)}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonial */}
          <motion.div {...fadeUp} transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto relative">
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 md:p-10 border border-primary/10 relative overflow-hidden">
              <div className="absolute top-6 left-8 opacity-10">
                <Quote className="w-20 h-20 text-primary" />
              </div>
              <div className="relative z-10">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6 italic">
                  &ldquo;{t("impact.testimonial.text")}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-hero-gradient flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {(t("impact.testimonial.name") as string)[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t("impact.testimonial.name")}</p>
                    <p className="text-sm text-gray-500">{t("impact.testimonial.role")} &middot; {t("impact.testimonial.country")}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ═══════════════════════════ 8. CTA ═══════════════════════════ */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient" />
            <FloatingShapes />
            <div className="relative z-10 px-8 md:px-16 py-14 md:py-20 text-center">
              <motion.div {...fadeUp}>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">
                    {isRTL ? "\u0627\u0628\u062f\u0623 \u0627\u0644\u064a\u0648\u0645" : "Start Today"}
                  </span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{t("cta.title")}</h2>
                <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">{t("cta.subtitle")}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/book-trial">
                    <Button size="lg" className="rounded-xl px-10 py-6 text-base font-bold bg-accent hover:bg-accent/90 text-gray-900 shadow-xl shadow-accent/20">
                      {t("cta.primaryBtn")}
                      <Arrow className="w-4 h-4 ms-2" />
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 text-base font-semibold border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
                      {t("cta.secondaryBtn")}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}