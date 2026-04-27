"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Search, BookOpen, Loader2 } from "lucide-react";
import Container from "@/components/shared/Container";
import BlogCard from "./BlogCard";
import BlogCTA from "./BlogCTA";
import { useLocale } from "@/hooks/useLocale";
import { BlogPost, BlogPostFormatted, formatBlogPost } from "@/types/blog";

const categories = ["all", "quran", "tajweed", "arabic", "islamic", "tips"] as const;

export default function BlogPageContent() {
  const t = useTranslations("blog");
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [apiPosts, setApiPosts] = useState<BlogPostFormatted[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch from API
  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${API_BASE}/blog?published=true&limit=50`)
      .then((res) => res.json())
      .then((json) => {
        const items: BlogPost[] = json?.data || [];
        if (items.length > 0) {
          const formatted = items.map((p) => formatBlogPost(p, locale));
          setApiPosts(formatted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locale]);

  // Static fallback from translations
  const staticPosts = useMemo(() => {
    try {
      const totalCount = Number(t("posts.count"));
      return Array.from({ length: totalCount }, (_, i) => ({
        id: String(i),
        slug: t(`posts.items.${i}.slug`),
        title: t(`posts.items.${i}.title`),
        excerpt: t(`posts.items.${i}.excerpt`),
        content: "",
        coverImage: null,
        category: t(`posts.items.${i}.category`),
        date: t(`posts.items.${i}.date`),
        readTime: t(`posts.items.${i}.readTime`),
        author: t(`posts.items.${i}.author`),
        tags: [],
      }));
    } catch {
      return [];
    }
  }, [t]);

  const posts = apiPosts || staticPosts;

  const filtered = useMemo(() => {
    let result = posts;
    if (activeCategory !== "all") {
      result = result.filter(
        (p) =>
          p.category === activeCategory ||
          p.tags?.includes(activeCategory),
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q),
      );
    }
    return result;
  }, [activeCategory, searchQuery, posts]);

  return (
    <main>
      {/* Hero */}
      <section className="relative bg-hero-gradient pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 max-w-xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("hero.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-4 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-xl text-base"
                />
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Categories */}
      <section className="py-8 bg-sand-50 border-b border-sand-200 sticky top-16 md:top-20 z-30 backdrop-blur-xl bg-sand-50/90">
        <Container>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white text-gray-600 hover:bg-primary/5 hover:text-primary border border-gray-200"
                }`}
              >
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* Posts Grid */}
      <section className="py-16 md:py-24 bg-sand-50">
        <Container>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((post, index) => (
                  <BlogCard key={post.id} post={post} index={index} />
                ))}
              </div>

              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">{t("noResults")}</p>
                </motion.div>
              )}
            </>
          )}
        </Container>
      </section>

      <BlogCTA />
    </main>
  );
}