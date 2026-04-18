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
  Zap,
  BookOpen,
  Award,
  Headphones,
  Target,
} from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";

const reasons = [
  {
    icon: GraduationCap,
    title: "Certified & Qualified",
    description: "Al-Azhar educated with Ijazah certification in Quran recitation and a strong academic background in Islamic sciences.",
  },
  {
    icon: MessageCircle,
    title: "Fluent English",
    description: "Clear, professional English communication ensures smooth and effective learning for non-Arabic speakers.",
  },
  {
    icon: Target,
    title: "Personalized Approach",
    description: "Every student gets a customized curriculum tailored to their level, goals, pace, and learning style.",
  },
  {
    icon: Heart,
    title: "Patient & Supportive",
    description: "A warm, encouraging teaching style that makes students feel comfortable and motivated to learn.",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Lessons available across all major time zones. Find a time that fits your busy schedule perfectly.",
  },
  {
    icon: Users,
    title: "All Ages Welcome",
    description: "Specialized methods for kids, teens, and adults. From age 5 to 65, everyone is welcome.",
  },
  {
    icon: Globe,
    title: "Global Experience",
    description: "Over 10 years teaching students from 15+ countries across USA, UK, Canada, Europe, and beyond.",
  },
  {
    icon: Shield,
    title: "Trusted by Families",
    description: "500+ students and families trust Ibrahim for their Islamic education. Read their stories in our testimonials.",
  },
];

export default function WhyChooseMe() {
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
          title="Why Learn with Ibrahim?"
          subtitle="What sets my teaching apart and why hundreds of students worldwide choose to learn with me."
        />

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-2xl p-6 border border-sand-200/50 hover:border-primary/20 hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 ${
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                <reason.icon className="w-5 h-5 text-primary" />
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                {reason.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {reason.description}
              </p>

              {/* Hover accent */}
              <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
