"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { useAuthStore } from "@/stores/useAuthStore";
import studentApi from "@/lib/api/student";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Mail, Phone, Globe, Lock, Save, Loader2,
  Eye, EyeOff, CheckCircle2, ShieldCheck,
} from "lucide-react";

export default function StudentProfileContent() {
  const { isRTL } = useLocale();
  const { user, setAuth, accessToken } = useAuthStore();
  const t = (en: string, ar: string) => (isRTL ? ar : en);
  const isTrial = user?.role === "TRIAL_STUDENT";

  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: "",
    locale: user?.locale || "EN",
  });

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const me: any = await studentApi.getMe();
      console.log("[StudentProfile] me:", me);
      setForm({
        firstName: me.firstName || "",
        lastName: me.lastName || "",
        phone: me.phone || "",
        locale: me.locale || "EN",
      });
    } catch (e) { console.error("[StudentProfile] load error:", e); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error(t("First and last name required", "\u0627\u0644\u0627\u0633\u0645 \u0645\u0637\u0644\u0648\u0628")); return;
    }
    try {
      setLoading(true);
      const updated: any = await studentApi.updateMe({
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        phone: form.phone.trim() || null, locale: form.locale,
      });
      console.log("[StudentProfile] updated:", updated);
      if (user && accessToken) {
        const rt = typeof window !== "undefined" ? localStorage.getItem("refresh_token") || "" : "";
        setAuth({ ...user, firstName: updated.firstName, lastName: updated.lastName, locale: updated.locale }, accessToken, rt);
      }
      toast.success(t("Profile updated", "\u062a\u0645 \u0627\u0644\u062a\u062d\u062f\u064a\u062b"));
    } catch (e: any) {
      toast.error(e?.message || t("Update failed", "\u0641\u0634\u0644 \u0627\u0644\u062a\u062d\u062f\u064a\u062b"));
    } finally { setLoading(false); }
  };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) { toast.error(t("All fields required", "\u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0644 \u0645\u0637\u0644\u0648\u0628\u0629")); return; }
    if (pwForm.newPassword.length < 8) { toast.error(t("Min 8 characters", "8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644")); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error(t("Passwords don't match", "\u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646")); return; }
    try {
      setPwLoading(true);
      await studentApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      console.log("[StudentProfile] password changed");
      toast.success(t("Password changed", "\u062a\u0645 \u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631"));
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      toast.error(e?.message || t("Failed", "\u0641\u0634\u0644"));
    } finally { setPwLoading(false); }
  };

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  const PwInput = ({ id, label, value, onChange, show, onToggle }: any) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</Label>
      <div className="relative">
        <Lock className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
        <Input id={id} type={show ? "text" : "password"} value={value} onChange={onChange}
          className={cn("h-11 rounded-xl", isRTL ? "pr-10 pl-10" : "pl-10 pr-10")} required minLength={8} />
        <button type="button" onClick={onToggle}
          className={cn("absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600", isRTL ? "left-3" : "right-3")}>
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Profile Card */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center ring-4 ring-white shadow-md",
            isTrial ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-hero-gradient"
          )}>
            <span className="text-xl font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-gray-500 truncate flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />{user?.email}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" />{t("Active", "\u0646\u0634\u0637")}
              </span>
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold",
                isTrial ? "bg-amber-50 text-amber-700" : "bg-primary/10 text-primary")}>
                {isTrial ? t("Trial", "\u062a\u062c\u0631\u064a\u0628\u064a") : t("Student", "\u0637\u0627\u0644\u0628")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-100 w-fit">
        <button onClick={() => setActiveTab("info")}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === "info" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50")}>
          <User className="w-4 h-4" />{t("Personal Info", "\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a")}
        </button>
        <button onClick={() => setActiveTab("security")}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === "security" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50")}>
          <Lock className="w-4 h-4" />{t("Security", "\u0627\u0644\u0623\u0645\u0627\u0646")}
        </button>
      </div>

      {/* Forms */}
      {activeTab === "info" ? (
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t("First Name", "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0644")}</Label>
                <div className="relative">
                  <User className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
                  <Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                    className={cn("h-11 rounded-xl", isRTL ? "pr-10" : "pl-10")} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t("Last Name", "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u062e\u064a\u0631")}</Label>
                <div className="relative">
                  <User className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
                  <Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                    className={cn("h-11 rounded-xl", isRTL ? "pr-10" : "pl-10")} required />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t("Email", "\u0627\u0644\u0628\u0631\u064a\u062f")}</Label>
              <div className="relative">
                <Mail className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
                <Input value={user?.email || ""} disabled className={cn("h-11 rounded-xl bg-gray-50 cursor-not-allowed", isRTL ? "pr-10" : "pl-10")} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t("Phone", "\u0627\u0644\u0647\u0627\u062a\u0641")}</Label>
                <div className="relative">
                  <Phone className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="+1 234 567 8900" className={cn("h-11 rounded-xl", isRTL ? "pr-10" : "pl-10")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t("Language", "\u0627\u0644\u0644\u063a\u0629")}</Label>
                <div className="relative">
                  <Globe className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10", isRTL ? "right-3" : "left-3")} />
                  <select value={form.locale} onChange={e => setForm({...form, locale: e.target.value})}
                    className={cn("w-full h-11 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary", isRTL ? "pr-10 pl-3" : "pl-10 pr-3")}>
                    <option value="EN">English</option>
                    <option value="AR">{"\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button type="submit" disabled={loading} className="h-10 px-5 rounded-xl bg-primary text-white font-bold">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{t("Saving...", "\u062c\u0627\u0631\u064d...")}</> : <><Save className="w-4 h-4" />{t("Save", "\u062d\u0641\u0638")}</>}
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <form onSubmit={handleChangePw} className="space-y-5 max-w-sm">
            <PwInput id="curPw" label={t("Current Password", "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062d\u0627\u0644\u064a\u0629")}
              value={pwForm.currentPassword} onChange={(e: any) => setPwForm({...pwForm, currentPassword: e.target.value})}
              show={showPw.current} onToggle={() => setShowPw({...showPw, current: !showPw.current})} />
            <PwInput id="newPw" label={t("New Password", "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629")}
              value={pwForm.newPassword} onChange={(e: any) => setPwForm({...pwForm, newPassword: e.target.value})}
              show={showPw.next} onToggle={() => setShowPw({...showPw, next: !showPw.next})} />
            <PwInput id="cfmPw" label={t("Confirm Password", "\u062a\u0623\u0643\u064a\u062f")}
              value={pwForm.confirmPassword} onChange={(e: any) => setPwForm({...pwForm, confirmPassword: e.target.value})}
              show={showPw.confirm} onToggle={() => setShowPw({...showPw, confirm: !showPw.confirm})} />

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button type="submit" disabled={pwLoading} className="h-10 px-5 rounded-xl bg-primary text-white font-bold">
                {pwLoading ? <><Loader2 className="w-4 h-4 animate-spin" />{t("Updating...", "\u062c\u0627\u0631\u064d...")}</> : <><Lock className="w-4 h-4" />{t("Update", "\u062a\u062d\u062f\u064a\u062b")}</>}
              </Button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}