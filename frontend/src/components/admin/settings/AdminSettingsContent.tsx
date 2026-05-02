"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/lib/api/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  Save,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  Crown,
  Settings as SettingsIcon,
  Key,
  Activity,
} from "lucide-react";

export default function AdminSettingsContent() {
  const { isRTL } = useLocale();
  const { user, setAuth, accessToken } = useAuthStore();
  const t = (en: string, ar: string) => (isRTL ? ar : en);

  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: "",
    locale: user?.locale || "EN",
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const me: any = await api.get("/users/me");
      setForm({
        firstName: me.firstName || "",
        lastName: me.lastName || "",
        phone: me.phone || "",
        locale: me.locale || "EN",
      });
    } catch (e) {
      console.error("Profile load error:", e);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error(t("First and last name required", "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0644 \u0648\u0627\u0644\u0623\u062E\u064A\u0631 \u0645\u0637\u0644\u0648\u0628\u0627\u0646"));
      return;
    }

    try {
      setLoading(true);
      const updated: any = await api.patch("/users/me", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || null,
        locale: form.locale,
      });

      if (user && accessToken) {
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") || "" : "";
        setAuth(
          {
            ...user,
            firstName: updated.firstName,
            lastName: updated.lastName,
            locale: updated.locale,
          },
          accessToken,
          refreshToken
        );
      }

      toast.success(t("Profile updated successfully", "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0644\u0641 \u0628\u0646\u062C\u0627\u062D"));
    } catch (e: any) {
      toast.error(e?.message || t("Failed to update", "\u0641\u0634\u0644 \u0627\u0644\u062A\u062D\u062F\u064A\u062B"));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.error(t("All fields are required", "\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0644 \u0645\u0637\u0644\u0648\u0628\u0629"));
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error(t("Password must be at least 8 characters", "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 8 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"));
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error(t("Passwords do not match", "\u0643\u0644\u0645\u062A\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u062A\u064A\u0646"));
      return;
    }

    try {
      setPwLoading(true);
      await api.patch("/users/me/password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success(t("Password changed successfully", "\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0628\u0646\u062C\u0627\u062D"));
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      toast.error(e?.message || t("Failed to change password", "\u0641\u0634\u0644 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631"));
    } finally {
      setPwLoading(false);
    }
  };

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "A";
  const arabicLabel = "\u0627\u0644\u0639\u0631\u0628\u064A\u0629";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-hero-gradient shadow-premium">
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="admin-settings-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,8 46,24 62,20 50,32 62,44 46,40 40,56 34,40 18,44 30,32 18,20 34,24" fill="none" stroke="white" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#admin-settings-pattern)" />
          </svg>
        </div>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-accent to-accent-400 flex items-center justify-center shadow-2xl ring-4 ring-white/20">
              <span className="text-4xl font-bold text-gray-900">{initials}</span>
            </div>
            <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 rounded-full ring-4 ring-primary flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 backdrop-blur-sm mb-3">
              <Crown className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.15em]">
                {t("Administrator", "\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645")}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 truncate">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-white/70 mb-3 truncate flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {user?.email}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                {t("Verified", "\u0645\u0648\u062B\u0642")}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 text-[10px] font-bold">
                <Shield className="w-3 h-3" />
                {t("Full Access", "\u0648\u0635\u0648\u0644 \u0643\u0627\u0645\u0644")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Shield, label: t("Role", "\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629"), value: t("Admin", "\u0645\u062F\u064A\u0631"), bg: "bg-primary/10", text: "text-primary" },
          { icon: Activity, label: t("Status", "\u0627\u0644\u062D\u0627\u0644\u0629"), value: t("Active", "\u0646\u0634\u0637"), bg: "bg-emerald-50", text: "text-emerald-600" },
          { icon: Globe, label: t("Language", "\u0627\u0644\u0644\u063A\u0629"), value: form.locale === "AR" ? arabicLabel : "English", bg: "bg-blue-50", text: "text-blue-600" },
          { icon: Key, label: t("Access", "\u0627\u0644\u0648\u0635\u0648\u0644"), value: t("Full", "\u0643\u0627\u0645\u0644"), bg: "bg-accent/10", text: "text-accent" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-4 border border-sand-200/70 hover:shadow-premium transition-all">
              <div className="flex items-center gap-3">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                  <Icon className={cn("w-5 h-5", s.text)} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 truncate">
                    {s.label}
                  </p>
                  <p className="text-base font-bold text-gray-900 leading-tight mt-0.5 truncate">
                    {s.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-sand-200/70 w-fit">
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
            activeTab === "profile"
              ? "bg-primary text-white shadow-md"
              : "text-gray-600 hover:bg-sand-50"
          )}
        >
          <User className="w-4 h-4" />
          {t("Profile", "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A")}
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
            activeTab === "security"
              ? "bg-primary text-white shadow-md"
              : "text-gray-600 hover:bg-sand-50"
          )}
        >
          <Lock className="w-4 h-4" />
          {t("Security", "\u0627\u0644\u0623\u0645\u0627\u0646")}
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" ? (
        <section className="bg-white rounded-2xl border border-sand-200/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-sand-200/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {t("Account Information", "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628")}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("Manage your administrator profile", "\u0625\u062F\u0627\u0631\u0629 \u0645\u0644\u0641 \u0627\u0644\u0645\u062F\u064A\u0631")}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t("First Name", "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0644")}
                </Label>
                <div className="relative">
                  <User className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className={cn("h-11 rounded-xl", isRTL ? "pr-10" : "pl-10")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t("Last Name", "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u062E\u064A\u0631")}
                </Label>
                <div className="relative">
                  <User className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className={cn("h-11 rounded-xl", isRTL ? "pr-10" : "pl-10")}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {t("Email Address", "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A")}
              </Label>
              <div className="relative">
                <Mail className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className={cn("h-11 rounded-xl bg-sand-50 cursor-not-allowed", isRTL ? "pr-10" : "pl-10")}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t("Phone Number", "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641")}
                </Label>
                <div className="relative">
                  <Phone className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className={cn("h-11 rounded-xl", isRTL ? "pr-10" : "pl-10")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locale" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {t("Preferred Language", "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0645\u0641\u0636\u0644\u0629")}
                </Label>
                <div className="relative">
                  <Globe className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10", isRTL ? "right-3" : "left-3")} />
                  <select
                    id="locale"
                    value={form.locale}
                    onChange={(e) => setForm({ ...form, locale: e.target.value })}
                    className={cn(
                      "w-full h-11 rounded-xl border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary",
                      isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                    )}
                  >
                    <option value="EN">English</option>
                    <option value="AR">{arabicLabel}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand-200/70">
              <Button
                type="submit"
                disabled={loading}
                className="h-11 px-6 rounded-xl bg-primary hover:bg-primary-700 text-white font-bold shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("Saving...", "\u062C\u0627\u0631\u064D \u0627\u0644\u062D\u0641\u0638...")}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t("Save Changes", "\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>
      ) : (
        /* Security Tab */
        <section className="bg-white rounded-2xl border border-sand-200/70 overflow-hidden">
          <div className="px-6 py-5 border-b border-sand-200/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {t("Change Password", "\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("Keep your admin account secure", "\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0623\u0645\u0627\u0646 \u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u062F\u064A\u0631")}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="p-6 space-y-5 max-w-md">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {t("Current Password", "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629")}
              </Label>
              <div className="relative">
                <Lock className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
                <Input
                  type={showPw.current ? "text" : "password"}
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className={cn("h-11 rounded-xl", isRTL ? "pr-10 pl-10" : "pl-10 pr-10")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw({ ...showPw, current: !showPw.current })}
                  className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600", isRTL ? "left-3" : "right-3")}
                >
                  {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {t("New Password", "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629")}
              </Label>
              <div className="relative">
                <Lock className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
                <Input
                  type={showPw.next ? "text" : "password"}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className={cn("h-11 rounded-xl", isRTL ? "pr-10 pl-10" : "pl-10 pr-10")}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPw({ ...showPw, next: !showPw.next })}
                  className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600", isRTL ? "left-3" : "right-3")}
                >
                  {showPw.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                {t("Minimum 8 characters", "8 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644")}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {t("Confirm New Password", "\u062A\u0623\u0643\u064A\u062F \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")}
              </Label>
              <div className="relative">
                <Lock className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
                <Input
                  type={showPw.confirm ? "text" : "password"}
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  className={cn("h-11 rounded-xl", isRTL ? "pr-10 pl-10" : "pl-10 pr-10")}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })}
                  className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600", isRTL ? "left-3" : "right-3")}
                >
                  {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-sand-200/70">
              <Button
                type="submit"
                disabled={pwLoading}
                className="h-11 px-6 rounded-xl bg-primary hover:bg-primary-700 text-white font-bold shadow-md"
              >
                {pwLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("Updating...", "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u062F\u064A\u062B...")}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {t("Update Password", "\u062A\u062D\u062F\u064A\u062B \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}