'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Loader2, Gift, AlertTriangle, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

type AdjustType = 'bonus' | 'deduct' | 'payout';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: AdjustType;
  teacherId: string;
  teacherName: string;
  currentBalance: number;
  onSuccess: () => void;
}

const BONUS_CATEGORIES = ['Excellent Performance', 'Student Feedback', 'Overtime Work', 'Holiday Bonus', 'Other'];
const DEDUCT_CATEGORIES = ['Late Arrival', 'Missed Session', 'Policy Violation', 'Student Complaint', 'Correction', 'Other'];
const PAYOUT_METHODS = ['CASH', 'BANK_TRANSFER', 'PAYPAL', 'VODAFONE_CASH', 'INSTAPAY', 'OTHER'];

export default function WalletAdjustDialog({
  open, onOpenChange, type, teacherId, teacherName, currentBalance, onSuccess,
}: Props) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount('');
      setCategory('');
      setDescription('');
      setPayoutMethod('CASH');
      setReference('');
      setReceiptDate(new Date().toISOString().slice(0, 10));
    }
  }, [open]);

  const amountNum = parseFloat(amount) || 0;
  const newBalance =
    type === 'bonus' ? currentBalance + amountNum :
    type === 'deduct' ? currentBalance - amountNum :
    currentBalance - amountNum;

  const insufficient = type === 'payout' && amountNum > currentBalance;

  const config = {
    bonus: {
      title: t('Add Bonus', '\u0625\u0636\u0627\u0641\u0629 \u062D\u0627\u0641\u0632'),
      icon: Gift,
      color: 'emerald',
      categories: BONUS_CATEGORIES,
      btnText: t('Add Bonus', '\u0625\u0636\u0627\u0641\u0629'),
    },
    deduct: {
      title: t('Deduct Amount', '\u062E\u0635\u0645 \u0645\u0628\u0644\u063A'),
      icon: AlertTriangle,
      color: 'red',
      categories: DEDUCT_CATEGORIES,
      btnText: t('Confirm Deduction', '\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062E\u0635\u0645'),
    },
    payout: {
      title: t('Record Payout', '\u062A\u0633\u062C\u064A\u0644 \u062F\u0641\u0639\u0629'),
      icon: Wallet,
      color: 'blue',
      categories: PAYOUT_METHODS,
      btnText: t('Confirm Payout', '\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639'),
    },
  }[type];

  const Icon = config.icon;

  const handleSubmit = async () => {
    if (amountNum <= 0) {
      toast.error(t('Invalid amount', '\u0645\u0628\u0644\u063A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D'));
      return;
    }
    if (type !== 'payout' && !category) {
      toast.error(t('Select a category', '\u0627\u062E\u062A\u0631 \u0641\u0626\u0629'));
      return;
    }
    if (type !== 'payout' && !description.trim()) {
      toast.error(t('Add description', '\u0623\u0636\u0641 \u0648\u0635\u0641'));
      return;
    }
    if (insufficient) {
      toast.error(t('Insufficient balance', '\u0631\u0635\u064A\u062F \u063A\u064A\u0631 \u0643\u0627\u0641\u064D'));
      return;
    }

    try {
      setSubmitting(true);

      if (type === 'bonus') {
        await adminApi.addBonus(teacherId, { amount: amountNum, category, description });
        toast.success(t(`Bonus +$${amountNum} added!`, `\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 +$${amountNum}!`));
      } else if (type === 'deduct') {
        await adminApi.deductFromWallet(teacherId, { amount: amountNum, category, description });
        toast.success(t(`Deducted -$${amountNum}`, `\u062A\u0645 \u062E\u0635\u0645 -$${amountNum}`));
      } else {
        await adminApi.recordPayout(teacherId, {
          amount: amountNum,
          payoutMethod,
          payoutReference: reference || undefined,
          description: description || undefined,
          receiptDate,
        });
        toast.success(t(`Payout $${amountNum} recorded!`, `\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 $${amountNum}!`));
      }

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
      <DialogContent className="sm:max-w-[500px] max-h-[95vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className={cn(
            'flex items-center gap-2',
            config.color === 'emerald' && 'text-emerald-700',
            config.color === 'red' && 'text-red-700',
            config.color === 'blue' && 'text-blue-700',
          )}>
            <Icon className="h-5 w-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{teacherName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Balance */}
          <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('Current Balance', '\u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u062D\u0627\u0644\u064A')}</span>
            <span className="font-bold text-lg text-gray-900">${currentBalance.toFixed(2)}</span>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label>{t('Amount ($)', '\u0627\u0644\u0645\u0628\u0644\u063A')} *</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-lg font-bold"
            />
            {type === 'payout' && currentBalance > 0 && (
              <button
                type="button"
                onClick={() => setAmount(currentBalance.toString())}
                className="text-xs text-blue-600 hover:underline"
              >
                {t(`Pay full balance: $${currentBalance.toFixed(2)}`, `\u062F\u0641\u0639 \u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u0643\u0627\u0645\u0644: $${currentBalance.toFixed(2)}`)}
              </button>
            )}
          </div>

          {/* Category / Payout Method */}
          <div className="space-y-1.5">
            <Label>
              {type === 'payout'
                ? t('Payment Method', '\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639') + ' *'
                : t('Category', '\u0627\u0644\u0641\u0626\u0629') + ' *'}
            </Label>
            <Select
              value={type === 'payout' ? payoutMethod : category}
              onValueChange={type === 'payout' ? setPayoutMethod : setCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('Select', '\u0627\u062E\u062A\u0631')} />
              </SelectTrigger>
              <SelectContent>
                {config.categories.map((c) => (
                  <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payout-specific fields */}
          {type === 'payout' && (
            <>
              <div className="space-y-1.5">
                <Label>{t('Reference Number', '\u0631\u0642\u0645 \u0627\u0644\u0645\u0631\u062C\u0639')}</Label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="TRX-..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('Receipt Date', '\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062F\u0641\u0639')} *</Label>
                <Input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label>
              {t('Description', '\u0627\u0644\u0648\u0635\u0641')} {type !== 'payout' && '*'}
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={
                type === 'bonus'
                  ? t('Reason for bonus...', '\u0633\u0628\u0628 \u0627\u0644\u062D\u0627\u0641\u0632...')
                  : type === 'deduct'
                    ? t('Reason for deduction...', '\u0633\u0628\u0628 \u0627\u0644\u062E\u0635\u0645...')
                    : t('Notes (optional)...', '\u0645\u0644\u0627\u062D\u0638\u0627\u062A...')
              }
            />
          </div>

          {/* Preview */}
          {amountNum > 0 && (
            <div className={cn(
              'p-3 rounded-xl border-2',
              insufficient
                ? 'bg-red-50 border-red-200'
                : config.color === 'emerald' ? 'bg-emerald-50 border-emerald-200'
                : config.color === 'red' ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200',
            )}>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-2">{t('Preview', '\u0645\u0639\u0627\u064A\u0646\u0629')}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{t('Current', '\u0627\u0644\u062D\u0627\u0644\u064A')}:</span>
                  <span className="font-medium">${currentBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{type === 'bonus' ? '+' : '-'} {t('Amount', '\u0627\u0644\u0645\u0628\u0644\u063A')}:</span>
                  <span className={cn(
                    'font-bold',
                    type === 'bonus' ? 'text-emerald-600' : 'text-red-600',
                  )}>
                    {type === 'bonus' ? '+' : '-'}${amountNum.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-current/20">
                  <span className="font-bold">{t('New Balance', '\u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u062C\u062F\u064A\u062F')}:</span>
                  <span className={cn(
                    'font-bold text-lg',
                    insufficient && 'text-red-600',
                  )}>
                    ${newBalance.toFixed(2)}
                  </span>
                </div>
              </div>
              {insufficient && (
                <p className="text-xs text-red-700 mt-2 font-medium">
                  \u26a0\ufe0f {t('Insufficient balance for this payout', '\u0631\u0635\u064A\u062F \u063A\u064A\u0631 \u0643\u0627\u0641\u064D')}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t('Cancel', '\u0625\u0644\u063A\u0627\u0621')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || amountNum <= 0 || insufficient}
            className={cn(
              'text-white gap-2',
              config.color === 'emerald' && 'bg-emerald-600 hover:bg-emerald-700',
              config.color === 'red' && 'bg-red-600 hover:bg-red-700',
              config.color === 'blue' && 'bg-blue-600 hover:bg-blue-700',
            )}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Icon className="h-4 w-4" />
            {config.btnText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}