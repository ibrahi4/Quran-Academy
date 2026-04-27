"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { adminApi } from "@/lib/api/admin";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Loader2, Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  Video, Clock, CheckCircle2, XCircle, AlertTriangle, PlayCircle, Calendar,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Session {
  id: string;
  studentId: string;
  bookingId?: string;
  title: string;
  date: string;
  duration: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "MISSED";
  meetingLink?: string;
  platform?: "ZOOM" | "GOOGLE_MEET" | "SKYPE" | "TEAMS";
  recordingUrl?: string;
  notes?: string;
  createdAt: string;
  student?: { id: string; user?: { firstName: string; lastName: string; email: string } };
}

interface PaginationMeta { total: number; page: number; limit: number; totalPages: number; }

interface SessionFormData {
  studentId: string;
  title: string;
  date: string;
  duration: string;
  status: string;
  meetingLink: string;
  platform: string;
  notes: string;
}

const initialForm: SessionFormData = {
  studentId: "", title: "", date: "", duration: "30",
  status: "SCHEDULED", meetingLink: "", platform: "ZOOM", notes: "",
};

function SessionStatusBadge({ status }: { status: string }) {
  const map: Record<string, { class: string; icon: any }> = {
    SCHEDULED: { class: "bg-blue-100 text-blue-700 border-blue-200", icon: Calendar },
    IN_PROGRESS: { class: "bg-amber-100 text-amber-700 border-amber-200", icon: PlayCircle },
    COMPLETED: { class: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    CANCELLED: { class: "bg-red-100 text-red-600 border-red-200", icon: XCircle },
    MISSED: { class: "bg-gray-100 text-gray-600 border-gray-200", icon: AlertTriangle },
  };
  const s = map[status] || map.SCHEDULED;
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border gap-1", s.class)}>
      <Icon className="h-3 w-3" />{status.replace("_", " ")}
    </Badge>
  );
}

function PlatformBadge({ platform }: { platform?: string }) {
  if (!platform) return <span className="text-xs text-muted-foreground">{"\u2014"}</span>;
  const map: Record<string, string> = {
    ZOOM: "bg-blue-50 text-blue-600 border-blue-200",
    GOOGLE_MEET: "bg-green-50 text-green-600 border-green-200",
    SKYPE: "bg-cyan-50 text-cyan-600 border-cyan-200",
    TEAMS: "bg-purple-50 text-purple-600 border-purple-200",
  };
  return <Badge variant="outline" className={cn("text-xs border", map[platform] || "")}>{platform.replace("_", " ")}</Badge>;
}

