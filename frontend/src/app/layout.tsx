import React from "react";
import type { Metadata, Viewport } from "next";
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

export const metadata: Metadata = {
  applicationName: "Tajwedo Academy",
  manifest: "/Tajwedo-Public-Assets/favicon-for-app/manifest.json",
  icons: {
    icon: [
      {
        url: "/Tajwedo-Public-Assets/favicon-for-app/favicon.ico",
        sizes: "any"
      },
      {
        url: "/Tajwedo-Public-Assets/favicon-for-app/icon1.png",
        type: "image/png"
      },
      {
        url: "/Tajwedo-Public-Assets/favicon-for-app/icon0.svg",
        type: "image/svg+xml"
      }
    ],
    shortcut: [
      { url: "/Tajwedo-Public-Assets/favicon-for-app/favicon.ico" }
    ],
    apple: [
      {
        url: "/Tajwedo-Public-Assets/favicon-for-app/apple-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/Tajwedo-Public-Assets/favicon-for-app/icon0.svg",
        color: "#0D4F4F"
      }
    ]
  },
  appleWebApp: {
    capable: true,
    title: "Tajwedo Academy",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#0D4F4F",
  colorScheme: "light"
};

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