"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { adminApi } from "@/lib/api/admin";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Loader2, Search, Trash2, Eye, ChevronLeft, ChevronRight,
  MessageSquareQuote, Star, CheckCircle2, XCircle, Clock, Award, Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Testimonial {
  id: string; userId?: string; name: string; country?: string; avatar?: string;
  textEn?: string; textAr?: string; rating: number; videoUrl?: string;
  approved: boolean; featured: boolean; createdAt: string;
}

interface PaginationMeta { total: number; page: number; limit: number; totalPages: number; }

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("h-3.5 w-3.5", i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
      ))}
    </div>
  );
}

export default function TestimonialsContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [approvedFilter, setApprovedFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      if (approvedFilter === "APPROVED") params.approved = "true";
      if (approvedFilter === "PENDING") params.approved = "false";
      const res = await adminApi.getTestimonials(params);
      setTestimonials(res.testimonials || res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) { toast.error(err?.message || "Failed to load testimonials"); }
    finally { setLoading(false); }
  }, [page, search, approvedFilter]);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);
  useEffect(() => { setPage(1); }, [search, approvedFilter]);

  const handleApprove = async (t: Testimonial) => {
    try {
      setActionLoading(true);
      await adminApi.approveTestimonial(t.id);
      toast.success(isRTL ? "تمت الموافقة" : "Testimonial approved");
      fetchTestimonials();
    } catch (err: any) { toast.error(err?.message || "Failed"); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (t: Testimonial) => {
    try {
      setActionLoading(true);
      await adminApi.rejectTestimonial(t.id);
      toast.success(isRTL ? "تم الرفض" : "Testimonial rejected");
      fetchTestimonials();
    } catch (err: any) { toast.error(err?.message || "Failed"); }
    finally { setActionLoading(false); }
  };

  const handleToggleFeatured = async (t: Testimonial) => {
    try {
      setActionLoading(true);
      await adminApi.toggleFeaturedTestimonial(t.id);
      toast.success(t.featured ? (isRTL ? "تم إلغاء التمييز" : "Unfeatured") : (isRTL ? "تم التمييز" : "Featured"));
      fetchTestimonials();
    } catch (err: any) { toast.error(err?.message || "Failed"); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setActionLoading(true);
      await adminApi.deleteTestimonial(selected.id);
      toast.success(isRTL ? "تم الحذف" : "Deleted");
      setDeleteOpen(false);
      fetchTestimonials();
    } catch (err: any) { toast.error(err?.message || "Failed"); }
    finally { setActionLoading(false); }
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className={cn("space-y-6", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-[#0D4F4F]">{isRTL ? "إدارة الشهادات" : "Testimonial Management"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{isRTL ? "مراجعة وإدارة شهادات الطلاب" : "Review and manage student testimonials"}</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input placeholder={isRTL ? "بحث بالاسم..." : "Search by name..."} value={search} onChange={(e) => setSearch(e.target.value)} className={cn("h-10", isRTL ? "pr-10" : "pl-10")} />
            </div>
            <Select value={approvedFilter} onValueChange={setApprovedFilter}>
              <SelectTrigger className="w-full sm:w-[170px] h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{isRTL ? "الكل" : "All"}</SelectItem>
                <SelectItem value="APPROVED">{isRTL ? "موافق عليها" : "Approved"}</SelectItem>
                <SelectItem value="PENDING">{isRTL ? "قيد المراجعة" : "Pending"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#0D4F4F]" /></div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground"><MessageSquareQuote className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{isRTL ? "لا توجد شهادات" : "No testimonials found"}</p></div>
          ) : (
            <div className="divide-y">
              {testimonials.map((t) => (
                <div key={t.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="h-11 w-11 rounded-full bg-[#0D4F4F]/10 flex items-center justify-center text-[#0D4F4F] font-semibold text-sm shrink-0">
                      {t.avatar ? <img src={t.avatar} alt="" className="h-11 w-11 rounded-full object-cover" /> : t.name?.[0]?.toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-gray-900">{t.name}</span>
                        {t.country && <span className="text-xs text-muted-foreground">{t.country}</span>}
                        <StarRating rating={t.rating} />
                        {t.approved ? (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] gap-0.5"><CheckCircle2 className="h-2.5 w-2.5" />{isRTL ? "موافق" : "Approved"}</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] gap-0.5"><Clock className="h-2.5 w-2.5" />{isRTL ? "قيد المراجعة" : "Pending"}</Badge>
                        )}
                        {t.featured && (
                          <Badge variant="outline" className="bg-[#C8A96E]/20 text-[#C8A96E] border-[#C8A96E]/30 text-[10px] gap-0.5"><Award className="h-2.5 w-2.5" />{isRTL ? "مميز" : "Featured"}</Badge>
                        )}
                        {t.videoUrl && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-600 border-purple-200 text-[10px] gap-0.5"><Video className="h-2.5 w-2.5" />Video</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{isRTL ? t.textAr || t.textEn : t.textEn || t.textAr}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(t.createdAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-[#0D4F4F]" onClick={() => { setSelected(t); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                      {!t.approved && (
                        <Button size="sm" variant="outline" className="h-8 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleApprove(t)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />{isRTL ? "موافقة" : "Approve"}
                        </Button>
                      )}
                      {t.approved && !t.featured && (
                        <Button size="sm" variant="outline" className="h-8 text-xs text-[#C8A96E] border-[#C8A96E]/30 hover:bg-[#C8A96E]/10" onClick={() => handleToggleFeatured(t)}>
                          <Award className="h-3.5 w-3.5 mr-1" />{isRTL ? "تمييز" : "Feature"}
                        </Button>
                      )}
                      {t.featured && (
                        <Button size="sm" variant="outline" className="h-8 text-xs text-gray-500 border-gray-200 hover:bg-gray-50" onClick={() => handleToggleFeatured(t)}>
                          {isRTL ? "إلغاء التمييز" : "Unfeature"}
                        </Button>
                      )}
                      {t.approved && (
                        <Button size="sm" variant="outline" className="h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => handleReject(t)}>
                          <XCircle className="h-3.5 w-3.5 mr-1" />{isRTL ? "رفض" : "Reject"}
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => { setSelected(t); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && meta.totalPages > 1 && (
            <>
              <Separator />
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-muted-foreground">{isRTL ? `عرض ${(page-1)*meta.limit+1}-${Math.min(page*meta.limit,meta.total)} من ${meta.total}` : `Showing ${(page-1)*meta.limit+1}-${Math.min(page*meta.limit,meta.total)} of ${meta.total}`}</p>
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

      {/* VIEW */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[500px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{isRTL ? "تفاصيل الشهادة" : "Testimonial Details"}</DialogTitle>
            <DialogDescription>{selected?.name}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#0D4F4F]/10 flex items-center justify-center text-[#0D4F4F] font-bold text-lg">
                  {selected.avatar ? <img src={selected.avatar} alt="" className="h-12 w-12 rounded-full object-cover" /> : selected.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.country || "—"}</p>
                  <StarRating rating={selected.rating} />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {selected.approved ? (
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Approved</Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Pending</Badge>
                )}
                {selected.featured && <Badge variant="outline" className="bg-[#C8A96E]/20 text-[#C8A96E] border-[#C8A96E]/30 text-xs">Featured</Badge>}
              </div>
              <Separator />
              {selected.textEn && (
                <div><p className="text-xs text-muted-foreground mb-1">English</p><p className="text-sm bg-gray-50 p-3 rounded-lg">{selected.textEn}</p></div>
              )}
              {selected.textAr && (
                <div dir="rtl"><p className="text-xs text-muted-foreground mb-1">العربية</p><p className="text-sm bg-gray-50 p-3 rounded-lg">{selected.textAr}</p></div>
              )}
              {selected.videoUrl && (
                <div><p className="text-xs text-muted-foreground mb-1">Video</p><a href={selected.videoUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">{selected.videoUrl}</a></div>
              )}
              <p className="text-xs text-muted-foreground">{isRTL ? "التاريخ:" : "Date:"} {formatDate(selected.createdAt)}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-red-600">{isRTL ? "حذف الشهادة" : "Delete Testimonial"}</DialogTitle>
            <DialogDescription>{isRTL ? "هل أنت متأكد؟ لا يمكن التراجع." : "Are you sure? This cannot be undone."}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="p-3 bg-red-50 rounded-xl my-2">
              <p className="font-medium text-gray-900">{selected.name}</p>
              <p className="text-xs text-muted-foreground">{selected.country} &bull; {selected.rating} stars</p>
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