"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Clock,
  Video,
  MessageCircle,
  Star,
  Users,
  Send,
  Loader2,
  Sparkles,
  BookOpen,
  Heart,
  Award,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { siteConfig } from "@/config/site";
import { apiPost } from "@/lib/api";

const expectationIcons = [Clock, Video, MessageCircle, CheckCircle2, Star, Users];

const serviceValues = [
  "quran-recitation",
  "tajweed-course",
  "arabic-language",
  "islamic-studies",
  "kids-program",
  "new-muslims",
];

const studentTypeValues = ["self", "child", "family"];

/* ----------------------------- Decorative BG ----------------------------- */

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface FloatingShape {
  size: number;
  top: string;
  left: string;
  duration: number;
  delay: number;
  opacity: number;
  isCircle: boolean;
  rotation: number;
}

function FloatingShapes(): React.ReactElement {
  const shapes: FloatingShape[] = useMemo(() => {
    return Array.from({ length: 25 }, (_, i): FloatingShape => {
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
            width: s.size,
            height: s.size,
            top: s.top,
            left: s.left,
            backgroundColor: "rgba(255, 255, 255, " + s.opacity + ")",
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

interface FloatingIcon {
  Icon: React.ComponentType<{ className?: string }>;
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
}

function FloatingIcons(): React.ReactElement {
  const icons: FloatingIcon[] = useMemo(() => {
    const iconList = [BookOpen, Star, Sparkles, Heart, Moon, Award];
    return Array.from({ length: 8 }, (_, i): FloatingIcon => ({
      Icon: iconList[i % iconList.length],
      top: Math.round(seededRandom(i * 5 + 11) * 9000) / 100 + "%",
      left: Math.round(seededRandom(i * 5 + 12) * 9500) / 100 + "%",
      size: 18 + Math.round(seededRandom(i * 5 + 13) * 20),
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
            style={{
              top: item.top,
              left: item.left,
            }}
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
            <IconComp className={`w-[${item.size}px] h-[${item.size}px]`} />
          </motion.div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function BookTrialPage() {
  const t = useTranslations("bookTrial");

  const [formData, setFormData] = useState({
    name: "", email: "", whatsapp: "", country: "",
    service: "", studentType: "", preferredTime: "", message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      await apiPost("/bookings", {
        name: formData.name,
        email: formData.email,
        phone: formData.whatsapp || undefined,
        country: formData.country || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        serviceSlug: formData.service || undefined,
        preferredTime: formData.preferredTime || undefined,
        type: "TRIAL",
        notes: [
          formData.studentType ? `Student type: ${formData.studentType}` : "",
          formData.message || "",
        ].filter(Boolean).join("\n"),
      });

      setStatus("success");
      setFormData({
        name: "", email: "", whatsapp: "", country: "",
        service: "", studentType: "", preferredTime: "", message: "",
      });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || t("errors.generic"));
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all";

  return (
    <main>
      {/* ============================ HERO SECTION ============================ */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Original gradient kept */}
        <div className="absolute inset-0 bg-hero-gradient" />

        {/* Decorative animated layers */}
        <FloatingShapes />
        <FloatingIcons />

        {/* Soft glow accents */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent z-10" />

        <Container className="relative z-20">
          <div className="text-center max-w-3xl mx-auto">
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
              {t.rich("hero.title", {
                accent: (chunks) => (
                  <span className="text-accent relative inline-block">
                    {chunks}
                    <motion.span
                      className="absolute -top-3 -right-4 text-accent"
                      animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.15, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Sparkles className="w-6 h-6" />
                    </motion.span>
                  </span>
                ),
              })}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto mb-10"
            >
              {t("hero.subtitle")}
            </motion.p>

            {/* Stats / quick info pills */}
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
                  <p className="font-bold text-white text-lg leading-none">30</p>
                  <p className="text-xs font-medium text-white/70 mt-1">
                    {t("hero.stats.minutes")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div className="text-start">
                  <p className="font-bold text-white text-lg leading-none">500+</p>
                  <p className="text-xs font-medium text-white/70 mt-1">
                    {t("hero.stats.students")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-accent" />
                </div>
                <div className="text-start">
                  <p className="font-bold text-white text-lg leading-none">100%</p>
                  <p className="text-xs font-medium text-white/70 mt-1">
                    {t("hero.stats.free")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H0Z"
              className="fill-sand-50"
            />
          </svg>
        </div>
      </section>

      {/* ============================ FORM SECTION ============================ */}
      <section className="section-padding bg-sand-50">
        <Container>
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left column */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t("expectations.title")}
              </h2>
              <div className="space-y-4 mb-8">
                {expectationIcons.map((Icon, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white border border-sand-200/50 hover:shadow-premium transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {t(`expectations.items.${i}`)}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-white border border-sand-200/50 shadow-premium">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  &ldquo;{t("testimonial.quote")}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {t("testimonial.initial")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t("testimonial.name")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("testimonial.location")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-5 rounded-2xl bg-green-50 border border-green-100">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  {t("whatsapp.title")}
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  {t("whatsapp.description")}
                </p>
                <a
                  href={siteConfig.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> {t("whatsapp.button")}
                </a>
              </div>
            </div>

            {/* Right column - Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-6 md:p-10 border border-sand-200/50 shadow-premium">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("form.title")}
                </h2>
                <p className="text-gray-500 mb-8">{t("form.subtitle")}</p>

                {status === "success" ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {t("form.success.title")}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {t("form.success.message")}
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="text-primary font-semibold hover:underline"
                    >
                      {t("form.success.again")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("form.fields.name.label")}
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder={t("form.fields.name.placeholder")}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("form.fields.email.label")}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder={t("form.fields.email.placeholder")}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("form.fields.whatsapp.label")}
                        </label>
                        <input
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleChange}
                          required
                          placeholder={t("form.fields.whatsapp.placeholder")}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("form.fields.country.label")}
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                          placeholder={t("form.fields.country.placeholder")}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("form.fields.service.label")}
                        </label>
                        <select
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          required
                          className={inputClass}
                        >
                          <option value="">
                            {t("form.fields.service.placeholder")}
                          </option>
                          {serviceValues.map((value) => (
                            <option key={value} value={value}>
                              {t(`form.fields.service.options.${value}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("form.fields.studentType.label")}
                        </label>
                        <select
                          name="studentType"
                          value={formData.studentType}
                          onChange={handleChange}
                          required
                          className={inputClass}
                        >
                          <option value="">
                            {t("form.fields.studentType.placeholder")}
                          </option>
                          {studentTypeValues.map((value) => (
                            <option key={value} value={value}>
                              {t(`form.fields.studentType.options.${value}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("form.fields.preferredTime.label")}
                      </label>
                      <input
                        type="text"
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleChange}
                        placeholder={t("form.fields.preferredTime.placeholder")}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("form.fields.message.label")}
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder={t("form.fields.message.placeholder")}
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={status === "loading"}
                      size="lg"
                      className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-6 text-base shadow-lg shadow-primary/20"
                    >
                      {status === "loading" ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          {t("form.submitting")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" /> {t("form.submit")}
                        </span>
                      )}
                    </Button>
                    {status === "error" && (
                      <p className="text-sm text-red-500 text-center">
                        {errorMsg || t("errors.submit")}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 text-center">
                      {t("form.disclaimer")}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}