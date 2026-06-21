"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "../shared/Container";
import SectionHeader from "../shared/SectionHeader";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";
import { getServiceImage } from "@/lib/service-images";

const serviceIcons = [BookOpen, Mic, Languages, GraduationCap, Baby, Heart];
const serviceSlugs = [
  "quran-recitation",
  "tajweed",
  "arabic-language",
  "islamic-studies",
  "kids-program",
  "new-muslims",
];
const serviceColors = ["primary", "secondary", "accent", "primary", "secondary", "accent"] as const;

const colorStyles = {
  primary: {
    bg: "bg-primary/5",
    hoverBg: "group-hover:bg-primary/10",
    icon: "text-primary",
    border: "border-primary/10",
    hoverBorder: "group-hover:border-primary/20",
    badge: "bg-primary/10 text-primary",
    iconGlow: "shadow-primary/30",
  },
  secondary: {
    bg: "bg-secondary/5",
    hoverBg: "group-hover:bg-secondary/10",
    icon: "text-secondary",
    border: "border-secondary/10",
    hoverBorder: "group-hover:border-secondary/20",
    badge: "bg-secondary/10 text-secondary",
    iconGlow: "shadow-secondary/30",
  },
  accent: {
    bg: "bg-accent/10",
    hoverBg: "group-hover:bg-accent/15",
    icon: "text-accent-400",
    border: "border-accent/15",
    hoverBorder: "group-hover:border-accent/30",
    badge: "bg-accent/15 text-accent-400",
    iconGlow: "shadow-accent/30",
  },
};

export default function ServicesOverview() {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.1 });
  const t = useTranslations("servicesOverview");
  const { isRTL } = useLocale();

  return (
    <section className="pt-10 pb-10 bg-sand-50 relative overflow-hidden">
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
        <SectionHeader title={t("title")} subtitle={t("subtitle")} />

        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {serviceSlugs.map((slug, index) => {
            const IconComponent = serviceIcons[index];
            const colors = colorStyles[serviceColors[index]];
            const imageUrl = getServiceImage(index);

            return (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <Link href={`/services/${slug}`} className="block h-full">
                  <div
                    className={cn(
                      "group relative h-full bg-white rounded-3xl overflow-hidden border transition-all duration-500",
                      "hover:shadow-premium-hover hover:-translate-y-2",
                      colors.border,
                      colors.hoverBorder
                    )}
                  >
                    {/* ─────── IMAGE COVER ─────── */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={t(`services.${index}.title`)}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Floating icon */}
                      <div
                        className={cn(
                          "absolute -bottom-6 left-6 rtl:left-auto rtl:right-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 z-10",
                          "bg-white border-2 border-white",
                          "group-hover:scale-110 group-hover:rotate-3"
                        )}
                      >
                        <div
                          className={cn(
                            "w-full h-full rounded-xl flex items-center justify-center",
                            colors.bg
                          )}
                        >
                          <IconComponent className={cn("w-6 h-6", colors.icon)} />
                        </div>
                      </div>

                      {/* Top right decoration */}
                      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                        <div className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-white/50">
                          <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ─────── CONTENT ─────── */}
                    <div className="p-6 md:p-7 pt-10">
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300 leading-tight">
                        {t(`services.${index}.title`)}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed text-sm mb-5 line-clamp-3">
                        {t(`services.${index}.description`)}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {[0, 1, 2].map((fi) => (
                          <span
                            key={fi}
                            className={cn(
                              "text-[11px] font-semibold px-2.5 py-1 rounded-lg",
                              colors.badge
                            )}
                          >
                            {t(`services.${index}.features.${fi}`)}
                          </span>
                        ))}
                      </div>

                      {/* Learn More Link */}
                      <div className="flex items-center gap-2 text-primary font-semibold text-sm pt-3 border-t border-gray-100 group-hover:gap-3 transition-all duration-300">
                        <span>{t("learnMore")}</span>
                        {isRTL ? (
                          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        ) : (
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        )}
                      </div>
                    </div>

                    {/* Corner Decoration */}
                    <div
                      className={cn(
                        "absolute bottom-0 right-0 w-24 h-24 rounded-tl-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
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
            {t("viewAll")}
            {isRTL ? (
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}