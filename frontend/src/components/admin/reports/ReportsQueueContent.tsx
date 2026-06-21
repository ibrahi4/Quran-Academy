"use client";

import { useRouter } from "next/navigation";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { adminApi } from "@/lib/api/admin";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  CheckCircle2, XCircle, Clock, Loader2, Eye, Star,
  GraduationCap, RefreshCw, AlertCircle, MessageSquare,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn as cnUtil } from "@/lib/utils";

interface SessionReport {
  id: string;
  status: string;
  submittedAt: string;
  studentAttended: boolean;
  teacherAttended: boolean;
  studentLateMins: number;
  teacherLateMins: number;
  lessonSummary?: string;
  teacherNotes?: string;
  nextLessonFocus?: string;
  privateAdminNote?: string;
  participationScore?: number;
  recitationScore?: number;
  tajweedScore?: number;
  memorizationScore?: number;
  overallScore?: number;
  evaluationNotes?: string;
  isTrialAssessment: boolean;
  recommendedLevel?: string;
  recommendedPlanNotes?: string;
  adminDecisionNote?: string;
  session: {
    id: string;
    title: string;
    date: string;
    duration: number;
    student: { user: { firstName: string; lastName: string; email: string } };
    teacher?: { user: { firstName: string; lastName: string } };
  };
  assignments: { id: string; title: string; status: string }[];
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  SUBMITTED:         { label: "Submitted",          bg: "bg-blue-50",    text: "text-blue-700",    icon: Clock },
  APPROVED:          { label: "Approved",           bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  REJECTED:          { label: "Rejected",           bg: "bg-red-50",     text: "text-red-700",     icon: XCircle },
  CHANGES_REQUESTED: { label: "Changes Requested",  bg: "bg-amber-50",   text: "text-amber-700",   icon: AlertCircle },
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner", INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced", HAFIZ: "Hafiz",
};

function ScoreBar({ label, score }: { label: string; score?: number }) {
  if (!score) return null;
  return (
    <div className="flex items-center gap-2">
      <p className="text-xs text-gray-500 w-24 shrink-0">{label}</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={cn("w-6 h-6 rounded-md text-xs flex items-center justify-center font-bold",
            score >= s ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-300"
          )}>{s}</div>
        ))}
      </div>
      <Star className={cn("w-3.5 h-3.5", score > 0 ? "text-amber-400 fill-amber-400" : "text-gray-200")} />
    </div>
  );
}

