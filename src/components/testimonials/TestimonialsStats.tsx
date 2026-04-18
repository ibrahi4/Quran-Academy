"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Users, Globe, Star, Award } from "lucide-react";
import Container from "@/components/shared/Container";

const icons = [Users, Globe, Star, Award];

export default function TestimonialsStats() {
  const t = useTranslations("testimonials.stats");

  return (
    <section className="py-12 bg-white border-b border-gray-100 relative -mt-8 z-20">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {t(`items.${index}.value`)}
              </div>
              <div className="text-gray-500 text-sm">
                {t(`items.${index}.label`)}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
