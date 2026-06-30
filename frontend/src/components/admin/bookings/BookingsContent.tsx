"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { adminApi } from "@/lib/api/admin";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Loader2, Search, Eye, ChevronLeft, ChevronRight,
  CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle,
  Globe, Phone, Mail, User, Link as LinkIcon, UserCheck,
  Calendar, Timer, Cake, UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// ── Types ──────────────────────────────────────────────────
interface Booking {
  id: string;
  studentId?: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  timezone?: string;
  dateOfBirth?: string;
  age?: number | null;
  gender?: "MALE" | "FEMALE";
  studentType?: string;
  nativeLanguage?: string;
  currentLevel?: string;
  parentName?: string;
  parentPhone?: string;
  parentRelation?: string;
  preferredDate?: string;
  preferredTime?: string;
  serviceSlug?: string;
  type: "TRIAL" | "REGULAR" | "MAKEUP";
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "MISSED" | "NO_SHOW";
  notes?: string;
  adminNotes?: string;
  meetingLink?: string;
  createdAt: string;
}

interface Teacher {
  id: string;
  user: { firstName: string; lastName: string; email: string };
  rating: number;
  hourlyRate: number;
}

interface PaginationMeta {
  total: number; page: number; limit: number; totalPages: number;
}

// ── Badges ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { class: string; icon: any }> = {
    PENDING:   { class: "bg-amber-100 text-amber-700 border-amber-200",   icon: Clock        },
    CONFIRMED: { class: "bg-blue-100 text-blue-700 border-blue-200",      icon: CheckCircle2 },
    COMPLETED: { class: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    CANCELLED: { class: "bg-red-100 text-red-600 border-red-200",         icon: XCircle      },
    NO_SHOW:   { class: "bg-gray-100 text-gray-600 border-gray-200",      icon: AlertCircle  },
  };
  const s = map[status] || map.PENDING;
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border gap-1", s.class)}>
      <Icon className="h-3 w-3" />{status.replace("_", " ")}
    </Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    TRIAL:   "bg-purple-100 text-purple-700 border-purple-200",
    REGULAR: "bg-[#0D4F4F]/10 text-[#0D4F4F] border-[#0D4F4F]/20",
    MAKEUP:  "bg-orange-100 text-orange-700 border-orange-200",
  };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border", map[type] || "")}>
      {type}
    </Badge>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function BookingsContent() {
  const locale = useLocale();
  const isRTL  = locale === "ar";

  // List state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta,     setMeta]     = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  // Teachers for confirm dialog
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Dialogs
  const [viewOpen,    setViewOpen]    = useState(false);
  const [statusOpen,  setStatusOpen]  = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected,    setSelected]    = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Status dialog state
  const [newStatus,   setNewStatus]   = useState("");
  const [adminNotes,  setAdminNotes]  = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  // Confirm dialog state
  const [confirmForm, setConfirmForm] = useState({
    teacherId:  "",
    date:       "",
    time:       "",
    duration:   "30",
    meetingLink:"",
    adminNotes: "",
  });

  // ── Fetch ────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 10 };
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

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await adminApi.getTeachers() as any;
      const list = res?.data || res || [];
      setTeachers(list.filter((u: any) => u.teacher).map((u: any) => ({
        id: u.teacher.id,
        user: { firstName: u.firstName, lastName: u.lastName, email: u.email },
        rating: u.teacher.rating,
        hourlyRate: u.teacher.hourlyRate,
      })));
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);
  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  // ── Handlers ─────────────────────────────────────────────
  const openView = (b: Booking) => { setSelected(b); setViewOpen(true); };

  const openStatus = (b: Booking) => {
    setSelected(b);
    setNewStatus(b.status);
    setAdminNotes(b.adminNotes || "");
    setMeetingLink(b.meetingLink || "");
    setStatusOpen(true);
  };

  const openConfirm = (b: Booking) => {
    setSelected(b);
    setConfirmForm({
      teacherId:   "",
      date:        b.preferredDate ? b.preferredDate.split("T")[0] : "",
      time:        b.preferredTime || "",
      duration:    "30",
      meetingLink: b.meetingLink || "",
      adminNotes:  b.adminNotes  || "",
    });
    setConfirmOpen(true);
  };

  const handleStatusChange = async () => {
    if (!selected) return;
    try {
      setActionLoading(true);
      await adminApi.updateBookingStatus(selected.id, {
        status: newStatus,
        ...(adminNotes  && { adminNotes  }),
        ...(meetingLink && { meetingLink }),
      });
      toast.success("Booking updated successfully");
      setStatusOpen(false);
      fetchBookings();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selected) return;
    if (!confirmForm.teacherId) { toast.error("Please select a teacher"); return; }
    if (!confirmForm.date)      { toast.error("Please select a date");    return; }
    if (!confirmForm.time)      { toast.error("Please select a time");    return; }
    if (!confirmForm.meetingLink) { toast.error("Meeting link is required"); return; }

    try {
      setActionLoading(true);
      await adminApi.confirmBooking(selected.id, {
        teacherId:  confirmForm.teacherId,
        date:       confirmForm.date,
        time:       confirmForm.time,
        duration:   Number(confirmForm.duration),
        meetingLink:confirmForm.meetingLink,
        adminNotes: confirmForm.adminNotes || undefined,
      });
      toast.success("Booking confirmed! Session created & email sent to student.");
      setConfirmOpen(false);
      fetchBookings();
    } catch (err: any) {
      toast.error(err?.message || "Failed to confirm booking");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const setConfirm = (field: string, val: string) =>
    setConfirmForm(prev => ({ ...prev, [field]: val }));

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={cn("space-y-6", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0D4F4F]">Booking Management</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage all bookings</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="h-10 pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
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
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left">Client</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">Age</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left">Service</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">Type</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left">Preferred</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-left">Created</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {b.age != null ? (
                          <Badge variant="outline" className={cn(
                            "text-xs font-bold",
                            b.age < 13 ? "bg-blue-50 text-blue-700 border-blue-200" :
                            b.age < 18 ? "bg-purple-50 text-purple-700 border-purple-200" :
                            "bg-gray-50 text-gray-700 border-gray-200"
                          )}>
                            {b.age} {b.age < 13 ? "🧒" : b.age < 18 ? "🧑" : "👤"}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
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
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openView(b)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* Confirm button only for PENDING bookings */}
                          {b.status === "PENDING" && (
                            <Button size="sm" className="h-8 text-xs bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white"
                              onClick={() => openConfirm(b)}>
                              <UserCheck className="h-3.5 w-3.5 mr-1" /> Confirm
                            </Button>
                          )}
                          {b.status !== "PENDING" && (
                            <Button size="sm" variant="outline" className="h-8 text-xs"
                              onClick={() => openStatus(b)}>
                              Update
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
                  Showing {(page-1)*meta.limit+1}–{Math.min(page*meta.limit, meta.total)} of {meta.total}
                </p>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8"
                    disabled={page <= 1} onClick={() => setPage(p => p-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[60px] text-center">{page} / {meta.totalPages}</span>
                  <Button size="icon" variant="outline" className="h-8 w-8"
                    disabled={page >= meta.totalPages} onClick={() => setPage(p => p+1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ══════════ VIEW DIALOG ══════════ */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">Booking Details</DialogTitle>
            <DialogDescription>{selected?.name} — {selected?.email}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={selected.status} />
                <TypeBadge type={selected.type} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { icon: User,         label: "Name",         value: selected.name           },
                  { icon: Mail,         label: "Email",        value: selected.email          },
                  { icon: Phone,        label: "Phone",        value: selected.phone || "—"   },
                  { icon: Globe,        label: "Country",      value: selected.country || "—" },
                  { icon: Cake,         label: "Date of Birth",value: selected.dateOfBirth ? `${formatDate(selected.dateOfBirth)} (Age: ${selected.age ?? "?"})` : "—" },
                  { icon: UserCircle,   label: "Gender",       value: selected.gender || "—" },
                  { icon: UserCircle,   label: "Type",         value: selected.studentType || "—" },
                  { icon: Globe,        label: "Language",     value: selected.nativeLanguage || "—" },
                  { icon: User,         label: "Level",        value: selected.currentLevel || "—" },
                  { icon: Clock,        label: "Timezone",     value: selected.timezone || "—"},
                  { icon: CalendarCheck,label: "Preferred",    value: `${selected.preferredDate ? formatDate(selected.preferredDate) : "—"} ${selected.preferredTime || ""}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-medium break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {selected.meetingLink && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Meeting Link</p>
                  <a href={selected.meetingLink} target="_blank" rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all">{selected.meetingLink}</a>
                </div>
              )}
              {selected.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Client Notes</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selected.notes}</p>
                </div>
              )}
              {selected.adminNotes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
                  <p className="text-sm bg-amber-50 p-3 rounded-lg">{selected.adminNotes}</p>
                </div>
              )}
              <Separator />
              <p className="text-xs text-muted-foreground">Created: {formatDate(selected.createdAt)}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════ STATUS DIALOG ══════════ */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">Update Booking Status</DialogTitle>
            <DialogDescription>{selected?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Label>Meeting Link</Label>
              <Input placeholder="https://zoom.us/j/..."
                value={meetingLink} onChange={e => setMeetingLink(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Admin Notes</Label>
              <Textarea placeholder="Add notes..." value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button onClick={handleStatusChange} disabled={actionLoading}
              className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white">
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════ CONFIRM DIALOG ══════════ */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F] flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Confirm Trial Booking
            </DialogTitle>
            <DialogDescription>
              Assign a teacher, set the time, and send confirmation email to{" "}
              <strong>{selected?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 max-h-[65vh] overflow-y-auto">

            {/* Student info summary */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground text-xs">Student:</span><p className="font-medium">{selected?.name}</p></div>
                <div><span className="text-muted-foreground text-xs">Service:</span><p className="font-medium">{selected?.serviceSlug || "—"}</p></div>
                <div><span className="text-muted-foreground text-xs">Country:</span><p className="font-medium">{selected?.country || "—"}</p></div>
                <div><span className="text-muted-foreground text-xs">Timezone:</span><p className="font-medium">{selected?.timezone || "—"}</p></div>
              </div>
            </div>

            <Separator />

            {/* Teacher select */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-[#0D4F4F]" />
                Assign Teacher <span className="text-red-400">*</span>
              </Label>
              <Select value={confirmForm.teacherId} onValueChange={v => setConfirm("teacherId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.length === 0 && (
                    <SelectItem value="none" disabled>No teachers available</SelectItem>
                  )}
                  {teachers.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.user.firstName} {t.user.lastName}
                      <span className="text-muted-foreground text-xs ml-2">
                        ⭐ {t.rating} · ${t.hourlyRate}/hr
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#0D4F4F]" />
                  Session Date <span className="text-red-400">*</span>
                </Label>
                <Input type="date" value={confirmForm.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => setConfirm("date", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#0D4F4F]" />
                  Session Time <span className="text-red-400">*</span>
                </Label>
                <Input type="time" value={confirmForm.time}
                  onChange={e => setConfirm("time", e.target.value)} />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-[#0D4F4F]" />
                Duration (minutes)
              </Label>
              <Select value={confirmForm.duration} onValueChange={v => setConfirm("duration", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes (Trial)</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Meeting Link */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-[#0D4F4F]" />
                Meeting Link <span className="text-red-400">*</span>
              </Label>
              <Input placeholder="https://zoom.us/j/123456789"
                value={confirmForm.meetingLink}
                onChange={e => setConfirm("meetingLink", e.target.value)} />
              <p className="text-xs text-muted-foreground">This link will be sent to the student via email</p>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1.5">
              <Label>Admin Notes (optional)</Label>
              <Textarea placeholder="Any special instructions or notes..."
                value={confirmForm.adminNotes}
                onChange={e => setConfirm("adminNotes", e.target.value)}
                rows={3} />
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>What happens after confirmation:</strong><br/>
                ✓ Booking status → CONFIRMED<br/>
                ✓ Session created and linked to teacher<br/>
                ✓ Confirmation email sent to student with session details &amp; meeting link
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={actionLoading}
              className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white">
              {actionLoading
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Confirming...</>
                : <><UserCheck className="h-4 w-4 mr-2" /> Confirm & Send Email</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}