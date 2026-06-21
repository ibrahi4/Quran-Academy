'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  Loader2, Wallet, DollarSign, TrendingUp, TrendingDown,
  Gift, AlertTriangle, Eye, Search, Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import WalletAdjustDialog from './WalletAdjustDialog';
import EditHourlyRateDialog from './EditHourlyRateDialog';

interface TeacherWallet {
  teacherId: string;
  userId: string;
  name: string;
  email: string;
  hourlyRate: number;
  wallet: {
    balance: number;
    totalEarned: number;
    totalPaid: number;
    totalBonuses: number;
    totalDeductions: number;
  } | null;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category?: string;
  description: string;
  payoutMethod?: string;
  payoutReference?: string;
  receiptDate?: string;
  balanceAfter: number;
  createdAt: string;
  createdByName: string;
  session?: { id: string; title: string; date: string };
}

export default function WalletsContent() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [wallets, setWallets] = useState<TeacherWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Dialog states
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'bonus' | 'deduct' | 'payout'>('bonus');
  const [selected, setSelected] = useState<TeacherWallet | null>(null);

  // Edit rate dialog
  const [rateOpen, setRateOpen] = useState(false);

  // History dialog
  const [historyOpen, setHistoryOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(false);

  const loadWallets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllWallets();
      console.log('Raw response:', res);
      
      // Try multiple unwrapping strategies
      let data: any = res;
      if (res && typeof res === 'object') {
        // If wrapped in { success, data }
        if ('data' in res && Array.isArray((res as any).data)) {
          data = (res as any).data;
        }
        // If wrapped in { data: { data: [...] } }
        else if ('data' in res && (res as any).data && typeof (res as any).data === 'object' && 'data' in (res as any).data) {
          data = (res as any).data.data;
        }
      }
      
      console.log('Parsed wallets data:', data);
      console.log('Is array?', Array.isArray(data), 'Length:', Array.isArray(data) ? data.length : 'N/A');
      
      setWallets(Array.isArray(data) ? data : []);
      
      if (Array.isArray(data) && data.length === 0) {
        toast('No teachers found in database', { icon: 'i' });
      }
    } catch (err: any) {
      console.error('loadWallets error:', err);
      console.error('Error response:', err?.response?.data);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWallets(); }, [loadWallets]);

  const openAdjust = (teacher: TeacherWallet, type: 'bonus' | 'deduct' | 'payout') => {
    setSelected(teacher);
    setAdjustType(type);
    setAdjustOpen(true);
  };

  const openRate = (teacher: TeacherWallet) => {
    setSelected(teacher);
    setRateOpen(true);
  };

  const openHistory = async (teacher: TeacherWallet) => {
    setSelected(teacher);
    setHistoryOpen(true);
    try {
      setLoadingTxns(true);
      const res = await adminApi.getTeacherTransactions(teacher.teacherId, { limit: 50 });
      const data = (res as any)?.data ?? res;
      setTransactions(data?.data || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed');
    } finally {
      setLoadingTxns(false);
    }
  };

  const filtered = wallets.filter((w) =>
    !search ||
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.email.toLowerCase().includes(search.toLowerCase()),
  );

  // Aggregate stats
  const totalBalance = wallets.reduce((s, w) => s + (w.wallet?.balance || 0), 0);
  const totalEarned = wallets.reduce((s, w) => s + (w.wallet?.totalEarned || 0), 0);
  const totalPaid = wallets.reduce((s, w) => s + (w.wallet?.totalPaid || 0), 0);

  const fmtDateTime = (d: string) => new Date(d).toLocaleString(isRTL ? 'ar-EG' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const txnColors: Record<string, string> = {
    SESSION_EARNING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    BONUS: 'bg-blue-50 text-blue-700 border-blue-200',
    DEDUCTION: 'bg-amber-50 text-amber-700 border-amber-200',
    PAYOUT: 'bg-purple-50 text-purple-700 border-purple-200',
    REFUND: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    ADJUSTMENT: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div className={cn('space-y-6', isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-2xl font-bold text-[#0D4F4F]">
          {t('Teacher Wallets', '\u0645\u062D\u0627\u0641\u0638 \u0627\u0644\u0645\u0639\u0644\u0645\u064A\u0646')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('Manage teacher earnings, bonuses, deductions & payouts', '\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0648\u0627\u0644\u062D\u0648\u0627\u0641\u0632')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {t('Total Balance Owed', '\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0623\u0631\u0635\u062F\u0629')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalEarned.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {t('Total Earned (All-time)', '\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0623\u0631\u0628\u0627\u062D')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-50">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalPaid.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {t('Total Paid Out', '\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u062F\u0641\u0648\u0639')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className={cn(
              'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
              isRTL ? 'right-3' : 'left-3',
            )} />
            <Input
              placeholder={t('Search teacher...', '\u0628\u062D\u062B...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn('h-10', isRTL ? 'pr-10' : 'pl-10')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Wallets Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#0D4F4F]" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-16 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t('No teachers found', '\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u0639\u0644\u0645\u0648\u0646')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((w) => {
            const balance = w.wallet?.balance || 0;
            const earned = w.wallet?.totalEarned || 0;
            const paid = w.wallet?.totalPaid || 0;
            return (
              <Card key={w.teacherId} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0D4F4F]/20 to-[#0D4F4F]/10 flex items-center justify-center text-[#0D4F4F] font-bold">
                        {w.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{w.name}</p>
                        <p className="text-xs text-muted-foreground">{w.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openRate(w)}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#0D4F4F]/10 text-[#0D4F4F] hover:bg-[#0D4F4F]/20 transition-colors flex items-center gap-1 border border-[#0D4F4F]/20"
                      title={t('Click to edit rate', '\u0627\u0636\u063A\u0637 \u0644\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0633\u0639\u0631')}
                    >
                      ${w.hourlyRate}/hr
                      <Pencil className="h-3 w-3 opacity-60" />
                    </button>
                  </div>

                  {/* Wallet stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-emerald-700">${balance.toFixed(0)}</p>
                      <p className="text-[10px] uppercase text-emerald-600 font-bold">
                        {t('Balance', '\u0627\u0644\u0631\u0635\u064A\u062F')}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-blue-700">${earned.toFixed(0)}</p>
                      <p className="text-[10px] uppercase text-blue-600 font-bold">
                        {t('Earned', '\u0627\u0644\u0623\u0631\u0628\u0627\u062D')}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-purple-700">${paid.toFixed(0)}</p>
                      <p className="text-[10px] uppercase text-purple-600 font-bold">
                        {t('Paid', '\u0627\u0644\u0645\u062F\u0641\u0648\u0639')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs h-9 gap-1"
                      onClick={() => openAdjust(w, 'bonus')}
                    >
                      <Gift className="h-3.5 w-3.5" />
                      {t('Bonus', '\u062D\u0627\u0641\u0632')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-700 border-red-200 hover:bg-red-50 text-xs h-9 gap-1"
                      onClick={() => openAdjust(w, 'deduct')}
                    >
                      <TrendingDown className="h-3.5 w-3.5" />
                      {t('Deduct', '\u062E\u0635\u0645')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-700 border-blue-200 hover:bg-blue-50 text-xs h-9 gap-1"
                      onClick={() => openAdjust(w, 'payout')}
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      {t('Pay', '\u062F\u0641\u0639')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-gray-700 hover:bg-gray-50 text-xs h-9 gap-1"
                      onClick={() => openHistory(w)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t('Log', '\u0633\u062C\u0644')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Adjust Dialog */}
      {selected && (
        <WalletAdjustDialog
          open={adjustOpen}
          onOpenChange={setAdjustOpen}
          type={adjustType}
          teacherId={selected.teacherId}
          teacherName={selected.name}
          currentBalance={selected.wallet?.balance || 0}
          onSuccess={loadWallets}
        />
      )}

      {/* Edit Hourly Rate Dialog */}
      {selected && (
        <EditHourlyRateDialog
          open={rateOpen}
          onOpenChange={setRateOpen}
          teacherId={selected.teacherId}
          teacherName={selected.name}
          currentRate={selected.hourlyRate}
          onSuccess={loadWallets}
        />
      )}

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">
              {t('Transaction History', '\u0633\u062C\u0644 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A')}
            </DialogTitle>
            <DialogDescription>{selected?.name}</DialogDescription>
          </DialogHeader>
          {loadingTxns ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#0D4F4F]" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {t('No transactions yet', '\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0645\u0644\u064A\u0627\u062A')}
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((txn) => (
                <div key={txn.id} className={cn('p-3 rounded-xl border', txnColors[txn.type] || 'bg-gray-50')}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {txn.type.replace('_', ' ')}
                        </Badge>
                        {txn.category && (
                          <span className="text-xs text-muted-foreground">
                            \u2022 {txn.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1">{txn.description}</p>
                      {txn.payoutReference && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Ref: {txn.payoutReference}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'font-bold text-lg',
                        Number(txn.amount) > 0 ? 'text-emerald-700' : 'text-red-700',
                      )}>
                        {Number(txn.amount) > 0 ? '+' : ''}${Number(txn.amount).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {t('Balance:', '\u0627\u0644\u0631\u0635\u064A\u062F:')} ${Number(txn.balanceAfter).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10 text-[10px] text-muted-foreground">
                    <span>{fmtDateTime(txn.createdAt)}</span>
                    <span>{t('by', '\u0628\u0648\u0627\u0633\u0637\u0629')} {txn.createdByName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}