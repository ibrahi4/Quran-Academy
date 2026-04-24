"use client";

import React from "react";
import { BookOpen, Mic, Languages, GraduationCap, Baby, Heart, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";

const serviceIcons = [BookOpen, Mic, Languages, GraduationCap, Baby, Heart];
const serviceSlugs = ["quran-recitation", "tajweed", "arabic-language", "islamic-studies", "kids-program", "new-muslims"];
const serviceColorKeys = ["primary", "secondary", "accent", "primary", "secondary", "accent"];

const colorStyles: Record<string, { bg: string; border: string }> = {
  primary: { bg: "bg-primary/5", border: "border-primary/15" },
  secondary: { bg: "bg-secondary/5", border: "border-secondary/15" },
  accent: { bg: "bg-accent/10", border: "border-accent/20" },
};

export default function ServicesPageContent() {
  const t = useTranslations("servicesPage");
  const { isRTL } = useLocale();

  return (
    <main>
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
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
          <div className="space-y-8">
            {serviceSlugs.map((slug, index) => {
              const IconComp = serviceIcons[index];
              const colors = colorStyles[serviceColorKeys[index]];
              return (
                <div key={slug} className={`bg-white rounded-3xl p-6 md:p-10 border ${colors.border} hover:shadow-premium-hover transition-all duration-500`}>
                  <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                      <div className="flex items-start gap-4 mb-5">
                        <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                          <IconComp className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t(`services.${index}.title`)}</h2>
                          <p className="text-gray-600 leading-relaxed">{t(`services.${index}.description`)}</p>
                        </div>
                      </div>
                      <div className="mt-6 p-4 rounded-xl bg-sand-50 border border-sand-200/50">
                        <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">{t("bestFor")} </span>{t(`services.${index}.bestFor`)}</p>
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t("whatYouLearn")}</h3>
                      <ul className="space-y-3">
                        {[0, 1, 2, 3, 4, 5].map((fi) => (
                          <li key={fi} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{t(`services.${index}.features.${fi}`)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        <Link href="/book-trial">
                          <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20">
                            {t("bookTrial")}
                            {isRTL ? <ArrowLeft className="w-4 h-4 ms-2" /> : <ArrowRight className="w-4 h-4 ms-2" />}
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("cta.title")}</h2>
            <p className="text-lg text-gray-600 mb-8">{t("cta.subtitle")}</p>
            <Link href="/book-trial">
              <Button size="lg" className="rounded-xl px-10 py-6 text-base font-bold bg-accent hover:bg-accent/90 text-gray-900">
                {t("cta.button")}
                {isRTL ? <ArrowLeft className="w-4 h-4 ms-2" /> : <ArrowRight className="w-4 h-4 ms-2" />}
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}