import React from "react";
import HeroSection from "@/components/home/HeroSection";
import TrustBar from "@/components/home/TrustBar";
import ServicesOverview from "@/components/home/ServicesOverview";
import HowItWorks from "@/components/home/HowItWorks";
import WhyChooseMe from "@/components/home/WhyChooseMe";
import FAQPreview from "@/components/home/FAQPreview";
import QuranVerse from "@/components/home/QuranVerse";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <ServicesOverview />
      <HowItWorks />
      <WhyChooseMe />
      <FAQPreview />
      <QuranVerse />
    </main>
  );
}
