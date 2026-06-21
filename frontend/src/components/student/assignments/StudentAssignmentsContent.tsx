"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useAuthStore } from "@/stores/useAuthStore";
import studentApi from "@/lib/api/student";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  BookOpen, CheckCircle2, Clock, AlertCircle, Loader2,
  Star, Send, Eye, RotateCcw,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Assignment {
  id: string;
  title: string;
  instructions: string;
  dueDate?: string;
  maxScore: number;
  status: string;
  isOverdue: boolean;
  teacher: { user: { firstName: string; lastName: string } };
  session?: { title: string; date: string };
  mySubmission?: {
    id: string;
    content?: string;
    linkUrl?: string;
    status: string;
    submittedAt: string;
    score?: number;
    feedback?: string;
    revisionRequested: boolean;
  } | null;
}

type TabKey = "pending" | "submitted" | "graded";

const STATUS_CONFIG: Record<string, { en: string; ar: string; bg: string; text: string; icon: any }> = {
  pending:   { en: "Pending",   ar: "\u0645\u0639\u0644\u0642",    bg: "bg-amber-50",   text: "text-amber-700",   icon: Clock },
  submitted: { en: "Submitted", ar: "\u0645\u0631\u0633\u0644",    bg: "bg-blue-50",    text: "text-blue-700",    icon: Send },
  graded:    { en: "Graded",    ar: "\u0645\u0635\u062d\u062d",    bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  overdue:   { en: "Overdue",   ar: "\u0645\u062a\u0623\u062e\u0631", bg: "bg-red-50",  text: "text-red-700",     icon: AlertCircle },
  revision:  { en: "Revision",  ar: "\u0645\u0631\u0627\u062c\u0639\u0629", bg: "bg-purple-50", text: "text-purple-700", icon: RotateCcw },
};

export default function StudentAssignmentsContent() {
  const { isRTL } = useLocale();
  const { user } = useAuthStore();
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ content: "", linkUrl: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await studentApi.getMyAssignments();
      console.log("[StudentAssignments] assignments:", res);
      setAssignments(Array.isArray(res) ? res : (res as any)?.data || []);
    } catch (e) {
      console.error("[StudentAssignments] error:", e);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (a: Assignment): TabKey => {
    if (!a.mySubmission) return "pending";
    if (a.mySubmission.status === "GRADED") return "graded";
    return "submitted";
  };

  const filtered = assignments.filter((a) => {
    const status = getAssignmentStatus(a);
    return status === activeTab;
  });

  const counts = {
    pending: assignments.filter(a => !a.mySubmission).length,
    submitted: assignments.filter(a => a.mySubmission && a.mySubmission.status !== "GRADED").length,
    graded: assignments.filter(a => a.mySubmission?.status === "GRADED").length,
  };

  const handleSubmit = async () => {
    if (!selected) return;
    if (!submitForm.content.trim() && !submitForm.linkUrl.trim()) {
      toast.error(t("Please add content or a link", "\u0623\u0636\u0641 \u0645\u062d\u062a\u0648\u0649 \u0623\u0648 \u0631\u0627\u0628\u0637\u0627\u064b"));
      return;
    }
    try {
      setSubmitting(true);
      await studentApi.submitAssignment(selected.id, {
        content: submitForm.content || undefined,
        linkUrl: submitForm.linkUrl || undefined,
      });
      console.log("[StudentAssignments] submitted:", selected.id);
      toast.success(t("Assignment submitted!", "\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0648\u0627\u062c\u0628!"));
      setSubmitOpen(false);
      setSubmitForm({ content: "", linkUrl: "" });
      load();
    } catch (e: any) {
      toast.error(e?.message || t("Failed", "\u0641\u0634\u0644"));
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString(
    isRTL ? "ar-EG" : "en-US", { month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <div className="space-y-5 max-w-4xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 pt-3 border-b border-gray-100">
          <div className="flex gap-1">
            {(["pending", "submitted", "graded"] as TabKey[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn("relative px-4 py-3 text-sm font-bold transition-colors flex items-center gap-2",
                  activeTab === tab ? "text-primary" : "text-gray-500 hover:text-gray-900")}>
                {tab === "pending" && t("Pending", "\u0645\u0639\u0644\u0642\u0629")}
                {tab === "submitted" && t("Submitted", "\u0645\u0631\u0633\u0644\u0629")}
                {tab === "graded" && t("Graded", "\u0645\u0635\u062d\u062d\u0629")}
                {counts[tab] > 0 && (
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    activeTab === tab ? "bg-primary text-white" : "bg-gray-100 text-gray-600")}>
                    {counts[tab]}
                  </span>
                )}
                {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{t("No assignments here", "\u0644\u0627 \u062a\u0648\u062c\u062f \u0648\u0627\u062c\u0628\u0627\u062a")}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((a) => {
              const status = getAssignmentStatus(a);
              const isOverdue = a.isOverdue && status === "pending";
              const cfg = isOverdue ? STATUS_CONFIG.overdue : STATUS_CONFIG[status];
              const needsRevision = a.mySubmission?.revisionRequested;
              const Icon = needsRevision ? STATUS_CONFIG.revision.icon : cfg.icon;

              return (
                <div key={a.id} className={cn("p-4 hover:bg-gray-50/50 transition-colors",
                  isOverdue && "bg-red-50/20")}>
                  <div className="flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      needsRevision ? STATUS_CONFIG.revision.bg : cfg.bg)}>
                      <Icon className={cn("w-5 h-5",
                        needsRevision ? STATUS_CONFIG.revision.text : cfg.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-sm">{a.title}</h3>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold",
                          needsRevision ? `${STATUS_CONFIG.revision.bg} ${STATUS_CONFIG.revision.text}` : `${cfg.bg} ${cfg.text}`)}>
                          {needsRevision
                            ? t("Needs Revision", "\u062a\u062d\u062a\u0627\u062c \u0645\u0631\u0627\u062c\u0639\u0629")
                            : isRTL ? cfg.ar : cfg.en}
                        </span>
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600">
                            {t("Overdue!", "\u0645\u062a\u0623\u062e\u0631!")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        {t("Teacher:", "\u0627\u0644\u0645\u0639\u0644\u0645:")} {a.teacher.user.firstName} {a.teacher.user.lastName}
                      </p>
                      {a.dueDate && (
                        <p className={cn("text-xs", isOverdue ? "text-red-600 font-bold" : "text-gray-400")}>
                          {t("Due:", "\u0627\u0644\u062a\u0633\u0644\u064a\u0645:")} {fmtDate(a.dueDate)}
                        </p>
                      )}
                      {a.mySubmission?.score !== undefined && a.mySubmission?.score !== null && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-sm font-bold text-gray-900">
                            {a.mySubmission.score}/{a.maxScore}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setSelected(a); setViewOpen(true); }}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {(status === "pending" || needsRevision) && (
                        <Button size="sm"
                          onClick={() => {
                            setSelected(a);
                            setSubmitForm({
                              content: a.mySubmission?.content || "",
                              linkUrl: a.mySubmission?.linkUrl || "",
                            });
                            setSubmitOpen(true);
                          }}
                          className="bg-primary text-white text-xs h-8 gap-1">
                          <Send className="w-3.5 h-3.5" />
                          {needsRevision ? t("Resubmit", "\u0625\u0639\u0627\u062f\u0629 \u0625\u0631\u0633\u0627\u0644") : t("Submit", "\u0625\u0631\u0633\u0627\u0644")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? "rtl" : "ltr"}>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.teacher.user.firstName} {selected.teacher.user.lastName}
                  {selected.dueDate && ` · ${t("Due", "\u062a\u0633\u0644\u064a\u0645")} ${fmtDate(selected.dueDate)}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                    {t("Instructions", "\u0627\u0644\u062a\u0639\u0644\u064a\u0645\u0627\u062a")}
                  </p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.instructions}</p>
                </div>

                {selected.mySubmission && (
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-2">
                      {t("Your Submission", "\u0625\u062c\u0627\u0628\u062a\u0643")}
                    </p>
                    {selected.mySubmission.content && (
                      <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">{selected.mySubmission.content}</p>
                    )}
                    {selected.mySubmission.linkUrl && (
                      <a href={selected.mySubmission.linkUrl} target="_blank" rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all">
                        {selected.mySubmission.linkUrl}
                      </a>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {t("Submitted:", "\u0623\u0631\u0633\u0644\u062a:")} {fmtDate(selected.mySubmission.submittedAt)}
                    </p>
                  </div>
                )}

                {selected.mySubmission?.feedback && (
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs font-bold text-emerald-600 uppercase mb-2">
                      {t("Teacher Feedback", "\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0627\u0644\u0645\u0639\u0644\u0645")}
                    </p>
                    <p className="text-sm text-gray-800">{selected.mySubmission.feedback}</p>
                    {selected.mySubmission.score !== undefined && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-gray-900">
                          {selected.mySubmission.score}/{selected.maxScore}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? "rtl" : "ltr"}>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{t("Submit Assignment", "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0648\u0627\u062c\u0628")}</DialogTitle>
                <DialogDescription>{selected.title}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-3">{selected.instructions}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold">{t("Your Answer", "\u0625\u062c\u0627\u0628\u062a\u0643")}</Label>
                  <Textarea
                    value={submitForm.content}
                    onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
                    rows={5}
                    placeholder={t("Write your answer here...", "\u0627\u0643\u062a\u0628 \u0625\u062c\u0627\u0628\u062a\u0643 \u0647\u0646\u0627...")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">{t("Or submit a link (optional)", "\u0623\u0648 \u0623\u0631\u0633\u0644 \u0631\u0627\u0628\u0637\u0627\u064b")}</Label>
                  <Input
                    value={submitForm.linkUrl}
                    onChange={(e) => setSubmitForm({ ...submitForm, linkUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSubmitOpen(false)}>
                  {t("Cancel", "\u0625\u0644\u063a\u0627\u0621")}
                </Button>
                <Button onClick={handleSubmit} disabled={submitting} className="bg-primary text-white gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" />
                  {t("Submit", "\u0625\u0631\u0633\u0627\u0644")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}