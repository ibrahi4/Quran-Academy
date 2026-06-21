"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { teacherApi } from "@/lib/api/teacher";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2, Loader2, Star, BookOpen, ClipboardList,
  User, GraduationCap, AlertTriangle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
interface Session {
  id: string;
  title: string;
  date: string;
  duration: number;
  student: { id: string; user: { firstName: string; lastName: string } };
  booking?: { type?: string } | null;
}

interface ReportForm {
  studentAttended: boolean;
  teacherAttended: boolean;
  studentLateMins: number;
  teacherLateMins: number;
  lessonSummary: string;
  teacherNotes: string;
  nextLessonFocus: string;
  privateAdminNote: string;
  participationScore: number;
  recitationScore: number;
  tajweedScore: number;
  memorizationScore: number;
  overallScore: number;
  evaluationNotes: string;
  isTrialAssessment: boolean;
  recommendedLevel: string;
  recommendedPlanNotes: string;
}

interface AssignmentForm {
  title: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
}

const INIT_REPORT: ReportForm = {
  studentAttended: true,
  teacherAttended: true,
  studentLateMins: 0,
  teacherLateMins: 0,
  lessonSummary: "",
  teacherNotes: "",
  nextLessonFocus: "",
  privateAdminNote: "",
  participationScore: 5,
  recitationScore: 5,
  tajweedScore: 5,
  memorizationScore: 5,
  overallScore: 5,
  evaluationNotes: "",
  isTrialAssessment: false,
  recommendedLevel: "BEGINNER",
  recommendedPlanNotes: "",
};

const INIT_ASSIGNMENT: AssignmentForm = {
  title: "",
  instructions: "",
  dueDate: "",
  maxScore: 100,
};

const LEVELS = [
  { value: "BEGINNER", en: "Beginner", ar: "\u0645\u0628\u062a\u062f\u0626" },
  { value: "INTERMEDIATE", en: "Intermediate", ar: "\u0645\u062a\u0648\u0633\u0637" },
  { value: "ADVANCED", en: "Advanced", ar: "\u0645\u062a\u0642\u062f\u0645" },
  { value: "HAFIZ", en: "Hafiz", ar: "\u062d\u0627\u0641\u0638" },
];

// ── Score Selector ─────────────────────────────────────────────
function ScoreSelector({
  label, value, onChange, isRTL,
}: { label: string; value: number; onChange: (v: number) => void; isRTL: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-600">{label}</Label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "w-9 h-9 rounded-lg text-sm font-bold transition-all",
              value >= s
                ? "bg-amber-400 text-white shadow-sm"
                : "bg-gray-100 text-gray-400 hover:bg-amber-100"
            )}
          >
            {s}
          </button>
        ))}
        <Star className={cn("w-4 h-4 ms-1", value > 0 ? "text-amber-400 fill-amber-400" : "text-gray-300")} />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  session: Session | null;
  isTrial?: boolean;
  onSuccess: () => void;
}

