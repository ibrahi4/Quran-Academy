import React from "react";
import HeroSection from "@/components/home/HeroSection";
import TrustBar from "@/components/home/TrustBar";
import ServicesOverview from "@/components/home/ServicesOverview";
import AboutPreview from "@/components/home/AboutPreview";
import HowItWorks from "@/components/home/HowItWorks";
import WhyChooseMe from "@/components/home/WhyChooseMe";
import TestimonialsCarousel from "@/components/home/TestimonialsCarousel";
import CTABanner from "@/components/home/CTABanner";
import FAQPreview from "@/components/home/FAQPreview";
import QuranVerse from "@/components/home/QuranVerse";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <ServicesOverview />
      <AboutPreview />
      <HowItWorks />
      <WhyChooseMe />
      <TestimonialsCarousel />
      <CTABanner />
      <FAQPreview />
      <QuranVerse />
    </main>
  );
}
