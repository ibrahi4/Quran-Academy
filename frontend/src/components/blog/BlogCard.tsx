"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, ArrowLeft, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";

type Props = {
  post: {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readTime: string;
    author: string;
  };
  index: number;
};

const categoryColors: Record<string, string> = {
  quran: "bg-emerald-50 text-emerald-700",
  tajweed: "bg-blue-50 text-blue-700",
  arabic: "bg-purple-50 text-purple-700",
  islamic: "bg-amber-50 text-amber-700",
  tips: "bg-rose-50 text-rose-700",
};

export default function BlogCard({ post, index }: Props) {
  const { isRTL } = useLocale();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`}>
        <article className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-premium transition-all duration-500 h-full flex flex-col">
          {/* Thumbnail Placeholder */}
          <div className="relative h-48 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center">
                <span className="text-3xl">??</span>
              </div>
            </div>
            <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[post.category] || "bg-gray-50 text-gray-700"}`}>
                {post.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-1">
            {/* Meta */}
            <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {post.title}
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
              {post.excerpt}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-gray-600 text-xs font-medium">{post.author}</span>
              </div>
              <span className="flex items-center gap-1 text-primary text-sm font-semibold group-hover:gap-2 transition-all duration-300">
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
