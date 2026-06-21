'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Loader2, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  teacherName: string;
  currentRate: number;
  onSuccess: () => void;
}

export default function EditHourlyRateDialog({
  open, onOpenChange, teacherId, teacherName, currentRate, onSuccess,
}: Props) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [rate, setRate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setRate(currentRate.toString());
  }, [open, currentRate]);

  const rateNum = parseFloat(rate) || 0;
  const change = rateNum - currentRate;
  const changePercent = currentRate > 0 ? ((change / currentRate) * 100).toFixed(1) : '0';

  // Preview earnings for different durations
  const previews = [
    { duration: 30, label: '30 min' },
    { duration: 45, label: '45 min' },
    { duration: 60, label: '60 min' },
    { duration: 90, label: '90 min' },
  ];

  const handleSubmit = async () => {
    if (rateNum <= 0) {
      toast.error(t('Invalid rate', '\u0633\u0639\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D'));
      return;
    }
    if (rateNum === currentRate) {
      toast.error(t('Rate unchanged', '\u0644\u0645 \u064A\u062A\u063A\u064A\u0631 \u0627\u0644\u0633\u0639\u0631'));
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.updateTeacherRate(teacherId, rateNum);
      toast.success(t(`Rate updated to $${rateNum}/hr`, `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0633\u0639\u0631 \u0625\u0644\u0649 $${rateNum}/\u0633\u0627\u0639\u0629`));
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-[#0D4F4F] flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('Update Hourly Rate', '\u062A\u062D\u062F\u064A\u062B \u0633\u0639\u0631 \u0627\u0644\u0633\u0627\u0639\u0629')}
          </DialogTitle>
          <DialogDescription>{teacherName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current rate */}
          <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('Current Rate', '\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062D\u0627\u0644\u064A')}</span>
            <span className="font-bold text-lg text-gray-900">${currentRate.toFixed(2)} / hr</span>
          </div>

          {/* New rate input */}
          <div className="space-y-1.5">
            <Label>{t('New Rate ($/hr)', '\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062C\u062F\u064A\u062F')} *</Label>
            <div className="relative">
              <DollarSign className={cn(
                'absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400',
                isRTL ? 'right-3' : 'left-3',
              )} />
              <Input
                type="number"
                min="0.01"
                step="0.5"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className={cn('text-2xl font-bold h-14', isRTL ? 'pr-10' : 'pl-10')}
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t('Per hour rate in EGP', '\u0633\u0639\u0631 \u0627\u0644\u0633\u0627\u0639\u0629')}
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground self-center">{t('Quick:', '\u0633\u0631\u064A\u0639:')}</span>
            {[10, 15, 20, 25, 30, 40, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRate(preset.toString())}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-bold border transition-all',
                  rateNum === preset
                    ? 'bg-[#0D4F4F] text-white border-[#0D4F4F]'
                    : 'border-gray-200 hover:border-[#0D4F4F] hover:bg-[#0D4F4F]/5',
                )}
              >
                ${preset}
              </button>
            ))}
          </div>

          {/* Change indicator */}
          {rateNum > 0 && rateNum !== currentRate && (
            <div className={cn(
              'p-3 rounded-xl border-2 flex items-center gap-3',
              change > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200',
            )}>
              <TrendingUp className={cn(
                'h-5 w-5',
                change > 0 ? 'text-emerald-600' : 'text-amber-600 rotate-180',
              )} />
              <div className="flex-1">
                <p className={cn(
                  'text-sm font-bold',
                  change > 0 ? 'text-emerald-700' : 'text-amber-700',
                )}>
                  {change > 0 ? '+' : ''}${change.toFixed(2)} ({change > 0 ? '+' : ''}{changePercent}%)
                </p>
                <p className="text-xs text-muted-foreground">
                  {change > 0
                    ? t('Increase from current rate', '\u0632\u064A\u0627\u062F\u0629 \u0639\u0646 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062D\u0627\u0644\u064A')
                    : t('Decrease from current rate', '\u0646\u0642\u0635 \u0639\u0646 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062D\u0627\u0644\u064A')}
                </p>
              </div>
            </div>
          )}

          {/* Earnings preview */}
          {rateNum > 0 && (
            <div className="p-4 bg-gradient-to-br from-[#0D4F4F]/5 to-[#0D4F4F]/10 rounded-xl border border-[#0D4F4F]/20">
              <p className="text-xs font-bold uppercase text-[#0D4F4F] mb-3">
                {t('Earnings Preview', '\u0645\u0639\u0627\u064A\u0646\u0629 \u0627\u0644\u0623\u0631\u0628\u0627\u062D')}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {previews.map((p) => {
                  const earning = (p.duration / 60) * rateNum;
                  return (
                    <div key={p.duration} className="bg-white rounded-lg p-2.5 text-center border">
                      <p className="text-[10px] text-muted-foreground mb-0.5">{p.label}</p>
                      <p className="font-bold text-[#0D4F4F]">${earning.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              {t(
                'New rate applies only to future sessions. Already confirmed sessions keep their original rate.',
                '\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062C\u062F\u064A\u062F \u064A\u0637\u0628\u0642 \u0639\u0644\u0649 \u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0627\u0644\u0642\u0627\u062F\u0645\u0629 \u0641\u0642\u0637.',
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t('Cancel', '\u0625\u0644\u063A\u0627\u0621')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rateNum <= 0 || rateNum === currentRate}
            className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white gap-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <DollarSign className="h-4 w-4" />
            {t('Update Rate', '\u062A\u062D\u062F\u064A\u062B')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}