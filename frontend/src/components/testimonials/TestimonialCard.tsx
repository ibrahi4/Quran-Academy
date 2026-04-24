"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, MapPin, BookOpen } from "lucide-react";

type Props = {
  testimonial: {
    id: number;
    name: string;
    role: string;
    country: string;
    category: string;
    rating: number;
    text: string;
    course: string;
  };
  index: number;
};

export default function TestimonialCard({ testimonial, index }: Props) {
  const initials = testimonial.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const bgColors = [
    "bg-primary/10 text-primary",
    "bg-accent/10 text-accent-foreground",
    "bg-secondary/10 text-secondary",
    "bg-blue-50 text-blue-600",
    "bg-purple-50 text-purple-600",
    "bg-rose-50 text-rose-600",
  ];

  const colorClass = bgColors[index % bgColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="group"
    >
      <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-premium transition-all duration-500 h-full flex flex-col relative overflow-hidden">
        {/* Quote Icon */}
        <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <Quote className="w-16 h-16 text-primary" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < testimonial.rating
                  ? "fill-accent text-accent"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Text */}
        <p className="text-gray-700 leading-relaxed flex-1 mb-6 text-[15px] relative z-10">
          &ldquo;{testimonial.text}&rdquo;
        </p>

        {/* Course Badge */}
        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary text-xs font-medium rounded-full">
            <BookOpen className="w-3.5 h-3.5" />
            {testimonial.course}
          </span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
          <div className={`w-11 h-11 rounded-full ${colorClass} flex items-center justify-center text-sm font-bold shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {testimonial.name}
            </h4>
            <p className="text-gray-500 text-xs truncate">{testimonial.role}</p>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0">
            <MapPin className="w-3.5 h-3.5" />
            <span>{testimonial.country}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
