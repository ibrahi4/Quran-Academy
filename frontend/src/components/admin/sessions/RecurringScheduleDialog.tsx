'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  Loader2, Repeat, Calendar, Clock, AlertCircle,
  CheckCircle2, XCircle, Sparkles, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Student { id: string; user: { firstName: string; lastName: string } }
interface Teacher { id: string; user: { firstName: string; lastName: string } }

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  teachers: Teacher[];
  onSuccess: () => void;
}

interface PreviewDate {
  date: string;
  isAvailable: boolean;
  conflictWith?: string;
}

interface PreviewData {
  totalDates: number;
  skippedManually: number;
  willCreate: number;
  conflicts: number;
  dates: PreviewDate[];
}

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_AR = ['\u0623\u062D\u062F', '\u0625\u062B\u0646\u064A\u0646', '\u062B\u0644\u0627\u062B\u0627\u0621', '\u0623\u0631\u0628\u0639\u0627\u0621', '\u062E\u0645\u064A\u0633', '\u062C\u0645\u0639\u0629', '\u0633\u0628\u062A'];

export default function RecurringScheduleDialog({
  open, onOpenChange, students, teachers, onSuccess,
}: Props) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = (en: string, ar: string) => (isRTL ? ar : en);
  const days = isRTL ? DAYS_AR : DAYS_EN;

  // Form state
  const [studentId, setStudentId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [title, setTitle] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState('60');
  const [frequency, setFrequency] = useState('WEEKLY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [platform, setPlatform] = useState('ZOOM');
  const [meetingLink, setMeetingLink] = useState('');
  const [notes, setNotes] = useState('');

  // Preview state
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStudentId('');
      setTeacherId('');
      setTitle('');
      setDaysOfWeek([]);
      setTime('09:00');
      setDuration('60');
      setFrequency('WEEKLY');
      setStartDate('');
      setEndDate('');
      setPlatform('ZOOM');
      setMeetingLink('');
      setNotes('');
      setPreview(null);
    }
  }, [open]);

  // Auto-set end date to 2 months after start
  useEffect(() => {
    if (startDate && !endDate) {
      const end = new Date(startDate);
      end.setMonth(end.getMonth() + 2);
      setEndDate(end.toISOString().slice(0, 10));
    }
  }, [startDate, endDate]);

  // Auto-generate preview when key fields change
  useEffect(() => {
    if (
      studentId && teacherId && daysOfWeek.length > 0 &&
      time && startDate && endDate
    ) {
      generatePreview();
    } else {
      setPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, teacherId, daysOfWeek, time, duration, frequency, startDate, endDate]);

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  };

  const generatePreview = async () => {
    try {
      setLoadingPreview(true);
      const res = await adminApi.previewRecurring({
        studentId, teacherId, title: title || 'Session',
        daysOfWeek, time, duration: parseInt(duration),
        frequency, startDate, endDate,
        platform, meetingLink: meetingLink || undefined,
      });
      const data = (res as any)?.data ?? res;
      setPreview(data);
    } catch (err: any) {
      console.error('Preview error:', err);
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSubmit = async () => {
    if (!studentId || !teacherId || !title || daysOfWeek.length === 0 || !startDate || !endDate) {
      toast.error(t('Fill all required fields', '\u0627\u0645\u0644\u0623 \u0643\u0644 \u0627\u0644\u062D\u0642\u0648\u0644'));
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminApi.createRecurring({
        studentId, teacherId, title,
        daysOfWeek, time,
        duration: parseInt(duration),
        frequency, startDate, endDate,
        platform, meetingLink: meetingLink || undefined,
        notes: notes || undefined,
        skipOnConflict: true, // Auto-skip conflicts
      });

      const data = (res as any)?.data ?? res;
      const stats = data.stats;

      toast.success(
        t(
          `Created ${stats.created} sessions! (${stats.skippedConflicts} skipped due to conflicts)`,
          `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 ${stats.created} \u062C\u0644\u0633\u0629!`,
        ),
        { duration: 5000 },
      );

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[720px] max-h-[95vh] overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle className="text-[#0D4F4F] flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            {t('Create Recurring Schedule', '\u062C\u062F\u0648\u0644 \u0645\u062A\u0643\u0631\u0631')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'Generate multiple sessions automatically for weeks or months',
              '\u0625\u0646\u0634\u0627\u0621 \u062C\u0644\u0633\u0627\u062A \u0645\u062A\u0639\u062F\u062F\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B',
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Student + Teacher */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('Student', '\u0627\u0644\u0637\u0627\u0644\u0628')} *</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Select', '\u0627\u062E\u062A\u0631')} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.user.firstName} {s.user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('Teacher', '\u0627\u0644\u0645\u0639\u0644\u0645')} *</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Select', '\u0627\u062E\u062A\u0631')} />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((tc) => (
                    <SelectItem key={tc.id} value={tc.id}>
                      {tc.user.firstName} {tc.user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label>{t('Course Title', '\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062F\u0648\u0631\u0629')} *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tajweed - Omar"
            />
          </div>

          {/* Days of Week */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              {t('Days of Week', '\u0623\u064A\u0627\u0645 \u0627\u0644\u0623\u0633\u0628\u0648\u0639')} *
            </Label>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={cn(
                    'py-2.5 px-2 rounded-lg text-xs font-bold transition-all',
                    daysOfWeek.includes(i)
                      ? 'bg-[#0D4F4F] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Time + Duration + Frequency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {t('Time', '\u0627\u0644\u0648\u0642\u062A')} *
              </Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('Duration', '\u0627\u0644\u0645\u062F\u0629')}</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                  <SelectItem value="120">120 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('Frequency', '\u0627\u0644\u062A\u0643\u0631\u0627\u0631')}</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">{t('Weekly', '\u0623\u0633\u0628\u0648\u0639\u064A\u0627\u064B')}</SelectItem>
                  <SelectItem value="BIWEEKLY">{t('Every 2 Weeks', '\u0643\u0644 \u0623\u0633\u0628\u0648\u0639\u064A\u0646')}</SelectItem>
                  <SelectItem value="MONTHLY">{t('Monthly', '\u0634\u0647\u0631\u064A\u0627\u064B')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('Start Date', '\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0621')} *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('End Date', '\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621')} *</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
              />
            </div>
          </div>

          {/* Platform + Link */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t('Platform', '\u0627\u0644\u0645\u0646\u0635\u0629')}</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZOOM">Zoom</SelectItem>
                  <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                  <SelectItem value="SKYPE">Skype</SelectItem>
                  <SelectItem value="TEAMS">Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('Meeting Link', '\u0631\u0627\u0628\u0637')}</Label>
              <Input
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://zoom.us/..."
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>{t('Notes', '\u0645\u0644\u0627\u062D\u0638\u0627\u062A')}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* ===== LIVE PREVIEW ===== */}
          {(loadingPreview || preview) && (
            <div className="mt-2 p-4 bg-gradient-to-br from-[#0D4F4F]/5 to-[#0D4F4F]/10 rounded-xl border border-[#0D4F4F]/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[#0D4F4F]" />
                <h3 className="font-bold text-[#0D4F4F] text-sm">
                  {t('Smart Preview', '\u0645\u0639\u0627\u064A\u0646\u0629 \u0630\u0643\u064A\u0629')}
                </h3>
              </div>

              {loadingPreview ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('Calculating...', '\u062C\u0627\u0631\u064D \u0627\u0644\u062D\u0633\u0627\u0628...')}
                </div>
              ) : preview ? (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white rounded-lg p-2.5 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{preview.willCreate}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        {t('Will Create', '\u0633\u064A\u062A\u0645 \u0625\u0646\u0634\u0627\u0624\u0647\u0627')}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 text-center">
                      <p className="text-2xl font-bold text-red-500">{preview.conflicts}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        {t('Conflicts', '\u062A\u0639\u0627\u0631\u0636\u0627\u062A')}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 text-center">
                      <p className="text-2xl font-bold text-gray-700">{preview.totalDates}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">
                        {t('Total Dates', '\u0625\u062C\u0645\u0627\u0644\u064A')}
                      </p>
                    </div>
                  </div>

                  {/* Dates list */}
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {preview.dates.slice(0, 20).map((d, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs',
                          d.isAvailable ? 'bg-white' : 'bg-red-50',
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {d.isAvailable ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          )}
                          <span className={cn(!d.isAvailable && 'line-through text-red-500')}>
                            {new Date(d.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {!d.isAvailable && d.conflictWith && (
                          <Badge variant="outline" className="text-[9px] bg-red-100 border-red-200 text-red-600">
                            {d.conflictWith.slice(0, 20)}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {preview.dates.length > 20 && (
                      <p className="text-center text-xs text-muted-foreground mt-2">
                        +{preview.dates.length - 20} {t('more', '\u0623\u062E\u0631\u0649')}
                      </p>
                    )}
                  </div>

                  {/* Warning if conflicts */}
                  {preview.conflicts > 0 && (
                    <div className="mt-3 flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-800">
                        {t(
                          `${preview.conflicts} conflicts will be auto-skipped. Only ${preview.willCreate} sessions will be created.`,
                          `\u0633\u064A\u062A\u0645 \u062A\u062E\u0637\u064A ${preview.conflicts} \u062A\u0639\u0627\u0631\u0636\u0627\u062A. \u0625\u0646\u0634\u0627\u0621 ${preview.willCreate} \u062C\u0644\u0633\u0629 \u0641\u0642\u0637.`,
                        )}
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter className={cn(isRTL && 'flex-row-reverse')}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('Cancel', '\u0625\u0644\u063A\u0627\u0621')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !preview || preview.willCreate === 0}
            className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white gap-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Repeat className="h-4 w-4" />
            {preview
              ? t(`Create ${preview.willCreate} Sessions`, `\u0625\u0646\u0634\u0627\u0621 ${preview.willCreate} \u062C\u0644\u0633\u0629`)
              : t('Fill form to preview', '\u0627\u0645\u0644\u0623 \u0644\u0644\u0645\u0639\u0627\u064A\u0646\u0629')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}