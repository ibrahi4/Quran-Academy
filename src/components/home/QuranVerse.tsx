"use client";

import React, { useRef, useState, useEffect } from "react";
import Container from "@/components/shared/Container";

export default function QuranVerse() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-16 md:py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #F5F0EB 0%, #FAFAF7 100%)" }}
    >
      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <Container>
        <div
          className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Decorative Top */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-accent/40" />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
              <polygon points="12,2 14.5,9 22,9 16,13.5 18,21 12,17 6,21 8,13.5 2,9 9.5,9" fill="currentColor" opacity="0.6" />
            </svg>
            <div className="h-px w-16 bg-accent/40" />
          </div>

          {/* Arabic Verse */}
          <p
            className="text-2xl md:text-3xl lg:text-4xl leading-[2] mb-6 text-primary/90"
            style={{ fontFamily: "var(--font-quran, var(--font-arabic, serif))" }}
          >
            ﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ۝ خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ ۝ اقْرَأْ وَرَبُّكَ الْأَكْرَمُ ﴾
          </p>

          {/* English Translation */}
          <p className="text-lg md:text-xl text-gray-600 italic leading-relaxed mb-4">
            &ldquo;Read in the name of your Lord who created. Created man from a clinging substance.
            Read, and your Lord is the Most Generous.&rdquo;
          </p>

          {/* Reference */}
          <p className="text-sm text-accent font-semibold tracking-wide">
            — Surah Al-Alaq (96:1-3)
          </p>

          {/* Decorative Bottom */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-16 bg-accent/40" />
            <div className="w-2 h-2 rounded-full bg-accent/40" />
            <div className="h-px w-16 bg-accent/40" />
          </div>
        </div>
      </Container>
    </section>
  );
}
