"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Video, MonitorPlay, Shield, Zap } from "lucide-react";
import Container from "@/components/shared/Container";

export default function PlatformsSection() {
  const t = useTranslations("howItWorks.platforms");

  const platforms = [
    {
      name: "Zoom",
      icon: Video,
      color: "bg-blue-500",
    },
    {
      name: "Google Meet",
      icon: MonitorPlay,
      color: "bg-green-500",
    },
  ];

  const features = [Shield, Zap];

  return (
    <section className="py-20 md:py-28 bg-sand-50 relative">
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

        <div className="max-w-4xl mx-auto">
          {/* Platform Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {platforms.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="bg-white rounded-3xl p-8 border border-gray-100 shadow-premium hover:shadow-premium-hover transition-all duration-500 text-center"
                >
                  <div className={`w-16 h-16 ${platform.color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t(`items.${index}.name`)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t(`items.${index}.description`)}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((Icon, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-accent-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t(`features.${index}.title`)}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t(`features.${index}.description`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
