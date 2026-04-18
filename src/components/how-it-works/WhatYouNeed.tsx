"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Laptop, Wifi, Headphones, Clock } from "lucide-react";
import Container from "@/components/shared/Container";

const icons = [Laptop, Wifi, Headphones, Clock];

export default function WhatYouNeed() {
  const t = useTranslations("howItWorks.requirements");

  return (
    <section className="py-20 md:py-28 bg-white relative">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group text-center"
            >
              <div className="bg-sand-50 rounded-3xl p-8 border border-sand-200 hover:border-primary/20 hover:shadow-premium transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/15 transition-colors duration-300">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {t(`items.${index}.title`)}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t(`items.${index}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
