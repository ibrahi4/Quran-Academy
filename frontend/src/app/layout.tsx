import React from "react";
import { plusJakarta, ibmPlexArabic, amiri } from "@/lib/fonts";
import "./globals.css";
import "../styles/animations.css";
import "../styles/islamic-patterns.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className={`${plusJakarta.variable} ${ibmPlexArabic.variable} ${amiri.variable}`}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-sans)" }}>
        {children}
      </body>
    </html>
  );
}
