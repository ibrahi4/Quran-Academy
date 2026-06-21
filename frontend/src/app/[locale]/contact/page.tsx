import React from "react";
import type { Metadata } from "next";
import ContactPageContent from "@/components/contact/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact Quranic Academy",
  description: "Get in touch with Quranic Academy for Quran, Arabic, and Islamic Studies lessons.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}