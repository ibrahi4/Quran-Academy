import React from "react";
import type { Metadata } from "next";
import BlogDetailContent from "@/components/blog/BlogDetailContent";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

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
  return <BlogDetailContent slug={slug} />;
}