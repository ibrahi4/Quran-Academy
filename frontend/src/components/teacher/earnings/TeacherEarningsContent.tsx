'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { teacherApi } from '@/lib/api/teacher';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Loader2, Wallet, DollarSign, TrendingUp, TrendingDown,
  Gift, CreditCard, Calendar, Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WalletData {
  id: string;
  balance: number | string;
  totalEarned: number | string;
  totalPaid: number | string;
  totalBonuses: number | string;
  totalDeductions: number | string;
  currency: string;
  thisMonthEarnings: number;
  thisMonthSessions: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number | string;
  category?: string;
  description: string;
  payoutMethod?: string;
  payoutReference?: string;
  balanceAfter: number | string;
  createdAt: string;
  createdByName: string;
  session?: { title: string; date: string };
}

const TYPE_CONFIG: Record<string, { label: string; ar: string; bg: string; text: string; icon: any }> = {
  SESSION_EARNING: { label: 'Session', ar: '\u062C\u0644\u0633\u0629', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: DollarSign },
  BONUS: { label: 'Bonus', ar: '\u062D\u0627\u0641\u0632', bg: 'bg-blue-50', text: 'text-blue-700', icon: Gift },
  DEDUCTION: { label: 'Deduction', ar: '\u062E\u0635\u0645', bg: 'bg-amber-50', text: 'text-amber-700', icon: TrendingDown },
  PAYOUT: { label: 'Payout', ar: '\u062F\u0641\u0639\u0629', bg: 'bg-purple-50', text: 'text-purple-700', icon: CreditCard },
  REFUND: { label: 'Refund', ar: '\u0627\u0633\u062A\u0631\u062F\u0627\u062F', bg: 'bg-cyan-50', text: 'text-cyan-700', icon: TrendingUp },
  ADJUSTMENT: { label: 'Adjustment', ar: '\u062A\u0639\u062F\u064A\u0644', bg: 'bg-gray-50', text: 'text-gray-700', icon: Wallet },
};

export default function TeacherEarningsContent() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [walletRes, txnsRes] = await Promise.all([
        teacherApi.getMyWallet(),
        teacherApi.getMyTransactions({ limit: 100 }),
      ]);

      const walletData = (walletRes as any)?.data ?? walletRes;
      const txnData = (txnsRes as any)?.data ?? txnsRes;

      setWallet(walletData);
      setTransactions(txnData?.data || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">{t('No wallet found', '\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u062D\u0641\u0638\u0629')}</p>
      </div>
    );
  }

  const balance = Number(wallet.balance);
  const totalEarned = Number(wallet.totalEarned);
  const totalPaid = Number(wallet.totalPaid);
  const totalBonuses = Number(wallet.totalBonuses);
  const totalDeductions = Number(wallet.totalDeductions);

  const filteredTxns = filterType === 'ALL'
    ? transactions
    : transactions.filter((t) => t.type === filterType);

  const fmtDateTime = (d: string) => new Date(d).toLocaleString(isRTL ? 'ar-EG' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Balance Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-[#0a3d3d] p-6 sm:p-8 text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-bold text-accent uppercase tracking-[0.2em] mb-2">
            {t('My Wallet', '\u0645\u062D\u0641\u0638\u062A\u064A')}
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold mb-3">${balance.toFixed(2)}</h1>
          <p className="text-white/70 text-sm">
            {t('Current Balance', '\u0627\u0644\u0631\u0635\u064A\u062F \u0627\u0644\u062D\u0627\u0644\u064A')} \u2022 {wallet.currency}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">${wallet.thisMonthEarnings.toFixed(0)}</p>
              <p className="text-[10px] text-white/60 uppercase mt-1">{t('This Month', '\u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631')}</p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">{wallet.thisMonthSessions}</p>
              <p className="text-[10px] text-white/60 uppercase mt-1">{t('Sessions', '\u0627\u0644\u062C\u0644\u0633\u0627\u062A')}</p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">${totalEarned.toFixed(0)}</p>
              <p className="text-[10px] text-white/60 uppercase mt-1">{t('All-time', '\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A')}</p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold">${totalPaid.toFixed(0)}</p>
              <p className="text-[10px] text-white/60 uppercase mt-1">{t('Paid', '\u0627\u0644\u0645\u062F\u0641\u0648\u0639')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Breakdown */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: t('Sessions', '\u062C\u0644\u0633\u0627\u062A'), value: totalEarned - totalBonuses, bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { icon: Gift, label: t('Bonuses', '\u062D\u0648\u0627\u0641\u0632'), value: totalBonuses, bg: 'bg-blue-50', text: 'text-blue-600' },
          { icon: TrendingDown, label: t('Deductions', '\u062E\u0635\u0648\u0645\u0627\u062A'), value: totalDeductions, bg: 'bg-amber-50', text: 'text-amber-600' },
          { icon: CreditCard, label: t('Total Paid', '\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u062F\u0641\u0648\u0639'), value: totalPaid, bg: 'bg-purple-50', text: 'text-purple-600' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.bg)}>
                  <Icon className={cn('w-5 h-5', s.text)} />
                </div>
                <p className="text-2xl font-bold text-gray-900">${s.value.toFixed(2)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Transactions */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {/* Header with filter */}
          <div className="p-4 border-b flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-gray-900">{t('Transaction History', '\u0633\u062C\u0644 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A')}</h2>
              <p className="text-xs text-muted-foreground">
                {filteredTxns.length} {t('transactions', '\u0639\u0645\u0644\u064A\u0629')}
              </p>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px] h-9">
                <Filter className="h-3.5 w-3.5 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('All Types', '\u0627\u0644\u0643\u0644')}</SelectItem>
                <SelectItem value="SESSION_EARNING">{t('Sessions', '\u062C\u0644\u0633\u0627\u062A')}</SelectItem>
                <SelectItem value="BONUS">{t('Bonuses', '\u062D\u0648\u0627\u0641\u0632')}</SelectItem>
                <SelectItem value="DEDUCTION">{t('Deductions', '\u062E\u0635\u0648\u0645\u0627\u062A')}</SelectItem>
                <SelectItem value="PAYOUT">{t('Payouts', '\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          {filteredTxns.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{t('No transactions yet', '\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0645\u0644\u064A\u0627\u062A')}</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredTxns.map((txn) => {
                const cfg = TYPE_CONFIG[txn.type] || TYPE_CONFIG.ADJUSTMENT;
                const TypeIcon = cfg.icon;
                const amount = Number(txn.amount);
                return (
                  <div key={txn.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
                        <TypeIcon className={cn('h-5 w-5', cfg.text)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={cn('text-[10px] font-bold', cfg.text)}>
                            {isRTL ? cfg.ar : cfg.label}
                          </Badge>
                          {txn.category && (
                            <span className="text-xs text-muted-foreground">\u2022 {txn.category}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">{txn.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {fmtDateTime(txn.createdAt)} \u2022 {t('by', '\u0628\u0648\u0627\u0633\u0637\u0629')} {txn.createdByName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          'font-bold text-lg',
                          amount > 0 ? 'text-emerald-600' : 'text-red-600',
                        )}>
                          {amount > 0 ? '+' : ''}${amount.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {t('Balance:', '\u0627\u0644\u0631\u0635\u064A\u062F:')} ${Number(txn.balanceAfter).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}