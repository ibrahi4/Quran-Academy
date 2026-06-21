"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { teacherApi } from "@/lib/api/teacher";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  BookOpen, CheckCircle2, Clock, Star, Loader2,
  Eye, MessageSquare, RotateCcw, Send, User,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Submission {
  id: string;
  content?: string;
  linkUrl?: string;
  status: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  revisionRequested: boolean;
  student: { user: { firstName: string; lastName: string; email: string } };
}

interface Assignment {
  id: string;
  title: string;
  instructions: string;
  dueDate?: string;
  maxScore: number;
  status: string;
  student: { id: string; user: { firstName: string; lastName: string } };
  submissions: Submission[];
}

type TabKey = "pending_review" | "published" | "all";

export default function TeacherAssignmentsContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("pending_review");
  const [selected, setSelected] = useState<{ assignment: Assignment; submission: Submission } | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ score: 0, feedback: "", revisionRequested: false });
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [assignRes, pendingRes] = await Promise.allSettled([
        teacherApi.getMyAssignments(),
        teacherApi.getPendingSubmissions(),
      ]);
      if (assignRes.status === "fulfilled") {
        const data = Array.isArray(assignRes.value) ? assignRes.value : (assignRes.value as any)?.data || [];
        console.log("[TeacherAssignments] assignments:", data.length);
        setAssignments(data);
      }
      if (pendingRes.status === "fulfilled") {
        const data = Array.isArray(pendingRes.value) ? pendingRes.value : (pendingRes.value as any)?.data || [];
        console.log("[TeacherAssignments] pending submissions:", data.length);
        setPendingSubmissions(data);
      }
    } catch (e) {
      console.error("[TeacherAssignments] error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selected) return;
    try {
      setReviewing(true);
      await teacherApi.reviewSubmission(selected.submission.id, {
        score: reviewForm.score || undefined,
        feedback: reviewForm.feedback || undefined,
        revisionRequested: reviewForm.revisionRequested,
      });
      console.log("[TeacherAssignments] reviewed submission:", selected.submission.id);
      toast.success(t("Review submitted!", "\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062a\u0642\u064a\u064a\u0645!"));
      setReviewOpen(false);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally {
      setReviewing(false);
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString(
    isRTL ? "ar-EG" : "en-US", { month: "short", day: "numeric" }
  );

  const tabs = [
    { key: "pending_review" as TabKey, label: t("Needs Review", "\u062a\u062d\u062a\u0627\u062c \u0645\u0631\u0627\u062c\u0639\u0629"), count: pendingSubmissions.length },
    { key: "published" as TabKey, label: t("Published", "\u0645\u0646\u0634\u0648\u0631\u0629"), count: assignments.filter(a => a.status === "PUBLISHED").length },
    { key: "all" as TabKey, label: t("All", "\u0627\u0644\u0643\u0644"), count: assignments.length },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("Assignments", "\u0627\u0644\u0648\u0627\u062c\u0628\u0627\u062a")}</h1>
          <p className="text-xs text-gray-500">{t("Manage and review student assignments", "\u0625\u062f\u0627\u0631\u0629 \u0648\u0645\u0631\u0627\u062c\u0639\u0629 \u0648\u0627\u062c\u0628\u0627\u062a \u0627\u0644\u0637\u0644\u0627\u0628")}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 pt-3 border-b border-gray-100">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={cn("relative px-4 py-3 text-sm font-bold transition-colors flex items-center gap-2",
                  activeTab === tab.key ? "text-primary" : "text-gray-500 hover:text-gray-900")}>
                {tab.label}
                {tab.count > 0 && (
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    activeTab === tab.key ? "bg-primary text-white" : "bg-gray-100 text-gray-600")}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : activeTab === "pending_review" ? (
          pendingSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{t("No pending reviews", "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0631\u0627\u062c\u0639\u0627\u062a \u0645\u0639\u0644\u0642\u0629")}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pendingSubmissions.map((sub: any) => (
                <div key={sub.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {sub.student.user.firstName[0]}{sub.student.user.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">
                        {sub.student.user.firstName} {sub.student.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{sub.assignment?.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {t("Submitted:", "\u0623\u0631\u0633\u0644:")} {fmtDate(sub.submittedAt)}
                        {sub.status === "LATE" && (
                          <span className="ms-2 text-red-500 font-bold">{t("LATE", "\u0645\u062a\u0623\u062e\u0631")}</span>
                        )}
                      </p>
                      {sub.content && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{sub.content}</p>
                      )}
                    </div>
                    <Button size="sm" onClick={() => {
                      setSelected({ assignment: sub.assignment, submission: sub });
                      setReviewForm({ score: 0, feedback: "", revisionRequested: false });
                      setReviewOpen(true);
                    }} className="bg-primary text-white text-xs h-8 gap-1">
                      <Star className="w-3.5 h-3.5" />
                      {t("Review", "\u0645\u0631\u0627\u062c\u0639\u0629")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          assignments.filter(a => activeTab === "all" || a.status === "PUBLISHED").length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{t("No assignments", "\u0644\u0627 \u062a\u0648\u062c\u062f \u0648\u0627\u062c\u0628\u0627\u062a")}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {assignments
                .filter(a => activeTab === "all" || a.status === "PUBLISHED")
                .map((a) => {
                  const gradedCount = a.submissions.filter(s => s.status === "GRADED").length;
                  return (
                    <div key={a.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm">{a.title}</p>
                          <p className="text-xs text-gray-500">
                            <User className="inline w-3 h-3 me-1" />
                            {a.student.user.firstName} {a.student.user.lastName}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                              a.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600")}>
                              {a.status}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {a.submissions.length} {t("submissions", "\u062a\u0633\u0644\u064a\u0645\u0627\u062a")}
                              {gradedCount > 0 && ` · ${gradedCount} ${t("graded", "\u0645\u0635\u062d\u062d")}`}
                            </span>
                            {a.dueDate && (
                              <span className="text-[10px] text-gray-400">
                                {t("Due:", "\u062a\u0633\u0644\u064a\u0645:")} {fmtDate(a.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{a.maxScore} {t("pts", "\u062f\u0631\u062c\u0629")}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md" dir={isRTL ? "rtl" : "ltr"}>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-primary flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {t("Review Submission", "\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u062a\u0633\u0644\u064a\u0645")}
                </DialogTitle>
                <DialogDescription>
                  {selected.submission.student.user.firstName} {selected.submission.student.user.lastName}
                  {" — "}{selected.assignment.title}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {selected.submission.content && (
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                      {t("Student Answer", "\u0625\u062c\u0627\u0628\u0629 \u0627\u0644\u0637\u0627\u0644\u0628")}
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.submission.content}</p>
                  </div>
                )}
                {selected.submission.linkUrl && (
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-blue-600 mb-1">
                      {t("Submitted Link", "\u0631\u0627\u0628\u0637 \u0627\u0644\u062a\u0633\u0644\u064a\u0645")}
                    </p>
                    <a href={selected.submission.linkUrl} target="_blank" rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all">
                      {selected.submission.linkUrl}
                    </a>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold">
                    {t("Score", "\u0627\u0644\u062f\u0631\u062c\u0629")} (0 - {selected.assignment.maxScore})
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={selected.assignment.maxScore}
                    value={reviewForm.score}
                    onChange={(e) => setReviewForm({ ...reviewForm, score: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold">
                    {t("Feedback", "\u0645\u0644\u0627\u062d\u0638\u0627\u062a")}
                  </Label>
                  <Textarea
                    value={reviewForm.feedback}
                    onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                    rows={3}
                    placeholder={t("Detailed feedback for the student...", "\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u062a\u0641\u0635\u064a\u0644\u064a\u0629...")}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewForm.revisionRequested}
                    onChange={(e) => setReviewForm({ ...reviewForm, revisionRequested: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-gray-700 flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-purple-500" />
                    {t("Request revision from student", "\u0637\u0644\u0628 \u0645\u0631\u0627\u062c\u0639\u0629 \u0645\u0646 \u0627\u0644\u0637\u0627\u0644\u0628")}
                  </span>
                </label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewOpen(false)}>
                  {t("Cancel", "\u0625\u0644\u063a\u0627\u0621")}
                </Button>
                <Button onClick={handleReview} disabled={reviewing} className="bg-primary text-white gap-2">
                  {reviewing && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" />
                  {t("Submit Review", "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}