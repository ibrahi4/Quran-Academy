import React from "react";
import type { Metadata } from "next";
import HowItWorksPageContent from "@/components/how-it-works/HowItWorksPageContent";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how to start your Quran, Arabic, and Islamic Studies journey. Simple steps from booking a free trial to achieving your learning goals.",
};

export default function HowItWorksPage() {
  return <HowItWorksPageContent />;
}