export default function ReportsQueueContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = (en: string, ar: string) => (isRTL ? ar : en);
  const router = useRouter();

  const [reports, setReports] = useState<SessionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SessionReport | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | "changes">("approve");
  const [actionNote, setActionNote] = useState("");
  const [acting, setActing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("SUBMITTED");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = filterStatus === "ALL"
        ? await adminApi.getAllReports()
        : await adminApi.getPendingReports();
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      console.log("[AdminReports] reports:", data.length);
      setReports(filterStatus === "ALL" ? data : data);
    } catch (e) {
      console.error("[AdminReports] error:", e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async () => {
    if (!selected) return;
    if ((action === "reject" || action === "changes") && !actionNote.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    try {
      setActing(true);
      if (action === "approve") {
        const res: any = await adminApi.approveReport(selected.id, actionNote || undefined);
        const sessionId = res?.sessionId || selected.session.id;
        toast.success("Report approved! Now confirm the session to credit wallet.", { duration: 4000 });
        setActionOpen(false);
        setActionNote("");
        setSelected(null);
        // Redirect to sessions page with auto-open confirm dialog
        router.push(`/${locale}/admin/sessions?confirm=${sessionId}`);
        return;
      } else if (action === "reject") {
        await adminApi.rejectReport(selected.id, actionNote);
        toast.success("Report rejected.");
      } else {
        await adminApi.requestReportChanges(selected.id, actionNote);
        toast.success("Changes requested from teacher.");
      }
      console.log(`[AdminReports] ${action} report:`, selected.id);
      setActionOpen(false);
      setActionNote("");
      setSelected(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally {
      setActing(false);
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {t("Session Reports Queue", "\u0637\u0627\u0628\u0648\u0631 \u062a\u0642\u0627\u0631\u064a\u0631 \u0627\u0644\u062c\u0644\u0633\u0627\u062a")}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t("Review and approve teacher session reports", "\u0631\u0627\u062c\u0639 \u0648\u0627\u0639\u062a\u0645\u062f \u062a\u0642\u0627\u0631\u064a\u0631 \u0627\u0644\u0645\u0639\u0644\u0645\u064a\u0646")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="SUBMITTED">Pending</option>
            <option value="ALL">All Reports</option>
          </select>
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("Refresh", "\u062a\u062d\u062f\u064a\u062b")}
          </Button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="font-bold text-gray-900">
            {t("No pending reports", "\u0644\u0627 \u062a\u0648\u062c\u062f \u062a\u0642\u0627\u0631\u064a\u0631 \u0645\u0639\u0644\u0642\u0629")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const cfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.SUBMITTED;
            const Icon = cfg.icon;
            const isExpanded = expandedId === report.id;

            return (
              <div key={report.id} className={cn(
                "bg-white rounded-2xl border overflow-hidden transition-all",
                report.status === "SUBMITTED" ? "border-blue-200" : "border-gray-100"
              )}>
                {/* Main Row */}
                <div className="p-4 flex items-start gap-4">
                  {/* Student Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {report.session.student.user.firstName[0]}{report.session.student.user.lastName[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-900 text-sm">
                        {report.session.student.user.firstName} {report.session.student.user.lastName}
                      </p>
                      <Badge variant="outline" className={cn("text-[10px] font-bold gap-1", cfg.bg, cfg.text)}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </Badge>
                      {report.isTrialAssessment && (
                        <Badge variant="outline" className="text-[10px] font-bold bg-purple-50 text-purple-700 border-purple-200 gap-1">
                          <GraduationCap className="w-3 h-3" />TRIAL
                        </Badge>
                      )}
                      {report.assignments.length > 0 && (
                        <Badge variant="outline" className="text-[10px] font-bold bg-accent/10 text-accent-foreground gap-1">
                          {report.assignments.length} {t("assignment", "\u0648\u0627\u062c\u0628")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-0.5">
                      {report.session.title} · {fmtDate(report.session.date)} {fmtTime(report.session.date)}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {t("Teacher:", "\u0627\u0644\u0645\u0639\u0644\u0645:")} {report.session.teacher?.user.firstName} {report.session.teacher?.user.lastName}
                      {report.submittedAt && ` · ${t("Submitted:", "\u0623\u0631\u0633\u0644:")} ${fmtDate(report.submittedAt)}`}
                    </p>

                    {/* Attendance quick summary */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className={cn("text-[10px] font-bold flex items-center gap-1",
                        report.studentAttended ? "text-emerald-600" : "text-red-500")}>
                        {report.studentAttended ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {t("Student", "\u0637\u0627\u0644\u0628")}
                      </span>
                      <span className={cn("text-[10px] font-bold flex items-center gap-1",
                        report.teacherAttended ? "text-emerald-600" : "text-red-500")}>
                        {report.teacherAttended ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {t("Teacher", "\u0645\u0639\u0644\u0645")}
                      </span>
                      {report.overallScore && (
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {report.overallScore}/5
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {report.status === "SUBMITTED" && (
                      <>
                        <Button size="sm" onClick={() => { setSelected(report); setAction("approve"); setActionOpen(true); }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t("Approve", "\u0627\u0639\u062a\u0645\u0627\u062f")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setSelected(report); setAction("changes"); setActionOpen(true); }}
                          className="text-amber-600 border-amber-200 hover:bg-amber-50 text-xs h-8 gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {t("Changes", "\u062a\u0639\u062f\u064a\u0644")}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setSelected(report); setAction("reject"); setActionOpen(true); }}
                          className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-8 gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          {t("Reject", "\u0631\u0641\u0636")}
                        </Button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                    {report.lessonSummary && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                          {t("Lesson Summary", "\u0645\u0644\u062e\u0635 \u0627\u0644\u062d\u0635\u0629")}
                        </p>
                        <p className="text-sm text-gray-700">{report.lessonSummary}</p>
                      </div>
                    )}
                    {report.nextLessonFocus && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                          {t("Next Lesson", "\u0627\u0644\u062d\u0635\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629")}
                        </p>
                        <p className="text-sm text-gray-700">{report.nextLessonFocus}</p>
                      </div>
                    )}
                    {/* Scores */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase text-gray-400">
                        {t("Evaluation", "\u0627\u0644\u062a\u0642\u064a\u064a\u0645")}
                      </p>
                      <ScoreBar label={t("Participation", "\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629")} score={report.participationScore} />
                      <ScoreBar label={t("Recitation", "\u0627\u0644\u062a\u0644\u0627\u0648\u0629")} score={report.recitationScore} />
                      <ScoreBar label={t("Tajweed", "\u0627\u0644\u062a\u062c\u0648\u064a\u062f")} score={report.tajweedScore} />
                      <ScoreBar label={t("Memorization", "\u0627\u0644\u062d\u0641\u0638")} score={report.memorizationScore} />
                      <ScoreBar label={t("Overall", "\u0627\u0644\u0639\u0627\u0645")} score={report.overallScore} />
                    </div>
                    {report.isTrialAssessment && report.recommendedLevel && (
                      <div className="rounded-xl bg-purple-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-purple-600 mb-1">
                          {t("Placement Assessment", "\u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0645\u0633\u062a\u0648\u0649")}
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {t("Recommended Level:", "\u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0645\u0642\u062a\u0631\u062d:")} {LEVEL_LABELS[report.recommendedLevel] || report.recommendedLevel}
                        </p>
                        {report.recommendedPlanNotes && (
                          <p className="text-xs text-gray-600 mt-1">{report.recommendedPlanNotes}</p>
                        )}
                      </div>
                    )}
                    {report.privateAdminNote && (
                      <div className="rounded-xl bg-amber-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-amber-600 mb-1">
                          {t("Private Note", "\u0645\u0644\u0627\u062d\u0638\u0629 \u062e\u0627\u0635\u0629")}
                        </p>
                        <p className="text-sm text-gray-700">{report.privateAdminNote}</p>
                      </div>
                    )}
                    {report.assignments.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">
                          {t("Assignments", "\u0627\u0644\u0648\u0627\u062c\u0628\u0627\u062a")} ({report.assignments.length})
                        </p>
                        {report.assignments.map((a) => (
                          <div key={a.id} className="flex items-center gap-2 py-1">
                            <div className={cn("w-1.5 h-1.5 rounded-full",
                              a.status === "PUBLISHED" ? "bg-emerald-400" : "bg-gray-300")} />
                            <p className="text-xs text-gray-700">{a.title}</p>
                            <span className="text-[10px] text-gray-400">{a.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {report.adminDecisionNote && (
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                          {t("Admin Decision Note", "\u0645\u0644\u0627\u062d\u0638\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629")}
                        </p>
                        <p className="text-sm text-gray-700">{report.adminDecisionNote}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="sm:max-w-md" dir={isRTL ? "rtl" : "ltr"}>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className={cn(
                  action === "approve" ? "text-emerald-600" :
                  action === "reject" ? "text-red-600" : "text-amber-600"
                )}>
                  {action === "approve" && <><CheckCircle2 className="inline w-5 h-5 me-2" />{t("Approve Report", "\u0627\u0639\u062a\u0645\u0627\u062f \u0627\u0644\u062a\u0642\u0631\u064a\u0631")}</>}
                  {action === "reject" && <><XCircle className="inline w-5 h-5 me-2" />{t("Reject Report", "\u0631\u0641\u0636 \u0627\u0644\u062a\u0642\u0631\u064a\u0631")}</>}
                  {action === "changes" && <><MessageSquare className="inline w-5 h-5 me-2" />{t("Request Changes", "\u0637\u0644\u0628 \u062a\u0639\u062f\u064a\u0644\u0627\u062a")}</>}
                </DialogTitle>
                <DialogDescription>
                  {selected.session.student.user.firstName} {selected.session.student.user.lastName}
                  {" — "}{selected.session.title}
                </DialogDescription>
              </DialogHeader>

              {action === "approve" && (
                <div className="space-y-3 py-2">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <p className="text-xs text-emerald-700 font-medium">
                      {t("Approving will:", "\u0627\u0644\u0627\u0639\u062a\u0645\u0627\u062f \u0633\u064a\u0642\u0648\u0645 \u0628\u0640:")}
                    </p>
                    <ul className="text-xs text-emerald-600 mt-1 space-y-0.5">
                      <li>✓ {t("Mark session as completed", "\u062a\u0645\u064a\u064a\u0632 \u0627\u0644\u062c\u0644\u0633\u0629 \u0643\u0645\u0643\u062a\u0645\u0644\u0629")}</li>
                      <li>✓ {t("Credit teacher wallet", "\u0625\u0636\u0627\u0641\u0629 \u0644\u0645\u062d\u0641\u0638\u0629 \u0627\u0644\u0645\u0639\u0644\u0645")}</li>
                      <li>✓ {t("Publish assignments to student", "\u0646\u0634\u0631 \u0627\u0644\u0648\u0627\u062c\u0628\u0627\u062a \u0644\u0644\u0637\u0627\u0644\u0628")}</li>
                      {selected.isTrialAssessment && (
                        <li>✓ {t("Update student level", "\u062a\u062d\u062f\u064a\u062b \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0637\u0627\u0644\u0628")}</li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">
                      {t("Admin Note (optional)", "\u0645\u0644\u0627\u062d\u0638\u0629 \u0627\u062e\u062a\u064a\u0627\u0631\u064a\u0629")}
                    </Label>
                    <Textarea
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      rows={2}
                      placeholder={t("Optional note...", "\u0645\u0644\u0627\u062d\u0638\u0629 \u0627\u062e\u062a\u064a\u0627\u0631\u064a\u0629...")}
                    />
                  </div>
                </div>
              )}

              {(action === "reject" || action === "changes") && (
                <div className="py-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-bold">
                      {action === "reject"
                        ? t("Reason for Rejection *", "\u0633\u0628\u0628 \u0627\u0644\u0631\u0641\u0636 *")
                        : t("Changes Required *", "\u0627\u0644\u062a\u0639\u062f\u064a\u0644\u0627\u062a \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 *")}
                    </Label>
                    <Textarea
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      rows={3}
                      placeholder={t("Explain to the teacher...", "\u0627\u0634\u0631\u062d \u0644\u0644\u0645\u0639\u0644\u0645...")}
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setActionOpen(false)} disabled={acting}>
                  {t("Cancel", "\u0625\u0644\u063a\u0627\u0621")}
                </Button>
                <Button
                  onClick={handleAction}
                  disabled={acting}
                  className={cn("gap-2 text-white",
                    action === "approve" ? "bg-emerald-500 hover:bg-emerald-600" :
                    action === "reject" ? "bg-red-500 hover:bg-red-600" :
                    "bg-amber-500 hover:bg-amber-600"
                  )}
                >
                  {acting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {action === "approve" && <>{t("Approve", "\u0627\u0639\u062a\u0645\u0627\u062f")}</>}
                  {action === "reject" && <>{t("Reject", "\u0631\u0641\u0636")}</>}
                  {action === "changes" && <>{t("Send", "\u0625\u0631\u0633\u0627\u0644")}</>}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}