"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star, Quote, Filter } from "lucide-react";
import Container from "@/components/shared/Container";
import TestimonialCard from "./TestimonialCard";
import TestimonialsStats from "./TestimonialsStats";
import VideoTestimonials from "./VideoTestimonials";
import TestimonialsCTA from "./TestimonialsCTA";
import { useLocale } from "@/hooks/useLocale";
import { apiGetClient } from "@/lib/api";

const filters = ["all", "parents", "adults", "newMuslims", "kids"] as const;

type TestimonialItem = {
  id: number | string;
  name: string;
  role: string;
  country: string;
  category: string;
  rating: number;
  text: string;
  course: string;
};

export default function TestimonialsPageContent() {
  const t = useTranslations("testimonials");
  const { locale } = useLocale();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [apiTestimonials, setApiTestimonials] = useState<TestimonialItem[] | null>(null);

  // Fetch from API
  useEffect(() => {
    apiGetClient("/testimonials/public")
      .then((data: any) => {
        const items = Array.isArray(data) ? data : data?.data || [];
        if (items.length > 0) {
          const mapped: TestimonialItem[] = items.map((item: any) => ({
            id: item.id,
            name: item.name || "Anonymous",
            role: "",
            country: item.country || "",
            category: "all",
            rating: item.rating || 5,
            text: locale === "ar" && item.textAr ? item.textAr : item.textEn,
            course: "",
          }));
          setApiTestimonials(mapped);
        }
      })
      .catch(() => {
        // Fallback to static data
      });
  }, [locale]);

  // Static fallback from translations
  const staticTestimonials = useMemo(() => {
    try {
      const totalCount = Number(t("list.count"));
      return Array.from({ length: totalCount }, (_, i) => ({
        id: i,
        name: t(`list.items.${i}.name`),
        role: t(`list.items.${i}.role`),
        country: t(`list.items.${i}.country`),
        category: t(`list.items.${i}.category`),
        rating: Number(t(`list.items.${i}.rating`)),
        text: t(`list.items.${i}.text`),
        course: t(`list.items.${i}.course`),
      }));
    } catch {
      return [];
    }
  }, [t]);

  const testimonials = apiTestimonials || staticTestimonials;

  const filtered = useMemo(() => {
    if (activeFilter === "all") return testimonials;
    return testimonials.filter((item) => item.category === activeFilter);
  }, [activeFilter, testimonials]);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-hero-gradient pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
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
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <span className="text-white font-bold text-lg">4.9</span>
              <span className="text-white/60">|</span>
              <span className="text-white/80 text-sm">{t("hero.reviewCount")}</span>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      <TestimonialsStats />

      <section className="py-16 md:py-24 bg-sand-50">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-12"
          >
            <Filter className="w-4 h-4 text-gray-400 mr-2" />
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white text-gray-600 hover:bg-primary/5 hover:text-primary border border-gray-200"
                }`}
              >
                {t(`filters.${filter}`)}
              </button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial as any}
                index={index}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Quote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t("noResults")}</p>
            </motion.div>
          )}
        </Container>
      </section>

      <VideoTestimonials />
      <TestimonialsCTA />
    </main>
  );
}