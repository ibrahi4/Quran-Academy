import type { Metadata } from "next";
import { plusJakarta, ibmPlexArabic, amiri } from "../src/lib/fonts";
import { siteConfig } from "../src/config/site";
import Navbar from "../src/components/layout/Navbar";
import Footer from "../src/components/layout/Footer";
import WhatsAppButton from "../src/components/layout/WhatsAppButton";
import ScrollToTop from "../src/components/layout/ScrollToTop";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={cn(plusJakarta.variable, ibmPlexArabic.variable, amiri.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="font-english min-h-screen flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <Footer />

        {/* Floating Elements */}
        <WhatsAppButton />
        <ScrollToTop />
      </body>
    </html>
  );
}