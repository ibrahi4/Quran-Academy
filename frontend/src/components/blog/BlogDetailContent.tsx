"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Share2,
  Loader2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { BlogPost, formatBlogPost, BlogPostFormatted } from "@/types/blog";

type Props = {
  slug: string;
};

export default function BlogDetailContent({ slug }: Props) {
  const tCommon = useTranslations("blog");
  const { isRTL, locale } = useLocale();
  const [post, setPost] = useState<BlogPostFormatted | null>(null);
  const [loading, setLoading] = useState(true);
  const [useStatic, setUseStatic] = useState(false);

  // Try API first
  useEffect(() => {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${API_BASE}/blog/slug/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((json) => {
        const raw: BlogPost = json?.data || json;
        if (raw && raw.slug) {
          setPost(formatBlogPost(raw, locale));
        } else {
          setUseStatic(true);
        }
      })
      .catch(() => {
        setUseStatic(true);
      })
      .finally(() => setLoading(false));
  }, [slug, locale]);

  // Static fallback
  const StaticContent = () => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const t = useTranslations(`blogPosts.${slug}`);
      const sectionsCount = Number(t("sectionsCount"));

      return (
        <>
          <section className="relative bg-hero-gradient pt-32 pb-16 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-10 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>
            <Container>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto relative z-10"
              >
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors"
                >
                  {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  {tCommon("backToBlog")}
                </Link>
                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium rounded-full mb-5 border border-white/10">
                  {t("category")}
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {t("title")}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{t("author")}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{t("date")}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{t("readTime")}</span>
                </div>
              </motion.div>
            </Container>
          </section>

          <section className="py-16 md:py-20 bg-sand-50">
            <Container>
              <div className="max-w-3xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-10">
                  <p className="text-lg text-gray-700 leading-relaxed">{t("introduction")}</p>
                </motion.div>
                {Array.from({ length: sectionsCount }, (_, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">{i + 1}</span>
                      {t(`sections.${i}.heading`)}
                    </h2>
                    <div className="text-gray-700 leading-relaxed space-y-4 pl-11 rtl:pl-0 rtl:pr-11">
                      <p>{t(`sections.${i}.content`)}</p>
                    </div>
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-primary/5 rounded-3xl p-8 border border-primary/10 mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" />{t("conclusionTitle")}</h2>
                  <p className="text-gray-700 leading-relaxed">{t("conclusion")}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"><Share2 className="w-5 h-5" /><span className="text-sm font-medium">{tCommon("shareArticle")}</span></button>
                  <Link href="/book-trial"><Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 py-5 font-semibold gap-2">{tCommon("startLearning")}{isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}</Button></Link>
                </motion.div>
              </div>
            </Container>
          </section>
        </>
      );
    } catch {
      return (
        <div className="py-32 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Post not found</p>
          <Link href="/blog" className="text-primary font-semibold mt-4 inline-block hover:underline">{tCommon("backToBlog")}</Link>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <main>
        <section className="relative bg-hero-gradient pt-32 pb-16">
          <Container>
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </Container>
        </section>
      </main>
    );
  }

  if (useStatic || !post) {
    return <main><StaticContent /></main>;
  }

  // API Content
  return (
    <main>
      <section className="relative bg-hero-gradient pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <Container>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto relative z-10">
            <Link href="/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors">
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {tCommon("backToBlog")}
            </Link>
            {post.category && (
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium rounded-full mb-5 border border-white/10">{post.category}</span>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
              {post.date && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{post.date}</span>}
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readTime}</span>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="py-16 md:py-20 bg-sand-50">
        <Container>
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary prose-strong:text-gray-900 prose-img:rounded-2xl mb-10"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
              <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"><Share2 className="w-5 h-5" /><span className="text-sm font-medium">{tCommon("shareArticle")}</span></button>
              <Link href="/book-trial"><Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 py-5 font-semibold gap-2">{tCommon("startLearning")}{isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}</Button></Link>
            </motion.div>
          </div>
        </Container>
      </section>
    </main>
  );
}