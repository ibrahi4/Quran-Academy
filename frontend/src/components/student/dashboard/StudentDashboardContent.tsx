"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useAuthStore } from "@/stores/useAuthStore";
import studentApi from "@/lib/api/student";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckCircle2,
  Crown,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Clock,
  Video,
  Sparkles,
  TrendingUp,
  BookOpen,
  MessageCircle,
  PlayCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Award,
} from "lucide-react";

interface SessionItem {
  id: string;
  title: string;
  date: string;
  duration: number;
  status: string;
  meetingLink?: string;
  platform?: string;
}

interface PaymentItem {
  id: string;
  amount: string | number;
  currency: string;
  status: string;
  paidAt?: string;
  createdAt: string;
  description?: string;
}

interface SubscriptionItem {
  id: string;
  plan: string;
  status: string;
  sessionsPerWeek: number;
  priceMonthly: string | number;
  startDate: string;
  endDate?: string;
}

export default function StudentDashboardContent() {
  const { isRTL, locale } = useLocale();
  const { user } = useAuthStore();
  const t = (en: string, ar: string) => (isRTL ? ar : en);
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const Chev = isRTL ? ChevronLeft : ChevronRight;

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionItem | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [sessionsRes, completedRes, subRes, paymentsRes] = await Promise.allSettled([
        studentApi.getMySessions({ status: "SCHEDULED", limit: 5 }),
        studentApi.getMySessions({ status: "COMPLETED", limit: 1 }),
        studentApi.getMySubscription(),
        studentApi.getMyPayments({ limit: 5 }),
      ]);

      if (sessionsRes.status === "fulfilled") {
        const data: any = sessionsRes.value;
        setSessions(data?.data || []);
      }
      if (completedRes.status === "fulfilled") {
        const data: any = completedRes.value;
        setCompletedCount(data?.meta?.total || 0);
      }
      if (subRes.status === "fulfilled") {
        setSubscription(subRes.value as any);
      }
      if (paymentsRes.status === "fulfilled") {
        const data: any = paymentsRes.value;
        const list: PaymentItem[] = data?.data || [];
        setPayments(list);
        const total = list
          .filter((p) => p.status === "PAID")
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        setTotalSpent(total);
      }
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const planLabels: Record<string, { en: string; ar: string }> = {
    TRIAL: { en: "Trial", ar: "\u062A\u062C\u0631\u064A\u0628\u064A" },
    BASIC: { en: "Basic", ar: "\u0623\u0633\u0627\u0633\u064A" },
    PREMIUM: { en: "Premium", ar: "\u0645\u0645\u064A\u0632" },
    FAMILY: { en: "Family", ar: "\u0639\u0627\u0626\u0644\u064A" },
  };

  const stats = [
    {
      label: t("Upcoming Sessions", "\u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0627\u0644\u0642\u0627\u062F\u0645\u0629"),
      value: sessions.length,
      icon: Calendar,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: t("Completed Sessions", "\u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0627\u0644\u0645\u0643\u062A\u0645\u0644\u0629"),
      value: completedCount,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: t("Active Plan", "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0646\u0634\u0637\u0629"),
      value: subscription
        ? isRTL
          ? planLabels[subscription.plan]?.ar || subscription.plan
          : planLabels[subscription.plan]?.en || subscription.plan
        : t("None", "\u0644\u0627 \u062A\u0648\u062C\u062F"),
      icon: Crown,
      gradient: "from-accent to-accent-400",
      bg: "bg-accent/10",
      text: "text-accent",
      isText: true,
    },
    {
      label: t("Total Invested", "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A"),
      value: `$${totalSpent.toFixed(0)}`,
      icon: Wallet,
      gradient: "from-primary to-primary-600",
      bg: "bg-primary/10",
      text: "text-primary",
      isText: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{t("Loading your dashboard...", "\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-hero-gradient shadow-premium">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dash-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,8 46,24 62,20 50,32 62,44 46,40 40,56 34,40 18,44 30,32 18,20 34,24" fill="none" stroke="white" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dash-pattern)" />
          </svg>
        </div>

        {/* Floating Orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative px-6 py-10 sm:px-10 sm:py-14 grid lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm mb-5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] font-bold text-white/90 uppercase tracking-[0.15em]">
                {t("Your Learning Journey", "\u0631\u062D\u0644\u062A\u0643 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629")}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              {t("Welcome back,", "\u0623\u0647\u0644\u0627\u064B \u0628\u0639\u0648\u062F\u062A\u0643\u060C")}{" "}
              <span className="text-accent">{user?.firstName}</span>
            </h2>

            <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mb-7">
              {t(
                "Continue your Quran learning journey with dedication. Every verse you master brings you closer to Allah.",
                "\u062A\u0627\u0628\u0639 \u0631\u062D\u0644\u062A\u0643 \u0641\u064A \u062A\u0639\u0644\u0645 \u0627\u0644\u0642\u0631\u0622\u0646 \u0628\u0625\u062E\u0644\u0627\u0635. \u0643\u0644 \u0622\u064A\u0629 \u062A\u062A\u0642\u0646\u0647\u0627 \u062A\u0642\u0631\u0628\u0643 \u0625\u0644\u0649 \u0627\u0644\u0644\u0647."
              )}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/book-trial"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-gray-900 font-bold text-sm shadow-2xl transition-all"
              >
                <BookOpen className="w-4 h-4" />
                {t("Book a Session", "\u0627\u062D\u062C\u0632 \u062C\u0644\u0633\u0629")}
                <Arrow className="w-4 h-4" />
              </Link>
              <Link
                href="/student/sessions"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm backdrop-blur-sm transition-all"
              >
                {t("View Sessions", "\u0639\u0631\u0636 \u0627\u0644\u062C\u0644\u0633\u0627\u062A")}
              </Link>
            </div>
          </div>

          {/* Achievement Card */}
          <div className="hidden lg:block">
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">
                    {t("Total Progress", "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u062A\u0642\u062F\u0645")}
                  </p>
                  <p className="text-white/60 text-xs">
                    {t("Sessions completed", "\u062C\u0644\u0633\u0627\u062A \u0645\u0643\u062A\u0645\u0644\u0629")}
                  </p>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">{completedCount}</div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((completedCount / 50) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-white/50 mt-2">
                {t("Keep going! Every session counts.", "\u0627\u0633\u062A\u0645\u0631! \u0643\u0644 \u062C\u0644\u0633\u0629 \u062A\u062D\u062F\u062B \u0641\u0631\u0642\u0627\u064B.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative bg-white rounded-2xl p-5 border border-sand-200/70 hover:shadow-premium-hover hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", stat.bg)}>
                  <Icon className={cn("w-5 h-5", stat.text)} />
                </div>
                <div className={cn("w-1.5 h-1.5 rounded-full", stat.text.replace("text-", "bg-"), "opacity-60")} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5">
                {stat.label}
              </p>
              <p className={cn("font-bold text-gray-900 leading-tight", stat.isText ? "text-xl sm:text-2xl" : "text-3xl")}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* Main Grid: Sessions + Subscription */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-sand-200/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-sand-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {t("Upcoming Sessions", "\u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0627\u0644\u0642\u0627\u062F\u0645\u0629")}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("Your next scheduled classes", "\u062C\u0644\u0633\u0627\u062A\u0643 \u0627\u0644\u0645\u062C\u062F\u0648\u0644\u0629")}
                </p>
              </div>
            </div>
            <Link
              href="/student/sessions"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-700 transition-colors"
            >
              {t("View all", "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644")}
              <Chev className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-sand-200/70">
            {sessions.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-sand-100 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-7 h-7 text-gray-400" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">
                  {t("No upcoming sessions", "\u0644\u0627 \u062A\u0648\u062C\u062F \u062C\u0644\u0633\u0627\u062A \u0642\u0627\u062F\u0645\u0629")}
                </h4>
                <p className="text-sm text-gray-500 mb-5">
                  {t("Book your first session to get started", "\u0627\u062D\u062C\u0632 \u062C\u0644\u0633\u062A\u0643 \u0627\u0644\u0623\u0648\u0644\u0649 \u0644\u0644\u0628\u062F\u0621")}
                </p>
                <Link
                  href="/book-trial"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white text-sm font-bold transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  {t("Book Now", "\u0627\u062D\u062C\u0632 \u0627\u0644\u0622\u0646")}
                </Link>
              </div>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  className="px-6 py-4 hover:bg-sand-50 transition-colors flex items-center gap-4"
                >
                  {/* Date Block */}
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200/50 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-primary-600 uppercase">
                      {new Date(s.date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { month: "short" })}
                    </span>
                    <span className="text-lg font-bold text-primary leading-none">
                      {new Date(s.date).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{s.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(s.date)}
                      </span>
                      <span>·</span>
                      <span>{s.duration} {t("min", "\u062F\u0642\u064A\u0642\u0629")}</span>
                      {s.platform && (
                        <>
                          <span>·</span>
                          <span className="capitalize">{s.platform.toLowerCase().replace("_", " ")}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {s.meetingLink ? (
                    <a
                      href={s.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      {t("Join", "\u0627\u0646\u0636\u0645")}
                    </a>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold uppercase">
                      <AlertCircle className="w-3 h-3" />
                      {t("Pending", "\u0645\u0639\u0644\u0642")}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-white rounded-2xl border border-sand-200/70 overflow-hidden">
          <div className="relative bg-gradient-to-br from-primary via-primary-600 to-secondary p-6 text-white">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm">
                  <Crown className="w-5 h-5 text-accent" />
                </div>
                {subscription && (
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    subscription.status === "ACTIVE"
                      ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                      : "bg-white/10 text-white/70 border border-white/15"
                  )}>
                    {subscription.status}
                  </span>
                )}
              </div>

              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent mb-1">
                {t("Your Plan", "\u0628\u0627\u0642\u062A\u0643")}
              </p>
              <h3 className="text-2xl font-bold mb-1">
                {subscription
                  ? isRTL
                    ? planLabels[subscription.plan]?.ar || subscription.plan
                    : planLabels[subscription.plan]?.en || subscription.plan
                  : t("No Plan", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u0627\u0642\u0629")}
              </h3>
              {subscription && (
                <p className="text-white/70 text-sm">
                  ${Number(subscription.priceMonthly).toFixed(0)} / {t("month", "\u0634\u0647\u0631")}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 space-y-4">
            {subscription ? (
              <>
                <div className="flex items-center justify-between py-2 border-b border-sand-200/70">
                  <span className="text-xs text-gray-500">
                    {t("Sessions / week", "\u062C\u0644\u0633\u0627\u062A / \u0623\u0633\u0628\u0648\u0639")}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{subscription.sessionsPerWeek}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-sand-200/70">
                  <span className="text-xs text-gray-500">
                    {t("Started", "\u0628\u062F\u0623 \u0641\u064A")}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{formatDate(subscription.startDate)}</span>
                </div>
                {subscription.endDate && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-500">
                      {t("Renews", "\u064A\u062C\u062F\u062F \u0641\u064A")}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{formatDate(subscription.endDate)}</span>
                  </div>
                )}
                <Link
                  href="/pricing"
                  className="block w-full text-center py-2.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-primary text-sm font-bold transition-colors"
                >
                  {t("Manage Plan", "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0628\u0627\u0642\u0629")}
                </Link>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-4">
                  {t("Get unlimited access to all features", "\u0627\u062D\u0635\u0644 \u0639\u0644\u0649 \u0648\u0635\u0648\u0644 \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u064A\u0632\u0627\u062A")}
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white text-sm font-bold transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  {t("View Plans", "\u0639\u0631\u0636 \u0627\u0644\u0628\u0627\u0642\u0627\u062A")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Payments + Quick Actions */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-sand-200/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-sand-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {t("Recent Payments", "\u0623\u062D\u062F\u062B \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A")}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("Your billing history", "\u0633\u062C\u0644 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631")}
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-sand-200/70">
            {payments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-sand-100 flex items-center justify-center mx-auto mb-3">
                  <Wallet className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {t("No payments yet", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0628\u0639\u062F")}
                </p>
                <p className="text-xs text-gray-500">
                  {t("Your payment history will appear here", "\u0633\u062C\u0644 \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0633\u064A\u0638\u0647\u0631 \u0647\u0646\u0627")}
                </p>
              </div>
            ) : (
              payments.slice(0, 4).map((p) => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-sand-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                      p.status === "PAID" ? "bg-emerald-50" : p.status === "PENDING" ? "bg-amber-50" : "bg-red-50"
                    )}>
                      <Wallet className={cn(
                        "w-4 h-4",
                        p.status === "PAID" ? "text-emerald-600" : p.status === "PENDING" ? "text-amber-600" : "text-red-600"
                      )} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {p.description || t("Payment", "\u062F\u0641\u0639\u0629")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(p.paidAt || p.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">
                      ${Number(p.amount).toFixed(2)}
                    </p>
                    <span className={cn(
                      "inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                      p.status === "PAID" ? "bg-emerald-50 text-emerald-700" :
                      p.status === "PENDING" ? "bg-amber-50 text-amber-700" :
                      "bg-red-50 text-red-700"
                    )}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Link
            href="/book-trial"
            className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/20 p-5 hover:from-accent/25 hover:to-accent/10 transition-all"
          >
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/10 rounded-full blur-xl" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-primary text-sm mb-1">
                  {t("Book a Session", "\u0627\u062D\u062C\u0632 \u062C\u0644\u0633\u0629")}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t("Schedule your next class", "\u062D\u062F\u062F \u062C\u0644\u0633\u062A\u0643 \u0627\u0644\u0642\u0627\u062F\u0645\u0629")}
                </p>
              </div>
              <Chev className="w-5 h-5 text-accent shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/contact"
            className="group block rounded-2xl bg-white border border-sand-200/70 p-5 hover:border-primary/30 hover:shadow-premium transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm mb-1">
                  {t("Contact Support", "\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627")}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t("Get help anytime", "\u0627\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629")}
                </p>
              </div>
              <Chev className="w-5 h-5 text-gray-400 shrink-0 group-hover:translate-x-1 group-hover:text-primary transition-all" />
            </div>
          </Link>

          <Link
            href="/student/profile"
            className="group block rounded-2xl bg-white border border-sand-200/70 p-5 hover:border-primary/30 hover:shadow-premium transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm mb-1">
                  {t("Update Profile", "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0644\u0641")}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t("Manage your account", "\u0625\u062F\u0627\u0631\u0629 \u062D\u0633\u0627\u0628\u0643")}
                </p>
              </div>
              <Chev className="w-5 h-5 text-gray-400 shrink-0 group-hover:translate-x-1 group-hover:text-primary transition-all" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}