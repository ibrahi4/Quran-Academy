import React from "react";
import type { Metadata } from "next";
import ContactPageContent from "@/components/contact/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact Ibrahim",
  description: "Get in touch with Ibrahim Abdelnasser for Quran, Arabic, and Islamic Studies lessons.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}