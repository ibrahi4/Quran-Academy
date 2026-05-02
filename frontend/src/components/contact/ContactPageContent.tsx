"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Clock, MessageCircle, Send, Loader2, CheckCircle2,
  Sparkles, Star, Heart, Moon, Globe, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { siteConfig } from "@/config/site";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";
import { apiPost } from "@/lib/api";

const contactIcons = [Mail, Phone, MapPin, Clock];
const contactKeys = ["email", "whatsapp", "location", "availability"];

const countryFlags = [
  "\uD83C\uDDFA\uD83C\uDDF8", "\uD83C\uDDEC\uD83C\uDDE7", "\uD83C\uDDE8\uD83C\uDDE6",
  "\uD83C\uDDE9\uD83C\uDDEA", "\uD83C\uDDF3\uD83C\uDDF1", "\uD83C\uDDE6\uD83C\uDDFA",
  "\uD83C\uDDEB\uD83C\uDDF7", "\uD83C\uDDF8\uD83C\uDDEA", "\uD83C\uDDF3\uD83C\uDDF4",
  "\uD83C\uDDE7\uD83C\uDDEA", "\uD83C\uDDEE\uD83C\uDDEA", "\uD83C\uDDE6\uD83C\uDDF9",
];

/* ----------------------------- Decorative BG ----------------------------- */
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function FloatingShapes() {
  const shapes = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => {
      const isCircle = seededRandom(i * 9 + 3) > 0.5;
      return {
        size: Math.round((6 + seededRandom(i * 9 + 1) * 14) * 100) / 100,
        top: Math.round(seededRandom(i * 9 + 2) * 10000) / 100 + "%",
        left: Math.round(seededRandom(i * 9 + 4) * 10000) / 100 + "%",
        duration: Math.round((5 + seededRandom(i * 9 + 5) * 7) * 10) / 10,
        delay: Math.round(seededRandom(i * 9 + 6) * 40) / 10,
        opacity: 0.15 + seededRandom(i * 9 + 7) * 0.25,
        isCircle,
        rotation: Math.round(seededRandom(i * 9 + 8) * 360),
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: s.size, height: s.size, top: s.top, left: s.left,
            backgroundColor: `rgba(255, 255, 255, ${s.opacity})`,
            borderRadius: s.isCircle ? "50%" : "4px",
            transform: `rotate(${s.rotation}deg)`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [s.opacity, s.opacity + 0.15, s.opacity],
            rotate: [s.rotation, s.rotation + 25, s.rotation],
          }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function FloatingIcons() {
  const icons = useMemo(() => {
    const iconList = [Mail, MessageCircle, Sparkles, Heart, Moon, Star, Phone, Globe];
    return Array.from({ length: 10 }, (_, i) => ({
      Icon: iconList[i % iconList.length],
      top: Math.round(seededRandom(i * 5 + 11) * 9000) / 100 + "%",
      left: Math.round(seededRandom(i * 5 + 12) * 9500) / 100 + "%",
      duration: 6 + Math.round(seededRandom(i * 5 + 14) * 60) / 10,
      delay: Math.round(seededRandom(i * 5 + 15) * 50) / 10,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((item, i) => {
        const IconComp = item.Icon;
        return (
          <motion.div
            key={i}
            className="absolute text-white/20"
            style={{ top: item.top, left: item.left }}
            animate={{ y: [0, -30, 0], rotate: [0, 15, -15, 0], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: item.duration, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
          >
            <IconComp className="w-6 h-6" />
          </motion.div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */
export default function ContactPageContent() {
  const t = useTranslations("contactPage");
  const { isRTL } = useLocale();

  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await apiPost("/contact", {
        name: formData.name,
        email: formData.email,
        phone: formData.whatsapp || undefined,
        subject: "Contact Form",
        message: formData.message,
      });
      setStatus("success");
      setFormData({ name: "", email: "", whatsapp: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong");
    }
  };

  const contactValues = [siteConfig.contact.email, siteConfig.contact.whatsapp, null, null];
  const contactLinks = ["mailto:" + siteConfig.contact.email, siteConfig.contact.whatsappLink, null, null];

  return (
    <main>
      {/* ============================ HERO SECTION ============================ */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 bg-hero-gradient" />
        <FloatingShapes />
        <FloatingIcons />

        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent z-10" />

        <Container className="relative z-20">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-6 py-3 mb-8"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-white/90 text-sm font-semibold">{t("hero.badge")}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            >
              {t("hero.title")}{" "}
              <span className="text-accent relative inline-block">
                {t("hero.titleHighlight")}
                <motion.span
                  className="absolute -top-3 -right-4 text-accent"
                  animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto mb-10"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
            >
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div className="text-start">
                  <p className="font-bold text-white text-lg leading-none">24h</p>
                  <p className="text-xs font-medium text-white/70 mt-1">{t("hero.stats.response")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div className="text-start">
                  <p className="font-bold text-white text-lg leading-none">25+</p>
                  <p className="text-xs font-medium text-white/70 mt-1">{t("hero.stats.countries")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div className="text-start">
                  <p className="font-bold text-white text-lg leading-none">500+</p>
                  <p className="text-xs font-medium text-white/70 mt-1">{t("hero.stats.students")}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H0Z"
              className="fill-sand-50"
            />
          </svg>
        </div>
      </section>

      {/* ============================ FORM + INFO (unchanged) ============================ */}
      <section className="section-padding bg-sand-50">
        <Container>
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("info.title")}</h2>
              <div className="space-y-4 mb-8">
                {contactIcons.map((Icon, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-sand-200/50 hover:shadow-premium transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{t(`info.${contactKeys[i]}.title`)}</h3>
                      {contactLinks[i] ? (
                        <a href={contactLinks[i]!} target={contactLinks[i]!.startsWith("http") ? "_blank" : undefined} rel={contactLinks[i]!.startsWith("http") ? "noopener noreferrer" : undefined} className="text-primary font-medium text-sm hover:underline">
                          {contactValues[i]}
                        </a>
                      ) : (
                        <p className="text-gray-700 text-sm font-medium">{t(`info.${contactKeys[i]}.value`)}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">{t(`info.${contactKeys[i]}.description`)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-white border border-sand-200/50">
                <h3 className="font-semibold text-gray-900 mb-3">{t("followMe")}</h3>
              </div>

              <div className="mt-6">
                <a href={siteConfig.contact.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all shadow-lg shadow-green-500/20">
                  <MessageCircle className="w-5 h-5" />
                  {t("quickWhatsApp")}
                </a>
              </div>

              <div className="mt-6 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {t("responseTimes.title")}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center justify-between">
                    <span>WhatsApp</span>
                    <span className="font-medium text-primary">{t("responseTimes.whatsapp")}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Email</span>
                    <span className="font-medium text-primary">{t("responseTimes.email")}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Contact Form</span>
                    <span className="font-medium text-primary">{t("responseTimes.form")}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-6 md:p-10 border border-sand-200/50 shadow-premium">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("form.title")}</h2>
                <p className="text-gray-500 mb-8">{t("form.subtitle")}</p>

                {status === "success" ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{t("success.title")}</h3>
                    <p className="text-gray-600 mb-2 max-w-md mx-auto">{t("success.message")}</p>
                    <p className="text-sm text-gray-500 mb-8">{t("success.checkEmail")}</p>
                    <button onClick={() => setStatus("idle")} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-all">
                      {t("success.sendAnother")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("form.name")} <span className="text-red-400">{t("form.required")}</span>
                      </label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder={t("form.namePlaceholder")} className="w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("form.email")} <span className="text-red-400">{t("form.required")}</span>
                        </label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder={t("form.emailPlaceholder")} className="w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("form.whatsappNumber")} <span className="text-gray-400 font-normal">{t("form.optional")}</span>
                        </label>
                        <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder={t("form.whatsappPlaceholder")} className="w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("form.message")} <span className="text-red-400">{t("form.required")}</span>
                      </label>
                      <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} placeholder={t("form.messagePlaceholder")} className="w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none" />
                    </div>
                    <Button type="submit" disabled={status === "loading"} size="lg" className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-6 text-base shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                      {status === "loading" ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t("form.sending")}</span>
                      ) : (
                        <span className="flex items-center gap-2"><Send className="w-4 h-4" />{t("form.send")}</span>
                      )}
                    </Button>
                    {status === "error" && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
                        <p className="text-sm text-red-600 font-medium">{errorMsg || t("form.error")}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 text-center">{t("form.privacy")}</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================ WORLDWIDE (unchanged) ============================ */}
      <section className="section-padding bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("worldwide.title")}</h2>
            <p className="text-lg text-gray-600 mb-10">{t("worldwide.subtitle")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {countryFlags.map((flag, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-sand-50 border border-sand-200/50 hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300">
                  <span className="text-3xl">{flag}</span>
                  <span className="text-xs font-medium text-gray-600">{t(`worldwide.countries.${i}`)}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">{t("worldwide.more")}</p>
          </div>
        </Container>
      </section>

      {/* ============================ CTA (unchanged) ============================ */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient" />
            <div className="relative z-10 px-8 md:px-16 py-14 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("cta.title")}</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">{t("cta.subtitle")}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/book-trial" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-gray-900 shadow-2xl transition-all duration-300 hover:shadow-amber-900/30" style={{ background: "linear-gradient(135deg, #C8A96E 0%, #d4a94a 100%)" }}>
                  {t("cta.bookTrial")}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M7 8l-4 4m0 0l4 4m-4-4h18" : "M17 8l4 4m0 0l-4 4m4-4H3"} />
                  </svg>
                </Link>
                <a href={siteConfig.contact.whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/15 transition-all duration-300">
                  <MessageCircle className="w-4 h-4" />
                  {t("cta.whatsappChat")}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}