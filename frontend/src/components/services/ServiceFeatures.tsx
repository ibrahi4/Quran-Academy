"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle2, Star, Sparkles, Target, BookMarked, Award, Lightbulb, Users } from "lucide-react";
import Container from "@/components/shared/Container";

const featureIcons = [Star, Target, BookMarked, Award, Lightbulb, Users, Sparkles, CheckCircle2];

type Props = { slug: string };

export default function ServiceFeatures({ slug }: Props) {
  const t = useTranslations(`serviceDetails.${slug}.features`);
  const count = Number(t("count"));

  return (
    <section className="py-20 md:py-28 bg-sand-50">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/5 text-primary text-sm font-semibold rounded-full mb-4">
            {t("badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {Array.from({ length: count }, (_, i) => {
            const Icon = featureIcons[i % featureIcons.length];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-premium transition-all duration-500 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t(`items.${i}.title`)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    {t(`items.${i}.description`)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
