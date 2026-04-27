"use client";

import React, { useRef, useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, ArrowRight, ArrowLeft } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";

type CarouselItem = {
  name: string;
  country: string;
  flag: string;
  role: string;
  rating: number;
  highlight: string;
  text: string;
};

export default function TestimonialsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [apiItems, setApiItems] = useState<CarouselItem[] | null>(null);
  const t = useTranslations("testimonialsHome");
  const { isRTL, locale } = useLocale();

  // Fetch from API
  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${API_BASE}/testimonials/public`)
      .then((res) => res.json())
      .then((data: any) => {
        const items = Array.isArray(data) ? data : data?.data || [];
        if (items.length > 0) {
          const mapped: CarouselItem[] = items.slice(0, 8).map((item: any) => ({
            name: item.name || "Student",
            country: item.country || "",
            flag: "",
            role: "",
            rating: item.rating || 5,
            highlight: item.featured ? "Featured" : "Student Review",
            text: locale === "ar" && item.textAr ? item.textAr : item.textEn,
          }));
          setApiItems(mapped);
        }
      })
      .catch(() => {});
  }, [locale]);

  // Static fallback
  const staticCount = 6;
  const testimonialItems: CarouselItem[] = apiItems || Array.from({ length: staticCount }, (_, i) => ({
    name: t(`items.${i}.name`),
    country: t(`items.${i}.country`),
    flag: t(`items.${i}.flag`),
    role: t(`items.${i}.role`),
    rating: Number(t(`items.${i}.rating`)),
    highlight: t(`items.${i}.highlight`),
    text: t(`items.${i}.text`),
  }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(Math.abs(scrollLeft) > 10);
    setCanScrollRight(Math.abs(scrollLeft) < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    const actualDirection = isRTL
      ? (direction === "left" ? scrollAmount : -scrollAmount)
      : (direction === "left" ? -scrollAmount : scrollAmount);
    scrollRef.current.scrollBy({ left: actualDirection, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="section-padding bg-white relative overflow-hidden">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16">
          <SectionHeader title={t("title")} subtitle={t("subtitle")} centered={false} className="mb-0" />
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <button onClick={() => scroll("left")} disabled={!canScrollLeft} className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${canScrollLeft ? "border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary" : "border-gray-200 text-gray-300 cursor-not-allowed"}`}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll("right")} disabled={!canScrollRight} className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${canScrollRight ? "border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary" : "border-gray-200 text-gray-300 cursor-not-allowed"}`}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {testimonialItems.map((item, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-[350px] md:w-[400px] snap-start transition-all duration-700 ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="h-full bg-white rounded-2xl p-6 md:p-8 border border-sand-200/50 hover:border-primary/15 hover:shadow-premium-hover transition-all duration-500 group">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                  <Quote className="w-5 h-5 text-accent" />
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="inline-block px-3 py-1 rounded-lg bg-primary/5 text-primary text-xs font-semibold mb-4">
                  {item.highlight}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                  &ldquo;{item.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-sand-200/50">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{item.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.flag} {item.country} {item.role ? `� ${item.role}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/testimonials" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-all duration-300 group">
            {t("readAll")}
            {isRTL ? <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </Link>
        </div>
      </Container>
    </section>
  );
}