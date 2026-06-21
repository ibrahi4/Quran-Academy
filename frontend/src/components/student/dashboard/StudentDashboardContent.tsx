"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/stores/useAuthStore";
import studentApi from "@/lib/api/student";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar, CheckCircle2, Crown, Clock, Video, Sparkles,
  BookOpen, AlertCircle, Loader2, ChevronRight, ChevronLeft,
  Award, Zap, MessageCircle, TrendingUp, User as UserIcon,
  Eye, ArrowRight, ArrowLeft,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

// ── Types ─────────────────────────────────────────────────────
interface TeacherInfo {
  id: string;
  bio?: string;
  rating?: number;
  user: { firstName: string; lastName: string; email?: string };
}

interface SessionItem {
  id: string;
  title: string;
  date: string;
  duration: number;
  status: string;
  meetingLink?: string;
  platform?: string;
  notes?: string;
  teacherNotes?: string;
  teacher?: TeacherInfo;
}

interface SubscriptionInfo {
  id: string;
  plan: string;
  status: string;
  sessionsPerWeek: number;
  priceMonthly: string | number;
  startDate: string;
  endDate?: string;
}

const PLAN_LABELS: Record<string, string> = {
  TRIAL: "Trial", BASIC: "Basic", PREMIUM: "Premium", FAMILY: "Family",
};

