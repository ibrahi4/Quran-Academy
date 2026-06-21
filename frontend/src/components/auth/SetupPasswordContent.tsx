"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "@/hooks/useLocale";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/lib/api/client";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  BookOpen, Lock, Eye, EyeOff, Loader2,
  CheckCircle2, AlertCircle, Sparkles, ShieldCheck,
} from "lucide-react";

type Step = "loading" | "error" | "form" | "success";

export default function SetupPasswordContent() {
  const { locale } = useLocale();
  const router     = useRouter();
  const searchParams = useSearchParams();
  const token      = searchParams.get("token") || "";
  const setAuth    = useAuthStore(s => s.setAuth);

  const [step,     setStep]     = useState<Step>("loading");
  const [userData, setUserData] = useState<{ firstName: string; email: string } | null>(null);
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errMsg,   setErrMsg]   = useState("");

  // ── Verify token on mount ──────────────────────────────
  useEffect(() => {
    if (!token) { setStep("error"); setErrMsg("No setup token found. Please check your email link."); return; }

    (async () => {
      try {
        const res: any = await api.request("/auth/verify-setup-token", {
          method: "GET",
          params: { token },
          auth: false,
        });
        setUserData({ firstName: res.user.firstName, email: res.user.email });
        setStep("form");
      } catch (err: any) {
        setErrMsg(err?.message || "Invalid or expired setup link.");
        setStep("error");
      }
    })();
  }, [token]);

  // ── Strength indicator ─────────────────────────────────
  const strength = (() => {
    let s = 0;
    if (password.length >= 8)               s++;
    if (/[A-Z]/.test(password))             s++;
    if (/[0-9]/.test(password))             s++;
    if (/[^A-Za-z0-9]/.test(password))      s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-500", "bg-emerald-500"][strength];

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8)       { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirm)       { toast.error("Passwords do not match");                 return; }
    if (strength < 2)               { toast.error("Please choose a stronger password");      return; }

    setLoading(true);
    try {
      const res: any = await api.request("/auth/setup-password", {
        method: "POST",
        body: { token, newPassword: password },
        auth: false,
      });
      setAuth(res.user, res.accessToken, res.refreshToken);
      toast.success("Welcome! Your account is ready 🎉");
      setStep("success");
      setTimeout(() => router.push(`/${locale}/student/dashboard`), 1800);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── LOADING ─────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Verifying your setup link...</p>
        </div>
      </div>
    );
  }

  // ── ERROR ────────────────────────────────────────────────
  if (step === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50 px-4">
        <div className="max-w-md w-full text-center bg-white rounded-3xl p-10 shadow-premium border border-sand-200">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Expired or Invalid</h2>
          <p className="text-gray-500 text-sm mb-6">{errMsg}</p>
          <Link href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all">
            Back to Home
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Need help?{" "}
            <Link href="/contact" className="text-primary font-semibold hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── SUCCESS ──────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50 px-4">
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
          className="max-w-md w-full text-center bg-white rounded-3xl p-10 shadow-premium border border-sand-200">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set! 🎉</h2>
          <p className="text-gray-500 text-sm mb-6">Redirecting you to your dashboard...</p>
          <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
        </motion.div>
      </div>
    );
  }

  // ── FORM ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary">IQA</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/10 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Account Setup</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome, {userData?.firstName}! 👋
          </h1>
          <p className="text-gray-500 text-sm">
            Set your password to access your dashboard
          </p>
          <p className="text-xs text-gray-400 mt-1">{userData?.email}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-premium border border-sand-200">
          {/* Security badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-800">
              This is a one-time setup link. After setting your password, you can login normally.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Choose a Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-100"}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-semibold ${
                    strength <= 1 ? "text-red-500" :
                    strength === 2 ? "text-amber-500" :
                    strength === 3 ? "text-blue-500" : "text-emerald-500"
                  }`}>{strengthLabel} password</p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required minLength={8}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
                {confirm && (
                  <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center ${password === confirm ? "text-emerald-500" : "text-red-400"}`}>
                    {password === confirm
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <AlertCircle className="w-4 h-4" />}
                  </div>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { check: password.length >= 8, label: "8+ characters"  },
                { check: /[A-Z]/.test(password), label: "Uppercase letter" },
                { check: /[0-9]/.test(password), label: "Number"          },
                { check: /[^A-Za-z0-9]/.test(password), label: "Special character" },
              ].map(({ check, label }) => (
                <div key={label} className={`flex items-center gap-1.5 text-xs ${check ? "text-emerald-600" : "text-gray-400"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${check ? "bg-emerald-100" : "bg-gray-100"}`}>
                    {check ? <CheckCircle2 className="w-2.5 h-2.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                  </div>
                  {label}
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                : <><ShieldCheck className="w-4 h-4" /> Set Password & Enter Dashboard</>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have a password?{" "}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}