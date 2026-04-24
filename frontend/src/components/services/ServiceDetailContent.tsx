"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  BookOpen, Mic, Languages, GraduationCap, Baby, Heart,
  CheckCircle2, ArrowRight, ArrowLeft
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import ServiceFeatures from "./ServiceFeatures";
import ServiceCurriculum from "./ServiceCurriculum";
import ServiceAudience from "./ServiceAudience";
import ServiceCTA from "./ServiceCTA";

const serviceIcons: Record<string, React.ElementType> = {
  "quran-recitation": BookOpen,
  "tajweed": Mic,
  "arabic-language": Languages,
  "islamic-studies": GraduationCap,
  "kids-program": Baby,
  "new-muslims": Heart,
};

type Props = {
  slug: string;
};

export default function ServiceDetailContent({ slug }: Props) {
  const t = useTranslations(`serviceDetails.${slug}`);
  const { isRTL } = useLocale();
  const Icon = serviceIcons[slug] || BookOpen;

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-hero-gradient pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <Container>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto relative z-10"
          >
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 text-center lg:text-left rtl:lg:text-right">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/10"
                >
                  <Icon className="w-5 h-5 text-accent" />
                  <span className="text-white/90 text-sm font-medium">{t("badge")}</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  {t("title")}
                </h1>
                <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-xl">
                  {t("subtitle")}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start rtl:lg:justify-end">
                  <Link href="/book-trial">
                    <Button className="bg-white text-primary hover:bg-white/90 rounded-xl px-8 py-6 text-base font-semibold shadow-xl gap-2">
                      {t("cta")}
                      {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                    </Button>
                  </Link>
                 
                </div>
              </div>

              {/* Icon Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="hidden lg:flex w-48 h-48 rounded-3xl bg-white/10 backdrop-blur-sm items-center justify-center border border-white/10"
              >
                <Icon className="w-24 h-24 text-white/80" />
              </motion.div>
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14"
            >
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 text-center border border-white/10">
                  <div className="text-2xl font-bold text-white mb-1">
                    {t(`stats.${i}.value`)}
                  </div>
                  <div className="text-white/60 text-sm">
                    {t(`stats.${i}.label`)}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </Container>
      </section>

      <ServiceFeatures slug={slug} />
      <ServiceCurriculum slug={slug} />
      <ServiceAudience slug={slug} />
      <ServiceCTA slug={slug} />
    </main>
  );
}
