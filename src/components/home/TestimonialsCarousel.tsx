"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight, Quote, ArrowRight } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    country: "Texas, USA",
    flag: "🇺🇸",
    role: "Mother of 2",
    rating: 5,
    text: "My son now reads Quran confidently after just 3 months with Ustadh Ibrahim. His patience with kids is truly remarkable. Both my children look forward to their weekly sessions — something I never thought would happen!",
    highlight: "3 months to confident Quran reading",
  },
  {
    id: 2,
    name: "James Abdullah",
    country: "London, UK",
    flag: "🇬🇧",
    role: "Revert / New Muslim",
    rating: 5,
    text: "As a new Muslim, I was incredibly nervous about learning Arabic and Quran. Ibrahim made me feel completely at ease from the very first session. He is patient, knowledgeable, and genuinely cares about his students. I cannot recommend him highly enough.",
    highlight: "Perfect for new Muslims",
  },
  {
    id: 3,
    name: "Fatima van der Berg",
    country: "Amsterdam, Netherlands",
    flag: "🇳🇱",
    role: "Adult Student",
    rating: 5,
    text: "The Tajweed lessons have completely transformed my Quran recitation. Ibrahim has a gift for explaining complex rules in a simple, clear way. After 6 months, my family says my recitation sounds completely different — in the best way!",
    highlight: "Complete Tajweed transformation",
  },
  {
    id: 4,
    name: "Ahmed Hassan",
    country: "Toronto, Canada",
    flag: "🇨🇦",
    role: "Adult Learner",
    rating: 5,
    text: "I tried many online teachers before finding Ibrahim, and the difference is night and day. His structured approach, clear explanations, and genuine dedication make every session valuable. He is truly the best Quran teacher I have ever had.",
    highlight: "Best teacher after trying many",
  },
  {
    id: 5,
    name: "Emily Roberts",
    country: "Sydney, Australia",
    flag: "🇦🇺",
    role: "Mother of 3",
    rating: 5,
    text: "All three of my daughters study with Ustadh Ibrahim. He adapts his teaching style for each child based on their age and personality. The progress reports he sends are detailed and helpful. A truly professional and caring teacher.",
    highlight: "Personalized for each child",
  },
  {
    id: 6,
    name: "Omar Schneider",
    country: "Berlin, Germany",
    flag: "🇩🇪",
    role: "University Student",
    rating: 5,
    text: "Learning Arabic with Ibrahim has been an amazing experience. He makes the language accessible and fun. I went from knowing zero Arabic to being able to read and understand basic Quranic verses in just a few months.",
    highlight: "Zero to reading in months",
  },
];

export default function TestimonialsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
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
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section ref={sectionRef} className="section-padding bg-white relative overflow-hidden">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 md:mb-16">
          <SectionHeader
            title="What My Students Say"
            subtitle="Real stories from real students and parents around the world."
            centered={false}
            className="mb-0"
          />

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                canScrollLeft
                  ? "border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                canScrollRight
                  ? "border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`flex-shrink-0 w-[350px] md:w-[400px] snap-start transition-all duration-700 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="h-full bg-white rounded-2xl p-6 md:p-8 border border-sand-200/50 hover:border-primary/15 hover:shadow-premium-hover transition-all duration-500 group">
                {/* Quote Icon */}
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                  <Quote className="w-5 h-5 text-accent" />
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Highlight Badge */}
                <div className="inline-block px-3 py-1 rounded-lg bg-primary/5 text-primary text-xs font-semibold mb-4">
                  {testimonial.highlight}
                </div>

                {/* Quote Text */}
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5 border-t border-sand-200/50">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {testimonial.flag} {testimonial.country} • {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-all duration-300 group"
          >
            Read All Testimonials
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
