"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Search, BookOpen, Clock, Monitor, GraduationCap, ShieldCheck,
  Sparkles, Star, Heart, Moon, HelpCircle, MessageCircle,
} from "lucide-react";
import Container from "@/components/shared/Container";
import FAQCategory from "./FAQCategory";
import FAQCTA from "./FAQCTA";

const categories = [
  { key: "general", icon: BookOpen },
  { key: "lessons", icon: Monitor },
  { key: "scheduling", icon: Clock },
  { key: "curriculum", icon: GraduationCap },
  { key: "technical", icon: ShieldCheck },
];

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
    const iconList = [HelpCircle, Sparkles, Star, BookOpen, Heart, Moon, MessageCircle, GraduationCap];
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
export default function FAQPageContent() {
  const t = useTranslations("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCategories = useMemo(() => {
    if (activeCategory === "all" && !searchQuery) return categories;
    if (activeCategory !== "all") {
      return categories.filter((cat) => cat.key === activeCategory);
    }
    return categories;
  }, [activeCategory, searchQuery]);

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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
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
              <span className="relative inline-block">
                {t("hero.title")}
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

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("hero.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-4 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-xl text-base"
                />
              </div>
            </motion.div>
          </motion.div>
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

      {/* ============================ CATEGORY TABS (unchanged) ============================ */}
      <section className="py-8 bg-sand-50 border-b border-sand-200 sticky top-16 md:top-20 z-30 backdrop-blur-xl bg-sand-50/90">
        <Container>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === "all"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-gray-600 hover:bg-primary/5 hover:text-primary border border-gray-200"
              }`}
            >
              {t("categories.all")}
            </button>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat.key
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-white text-gray-600 hover:bg-primary/5 hover:text-primary border border-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(`categories.${cat.key}`)}
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============================ FAQ SECTIONS (unchanged) ============================ */}
      <section className="py-16 md:py-20 bg-sand-50">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            {filteredCategories.map((cat, index) => (
              <FAQCategory
                key={cat.key}
                categoryKey={cat.key}
                icon={cat.icon}
                searchQuery={searchQuery}
                index={index}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <FAQCTA />
    </main>
  );
}