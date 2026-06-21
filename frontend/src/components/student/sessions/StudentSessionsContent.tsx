"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useAuthStore } from "@/stores/useAuthStore";
import studentApi from "@/lib/api/student";
import { cn } from "@/lib/utils";
import {
  Calendar, Clock, Video, CheckCircle2, XCircle, AlertCircle,
  Loader2, ChevronRight, ChevronLeft, BookOpen, PlayCircle,
  CalendarDays, Eye, User as UserIcon, Award,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

interface TeacherInfo {
  id: string;
  bio?: string;
  rating?: number;
  user: { firstName: string; lastName: string; email?: string };
}

interface SessionItem {
  id: string; title: string; date: string; duration: number;
  status: string; meetingLink?: string; platform?: string;
  recordingUrl?: string; notes?: string; teacherNotes?: string;
  teacher?: TeacherInfo;
}

type TabKey = "upcoming" | "past" | "all";

const STATUS_MAP: Record<string, { en: string; ar: string; bg: string; text: string; icon: any }> = {
  SCHEDULED:   { en: "Scheduled",   ar: "\u0645\u062c\u062f\u0648\u0644\u0629",  bg: "bg-blue-50",    text: "text-blue-700",    icon: Calendar },
  IN_PROGRESS: { en: "In Progress", ar: "\u062c\u0627\u0631\u064a\u0629",   bg: "bg-emerald-50", text: "text-emerald-700", icon: PlayCircle },
  COMPLETED:   { en: "Completed",   ar: "\u0645\u0643\u062a\u0645\u0644\u0629",  bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  CANCELLED:   { en: "Cancelled",   ar: "\u0645\u0644\u063a\u0627\u0629",   bg: "bg-red-50",     text: "text-red-700",     icon: XCircle },
  MISSED:      { en: "Missed",      ar: "\u0641\u0627\u0626\u062a\u0629",   bg: "bg-amber-50",   text: "text-amber-700",   icon: AlertCircle },
};

export default function StudentSessionsContent() {
  const { isRTL, locale } = useLocale();
  const { user } = useAuthStore();
  const t = (en: string, ar: string) => (isRTL ? ar : en);
  const isTrial = user?.role === "TRIAL_STUDENT";

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<SessionItem | null>(null);
  const [stats, setStats] = useState({ scheduled: 0, completed: 0, cancelled: 0 });

  const limit = 10;

  useEffect(() => { loadSessions(); }, [activeTab, page]);
  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [s, c, x] = await Promise.allSettled([
        studentApi.getMySessions({ status: "SCHEDULED", limit: 1 }),
        studentApi.getMySessions({ status: "COMPLETED", limit: 1 }),
        studentApi.getMySessions({ status: "CANCELLED", limit: 1 }),
      ]);
      const result = {
        scheduled: s.status === "fulfilled" ? (s.value as any)?.meta?.total || 0 : 0,
        completed: c.status === "fulfilled" ? (c.value as any)?.meta?.total || 0 : 0,
        cancelled: x.status === "fulfilled" ? (x.value as any)?.meta?.total || 0 : 0,
      };
      console.log("[StudentSessions] stats:", result);
      setStats(result);
    } catch (e) { console.error("[StudentSessions] stats error:", e); }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (activeTab === "upcoming") { params.status = "SCHEDULED"; params.from = new Date().toISOString(); }
      else if (activeTab === "past") { params.to = new Date().toISOString(); }

      console.log("[StudentSessions] loading with params:", params);
      const res: any = await studentApi.getMySessions(params);
      console.log("[StudentSessions] response:", res);

      setSessions(res?.data || []);
      setTotalPages(res?.meta?.totalPages || 1);
      setTotal(res?.meta?.total || 0);
    } catch (e) {
      console.error("[StudentSessions] load error:", e);
      setSessions([]);
    } finally { setLoading(false); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString(isRTL ? "ar-EG" : "en-US", { weekday: "long", month: "long", day: "numeric" });
  const fmtShort = (d: string) => new Date(d).toLocaleDateString(isRTL ? "ar-EG" : "en-US", { month: "short", day: "numeric" });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString(isRTL ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" });
  const teacherName = (s: SessionItem) => s.teacher?.user ? `${s.teacher.user.firstName} ${s.teacher.user.lastName}` : t("TBD", "\u063a\u064a\u0631 \u0645\u062d\u062f\u062f");

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "upcoming", label: t("Upcoming", "\u0627\u0644\u0642\u0627\u062f\u0645\u0629"), count: stats.scheduled },
    { key: "past", label: t("Past", "\u0627\u0644\u0633\u0627\u0628\u0642\u0629"), count: stats.completed + stats.cancelled },
    { key: "all", label: t("All", "\u0627\u0644\u0643\u0644") },
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: t("Scheduled", "\u0645\u062c\u062f\u0648\u0644\u0629"), value: stats.scheduled, icon: Calendar, bg: "bg-blue-50", text: "text-blue-600" },
          { label: t("Completed", "\u0645\u0643\u062a\u0645\u0644\u0629"), value: stats.completed, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
          { label: t("Cancelled", "\u0645\u0644\u063a\u0627\u0629"), value: stats.cancelled, icon: XCircle, bg: "bg-red-50", text: "text-red-600" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
                  <Icon className={cn("w-5 h-5", s.text)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-none">{s.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Tabs + List */}
      <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 pt-3 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1); }}
                className={cn("relative px-4 py-3 text-sm font-bold transition-colors flex items-center gap-2",
                  activeTab === tab.key ? "text-primary" : "text-gray-500 hover:text-gray-900"
                )}>
                {tab.label}
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-bold", activeTab === tab.key ? "bg-primary text-white" : "bg-gray-100 text-gray-600")}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 px-6">
            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">{t("No sessions found", "\u0644\u0627 \u062a\u0648\u062c\u062f \u062c\u0644\u0633\u0627\u062a")}</h3>
            <p className="text-sm text-gray-500">{t("Sessions will appear here", "\u0627\u0644\u062c\u0644\u0633\u0627\u062a \u0633\u062a\u0638\u0647\u0631 \u0647\u0646\u0627")}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sessions.map((s) => {
              const cfg = STATUS_MAP[s.status] || STATUS_MAP.SCHEDULED;
              const StatusIcon = cfg.icon;
              const isUpcoming = s.status === "SCHEDULED" && new Date(s.date) > new Date();

              return (
                <div key={s.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Date */}
                    <div className="shrink-0 w-14 rounded-xl overflow-hidden border border-gray-100 bg-white text-center">
                      <div className="bg-primary text-white px-1 py-0.5">
                        <span className="text-[9px] font-bold uppercase">
                          {new Date(s.date).toLocaleDateString(isRTL ? "ar-EG" : "en-US", { month: "short" })}
                        </span>
                      </div>
                      <div className="py-1.5">
                        <p className="text-lg font-bold text-gray-900 leading-none">{new Date(s.date).getDate()}</p>
                        <p className="text-[9px] text-gray-500 mt-0.5">{fmtTime(s.date)}</p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{s.title}</h3>
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", cfg.bg, cfg.text)}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {isRTL ? cfg.ar : cfg.en}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" />{teacherName(s)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration} {t("min", "\u062f\u0642")}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-2">
                      {isUpcoming && s.meetingLink && (
                        <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all">
                          <Video className="w-3.5 h-3.5" />{t("Join", "\u0627\u0646\u0636\u0645")}
                        </a>
                      )}
                      <button onClick={() => setSelected(s)}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {t(`Page ${page} of ${totalPages}`, `\u0635\u0641\u062d\u0629 ${page} \u0645\u0646 ${totalPages}`)}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <span className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold">{page}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Session Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md" dir={isRTL ? "rtl" : "ltr"}>
          {selected && (() => {
            const s = selected;
            const cfg = STATUS_MAP[s.status] || STATUS_MAP.SCHEDULED;
            const StatusIcon = cfg.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">{s.title}</DialogTitle>
                  <DialogDescription>{fmtDate(s.date)} \u00B7 {fmtTime(s.date)}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-3">
                  {/* Teacher */}
                  {s.teacher?.user && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {s.teacher.user.firstName[0]}{s.teacher.user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{s.teacher.user.firstName} {s.teacher.user.lastName}</p>
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

                  {/* Status + Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">{t("Status", "\u0627\u0644\u062d\u0627\u0644\u0629")}</p>
                      <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold", cfg.bg, cfg.text)}>
                        <StatusIcon className="w-3 h-3" />{isRTL ? cfg.ar : cfg.en}
                      </span>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">{t("Duration", "\u0627\u0644\u0645\u062f\u0629")}</p>
                      <p className="text-sm font-bold text-gray-900">{s.duration} {t("min", "\u062f\u0642")}</p>
                    </div>
                  </div>

                  {s.platform && (
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">{t("Platform", "\u0627\u0644\u0645\u0646\u0635\u0629")}</p>
                      <p className="text-sm font-bold text-gray-900 capitalize">{s.platform.toLowerCase()}</p>
                    </div>
                  )}

                  {s.notes && (
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">{t("Notes", "\u0645\u0644\u0627\u062d\u0638\u0627\u062a")}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {s.meetingLink && s.status === "SCHEDULED" && (
                    <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all">
                      <Video className="w-4 h-4" />{t("Join Meeting", "\u0627\u0646\u0636\u0645 \u0644\u0644\u0627\u062c\u062a\u0645\u0627\u0639")}
                    </a>
                  )}
                  {s.recordingUrl && (
                    <a href={s.recordingUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-bold transition-all">
                      <PlayCircle className="w-4 h-4" />{t("Watch Recording", "\u0645\u0634\u0627\u0647\u062f\u0629 \u0627\u0644\u062a\u0633\u062c\u064a\u0644")}
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