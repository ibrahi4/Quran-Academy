"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { CalendarCheck, Target, BookOpen, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";

const steps = [
  {
    number: "01",
    icon: CalendarCheck,
    title: "Book a Free Trial",
    description:
      "Schedule a free 30-minute introductory session. No payment, no commitment — just a friendly conversation to understand your goals.",
    color: "bg-primary/10 text-primary",
    borderColor: "border-primary/20",
    dotColor: "bg-primary",
  },
  {
    number: "02",
    icon: Target,
    title: "Get Your Personalized Plan",
    description:
      "After assessing your level and goals, I create a customized learning roadmap designed specifically for you or your child.",
    color: "bg-secondary/10 text-secondary",
    borderColor: "border-secondary/20",
    dotColor: "bg-secondary",
  },
  {
    number: "03",
    icon: BookOpen,
    title: "Start Learning",
    description:
      "Begin your journey with structured, engaging 1-on-1 sessions via Zoom or Google Meet. Learn at your own pace with expert guidance.",
    color: "bg-accent/15 text-accent-400",
    borderColor: "border-accent/20",
    dotColor: "bg-accent",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Track Your Progress",
    description:
      "Receive regular progress reports, assessments, and feedback. Watch yourself grow in confidence and skill with every session.",
    color: "bg-primary/10 text-primary",
    borderColor: "border-primary/20",
    dotColor: "bg-primary",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <Container className="relative z-10">
        <SectionHeader
          title="How It Works"
          subtitle="Getting started is simple. Four easy steps to begin your learning journey."
        />

        <div ref={ref} className="relative max-w-5xl mx-auto">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-[2px] bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20" />

          {/* Steps Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative transition-all duration-700 ${
                  isInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Step Card */}
                <div className={`relative bg-white rounded-2xl p-6 border ${step.borderColor} hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500 group`}>
                  {/* Step Number */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-4xl font-bold text-gray-100 group-hover:text-primary/10 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Connection dot (Desktop) */}
                  <div className={`hidden lg:block absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${step.dotColor} border-4 border-white shadow-md`} />
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className={`text-center mt-12 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <Link href="/book-trial">
              <Button
                size="lg"
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold px-8 shadow-lg shadow-primary/20"
              >
                Get Started — It&apos;s Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              No credit card required • 30-minute free session
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
