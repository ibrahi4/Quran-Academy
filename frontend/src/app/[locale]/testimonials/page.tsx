import React from "react";
import type { Metadata } from "next";
import TestimonialsPageContent from "@/components/testimonials/TestimonialsPageContent";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Read what students and parents say about their Quran, Arabic, and Islamic Studies learning experience with Ibrahim Abdelnasser.",
};

export default function TestimonialsPage() {
  return <TestimonialsPageContent />;
}
