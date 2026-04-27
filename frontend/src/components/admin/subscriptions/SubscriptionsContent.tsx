"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { adminApi } from "@/lib/api/admin";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Crown,
  XCircle,
  CheckCircle2,
  PauseCircle,
  Clock,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Subscription {
  id: string;
  userId: string;
  plan: "TRIAL" | "BASIC" | "PREMIUM" | "FAMILY";
  status: "ACTIVE" | "PAUSED" | "CANCELLED" | "EXPIRED";
  sessionsPerWeek: number;
  priceMonthly: string | number;
  startDate: string;
  endDate?: string;
  cancelledAt?: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

interface Plan {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  priceMonthly: string | number;
  priceYearly?: string | number;
  sessionsPerWeek: number;
  sessionDuration: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PlanFormData {
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  priceMonthly: string;
  priceYearly: string;
  sessionsPerWeek: string;
  sessionDuration: string;
  features: string;
  isActive: boolean;
  sortOrder: string;
}

const initialPlanForm: PlanFormData = {
  slug: "", nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "",
  priceMonthly: "", priceYearly: "", sessionsPerWeek: "2", sessionDuration: "30",
  features: "", isActive: true, sortOrder: "0",
};

function SubStatusBadge({ status }: { status: string }) {
  const map: Record<string, { class: string; icon: any }> = {
    ACTIVE: { class: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    PAUSED: { class: "bg-amber-100 text-amber-700 border-amber-200", icon: PauseCircle },
    CANCELLED: { class: "bg-red-100 text-red-600 border-red-200", icon: XCircle },
    EXPIRED: { class: "bg-gray-100 text-gray-600 border-gray-200", icon: Clock },
  };
  const s = map[status] || map.ACTIVE;
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border gap-1", s.class)}>
      <Icon className="h-3 w-3" />{status}
    </Badge>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, string> = {
    TRIAL: "bg-gray-100 text-gray-600 border-gray-200",
    BASIC: "bg-blue-100 text-blue-600 border-blue-200",
    PREMIUM: "bg-[#C8A96E]/20 text-[#C8A96E] border-[#C8A96E]/30",
    FAMILY: "bg-purple-100 text-purple-600 border-purple-200",
  };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border", map[plan] || "")}>
      {plan === "PREMIUM" && <Crown className="h-3 w-3 mr-1" />}{plan}
    </Badge>
  );
}

export default function SubscriptionsContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subMeta, setSubMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [subLoading, setSubLoading] = useState(true);
  const [subSearch, setSubSearch] = useState("");
  const [subStatusFilter, setSubStatusFilter] = useState("ALL");
  const [subPage, setSubPage] = useState(1);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const [viewOpen, setViewOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  const [planCreateOpen, setPlanCreateOpen] = useState(false);
  const [planEditOpen, setPlanEditOpen] = useState(false);
  const [planDeleteOpen, setPlanDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState<PlanFormData>(initialPlanForm);
  const [formLoading, setFormLoading] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setSubLoading(true);
      const params: Record<string, string | number> = { page: subPage, limit: 10 };
      if (subSearch) params.search = subSearch;
      if (subStatusFilter !== "ALL") params.status = subStatusFilter;
      const res = await adminApi.getSubscriptions(params);
      setSubscriptions(res.subscriptions || res.data || []);
      if (res.meta) setSubMeta(res.meta);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load subscriptions");
    } finally {
      setSubLoading(false);
    }
  }, [subPage, subSearch, subStatusFilter]);

  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      const res = await adminApi.getAllPlans();
      setPlans(res.plans || res.data || res || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load plans");
    } finally {
      setPlansLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);
  useEffect(() => { fetchPlans(); }, [fetchPlans]);
  useEffect(() => { setSubPage(1); }, [subSearch, subStatusFilter]);

  const handleCancelSub = async () => {
    if (!selectedSub) return;
    try {
      setFormLoading(true);
      await adminApi.cancelSubscription(selectedSub.id);
      toast.success(isRTL ? "تم إلغاء الاشتراك" : "Subscription cancelled");
      setCancelOpen(false);
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!planForm.slug || !planForm.nameEn || !planForm.priceMonthly) {
      toast.error(isRTL ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields");
      return;
    }
    try {
      setFormLoading(true);
      await adminApi.createPlan({
        slug: planForm.slug, nameEn: planForm.nameEn, nameAr: planForm.nameAr,
        descriptionEn: planForm.descriptionEn || undefined, descriptionAr: planForm.descriptionAr || undefined,
        priceMonthly: parseFloat(planForm.priceMonthly),
        priceYearly: planForm.priceYearly ? parseFloat(planForm.priceYearly) : undefined,
        sessionsPerWeek: parseInt(planForm.sessionsPerWeek), sessionDuration: parseInt(planForm.sessionDuration),
        features: planForm.features ? planForm.features.split("\n").filter(Boolean) : [],
        isActive: planForm.isActive, sortOrder: parseInt(planForm.sortOrder),
      });
      toast.success(isRTL ? "تم إنشاء الخطة" : "Plan created");
      setPlanCreateOpen(false);
      setPlanForm(initialPlanForm);
      fetchPlans();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create plan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;
    try {
      setFormLoading(true);
      await adminApi.updatePlan(selectedPlan.id, {
        slug: planForm.slug, nameEn: planForm.nameEn, nameAr: planForm.nameAr,
        descriptionEn: planForm.descriptionEn || undefined, descriptionAr: planForm.descriptionAr || undefined,
        priceMonthly: parseFloat(planForm.priceMonthly),
        priceYearly: planForm.priceYearly ? parseFloat(planForm.priceYearly) : undefined,
        sessionsPerWeek: parseInt(planForm.sessionsPerWeek), sessionDuration: parseInt(planForm.sessionDuration),
        features: planForm.features ? planForm.features.split("\n").filter(Boolean) : [],
        isActive: planForm.isActive, sortOrder: parseInt(planForm.sortOrder),
      });
      toast.success(isRTL ? "تم تحديث الخطة" : "Plan updated");
      setPlanEditOpen(false);
      fetchPlans();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update plan");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    try {
      setFormLoading(true);
      await adminApi.deletePlan(selectedPlan.id);
      toast.success(isRTL ? "تم حذف الخطة" : "Plan deleted");
      setPlanDeleteOpen(false);
      fetchPlans();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete plan");
    } finally {
      setFormLoading(false);
    }
  };

  const openEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      slug: plan.slug, nameEn: plan.nameEn, nameAr: plan.nameAr,
      descriptionEn: plan.descriptionEn || "", descriptionAr: plan.descriptionAr || "",
      priceMonthly: String(plan.priceMonthly), priceYearly: plan.priceYearly ? String(plan.priceYearly) : "",
      sessionsPerWeek: String(plan.sessionsPerWeek), sessionDuration: String(plan.sessionDuration),
      features: (plan.features || []).join("\n"), isActive: plan.isActive, sortOrder: String(plan.sortOrder),
    });
    setPlanEditOpen(true);
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getUserName = (s: Subscription) => {
    if (s.user) return `${s.user.firstName} ${s.user.lastName}`;
    return s.userId?.slice(0, 8) || "—";
  };

  const PlanFormFields = () => (
    <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Slug *</Label><Input value={planForm.slug} onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })} placeholder="e.g. basic-plan" /></div>
        <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" value={planForm.sortOrder} onChange={(e) => setPlanForm({ ...planForm, sortOrder: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Name (EN) *</Label><Input value={planForm.nameEn} onChange={(e) => setPlanForm({ ...planForm, nameEn: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>الاسم (AR)</Label><Input value={planForm.nameAr} onChange={(e) => setPlanForm({ ...planForm, nameAr: e.target.value })} dir="rtl" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Description (EN)</Label><Textarea value={planForm.descriptionEn} onChange={(e) => setPlanForm({ ...planForm, descriptionEn: e.target.value })} rows={2} /></div>
        <div className="space-y-1.5"><Label>الوصف (AR)</Label><Textarea value={planForm.descriptionAr} onChange={(e) => setPlanForm({ ...planForm, descriptionAr: e.target.value })} rows={2} dir="rtl" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Monthly Price *</Label><Input type="number" step="0.01" value={planForm.priceMonthly} onChange={(e) => setPlanForm({ ...planForm, priceMonthly: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Yearly Price</Label><Input type="number" step="0.01" value={planForm.priceYearly} onChange={(e) => setPlanForm({ ...planForm, priceYearly: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Sessions/Week</Label><Input type="number" value={planForm.sessionsPerWeek} onChange={(e) => setPlanForm({ ...planForm, sessionsPerWeek: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Duration (min)</Label><Input type="number" value={planForm.sessionDuration} onChange={(e) => setPlanForm({ ...planForm, sessionDuration: e.target.value })} /></div>
      </div>
      <div className="space-y-1.5"><Label>Features (one per line)</Label><Textarea value={planForm.features} onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })} rows={4} placeholder={"Feature 1\nFeature 2"} /></div>
    </div>
  );

  return (
    <div className={cn("space-y-6", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-[#0D4F4F]">{isRTL ? "إدارة الاشتراكات" : "Subscription Management"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{isRTL ? "إدارة الاشتراكات والخطط" : "Manage subscriptions and plans"}</p>
      </div>

      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="subscriptions">{isRTL ? "الاشتراكات" : "Subscriptions"}</TabsTrigger>
          <TabsTrigger value="plans">{isRTL ? "الخطط" : "Plans"}</TabsTrigger>
        </TabsList>

        {/* SUBSCRIPTIONS TAB */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                  <Input placeholder={isRTL ? "بحث..." : "Search..."} value={subSearch} onChange={(e) => setSubSearch(e.target.value)} className={cn("h-10", isRTL ? "pr-10" : "pl-10")} />
                </div>
                <Select value={subStatusFilter} onValueChange={setSubStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[170px] h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{isRTL ? "الكل" : "All"}</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {subLoading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#0D4F4F]" /></div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{isRTL ? "لا توجد اشتراكات" : "No subscriptions found"}</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50/80">
                        <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "المشترك" : "Subscriber"}</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "الخطة" : "Plan"}</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "الحالة" : "Status"}</th>
                        <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "السعر" : "Price"}</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "جلسات/أسبوع" : "Sess/wk"}</th>
                        <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>{isRTL ? "البداية" : "Start"}</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-center">{isRTL ? "الإجراءات" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3"><p className="font-medium text-gray-900">{getUserName(sub)}</p><p className="text-xs text-muted-foreground">{sub.user?.email}</p></td>
                          <td className="px-4 py-3 text-center"><PlanBadge plan={sub.plan} /></td>
                          <td className="px-4 py-3 text-center"><SubStatusBadge status={sub.status} /></td>
                          <td className="px-4 py-3 font-semibold">${Number(sub.priceMonthly).toFixed(2)}/mo</td>
                          <td className="px-4 py-3 text-center">{sub.sessionsPerWeek}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(sub.startDate)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-[#0D4F4F]" onClick={() => { setSelectedSub(sub); setViewOpen(true); }}><Eye className="h-4 w-4" /></Button>
                              {sub.status === "ACTIVE" && (
                                <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setSelectedSub(sub); setCancelOpen(true); }}>
                                  <Ban className="h-3.5 w-3.5 mr-1" />{isRTL ? "إلغاء" : "Cancel"}
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
              {!subLoading && subMeta.totalPages > 1 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-xs text-muted-foreground">{isRTL ? `عرض ${(subPage-1)*subMeta.limit+1}-${Math.min(subPage*subMeta.limit,subMeta.total)} من ${subMeta.total}` : `Showing ${(subPage-1)*subMeta.limit+1}-${Math.min(subPage*subMeta.limit,subMeta.total)} of ${subMeta.total}`}</p>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8" disabled={subPage<=1} onClick={() => setSubPage(p=>p-1)}>{isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</Button>
                      <span className="text-sm font-medium min-w-[60px] text-center">{subPage}/{subMeta.totalPages}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8" disabled={subPage>=subMeta.totalPages} onClick={() => setSubPage(p=>p+1)}>{isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLANS TAB */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setPlanForm(initialPlanForm); setPlanCreateOpen(true); }} className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white gap-2">
              <Plus className="h-4 w-4" />{isRTL ? "خطة جديدة" : "New Plan"}
            </Button>
          </div>
          {plansLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#0D4F4F]" /></div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{isRTL ? "لا توجد خطط" : "No plans"}</p></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.id} className={cn("border shadow-sm", !plan.isActive && "opacity-60")}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{isRTL ? plan.nameAr || plan.nameEn : plan.nameEn}</CardTitle>
                      <Badge variant={plan.isActive ? "default" : "secondary"} className={plan.isActive ? "bg-emerald-100 text-emerald-700" : ""}>{plan.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "معطل" : "Inactive")}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.slug}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[#0D4F4F]">${Number(plan.priceMonthly).toFixed(0)}</span>
                      <span className="text-sm text-muted-foreground">/{isRTL ? "شهر" : "mo"}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{plan.sessionsPerWeek} {isRTL ? "جلسات/أسبوع" : "sessions/week"} &bull; {plan.sessionDuration} min</div>
                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-1">
                        {plan.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />{f}</li>
                        ))}
                        {plan.features.length > 4 && <li className="text-xs text-muted-foreground">+{plan.features.length - 4} more</li>}
                      </ul>
                    )}
                    <Separator />
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => openEditPlan(plan)}><Edit className="h-3.5 w-3.5 mr-1" />{isRTL ? "تعديل" : "Edit"}</Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setSelectedPlan(plan); setPlanDeleteOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* VIEW SUB */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[480px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{isRTL ? "تفاصيل الاشتراك" : "Subscription Details"}</DialogTitle>
            <DialogDescription>{selectedSub && getUserName(selectedSub)}</DialogDescription>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 flex-wrap"><PlanBadge plan={selectedSub.plan} /><SubStatusBadge status={selectedSub.status} /></div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">{isRTL ? "المشترك" : "Subscriber"}</p><p className="font-medium">{getUserName(selectedSub)}</p></div>
                <div><p className="text-xs text-muted-foreground">{isRTL ? "البريد" : "Email"}</p><p className="font-medium">{selectedSub.user?.email || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">{isRTL ? "السعر" : "Price"}</p><p className="font-medium">${Number(selectedSub.priceMonthly).toFixed(2)}/mo</p></div>
                <div><p className="text-xs text-muted-foreground">{isRTL ? "جلسات/أسبوع" : "Sessions/Week"}</p><p className="font-medium">{selectedSub.sessionsPerWeek}</p></div>
                <div><p className="text-xs text-muted-foreground">{isRTL ? "البداية" : "Start"}</p><p className="font-medium">{formatDate(selectedSub.startDate)}</p></div>
                <div><p className="text-xs text-muted-foreground">{isRTL ? "النهاية" : "End"}</p><p className="font-medium">{formatDate(selectedSub.endDate)}</p></div>
                {selectedSub.cancelledAt && <div className="col-span-2"><p className="text-xs text-muted-foreground">{isRTL ? "تاريخ الإلغاء" : "Cancelled"}</p><p className="font-medium text-red-600">{formatDate(selectedSub.cancelledAt)}</p></div>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CANCEL SUB */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-[400px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-red-600">{isRTL ? "إلغاء الاشتراك" : "Cancel Subscription"}</DialogTitle>
            <DialogDescription>{isRTL ? "هل أنت متأكد من إلغاء هذا الاشتراك؟" : "Are you sure you want to cancel this subscription?"}</DialogDescription>
          </DialogHeader>
          {selectedSub && (
            <div className="p-3 bg-red-50 rounded-xl my-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{getUserName(selectedSub)}</p>
                  <p className="text-xs text-muted-foreground">{selectedSub.user?.email}</p>
                </div>
                <PlanBadge plan={selectedSub.plan} />
              </div>
            </div>
          )}
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>{isRTL ? "تراجع" : "Back"}</Button>
            <Button variant="destructive" onClick={handleCancelSub} disabled={formLoading}>
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isRTL ? "إلغاء الاشتراك" : "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE PLAN */}
      <Dialog open={planCreateOpen} onOpenChange={setPlanCreateOpen}>
        <DialogContent className="sm:max-w-[560px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{isRTL ? "إنشاء خطة جديدة" : "Create New Plan"}</DialogTitle>
            <DialogDescription>{isRTL ? "أدخل بيانات الخطة" : "Enter plan details"}</DialogDescription>
          </DialogHeader>
          <PlanFormFields />
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setPlanCreateOpen(false)}>{isRTL ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleCreatePlan} disabled={formLoading} className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white">
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isRTL ? "إنشاء" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT PLAN */}
      <Dialog open={planEditOpen} onOpenChange={setPlanEditOpen}>
        <DialogContent className="sm:max-w-[560px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">{isRTL ? "تعديل الخطة" : "Edit Plan"}</DialogTitle>
            <DialogDescription>{selectedPlan?.nameEn}</DialogDescription>
          </DialogHeader>
          <PlanFormFields />
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setPlanEditOpen(false)}>{isRTL ? "إلغاء" : "Cancel"}</Button>
            <Button onClick={handleUpdatePlan} disabled={formLoading} className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white">
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isRTL ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE PLAN */}
      <Dialog open={planDeleteOpen} onOpenChange={setPlanDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-red-600">{isRTL ? "حذف الخطة" : "Delete Plan"}</DialogTitle>
            <DialogDescription>{isRTL ? "هل أنت متأكد؟ لا يمكن التراجع." : "Are you sure? This cannot be undone."}</DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="p-3 bg-red-50 rounded-xl my-2">
              <p className="font-medium text-gray-900">{selectedPlan.nameEn}</p>
              <p className="text-xs text-muted-foreground">{selectedPlan.slug} &bull; ${Number(selectedPlan.priceMonthly).toFixed(2)}/mo</p>
            </div>
          )}
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setPlanDeleteOpen(false)}>{isRTL ? "إلغاء" : "Cancel"}</Button>
            <Button variant="destructive" onClick={handleDeletePlan} disabled={formLoading}>
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isRTL ? "حذف" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}