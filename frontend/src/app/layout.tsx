import React from "react";
import {
  plusJakarta,
  ibmPlexArabic,
  amiri,
  bodyFont,
  displayFont,
  arabicFont,
} from "@/lib/fonts";
import "./globals.css";
import "../styles/animations.css";
import "../styles/islamic-patterns.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={cn(
        plusJakarta.variable,
        ibmPlexArabic.variable,
        amiri.variable,
        bodyFont.variable,
        displayFont.variable,
        arabicFont.variable,
        geist.variable,
        "font-sans"
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col"
        style={{ fontFamily: "var(--font-body, var(--font-sans))" }}
      >
        {children}
      </body>
    </html>
  );
}