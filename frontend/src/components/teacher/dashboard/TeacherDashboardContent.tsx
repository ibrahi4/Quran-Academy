"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocale } from "next-intl";
import { teacherApi } from "@/lib/api/teacher";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar, Clock, Users, DollarSign, Loader2, CheckCircle2,
  Video, AlertCircle, ChevronRight, ChevronLeft, Star,
  BookOpen, RefreshCw, Eye, FileText, ClipboardCheck,
  Mail, Phone, MapPin, Globe, Cake, User as UserIcon,
  GraduationCap, Languages, Heart, UserCircle, Activity,
  TrendingUp, Award, BookMarked, Target, Sparkles, Hash,
  ExternalLink, MessageSquare, Notebook, Link2, Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import SubmitReportDialog from "@/components/teacher/reports/SubmitReportDialog";

/* ─────────────────────── Types ─────────────────────── */

interface TeacherUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface TeacherProfile {
  id: string;
  hourlyRate: number;
  bio?: string;
  specialties: string[];
  experience: number;
  rating: number;
  isActive: boolean;
  user: TeacherUser;
}

interface MonthlyStats {
  completedSessions: number;
  totalHours: number;
}

interface StudentUser {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
}

interface SessionStudent {
  id: string;
  level?: string;
  timezone?: string;
  country?: string;
  city?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  nativeLanguage?: string;
  parentName?: string;
  parentPhone?: string;
  parentRelation?: string;
  goals?: string[];
  notes?: string;
  user: StudentUser;
}

interface Session {
  id: string;
  title: string;
  date: string;
  duration: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "MISSED";
  meetingLink?: string;
  platform?: string;
  notes?: string;
  teacherNotes?: string;
  student: SessionStudent;
  bookingId?: string;
}

interface DashboardData {
  teacher: TeacherProfile;
  todaySessions: number;
  upcomingSessions: number;
  totalStudents: number;
  monthlyStats: MonthlyStats;
  todaySessionsList: Session[];
}

interface MyStudent {
  id: string;
  level: string;
  timezone?: string;
  country?: string;
  city?: string;
  age?: number;
  dateOfBirth?: string;
  gender?: string;
  nativeLanguage?: string;
  parentName?: string;
  parentPhone?: string;
  parentRelation?: string;
  goals?: string[];
  notes?: string;
  user: { id: string; firstName: string; lastName: string; email: string; avatar?: string; phone?: string };
  lastSession: { id: string; date: string; status: string; title: string } | null;
  totalSessions: number;
}

interface SubmissionItem { id: string; }

interface ReportSummary {
  id: string;
  sessionId: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
}

/* ─────────────────────── Constants ─────────────────────── */

