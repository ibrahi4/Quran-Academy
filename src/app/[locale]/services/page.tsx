import React from "react";
import type { Metadata } from "next";
import ServicesPageContent from "@/components/services/ServicesPageContent";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore our Quran, Arabic, Tajweed, and Islamic Studies programs for kids, adults, and new Muslims.",
};

export default function ServicesPage() {
  return <ServicesPageContent />;
}