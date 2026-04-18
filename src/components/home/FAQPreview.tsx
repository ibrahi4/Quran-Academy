"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, MessageCircle } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";

const faqs = [
  {
    question: "Do I need any prior knowledge to start?",
    answer: "Not at all! I welcome complete beginners. Whether you have never read Arabic or are looking to improve existing skills, I will create a personalized plan that starts exactly where you are.",
  },
  {
    question: "How do the online lessons work?",
    answer: "Lessons are conducted via Zoom or Google Meet. All you need is a stable internet connection and a device with a camera and microphone. I share my screen and use interactive tools to make learning engaging and effective.",
  },
  {
    question: "What ages do you teach?",
    answer: "I teach students of all ages — from children as young as 5 to adults of any age. I have specialized methods for kids that make learning fun and engaging, and structured approaches for adults.",
  },
  {
    question: "What is included in the free trial?",
    answer: "The free trial is a 30-minute session where we assess your current level, discuss your goals, and I create a suggested learning plan for you. It is completely free with no obligation to continue.",
  },
  {
    question: "Can I reschedule a lesson?",
    answer: "Yes! I understand that life can be busy. You can reschedule with at least 24 hours notice at no extra charge. I am flexible with scheduling across different time zones.",
  },
  {
    question: "Do you provide learning materials?",
    answer: "Yes! I provide all necessary digital materials, worksheets, and resources for every lesson. You do not need to purchase any textbooks to get started.",
  },
];

export default function FAQPreview() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLDivElement>(null);
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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-white relative overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left: Header + CTA */}
          <div className="lg:col-span-2">
            <SectionHeader
              title="Frequently Asked Questions"
              subtitle="Everything you need to know before getting started with your learning journey."
              centered={false}
            />

            <div className="space-y-4 mt-8">
              <Link href="/faq">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-all duration-300 group">
                  View All FAQs
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <div className="p-5 rounded-2xl bg-sand-50 border border-sand-200/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Still have questions?</p>
                    <p className="text-xs text-gray-500">I am here to help</p>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Contact me directly →
                </Link>
              </div>
            </div>
          </div>

          {/* Right: FAQ Accordion */}
          <div className="lg:col-span-3 space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-2xl border overflow-hidden transition-all duration-500 ${
                  openIndex === index
                    ? "border-primary/20 bg-white shadow-premium"
                    : "border-sand-200/50 bg-white hover:border-primary/10"
                } ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                >
                  <span
                    className={`font-semibold pr-4 transition-colors ${
                      openIndex === index ? "text-primary" : "text-gray-900"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      openIndex === index
                        ? "bg-primary text-white rotate-180"
                        : "bg-sand-100 text-gray-500"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <div className="h-px bg-sand-200/50 mb-4" />
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
