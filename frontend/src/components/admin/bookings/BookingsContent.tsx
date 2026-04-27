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
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Globe,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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

interface Booking {
  id: string;
  studentId?: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  timezone?: string;
  preferredDate?: string;
  preferredTime?: string;
  serviceSlug?: string;
  type: "TRIAL" | "REGULAR" | "MAKEUP";
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes?: string;
  adminNotes?: string;
  meetingLink?: string;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { class: string; icon: any }> = {
    PENDING: { class: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    CONFIRMED: { class: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle2 },
    COMPLETED: { class: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    CANCELLED: { class: "bg-red-100 text-red-600 border-red-200", icon: XCircle },
    NO_SHOW: { class: "bg-gray-100 text-gray-600 border-gray-200", icon: AlertCircle },
  };
  const s = map[status] || map.PENDING;
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border gap-1", s.class)}>
      <Icon className="h-3 w-3" />
      {status.replace("_", " ")}
    </Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    TRIAL: "bg-purple-100 text-purple-700 border-purple-200",
    REGULAR: "bg-[#0D4F4F]/10 text-[#0D4F4F] border-[#0D4F4F]/20",
    MAKEUP: "bg-orange-100 text-orange-700 border-orange-200",
  };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border", map[type] || "")}>
      {type}
    </Badge>
  );
}

export default function BookingsContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [viewOpen, setViewOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await adminApi.getBookings(params);
      setBookings(res.bookings || res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const openView = (b: Booking) => { setSelected(b); setViewOpen(true); };

  const openStatusChange = (b: Booking) => {
    setSelected(b);
    setNewStatus(b.status);
    setAdminNotes(b.adminNotes || "");
    setMeetingLink(b.meetingLink || "");
    setStatusDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!selected) return;
    try {
      setActionLoading(true);
      const payload: Record<string, string> = { status: newStatus };
      if (adminNotes) payload.adminNotes = adminNotes;
      if (meetingLink) payload.meetingLink = meetingLink;
      await adminApi.updateBookingStatus(selected.id, payload);
      toast.success(isRTL ? "تم تحديث الحجز بنجاح" : "Booking updated successfully");
      setStatusDialogOpen(false);
      fetchBookings();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update booking");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  return (
    <div className={cn("space-y-6", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0D4F4F]">
          {isRTL ? "إدارة الحجوزات" : "Booking Management"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isRTL ? "عرض وإدارة جميع الحجوزات" : "View and manage all bookings"}
        </p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={isRTL ? "بحث بالاسم أو البريد..." : "Search by name or email..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn("h-10", isRTL ? "pr-10" : "pl-10")}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-10">
                <SelectValue placeholder={isRTL ? "الحالة" : "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{isRTL ? "جميع الحالات" : "All Statuses"}</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#0D4F4F]" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{isRTL ? "لا توجد حجوزات" : "No bookings found"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "العميل" : "Client"}</th>
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "الخدمة" : "Service"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "النوع" : "Type"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "الحالة" : "Status"}</th>
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "الموعد" : "Preferred"}</th>
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "التاريخ" : "Created"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{b.name}</p>
                          <p className="text-xs text-muted-foreground">{b.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{b.serviceSlug || "—"}</td>
                      <td className="px-4 py-3 text-center"><TypeBadge type={b.type} /></td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {b.preferredDate ? formatDate(b.preferredDate) : "—"}
                        {b.preferredTime && <span className="block">{b.preferredTime}</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(b.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-[#0D4F4F]" onClick={() => openView(b)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openStatusChange(b)}>
                            {isRTL ? "تحديث" : "Update"}
                          </Button>
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
                  {isRTL
                    ? `عرض ${(page - 1) * meta.limit + 1}-${Math.min(page * meta.limit, meta.total)} من ${meta.total}`
                    : `Showing ${(page - 1) * meta.limit + 1}-${Math.min(page * meta.limit, meta.total)} of ${meta.total}`}
                </p>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm font-medium min-w-[60px] text-center">{page} / {meta.totalPages}</span>
                  <Button size="icon" variant="outline" className="h-8 w-8" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ══════════ VIEW DIALOG ══════════ */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{isRTL ? "تفاصيل الحجز" : "Booking Details"}</DialogTitle>
            <DialogDescription>{selected?.name}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={selected.status} />
                <TypeBadge type={selected.type} />
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? "الاسم" : "Name"}</p>
                    <p className="font-medium">{selected.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? "البريد" : "Email"}</p>
                    <p className="font-medium break-all">{selected.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? "الهاتف" : "Phone"}</p>
                    <p className="font-medium">{selected.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? "البلد" : "Country"}</p>
                    <p className="font-medium">{selected.country || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? "المنطقة الزمنية" : "Timezone"}</p>
                    <p className="font-medium">{selected.timezone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? "الموعد المفضل" : "Preferred Date"}</p>
                    <p className="font-medium">{selected.preferredDate ? formatDate(selected.preferredDate) : "—"} {selected.preferredTime || ""}</p>
                  </div>
                </div>
              </div>
              {selected.serviceSlug && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "الخدمة" : "Service"}</p>
                  <p className="text-sm font-medium">{selected.serviceSlug}</p>
                </div>
              )}
              {selected.meetingLink && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "رابط الاجتماع" : "Meeting Link"}</p>
                  <a href={selected.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">{selected.meetingLink}</a>
                </div>
              )}
              {selected.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "ملاحظات العميل" : "Client Notes"}</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selected.notes}</p>
                </div>
              )}
              {selected.adminNotes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "ملاحظات الإدارة" : "Admin Notes"}</p>
                  <p className="text-sm bg-amber-50 p-3 rounded-lg">{selected.adminNotes}</p>
                </div>
              )}
              <Separator />
              <p className="text-xs text-muted-foreground">
                {isRTL ? "تاريخ الإنشاء:" : "Created:"} {formatDate(selected.createdAt)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════ STATUS CHANGE DIALOG ══════════ */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[450px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{isRTL ? "تحديث حالة الحجز" : "Update Booking Status"}</DialogTitle>
            <DialogDescription>{selected?.name} — {selected?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>{isRTL ? "الحالة الجديدة" : "New Status"}</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{isRTL ? "رابط الاجتماع" : "Meeting Link"}</Label>
              <Input
                placeholder="https://zoom.us/j/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{isRTL ? "ملاحظات الإدارة" : "Admin Notes"}</Label>
              <Textarea
                placeholder={isRTL ? "أضف ملاحظاتك هنا..." : "Add your notes here..."}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={actionLoading}
              className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white"
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isRTL ? "تحديث" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}