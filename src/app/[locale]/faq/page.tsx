import React from "react";
import type { Metadata } from "next";
import FAQPageContent from "@/components/faq/FAQPageContent";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about our Quran, Arabic, and Islamic Studies lessons. Learn about scheduling, pricing, methodology, and more.",
};

export default function FAQPage() {
  return <FAQPageContent />;
}
