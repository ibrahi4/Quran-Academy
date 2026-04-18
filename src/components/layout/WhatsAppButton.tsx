"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <a
      href={`${siteConfig.contact.whatsappLink}?text=${encodeURIComponent(
        "Assalamu Alaikum! I am interested in learning more about your Quran and Arabic lessons."
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg shadow-green-500/30 hover:shadow-xl transition-all duration-300"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
      <MessageCircle className="w-6 h-6 relative z-10" />
    </a>
  );
}
