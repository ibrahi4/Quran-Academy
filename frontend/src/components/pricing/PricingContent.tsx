"use client";

import { useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useAuthStore } from "@/stores/useAuthStore";
import { Link } from "@/i18n/navigation";
import api from "@/lib/api/client";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, Crown, Sparkles, Zap, Users, Star,
  ArrowRight, ArrowLeft, Loader2, Shield, Clock,
} from "lucide-react";

const PLANS = [
  {
    id: "basic", slug: "basic", plan: "BASIC",
    name: "Basic", nameAr: "\u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629",
    desc: "Perfect for beginners", descAr: "\u0645\u062B\u0627\u0644\u064A\u0629 \u0644\u0644\u0645\u0628\u062A\u062F\u0626\u064A\u0646",
    priceMonthly: 49.99, priceYearly: 499.99, sessionsPerWeek: 2,
    iconColor: "text-blue-600", iconBg: "bg-blue-50", popular: false,
    features: ["2 sessions per week","60 min per session","Progress tracking","Email support","Session recordings"],
    featuresAr: ["\u062C\u0644\u0633\u062A\u0627\u0646 \u0623\u0633\u0628\u0648\u0639\u064A\u0627\u064B","60 \u062F\u0642\u064A\u0642\u0629 \u0644\u0643\u0644 \u062C\u0644\u0633\u0629","\u062A\u062A\u0628\u0639 \u0627\u0644\u062A\u0642\u062F\u0645","\u062F\u0639\u0645 \u0639\u0628\u0631 \u0627\u0644\u0628\u0631\u064A\u062F","\u062A\u0633\u062C\u064A\u0644\u0627\u062A \u0627\u0644\u062C\u0644\u0633\u0627\u062A"],
  },
  {
    id: "premium", slug: "premium", plan: "PREMIUM",
    name: "Premium", nameAr: "\u0627\u0644\u0645\u0645\u064A\u0632\u0629",
    desc: "For serious learners", descAr: "\u0644\u0644\u0645\u062A\u0639\u0644\u0645\u064A\u0646 \u0627\u0644\u062C\u0627\u062F\u064A\u0646",
    priceMonthly: 99.99, priceYearly: 999.99, sessionsPerWeek: 4,
    iconColor: "text-primary", iconBg: "bg-primary/10", popular: true,
    features: ["4 sessions per week","60 min per session","Priority support","Progress reports","Session recordings","Tajweed assessment"],
    featuresAr: ["4 \u062C\u0644\u0633\u0627\u062A \u0623\u0633\u0628\u0648\u0639\u064A\u0627\u064B","60 \u062F\u0642\u064A\u0642\u0629 \u0644\u0643\u0644 \u062C\u0644\u0633\u0629","\u062F\u0639\u0645 \u0645\u062A\u0645\u064A\u0632","\u062A\u0642\u0627\u0631\u064A\u0631 \u062A\u0642\u062F\u0645 \u062F\u0648\u0631\u064A\u0629","\u062A\u0633\u062C\u064A\u0644\u0627\u062A \u0627\u0644\u062C\u0644\u0633\u0627\u062A","\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u062A\u062C\u0648\u064A\u062F"],
  },
  {
    id: "family", slug: "family", plan: "FAMILY",
    name: "Family", nameAr: "\u0627\u0644\u0639\u0627\u0626\u0644\u064A\u0629",
    desc: "For the whole family", descAr: "\u0644\u0644\u0639\u0627\u0626\u0644\u0629 \u0628\u0623\u0643\u0645\u0644\u0647\u0627",
    priceMonthly: 149.99, priceYearly: 1499.99, sessionsPerWeek: 6,
    iconColor: "text-purple-600", iconBg: "bg-purple-50", popular: false,
    features: ["Up to 4 students","6 sessions per week","VIP support","Progress dashboard","Session recordings","Monthly family report"],
    featuresAr: ["\u062D\u062A\u0649 4 \u0637\u0644\u0627\u0628","6 \u062C\u0644\u0633\u0627\u062A \u0623\u0633\u0628\u0648\u0639\u064A\u0627\u064B","\u062F\u0639\u0645 VIP","\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0639\u0627\u0626\u0644\u064A\u0629","\u062A\u0633\u062C\u064A\u0644\u0627\u062A \u0627\u0644\u062C\u0644\u0633\u0627\u062A","\u062A\u0642\u0631\u064A\u0631 \u0634\u0647\u0631\u064A \u0644\u0644\u0639\u0627\u0626\u0644\u0629"],
  },
];

