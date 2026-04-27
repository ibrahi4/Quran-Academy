"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { adminApi } from "@/lib/api/admin";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Loader2, Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  FileText, Globe, EyeOff, Image,
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

interface BlogPost {
  id: string; slug: string; titleEn: string; titleAr?: string;
  contentEn?: string; contentAr?: string; excerptEn?: string; excerptAr?: string;
  coverImage?: string; authorId: string; tags: string[]; locale?: string;
  published: boolean; publishedAt?: string; createdAt: string; updatedAt: string;
  author?: { firstName: string; lastName: string };
}

interface PaginationMeta { total: number; page: number; limit: number; totalPages: number; }

interface BlogFormData {
  slug: string; titleEn: string; titleAr: string; contentEn: string; contentAr: string;
  excerptEn: string; excerptAr: string; coverImage: string; tags: string; locale: string;
}

const initialForm: BlogFormData = {
  slug: "", titleEn: "", titleAr: "", contentEn: "", contentAr: "",
  excerptEn: "", excerptAr: "", coverImage: "", tags: "", locale: "EN",
};

export default function BlogContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(initialForm);
  const [formLoading, setFormLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      const res = await adminApi.getBlogPosts(params);
      setPosts(res.posts || res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) { toast.error(err?.message || "Failed to load posts"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setPage(1); }, [search]);

  const handleCreate = async () => {
    if (!formData.slug || !formData.titleEn) { toast.error(isRTL ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields"); return; }
    try {
      setFormLoading(true);
      await adminApi.createBlogPost({
        slug: formData.slug, titleEn: formData.titleEn, titleAr: formData.titleAr || undefined,
        contentEn: formData.contentEn || undefined, contentAr: formData.contentAr || undefined,
        excerptEn: formData.excerptEn || undefined, excerptAr: formData.excerptAr || undefined,
        coverImage: formData.coverImage || undefined,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        locale: formData.locale,
      });
      toast.success(isRTL ? "تم إنشاء المقال" : "Post created");
      setCreateOpen(false); setFormData(initialForm); fetchPosts();
    } catch (err: any) { toast.error(err?.message || "Failed to create post"); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      setFormLoading(true);
      await adminApi.updateBlogPost(selected.id, {
        slug: formData.slug, titleEn: formData.titleEn, titleAr: formData.titleAr || undefined,
        contentEn: formData.contentEn || undefined, contentAr: formData.contentAr || undefined,
        excerptEn: formData.excerptEn || undefined, excerptAr: formData.excerptAr || undefined,
        coverImage: formData.coverImage || undefined,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        locale: formData.locale,
      });
      toast.success(isRTL ? "تم تحديث المقال" : "Post updated");
      setEditOpen(false); fetchPosts();
    } catch (err: any) { toast.error(err?.message || "Failed to update post"); }
    finally { setFormLoading(false); }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      if (post.published) { await adminApi.unpublishBlogPost(post.id); toast.success(isRTL ? "تم إلغاء النشر" : "Post unpublished"); }
      else { await adminApi.publishBlogPost(post.id); toast.success(isRTL ? "تم نشر المقال" : "Post published"); }
      fetchPosts();
    } catch (err: any) { toast.error(err?.message || "Failed to toggle publish"); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try { setFormLoading(true); await adminApi.deleteBlogPost(selected.id); toast.success(isRTL ? "تم حذف المقال" : "Post deleted"); setDeleteOpen(false); fetchPosts(); }
    catch (err: any) { toast.error(err?.message || "Failed to delete"); }
    finally { setFormLoading(false); }
  };

  const openEdit = (post: BlogPost) => {
    setSelected(post);
    setFormData({ slug: post.slug, titleEn: post.titleEn, titleAr: post.titleAr || "", contentEn: post.contentEn || "", contentAr: post.contentAr || "", excerptEn: post.excerptEn || "", excerptAr: post.excerptAr || "", coverImage: post.coverImage || "", tags: (post.tags || []).join(", "), locale: post.locale || "EN" });
    setEditOpen(true);
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const BlogFormFields = () => (
    <div className="grid gap-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Slug *</Label><Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="my-blog-post" /></div>
        <div className="space-y-1.5"><Label>Locale</Label>
          <Select value={formData.locale} onValueChange={(v) => setFormData({ ...formData, locale: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="EN">English</SelectItem><SelectItem value="AR">Arabic</SelectItem><SelectItem value="BOTH">Both</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Title (EN) *</Label><Input value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>العنوان (AR)</Label><Input value={formData.titleAr} onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })} dir="rtl" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Excerpt (EN)</Label><Textarea value={formData.excerptEn} onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })} rows={2} /></div>
        <div className="space-y-1.5"><Label>المقتطف (AR)</Label><Textarea value={formData.excerptAr} onChange={(e) => setFormData({ ...formData, excerptAr: e.target.value })} rows={2} dir="rtl" /></div>
      </div>
      <div className="space-y-1.5"><Label>Content (EN)</Label><Textarea value={formData.contentEn} onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })} rows={6} /></div>
      <div className="space-y-1.5"><Label>المحتوى (AR)</Label><Textarea value={formData.contentAr} onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })} rows={6} dir="rtl" /></div>
      <div className="space-y-1.5"><Label>Cover Image URL</Label><Input value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} placeholder="https://..." /></div>
      <div className="space-y-1.5"><Label>Tags (comma-separated)</Label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="quran, tajweed, arabic" /></div>
    </div>
  );

  return (
    <div className={cn("space-y-6", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0D4F4F]">{isRTL ? "إدارة المقالات" : "Blog Management"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{isRTL ? "إنشاء وتعديل ونشر المقالات" : "Create, edit and publish blog posts"}</p>
        </div>
        <Button onClick={() => { setFormData(initialForm); setCreateOpen(true); }} className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white gap-2"><Plus className="h-4 w-4" />{isRTL ? "مقال جديد" : "New Post"}</Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
            <Input placeholder={isRTL ? "بحث بالعنوان..." : "Search by title..."} value={search} onChange={(e) => setSearch(e.target.value)} className={cn("h-10", isRTL ? "pr-10" : "pl-10")} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#0D4F4F]" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{isRTL ? "لا توجد مقالات" : "No posts found"}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "المقال" : "Post"}</th>
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "الكاتب" : "Author"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "الحالة" : "Status"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "الوسوم" : "Tags"}</th>
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "التاريخ" : "Date"}</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {post.coverImage ? (
                            <img src={post.coverImage} alt="" className="h-10 w-14 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="h-10 w-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Image className="h-4 w-4 text-gray-400" /></div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{isRTL ? post.titleAr || post.titleEn : post.titleEn}</p>
                            <p className="text-xs text-muted-foreground">/{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{post.author ? `${post.author.firstName} ${post.author.lastName}` : "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {post.published ? (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs gap-1"><Globe className="h-3 w-3" />{isRTL ? "منشور" : "Published"}</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-xs gap-1"><EyeOff className="h-3 w-3" />{isRTL ? "مسودة" : "Draft"}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {(post.tags || []).slice(0, 2).map((t, i) => (<Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>))}
                          {(post.tags || []).length > 2 && <span className="text-[10px] text-muted-foreground">+{post.tags.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(post.publishedAt || post.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-[#0D4F4F]" onClick={() => { setSelected(post); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-blue-600" onClick={() => openEdit(post)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" className={cn("h-8 text-xs", post.published ? "text-amber-600 border-amber-200 hover:bg-amber-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50")} onClick={() => handleTogglePublish(post)}>
                            {post.published ? (isRTL ? "إلغاء" : "Unpublish") : (isRTL ? "نشر" : "Publish")}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => { setSelected(post); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[700px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{isRTL ? "إنشاء مقال جديد" : "Create New Post"}</DialogTitle>
            <DialogDescription>{isRTL ? "أدخل بيانات المقال" : "Enter post details"}</DialogDescription>
          </DialogHeader>
          <BlogFormFields />
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{isRTL ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleCreate} disabled={formLoading} className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white">
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isRTL ? "إنشاء" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[700px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{isRTL ? "تعديل المقال" : "Edit Post"}</DialogTitle>
            <DialogDescription>{selected?.titleEn}</DialogDescription>
          </DialogHeader>
          <BlogFormFields />
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{isRTL ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleUpdate} disabled={formLoading} className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white">
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isRTL ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW DIALOG */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[600px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{isRTL ? "تفاصيل المقال" : "Post Details"}</DialogTitle>
            <DialogDescription>/{selected?.slug}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto">
              {selected.coverImage && (
                <img src={selected.coverImage} alt="" className="w-full h-48 object-cover rounded-xl" />
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {selected.published ? (
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs gap-1"><Globe className="h-3 w-3" />Published</Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-xs gap-1"><EyeOff className="h-3 w-3" />Draft</Badge>
                )}
                {(selected.tags || []).map((t, i) => (<Badge key={i} variant="secondary" className="text-xs">{t}</Badge>))}
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Title (EN)</p>
                <p className="font-semibold text-lg">{selected.titleEn}</p>
              </div>
              {selected.titleAr && (
                <div dir="rtl">
                  <p className="text-xs text-muted-foreground mb-1">العنوان (AR)</p>
                  <p className="font-semibold text-lg">{selected.titleAr}</p>
                </div>
              )}
              {selected.excerptEn && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Excerpt (EN)</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selected.excerptEn}</p>
                </div>
              )}
              {selected.excerptAr && (
                <div dir="rtl">
                  <p className="text-xs text-muted-foreground mb-1">المقتطف (AR)</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selected.excerptAr}</p>
                </div>
              )}
              {selected.contentEn && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Content (EN)</p>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap max-h-[200px] overflow-y-auto">{selected.contentEn}</div>
                </div>
              )}
              {selected.contentAr && (
                <div dir="rtl">
                  <p className="text-xs text-muted-foreground mb-1">المحتوى (AR)</p>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap max-h-[200px] overflow-y-auto">{selected.contentAr}</div>
                </div>
              )}
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Author</p><p className="font-medium">{selected.author ? `${selected.author.firstName} ${selected.author.lastName}` : "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{formatDate(selected.createdAt)}</p></div>
                {selected.publishedAt && <div><p className="text-xs text-muted-foreground">Published</p><p className="font-medium">{formatDate(selected.publishedAt)}</p></div>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-red-600">{isRTL ? "حذف المقال" : "Delete Post"}</DialogTitle>
            <DialogDescription>{isRTL ? "هل أنت متأكد؟ لا يمكن التراجع." : "Are you sure? This cannot be undone."}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="p-3 bg-red-50 rounded-xl my-2">
              <p className="font-medium text-gray-900">{selected.titleEn}</p>
              <p className="text-xs text-muted-foreground">/{selected.slug}</p>
            </div>
          )}
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{isRTL ? "إلغاء" : "Cancel"}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isRTL ? "حذف" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}