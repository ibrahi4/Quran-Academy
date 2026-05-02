"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Mic,
  Languages,
  GraduationCap,
  Baby,
  Heart,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Star,
  Award,
  Moon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";

const serviceIcons = [BookOpen, Mic, Languages, GraduationCap, Baby, Heart];
const serviceSlugs = [
  "quran-recitation",
  "tajweed",
  "arabic-language",
  "islamic-studies",
  "kids-program",
  "new-muslims",
];
const serviceColorKeys = ["primary", "secondary", "accent", "primary", "secondary", "accent"];

const colorStyles: Record<string, { bg: string; border: string }> = {
  primary: { bg: "bg-primary/5", border: "border-primary/15" },
  secondary: { bg: "bg-secondary/5", border: "border-secondary/15" },
  accent: { bg: "bg-accent/10", border: "border-accent/20" },
};

/* ----------------------------- Decorative BG ----------------------------- */

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface FloatingShape {
  size: number;
  top: string;
  left: string;
  duration: number;
  delay: number;
  opacity: number;
  isCircle: boolean;
  rotation: number;
}

function FloatingShapes(): React.ReactElement {
  const shapes: FloatingShape[] = useMemo(() => {
    return Array.from({ length: 25 }, (_, i): FloatingShape => {
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
            width: s.size,
            height: s.size,
            top: s.top,
            left: s.left,
            backgroundColor: "rgba(255, 255, 255, " + s.opacity + ")",
            borderRadius: s.isCircle ? "50%" : "4px",
            transform: `rotate(${s.rotation}deg)`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [s.opacity, s.opacity + 0.15, s.opacity],
            rotate: [s.rotation, s.rotation + 25, s.rotation],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

interface FloatingIcon {
  Icon: React.ComponentType<{ className?: string }>;
  top: string;
  left: string;
  duration: number;
  delay: number;
}

function FloatingIcons(): React.ReactElement {
  const icons: FloatingIcon[] = useMemo(() => {
    const iconList = [BookOpen, Star, Sparkles, Heart, Moon, Award, GraduationCap, Languages];
    return Array.from({ length: 10 }, (_, i): FloatingIcon => ({
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
            style={{
              top: item.top,
              left: item.left,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 15, -15, 0],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              delay: item.delay,
              ease: "easeInOut",
            }}
          >
            <IconComp className="w-6 h-6" />
          </motion.div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function ServicesPageContent() {
  const t = useTranslations("servicesPage");
  const { isRTL } = useLocale();

  return (
    <main>
      {/* ============================ HERO SECTION ============================ */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Original gradient kept */}
        <div className="absolute inset-0 bg-hero-gradient" />

        {/* Decorative animated layers */}
        <FloatingShapes />
        <FloatingIcons />

        {/* Soft glow accents */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent z-10" />

        <Container className="relative z-20">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-6 py-3 mb-8"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-white/90 text-sm font-semibold">
                {t("hero.badge")}
              </span>
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

            {/* Stats / quick info pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
            >
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div className="text-start">
                  <p className="font-bold text-white text-lg leading-none">6</p>
                  <p className="text-xs font-medium text-white/70 mt-1">
                    {t("hero.stats.programs")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div className="text-start">
                  <p className="font-bold text-white text-lg leading-none">500+</p>
                  <p className="text-xs font-medium text-white/70 mt-1">
                    {t("hero.stats.students")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-accent" />
                </div>
                <div className="text-start">
                  <p className="font-bold text-white text-lg leading-none">10+</p>
                  <p className="text-xs font-medium text-white/70 mt-1">
                    {t("hero.stats.years")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H0Z"
              className="fill-sand-50"
            />
          </svg>
        </div>
      </section>

      {/* ============================ SERVICES SECTION ============================ */}
      <section className="section-padding bg-sand-50">
        <Container>
          <div className="space-y-8">
            {serviceSlugs.map((slug, index) => {
              const IconComp = serviceIcons[index];
              const colors = colorStyles[serviceColorKeys[index]];
              return (
                <motion.div
                  key={slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={`bg-white rounded-3xl p-6 md:p-10 border ${colors.border} hover:shadow-premium-hover transition-all duration-500`}
                >
                  <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                      <div className="flex items-start gap-4 mb-5">
                        <div
                          className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center flex-shrink-0`}
                        >
                          <IconComp className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {t(`services.${index}.title`)}
                          </h2>
                          <p className="text-gray-600 leading-relaxed">
                            {t(`services.${index}.description`)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 p-4 rounded-xl bg-sand-50 border border-sand-200/50">
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold text-gray-700">
                            {t("bestFor")}{" "}
                          </span>
                          {t(`services.${index}.bestFor`)}
                        </p>
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        {t("whatYouLearn")}
                      </h3>
                      <ul className="space-y-3">
                        {[0, 1, 2, 3, 4, 5].map((fi) => (
                          <li key={fi} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              {t(`services.${index}.features.${fi}`)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        <Link href="/book-trial">
                          <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20">
                            {t("bookTrial")}
                            {isRTL ? (
                              <ArrowLeft className="w-4 h-4 ms-2" />
                            ) : (
                              <ArrowRight className="w-4 h-4 ms-2" />
                            )}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============================ CTA SECTION ============================ */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-lg text-gray-600 mb-8">{t("cta.subtitle")}</p>
            <Link href="/book-trial">
              <Button
                size="lg"
                className="rounded-xl px-10 py-6 text-base font-bold bg-accent hover:bg-accent/90 text-gray-900"
              >
                {t("cta.button")}
                {isRTL ? (
                  <ArrowLeft className="w-4 h-4 ms-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 ms-2" />
                )}
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}