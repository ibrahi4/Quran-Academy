import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetailContent from "@/components/blog/BlogDetailContent";

const validSlugs = [
  "how-to-start-learning-quran",
  "tajweed-tips-for-beginners",
  "benefits-of-memorizing-quran",
  "arabic-language-learning-guide",
  "new-muslim-first-steps",
  "teaching-quran-to-kids",
];

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateStaticParams() {
  return validSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const formatted = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: formatted,
    description: `Read about ${formatted} - tips, guides, and insights from Ibrahim Abdelnasser.`,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!validSlugs.includes(slug)) {
    notFound();
  }

  return <BlogDetailContent slug={slug} />;
}