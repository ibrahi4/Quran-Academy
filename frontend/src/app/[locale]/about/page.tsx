import React from "react";
import type { Metadata } from "next";
import AboutPageContent from "@/components/about/AboutPageContent";

export const metadata: Metadata = {
  title: "About Quranic Academy",
  description: "Learn about Quranic Academy - a certified Quran, Arabic, Tajweed, and Islamic Studies teacher with 10+ years of experience.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}