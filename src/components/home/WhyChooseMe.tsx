"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  GraduationCap,
  MessageCircle,
  Clock,
  Heart,
  Shield,
  Users,
  Globe,
  Target,
} from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import { useTranslations } from "next-intl";

const reasonIcons = [GraduationCap, MessageCircle, Target, Heart, Clock, Users, Globe, Shield];

export default function WhyChooseMe() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const t = useTranslations("whyChooseMe");

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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-padding relative overflow-hidden" style={{ background: "linear-gradient(180deg, #FAFAF7 0%, #F5F0EB 100%)" }}>
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      {/* Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="why-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="#0D4F4F" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#why-pattern)" />
        </svg>
      </div>

      <Container className="relative z-10">
        <SectionHeader
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {reasonIcons.map((Icon, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-2xl p-6 border border-sand-200/50 hover:border-primary/20 hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                <Icon className="w-5 h-5 text-primary" />
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                {t(`reasons.${index}.title`)}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                {t(`reasons.${index}.description`)}
              </p>

              <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
