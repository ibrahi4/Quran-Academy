"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Search, BookOpen, DollarSign, Clock, Monitor, GraduationCap, ShieldCheck } from "lucide-react";
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
      {/* Hero Section */}
      <section className="relative bg-hero-gradient pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto relative z-10"
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium rounded-full mb-6 border border-white/10">
              {t("hero.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 max-w-xl mx-auto"
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
      </section>

      {/* Category Tabs */}
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

      {/* FAQ Sections */}
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
