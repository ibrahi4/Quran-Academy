"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import studentApi from "@/lib/api/student";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ExternalLink,
  Users,
  PlayCircle,
  CalendarDays,
  Sparkles,
  Eye,
  Filter,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SessionItem {
  id: string;
  title: string;
  date: string;
  duration: number;
  status: string;
  meetingLink?: string;
  platform?: string;
  recordingUrl?: string;
  notes?: string;
}

type TabKey = "upcoming" | "past" | "all";

export default function StudentSessionsContent() {
  const { isRTL, locale } = useLocale();
  const t = (en: string, ar: string) => (isRTL ? ar : en);
  const Chev = isRTL ? ChevronLeft : ChevronRight;

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<SessionItem | null>(null);
  const [stats, setStats] = useState({ scheduled: 0, completed: 0, cancelled: 0 });

  const limit = 10;

  useEffect(() => {
    loadSessions();
  }, [activeTab, page]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [s, c, x] = await Promise.allSettled([
        studentApi.getMySessions({ status: "SCHEDULED", limit: 1 }),
        studentApi.getMySessions({ status: "COMPLETED", limit: 1 }),
        studentApi.getMySessions({ status: "CANCELLED", limit: 1 }),
      ]);
      setStats({
        scheduled: s.status === "fulfilled" ? (s.value as any)?.meta?.total || 0 : 0,
        completed: c.status === "fulfilled" ? (c.value as any)?.meta?.total || 0 : 0,
        cancelled: x.status === "fulfilled" ? (x.value as any)?.meta?.total || 0 : 0,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };

      if (activeTab === "upcoming") {
        params.status = "SCHEDULED";
        params.from = new Date().toISOString();
      } else if (activeTab === "past") {
        params.to = new Date().toISOString();
      }

      const res: any = await studentApi.getMySessions(params);
      setSessions(res?.data || []);
      setTotalPages(res?.meta?.totalPages || 1);
      setTotal(res?.meta?.total || 0);
    } catch (e) {
      console.error("Sessions load error:", e);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (date: string) => {
    return new Date(date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
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

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { en: string; ar: string; bg: string; text: string; ring: string; icon: any }> = {
      SCHEDULED: {
        en: "Scheduled",
        ar: "\u0645\u062C\u062F\u0648\u0644\u0629",
        bg: "bg-blue-50",
        text: "text-blue-700",
        ring: "ring-blue-200",
        icon: Calendar,
      },
      IN_PROGRESS: {
        en: "In Progress",
        ar: "\u062C\u0627\u0631\u064A\u0629",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        ring: "ring-emerald-200",
        icon: PlayCircle,
      },
      COMPLETED: {
        en: "Completed",
        ar: "\u0645\u0643\u062A\u0645\u0644\u0629",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        ring: "ring-emerald-200",
        icon: CheckCircle2,
      },
      CANCELLED: {
        en: "Cancelled",
        ar: "\u0645\u0644\u063A\u0627\u0629",
        bg: "bg-red-50",
        text: "text-red-700",
        ring: "ring-red-200",
        icon: XCircle,
      },
      MISSED: {
        en: "Missed",
        ar: "\u0641\u0627\u0626\u062A\u0629",
        bg: "bg-amber-50",
        text: "text-amber-700",
        ring: "ring-amber-200",
        icon: AlertCircle,
      },
    };
    return configs[status] || configs.SCHEDULED;
  };

  const tabs: { key: TabKey; en: string; ar: string; count?: number }[] = [
    { key: "upcoming", en: "Upcoming", ar: "\u0627\u0644\u0642\u0627\u062F\u0645\u0629", count: stats.scheduled },
    { key: "past", en: "Past Sessions", ar: "\u0627\u0644\u0633\u0627\u0628\u0642\u0629", count: stats.completed + stats.cancelled },
    { key: "all", en: "All Sessions", ar: "\u0627\u0644\u0643\u0644" },
  ];

  const statCards = [
    {
      label: t("Scheduled", "\u0645\u062C\u062F\u0648\u0644\u0629"),
      value: stats.scheduled,
      icon: Calendar,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: t("Completed", "\u0645\u0643\u062A\u0645\u0644\u0629"),
      value: stats.completed,
      icon: CheckCircle2,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: t("Cancelled", "\u0645\u0644\u063A\u0627\u0629"),
      value: stats.cancelled,
      icon: XCircle,
      bg: "bg-red-50",
      text: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-600 to-secondary p-6 sm:p-8 shadow-premium">
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sessions-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,8 46,24 62,20 50,32 62,44 46,40 40,56 34,40 18,44 30,32 18,20 34,24" fill="none" stroke="white" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sessions-pattern)" />
          </svg>
        </div>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent/15 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm mb-3">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-bold text-white/90 uppercase tracking-[0.15em]">
                {t("Your Schedule", "\u062C\u062F\u0648\u0644\u0643")}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {t("My Sessions", "\u062C\u0644\u0633\u0627\u062A\u064A")}
            </h2>
            <p className="text-sm text-white/70 max-w-md">
              {t(
                "Track your classes, join meetings, and review your learning progress.",
                "\u062A\u062A\u0628\u0639 \u062C\u0644\u0633\u0627\u062A\u0643\u060C \u0627\u0646\u0636\u0645 \u0644\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u0627\u062A\u060C \u0648\u0631\u0627\u062C\u0639 \u062A\u0642\u062F\u0645\u0643."
              )}
            </p>
          </div>

          <Link
            href="/book-trial"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent hover:bg-accent/90 text-gray-900 font-bold text-sm shadow-lg transition-all whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            {t("Book New Session", "\u0627\u062D\u062C\u0632 \u062C\u0644\u0633\u0629")}
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-sand-200/70 hover:shadow-premium transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                  <Icon className={cn("w-5 h-5", s.text)} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-gray-900 leading-none">{s.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mt-1.5 truncate">
                    {s.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Tabs + Sessions List */}
      <section className="bg-white rounded-2xl border border-sand-200/70 overflow-hidden">
        {/* Tabs */}
        <div className="px-4 sm:px-6 pt-4 border-b border-sand-200/70 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={cn(
                  "relative px-4 py-3 text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap",
                  activeTab === tab.key
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {isRTL ? tab.ar : tab.en}
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      activeTab === tab.key
                        ? "bg-primary text-white"
                        : "bg-sand-100 text-gray-600"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sand-100 to-sand-200 flex items-center justify-center mx-auto mb-5">
                <CalendarDays className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                {activeTab === "upcoming"
                  ? t("No upcoming sessions", "\u0644\u0627 \u062A\u0648\u062C\u062F \u062C\u0644\u0633\u0627\u062A \u0642\u0627\u062F\u0645\u0629")
                  : activeTab === "past"
                  ? t("No past sessions", "\u0644\u0627 \u062A\u0648\u062C\u062F \u062C\u0644\u0633\u0627\u062A \u0633\u0627\u0628\u0642\u0629")
                  : t("No sessions yet", "\u0644\u0627 \u062A\u0648\u062C\u062F \u062C\u0644\u0633\u0627\u062A \u0628\u0639\u062F")}
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                {t(
                  "Book your first session and start your Quran learning journey today.",
                  "\u0627\u062D\u062C\u0632 \u062C\u0644\u0633\u062A\u0643 \u0627\u0644\u0623\u0648\u0644\u0649 \u0648\u0627\u0628\u062F\u0623 \u0631\u062D\u0644\u062A\u0643 \u0627\u0644\u064A\u0648\u0645."
                )}
              </p>
              <Link
                href="/book-trial"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white text-sm font-bold transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                {t("Book a Session", "\u0627\u062D\u062C\u0632 \u062C\u0644\u0633\u0629")}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-sand-200/70">
              {sessions.map((s) => {
                const statusCfg = getStatusConfig(s.status);
                const StatusIcon = statusCfg.icon;
                const isUpcoming = s.status === "SCHEDULED" && new Date(s.date) > new Date();

                return (
                  <div
                    key={s.id}
                    className="group p-4 sm:p-5 hover:bg-sand-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Date Block */}
                      <div className="shrink-0">
                        <div className="w-16 sm:w-20 rounded-2xl overflow-hidden border border-sand-200/70 bg-white">
                          <div className="bg-gradient-to-br from-primary to-primary-700 text-white px-2 py-1 text-center">
                            <span className="text-[9px] font-bold uppercase tracking-wider">
                              {new Date(s.date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                                month: "short",
                              })}
                            </span>
                          </div>
                          <div className="py-2 text-center bg-white">
                            <p className="text-2xl font-bold text-gray-900 leading-none">
                              {new Date(s.date).getDate()}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                              {formatTime(s.date)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">
                            {s.title}
                          </h3>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1",
                              statusCfg.bg,
                              statusCfg.text,
                              statusCfg.ring
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {isRTL ? statusCfg.ar : statusCfg.en}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {s.duration} {t("minutes", "\u062F\u0642\u064A\u0642\u0629")}
                          </span>
                          {s.platform && (
                            <span className="flex items-center gap-1.5 capitalize">
                              <Video className="w-3.5 h-3.5" />
                              {s.platform.toLowerCase().replace("_", " ")}
                            </span>
                          )}
                          <span className="hidden sm:flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatShortDate(s.date)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 flex items-center gap-2">
                        {isUpcoming && s.meetingLink && (
                          <a
                            href={s.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all"
                          >
                            <Video className="w-3.5 h-3.5" />
                            {t("Join", "\u0627\u0646\u0636\u0645")}
                          </a>
                        )}
                        {s.status === "COMPLETED" && s.recordingUrl && (
                          <a
                            href={s.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            {t("Recording", "\u0627\u0644\u062A\u0633\u062C\u064A\u0644")}
                          </a>
                        )}
                        <button
                          onClick={() => setSelected(s)}
                          className="p-2.5 rounded-xl hover:bg-sand-100 text-gray-600 hover:text-primary transition-colors"
                          aria-label="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile-only Action Row */}
                    {isUpcoming && s.meetingLink && (
                      <div className="sm:hidden mt-3 pt-3 border-t border-sand-200/70">
                        <a
                          href={s.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all"
                        >
                          <Video className="w-4 h-4" />
                          {t("Join Meeting", "\u0627\u0646\u0636\u0645 \u0644\u0644\u0627\u062C\u062A\u0645\u0627\u0639")}
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && sessions.length > 0 && totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-sand-200/70 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {t(
                  `Page ${page} of ${totalPages} · ${total} total`,
                  `\u0635\u0641\u062D\u0629 ${page} \u0645\u0646 ${totalPages} \u00B7 ${total} \u0625\u062C\u0645\u0627\u0644\u064A`
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-sand-200 hover:bg-sand-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <span className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold min-w-[36px] text-center">
                  {page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-sand-200 hover:bg-sand-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Session Details Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? "rtl" : "ltr"}>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold pr-8">
                  {selected.title}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  {formatDate(selected.date)} · {formatTime(selected.date)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {(() => {
                    const cfg = getStatusConfig(selected.status);
                    const Icon = cfg.icon;
                    return (
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1",
                        cfg.bg, cfg.text, cfg.ring
                      )}>
                        <Icon className="w-3.5 h-3.5" />
                        {isRTL ? cfg.ar : cfg.en}
                      </span>
                    );
                  })()}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-sand-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      {t("Duration", "\u0627\u0644\u0645\u062F\u0629")}
                    </p>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {selected.duration} {t("min", "\u062F\u0642\u064A\u0642\u0629")}
                    </p>
                  </div>
                  {selected.platform && (
                    <div className="rounded-xl bg-sand-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                        {t("Platform", "\u0627\u0644\u0645\u0646\u0635\u0629")}
                      </p>
                      <p className="text-sm font-bold text-gray-900 capitalize flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-primary" />
                        {selected.platform.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div className="rounded-xl bg-sand-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                      {t("Notes", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selected.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  {selected.meetingLink && selected.status === "SCHEDULED" && (
                    <a
                      href={selected.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all"
                    >
                      <Video className="w-4 h-4" />
                      {t("Join Meeting", "\u0627\u0646\u0636\u0645 \u0644\u0644\u0627\u062C\u062A\u0645\u0627\u0639")}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {selected.recordingUrl && (
                    <a
                      href={selected.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-bold transition-all"
                    >
                      <PlayCircle className="w-4 h-4" />
                      {t("Watch Recording", "\u0645\u0634\u0627\u0647\u062F\u0629 \u0627\u0644\u062A\u0633\u062C\u064A\u0644")}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}