// ── Component ─────────────────────────────────────────────────
export default function StudentDashboardContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = (en: string, ar: string) => (isRTL ? ar : en);
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const Chev = isRTL ? ChevronLeft : ChevronRight;
  const { user } = useAuthStore();
  const isTrial = user?.role === "TRIAL_STUDENT";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todaySessions, setTodaySessions] = useState<SessionItem[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<SessionItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const results = await Promise.allSettled([
        studentApi.getMySessions({ status: "SCHEDULED", from: today.toISOString(), to: tomorrow.toISOString(), limit: 10 }),
        studentApi.getMySessions({ status: "SCHEDULED", from: tomorrow.toISOString(), limit: 5 }),
        studentApi.getMySessions({ status: "COMPLETED", limit: 1 }),
        studentApi.getMySessions({ status: "SCHEDULED", limit: 1 }),
        isTrial ? Promise.resolve(null) : studentApi.getMySubscription(),
      ]);

      // Today's sessions
      if (results[0].status === "fulfilled") {
        const data = (results[0].value as any)?.data || [];
        console.log("[StudentDashboard] today sessions:", data);
        setTodaySessions(data);
      }

      // Upcoming (after today)
      if (results[1].status === "fulfilled") {
        const data = (results[1].value as any)?.data || [];
        console.log("[StudentDashboard] upcoming sessions:", data);
        setUpcomingSessions(data);
      }

      // Completed count
      if (results[2].status === "fulfilled") {
        const total = (results[2].value as any)?.meta?.total || 0;
        console.log("[StudentDashboard] completed count:", total);
        setCompletedCount(total);
      }

      // Scheduled count
      if (results[3].status === "fulfilled") {
        const total = (results[3].value as any)?.meta?.total || 0;
        console.log("[StudentDashboard] scheduled count:", total);
        setScheduledCount(total);
      }

      // Subscription
      if (results[4].status === "fulfilled" && results[4].value) {
        console.log("[StudentDashboard] subscription:", results[4].value);
        setSubscription(results[4].value as any);
      }
    } catch (err) {
      console.error("[StudentDashboard] load error:", err);
      setError(t("Failed to load dashboard", "\u0641\u0634\u0644 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a"));
    } finally {
      setLoading(false);
    }
  }, [isTrial]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString(isRTL ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(isRTL ? "ar-EG" : "en-US", { weekday: "short", month: "short", day: "numeric" });

  const getTeacherName = (s: SessionItem) =>
    s.teacher?.user ? `${s.teacher.user.firstName} ${s.teacher.user.lastName}` : t("TBD", "\u063a\u064a\u0631 \u0645\u062d\u062f\u062f");

  const isJoinable = (s: SessionItem) => {
    if (!s.meetingLink || s.status !== "SCHEDULED") return false;
    const sessionTime = new Date(s.date).getTime();
    const now = Date.now();
    return now >= sessionTime - 15 * 60 * 1000 && now <= sessionTime + s.duration * 60 * 1000;
  };

  // ── Loading ─────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">{t("Loading...", "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0645\u064a\u0644...")}</p>
      </div>
    </div>
  );

  // ── Error ───────────────────────────────────────────────────
  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-900 font-bold mb-2">{error}</p>
        <button onClick={loadDashboard} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold">
          {t("Retry", "\u0625\u0639\u0627\u062f\u0629")}
        </button>
      </div>
    </div>
  );

  // ── Session Card Component ──────────────────────────────────
  const SessionCard = ({ session, showDate = false }: { session: SessionItem; showDate?: boolean }) => {
    const joinable = isJoinable(session);
    const sessionDate = new Date(session.date);

    return (
      <div className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md hover:border-primary/20 transition-all">
        {/* Time Block */}
        <div className="shrink-0 w-16 text-center">
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-2">
            {showDate && (
              <p className="text-[9px] font-bold text-primary uppercase">
                {sessionDate.toLocaleDateString(isRTL ? "ar-EG" : "en-US", { month: "short" })}
              </p>
            )}
            <p className={cn("font-bold text-primary leading-none", showDate ? "text-lg" : "text-sm")}>
              {showDate ? sessionDate.getDate() : formatTime(session.date)}
            </p>
            {showDate && (
              <p className="text-[10px] text-gray-500 mt-0.5">{formatTime(session.date)}</p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{session.title}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <UserIcon className="w-3 h-3" />
              {getTeacherName(session)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {session.duration} {t("min", "\u062f\u0642")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-2">
          {joinable ? (
            <a href={session.meetingLink!} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all animate-pulse">
              <Video className="w-3.5 h-3.5" />
              {t("Join Now", "\u0627\u0646\u0636\u0645")}
            </a>
          ) : session.meetingLink ? (
            <span className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">
              {t("Upcoming", "\u0642\u0631\u064a\u0628\u0627\u064b")}
            </span>
          ) : (
            <span className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold">
              {t("Pending", "\u0645\u0639\u0644\u0642")}
            </span>
          )}
          <button onClick={() => setSelectedSession(session)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── TRIAL BANNER ── */}
      {isTrial && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 sm:p-6">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">
                  {t("Free Trial Active", "\u0627\u0644\u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629 \u0646\u0634\u0637\u0629")}
                </p>
                <p className="text-white/70 text-xs">
                  {t("Subscribe to unlock full access", "\u0627\u0634\u062a\u0631\u0643 \u0644\u0641\u062a\u062d \u0627\u0644\u0648\u0635\u0648\u0644 \u0627\u0644\u0643\u0627\u0645\u0644")}
                </p>
              </div>
            </div>
            <Link href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-600 font-bold text-xs hover:bg-orange-50 transition-all shadow-md">
              <Crown className="w-3.5 h-3.5" />
              {t("View Plans", "\u0639\u0631\u0636 \u0627\u0644\u0628\u0627\u0642\u0627\u062a")}
            </Link>
          </div>
        </section>
      )}

      {/* ── TODAY'S SESSIONS ── */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                {t("Today's Sessions", "\u062c\u0644\u0633\u0627\u062a \u0627\u0644\u064a\u0648\u0645")}
              </h2>
              <p className="text-[11px] text-gray-500">
                {new Date().toLocaleDateString(isRTL ? "ar-EG" : "en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          {todaySessions.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              {todaySessions.length} {t("session", "\u062c\u0644\u0633\u0629")}
            </span>
          )}
        </div>

        <div className="p-4">
          {todaySessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {t("No sessions today", "\u0644\u0627 \u062a\u0648\u062c\u062f \u062c\u0644\u0633\u0627\u062a \u0627\u0644\u064a\u0648\u0645")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((s) => <SessionCard key={s.id} session={s} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: t("Scheduled", "\u0645\u062c\u062f\u0648\u0644\u0629"), value: scheduledCount, icon: Calendar, bg: "bg-blue-50", text: "text-blue-600" },
          { label: t("Completed", "\u0645\u0643\u062a\u0645\u0644\u0629"), value: completedCount, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: t("Plan", "\u0627\u0644\u0628\u0627\u0642\u0629"), value: isTrial ? "Trial" : (subscription ? PLAN_LABELS[subscription.plan] || subscription.plan : "\u2014"), icon: Crown, bg: "bg-amber-50", text: "text-amber-600" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                  <Icon className={cn("w-5 h-5", stat.text)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-none">
                    {typeof stat.value === "number" ? stat.value : stat.value}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── UPCOMING TIMELINE ── */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">{t("Upcoming Schedule", "\u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u0642\u0627\u062f\u0645")}</h2>
              <p className="text-[11px] text-gray-500">{t("Your next sessions", "\u062c\u0644\u0633\u0627\u062a\u0643 \u0627\u0644\u0642\u0627\u062f\u0645\u0629")}</p>
            </div>
          </div>
          <Link href="/student/sessions" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
            {t("View all", "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644")} <Chev className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-4">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">
                {isTrial
                  ? t("Your trial session will appear here once confirmed", "\u062c\u0644\u0633\u062a\u0643 \u0627\u0644\u062a\u062c\u0631\u064a\u0628\u064a\u0629 \u0633\u062a\u0638\u0647\u0631 \u0647\u0646\u0627")
                  : t("No upcoming sessions", "\u0644\u0627 \u062a\u0648\u062c\u062f \u062c\u0644\u0633\u0627\u062a \u0642\u0627\u062f\u0645\u0629")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((s) => <SessionCard key={s.id} session={s} showDate />)}
            </div>
          )}
        </div>
      </section>

      {/* ── TRIAL CHECKLIST ── */}
      {isTrial && (
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-primary" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">{t("Getting Started", "\u0627\u0644\u0628\u062f\u0621")}</h3>
          </div>
          <div className="space-y-2">
            {[
              { done: true, label: t("Account created", "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628") },
              { done: true, label: t("Password set", "\u062a\u0645 \u062a\u0639\u064a\u064a\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631") },
              { done: scheduledCount > 0 || todaySessions.length > 0, label: t("Trial session scheduled", "\u062c\u0644\u0633\u0629 \u062a\u062c\u0631\u064a\u0628\u064a\u0629 \u0645\u062c\u062f\u0648\u0644\u0629") },
              { done: completedCount > 0, label: t("First session completed", "\u0623\u0648\u0644 \u062c\u0644\u0633\u0629 \u0645\u0643\u062a\u0645\u0644\u0629") },
            ].map(({ done, label }, i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all",
                done ? "bg-emerald-50" : "bg-gray-50"
              )}>
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", done ? "bg-emerald-500" : "bg-gray-200")}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                </div>
                <span className={cn("text-sm font-medium", done ? "text-emerald-800" : "text-gray-500")}>{label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── QUICK ACTIONS ── */}
      <section className="grid sm:grid-cols-3 gap-3">
        {[
          { href: isTrial ? "/pricing" : "/student/sessions", icon: isTrial ? Crown : BookOpen, iconBg: "bg-accent/15", iconColor: "text-accent", title: isTrial ? t("Subscribe Now", "\u0627\u0634\u062a\u0631\u0643") : t("My Sessions", "\u062c\u0644\u0633\u0627\u062a\u064a"), sub: isTrial ? t("Unlock full access", "\u0627\u0641\u062a\u062d \u0627\u0644\u0648\u0635\u0648\u0644") : t("View schedule", "\u0639\u0631\u0636 \u0627\u0644\u062c\u062f\u0648\u0644"), hl: true },
          { href: "/contact", icon: MessageCircle, iconBg: "bg-blue-50", iconColor: "text-blue-600", title: t("Support", "\u0627\u0644\u062f\u0639\u0645"), sub: t("Get help", "\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 \u0645\u0633\u0627\u0639\u062f\u0629"), hl: false },
          { href: "/student/profile", icon: TrendingUp, iconBg: "bg-purple-50", iconColor: "text-purple-600", title: t("Profile", "\u0627\u0644\u0645\u0644\u0641"), sub: t("Update info", "\u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a"), hl: false },
        ].map(({ href, icon: Icon, iconBg, iconColor, title, sub, hl }, i) => (
          <Link key={i} href={href} className={cn(
            "group flex items-center gap-3 p-4 rounded-2xl border transition-all",
            hl ? "bg-accent/5 border-accent/15 hover:bg-accent/10" : "bg-white border-gray-100 hover:border-primary/20 hover:shadow-sm"
          )}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900">{title}</p>
              <p className="text-[11px] text-gray-500">{sub}</p>
            </div>
            <Chev className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </section>

      {/* ── SESSION DETAIL DIALOG ── */}
      <Dialog open={!!selectedSession} onOpenChange={(o) => !o && setSelectedSession(null)}>
        <DialogContent className="sm:max-w-md" dir={isRTL ? "rtl" : "ltr"}>
          {selectedSession && (() => {
            const s = selectedSession;
            const joinable = isJoinable(s);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">{s.title}</DialogTitle>
                  <DialogDescription>{formatDate(s.date)} \u00B7 {formatTime(s.date)}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-3">
                  {/* Teacher Card */}
                  {s.teacher?.user && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {s.teacher.user.firstName[0]}{s.teacher.user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {s.teacher.user.firstName} {s.teacher.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{t("Your Teacher", "\u0645\u0639\u0644\u0645\u0643")}</p>
                      </div>
                      {s.teacher.rating && (
                        <div className="ms-auto flex items-center gap-1 text-amber-500">
                          <Award className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{s.teacher.rating}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        {t("Duration", "\u0627\u0644\u0645\u062f\u0629")}
                      </p>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {s.duration} {t("min", "\u062f\u0642")}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        {t("Platform", "\u0627\u0644\u0645\u0646\u0635\u0629")}
                      </p>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5 capitalize">
                        <Video className="w-3.5 h-3.5 text-primary" />
                        {(s.platform || "zoom").toLowerCase()}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      {t("Status", "\u0627\u0644\u062d\u0627\u0644\u0629")}
                    </p>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                      s.status === "SCHEDULED" ? "bg-blue-50 text-blue-700" :
                      s.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {s.status === "SCHEDULED" ? <Calendar className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {s.status}
                    </span>
                  </div>

                  {/* Notes */}
                  {s.notes && (
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        {t("Notes", "\u0645\u0644\u0627\u062d\u0638\u0627\u062a")}
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.notes}</p>
                    </div>
                  )}

                  {/* Join Button */}
                  {joinable && (
                    <a href={s.meetingLink!} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all">
                      <Video className="w-4 h-4" />
                      {t("Join Meeting", "\u0627\u0646\u0636\u0645 \u0644\u0644\u0627\u062c\u062a\u0645\u0627\u0639")}
                    </a>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}