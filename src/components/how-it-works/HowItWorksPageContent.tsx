"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Container from "@/components/shared/Container";
import StepsSection from "./StepsSection";
import WhatYouNeed from "./WhatYouNeed";
import PlatformsSection from "./PlatformsSection";
import HowItWorksCTA from "./HowItWorksCTA";

export default function HowItWorksPageContent() {
  const t = useTranslations("howItWorks");

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-hero-gradient pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
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
          </motion.div>
        </Container>
      </section>

      <StepsSection />
      <WhatYouNeed />
      <PlatformsSection />
      <HowItWorksCTA />
    </main>
  );
}