export default function SubmitReportDialog({ open, onOpenChange, session, isTrial = false, onSuccess }: Props) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [step, setStep] = useState<"report" | "evaluation" | "trial" | "assignment" | "done">("report");
  const [form, setForm] = useState<ReportForm>({ ...INIT_REPORT, isTrialAssessment: isTrial });
  const [assignment, setAssignment] = useState<AssignmentForm>(INIT_ASSIGNMENT);
  const [addAssignment, setAddAssignment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const studentName = session
    ? `${session.student.user.firstName} ${session.student.user.lastName}`
    : "";

  const handleReset = () => {
    setStep("report");
    setForm({ ...INIT_REPORT, isTrialAssessment: isTrial });
    setAssignment(INIT_ASSIGNMENT);
    setAddAssignment(false);
  };

  const handleSubmit = async () => {
    if (!session) return;
    try {
      setSubmitting(true);

      // 1. Submit report
      const report = await teacherApi.submitReport({
        sessionId: session.id,
        ...form,
        recommendedLevel: form.isTrialAssessment ? form.recommendedLevel : undefined,
        recommendedPlanNotes: form.isTrialAssessment ? form.recommendedPlanNotes : undefined,
      }) as any;

      console.log("[SubmitReport] report submitted:", report);

      // 2. Create assignment if added
      if (addAssignment && assignment.title.trim()) {
        await teacherApi.createAssignment({
          title: assignment.title,
          instructions: assignment.instructions,
          studentId: session.student.id,
          sessionId: session.id,
          reportId: report?.id,
          dueDate: assignment.dueDate || undefined,
          maxScore: assignment.maxScore,
        });
        console.log("[SubmitReport] assignment created");
      }

      toast.success(t(
        "Report submitted! Awaiting admin review.",
        "\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062a\u0642\u0631\u064a\u0631! \u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629."
      ));

      setStep("done");
      onSuccess();
    } catch (e: any) {
      console.error("[SubmitReport] error:", e);
      toast.error(e?.message || t("Failed to submit report", "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062a\u0642\u0631\u064a\u0631"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const steps = isTrial
    ? ["report", "evaluation", "trial", "assignment"]
    : ["report", "evaluation", "assignment"];

  const currentIdx = steps.indexOf(step as any);
  const isLast = currentIdx === steps.length - 1;

  const nextStep = () => {
    const next = steps[currentIdx + 1];
    if (next) setStep(next as any);
  };

  const prevStep = () => {
    const prev = steps[currentIdx - 1];
    if (prev) setStep(prev as any);
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            {t("Submit Session Report", "\u0625\u0631\u0633\u0627\u0644 \u062a\u0642\u0631\u064a\u0631 \u0627\u0644\u062c\u0644\u0633\u0629")}
          </DialogTitle>
          <DialogDescription>
            {studentName} — {session.title}
            {isTrial && (
              <span className="ms-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                <GraduationCap className="w-3 h-3" />
                TRIAL
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        {step !== "done" && (
          <div className="flex items-center gap-2 mb-2">
            {steps.map((s, i) => (
              <div key={s} className={cn(
                "h-1 flex-1 rounded-full transition-all",
                i <= currentIdx ? "bg-primary" : "bg-gray-200"
              )} />
            ))}
          </div>
        )}

        {/* ── STEP 1: Attendance + Session Notes ── */}
        {step === "report" && (
          <div className="space-y-5">
            {/* Attendance */}
            <div>
              <Label className="text-sm font-bold text-gray-900 mb-3 block">
                {t("Attendance", "\u0627\u0644\u062d\u0636\u0648\u0631")}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "studentAttended", label: t("Student Attended", "\u0627\u0644\u0637\u0627\u0644\u0628 \u062d\u0636\u0631") },
                  { key: "teacherAttended", label: t("I Attended", "\u0623\u0646\u0627 \u062d\u0636\u0631\u062a") },
                ].map(({ key, label }) => (
                  <label key={key} className="cursor-pointer">
                    <div className={cn(
                      "p-3 rounded-xl border-2 flex items-center gap-2 transition-all",
                      form[key as keyof ReportForm]
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}>
                      <input
                        type="checkbox"
                        checked={form[key as keyof ReportForm] as boolean}
                        onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center border-2 shrink-0",
                        form[key as keyof ReportForm]
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-gray-300"
                      )}>
                        {form[key as keyof ReportForm] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Late mins */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">
                  {t("Student Late (min)", "\u062a\u0623\u062e\u0631 \u0627\u0644\u0637\u0627\u0644\u0628")}
                </Label>
                <Input type="number" min={0} value={form.studentLateMins}
                  onChange={(e) => setForm({ ...form, studentLateMins: parseInt(e.target.value) || 0 })}
                  className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">
                  {t("My Late (min)", "\u062a\u0623\u062e\u0631\u064a")}
                </Label>
                <Input type="number" min={0} value={form.teacherLateMins}
                  onChange={(e) => setForm({ ...form, teacherLateMins: parseInt(e.target.value) || 0 })}
                  className="h-9" />
              </div>
            </div>

            {/* Lesson Summary */}
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-gray-900">
                {t("Lesson Summary", "\u0645\u0644\u062e\u0635 \u0627\u0644\u062d\u0635\u0629")}
              </Label>
              <Textarea
                value={form.lessonSummary}
                onChange={(e) => setForm({ ...form, lessonSummary: e.target.value })}
                rows={3}
                placeholder={t("What was covered today...", "\u0645\u0627\u0630\u0627 \u062a\u0645 \u062a\u063a\u0637\u064a\u062a\u0647 \u0627\u0644\u064a\u0648\u0645...")}
              />
            </div>

            {/* Next Lesson Focus */}
            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-gray-900">
                {t("Next Lesson Focus", "\u062a\u0631\u0643\u064a\u0632 \u0627\u0644\u062d\u0635\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629")}
              </Label>
              <Textarea
                value={form.nextLessonFocus}
                onChange={(e) => setForm({ ...form, nextLessonFocus: e.target.value })}
                rows={2}
                placeholder={t("Plan for next session...", "\u062e\u0637\u0629 \u0627\u0644\u062c\u0644\u0633\u0629 \u0627\u0644\u0642\u0627\u062f\u0645\u0629...")}
              />
            </div>

            {/* Private note */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {t("Private Admin Note (not visible to student)", "\u0645\u0644\u0627\u062d\u0638\u0629 \u062e\u0627\u0635\u0629 \u0644\u0644\u0625\u062f\u0627\u0631\u0629")}
              </Label>
              <Textarea
                value={form.privateAdminNote}
                onChange={(e) => setForm({ ...form, privateAdminNote: e.target.value })}
                rows={2}
                placeholder={t("Optional...", "\u0627\u062e\u062a\u064a\u0627\u0631\u064a...")}
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: Student Evaluation ── */}
        {step === "evaluation" && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-primary" />
                <p className="font-bold text-gray-900 text-sm">{studentName}</p>
              </div>
              <p className="text-xs text-gray-500">
                {t("Rate student performance (1-5)", "\u0642\u064a\u0651\u0645 \u0623\u062f\u0627\u0621 \u0627\u0644\u0637\u0627\u0644\u0628 (1-5)")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ScoreSelector
                label={t("Participation", "\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629")}
                value={form.participationScore}
                onChange={(v) => setForm({ ...form, participationScore: v })}
                isRTL={isRTL}
              />
              <ScoreSelector
                label={t("Recitation", "\u0627\u0644\u062a\u0644\u0627\u0648\u0629")}
                value={form.recitationScore}
                onChange={(v) => setForm({ ...form, recitationScore: v })}
                isRTL={isRTL}
              />
              <ScoreSelector
                label={t("Tajweed", "\u0627\u0644\u062a\u062c\u0648\u064a\u062f")}
                value={form.tajweedScore}
                onChange={(v) => setForm({ ...form, tajweedScore: v })}
                isRTL={isRTL}
              />
              <ScoreSelector
                label={t("Memorization", "\u0627\u0644\u062d\u0641\u0638")}
                value={form.memorizationScore}
                onChange={(v) => setForm({ ...form, memorizationScore: v })}
                isRTL={isRTL}
              />
            </div>

            <ScoreSelector
              label={t("Overall Score", "\u0627\u0644\u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0639\u0627\u0645")}
              value={form.overallScore}
              onChange={(v) => setForm({ ...form, overallScore: v })}
              isRTL={isRTL}
            />

            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-gray-900">
                {t("Evaluation Notes", "\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0627\u0644\u062a\u0642\u064a\u064a\u0645")}
              </Label>
              <Textarea
                value={form.evaluationNotes}
                onChange={(e) => setForm({ ...form, evaluationNotes: e.target.value })}
                rows={3}
                placeholder={t("Student strengths and areas for improvement...",
                  "\u0646\u0642\u0627\u0637 \u0627\u0644\u0642\u0648\u0629 \u0648\u0645\u062c\u0627\u0644\u0627\u062a \u0627\u0644\u062a\u062d\u0633\u064a\u0646...")}
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: Trial Assessment (only for trial) ── */}
        {step === "trial" && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <p className="font-bold text-purple-900 text-sm">
                  {t("Placement Assessment", "\u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0645\u0633\u062a\u0648\u0649")}
                </p>
              </div>
              <p className="text-xs text-purple-700">
                {t("This will update the student's official level after admin approval.",
                  "\u0633\u064a\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0637\u0627\u0644\u0628 \u0628\u0639\u062f \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629.")}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-900">
                {t("Recommended Level", "\u0627\u0644\u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0645\u0642\u062a\u0631\u062d")}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setForm({ ...form, recommendedLevel: level.value })}
                    className={cn(
                      "p-3 rounded-xl border-2 text-sm font-bold transition-all text-start",
                      form.recommendedLevel === level.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-700 hover:border-primary/30"
                    )}
                  >
                    {isRTL ? level.ar : level.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-bold text-gray-900">
                {t("Recommended Plan Notes", "\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u0645\u0642\u062a\u0631\u062d\u0629")}
              </Label>
              <Textarea
                value={form.recommendedPlanNotes}
                onChange={(e) => setForm({ ...form, recommendedPlanNotes: e.target.value })}
                rows={3}
                placeholder={t("What plan/schedule do you recommend for this student?",
                  "\u0645\u0627 \u0647\u064a \u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u062a\u064a \u062a\u0648\u0635\u064a \u0628\u0647\u0627 \u0644\u0647\u0630\u0627 \u0627\u0644\u0637\u0627\u0644\u0628\u061f")}
              />
            </div>
          </div>
        )}

        {/* ── STEP 4: Assignment (optional) ── */}
        {step === "assignment" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/5 border border-accent/15">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent" />
                <p className="font-bold text-gray-900 text-sm">
                  {t("Add Homework Assignment?", "\u0625\u0636\u0627\u0641\u0629 \u0648\u0627\u062c\u0628\u061f")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddAssignment(!addAssignment)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  addAssignment ? "bg-primary" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                  addAssignment ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            {addAssignment && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-gray-900">
                    {t("Assignment Title", "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0648\u0627\u062c\u0628")} *
                  </Label>
                  <Input
                    value={assignment.title}
                    onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
                    placeholder={t("e.g. Revise Surah Al-Baqarah verses 1-5",
                      "\u0645\u062b\u0627\u0644: \u0645\u0631\u0627\u062c\u0639\u0629 \u0633\u0648\u0631\u0629 \u0627\u0644\u0628\u0642\u0631\u0629 1-5")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-gray-900">
                    {t("Instructions", "\u0627\u0644\u062a\u0639\u0644\u064a\u0645\u0627\u062a")} *
                  </Label>
                  <Textarea
                    value={assignment.instructions}
                    onChange={(e) => setAssignment({ ...assignment, instructions: e.target.value })}
                    rows={3}
                    placeholder={t("Detailed instructions for the student...",
                      "\u062a\u0639\u0644\u064a\u0645\u0627\u062a \u062a\u0641\u0635\u064a\u0644\u064a\u0629 \u0644\u0644\u0637\u0627\u0644\u0628...")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-600">
                      {t("Due Date", "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u062a\u0633\u0644\u064a\u0645")}
                    </Label>
                    <Input
                      type="date"
                      value={assignment.dueDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setAssignment({ ...assignment, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-600">
                      {t("Max Score", "\u0627\u0644\u062f\u0631\u062c\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629")}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={assignment.maxScore}
                      onChange={(e) => setAssignment({ ...assignment, maxScore: parseInt(e.target.value) || 100 })}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-700">
                    {t(
                      "Assignment will be published to student after admin approves the report.",
                      "\u0633\u064a\u062a\u0645 \u0646\u0634\u0631 \u0627\u0644\u0648\u0627\u062c\u0628 \u0628\u0639\u062f \u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u062a\u0642\u0631\u064a\u0631."
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DONE ── */}
        {step === "done" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              {t("Report Submitted!", "\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062a\u0642\u0631\u064a\u0631!")}
            </h3>
            <p className="text-sm text-gray-500">
              {t(
                "The admin will review and approve your report. Session will be officially completed after approval.",
                "\u0633\u064a\u0631\u0627\u062c\u0639 \u0627\u0644\u0625\u062f\u0627\u0631\u064a \u062a\u0642\u0631\u064a\u0631\u0643 \u0648\u064a\u0639\u062a\u0645\u062f\u0647."
              )}
            </p>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="flex items-center gap-2">
          {step !== "done" && (
            <>
              {currentIdx > 0 && (
                <Button variant="outline" onClick={prevStep} disabled={submitting}>
                  {t("Back", "\u0631\u062c\u0648\u0639")}
                </Button>
              )}
              <Button variant="outline" onClick={handleClose} disabled={submitting}>
                {t("Cancel", "\u0625\u0644\u063a\u0627\u0621")}
              </Button>
              {isLast ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-primary hover:bg-primary/90 text-white gap-2 flex-1"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <CheckCircle2 className="w-4 h-4" />
                  {t("Submit Report", "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062a\u0642\u0631\u064a\u0631")}
                </Button>
              ) : (
                <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 text-white gap-2 flex-1">
                  {t("Next", "\u0627\u0644\u062a\u0627\u0644\u064a")}
                </Button>
              )}
            </>
          )}
          {step === "done" && (
            <Button onClick={handleClose} className="w-full bg-primary text-white">
              {t("Close", "\u0625\u063a\u0644\u0627\u0642")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}