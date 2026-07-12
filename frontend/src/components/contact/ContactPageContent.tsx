"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  Globe,
  Users,
  ChevronDown,
  ChevronUp,
  Monitor,
  Languages,
  CreditCard,
  BookOpen,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { siteConfig } from "@/config/site";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";
import api from "@/lib/api/client";
import toast from "react-hot-toast";

/* ─── Constants ─── */
const contactIcons = [Mail, Phone, MapPin, Clock];
const contactKeys = ["email", "whatsapp", "location", "availability"] as const;

const regionIcons = [Globe, Globe, Globe, Globe, Globe, Globe];

/* ─── seeded random for hydration safety ─── */
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

/* ─── FloatingShapes with mounted check ─── */
function FloatingShapes() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const shapes = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
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

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: s.size,
            height: s.size,
            top: s.top,
            left: s.left,
            backgroundColor: `rgba(255, 255, 255, ${s.opacity})`,
            borderRadius: s.isCircle ? "50%" : "4px",
            transform: `rotate(${s.rotation}deg)`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [s.opacity, s.opacity + 0.15, s.opacity],
            rotate: [s.rotation, s.rotation + 25, s.rotation],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── FloatingIcons with mounted check ─── */
function FloatingIcons() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const icons = useMemo(() => {
    const iconList = [
      Mail,
      MessageCircle,
      Sparkles,
      BookOpen,
      Globe,
      Phone,
    ];
    return Array.from({ length: 8 }, (_, i) => ({
      Icon: iconList[i % iconList.length],
      top: Math.round(seededRandom(i * 5 + 11) * 9000) / 100 + "%",
      left: Math.round(seededRandom(i * 5 + 12) * 9500) / 100 + "%",
      duration: 6 + Math.round(seededRandom(i * 5 + 14) * 60) / 10,
      delay: Math.round(seededRandom(i * 5 + 15) * 50) / 10,
    }));
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((item, i) => {
        const IconComp = item.Icon;
        return (
          <motion.div
            key={i}
            className="absolute text-white/20"
            style={{ top: item.top, left: item.left }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 15, -15, 0],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              delay: item.delay,
              ease: "easeInOut",
            }}
          >
            <IconComp className="w-6 h-6" />
          </motion.div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function ContactPageContent() {
  const t = useTranslations("contactPage");
  const { isRTL } = useLocale();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await api.post("/contact", {
        name: formData.name,
        email: formData.email,
        phone: formData.whatsapp || undefined,
        subject: "Contact Form",
        message: formData.message,
      });
      setStatus("success");
      setFormData({ name: "", email: "", whatsapp: "", message: "" });
      toast.success(t("success.title"));
    } catch (err: unknown) {
      setStatus("error");
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(message);
      toast.error(t("form.error"));
    }
  };

  const contactValues = [
    siteConfig.contact.email,
    siteConfig.contact.whatsapp,
    null,
    null,
  ];
  const contactLinks = [
    "mailto:" + siteConfig.contact.email,
    siteConfig.contact.whatsappLink,
    null,
    null,
  ];

  /* FAQ data */
  const faqIcons = [Clock, Monitor, Languages, Users, CreditCard];
  const faqItems = [1, 2, 3, 4, 5].map((n, i) => ({
    icon: faqIcons[i],
    question: t(`faq.q${n}`),
    answer: t(`faq.a${n}`),
  }));

  return (
    <main>
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 bg-hero-gradient" />
        <FloatingShapes />
        <FloatingIcons />

        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent z-10" />

        <Container className="relative z-20">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-2">
                <Image
                  src="/Tajwedo-Public-Assets/logo.png"
                  alt="Tajwedo Academy"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-6 py-3 mb-8"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-white/90 text-sm font-semibold">
                {t("hero.badge")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            >
              {t("hero.title")}
              <span className="text-accent relative inline-block">
                {t("hero.titleHighlight")}
                <motion.span
                  className="absolute -top-3 -right-4 text-accent"
                  animate={{
                    rotate: [0, 20, -20, 0],
                    scale: [1, 1.15, 1],
                  }}
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
              {[
                {
                  icon: Clock,
                  value: "2h",
                  label: t("hero.stats.response"),
                },
                {
                  icon: Globe,
                  value: "25+",
                  label: t("hero.stats.countries"),
                },
                {
                  icon: Users,
                  value: "1000+",
                  label: t("hero.stats.students"),
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-start">
                    <p className="font-bold text-white text-lg leading-none">
                      {stat.value}
                    </p>
                    <p className="text-xs font-medium text-white/70 mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </Container>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H0Z"
              className="fill-sand-50"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════ FORM + INFO ═══════════ */}
      <section className="section-padding bg-sand-50">
        <Container>
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* ── Left: Info ── */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t("info.title")}
              </h2>

              <div className="space-y-4 mb-8">
                {contactIcons.map((Icon, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-sand-200/50 hover:shadow-premium transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {t(`info.${contactKeys[i]}.title`)}
                      </h3>
                      {contactLinks[i] ? (
                        <a
                          href={contactLinks[i]!}
                          target={
                            contactLinks[i]!.startsWith("http")
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            contactLinks[i]!.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="text-primary font-medium text-sm hover:underline"
                        >
                          {contactValues[i]}
                        </a>
                      ) : (
                        <p className="text-gray-700 text-sm font-medium">
                          {t(`info.${contactKeys[i]}.value`)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t(`info.${contactKeys[i]}.description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* About Academy (replaces "follow me") */}
              <div className="p-5 rounded-2xl bg-white border border-sand-200/50">
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src="/Tajwedo-Public-Assets/logo.png"
                    alt="Tajwedo Academy"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                  <h3 className="font-semibold text-gray-900">
                    {t("aboutAcademy")}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t("aboutDescription")}
                </p>
              </div>

              {/* WhatsApp Button */}
              <div className="mt-6">
                <a
                  href={siteConfig.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all shadow-lg shadow-green-500/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t("quickWhatsApp")}
                </a>
              </div>

              {/* Response Times */}
              <div className="mt-6 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {t("responseTimes.title")}
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                      WhatsApp
                    </span>
                    <span className="font-medium text-primary">
                      {t("responseTimes.whatsapp")}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      Email
                    </span>
                    <span className="font-medium text-primary">
                      {t("responseTimes.email")}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-purple-500" />
                      Contact Form
                    </span>
                    <span className="font-medium text-primary">
                      {t("responseTimes.form")}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* ── Right: Form ── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-6 md:p-10 border border-sand-200/50 shadow-premium">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("form.title")}
                </h2>
                <p className="text-gray-500 mb-8">{t("form.subtitle")}</p>

                {status === "success" ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {t("success.title")}
                    </h3>
                    <p className="text-gray-600 mb-2 max-w-md mx-auto">
                      {t("success.message")}
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                      {t("success.checkEmail")}
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-all"
                    >
                      {t("success.sendAnother")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("form.name")}{" "}
                        <span className="text-red-400">
                          {t("form.required")}
                        </span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder={t("form.namePlaceholder")}
                        className="w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("form.email")}{" "}
                          <span className="text-red-400">
                            {t("form.required")}
                          </span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder={t("form.emailPlaceholder")}
                          className="w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("form.whatsappNumber")}{" "}
                          <span className="text-gray-400 font-normal">
                            {t("form.optional")}
                          </span>
                        </label>
                        <input
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleChange}
                          placeholder={t("form.whatsappPlaceholder")}
                          className="w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("form.message")}{" "}
                        <span className="text-red-400">
                          {t("form.required")}
                        </span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder={t("form.messagePlaceholder")}
                        className="w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={status === "loading"}
                      size="lg"
                      className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-6 text-base shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === "loading" ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t("form.sending")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          {t("form.send")}
                        </span>
                      )}
                    </Button>
                    {status === "error" && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
                        <p className="text-sm text-red-600 font-medium">
                          {errorMsg || t("form.error")}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      {t("form.privacy")}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="section-padding bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("faq.title")}
            </h2>
            <p className="text-lg text-gray-600">{t("faq.subtitle")}</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, i) => {
              const FaqIcon = item.icon;
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-primary/20 bg-primary/[0.02] shadow-md"
                      : "border-sand-200/50 bg-white hover:border-primary/10 hover:shadow-sm"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center gap-4 p-5 text-start"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isOpen
                          ? "bg-primary/10 text-primary"
                          : "bg-sand-100 text-gray-400"
                      }`}
                    >
                      <FaqIcon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-sm font-semibold text-gray-900">
                      {item.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5">
                      <div className="h-px bg-sand-200/50 mb-4" />
                      <p className="text-sm text-gray-600 leading-relaxed ps-14">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ═══════════ WORLDWIDE ═══════════ */}
      <section className="section-padding bg-sand-50">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("worldwide.title")}
            </h2>
            <p className="text-lg text-gray-600 mb-10">
              {t("worldwide.subtitle")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {regionIcons.map((Icon, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-sand-200/50 hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {t(`worldwide.regions.${i}`)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              {t("worldwide.more")}
            </p>
          </div>
        </Container>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient" />
            <div className="relative z-10 px-8 md:px-16 py-14 md:py-20 text-center">
              {/* Logo in CTA */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-2">
                  <Image
                    src="/Tajwedo-Public-Assets/logo.png"
                    alt="Tajwedo Academy"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t("cta.title")}
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
                {t("cta.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/book-trial"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-gray-900 shadow-2xl transition-all duration-300 hover:shadow-amber-900/30"
                  style={{
                    background:
                      "linear-gradient(135deg, #C8A96E 0%, #d4a94a 100%)",
                  }}
                >
                  {t("cta.bookTrial")}
                  <ArrowRight
                    className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`}
                  />
                </Link>
                <a
                  href={siteConfig.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/15 transition-all duration-300"
                >
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