export default function SessionsContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = (en: string, ar: string) => isRTL ? ar : en;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Session | null>(null);
  const [formData, setFormData] = useState<SessionFormData>(initialForm);
  const [formLoading, setFormLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      // search not supported by backend sessions endpoint
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await adminApi.getSessions(params);
      setSessions(res.sessions || res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) { toast.error(err?.message || "Failed to load sessions"); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleCreate = async () => {
    if (!formData.studentId || !formData.title || !formData.date) {
      toast.error(t("Please fill required fields", "\u064A\u0631\u062C\u0649 \u0645\u0644\u0621 \u0627\u0644\u062D\u0642\u0648\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629"));
      return;
    }
    try {
      setFormLoading(true);
      await adminApi.createSession({
        studentId: formData.studentId,
        title: formData.title,
        date: new Date(formData.date).toISOString(),
        duration: parseInt(formData.duration),
        meetingLink: formData.meetingLink || undefined,
        platform: formData.platform || undefined,
        notes: formData.notes || undefined,
      });
      toast.success(t("Session created successfully", "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0646\u062C\u0627\u062D"));
      setCreateOpen(false);
      setFormData(initialForm);
      fetchSessions();
    } catch (err: any) { toast.error(err?.message || "Failed to create session"); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      setFormLoading(true);
      await adminApi.updateSession(selected.id, {
        title: formData.title,
        date: formData.date ? new Date(formData.date).toISOString() : undefined,
        duration: parseInt(formData.duration),
        status: formData.status,
        meetingLink: formData.meetingLink || undefined,
        platform: formData.platform || undefined,
        notes: formData.notes || undefined,
      });
      toast.success(t("Session updated successfully", "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0646\u062C\u0627\u062D"));
      setEditOpen(false);
      fetchSessions();
    } catch (err: any) { toast.error(err?.message || "Failed to update session"); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setFormLoading(true);
      await adminApi.deleteSession(selected.id);
      toast.success(t("Session deleted", "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u062C\u0644\u0633\u0629"));
      setDeleteOpen(false);
      fetchSessions();
    } catch (err: any) { toast.error(err?.message || "Failed to delete session"); }
    finally { setFormLoading(false); }
  };

  const openEdit = (s: Session) => {
    setSelected(s);
    setFormData({
      studentId: s.studentId, title: s.title,
      date: s.date ? new Date(s.date).toISOString().slice(0, 16) : "",
      duration: String(s.duration), status: s.status,
      meetingLink: s.meetingLink || "", platform: s.platform || "ZOOM", notes: s.notes || "",
    });
    setEditOpen(true);
  };

  const fmtDt = (d?: string) => {
    if (!d) return "\u2014";
    return new Date(d).toLocaleString(isRTL ? "ar-EG" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const stuName = (s: Session) => {
    if (s.student?.user) return `${s.student.user.firstName} ${s.student.user.lastName}`;
    return s.studentId?.slice(0, 8) || "\u2014";
  };

  const FormFields = ({ isEdit }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-2">
      {!isEdit && (
        <div className="space-y-1.5">
          <Label>Student ID *</Label>
          <Input placeholder="Enter student ID (UUID)" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} />
        </div>
      )}
      <div className="space-y-1.5">
        <Label>{t("Title", "\u0627\u0644\u0639\u0646\u0648\u0627\u0646")} *</Label>
        <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Tajweed Lesson" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t("Date & Time", "\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0648\u0627\u0644\u0648\u0642\u062A")} *</Label>
          <Input type="datetime-local" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("Duration (min)", "\u0627\u0644\u0645\u062F\u0629 (\u062F\u0642\u064A\u0642\u0629)")}</Label>
          <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 min</SelectItem>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="45">45 min</SelectItem>
              <SelectItem value="60">60 min</SelectItem>
              <SelectItem value="90">90 min</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t("Platform", "\u0627\u0644\u0645\u0646\u0635\u0629")}</Label>
          <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ZOOM">Zoom</SelectItem>
              <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
              <SelectItem value="SKYPE">Skype</SelectItem>
              <SelectItem value="TEAMS">Teams</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isEdit && (
          <div className="space-y-1.5">
            <Label>{t("Status", "\u0627\u0644\u062D\u0627\u0644\u0629")}</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="MISSED">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>{t("Meeting Link", "\u0631\u0627\u0628\u0637 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639")}</Label>
        <Input placeholder="https://zoom.us/j/..." value={formData.meetingLink} onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>{t("Notes", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}</Label>
        <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} placeholder={t("Optional notes...", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u062E\u062A\u064A\u0627\u0631\u064A\u0629...")} />
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0D4F4F]">{t("Session Management", "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062C\u0644\u0633\u0627\u062A")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("Schedule and manage learning sessions", "\u062C\u062F\u0648\u0644\u0629 \u0648\u0625\u062F\u0627\u0631\u0629 \u062C\u0644\u0633\u0627\u062A \u0627\u0644\u062A\u0639\u0644\u0645")}</p>
        </div>
        <Button onClick={() => { setFormData(initialForm); setCreateOpen(true); }} className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white gap-2">
          <Plus className="h-4 w-4" />{t("New Session", "\u062C\u0644\u0633\u0629 \u062C\u062F\u064A\u062F\u0629")}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input placeholder={t("Search...", "\u0628\u062D\u062B...")} value={search} onChange={(e) => setSearch(e.target.value)} className={cn("h-10", isRTL ? "pr-10" : "pl-10")} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-10"><SelectValue placeholder={t("Status", "\u0627\u0644\u062D\u0627\u0644\u0629")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("All", "\u0627\u0644\u0643\u0644")}</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="MISSED">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#0D4F4F]" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground"><Video className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{t("No sessions found", "\u0644\u0627 \u062A\u0648\u062C\u062F \u062C\u0644\u0633\u0627\u062A")}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{t("Title", "\u0627\u0644\u0639\u0646\u0648\u0627\u0646")}</th>
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{t("Student", "\u0627\u0644\u0637\u0627\u0644\u0628")}</th>
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{t("Date", "\u0627\u0644\u0645\u0648\u0639\u062F")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{t("Duration", "\u0627\u0644\u0645\u062F\u0629")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{t("Platform", "\u0627\u0644\u0645\u0646\u0635\u0629")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{t("Status", "\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{t("Actions", "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.title}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{stuName(s)}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{fmtDt(s.date)}</td>
                      <td className="px-4 py-3 text-center text-xs">{s.duration} min</td>
                      <td className="px-4 py-3 text-center"><PlatformBadge platform={s.platform} /></td>
                      <td className="px-4 py-3 text-center"><SessionStatusBadge status={s.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-[#0D4F4F]" onClick={() => { setSelected(s); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-blue-600" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => { setSelected(s); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                          {s.meetingLink && <a href={s.meetingLink} target="_blank" rel="noreferrer"><Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-green-600"><LinkIcon className="h-4 w-4" /></Button></a>}
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
                <p className="text-xs text-muted-foreground">{`Showing ${(page-1)*meta.limit+1}-${Math.min(page*meta.limit,meta.total)} of ${meta.total}`}</p>
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

      {/* CREATE */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[520px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{t("Create New Session", "\u0625\u0646\u0634\u0627\u0621 \u062C\u0644\u0633\u0629 \u062C\u062F\u064A\u062F\u0629")}</DialogTitle>
            <DialogDescription>{t("Enter session details", "\u0623\u062F\u062E\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062C\u0644\u0633\u0629")}</DialogDescription>
          </DialogHeader>
          <FormFields />
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("Cancel", "\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button onClick={handleCreate} disabled={formLoading} className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white">
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{t("Create", "\u0625\u0646\u0634\u0627\u0621")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[520px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{t("Edit Session", "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062C\u0644\u0633\u0629")}</DialogTitle>
            <DialogDescription>{selected?.title}</DialogDescription>
          </DialogHeader>
          <FormFields isEdit />
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t("Cancel", "\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button onClick={handleUpdate} disabled={formLoading} className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white">
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{t("Save", "\u062D\u0641\u0638")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[480px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{t("Session Details", "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062C\u0644\u0633\u0629")}</DialogTitle>
            <DialogDescription>{selected?.title}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 flex-wrap"><SessionStatusBadge status={selected.status} /><PlatformBadge platform={selected.platform} /></div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">{t("Title", "\u0627\u0644\u0639\u0646\u0648\u0627\u0646")}</p><p className="font-medium">{selected.title}</p></div>
                <div><p className="text-xs text-muted-foreground">{t("Student", "\u0627\u0644\u0637\u0627\u0644\u0628")}</p><p className="font-medium">{stuName(selected)}</p></div>
                <div><p className="text-xs text-muted-foreground">{t("Date", "\u0627\u0644\u0645\u0648\u0639\u062F")}</p><p className="font-medium">{fmtDt(selected.date)}</p></div>
                <div><p className="text-xs text-muted-foreground">{t("Duration", "\u0627\u0644\u0645\u062F\u0629")}</p><p className="font-medium">{selected.duration} min</p></div>
              </div>
              {selected.meetingLink && <div><p className="text-xs text-muted-foreground mb-1">Meeting Link</p><a href={selected.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">{selected.meetingLink}</a></div>}
              {selected.recordingUrl && <div><p className="text-xs text-muted-foreground mb-1">Recording</p><a href={selected.recordingUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">{selected.recordingUrl}</a></div>}
              {selected.notes && <div><p className="text-xs text-muted-foreground mb-1">{t("Notes", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}</p><p className="text-sm bg-gray-50 p-3 rounded-lg">{selected.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-red-600">{t("Delete Session", "\u062D\u0630\u0641 \u0627\u0644\u062C\u0644\u0633\u0629")}</DialogTitle>
            <DialogDescription>{t("Are you sure? This cannot be undone.", "\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F\u061F \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639.")}</DialogDescription>
          </DialogHeader>
          {selected && <div className="p-3 bg-red-50 rounded-xl my-2"><p className="font-medium text-gray-900">{selected.title}</p><p className="text-xs text-muted-foreground">{fmtDt(selected.date)}</p></div>}
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t("Cancel", "\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{t("Delete", "\u062D\u0630\u0641")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}