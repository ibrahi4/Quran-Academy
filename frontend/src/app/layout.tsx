import React from "react";
import { plusJakarta, ibmPlexArabic, amiri } from "@/lib/fonts";
import "./globals.css";
import "../styles/animations.css";
import "../styles/islamic-patterns.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className={cn(plusJakarta.variable, ibmPlexArabic.variable, amiri.variable, "font-sans", geist.variable)}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-sans)" }}>
        {children}
      </body>
    </html>
  );
}
