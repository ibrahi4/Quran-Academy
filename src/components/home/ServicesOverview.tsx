"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Mic,
  Languages,
  GraduationCap,
  Baby,
  Heart,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "../shared/Container";
import SectionHeader from "../shared/SectionHeader";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Mic,
  Languages,
  GraduationCap,
  Baby,
  Heart,
};

const services = [
  {
    slug: "quran-recitation",
    icon: "BookOpen",
    title: "Quran Recitation & Memorization",
    description: "Master beautiful Quran recitation and build a strong Hifz journey with expert guidance.",
    features: ["Reading from scratch", "Memorization (Hifz)", "Beautiful recitation"],
    color: "primary" as const,
  },
  {
    slug: "tajweed",
    icon: "Mic",
    title: "Tajweed Mastery",
    description: "Perfect your pronunciation with detailed Tajweed rules explained clearly in English.",
    features: ["All Tajweed rules", "Practical application", "Pronunciation mastery"],
    color: "secondary" as const,
  },
  {
    slug: "arabic-language",
    icon: "Languages",
    title: "Arabic Language",
    description: "From alphabet to fluency. Learn Arabic reading, writing, grammar, and conversation.",
    features: ["Alphabet to fluency", "Grammar fundamentals", "Quranic Arabic"],
    color: "accent" as const,
  },
  {
    slug: "islamic-studies",
    icon: "GraduationCap",
    title: "Islamic Studies",
    description: "Understand your faith deeply through clear, authentic, and engaging Islamic education.",
    features: ["Core beliefs (Aqeedah)", "Worship guidance (Fiqh)", "Prophet's life (Seerah)"],
    color: "primary" as const,
  },
  {
    slug: "kids-program",
    icon: "Baby",
    title: "Kids & Teens Program",
    description: "Fun, interactive, and age-appropriate lessons designed specially for young learners.",
    features: ["Ages 5-17", "Interactive methods", "Progress reports"],
    color: "secondary" as const,
  },
  {
    slug: "new-muslims",
    icon: "Heart",
    title: "New Muslims / Reverts",
    description: "A gentle, supportive introduction to Islam, Quran, and prayer at your own pace.",
    features: ["Basics of Islam", "Prayer step-by-step", "Safe learning space"],
    color: "accent" as const,
  },
];

const colorStyles = {
  primary: {
    bg: "bg-primary/5",
    hoverBg: "group-hover:bg-primary/10",
    icon: "text-primary",
    border: "border-primary/10",
    hoverBorder: "group-hover:border-primary/20",
    badge: "bg-primary/10 text-primary",
  },
  secondary: {
    bg: "bg-secondary/5",
    hoverBg: "group-hover:bg-secondary/10",
    icon: "text-secondary",
    border: "border-secondary/10",
    hoverBorder: "group-hover:border-secondary/20",
    badge: "bg-secondary/10 text-secondary",
  },
  accent: {
    bg: "bg-accent/10",
    hoverBg: "group-hover:bg-accent/15",
    icon: "text-accent-400",
    border: "border-accent/15",
    hoverBorder: "group-hover:border-accent/30",
    badge: "bg-accent/15 text-accent-400",
  },
};

export default function ServicesOverview() {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section className="section-padding bg-sand-50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="services-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1" fill="#0D4F4F" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#services-pattern)" />
        </svg>
      </div>

      <Container className="relative z-10">
        <SectionHeader
          title="What I Teach"
          subtitle="Comprehensive Islamic education tailored to your goals, level, and pace. Every lesson is personalized for you."
        />

        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon];
            const colors = colorStyles[service.color];

            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <Link href={`/services/${service.slug}`} className="block h-full">
                  <div
                    className={cn(
                      "group relative h-full bg-white rounded-2xl p-6 md:p-8 border transition-all duration-500",
                      "hover:shadow-premium-hover hover:-translate-y-1",
                      colors.border,
                      colors.hoverBorder
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500",
                        colors.bg,
                        colors.hoverBg
                      )}
                    >
                      {IconComponent && (
                        <IconComponent
                          className={cn("w-6 h-6", colors.icon)}
                        />
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed mb-5">
                      {service.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {service.features.map((feature, i) => (
                        <span
                          key={i}
                          className={cn(
                            "text-xs font-medium px-2.5 py-1 rounded-lg",
                            colors.badge
                          )}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Learn More Link */}
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                      Learn More
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>

                    {/* Corner Decoration */}
                    <div
                      className={cn(
                        "absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        colors.bg
                      )}
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-all duration-300 group"
          >
            View All Services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
