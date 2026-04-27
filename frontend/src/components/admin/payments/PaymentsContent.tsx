"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { adminApi } from "@/lib/api/admin";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: string | number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  stripePaymentId?: string;
  method?: "STRIPE" | "PAYPAL" | "BANK_TRANSFER";
  description?: string;
  paidAt?: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { class: string; icon: any }> = {
    PENDING: { class: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    PAID: { class: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    FAILED: { class: "bg-red-100 text-red-600 border-red-200", icon: XCircle },
    REFUNDED: { class: "bg-purple-100 text-purple-600 border-purple-200", icon: RotateCcw },
  };
  const s = map[status] || map.PENDING;
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border gap-1", s.class)}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

function MethodBadge({ method }: { method?: string }) {
  if (!method) return <span className="text-xs text-muted-foreground">—</span>;
  const map: Record<string, string> = {
    STRIPE: "bg-indigo-50 text-indigo-600 border-indigo-200",
    PAYPAL: "bg-blue-50 text-blue-600 border-blue-200",
    BANK_TRANSFER: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <Badge variant="outline" className={cn("text-xs border", map[method] || "")}>
      {method.replace("_", " ")}
    </Badge>
  );
}

export default function PaymentsContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [payments, setPayments] = useState<Payment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [viewOpen, setViewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"mark_paid" | "refund" | null>(null);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [revenueStats, setRevenueStats] = useState<{ totalRevenue: number; monthlyRevenue: number; paidCount: number; pendingCount: number } | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await adminApi.getPayments(params);
      setPayments(res.payments || res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchRevenue = useCallback(async () => {
    try {
      const res = await adminApi.getRevenueStats();
      setRevenueStats(res);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleMarkPaid = async () => {
    if (!selected) return;
    try {
      setActionLoading(true);
      await adminApi.markPaymentPaid(selected.id);
      toast.success(isRTL ? "تم تأكيد الدفع" : "Payment marked as paid");
      setConfirmOpen(false);
      fetchPayments();
      fetchRevenue();
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark as paid");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selected) return;
    try {
      setActionLoading(true);
      await adminApi.refundPayment(selected.id);
      toast.success(isRTL ? "تم استرداد المبلغ" : "Payment refunded");
      setConfirmOpen(false);
      fetchPayments();
      fetchRevenue();
    } catch (err: any) {
      toast.error(err?.message || "Failed to refund");
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirm = (payment: Payment, action: "mark_paid" | "refund") => {
    setSelected(payment);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const formatAmount = (amount: string | number, currency: string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(num);
  };

  const getUserName = (p: Payment) => {
    if (p.user) return `${p.user.firstName} ${p.user.lastName}`;
    return p.userId?.slice(0, 8) || "—";
  };

  return (
    <div className={cn("space-y-6", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0D4F4F]">{isRTL ? "إدارة المدفوعات" : "Payment Management"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{isRTL ? "تتبع وإدارة جميع المدفوعات" : "Track and manage all payments"}</p>
      </div>

      {/* Revenue Stats */}
      {revenueStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: isRTL ? "إجمالي الإيرادات" : "Total Revenue", value: `
$$
{revenueStats.totalRevenue?.toFixed(2) || "0.00"}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: isRTL ? "إيرادات الشهر" : "Monthly Revenue", value: `
$$
{revenueStats.monthlyRevenue?.toFixed(2) || "0.00"}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
            { label: isRTL ? "مدفوعات مكتملة" : "Paid", value: revenueStats.paidCount || 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: isRTL ? "قيد الانتظار" : "Pending", value: revenueStats.pendingCount || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((s, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl", s.bg)}>
                  <s.icon className={cn("h-5 w-5", s.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input placeholder={isRTL ? "بحث..." : "Search..."} value={search} onChange={(e) => setSearch(e.target.value)} className={cn("h-10", isRTL ? "pr-10" : "pl-10")} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[170px] h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{isRTL ? "الكل" : "All"}</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#0D4F4F]" /></div>
          ) : payments.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{isRTL ? "لا توجد مدفوعات" : "No payments found"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "المستخدم" : "User"}</th>
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "المبلغ" : "Amount"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "الطريقة" : "Method"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "الحالة" : "Status"}</th>
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "الوصف" : "Description"}</th>
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "التاريخ" : "Date"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{getUserName(p)}</p>
                          <p className="text-xs text-muted-foreground">{p.user?.email || ""}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{formatAmount(p.amount, p.currency)}</p>
                      </td>
                      <td className="px-4 py-3 text-center"><MethodBadge method={p.method} /></td>
                      <td className="px-4 py-3 text-center"><PaymentStatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{p.description || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(p.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-[#0D4F4F]" onClick={() => { setSelected(p); setViewOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {p.status === "PENDING" && (
                            <Button size="sm" variant="outline" className="h-8 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => openConfirm(p, "mark_paid")}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              {isRTL ? "تأكيد" : "Paid"}
                            </Button>
                          )}
                          {p.status === "PAID" && (
                            <Button size="sm" variant="outline" className="h-8 text-xs text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => openConfirm(p, "refund")}>
                              <RotateCcw className="h-3.5 w-3.5 mr-1" />
                              {isRTL ? "استرداد" : "Refund"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && meta.totalPages > 1 && (
            <>
              <Separator />
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {isRTL ? `عرض ${(page-1)*meta.limit+1}-${Math.min(page*meta.limit,meta.total)} من ${meta.total}` : `Showing ${(page-1)*meta.limit+1}-${Math.min(page*meta.limit,meta.total)} of ${meta.total}`}
                </p>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8" disabled={page<=1} onClick={() => setPage(p=>p-1)}>{isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</Button>
                  <span className="text-sm font-medium min-w-[60px] text-center">{page}/{meta.totalPages}</span>
                  <Button size="icon" variant="outline" className="h-8 w-8" disabled={page>=meta.totalPages} onClick={() => setPage(p=>p+1)}>{isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* VIEW DIALOG */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[480px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{isRTL ? "تفاصيل الدفعة" : "Payment Details"}</DialogTitle>
            <DialogDescription>ID: {selected?.id?.slice(0, 12)}...</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <PaymentStatusBadge status={selected.status} />
                <p className="text-2xl font-bold text-gray-900">{formatAmount(selected.amount, selected.currency)}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">{isRTL ? "المستخدم" : "User"}</p>
                  <p className="font-medium">{getUserName(selected)}</p>
                  <p className="text-xs text-muted-foreground">{selected.user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{isRTL ? "طريقة الدفع" : "Method"}</p>
                  <MethodBadge method={selected.method} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{isRTL ? "العملة" : "Currency"}</p>
                  <p className="font-medium">{selected.currency}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{isRTL ? "تاريخ الإنشاء" : "Created"}</p>
                  <p className="font-medium">{formatDate(selected.createdAt)}</p>
                </div>
                {selected.paidAt && (
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? "تاريخ الدفع" : "Paid At"}</p>
                    <p className="font-medium">{formatDate(selected.paidAt)}</p>
                  </div>
                )}
                {selected.stripePaymentId && (
                  <div>
                    <p className="text-xs text-muted-foreground">Stripe ID</p>
                    <p className="font-medium text-xs break-all">{selected.stripePaymentId}</p>
                  </div>
                )}
              </div>
              {selected.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "الوصف" : "Description"}</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selected.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CONFIRM ACTION DIALOG */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className={confirmAction === "refund" ? "text-purple-600" : "text-emerald-600"}>
              {confirmAction === "mark_paid"
                ? (isRTL ? "تأكيد الدفع" : "Confirm Payment")
                : (isRTL ? "استرداد المبلغ" : "Refund Payment")}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "mark_paid"
                ? (isRTL ? "هل تريد تأكيد استلام هذه الدفعة؟" : "Are you sure you want to mark this payment as paid?")
                : (isRTL ? "هل تريد استرداد هذه الدفعة؟ لا يمكن التراجع." : "Are you sure you want to refund this payment? This cannot be undone.")}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className={cn("p-3 rounded-xl my-2", confirmAction === "refund" ? "bg-purple-50" : "bg-emerald-50")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{getUserName(selected)}</p>
                  <p className="text-xs text-muted-foreground">{selected.user?.email}</p>
                </div>
                <p className="text-lg font-bold">{formatAmount(selected.amount, selected.currency)}</p>
              </div>
            </div>
          )}
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>{isRTL ? "إلغاء" : "Cancel"}</Button>
            <Button
              onClick={confirmAction === "mark_paid" ? handleMarkPaid : handleRefund}
              disabled={actionLoading}
              className={confirmAction === "refund"
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"}
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {confirmAction === "mark_paid"
                ? (isRTL ? "تأكيد الدفع" : "Mark Paid")
                : (isRTL ? "استرداد" : "Refund")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}