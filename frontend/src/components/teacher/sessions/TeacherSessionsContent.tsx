"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocale } from "next-intl";
import { teacherApi } from "@/lib/api/teacher";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Calendar, Clock, CheckCircle2, XCircle, Loader2, Video,
  AlertCircle, PlayCircle, AlertTriangle, Eye, RefreshCw,
  ExternalLink, Search, User, FileText, ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import SubmitReportDialog from "@/components/teacher/reports/SubmitReportDialog";

interface SessionStudent {
  id?: string;
  level?: string;
  timezone?: string;
  country?: string;
  user: { firstName: string; lastName: string; email: string; avatar?: string };
}

interface Session {
  id: string;
  title: string;
  date: string;
  duration: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "MISSED";
  platform?: string;
  meetingLink?: string;
  notes?: string;
  teacherNotes?: string;
  studentAttended?: boolean;
  teacherAttended?: boolean;
  studentLateMins?: number;
  teacherLateMins?: number;
  completedAt?: string;
  bookingId?: string;
  student: SessionStudent;
}

interface ReportSummary {
  id: string;
  sessionId: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
  isTrialAssessment?: boolean;
}

type ViewTab = "needs_action" | "today" | "upcoming" | "completed" | "all";

const STATUS_CONFIG: Record<string, { en: string; ar: string; bg: string; text: string; icon: any }> = {
  SCHEDULED:   { en: "Scheduled",   ar: "\u0645\u062C\u062F\u0648\u0644\u0629", bg: "bg-blue-50",    text: "text-blue-700",    icon: Calendar },
  IN_PROGRESS: { en: "In Progress", ar: "\u062C\u0627\u0631\u064A\u0629",       bg: "bg-amber-50",   text: "text-amber-700",   icon: PlayCircle },
  COMPLETED:   { en: "Completed",   ar: "\u0645\u0643\u062A\u0645\u0644\u0629", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  CANCELLED:   { en: "Cancelled",   ar: "\u0645\u0644\u063A\u0627\u0629",       bg: "bg-red-50",     text: "text-red-700",     icon: XCircle },
  MISSED:      { en: "Missed",      ar: "\u0641\u0627\u0626\u062A\u0629",       bg: "bg-gray-100",   text: "text-gray-600",    icon: AlertTriangle },
};

const REPORT_CONFIG: Record<string, { en: string; ar: string; bg: string; text: string; icon: any }> = {
  SUBMITTED:         { en: "Report Submitted",  ar: "\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0645\u0631\u0633\u0644", bg: "bg-blue-50",    text: "text-blue-700",    icon: FileText },
  APPROVED:          { en: "Approved",          ar: "\u0645\u0639\u062A\u0645\u062F",                 bg: "bg-emerald-50", text: "text-emerald-700", icon: ClipboardCheck },
  REJECTED:          { en: "Rejected",          ar: "\u0645\u0631\u0641\u0648\u0636",                 bg: "bg-red-50",     text: "text-red-700",     icon: XCircle },
  CHANGES_REQUESTED: { en: "Needs Changes",     ar: "\u064A\u062D\u062A\u0627\u062C \u062A\u0639\u062F\u064A\u0644", bg: "bg-amber-50",   text: "text-amber-700",   icon: AlertCircle },
};

function fullName(u: { firstName: string; lastName: string }): string {
  return `${u.firstName} ${u.lastName}`.trim();
}

function initials(u: { firstName: string; lastName: string }): string {
  return `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase();
}

function isJoinable(s: Session): boolean {
  if (!s.meetingLink) return false;
  if (s.status !== "SCHEDULED" && s.status !== "IN_PROGRESS") return false;
  return Date.now() >= new Date(s.date).getTime() - 30 * 60 * 1000;
}

function hasEnded(s: Session): boolean {
  const endTime = new Date(s.date).getTime() + (s.duration || 60) * 60 * 1000;
  return endTime < Date.now();
}

function isTodaySession(date: string) {
  const d = new Date(date);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isTrialSession(s: Session): boolean {
  const title = s.title?.toLowerCase() || "";
  return title.includes("trial") || title.includes("placement") || !!s.bookingId;
}

export default function TeacherSessionsContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewTab, setViewTab] = useState<ViewTab>("needs_action");

  const [selected, setSelected] = useState<Session | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportSession, setReportSession] = useState<Session | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);

      const [sessionsRes, reportsRes] = await Promise.allSettled([
        teacherApi.getSessions(),
        teacherApi.getMyReports(),
      ]);

      if (sessionsRes.status === "fulfilled") {
        const data = Array.isArray(sessionsRes.value)
          ? sessionsRes.value
          : (sessionsRes.value as any)?.data ?? sessionsRes.value;
        console.log("[TeacherSessions] sessions:", data);
        setSessions(Array.isArray(data) ? data : []);
      }

      if (reportsRes.status === "fulfilled") {
        const data = Array.isArray(reportsRes.value)
          ? reportsRes.value
          : (reportsRes.value as any)?.data ?? reportsRes.value;
        console.log("[TeacherSessions] reports:", data);
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      console.error("[TeacherSessions] load error:", err);
      toast.error(err?.message || t("Failed to load sessions", "\u0641\u0634\u0644 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u062C\u0644\u0633\u0627\u062A"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const reportsMap = useMemo(() => {
    const map = new Map<string, ReportSummary>();
    reports.forEach((r) => map.set(r.sessionId, r));
    return map;
  }, [reports]);

  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    if (viewTab === "needs_action") {
      result = result.filter((s) => {
        const report = reportsMap.get(s.id);
        return hasEnded(s)
          && (s.status === "SCHEDULED" || s.status === "IN_PROGRESS")
          && (!report || report.status === "REJECTED" || report.status === "CHANGES_REQUESTED");
      });
    } else if (viewTab === "today") {
      result = result.filter((s) => isTodaySession(s.date));
    } else if (viewTab === "upcoming") {
      result = result.filter((s) =>
        (s.status === "SCHEDULED" || s.status === "IN_PROGRESS") && new Date(s.date) > new Date()
      );
    } else if (viewTab === "completed") {
      result = result.filter((s) => s.status === "COMPLETED" || reportsMap.get(s.id)?.status === "APPROVED");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.title.toLowerCase().includes(q) ||
        fullName(s.student.user).toLowerCase().includes(q) ||
        s.student.user.email.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return result;
  }, [sessions, reportsMap, viewTab, search]);

  const stats = {
    total: sessions.length,
    today: sessions.filter((s) => isTodaySession(s.date)).length,
    upcoming: sessions.filter((s) => (s.status === "SCHEDULED" || s.status === "IN_PROGRESS") && new Date(s.date) > new Date()).length,
    completed: sessions.filter((s) => s.status === "COMPLETED").length,
    needsAction: sessions.filter((s) => {
      const report = reportsMap.get(s.id);
      return hasEnded(s)
        && (s.status === "SCHEDULED" || s.status === "IN_PROGRESS")
        && (!report || report.status === "REJECTED" || report.status === "CHANGES_REQUESTED");
    }).length,
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
    hour: "2-digit", minute: "2-digit",
  });
  const fmtFull = (d: string) => new Date(d).toLocaleString(isRTL ? "ar-EG" : "en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const openReport = (session: Session) => {
    setReportSession(session);
    setReportOpen(true);
  };

  return (
    <div className={cn("space-y-6 max-w-7xl mx-auto", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {t("Sessions Workbench", "\u0645\u0631\u0643\u0632 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062C\u0644\u0633\u0627\u062A")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("Join sessions, submit reports, and track teaching activity", "\u0627\u0646\u0636\u0645 \u0644\u0644\u062C\u0644\u0633\u0627\u062A \u0648\u0623\u0631\u0633\u0644 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631")}
          </p>
        </div>
        <Button onClick={loadSessions} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          {t("Refresh", "\u062A\u062D\u062F\u064A\u062B")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: t("Needs Action", "\u062A\u062D\u062A\u0627\u062C \u0625\u062C\u0631\u0627\u0621"), value: stats.needsAction, icon: AlertCircle, bg: "bg-amber-50", text: "text-amber-600" },
          { label: t("Today", "\u0627\u0644\u064A\u0648\u0645"), value: stats.today, icon: Calendar, bg: "bg-blue-50", text: "text-blue-600" },
          { label: t("Upcoming", "\u0627\u0644\u0642\u0627\u062F\u0645\u0629"), value: stats.upcoming, icon: Clock, bg: "bg-purple-50", text: "text-purple-600" },
          { label: t("Completed", "\u0645\u0643\u062A\u0645\u0644\u0629"), value: stats.completed, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: t("All", "\u0627\u0644\u0643\u0644"), value: stats.total, icon: FileText, bg: "bg-gray-100", text: "text-gray-700" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                  <Icon className={cn("w-5 h-5", s.text)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {([
              { key: "needs_action", label: t("Needs Action", "\u062A\u062D\u062A\u0627\u062C \u0625\u062C\u0631\u0627\u0621"), count: stats.needsAction },
              { key: "today", label: t("Today", "\u0627\u0644\u064A\u0648\u0645"), count: stats.today },
              { key: "upcoming", label: t("Upcoming", "\u0627\u0644\u0642\u0627\u062F\u0645\u0629"), count: stats.upcoming },
              { key: "completed", label: t("Completed", "\u0645\u0643\u062A\u0645\u0644\u0629"), count: stats.completed },
              { key: "all", label: t("All", "\u0627\u0644\u0643\u0644"), count: stats.total },
            ] as { key: ViewTab; label: string; count: number }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setViewTab(tab.key)}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  viewTab === tab.key
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    viewTab === tab.key ? "bg-white/15 text-white" : "bg-white text-gray-700"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
            <Input
              placeholder={t("Search by title or student...", "\u0628\u062D\u062B \u0628\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0623\u0648 \u0627\u0633\u0645 \u0627\u0644\u0637\u0627\u0644\u0628...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn("h-10", isRTL ? "pr-10" : "pl-10")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-16 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{t("No sessions found", "\u0644\u0627 \u062A\u0648\u062C\u062F \u062C\u0644\u0633\u0627\u062A")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.SCHEDULED;
            const SIcon = cfg.icon;
            const joinable = isJoinable(session);
            const ended = hasEnded(session);
            const report = reportsMap.get(session.id);
            const canSubmitReport =
              ended &&
              (session.status === "SCHEDULED" || session.status === "IN_PROGRESS") &&
              (!report || report.status === "REJECTED" || report.status === "CHANGES_REQUESTED");

            const isTrial = isTrialSession(session);

            return (
              <Card
                key={session.id}
                className={cn(
                  "border-0 shadow-sm hover:shadow-md transition-all",
                  canSubmitReport && "ring-2 ring-amber-300 bg-amber-50/20"
                )}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Date Block */}
                    <div className="shrink-0 flex sm:flex-col items-center gap-3 sm:gap-1 sm:w-20">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold uppercase text-primary">
                          {new Date(session.date).toLocaleDateString(isRTL ? "ar-EG" : "en-US", { month: "short" })}
                        </span>
                        <span className="text-xl font-bold text-primary leading-none">
                          {new Date(session.date).getDate()}
                        </span>
                      </div>
                      <div className="text-center sm:mt-1">
                        <p className="text-xs font-bold text-gray-700">{fmtTime(session.date)}</p>
                        <p className="text-[10px] text-muted-foreground">{session.duration} {t("min", "\u062F\u0642")}</p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">
                          {session.title}
                        </h3>

                        <Badge variant="outline" className={cn("text-[10px] font-bold gap-1", cfg.bg, cfg.text)}>
                          <SIcon className="w-3 h-3" />
                          {isRTL ? cfg.ar : cfg.en}
                        </Badge>

                        {isTrial && (
                          <Badge className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            TRIAL
                          </Badge>
                        )}

                        {report && REPORT_CONFIG[report.status] && (
                          <Badge variant="outline" className={cn("text-[10px] font-bold gap-1", REPORT_CONFIG[report.status].bg, REPORT_CONFIG[report.status].text)}>
                            {(() => {
                              const RIcon = REPORT_CONFIG[report.status].icon;
                              return <RIcon className="w-3 h-3" />;
                            })()}
                            {isRTL ? REPORT_CONFIG[report.status].ar : REPORT_CONFIG[report.status].en}
                          </Badge>
                        )}

                        {canSubmitReport && (
                          <Badge className="text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {t("Report Needed", "\u064A\u062C\u0628 \u0625\u0631\u0633\u0627\u0644 \u062A\u0642\u0631\u064A\u0631")}
                          </Badge>
                        )}
                      </div>

                      {/* Student */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {initials(session.student.user)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {fullName(session.student.user)}
                        </span>
                        {session.student.level && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {session.student.level}
                          </span>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {fmtDate(session.date)}
                        </span>
                        {session.platform && (
                          <Badge variant="outline" className="text-[10px]">
                            <Video className="w-3 h-3 mr-1" />
                            {session.platform.replace("_", " ")}
                          </Badge>
                        )}
                        {session.student.timezone && (
                          <span className="text-[10px] text-gray-400">{session.student.timezone}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 lg:flex-col lg:items-stretch shrink-0">
                      {joinable && session.meetingLink && (
                        <a href={session.meetingLink} target="_blank" rel="noreferrer" className="flex-1 lg:w-full">
                          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-1 h-9">
                            <Video className="w-4 h-4" />
                            {t("Join", "\u0627\u0646\u0636\u0645")}
                          </Button>
                        </a>
                      )}

                      {canSubmitReport && (
                        <Button
                          onClick={() => openReport(session)}
                          className="flex-1 lg:w-full gap-1 h-9 text-white bg-primary hover:bg-primary/90"
                        >
                          <FileText className="w-4 h-4" />
                          {report?.status === "REJECTED" || report?.status === "CHANGES_REQUESTED"
                            ? t("Update Report", "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062A\u0642\u0631\u064A\u0631")
                            : t("Submit Report", "\u0625\u0631\u0633\u0627\u0644 \u062A\u0642\u0631\u064A\u0631")}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => { setSelected(session); setViewOpen(true); }}
                        className="gap-1 h-9"
                      >
                        <Eye className="w-4 h-4" />
                        {t("View", "\u0639\u0631\u0636")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px]" dir={isRTL ? "rtl" : "ltr"}>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-primary">{selected.title}</DialogTitle>
                <DialogDescription>{fmtFull(selected.date)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const cfg = STATUS_CONFIG[selected.status];
                    const SIcon = cfg.icon;
                    return (
                      <Badge variant="outline" className={cn("text-xs font-bold gap-1", cfg.bg, cfg.text)}>
                        <SIcon className="w-3 h-3" />
                        {isRTL ? cfg.ar : cfg.en}
                      </Badge>
                    );
                  })()}
                  {reportsMap.get(selected.id) && REPORT_CONFIG[reportsMap.get(selected.id)!.status] && (
                    (() => {
                      const r = reportsMap.get(selected.id)!;
                      const rcfg = REPORT_CONFIG[r.status];
                      const RIcon = rcfg.icon;
                      return (
                        <Badge variant="outline" className={cn("text-xs font-bold gap-1", rcfg.bg, rcfg.text)}>
                          <RIcon className="w-3 h-3" />
                          {isRTL ? rcfg.ar : rcfg.en}
                        </Badge>
                      );
                    })()
                  )}
                </div>

                {/* Student */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {initials(selected.student.user)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{fullName(selected.student.user)}</p>
                    <p className="text-xs text-muted-foreground">{selected.student.user.email}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t("Duration", "\u0627\u0644\u0645\u062F\u0629")}</p>
                    <p className="font-bold">{selected.duration} {t("min", "\u062F\u0642\u064A\u0642\u0629")}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t("Time", "\u0627\u0644\u0648\u0642\u062A")}</p>
                    <p className="font-bold">{fmtTime(selected.date)}</p>
                  </div>
                </div>

                {selected.student.level && (
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-[10px] uppercase font-bold text-blue-600 mb-1">{t("Student Level", "\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0637\u0627\u0644\u0628")}</p>
                    <p className="text-sm font-bold text-gray-900">{selected.student.level}</p>
                  </div>
                )}

                {selected.student.timezone && (
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t("Timezone", "\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0632\u0645\u0646\u064A\u0629")}</p>
                    <p className="text-sm font-bold text-gray-900">{selected.student.timezone}</p>
                  </div>
                )}

                {selected.meetingLink && (
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-[10px] uppercase font-bold text-blue-600 mb-1">{t("Meeting Link", "\u0631\u0627\u0628\u0637 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639")}</p>
                    <a
                      href={selected.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-700 hover:underline break-all flex items-center gap-1"
                    >
                      {selected.meetingLink}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}

                {selected.notes && (
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{t("Notes", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}</p>
                    <p className="text-sm">{selected.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Report Dialog */}
      <SubmitReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        session={reportSession}
        isTrial={reportSession ? isTrialSession(reportSession) : false}
        onSuccess={loadSessions}
      />
    </div>
  );
}