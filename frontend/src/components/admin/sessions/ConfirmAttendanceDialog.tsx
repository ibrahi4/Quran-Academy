'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import api from '@/lib/api/client';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  Loader2, CheckCircle2, XCircle, DollarSign,
  AlertCircle, Clock, User, GraduationCap,
  FileText, ArrowRight, ShieldAlert, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface SessionData {
  id: string;
  title: string;
  date: string;
  duration: number;
  status: string;
  student?: {
    id: string;
    user?: { firstName: string; lastName: string; email: string };
  };
  teacher?: {
    id: string;
    hourlyRate?: number | string;
    user?: { firstName: string; lastName: string };
  };
  teacherId?: string;
}

interface ExistingReport {
  id: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  studentAttended?: boolean;
  teacherAttended?: boolean;
  studentLateMins?: number;
  teacherLateMins?: number;
  teacherNotes?: string;
  lessonSummary?: string;
  overallScore?: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: SessionData | null;
  onSuccess: () => void;
}

export default function ConfirmAttendanceDialog({ open, onOpenChange, session, onSuccess }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === 'ar';
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [existingReport, setExistingReport] = useState<ExistingReport | null>(null);
  const [checkingReport, setCheckingReport] = useState(true);

  const [teacherAttended, setTeacherAttended] = useState(true);
  const [studentAttended, setStudentAttended] = useState(true);
  const [teacherLate, setTeacherLate] = useState(0);
  const [studentLate, setStudentLate] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !session) return;

    const checkReport = async () => {
      try {
        setCheckingReport(true);
        const res = await api.get(`/session-reports/by-session/${session.id}`);
        const report = (res as any)?.data ?? res;
        console.log('[ConfirmDialog] existing report:', report);
        setExistingReport(report || null);

        // Pre-fill from report
        if (report) {
          setTeacherAttended(report.teacherAttended ?? true);
          setStudentAttended(report.studentAttended ?? true);
          setTeacherLate(report.teacherLateMins ?? 0);
          setStudentLate(report.studentLateMins ?? 0);
          setNotes(report.teacherNotes || '');
        } else {
          setTeacherAttended(true);
          setStudentAttended(true);
          setTeacherLate(0);
          setStudentLate(0);
          setNotes('');
        }
      } catch (e) {
        console.log('[ConfirmDialog] no report found');
        setExistingReport(null);
        setTeacherAttended(true);
        setStudentAttended(true);
        setTeacherLate(0);
        setStudentLate(0);
        setNotes('');
      } finally {
        setCheckingReport(false);
      }
    };

    checkReport();
  }, [open, session]);

  if (!session) return null;

  const hourlyRate = Number(session.teacher?.hourlyRate || 0);
  const earnings = teacherAttended
    ? Math.round((session.duration / 60) * hourlyRate * 100) / 100
    : 0;

  const studentName = session.student?.user
    ? `${session.student.user.firstName} ${session.student.user.lastName}`
    : 'Student';

  const teacherName = session.teacher?.user
    ? `${session.teacher.user.firstName} ${session.teacher.user.lastName}`
    : 'Teacher';

  const fmtDate = (d: string) => new Date(d).toLocaleString(isRTL ? 'ar-EG' : 'en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const goToReports = () => {
    onOpenChange(false);
    router.push(`/${locale}/admin/reports`);
  };

  const reportStatus = existingReport?.status;
  const isApproved = reportStatus === 'APPROVED';
  const isPendingApproval = reportStatus === 'SUBMITTED' || reportStatus === 'CHANGES_REQUESTED';
  const noReport = !existingReport;
  const canConfirm = isApproved || noReport;

  const handleSubmit = async () => {
    if (!canConfirm) {
      toast.error(t('Approve the report first', '\u0627\u0639\u062A\u0645\u062F \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0623\u0648\u0644\u0627\u064B'));
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.confirmAttendance(session.id, {
        teacherAttended,
        studentAttended,
        teacherLateMins: teacherLate,
        studentLateMins: studentLate,
        teacherNotes: notes || undefined,
      });

      if (teacherAttended) {
        toast.success(
          t(`Session confirmed! +$${earnings} credited to ${teacherName}`, `\u062A\u0645 \u0627\u0644\u062A\u0623\u0643\u064A\u062F! +$${earnings}`),
          { duration: 5000 },
        );
      } else {
        toast.success(t('Session confirmed (no credit - teacher absent)', '\u062A\u0645 \u0627\u0644\u062A\u0623\u0643\u064A\u062F'));
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (checkingReport) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px]" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('Loading session...', '\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0645\u064A\u0644...')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
            <p className="text-sm text-gray-500">{t('Checking report status...', '\u0641\u062D\u0635 \u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u0642\u0631\u064A\u0631...')}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-[#0D4F4F] flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {t('Confirm Session Attendance', '\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0636\u0648\u0631')}
          </DialogTitle>
          <DialogDescription>{session.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* ═════ REPORT STATUS BANNER ═════ */}
          {isApproved && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                    {t('Report Approved', '\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0645\u0639\u062A\u0645\u062F')}
                    <FileText className="w-3.5 h-3.5" />
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    {t(
                      'Teacher report has been approved. Confirm to credit the wallet.',
                      '\u062A\u0645 \u0627\u0639\u062A\u0645\u0627\u062F \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0639\u0644\u0645. \u0627\u0636\u063A\u0637 \u062A\u0623\u0643\u064A\u062F \u0644\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0631\u0635\u064A\u062F.'
                    )}
                  </p>
                  {existingReport?.overallScore && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-emerald-900">
                        {existingReport.overallScore}/5
                      </span>
                      <span className="text-xs text-emerald-700">
                        {t('overall rating', '\u062A\u0642\u064A\u064A\u0645 \u0639\u0627\u0645')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {existingReport?.lessonSummary && (
                <div className="mt-3 pt-3 border-t border-emerald-200">
                  <p className="text-[10px] font-bold uppercase text-emerald-700 mb-1">
                    {t('Lesson Summary', '\u0645\u0644\u062E\u0635 \u0627\u0644\u062D\u0635\u0629')}
                  </p>
                  <p className="text-xs text-emerald-900">{existingReport.lessonSummary}</p>
                </div>
              )}
            </div>
          )}

          {isPendingApproval && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-amber-900 text-sm">
                    {t('Report Pending Approval', '\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F')}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {t(
                      'You must approve the teacher report before confirming this session.',
                      '\u064A\u062C\u0628 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0623\u0648\u0644\u0627\u064B.'
                    )}
                  </p>
                  <Button
                    onClick={goToReports}
                    size="sm"
                    className="mt-3 bg-amber-500 hover:bg-amber-600 text-white gap-1 h-8"
                  >
                    {t('Go to Approve Report', '\u0627\u0630\u0647\u0628 \u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u0642\u0631\u064A\u0631')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {noReport && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-900">
                    {t('No teacher report submitted', '\u0644\u0645 \u064A\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u062A\u0642\u0631\u064A\u0631')}
                  </p>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    {t('You can confirm manually as fallback.', '\u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u062A\u0623\u0643\u064A\u062F \u064A\u062F\u0648\u064A\u0627\u064B.')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Session info */}
          <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-medium">{teacherName}</span>
              <Badge variant="outline" className="ml-auto text-[10px]">${hourlyRate}/hr</Badge>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-medium">{studentName}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {fmtDate(session.date)} \u2022 {session.duration} {t('min', '\u062F\u0642\u064A\u0642\u0629')}
            </div>
          </div>

          {/* Form - only enabled if canConfirm */}
          <fieldset disabled={!canConfirm} className={cn('space-y-4', !canConfirm && 'opacity-50 pointer-events-none')}>
            <div className="space-y-2">
              <Label className="text-sm font-bold flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                {t('Did the TEACHER attend?', '\u0647\u0644 \u062D\u0636\u0631 \u0627\u0644\u0645\u0639\u0644\u0645\u061F')} *
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setTeacherAttended(true)}
                  className={cn('p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2',
                    teacherAttended ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-gray-300')}>
                  <CheckCircle2 className="h-4 w-4" />
                  {t('Yes', '\u0646\u0639\u0645')}
                </button>
                <button type="button" onClick={() => setTeacherAttended(false)}
                  className={cn('p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2',
                    !teacherAttended ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300')}>
                  <XCircle className="h-4 w-4" />
                  {t('Absent', '\u063A\u0627\u0626\u0628')}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold flex items-center gap-1">
                <User className="h-4 w-4" />
                {t('Did the STUDENT attend?', '\u0647\u0644 \u062D\u0636\u0631 \u0627\u0644\u0637\u0627\u0644\u0628\u061F')}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setStudentAttended(true)}
                  className={cn('p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2',
                    studentAttended ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-gray-300')}>
                  <CheckCircle2 className="h-4 w-4" />
                  {t('Yes', '\u0646\u0639\u0645')}
                </button>
                <button type="button" onClick={() => setStudentAttended(false)}
                  className={cn('p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2',
                    !studentAttended ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-gray-300')}>
                  <XCircle className="h-4 w-4" />
                  {t('No-show', '\u0644\u0645 \u064A\u062D\u0636\u0631')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('Teacher Late (min)', '\u062A\u0623\u062E\u0631 \u0627\u0644\u0645\u0639\u0644\u0645')}</Label>
                <Input type="number" min={0} value={teacherLate}
                  onChange={(e) => setTeacherLate(parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('Student Late (min)', '\u062A\u0623\u062E\u0631 \u0627\u0644\u0637\u0627\u0644\u0628')}</Label>
                <Input type="number" min={0} value={studentLate}
                  onChange={(e) => setStudentLate(parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{t('Admin Notes', '\u0645\u0644\u0627\u062D\u0638\u0627\u062A')}</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                placeholder={t('Optional...', '\u0627\u062E\u062A\u064A\u0627\u0631\u064A...')} />
            </div>

            <div className={cn('p-4 rounded-xl border-2',
              teacherAttended ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={cn('h-4 w-4', teacherAttended ? 'text-emerald-600' : 'text-red-600')} />
                <h3 className={cn('font-bold text-sm', teacherAttended ? 'text-emerald-700' : 'text-red-700')}>
                  {t('Earnings', '\u0627\u0644\u0623\u0631\u0628\u0627\u062D')}
                </h3>
              </div>
              {teacherAttended ? (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-muted-foreground">{t('Duration', '\u0627\u0644\u0645\u062F\u0629')}</p>
                    <p className="font-bold">{session.duration} min</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-muted-foreground">{t('Rate', '\u0627\u0644\u0633\u0639\u0631')}</p>
                    <p className="font-bold">${hourlyRate}/hr</p>
                  </div>
                  <div className="bg-emerald-500 text-white rounded-lg p-2 text-center">
                    <p className="opacity-90 text-[10px]">{t('TOTAL', '\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A')}</p>
                    <p className="font-bold text-lg">+${earnings}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {t('No earnings — Teacher was absent', '\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u0631\u0628\u0627\u062D')}
                </p>
              )}
            </div>
          </fieldset>
        </div>

        <DialogFooter className={cn(isRTL && 'flex-row-reverse')}>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t('Cancel', '\u0625\u0644\u063A\u0627\u0621')}
          </Button>
          {canConfirm && (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className={cn('gap-2 text-white',
                teacherAttended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700')}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <CheckCircle2 className="h-4 w-4" />
              {teacherAttended
                ? t(`Confirm & Credit $${earnings}`, `\u062A\u0623\u0643\u064A\u062F +$${earnings}`)
                : t('Confirm (No Credit)', '\u062A\u0623\u0643\u064A\u062F \u0628\u062F\u0648\u0646 \u0631\u0635\u064A\u062F')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}