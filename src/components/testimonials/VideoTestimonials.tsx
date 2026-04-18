"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";
import Container from "@/components/shared/Container";

export default function VideoTestimonials() {
  const t = useTranslations("testimonials.video");

  const videosCount = Number(t("count"));
  const videos = Array.from({ length: videosCount }, (_, i) => ({
    name: t(`items.${i}.name`),
    course: t(`items.${i}.course`),
    thumbnail: t(`items.${i}.thumbnail`),
  }));

  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group cursor-pointer"
            >
              <div className="relative bg-gray-900 rounded-3xl overflow-hidden aspect-video mb-4">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 z-20">
                    <Play className="w-7 h-7 text-primary ml-1 rtl:ml-0 rtl:mr-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 z-20">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{video.name}</h3>
              <p className="text-gray-500 text-xs mt-1">{video.course}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