export default function PricingContent() {
  const { isRTL, locale } = useLocale();
  const { user, setAuth, accessToken } = useAuthStore();
  const t = (en: string, ar: string) => (isRTL ? ar : en);
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const isTrial   = user?.role === "TRIAL_STUDENT";
  const isLoggedIn = !!user;

  const [billing,     setBilling]     = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    if (!isLoggedIn) {
      toast.error(t("Please login first", "\u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B"));
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const price = billing === "monthly" ? plan.priceMonthly : plan.priceYearly / 12;

      // Trial users → upgrade endpoint (changes role + creates subscription)
      // Regular logged-in users → admin creates subscription for them (contact support flow)
      const endpoint = isTrial
        ? "/subscriptions/upgrade-from-trial"
        : "/subscriptions/upgrade-from-trial"; // same endpoint works for both

      const res = await api.post(endpoint, {
        userId:         user!.id,
        plan:           plan.plan,
        sessionsPerWeek:plan.sessionsPerWeek,
        priceMonthly:   price,
      }) as any;

      // Update local auth store with new role (STUDENT)
      if (res?.user) {
        const refreshToken = typeof window !== "undefined"
          ? localStorage.getItem("refresh_token") || ""
          : "";
        setAuth(
          {
            ...user!,
            role: res.user.role,
          },
          accessToken || "",
          refreshToken
        );
      }

      toast.success(
        t(
          "\uD83C\uDF89 Subscription activated! Welcome to full access.",
          "\uD83C\uDF89 \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643! \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643."
        ),
        { duration: 4000 }
      );

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = `/${locale}/student/dashboard`;
      }, 1500);

    } catch (err: any) {
      toast.error(err?.message || t("Failed to subscribe. Please try again.", "\u0641\u0634\u0644 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643. \u062D\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649."));
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-hero-gradient pt-20 pb-32">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">

          {/* Trial banner */}
          {isTrial && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/20 border border-amber-400/30 mb-6">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-bold text-amber-200">
                {t(
                  "\uD83C\uDF89 Trial complete! Subscribe to continue learning",
                  "\u062A\u0645\u062A \u0627\u0644\u062A\u062C\u0631\u0628\u0629! \u0627\u0634\u062A\u0631\u0643 \u0644\u0645\u0648\u0627\u0635\u0644\u0629 \u0627\u0644\u062A\u0639\u0644\u0645"
                )}
              </span>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 mb-4">
            <Crown className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-white/90 uppercase tracking-widest">
              {t("Simple Pricing", "\u0623\u0633\u0639\u0627\u0631 \u0628\u0633\u064A\u0637\u0629")}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            {t("Choose Your", "\u0627\u062E\u062A\u0631")}{" "}
            <span className="text-accent">{t("Learning Plan", "\u062E\u0637\u0629 \u062A\u0639\u0644\u0645\u0643")}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            {t(
              "Invest in your Quran journey. Cancel anytime, no hidden fees.",
              "\u0627\u0633\u062A\u062B\u0645\u0631 \u0641\u064A \u0631\u062D\u0644\u062A\u0643 \u0645\u0639 \u0627\u0644\u0642\u0631\u0622\u0646. \u0625\u0644\u063A\u0627\u0621 \u0641\u064A \u0623\u064A \u0648\u0642\u062A."
            )}
          </motion.p>

          {/* Billing Toggle */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
            <button onClick={() => setBilling("monthly")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                billing === "monthly" ? "bg-white text-primary shadow-md" : "text-white/70 hover:text-white"
              )}>
              {t("Monthly", "\u0634\u0647\u0631\u064A")}
            </button>
            <button onClick={() => setBilling("yearly")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                billing === "yearly" ? "bg-white text-primary shadow-md" : "text-white/70 hover:text-white"
              )}>
              {t("Yearly", "\u0633\u0646\u0648\u064A")}
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                -17%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L480 40L960 60L1440 0V80H0Z" className="fill-sand-50" />
          </svg>
        </div>
      </section>

      {/* ── Plans Grid ── */}
      <section className="max-w-6xl mx-auto px-4 -mt-16 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => {
            const price     = billing === "monthly" ? plan.priceMonthly : plan.priceYearly / 12;
            const isLoading = loadingPlan === plan.id;
            const features  = isRTL ? plan.featuresAr : plan.features;

            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "relative bg-white rounded-3xl overflow-hidden border transition-all duration-300",
                  plan.popular
                    ? "border-primary shadow-2xl shadow-primary/15 scale-105"
                    : "border-sand-200 shadow-lg hover:shadow-xl hover:-translate-y-1"
                )}>

                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 py-2 bg-gradient-to-r from-primary to-primary/80 text-center">
                    <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-1.5">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      {t("Most Popular", "\u0627\u0644\u0623\u0643\u062B\u0631 \u0634\u064A\u0648\u0639\u0627\u064B")}
                      <Star className="w-3 h-3 fill-accent text-accent" />
                    </span>
                  </div>
                )}

                <div className={cn("p-6", plan.popular && "pt-12")}>
                  {/* Icon */}
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", plan.iconBg)}>
                    <Crown className={cn("w-6 h-6", plan.iconColor)} />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {isRTL ? plan.nameAr : plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {isRTL ? plan.descAr : plan.desc}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-gray-900">${price.toFixed(0)}</span>
                      <span className="text-gray-500 text-sm mb-1.5">/{t("mo", "\u0634\u0647\u0631")}</span>
                    </div>
                    {billing === "yearly" && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1">
                        ${plan.priceYearly}/yr {t("(save", "(\u0648\u0641\u0631")} ${(plan.priceMonthly * 12 - plan.priceYearly).toFixed(0)})
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {plan.sessionsPerWeek} {t("sessions/week", "\u062C\u0644\u0633\u0627\u062A/\u0623\u0633\u0628\u0648\u0639")}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isLoading}
                    className={cn(
                      "w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mb-6",
                      plan.popular
                        ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25"
                        : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200",
                      "disabled:opacity-60 disabled:cursor-not-allowed"
                    )}>
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {t("Processing...", "\u062C\u0627\u0631\u064D...")}</>
                    ) : isTrial ? (
                      <><Zap className="w-4 h-4" /> {t("Subscribe Now", "\u0627\u0634\u062A\u0631\u0643 \u0627\u0644\u0622\u0646")} <Arrow className="w-4 h-4" /></>
                    ) : isLoggedIn ? (
                      <><Crown className="w-4 h-4" /> {t("Get Started", "\u0627\u0628\u062F\u0623 \u0627\u0644\u0622\u0646")} <Arrow className="w-4 h-4" /></>
                    ) : (
                      <><Arrow className="w-4 h-4" /> {t("Start Free Trial", "\u0627\u0628\u062F\u0623 \u0628\u0627\u0644\u062A\u062C\u0631\u0628\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629")}</>
                    )}
                  </button>

                  {/* Features */}
                  <div className="space-y-2.5">
                    {features.map((feature, fi) => (
                      <div key={fi} className="flex items-center gap-2.5">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", plan.iconBg)}>
                          <CheckCircle2 className={cn("w-3.5 h-3.5", plan.iconColor)} />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Guest CTA */}
        {!isLoggedIn && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="mt-10 text-center">
            <p className="text-gray-500 text-sm mb-3">
              {t("Not sure yet?", "\u0644\u0633\u062A \u0645\u062A\u0623\u0643\u062F\u0627\u064B \u0628\u0639\u062F\u061F")}
            </p>
            <Link href="/book-trial"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              <Sparkles className="w-4 h-4" />
              {t("Start with a Free Trial", "\u0627\u0628\u062F\u0623 \u0628\u062C\u0644\u0633\u0629 \u0645\u062C\u0627\u0646\u064A\u0629")}
              <Arrow className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* Trust Badges */}
        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {[
            { Icon: Shield, text: t("Secure Payment", "\u062F\u0641\u0639 \u0622\u0645\u0646"),       sub: t("SSL encrypted", "\u062A\u0634\u0641\u064A\u0631 SSL")             },
            { Icon: Clock,  text: t("Cancel Anytime", "\u0625\u0644\u063A\u0627\u0621 \u0641\u064A \u0623\u064A \u0648\u0642\u062A"), sub: t("No contracts", "\u0628\u062F\u0648\u0646 \u0639\u0642\u0648\u062F")     },
            { Icon: Users,  text: t("500+ Students", "500+ \u0637\u0627\u0644\u0628"),              sub: t("Worldwide community", "\u0645\u062C\u062A\u0645\u0639 \u0639\u0627\u0644\u0645\u064A") },
          ].map(({ Icon, text, sub }, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-sand-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{text}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}