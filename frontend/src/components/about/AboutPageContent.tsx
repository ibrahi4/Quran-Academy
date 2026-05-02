"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Award, BookOpen, GraduationCap, Heart, MessageCircle,
  Shield, Users, Globe, ArrowRight, ArrowLeft, Clock, Star, Sparkles, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";

const qualificationIcons = [GraduationCap, Award, BookOpen, MessageCircle, Clock, Globe];
const valueIcons = [Heart, Shield, Users, Star];

/* ----------------------------- Decorative BG ----------------------------- */
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function FloatingShapes() {
  const shapes = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => {
      const isCircle = seededRandom(i * 9 + 3) > 0.5;
      return {
        size: Math.round((6 + seededRandom(i * 9 + 1) * 14) * 100) / 100,
        top: Math.round(seededRandom(i * 9 + 2) * 10000) / 100 + "%",
        left: Math.round(seededRandom(i * 9 + 4) * 10000) / 100 + "%",
        duration: Math.round((5 + seededRandom(i * 9 + 5) * 7) * 10) / 10,
        delay: Math.round(seededRandom(i * 9 + 6) * 40) / 10,
        opacity: 0.15 + seededRandom(i * 9 + 7) * 0.25,
        isCircle,
        rotation: Math.round(seededRandom(i * 9 + 8) * 360),
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: s.size, height: s.size, top: s.top, left: s.left,
            backgroundColor: `rgba(255, 255, 255, ${s.opacity})`,
            borderRadius: s.isCircle ? "50%" : "4px",
            transform: `rotate(${s.rotation}deg)`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [s.opacity, s.opacity + 0.15, s.opacity],
            rotate: [s.rotation, s.rotation + 25, s.rotation],
          }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function FloatingIcons() {
  const icons = useMemo(() => {
    const iconList = [BookOpen, Star, Sparkles, Heart, Moon, Award, GraduationCap, Globe];
    return Array.from({ length: 10 }, (_, i) => ({
      Icon: iconList[i % iconList.length],
      top: Math.round(seededRandom(i * 5 + 11) * 9000) / 100 + "%",
      left: Math.round(seededRandom(i * 5 + 12) * 9500) / 100 + "%",
      duration: 6 + Math.round(seededRandom(i * 5 + 14) * 60) / 10,
      delay: Math.round(seededRandom(i * 5 + 15) * 50) / 10,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((item, i) => {
        const IconComp = item.Icon;
        return (
          <motion.div
            key={i}
            className="absolute text-white/20"
            style={{ top: item.top, left: item.left }}
            animate={{ y: [0, -30, 0], rotate: [0, 15, -15, 0], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: item.duration, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
          >
            <IconComp className="w-6 h-6" />
          </motion.div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */
export default function AboutPageContent() {
  const t = useTranslations("aboutPage");
  const { isRTL } = useLocale();

  return (
    <main>
      {/* ============================ HERO SECTION ============================ */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 bg-hero-gradient" />
        <FloatingShapes />
        <FloatingIcons />

        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent z-10" />

        <Container className="relative z-20">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-6 py-3 mb-8"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-white/90 text-sm font-semibold">{t("hero.badge")}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            >
              {t("hero.title")}{" "}
              <span className="text-accent relative inline-block">
                {t("hero.titleHighlight")}
                <motion.span
                  className="absolute -top-3 -right-4 text-accent"
                  animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto mb-10"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
            >
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-accent" />
                </div>
                <div className="text-start">
                  <p className="font-bold text-white text-lg leading-none">10+</p>
                  <p className="text-xs font-medium text-white/70 mt-1">{t("hero.stats.years")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div className="text-start">
                  <p className="font-bold text-white text-lg leading-none">500+</p>
                  <p className="text-xs font-medium text-white/70 mt-1">{t("hero.stats.students")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div className="text-start">
                  <p className="font-bold text-white text-lg leading-none">25+</p>
                  <p className="text-xs font-medium text-white/70 mt-1">{t("hero.stats.countries")}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H0Z"
              className="fill-sand-50"
            />
          </svg>
        </div>
      </section>

      {/* ============================ STORY SECTION (unchanged) ============================ */}
      <section className="section-padding bg-sand-50">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full rounded-3xl bg-primary/10" />
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-sand-100 aspect-[4/5] border border-sand-200/50 shadow-premium">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <span className="text-5xl font-bold text-primary" style={{ fontFamily: "var(--font-arabic, serif)" }}>{"\u0625"}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-1">{t("story.teacherName")}</h4>
                  <p className="text-sm text-gray-500">{t("story.teacherTitle")}</p>
                  <p className="text-xs text-gray-400 italic mt-4">{t("story.photoPlaceholder")}</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-premium-hover p-5 border border-sand-200/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-hero-gradient flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">10+</p>
                    <p className="text-sm text-gray-500">{t("story.yearsTeaching")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SectionHeader title={t("story.title")} centered={false} />
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p className="text-lg">{t("story.paragraphs.0")}</p>
                <p>{t("story.paragraphs.1")}</p>
                <p>{t("story.paragraphs.2")}</p>
                <p>{t("story.paragraphs.3")}</p>
              </div>
              <div className="mt-8 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-primary/80 text-right text-lg leading-loose mb-2" style={{ fontFamily: "var(--font-arabic, serif)" }}>
                  {"\uFD3E"} {"\u062E\u064E\u064A\u0652\u0631\u064F\u0643\u064F\u0645\u0652 \u0645\u064E\u0646\u0652 \u062A\u064E\u0639\u064E\u0644\u0651\u064E\u0645\u064E \u0627\u0644\u0652\u0642\u064F\u0631\u0652\u0622\u0646\u064E \u0648\u064E\u0639\u064E\u0644\u0651\u064E\u0645\u064E\u0647\u064F"} {"\uFD3F"}
                </p>
                <p className="text-sm text-gray-600 italic">
                  &quot;{t("story.hadith")}&quot;
                  <span className="text-gray-500"> {" \u2014 "} {t("story.hadithSource")}</span>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================ QUALIFICATIONS (unchanged) ============================ */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader title={t("qualifications.title")} subtitle={t("qualifications.subtitle")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {qualificationIcons.map((Icon, index) => (
              <div key={index} className="group bg-white rounded-2xl p-6 border border-sand-200/50 hover:border-primary/20 hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{t(`qualifications.items.${index}.title`)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(`qualifications.items.${index}.description`)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================ VALUES (unchanged) ============================ */}
      <section className="section-padding" style={{ background: "linear-gradient(180deg, #FAFAF7 0%, #F5F0EB 100%)" }}>
        <Container>
          <SectionHeader title={t("values.title")} subtitle={t("values.subtitle")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueIcons.map((Icon, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-premium mx-auto mb-5 flex items-center justify-center group-hover:shadow-premium-hover group-hover:-translate-y-1 transition-all duration-500">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t(`values.items.${index}.title`)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(`values.items.${index}.description`)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================ TIMELINE (unchanged) ============================ */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader title={t("timeline.title")} subtitle={t("timeline.subtitle")} />
          <div className="max-w-3xl mx-auto">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{t(`timeline.items.${index}.year`)}</span>
                  </div>
                  {index < 5 && <div className="w-px h-full bg-primary/10 my-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{t(`timeline.items.${index}.title`)}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{t(`timeline.items.${index}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================ CTA (unchanged) ============================ */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient" />
            <div className="relative z-10 px-8 md:px-16 py-14 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("cta.title")}</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">{t("cta.subtitle")}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/book-trial">
                  <Button size="lg" className="rounded-xl px-10 py-6 text-base font-bold bg-accent hover:bg-accent/90 text-gray-900">
                    {t("cta.bookTrial")}
                    {isRTL ? <ArrowLeft className="w-4 h-4 ms-2" /> : <ArrowRight className="w-4 h-4 ms-2" />}
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 text-base font-semibold border-white/20 text-white hover:bg-white/10">
                    {t("cta.viewServices")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}