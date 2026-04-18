
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Award, BookOpen, GraduationCap, Heart, MessageCircle,
  Shield, Users, Globe, CheckCircle2, ArrowRight, Clock, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";

export const metadata: Metadata = {
  title: "About Ibrahim Abdelnasser",
  description: "Learn about Ibrahim Abdelnasser - a certified Quran, Arabic, Tajweed, and Islamic Studies teacher with 10+ years of experience.",
};

const milestones = [
  { year: "2014", title: "Started Teaching Journey", description: "Began teaching Quran and Arabic to local students while completing Islamic studies education." },
  { year: "2016", title: "Obtained Ijazah", description: "Received Ijazah certification in Quran recitation with a complete chain of narration." },
  { year: "2018", title: "Went Global", description: "Started teaching international students online, reaching learners in the USA, UK, and Europe." },
  { year: "2020", title: "500+ Students Milestone", description: "Reached the milestone of teaching over 500 students from more than 15 countries worldwide." },
  { year: "2023", title: "Expanded Programs", description: "Launched specialized programs for kids, new Muslims, and family packages." },
  { year: "2025", title: "Continuing the Mission", description: "Continuing to grow and help more students connect with the Quran and Arabic language." },
];

const qualifications = [
  { icon: GraduationCap, title: "Islamic Education", description: "Formal education in Islamic Sciences and Quranic Studies from Al-Azhar tradition." },
  { icon: Award, title: "Ijazah Certified", description: "Certified Ijazah in Quran recitation with an authentic chain of narration (Sanad)." },
  { icon: BookOpen, title: "Tajweed Expertise", description: "Deep expertise in all Tajweed rules with years of practical teaching experience." },
  { icon: MessageCircle, title: "Fluent English", description: "Professional-level English communication for effective teaching of non-Arabic speakers." },
  { icon: Clock, title: "10+ Years Experience", description: "Over a decade of dedicated teaching experience with students of all ages and levels." },
  { icon: Globe, title: "15+ Countries", description: "Experience teaching students from diverse cultural backgrounds across multiple continents." },
];

const values = [
  { icon: Heart, title: "Patience", description: "Every student learns at their own pace. I never rush — I guide with calm encouragement." },
  { icon: Shield, title: "Authenticity", description: "All teachings are rooted in authentic Islamic scholarship and traditional methodology." },
  { icon: Users, title: "Personalization", description: "No two students are the same. Every curriculum is tailored to individual needs and goals." },
  { icon: Star, title: "Excellence", description: "I am committed to delivering the highest quality education in every single session." },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="about-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,8 46,26 64,20 50,34 64,48 46,42 40,60 34,42 16,48 30,34 16,20 34,26" fill="none" stroke="white" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#about-pattern)" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
              <span className="text-white/80 text-sm font-medium">About Your Teacher</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Meet <span className="text-accent">Ibrahim Abdelnasser</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
              A passionate, certified Quran and Arabic teacher dedicated to helping students worldwide connect with the beauty of Islamic knowledge.
            </p>
          </div>
        </Container>
      </section>

      {/* My Story */}
      <section className="section-padding bg-sand-50">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full rounded-3xl bg-primary/10" />
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-sand-100 aspect-[4/5] border border-sand-200/50 shadow-premium">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <span className="text-5xl font-bold text-primary" style={{ fontFamily: "var(--font-arabic, serif)" }}>إ</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-1">Ibrahim Abdelnasser</h4>
                  <p className="text-sm text-gray-500">Quran, Arabic and Islamic Studies Teacher</p>
                  <p className="text-xs text-gray-400 italic mt-4">Replace with professional photo</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-premium-hover p-5 border border-sand-200/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-hero-gradient flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">10+</p>
                    <p className="text-sm text-gray-500">Years Teaching</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SectionHeader title="My Story" centered={false} />
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  Assalamu Alaikum! I am Ibrahim Abdelnasser, and I am deeply passionate about helping people around the world connect with the Holy Quran and the Arabic language.
                </p>
                <p>
                  My journey began over a decade ago when I realized that millions of Muslims worldwide struggle to read and understand the Quran simply because they do not speak Arabic. This inspired me to dedicate my life to bridging this gap through patient, personalized, and professional online education.
                </p>
                <p>
                  Having studied in the Al-Azhar tradition and obtained my Ijazah in Quran recitation, I combine traditional Islamic scholarship with modern teaching techniques. I teach in clear, fluent English, making complex concepts accessible to everyone regardless of their background.
                </p>
                <p>
                  Over the years, I have had the honor of teaching more than 500 students from over 15 countries. Each student has a unique story, and I consider it a privilege to be part of their learning journey.
                </p>
              </div>
              <div className="mt-8 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-primary/80 text-right text-lg leading-loose mb-2" style={{ fontFamily: "var(--font-arabic, serif)" }}>
                  ﴿ خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ ﴾
                </p>
                <p className="text-sm text-gray-600 italic">
                  &quot;The best of you are those who learn the Quran and teach it.&quot;
                  <span className="text-gray-500"> — Prophet Muhammad (Sahih Bukhari)</span>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Qualifications */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader title="Qualifications and Expertise" subtitle="The knowledge, certifications, and experience behind every lesson." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {qualifications.map((qual, index) => (
              <div key={index} className="group bg-white rounded-2xl p-6 border border-sand-200/50 hover:border-primary/20 hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300">
                  <qual.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{qual.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{qual.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Teaching Values */}
      <section className="section-padding" style={{ background: "linear-gradient(180deg, #FAFAF7 0%, #F5F0EB 100%)" }}>
        <Container>
          <SectionHeader title="My Teaching Philosophy" subtitle="The core values and principles that guide every lesson I teach." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-premium mx-auto mb-5 flex items-center justify-center group-hover:shadow-premium-hover group-hover:-translate-y-1 transition-all duration-500">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-white">
        <Container>
          <SectionHeader title="My Journey" subtitle="Key milestones in my teaching career." />
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{milestone.year}</span>
                  </div>
                  {index < milestones.length - 1 && <div className="w-px h-full bg-primary/10 my-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{milestone.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient" />
            <div className="relative z-10 px-8 md:px-16 py-14 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Learning?</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">Book a free trial lesson and let us create a personalized plan for your goals.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/book-trial">
                  <Button size="lg" className="rounded-xl px-10 py-6 text-base font-bold bg-accent hover:bg-accent/90 text-gray-900">
                    Book Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 text-base font-semibold border-white/20 text-white hover:bg-white/10">
                    View Services
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
