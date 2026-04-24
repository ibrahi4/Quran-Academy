import React from "react";
import type { Metadata } from "next";
import BlogPageContent from "@/components/blog/BlogPageContent";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read articles about Quran learning, Tajweed tips, Arabic language guides, and Islamic knowledge from Ibrahim Abdelnasser.",
};

export default function BlogPage() {
  return <BlogPageContent />;
}
