"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CalendarCheck, UserCheck, BookOpen, Target, MessageSquare, Award } from "lucide-react";
import Container from "@/components/shared/Container";

const stepIcons = [CalendarCheck, MessageSquare, UserCheck, BookOpen, Target, Award];

export default function StepsSection() {
  const t = useTranslations("howItWorks.steps");

  return (
    <section className="py-20 md:py-28 bg-sand-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Line */}
          <div className="hidden lg:block absolute left-1/2 rtl:right-1/2 rtl:left-auto top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 -translate-x-1/2 rtl:translate-x-1/2" />

          {stepIcons.map((Icon, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative flex flex-col lg:flex-row items-center gap-6 lg:gap-12 mb-16 last:mb-0 ${
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content Card */}
                <div className={`flex-1 ${isEven ? "lg:text-right rtl:lg:text-left" : "lg:text-left rtl:lg:text-right"}`}>
                  <div className="bg-white rounded-3xl p-8 shadow-premium hover:shadow-premium-hover transition-all duration-500 border border-gray-100 relative group">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors duration-300">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {t(`items.${index}.title`)}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {t(`items.${index}.description`)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step Number */}
                <div className="relative z-10 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-primary/30 shrink-0 border-4 border-white">
                  {index + 1}
                </div>

                {/* Empty space for alignment */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
