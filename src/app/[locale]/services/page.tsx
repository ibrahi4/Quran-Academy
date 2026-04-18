import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Mic, Languages, GraduationCap, Baby, Heart, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore our Quran, Arabic, Tajweed, and Islamic Studies programs for kids, adults, and new Muslims.",
};

const iconMap: Record<string, React.ElementType> = { BookOpen, Mic, Languages, GraduationCap, Baby, Heart };

const services = [
  {
    slug: "quran-recitation", icon: "BookOpen", title: "Quran Recitation and Memorization",
    description: "Master beautiful Quran recitation and build a strong Hifz journey with expert guidance and proven memorization techniques.",
    features: ["Learn to read Quran from scratch", "Memorization (Hifz) with proven techniques", "Beautiful recitation with proper melody", "Regular revision sessions", "Personalized memorization schedule", "Daily practice guidance"],
    bestFor: "Beginners to advanced — anyone wanting to read or memorize Quran", color: "primary",
  },
  {
    slug: "tajweed", icon: "Mic", title: "Tajweed Mastery",
    description: "Perfect your Quran pronunciation with detailed Tajweed rules explained clearly in English. From basic to advanced levels.",
    features: ["Complete Tajweed rules in English", "Makharij al-Huroof (articulation points)", "Sifaat al-Huroof (letter characteristics)", "Practical application on Quran verses", "Common mistakes correction", "Preparation for Ijazah"],
    bestFor: "Those who can read Quran but want perfect pronunciation", color: "secondary",
  },
  {
    slug: "arabic-language", icon: "Languages", title: "Arabic Language",
    description: "From alphabet to fluency. Learn Arabic reading, writing, grammar, and Quranic understanding in a structured way.",
    features: ["Arabic alphabet and reading skills", "Grammar (Nahw) fundamentals", "Morphology (Sarf) basics", "Vocabulary building", "Quranic Arabic understanding", "Conversational Arabic basics"],
    bestFor: "Complete beginners to intermediate learners", color: "accent",
  },
  {
    slug: "islamic-studies", icon: "GraduationCap", title: "Islamic Studies",
    description: "Understand your faith deeply through authentic, engaging Islamic education covering all essential topics.",
    features: ["Core beliefs (Aqeedah)", "Practical worship guidance (Fiqh)", "Prophet Muhammad life (Seerah)", "Quran explanation (Tafseer basics)", "Islamic ethics and character", "Daily life as a Muslim"],
    bestFor: "Anyone wanting deeper understanding of Islam", color: "primary",
  },
  {
    slug: "kids-program", icon: "Baby", title: "Kids and Teens Program",
    description: "Fun, interactive, and age-appropriate lessons designed specially for young learners aged 5-17.",
    features: ["Age-appropriate teaching methods", "Interactive and engaging sessions", "Quran reading and memorization for kids", "Arabic basics for young learners", "Islamic values and stories", "Regular progress reports for parents"],
    bestFor: "Children ages 5-12 and teenagers 13-17", color: "secondary",
  },
  {
    slug: "new-muslims", icon: "Heart", title: "New Muslims / Reverts Program",
    description: "A warm, supportive introduction to Islam, Quran, and prayer designed specifically for those new to the faith.",
    features: ["Basics of Islamic faith and beliefs", "How to pray step by step", "Introduction to Quran reading", "Essential Arabic words and phrases", "Safe space for all questions", "No judgment — complete support"],
    bestFor: "New Muslims, reverts, and those curious about Islam", color: "accent",
  },
];

const colorStyles: Record<string, { bg: string; border: string }> = {
  primary: { bg: "bg-primary/5", border: "border-primary/15" },
  secondary: { bg: "bg-secondary/5", border: "border-secondary/15" },
  accent: { bg: "bg-accent/10", border: "border-accent/20" },
};

export default function ServicesPage() {
  return (
    <main>
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
              <span className="text-white/80 text-sm font-medium">Our Programs</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Programs Designed for <span className="text-accent">Your Success</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
              Whether you are a beginner, a parent, or a new Muslim — we have the perfect program tailored for your needs.
            </p>
          </div>
        </Container>
      </section>

      <section className="section-padding bg-sand-50">
        <Container>
          <div className="space-y-8">
            {services.map((service) => {
              const IconComp = iconMap[service.icon];
              const colors = colorStyles[service.color];
              return (
                <div key={service.slug} className={`bg-white rounded-3xl p-6 md:p-10 border ${colors.border} hover:shadow-premium-hover transition-all duration-500`}>
                  <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                      <div className="flex items-start gap-4 mb-5">
                        <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                          {IconComp && <IconComp className="w-6 h-6 text-primary" />}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h2>
                          <p className="text-gray-600 leading-relaxed">{service.description}</p>
                        </div>
                      </div>
                      <div className="mt-6 p-4 rounded-xl bg-sand-50 border border-sand-200/50">
                        <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">Best for: </span>{service.bestFor}</p>
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">What You Will Learn</h3>
                      <ul className="space-y-3">
                        {service.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        <Link href="/book-trial">
                          <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20">
                            Book Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Not Sure Which Program?</h2>
            <p className="text-lg text-gray-600 mb-8">Book a free trial and I will help you find the perfect program.</p>
            <Link href="/book-trial">
              <Button size="lg" className="rounded-xl px-10 py-6 text-base font-bold bg-accent hover:bg-accent/90 text-gray-900">
                Book Free Consultation <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
