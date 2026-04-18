"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Play, ArrowRight, BookOpen, Users, Globe, Star, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";

const rotatingWords = ["Quran Recitation", "Tajweed Mastery", "Arabic Language", "Islamic Studies"];

export default function HeroSection() {
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      {/* Islamic Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <polygon points="50,10 58,30 78,25 63,40 78,55 58,50 50,70 42,50 22,55 37,40 22,25 42,30" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sand-50 to-transparent" />

      {/* Content */}
      <Container className="relative z-10 pt-28 pb-20 md:pt-32 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="text-white/90 text-sm font-medium">
                Now accepting new students for 2025
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Learn{" "}
              <span className="text-accent">{rotatingWords[currentWord]}</span>
              <br />
              <span className="text-white/95">with a Trusted Teacher</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-xl mb-8">
              Personalized 1-on-1 online lessons for kids, adults, and new Muslims.
              Taught with patience, passion, and over a decade of professional experience.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/book-trial">
                <Button
                  size="lg"
                  className="rounded-xl px-8 py-6 text-base font-bold shadow-2xl bg-accent hover:bg-accent/90 text-gray-900"
                >
                  Book Your Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <button className="group flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-white/90 font-semibold border border-white/15 hover:bg-white/10 transition-all duration-300">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </span>
                Watch Introduction
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4">
              {[
                { text: "Certified Teacher", icon: CheckCircle2 },
                { text: "1-on-1 Lessons", icon: Users },
                { text: "All Levels Welcome", icon: Sparkles },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <badge.icon className="w-4 h-4 text-green-400/80" />
                  <span className="text-sm text-white/60 font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Teacher Card */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Main Card */}
              <div className="relative w-[420px] h-[480px] rounded-3xl overflow-hidden shadow-2xl shadow-black/30 border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-secondary flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-6">
                    <BookOpen className="w-12 h-12 text-white/80" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">Ibrahim Abdelnasser</h3>
                  <p className="text-white/60 text-sm font-medium mb-6">Quran, Arabic & Islamic Studies</p>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">500+</p>
                      <p className="text-xs text-white/50">Students</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">10+</p>
                      <p className="text-xs text-white/50">Years</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">15+</p>
                      <p className="text-xs text-white/50">Countries</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating: Rating */}
              <div className="absolute -top-4 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900">4.9</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">500+ Reviews</p>
              </div>

              {/* Floating: Live */}
              <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Live 1-on-1 Lessons</p>
                    <p className="text-xs text-gray-500">via Zoom & Google Meet</p>
                  </div>
                </div>
              </div>

              {/* Floating: Globe */}
              <div className="absolute top-1/2 -left-16 bg-white rounded-2xl shadow-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Worldwide</p>
                    <p className="text-[10px] text-gray-500">USA, UK, EU +</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
