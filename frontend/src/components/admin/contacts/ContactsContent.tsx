"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { adminApi } from "@/lib/api/admin";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Loader2, Search, Eye, ChevronLeft, ChevronRight, Trash2,
  Mail, MailOpen, Reply, Archive, Phone, MessageSquare,
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

interface Contact {
  id: string; name: string; email: string; phone?: string;
  subject?: string; message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  repliedAt?: string; adminNote?: string; createdAt: string;
}

interface PaginationMeta { total: number; page: number; limit: number; totalPages: number; }

function ContactStatusBadge({ status }: { status: string }) {
  const map: Record<string, { class: string; icon: any }> = {
    NEW: { class: "bg-blue-100 text-blue-700 border-blue-200", icon: Mail },
    READ: { class: "bg-amber-100 text-amber-700 border-amber-200", icon: MailOpen },
    REPLIED: { class: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Reply },
    ARCHIVED: { class: "bg-gray-100 text-gray-600 border-gray-200", icon: Archive },
  };
  const s = map[status] || map.NEW;
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border gap-1", s.class)}>
      <Icon className="h-3 w-3" />{status}
    </Badge>
  );
}

export default function ContactsContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [viewOpen, setViewOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await adminApi.getContacts(params);
      setContacts(res.contacts || res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) { toast.error(err?.message || "Failed to load contacts"); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const openView = (c: Contact) => {
    setSelected(c);
    setViewOpen(true);
    if (c.status === "NEW") {
      adminApi.updateContact(c.id, { status: "READ" }).then(() => fetchContacts()).catch(() => {});
    }
  };

  const openUpdate = (c: Contact) => {
    setSelected(c);
    setNewStatus(c.status);
    setAdminNote(c.adminNote || "");
    setUpdateOpen(true);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      setActionLoading(true);
      const payload: Record<string, string> = { status: newStatus };
      if (adminNote) payload.adminNote = adminNote;
      await adminApi.updateContact(selected.id, payload);
      toast.success(isRTL ? "تم تحديث الرسالة" : "Contact updated");
      setUpdateOpen(false);
      fetchContacts();
    } catch (err: any) { toast.error(err?.message || "Failed to update"); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setActionLoading(true);
      await adminApi.deleteContact(selected.id);
      toast.success(isRTL ? "تم الحذف" : "Deleted");
      setDeleteOpen(false);
      fetchContacts();
    } catch (err: any) { toast.error(err?.message || "Failed"); }
    finally { setActionLoading(false); }
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const newCount = contacts.filter((c) => c.status === "NEW").length;

  return (
    <div className={cn("space-y-6", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0D4F4F]">
          {isRTL ? "الرسائل الواردة" : "Contact Messages"}
          {newCount > 0 && (
            <Badge className="bg-blue-600 text-white text-xs ml-2 align-middle">{newCount} {isRTL ? "جديد" : "new"}</Badge>
          )}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{isRTL ? "إدارة رسائل التواصل" : "Manage contact form submissions"}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["NEW", "READ", "REPLIED", "ARCHIVED"] as const).map((s) => {
          const count = contacts.filter((c) => c.status === s).length;
          const iconMap = { NEW: Mail, READ: MailOpen, REPLIED: Reply, ARCHIVED: Archive };
          const colorMap = { NEW: "text-blue-600 bg-blue-50", READ: "text-amber-600 bg-amber-50", REPLIED: "text-emerald-600 bg-emerald-50", ARCHIVED: "text-gray-500 bg-gray-50" };
          const Icon = iconMap[s];
          return (
            <Card key={s} className={cn("border-0 shadow-sm cursor-pointer transition-all", statusFilter === s && "ring-2 ring-[#0D4F4F]")} onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", colorMap[s].split(" ")[1])}>
                  <Icon className={cn("h-4 w-4", colorMap[s].split(" ")[0])} />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-muted-foreground">{s}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input placeholder={isRTL ? "بحث بالاسم أو البريد..." : "Search by name or email..."} value={search} onChange={(e) => setSearch(e.target.value)} className={cn("h-10", isRTL ? "pr-10" : "pl-10")} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[170px] h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{isRTL ? "الكل" : "All"}</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="READ">Read</SelectItem>
                <SelectItem value="REPLIED">Replied</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#0D4F4F]" /></div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground"><MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{isRTL ? "لا توجد رسائل" : "No messages found"}</p></div>
          ) : (
            <div className="divide-y">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "p-4 hover:bg-gray-50/50 transition-colors cursor-pointer",
                    c.status === "NEW" && "bg-blue-50/30 border-l-4 border-l-blue-500"
                  )}
                  onClick={() => openView(c)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      c.status === "NEW" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                    )}>
                      {c.status === "NEW" ? <Mail className="h-5 w-5" /> : <MailOpen className="h-5 w-5" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn("font-medium", c.status === "NEW" ? "text-gray-900" : "text-gray-700")}>{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.email}</span>
                        <ContactStatusBadge status={c.status} />
                      </div>
                      {c.subject && (
                        <p className={cn("text-sm mb-0.5", c.status === "NEW" ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>{c.subject}</p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-1">{c.message}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                        {c.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openUpdate(c)}>
                        {isRTL ? "تحديث" : "Update"}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => { setSelected(c); setDeleteOpen(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
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
                  <span className="text-sm font-medium min-w-[60px] text-center">{page}/{meta.totalPages}</span>
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
        <DialogContent className="sm:max-w-[550px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{isRTL ? "تفاصيل الرسالة" : "Message Details"}</DialogTitle>
            <DialogDescription>{selected?.name} — {selected?.email}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              {/* Status + Date */}
              <div className="flex items-center justify-between">
                <ContactStatusBadge status={selected.status} />
                <span className="text-xs text-muted-foreground">{formatDate(selected.createdAt)}</span>
              </div>

              <Separator />

              {/* Sender Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? "البريد" : "Email"}</p>
                    <a href={`mailto:${selected.email}`} className="font-medium text-blue-600 hover:underline">{selected.email}</a>
                  </div>
                </div>
                {selected.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{isRTL ? "الهاتف" : "Phone"}</p>
                      <p className="font-medium">{selected.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Subject */}
              {selected.subject && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "الموضوع" : "Subject"}</p>
                  <p className="font-semibold text-gray-900">{selected.subject}</p>
                </div>
              )}

              {/* Message */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">{isRTL ? "الرسالة" : "Message"}</p>
                <div className="text-sm bg-gray-50 p-4 rounded-xl whitespace-pre-wrap leading-relaxed">{selected.message}</div>
              </div>

              {/* Admin Note */}
              {selected.adminNote && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{isRTL ? "ملاحظة الإدارة" : "Admin Note"}</p>
                  <div className="text-sm bg-amber-50 p-3 rounded-xl border border-amber-100">{selected.adminNote}</div>
                </div>
              )}

              {/* Replied At */}
              {selected.repliedAt && (
                <p className="text-xs text-muted-foreground">
                  {isRTL ? "تم الرد في:" : "Replied at:"} {formatDate(selected.repliedAt)}
                </p>
              )}

              <Separator />

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your message"}`}>
                  <Button size="sm" variant="outline" className="h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 gap-1">
                    <Reply className="h-3.5 w-3.5" />{isRTL ? "رد عبر البريد" : "Reply via Email"}
                  </Button>
                </a>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setViewOpen(false); openUpdate(selected); }}>
                  {isRTL ? "تحديث الحالة" : "Update Status"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════ UPDATE DIALOG ══════════ */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-[450px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{isRTL ? "تحديث الرسالة" : "Update Message"}</DialogTitle>
            <DialogDescription>{selected?.name} — {selected?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>{isRTL ? "الحالة" : "Status"}</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                  <SelectItem value="REPLIED">Replied</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{isRTL ? "ملاحظة الإدارة" : "Admin Note"}</Label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
                placeholder={isRTL ? "أضف ملاحظاتك هنا..." : "Add your notes here..."}
              />
            </div>
          </div>
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setUpdateOpen(false)}>{isRTL ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleUpdate} disabled={actionLoading} className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white">
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isRTL ? "تحديث" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════ DELETE DIALOG ══════════ */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-red-600">{isRTL ? "حذف الرسالة" : "Delete Message"}</DialogTitle>
            <DialogDescription>{isRTL ? "هل أنت متأكد؟ لا يمكن التراجع." : "Are you sure? This cannot be undone."}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="p-3 bg-red-50 rounded-xl my-2">
              <p className="font-medium text-gray-900">{selected.name}</p>
              <p className="text-xs text-muted-foreground">{selected.email}</p>
              {selected.subject && <p className="text-sm text-gray-700 mt-1">{selected.subject}</p>}
            </div>
          )}
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{isRTL ? "إلغاء" : "Cancel"}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isRTL ? "حذف" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}