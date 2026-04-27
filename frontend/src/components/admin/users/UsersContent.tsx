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
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

/* ───────────────────────── types ───────────────────────── */
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "GUEST";
  isActive: boolean;
  emailVerified: boolean;
  avatar?: string;
  locale?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  teachers: number;
  students: number;
  guests: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  locale: string;
}

const initialFormData: UserFormData = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  role: "STUDENT",
  locale: "EN",
};

/* ───────────────────── status badge ───────────────────── */
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { class: string; label: string }> = {
    ADMIN: { class: "bg-red-100 text-red-700 border-red-200", label: "Admin" },
    TEACHER: {
      class: "bg-blue-100 text-blue-700 border-blue-200",
      label: "Teacher",
    },
    STUDENT: {
      class: "bg-emerald-100 text-emerald-700 border-emerald-200",
      label: "Student",
    },
    GUEST: {
      class: "bg-gray-100 text-gray-600 border-gray-200",
      label: "Guest",
    },
  };
  const s = map[role] || map.GUEST;
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border", s.class)}>
      {s.label}
    </Badge>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge
      variant="outline"
      className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
    >
      Active
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-red-50 text-red-600 border-red-200 text-xs"
    >
      Inactive
    </Badge>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function UsersContent() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  /* ── state ── */
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  /* dialogs */
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [formLoading, setFormLoading] = useState(false);

  /* ── fetch ── */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: 10,
      };
      if (search) params.search = search;
      if (roleFilter !== "ALL") params.role = roleFilter;
      if (activeFilter !== "ALL") params.isActive = activeFilter === "ACTIVE" ? "true" : "false";

      const res = await adminApi.getUsers(params);
      setUsers(res.users || res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, activeFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getUserStats();
      setStats(res);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* reset page on filter change */
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, activeFilter]);

  /* ── handlers ── */
  const handleCreate = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setFormLoading(true);
      await adminApi.createUser(formData);
      toast.success("User created successfully");
      setCreateOpen(false);
      setFormData(initialFormData);
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    try {
      setFormLoading(true);
      const payload: Record<string, string> = {};
      if (formData.firstName) payload.firstName = formData.firstName;
      if (formData.lastName) payload.lastName = formData.lastName;
      if (formData.phone) payload.phone = formData.phone;
      if (formData.role) payload.role = formData.role;
      if (formData.locale) payload.locale = formData.locale;
      if (formData.email) payload.email = formData.email;
      if (formData.password) payload.password = formData.password;

      await adminApi.updateUser(selectedUser.id, payload);
      toast.success("User updated successfully");
      setEditOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await adminApi.toggleUserActive(user.id);
      toast.success(
        user.isActive ? "User deactivated" : "User activated"
      );
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || "Failed to toggle user status");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setFormLoading(true);
      await adminApi.deleteUser(selectedUser.id);
      toast.success("User deleted successfully");
      setDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user");
    } finally {
      setFormLoading(false);
    }
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "",
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || "",
      role: user.role,
      locale: user.locale || "EN",
    });
    setEditOpen(true);
  };

  const openView = (user: User) => {
    setSelectedUser(user);
    setViewOpen(true);
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ═════════════════════════ RENDER ═════════════════════════ */
  return (
    <div className={cn("space-y-6", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0D4F4F]">
            {isRTL ? "إدارة المستخدمين" : "User Management"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL
              ? "إدارة حسابات المستخدمين والأدوار والصلاحيات"
              : "Manage user accounts, roles and permissions"}
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(initialFormData);
            setCreateOpen(true);
          }}
          className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          {isRTL ? "إضافة مستخدم" : "Add User"}
        </Button>
      </div>

      {/* ─── Stats Cards ─── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: isRTL ? "إجمالي المستخدمين" : "Total Users",
              value: stats.total,
              icon: Users,
              color: "text-[#0D4F4F]",
              bg: "bg-[#0D4F4F]/5",
            },
            {
              label: isRTL ? "نشط" : "Active",
              value: stats.active,
              icon: UserCheck,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: isRTL ? "غير نشط" : "Inactive",
              value: stats.inactive,
              icon: UserX,
              color: "text-red-500",
              bg: "bg-red-50",
            },
            {
              label: isRTL ? "المعلمين" : "Teachers",
              value: stats.teachers,
              icon: ShieldCheck,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
          ].map((s, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl", s.bg)}>
                  <s.icon className={cn("h-5 w-5", s.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Filters ─── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                  isRTL ? "right-3" : "left-3"
                )}
              />
              <Input
                placeholder={isRTL ? "بحث بالاسم أو البريد..." : "Search by name or email..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn("h-10", isRTL ? "pr-10" : "pl-10")}
              />
            </div>

            {/* Role filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-10">
                <SelectValue placeholder={isRTL ? "الدور" : "Role"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{isRTL ? "جميع الأدوار" : "All Roles"}</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="GUEST">Guest</SelectItem>
              </SelectContent>
            </Select>

            {/* Active filter */}
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-10">
                <SelectValue placeholder={isRTL ? "الحالة" : "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{isRTL ? "الكل" : "All"}</SelectItem>
                <SelectItem value="ACTIVE">{isRTL ? "نشط" : "Active"}</SelectItem>
                <SelectItem value="INACTIVE">{isRTL ? "غير نشط" : "Inactive"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ─── Table ─── */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#0D4F4F]" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{isRTL ? "لا يوجد مستخدمين" : "No users found"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/80">
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>
                      {isRTL ? "المستخدم" : "User"}
                    </th>
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>
                      {isRTL ? "البريد" : "Email"}
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">
                      {isRTL ? "الدور" : "Role"}
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">
                      {isRTL ? "الحالة" : "Status"}
                    </th>
                    <th className={cn("px-4 py-3 font-medium text-muted-foreground", isRTL ? "text-right" : "text-left")}>
                      {isRTL ? "تاريخ التسجيل" : "Joined"}
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">
                      {isRTL ? "الإجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* user info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#0D4F4F]/10 flex items-center justify-center text-[#0D4F4F] font-semibold text-sm shrink-0">
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </div>
                          <span className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>
                      {/* email */}
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      {/* role */}
                      <td className="px-4 py-3 text-center">
                        <RoleBadge role={user.role} />
                      </td>
                      {/* active */}
                      <td className="px-4 py-3 text-center">
                        <ActiveBadge active={user.isActive} />
                      </td>
                      {/* date */}
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatDate(user.createdAt)}
                      </td>
                      {/* actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-[#0D4F4F]"
                            onClick={() => openView(user)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                            onClick={() => openEdit(user)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                            onClick={() => handleToggleActive(user)}
                            title={user.isActive ? "Deactivate" : "Activate"}
                          >
                            {user.isActive ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-red-600"
                            onClick={() => openDelete(user)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && meta.totalPages > 1 && (
            <>
              <Separator />
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {isRTL
                    ? `عرض ${(page - 1) * meta.limit + 1}-${Math.min(
                        page * meta.limit,
                        meta.total
                      )} من ${meta.total}`
                    : `Showing ${(page - 1) * meta.limit + 1}-${Math.min(
                        page * meta.limit,
                        meta.total
                      )} of ${meta.total}`}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    {isRTL ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="text-sm font-medium min-w-[60px] text-center">
                    {page} / {meta.totalPages}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {isRTL ? (
                      <ChevronLeft className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ══════════════ CREATE DIALOG ══════════════ */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">
              {isRTL ? "إضافة مستخدم جديد" : "Create New User"}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? "أدخل بيانات المستخدم الجديد" : "Enter the new user details"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isRTL ? "الاسم الأول" : "First Name"} *</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{isRTL ? "الاسم الأخير" : "Last Name"} *</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{isRTL ? "البريد الإلكتروني" : "Email"} *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>{isRTL ? "كلمة المرور" : "Password"} *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>{isRTL ? "الهاتف" : "Phone"}</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isRTL ? "الدور" : "Role"}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="GUEST">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{isRTL ? "اللغة" : "Locale"}</Label>
                <Select
                  value={formData.locale}
                  onValueChange={(v) => setFormData({ ...formData, locale: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN">English</SelectItem>
                    <SelectItem value="AR">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={formLoading}
              className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white"
            >
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isRTL ? "إنشاء" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════ EDIT DIALOG ══════════════ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">
              {isRTL ? "تعديل المستخدم" : "Edit User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isRTL ? "الاسم الأول" : "First Name"}</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{isRTL ? "الاسم الأخير" : "Last Name"}</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                {isRTL ? "كلمة المرور الجديدة" : "New Password"}{" "}
                <span className="text-xs text-muted-foreground">
                  ({isRTL ? "اتركه فارغاً لعدم التغيير" : "leave blank to keep"})
                </span>
              </Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>{isRTL ? "الهاتف" : "Phone"}</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isRTL ? "الدور" : "Role"}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="GUEST">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{isRTL ? "اللغة" : "Locale"}</Label>
                <Select
                  value={formData.locale}
                  onValueChange={(v) => setFormData({ ...formData, locale: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN">English</SelectItem>
                    <SelectItem value="AR">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={formLoading}
              className="bg-[#0D4F4F] hover:bg-[#0D4F4F]/90 text-white"
            >
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isRTL ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════ VIEW DIALOG ══════════════ */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[480px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#0D4F4F]">
              {isRTL ? "تفاصيل المستخدم" : "User Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-2">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-[#0D4F4F]/10 flex items-center justify-center text-[#0D4F4F] font-bold text-lg">
                  {selectedUser.firstName?.[0]}
                  {selectedUser.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <Separator />
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">{isRTL ? "الدور" : "Role"}</p>
                  <RoleBadge role={selectedUser.role} />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{isRTL ? "الحالة" : "Status"}</p>
                  <ActiveBadge active={selectedUser.isActive} />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{isRTL ? "الهاتف" : "Phone"}</p>
                  <p className="font-medium">{selectedUser.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{isRTL ? "اللغة" : "Locale"}</p>
                  <p className="font-medium">{selectedUser.locale || "EN"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {isRTL ? "البريد مؤكد" : "Email Verified"}
                  </p>
                  <p className="font-medium">{selectedUser.emailVerified ? "✅ Yes" : "❌ No"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {isRTL ? "آخر دخول" : "Last Login"}
                  </p>
                  <p className="font-medium">{formatDateTime(selectedUser.lastLoginAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {isRTL ? "تاريخ التسجيل" : "Joined"}
                  </p>
                  <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {isRTL ? "آخر تحديث" : "Updated"}
                  </p>
                  <p className="font-medium">{formatDate(selectedUser.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════ DELETE DIALOG ══════════════ */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {isRTL ? "حذف المستخدم" : "Delete User"}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? "هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
                : "Are you sure you want to delete this user? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl my-2">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm">
                {selectedUser.firstName?.[0]}
                {selectedUser.lastName?.[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
          )}
          <DialogFooter className={cn(isRTL && "flex-row-reverse")}>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={formLoading}
            >
              {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isRTL ? "حذف" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}