const STATUS_MAP: Record<string, { en: string; ar: string; bg: string; text: string; icon: any }> = {
  SCHEDULED:   { en: "Scheduled",   ar: "\u0645\u062C\u062F\u0648\u0644\u0629", bg: "bg-blue-50",    text: "text-blue-700",    icon: Calendar },
  IN_PROGRESS: { en: "In Progress", ar: "\u062C\u0627\u0631\u064A\u0629",       bg: "bg-amber-50",   text: "text-amber-700",   icon: Clock },
  COMPLETED:   { en: "Completed",   ar: "\u0645\u0643\u062A\u0645\u0644\u0629", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  CANCELLED:   { en: "Cancelled",   ar: "\u0645\u0644\u063A\u0627\u0629",       bg: "bg-red-50",     text: "text-red-700",     icon: AlertCircle },
  MISSED:      { en: "Missed",      ar: "\u0641\u0627\u0626\u062A\u0629",       bg: "bg-gray-100",   text: "text-gray-600",    icon: AlertCircle },
};

const REPORT_MAP: Record<string, { en: string; ar: string; bg: string; text: string; icon: any }> = {
  SUBMITTED:         { en: "Report Submitted", ar: "\u062A\u0642\u0631\u064A\u0631 \u0645\u0631\u0633\u0644", bg: "bg-blue-50",    text: "text-blue-700",    icon: FileText },
  APPROVED:          { en: "Approved",         ar: "\u0645\u0639\u062A\u0645\u062F",               bg: "bg-emerald-50", text: "text-emerald-700", icon: ClipboardCheck },
  REJECTED:          { en: "Rejected",         ar: "\u0645\u0631\u0641\u0648\u0636",               bg: "bg-red-50",     text: "text-red-700",     icon: AlertCircle },
  CHANGES_REQUESTED: { en: "Needs Changes",    ar: "\u064A\u062D\u062A\u0627\u062C \u062A\u0639\u062F\u064A\u0644", bg: "bg-amber-50", text: "text-amber-700", icon: AlertCircle },
};

const LEVEL_MAP: Record<string, { en: string; ar: string; color: string; bg: string; icon: any }> = {
  BEGINNER:     { en: "Beginner",     ar: "\u0645\u0628\u062A\u062F\u0626", color: "text-blue-700",    bg: "bg-blue-50",    icon: BookOpen     },
  INTERMEDIATE: { en: "Intermediate", ar: "\u0645\u062A\u0648\u0633\u0637", color: "text-amber-700",   bg: "bg-amber-50",   icon: TrendingUp   },
  ADVANCED:     { en: "Advanced",     ar: "\u0645\u062A\u0642\u062F\u0645", color: "text-emerald-700", bg: "bg-emerald-50", icon: GraduationCap },
  HAFIZ:        { en: "Hafiz",        ar: "\u062D\u0627\u0641\u0638",       color: "text-purple-700",  bg: "bg-purple-50",  icon: Award        },
};

const RELATION_LABELS: Record<string, { en: string; ar: string }> = {
  father:   { en: "Father",   ar: "\u0627\u0644\u0623\u0628"           },
  mother:   { en: "Mother",   ar: "\u0627\u0644\u0623\u0645"           },
  guardian: { en: "Guardian", ar: "\u0648\u0644\u064A \u0623\u0645\u0631"},
  sibling:  { en: "Sibling",  ar: "\u0623\u062E"                       },
  other:    { en: "Other",    ar: "\u0622\u062E\u0631"                 },
};

/* ─────────────────────── Helpers ─────────────────────── */

function fullName(u: { firstName: string; lastName: string }): string {
  return `${u.firstName} ${u.lastName}`.trim();
}

function initials(u: { firstName: string; lastName: string }): string {
  return `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase();
}

function isJoinable(s: Session): boolean {
  if (!s.meetingLink || (s.status !== "SCHEDULED" && s.status !== "IN_PROGRESS")) return false;
  return Date.now() >= new Date(s.date).getTime() - 30 * 60 * 1000;
}

function hasEnded(s: Session): boolean {
  return new Date(s.date).getTime() + (s.duration || 60) * 60 * 1000 < Date.now();
}

function isTrialSession(s: Session): boolean {
  const title = s.title?.toLowerCase() || "";
  return title.includes("trial") || title.includes("placement") || !!s.bookingId;
}

function formatDate(d?: string, locale = "en-US") {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(locale, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function formatShortDate(d?: string, locale = "en-US") {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(d?: string, locale = "en-US") {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

/* ─────────────────────── Sub Components ─────────────────────── */

function InfoRow({ icon: Icon, label, value, accent }: {
  icon: any; label: string; value?: string | number | null; accent?: boolean;
}) {
  if (value == null || value === "") return null;
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-xl",
      accent ? "bg-primary/5 border border-primary/10" : "bg-gray-50/70"
    )}>
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
        accent ? "bg-primary/10 text-primary" : "bg-white text-gray-500 border border-gray-100"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}

/* ─────────────────────── Main Component ─────────────────────── */

export default function TeacherDashboardContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = (en: string, ar: string) => (isRTL ? ar : en);
  const Chev = isRTL ? ChevronLeft : ChevronRight;
  const localeStr = isRTL ? "ar-EG" : "en-US";

  const [dash, setDash] = useState<DashboardData | null>(null);
  const [students, setStudents] = useState<MyStudent[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewStudent, setViewStudent] = useState<MyStudent | null>(null);
  const [viewSession, setViewSession] = useState<Session | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSession, setReportSession] = useState<Session | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashRes, studentsRes, pendingRes, reportsRes] = await Promise.allSettled([
        teacherApi.getDashboard(),
        teacherApi.getMyStudents(),
        teacherApi.getPendingSubmissions(),
        teacherApi.getMyReports(),
      ]);

      if (dashRes.status === "fulfilled") {
        const d = (dashRes.value as any)?.data ?? dashRes.value;
        setDash(d);
      }
      if (studentsRes.status === "fulfilled") {
        const d = (studentsRes.value as any)?.data ?? studentsRes.value;
        setStudents(Array.isArray(d) ? d : []);
      }
      if (pendingRes.status === "fulfilled") {
        const d = (pendingRes.value as any)?.data ?? pendingRes.value;
        setPendingSubmissions(Array.isArray(d) ? d : []);
      }
      if (reportsRes.status === "fulfilled") {
        const d = (reportsRes.value as any)?.data ?? reportsRes.value;
        setReports(Array.isArray(d) ? d : []);
      }
    } catch (e) {
      console.error("[TeacherDashboard] load error:", e);
      setError(t("Failed to load dashboard", "\u0641\u0634\u0644 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const reportsMap = useMemo(() => {
    const map = new Map<string, ReportSummary>();
    reports.forEach((r) => map.set(r.sessionId, r));
    return map;
  }, [reports]);

  if (loading && !dash) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error && !dash) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="font-bold text-gray-900 mb-2">{error}</p>
          <Button onClick={loadAll} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("Retry", "\u0625\u0639\u0627\u062F\u0629")}
          </Button>
        </div>
      </div>
    );
  }

  const todaySessions = dash?.todaySessionsList || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-[#0a3d3d] p-6 sm:p-8">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-accent uppercase tracking-[0.2em] mb-2">
              {t("Teacher Dashboard", "\u0644\u0648\u062D\u0629 \u0627\u0644\u0645\u0639\u0644\u0645")}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {t("Welcome,", "\u0623\u0647\u0644\u0627\u064B,")}{" "}
              <span className="text-accent">{dash?.teacher.user.firstName}</span>
            </h1>
            <p className="text-white/70 text-sm">
              {dash?.todaySessions === 0
                ? t("No sessions today", "\u0644\u0627 \u062A\u0648\u062C\u062F \u062C\u0644\u0633\u0627\u062A \u0627\u0644\u064A\u0648\u0645")
                : t(`${dash?.todaySessions} session${(dash?.todaySessions || 0) > 1 ? "s" : ""} today`, `${dash?.todaySessions} \u062C\u0644\u0633\u0629 \u0627\u0644\u064A\u0648\u0645`)}
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {dash?.teacher.rating != null && (
              <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-center">
                <div className="flex items-center gap-1 justify-center mb-0.5">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-xl font-bold text-white">{Number(dash.teacher.rating).toFixed(1)}</span>
                </div>
                <p className="text-[10px] text-white/60 uppercase">{t("Rating", "\u0627\u0644\u062A\u0642\u064A\u064A\u0645")}</p>
              </div>
            )}
            <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-center">
              <p className="text-xl font-bold text-white">${Number(dash?.teacher.hourlyRate || 0).toFixed(0)}</p>
              <p className="text-[10px] text-white/60 uppercase">{t("Per Hour", "\u0628\u0627\u0644\u0633\u0627\u0639\u0629")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: t("Today", "\u0627\u0644\u064A\u0648\u0645"), value: dash?.todaySessions ?? 0, icon: Calendar, bg: "bg-blue-50", text: "text-blue-600" },
          { label: t("Upcoming", "\u0627\u0644\u0642\u0627\u062F\u0645\u0629"), value: dash?.upcomingSessions ?? 0, icon: Clock, bg: "bg-purple-50", text: "text-purple-600" },
          { label: t("Students", "\u0627\u0644\u0637\u0644\u0627\u0628"), value: dash?.totalStudents ?? 0, icon: Users, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: t("Completed", "\u0645\u0643\u062A\u0645\u0644\u0629"), value: dash?.monthlyStats.completedSessions ?? 0, icon: CheckCircle2, bg: "bg-green-50", text: "text-green-600" },
          { label: t("Pending Reviews", "\u062A\u0633\u0644\u064A\u0645\u0627\u062A \u062A\u062D\u062A\u0627\u062C \u0645\u0631\u0627\u062C\u0639\u0629"), value: pendingSubmissions.length, icon: BookOpen, bg: "bg-amber-50", text: "text-amber-600" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-all">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", s.bg)}>
                <Icon className={cn("w-5 h-5", s.text)} />
              </div>
              <p className="font-bold text-gray-900 text-2xl">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </section>

      {/* Today Sessions */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-gray-900">{t("Today's Sessions", "\u062C\u0644\u0633\u0627\u062A \u0627\u0644\u064A\u0648\u0645")}</h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs font-bold">
              {todaySessions.length}
            </Badge>
          </div>
          <Link href="/teacher/sessions" className="text-xs font-bold text-primary flex items-center gap-1">
            {t("Open Workbench", "\u0641\u062A\u062D \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062C\u0644\u0633\u0627\u062A")} <Chev className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-4">
          {todaySessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-900">{t("You are free today", "\u0623\u0646\u062A \u0645\u062A\u0627\u062D \u0627\u0644\u064A\u0648\u0645")}</p>
              <p className="text-sm text-gray-500 mt-1">{t("No sessions scheduled for today", "\u0644\u0627 \u062A\u0648\u062C\u062F \u062C\u0644\u0633\u0627\u062A \u0645\u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u064A\u0648\u0645")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((s) => {
                const cfg = STATUS_MAP[s.status] || STATUS_MAP.SCHEDULED;
                const SIcon = cfg.icon;
                const joinable = isJoinable(s);
                const ended = hasEnded(s);
                const report = reportsMap.get(s.id);
                const canSubmitReport =
                  ended &&
                  (s.status === "SCHEDULED" || s.status === "IN_PROGRESS") &&
                  (!report || report.status === "REJECTED" || report.status === "CHANGES_REQUESTED");
                const isTrial = isTrialSession(s);

                return (
                  <div
                    key={s.id}
                    onClick={() => setViewSession(s)}
                    className="cursor-pointer flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50 hover:border-primary/20"
                  >
                    <div className="shrink-0 w-16 text-center">
                      <p className="text-lg font-bold text-primary">{formatTime(s.date, localeStr)}</p>
                      <p className="text-[10px] text-gray-500">{s.duration} {t("min", "\u062F\u0642\u064A\u0642\u0629")}</p>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {initials(s.student.user)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 text-sm truncate">{fullName(s.student.user)}</p>
                        {isTrial && (
                          <Badge variant="outline" className="text-[9px] font-bold bg-amber-50 text-amber-700 border-amber-200">
                            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                            {t("TRIAL", "\u062A\u062C\u0631\u064A\u0628\u064A")}
                          </Badge>
                        )}
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", cfg.bg, cfg.text)}>
                          <SIcon className="w-3 h-3" />
                          {isRTL ? cfg.ar : cfg.en}
                        </span>
                        {report && REPORT_MAP[report.status] && (
                          (() => {
                            const rcfg = REPORT_MAP[report.status];
                            const RIcon = rcfg.icon;
                            return (
                              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", rcfg.bg, rcfg.text)}>
                                <RIcon className="w-3 h-3" />
                                {isRTL ? rcfg.ar : rcfg.en}
                              </span>
                            );
                          })()
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{s.title}</p>
                    </div>
                    <div className="shrink-0 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {joinable && s.meetingLink && (
                        <a href={s.meetingLink} target="_blank" rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 hover:bg-emerald-600 transition-colors">
                          <Video className="w-3.5 h-3.5" />{t("Join", "\u0627\u0646\u0636\u0645")}
                        </a>
                      )}
                      {canSubmitReport && (
                        <button onClick={() => { setReportSession(s); setReportOpen(true); }}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center gap-1 hover:bg-primary/20 transition-colors">
                          <FileText className="w-3.5 h-3.5" />{t("Submit Report", "\u0625\u0631\u0633\u0627\u0644 \u062A\u0642\u0631\u064A\u0631")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Students Snapshot */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-gray-900">{t("Student Snapshot", "\u0646\u0638\u0631\u0629 \u0633\u0631\u064A\u0639\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0644\u0627\u0628")}</h2>
          </div>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs font-bold">
            {students.length}
          </Badge>
        </div>
        <div className="p-4">
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-900">{t("No students yet", "\u0644\u0627 \u064A\u0648\u062C\u062F \u0637\u0644\u0627\u0628 \u0628\u0639\u062F")}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {students.slice(0, 6).map((s) => {
                const lvl = LEVEL_MAP[s.level];
                const LvlIcon = lvl?.icon || BookOpen;
                return (
                  <button key={s.id} onClick={() => setViewStudent(s)}
                    className="group text-start p-4 rounded-xl border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {initials(s.user)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{fullName(s.user)}</p>
                        <p className="text-[10px] text-gray-500 truncate">{s.user.email}</p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {lvl && (
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase", lvl.bg, lvl.color)}>
                          <LvlIcon className="w-2.5 h-2.5" />
                          {isRTL ? lvl.ar : lvl.en}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {s.totalSessions} {t("sessions", "\u062C\u0644\u0633\u0629")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/teacher/sessions", icon: Calendar, label: t("Sessions Workbench", "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062C\u0644\u0633\u0627\u062A"), bg: "bg-blue-50", text: "text-blue-600" },
          { href: "/teacher/assignments", icon: BookOpen, label: t("Assignments", "\u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A"), bg: "bg-accent/15", text: "text-accent" },
          { href: "/teacher/earnings", icon: DollarSign, label: t("Earnings", "\u0627\u0644\u0623\u0631\u0628\u0627\u062D"), bg: "bg-amber-50", text: "text-amber-600" },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", a.bg)}>
              <a.icon className={cn("w-5 h-5", a.text)} />
            </div>
            <p className="flex-1 text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">{a.label}</p>
            <Chev className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </section>

      {/* ═══════════════════ STUDENT DETAIL DIALOG ═══════════════════ */}
      <Dialog open={!!viewStudent} onOpenChange={(o) => !o && setViewStudent(null)}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto p-0" dir={isRTL ? "rtl" : "ltr"}>
          <VisuallyHidden.Root>
            <DialogTitle>Student Details</DialogTitle>
          </VisuallyHidden.Root>
          {viewStudent && (() => {
            const lvl = LEVEL_MAP[viewStudent.level];
            const LvlIcon = lvl?.icon || BookOpen;
            const relation = viewStudent.parentRelation
              ? (RELATION_LABELS[viewStudent.parentRelation]
                  ? (isRTL ? RELATION_LABELS[viewStudent.parentRelation].ar : RELATION_LABELS[viewStudent.parentRelation].en)
                  : viewStudent.parentRelation)
              : null;

            return (
              <>
                {/* Hero header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-[#0a3d3d] p-6 pb-8">
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-xl">
                      {initials(viewStudent.user)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-white truncate">{fullName(viewStudent.user)}</h2>
                      
                      <div className="flex items-center gap-2 flex-wrap mt-3">
                        {lvl && (
                          <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-white/10 text-white border border-white/20")}>
                            <LvlIcon className="w-3 h-3" />
                            {isRTL ? lvl.ar : lvl.en}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-white/10 text-white border border-white/20">
                          <Activity className="w-3 h-3" />
                          {viewStudent.totalSessions} {t("sessions", "\u062C\u0644\u0633\u0629")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Personal Details */}
                  <div>
                    <SectionTitle icon={UserIcon} title={t("Personal Details", "\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0634\u062E\u0635\u064A\u0629")} />
                    <div className="grid sm:grid-cols-2 gap-2">
                      {viewStudent.dateOfBirth && (
                        <InfoRow
                          icon={Cake}
                          label={t("Date of Birth", "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u064A\u0644\u0627\u062F")}
                          value={`${formatShortDate(viewStudent.dateOfBirth, localeStr)}${viewStudent.age ? ` (${viewStudent.age} ${t("years", "\u0633\u0646\u0629")})` : ""}`}
                        />
                      )}
                      {viewStudent.gender && (
                        <InfoRow icon={UserCircle} label={t("Gender", "\u0627\u0644\u0646\u0648\u0639")} value={viewStudent.gender} />
                      )}
                      {viewStudent.nativeLanguage && (
                        <InfoRow icon={Languages} label={t("Native Language", "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0623\u0645")} value={viewStudent.nativeLanguage} />
                      )}
                      {viewStudent.country && (
                        <InfoRow icon={Globe} label={t("Country", "\u0627\u0644\u0628\u0644\u062F")} value={viewStudent.country} />
                      )}
                      {viewStudent.city && (
                        <InfoRow icon={Building} label={t("City", "\u0627\u0644\u0645\u062F\u064A\u0646\u0629")} value={viewStudent.city} />
                      )}
                      {viewStudent.timezone && (
                        <InfoRow icon={Clock} label={t("Timezone", "\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0632\u0645\u0646\u064A\u0629")} value={viewStudent.timezone} />
                      )}
                    </div>
                  </div>

                  {/* Parent / Guardian (if exists) */}
                  {(viewStudent.parentName || viewStudent.parentPhone) && (
                    <div>
                      <SectionTitle icon={Heart} title={t("Parent / Guardian", "\u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631")} />
                      <div className="grid sm:grid-cols-2 gap-2">
                        {viewStudent.parentName && (
                          <InfoRow icon={UserIcon} label={t("Name", "\u0627\u0644\u0627\u0633\u0645")} value={viewStudent.parentName} accent />
                        )}
                        {relation && (
                          <InfoRow icon={Heart} label={t("Relation", "\u0627\u0644\u0635\u0644\u0629")} value={relation} accent />
                        )}

                      </div>
                    </div>
                  )}

                  {/* Learning Goals */}
                  {viewStudent.goals && viewStudent.goals.length > 0 && (
                    <div>
                      <SectionTitle icon={Target} title={t("Learning Goals", "\u0623\u0647\u062F\u0627\u0641 \u0627\u0644\u062A\u0639\u0644\u0645")} />
                      <div className="flex flex-wrap gap-2">
                        {viewStudent.goals.map((g, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-xs font-semibold">
                            <BookMarked className="w-3 h-3" />
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last Session */}
                  {viewStudent.lastSession && (
                    <div>
                      <SectionTitle icon={Calendar} title={t("Last Session", "\u0622\u062E\u0631 \u062C\u0644\u0633\u0629")} />
                      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-100 p-4">
                        <p className="font-semibold text-gray-900 mb-1">{viewStudent.lastSession.title}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatShortDate(viewStudent.lastSession.date, localeStr)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(viewStudent.lastSession.date, localeStr)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {viewStudent.notes && (
                    <div>
                      <SectionTitle icon={Notebook} title={t("Notes", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A")} />
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                        {viewStudent.notes}
                      </p>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════ SESSION DETAIL DIALOG ═══════════════════ */}
      <Dialog open={!!viewSession} onOpenChange={(o) => !o && setViewSession(null)}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto p-0" dir={isRTL ? "rtl" : "ltr"}>
          <VisuallyHidden.Root>
            <DialogTitle>Session Details</DialogTitle>
          </VisuallyHidden.Root>
          {viewSession && (() => {
            const cfg = STATUS_MAP[viewSession.status] || STATUS_MAP.SCHEDULED;
            const SIcon = cfg.icon;
            const isTrial = isTrialSession(viewSession);
            const joinable = isJoinable(viewSession);
            const ended = hasEnded(viewSession);
            const report = reportsMap.get(viewSession.id);
            const canSubmitReport =
              ended &&
              (viewSession.status === "SCHEDULED" || viewSession.status === "IN_PROGRESS") &&
              (!report || report.status === "REJECTED" || report.status === "CHANGES_REQUESTED");

            return (
              <>
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-[#0a3d3d] p-6 pb-8">
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {isTrial && (
                        <Badge className="bg-amber-400/20 text-amber-200 border-amber-400/30 text-[10px] font-bold gap-1">
                          <Sparkles className="w-3 h-3" />
                          {t("TRIAL SESSION", "\u062C\u0644\u0633\u0629 \u062A\u062C\u0631\u064A\u0628\u064A\u0629")}
                        </Badge>
                      )}
                      <Badge className={cn("text-[10px] font-bold gap-1 bg-white/15 text-white border-white/20")}>
                        <SIcon className="w-3 h-3" />
                        {isRTL ? cfg.ar : cfg.en}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">{viewSession.title}</h2>
                    <div className="flex items-center gap-4 text-white/70 text-xs flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(viewSession.date, localeStr)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(viewSession.date, localeStr)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5" />
                        {viewSession.duration} {t("min", "\u062F\u0642\u064A\u0642\u0629")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Student Card */}
                  <div>
                    <SectionTitle icon={UserCircle} title={t("Student", "\u0627\u0644\u0637\u0627\u0644\u0628")} />
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary font-bold shadow-sm shrink-0">
                        {initials(viewSession.student.user)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{fullName(viewSession.student.user)}</p>
                        
                        {(viewSession.student.country || viewSession.student.timezone) && (
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                            {viewSession.student.country && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {viewSession.student.country}
                              </span>
                            )}
                            {viewSession.student.timezone && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {viewSession.student.timezone}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Session Info */}
                  <div>
                    <SectionTitle icon={Calendar} title={t("Session Details", "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062C\u0644\u0633\u0629")} />
                    <div className="grid sm:grid-cols-2 gap-2">
                      {viewSession.platform && (
                        <InfoRow icon={Video} label={t("Platform", "\u0627\u0644\u0645\u0646\u0635\u0629")} value={viewSession.platform} />
                      )}
                      <InfoRow icon={Hash} label={t("Duration", "\u0627\u0644\u0645\u062F\u0629")} value={`${viewSession.duration} ${t("min", "\u062F\u0642\u064A\u0642\u0629")}`} />
                    </div>
                  </div>

                  {/* Meeting Link */}
                  {viewSession.meetingLink && (
                    <div>
                      <SectionTitle icon={Link2} title={t("Meeting Link", "\u0631\u0627\u0628\u0637 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639")} />
                      <a
                        href={viewSession.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
                          <Video className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-blue-700 truncate flex-1">
                          {viewSession.meetingLink}
                        </span>
                        <ExternalLink className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform shrink-0" />
                      </a>
                    </div>
                  )}

                  {/* Notes */}
                  {viewSession.notes && (
                    <div>
                      <SectionTitle icon={MessageSquare} title={t("Student Notes", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0637\u0627\u0644\u0628")} />
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed whitespace-pre-wrap">
                        {viewSession.notes}
                      </p>
                    </div>
                  )}

                  {viewSession.teacherNotes && (
                    <div>
                      <SectionTitle icon={Notebook} title={t("Your Notes", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A\u0643")} />
                      <p className="text-sm text-gray-700 bg-amber-50 p-3 rounded-xl border border-amber-100 leading-relaxed whitespace-pre-wrap">
                        {viewSession.teacherNotes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    {joinable && viewSession.meetingLink && (
                      <a
                        href={viewSession.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20"
                      >
                        <Video className="w-4 h-4" />
                        {t("Join Meeting", "\u0627\u0646\u0636\u0645 \u0644\u0644\u0627\u062C\u062A\u0645\u0627\u0639")}
                      </a>
                    )}
                    {canSubmitReport && (
                      <button
                        onClick={() => {
                          setReportSession(viewSession);
                          setViewSession(null);
                          setReportOpen(true);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                      >
                        <FileText className="w-4 h-4" />
                        {t("Submit Report", "\u0625\u0631\u0633\u0627\u0644 \u062A\u0642\u0631\u064A\u0631")}
                      </button>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Submit Report */}
      <SubmitReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        session={reportSession}
        isTrial={reportSession ? isTrialSession(reportSession) : false}
        onSuccess={loadAll}
      />
    </div>
  );
}