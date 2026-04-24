"use client";

import React from "react";
import {
  Award, BookOpen, GraduationCap, Heart, MessageCircle,
  Shield, Users, Globe, ArrowRight, ArrowLeft, Clock, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";

const qualificationIcons = [GraduationCap, Award, BookOpen, MessageCircle, Clock, Globe];
const valueIcons = [Heart, Shield, Users, Star];

export default function AboutPageContent() {
  const t = useTranslations("aboutPage");
  const { isRTL } = useLocale();

  return (
    <main>
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
              <span className="text-white/80 text-sm font-medium">{t("hero.badge")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              {t("hero.title")} <span className="text-accent">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
              {t("hero.subtitle")}
            </p>
          </div>
        </Container>
      </section>

      <section className="section-padding bg-sand-50">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full rounded-3xl bg-primary/10" />
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-sand-100 aspect-[4/5] border border-sand-200/50 shadow-premium">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <span className="text-5xl font-bold text-primary" style={{ fontFamily: "var(--font-arabic, serif)" }}>{"\u0625"}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-1">{t("story.teacherName")}</h4>
                  <p className="text-sm text-gray-500">{t("story.teacherTitle")}</p>
                  <p className="text-xs text-gray-400 italic mt-4">{t("story.photoPlaceholder")}</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-premium-hover p-5 border border-sand-200/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-hero-gradient flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">10+</p>
                    <p className="text-sm text-gray-500">{t("story.yearsTeaching")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SectionHeader title={t("story.title")} centered={false} />
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p className="text-lg">{t("story.paragraphs.0")}</p>
                <p>{t("story.paragraphs.1")}</p>
                <p>{t("story.paragraphs.2")}</p>
                <p>{t("story.paragraphs.3")}</p>
              </div>
              <div className="mt-8 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-primary/80 text-right text-lg leading-loose mb-2" style={{ fontFamily: "var(--font-arabic, serif)" }}>
                  {"\uFD3E"} {"\u062E\u064E\u064A\u0652\u0631\u064F\u0643\u064F\u0645\u0652 \u0645\u064E\u0646\u0652 \u062A\u064E\u0639\u064E\u0644\u0651\u064E\u0645\u064E \u0627\u0644\u0652\u0642\u064F\u0631\u0652\u0622\u0646\u064E \u0648\u064E\u0639\u064E\u0644\u0651\u064E\u0645\u064E\u0647\u064F"} {"\uFD3F"}
                </p>
                <p className="text-sm text-gray-600 italic">
                  &quot;{t("story.hadith")}&quot;
                  <span className="text-gray-500"> {" \u2014 "} {t("story.hadithSource")}</span>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section-padding bg-white">
        <Container>
          <SectionHeader title={t("qualifications.title")} subtitle={t("qualifications.subtitle")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {qualificationIcons.map((Icon, index) => (
              <div key={index} className="group bg-white rounded-2xl p-6 border border-sand-200/50 hover:border-primary/20 hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{t(`qualifications.items.${index}.title`)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(`qualifications.items.${index}.description`)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-padding" style={{ background: "linear-gradient(180deg, #FAFAF7 0%, #F5F0EB 100%)" }}>
        <Container>
          <SectionHeader title={t("values.title")} subtitle={t("values.subtitle")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueIcons.map((Icon, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-premium mx-auto mb-5 flex items-center justify-center group-hover:shadow-premium-hover group-hover:-translate-y-1 transition-all duration-500">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t(`values.items.${index}.title`)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(`values.items.${index}.description`)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-padding bg-white">
        <Container>
          <SectionHeader title={t("timeline.title")} subtitle={t("timeline.subtitle")} />
          <div className="max-w-3xl mx-auto">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{t(`timeline.items.${index}.year`)}</span>
                  </div>
                  {index < 5 && <div className="w-px h-full bg-primary/10 my-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{t(`timeline.items.${index}.title`)}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{t(`timeline.items.${index}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient" />
            <div className="relative z-10 px-8 md:px-16 py-14 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("cta.title")}</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">{t("cta.subtitle")}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/book-trial">
                  <Button size="lg" className="rounded-xl px-10 py-6 text-base font-bold bg-accent hover:bg-accent/90 text-gray-900">
                    {t("cta.bookTrial")}
                    {isRTL ? <ArrowLeft className="w-4 h-4 ms-2" /> : <ArrowRight className="w-4 h-4 ms-2" />}
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 text-base font-semibold border-white/20 text-white hover:bg-white/10">
                    {t("cta.viewServices")}
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