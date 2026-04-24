"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowRight, ArrowLeft, MessageCircle } from "lucide-react";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";

export default function FAQPreview() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const t = useTranslations("faqPreview");
  const { isRTL } = useLocale();

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

  const faqCount = 6;

  return (
    <section ref={sectionRef} className="section-padding bg-white relative overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left: Header + CTA */}
          <div className="lg:col-span-2">
            <SectionHeader
              title={t("title")}
              subtitle={t("subtitle")}
              centered={false}
            />

            <div className="space-y-4 mt-8">
              <Link href="/faq">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-all duration-300 group">
                  {t("viewAll")}
                  {isRTL ? <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </div>
              </Link>

              <div className="p-5 rounded-2xl bg-sand-50 border border-sand-200/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t("stillHaveQuestions")}</p>
                    <p className="text-xs text-gray-500">{t("hereToHelp")}</p>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  {t("contactDirectly")}
                </Link>
              </div>
            </div>
          </div>

          {/* Right: FAQ Accordion */}
          <div className="lg:col-span-3 space-y-3">
            {Array.from({ length: faqCount }, (_, index) => (
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
                  className={`w-full flex items-center justify-between p-5 md:p-6 ${isRTL ? "text-right" : "text-left"}`}
                >
                  <span
                    className={`font-semibold ${isRTL ? "pl-4" : "pr-4"} transition-colors ${
                      openIndex === index ? "text-primary" : "text-gray-900"
                    }`}
                  >
                    {t(`items.${index}.question`)}
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
                      {t(`items.${index}.answer`)}
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
