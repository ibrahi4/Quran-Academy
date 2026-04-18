"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Container from "@/components/shared/Container";

type Props = { slug: string };

export default function ServiceCurriculum({ slug }: Props) {
  const t = useTranslations(`serviceDetails.${slug}.curriculum`);
  const levelsCount = Number(t("count"));

  const levelColors = [
    "border-green-200 bg-green-50",
    "border-blue-200 bg-blue-50",
    "border-purple-200 bg-purple-50",
    "border-amber-200 bg-amber-50",
  ];

  const dotColors = [
    "bg-green-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-amber-500",
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent-foreground text-sm font-semibold rounded-full mb-4">
            {t("badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {Array.from({ length: levelsCount }, (_, i) => {
            const topicsCount = Number(t(`levels.${i}.topicsCount`));
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`rounded-3xl border p-8 ${levelColors[i % levelColors.length]}`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-3 h-3 rounded-full ${dotColors[i % dotColors.length]}`} />
                  <h3 className="text-xl font-bold text-gray-900">
                    {t(`levels.${i}.title`)}
                  </h3>
                </div>
                <p className="text-gray-600 mb-5 leading-relaxed">
                  {t(`levels.${i}.description`)}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: topicsCount }, (_, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">
                        {t(`levels.${i}.topics.${j}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
