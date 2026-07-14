"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Clock, Loader2, Sparkles, BookOpen, Award,
  User, Mail, Globe, Calendar, ChevronRight, ChevronLeft, Cake,
  Languages, GraduationCap, UserCircle, Heart, AlertCircle, Phone,
  Users, Send, Shield, Book, Mic, Brain, PenTool, Library, Baby, Star,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { siteConfig } from "@/config/site";
import api from "@/lib/api/client";
import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import CountrySelect from "./CountrySelect";
import PhoneInput from "./PhoneInput";
import { findCountryByName } from "./countries-data";

/* ─────────────────────────── DATA ─────────────────────────── */

const groupedTimezones = [
  { region: "Africa", zones: ["Africa/Cairo", "Africa/Casablanca", "Africa/Algiers", "Africa/Tunis", "Africa/Lagos", "Africa/Nairobi", "Africa/Johannesburg", "Africa/Khartoum"] },
  { region: "Middle East", zones: ["Asia/Riyadh", "Asia/Dubai", "Asia/Qatar", "Asia/Kuwait", "Asia/Baghdad", "Asia/Amman", "Asia/Beirut", "Asia/Damascus", "Asia/Jerusalem", "Asia/Tehran"] },
  { region: "Asia", zones: ["Asia/Karachi", "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok", "Asia/Jakarta", "Asia/Singapore", "Asia/Kuala_Lumpur", "Asia/Manila", "Asia/Hong_Kong", "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul"] },
  { region: "Europe", zones: ["Europe/London", "Europe/Dublin", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Rome", "Europe/Amsterdam", "Europe/Brussels", "Europe/Vienna", "Europe/Zurich", "Europe/Stockholm", "Europe/Oslo", "Europe/Copenhagen", "Europe/Helsinki", "Europe/Warsaw", "Europe/Moscow", "Europe/Istanbul"] },
  { region: "Americas", zones: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto", "America/Vancouver", "America/Mexico_City", "America/Sao_Paulo", "America/Buenos_Aires", "America/Bogota"] },
  { region: "Oceania", zones: ["Australia/Sydney", "Australia/Melbourne", "Australia/Perth", "Pacific/Auckland"] },
];

const nativeLanguages = [
  { value: "Arabic",     label: "Arabic"     },
  { value: "English",    label: "English"    },
  { value: "Urdu",       label: "Urdu"       },
  { value: "Turkish",    label: "Turkish"    },
  { value: "French",     label: "French"     },
  { value: "Spanish",    label: "Spanish"    },
  { value: "German",     label: "German"     },
  { value: "Indonesian", label: "Indonesian" },
  { value: "Malay",      label: "Malay"      },
  { value: "Bengali",    label: "Bengali"    },
  { value: "Persian",    label: "Persian"    },
  { value: "Other",      label: "Other"      },
];

const services = [
  { value: "quran-recitation",   label: "Quran Recitation",  icon: Book       },
  { value: "tajweed-course",     label: "Tajweed Course",    icon: Mic        },
  { value: "quran-memorization", label: "Quran Memorization",icon: Brain      },
  { value: "arabic-language",    label: "Arabic Language",   icon: PenTool    },
  { value: "islamic-studies",    label: "Islamic Studies",   icon: Library    },
  { value: "kids-program",       label: "Kids Program",      icon: Baby       },
  { value: "new-muslims",        label: "New Muslims",       icon: Star       },
];

const studentLevels = [
  { value: "BEGINNER",     label: "Beginner",     desc: "Just starting out"       },
  { value: "INTERMEDIATE", label: "Intermediate", desc: "Can read with help"      },
  { value: "ADVANCED",     label: "Advanced",     desc: "Fluent reader"           },
  { value: "HAFIZ",        label: "Hafiz",        desc: "Memorizing / Memorized"  },
];

const parentRelations = [
  { value: "father",   label: "Father"          },
  { value: "mother",   label: "Mother"          },
  { value: "guardian", label: "Legal Guardian"  },
  { value: "sibling",  label: "Sibling"         },
  { value: "other",    label: "Other"           },
];

/* ─────────────────────── DECORATIVE SHAPES ─────────────────────── */

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function FloatingShapes() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const shapes = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    size: Math.round((6 + seededRandom(i * 9 + 1) * 14) * 100) / 100,
    top: Math.round(seededRandom(i * 9 + 2) * 10000) / 100,
    left: Math.round(seededRandom(i * 9 + 4) * 10000) / 100,
    duration: Math.round((5 + seededRandom(i * 9 + 5) * 7) * 100) / 100,
    delay: Math.round(seededRandom(i * 9 + 6) * 400) / 100,
    opacity: Math.round((0.15 + seededRandom(i * 9 + 7) * 0.2) * 1000) / 1000,
    isCircle: seededRandom(i * 9 + 3) > 0.5,
    rotation: Math.round(seededRandom(i * 9 + 8) * 36000) / 100,
  })), []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: `${s.size}px`, height: `${s.size}px`,
            top: `${s.top}%`, left: `${s.left}%`,
            backgroundColor: `rgba(255,255,255,${s.opacity})`,
            borderRadius: s.isCircle ? "50%" : "4px",
            transform: `rotate(${s.rotation}deg)`,
          }}
          animate={{ y: [0, -20, 0], opacity: [s.opacity, s.opacity + 0.1, s.opacity] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────── STEP INDICATOR ─────────────────────── */

function StepIndicator({ step, totalSteps }: { step: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const n = idx + 1;
        const isActive = step === n;
        const isCompleted = step > n;
        return (
          <React.Fragment key={n}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
                isCompleted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" :
                isActive    ? "bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20 scale-110" :
                              "bg-white text-gray-400 border-2 border-sand-200"
              )}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : n}
              </div>
              <span className={cn(
                "text-xs font-bold hidden sm:block transition-colors",
                isActive ? "text-primary" : isCompleted ? "text-emerald-600" : "text-gray-400"
              )}>
                {n === 1 ? "Your Info" : "Learning"}
              </span>
            </div>
            {n < totalSteps && (
              <div className={cn(
                "h-1 w-12 sm:w-20 rounded-full transition-all duration-500",
                step > n ? "bg-emerald-500" : "bg-sand-200"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─────────────────────── FIELD WRAPPER ─────────────────────── */

type FieldProps = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
};

function Field({ label, icon: Icon, required, error, children, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="text-[11px] text-gray-500">{hint}</p>
      )}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm font-sans";

const selectCls = "w-full px-4 py-3 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm font-sans appearance-none cursor-pointer bg-no-repeat bg-[length:16px] bg-[position:right_1rem_center]";

const selectArrow = { backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")" };

/* ─────────────────────── STUDENT TYPE CARDS ─────────────────────── */

function StudentTypeCards({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const types = [
    { value: "self",   icon: User,  label: "For Myself",   desc: "I want to learn"         },
    { value: "child",  icon: Heart, label: "For My Child", desc: "Registering for my kid"  },
    { value: "family", icon: Users, label: "For Family",   desc: "Multiple family members" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {types.map((t) => {
        const Icon = t.icon;
        const isSelected = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "p-3 rounded-2xl border-2 text-left transition-all duration-200 group",
              isSelected
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-sand-200 hover:border-primary/30 hover:bg-sand-50"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors",
              isSelected ? "bg-primary text-white" : "bg-sand-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <p className={cn("font-bold text-sm leading-tight", isSelected ? "text-primary" : "text-gray-900")}>
              {t.label}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{t.desc}</p>
            {isSelected && (
              <div className="mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase">Selected</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────── SUCCESS SCREEN ─────────────────────── */

function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-sand-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center bg-white rounded-3xl p-10 shadow-premium border border-sand-200"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white border border-sand-200 flex items-center justify-center p-2">
            <Image
              src="/Tajwedo-Public-Assets/logo.png"
              alt="Tajwedo Academy"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30 ring-8 ring-emerald-50"
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          JazakAllah Khair, {name.split(" ")[0]}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Your free trial request has been received successfully by Tajwedo Academy.
        </p>

        <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-amber-600" />
            <p className="font-bold text-amber-900">Check Your Email Now</p>
          </div>
          <ul className="text-sm text-amber-800 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span>Welcome email with your account details</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span>Setup link to access your dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span>Session confirmation within 24 hours</span>
            </li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 w-full justify-center"
        >
          Back to Home
        </Link>

        <p className="text-xs text-gray-400 mt-4">
          Didn&apos;t get the email? Check spam folder or{" "}
          <a
            href={siteConfig.contact?.whatsappLink || "#"}
            className="text-primary font-semibold hover:underline"
          >
            contact us on WhatsApp
          </a>
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */

type EmailStatus = {
  available: boolean | null;
  message?: string;
  isTrial?: boolean;
};

export default function BookTrialContent() {
  const { isRTL } = useLocale();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [emailChecking, setEmailChecking] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailStatus>({ available: null });

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    country: "", phone: "",
    dateOfBirth: "", gender: "",
    nativeLanguage: "",
    studentType: "", service: "", currentLevel: "",
    parentName: "", parentPhone: "", parentRelation: "",
    timezone: typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Africa/Cairo",
    preferredDate: "", preferredTime: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = useCallback((field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  }, []);

  /* ── Real-time email check ── */
  useEffect(() => {
    if (!form.email || !form.email.includes("@") || !form.email.includes(".")) {
      setEmailStatus({ available: null });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setEmailChecking(true);
        const res = await api.get(`/bookings/check-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
        const data = (res as { data?: EmailStatus })?.data ?? (res as EmailStatus);
        setEmailStatus({
          available: data.available,
          message: data.message,
          isTrial: data.isTrial,
        });
      } catch {
        setEmailStatus({ available: null });
      } finally {
        setEmailChecking(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [form.email]);

  /* ── Auto-detect child mode ── */
  useEffect(() => {
    if (form.dateOfBirth && !form.studentType) {
      const age = (Date.now() - new Date(form.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 13) {
        setForm(prev => ({ ...prev, studentType: "child" }));
      }
    }
  }, [form.dateOfBirth, form.studentType]);

  /* ── Auto-detect language from country ── */
  useEffect(() => {
    if (form.country && !form.nativeLanguage) {
      const arabicCountries = ["Egypt", "Saudi Arabia", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman", "Jordan", "Lebanon", "Iraq", "Syria", "Yemen", "Morocco", "Algeria", "Tunisia", "Libya", "Sudan", "Palestine"];
      if (arabicCountries.some(c => form.country.includes(c))) {
        setForm(prev => ({ ...prev, nativeLanguage: "Arabic" }));
      } else if (form.country.includes("Pakistan") || form.country.includes("India")) {
        setForm(prev => ({ ...prev, nativeLanguage: "Urdu" }));
      }
    }
  }, [form.country, form.nativeLanguage]);

  /* ── Validation ── */
  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!form.firstName.trim() || form.firstName.length < 2) errs.firstName = "First name required";
      if (!form.lastName.trim() || form.lastName.length < 2)   errs.lastName  = "Last name required";
      if (!form.email.trim() || !form.email.includes("@"))     errs.email     = "Valid email required";
      if (emailStatus.available === false)                      errs.email     = emailStatus.message || "Email already in use";
      if (!form.country.trim())                                 errs.country   = "Country required";
      if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 6) errs.phone = "Valid phone required";
      if (!form.dateOfBirth)                                    errs.dateOfBirth = "Date of birth required";
      if (form.dateOfBirth) {
        const age = (Date.now() - new Date(form.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (age < 5)   errs.dateOfBirth = "Must be at least 5 years old";
        if (age > 100) errs.dateOfBirth = "Please enter a valid date";
      }
      if (!form.gender)                                         errs.gender         = "Please select gender";
      if (!form.nativeLanguage)                                 errs.nativeLanguage = "Native language required";
    }

    if (step === 2) {
      if (!form.studentType)  errs.studentType  = "Please select student type";
      if (!form.service)      errs.service      = "Please select a service";
      if (!form.currentLevel) errs.currentLevel = "Please select your level";

      if (form.studentType === "child") {
        if (!form.parentName.trim())  errs.parentName     = "Parent name required";
        if (!form.parentPhone.trim()) errs.parentPhone    = "Parent phone required";
        if (!form.parentRelation)     errs.parentRelation = "Relation required";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
    else toast.error("Please fix the errors and try again");
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      await api.post("/bookings", {
        name:           `${form.firstName.trim()} ${form.lastName.trim()}`,
        email:          form.email.trim().toLowerCase(),
        phone:          form.phone.trim(),
        country:        form.country.trim(),
        dateOfBirth:    form.dateOfBirth,
        gender:         form.gender,
        nativeLanguage: form.nativeLanguage,
        studentType:    form.studentType,
        currentLevel:   form.currentLevel,
        timezone:       form.timezone,
        serviceSlug:    form.service,
        type:           "TRIAL",
        ...(form.studentType === "child" && {
          parentName:     form.parentName.trim(),
          parentPhone:    form.parentPhone.trim(),
          parentRelation: form.parentRelation,
        }),
        ...(form.preferredDate && { preferredDate: form.preferredDate }),
        ...(form.preferredTime && { preferredTime: form.preferredTime }),
        ...(form.message.trim() && { notes: form.message.trim() }),
      });
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error?.response?.data?.message || error?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) return <SuccessScreen name={`${form.firstName} ${form.lastName}`} />;

  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 5);
  const maxDobStr = maxDob.toISOString().split("T")[0];
  const minDob = new Date();
  minDob.setFullYear(minDob.getFullYear() - 100);
  const minDobStr = minDob.toISOString().split("T")[0];

  return (
    <main dir={isRTL ? "rtl" : "ltr"}>
      {/* HERO */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 bg-hero-gradient" />
        <FloatingShapes />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent z-10" />

        <Container className="relative z-20">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo in Hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-2">
                <Image
                  src="/Tajwedo-Public-Assets/logo.png"
                  alt="Tajwedo Academy"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-white/90 text-sm font-semibold">100% Free Trial Session</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              Start Your <span className="text-accent">Quran Journey</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg text-white/75 leading-relaxed max-w-2xl mx-auto mb-10">
              Book a free 30-minute trial with a qualified Tajwedo Academy teacher. No payment required.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4">
              {[
                { Icon: Clock,  num: "30",    label: "Minutes Free"    },
                { Icon: Users,  num: "1000+", label: "Happy Students"  },
                { Icon: Award,  num: "100%",  label: "Satisfaction"    },
              ].map(({ Icon, num, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-start">
                    <p className="font-bold text-white text-lg leading-none">{num}</p>
                    <p className="text-xs text-white/70 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </Container>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L480 40L960 60L1440 0V80H0Z" className="fill-sand-50" />
          </svg>
        </div>
      </section>

      {/* FORM */}
      <section className="py-16 bg-sand-50 min-h-screen">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-sand-200/60 shadow-premium">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <Image
                    src="/Tajwedo-Public-Assets/logo.png"
                    alt="Tajwedo Academy"
                    width={48}
                    height={48}
                    className="object-contain opacity-90"
                  />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Book Your Free Trial</h2>
                <p className="text-gray-500 text-sm">Quick and easy &mdash; takes less than 2 minutes</p>
              </div>

              <StepIndicator step={step} totalSteps={2} />

              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {/* STEP 1 */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="First Name" icon={User} required error={errors.firstName}>
                          <input
                            className={inputCls}
                            placeholder="Ahmed"
                            value={form.firstName}
                            onChange={e => set("firstName", e.target.value)}
                          />
                        </Field>
                        <Field label="Last Name" icon={User} required error={errors.lastName}>
                          <input
                            className={inputCls}
                            placeholder="Al-Rashid"
                            value={form.lastName}
                            onChange={e => set("lastName", e.target.value)}
                          />
                        </Field>
                      </div>

                      <Field
                        label="Email Address"
                        icon={Mail}
                        required
                        error={errors.email}
                        hint={emailStatus.available === true && !emailStatus.isTrial ? "Email available" : undefined}
                      >
                        <div className="relative">
                          <input
                            type="email"
                            className={cn(inputCls,
                              emailStatus.available === true && !emailStatus.isTrial && "border-emerald-300 bg-emerald-50/30",
                              emailStatus.available === false && "border-red-300 bg-red-50/30"
                            )}
                            placeholder="ahmed@example.com"
                            value={form.email}
                            onChange={e => set("email", e.target.value)}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {emailChecking && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                            {!emailChecking && emailStatus.available === true && !emailStatus.isTrial && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                            {!emailChecking && emailStatus.available === false && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        {emailStatus.isTrial && !errors.email && emailStatus.available !== false && (
                          <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                            <Sparkles className="w-3 h-3" />
                            {emailStatus.message}
                          </p>
                        )}
                      </Field>

                      <Field label="Country" icon={Globe} required error={errors.country}>
                        <CountrySelect
                          value={form.country}
                          onChange={(name, country) => {
                            setForm(prev => ({
                              ...prev,
                              country: name,
                              phone: country && (!prev.phone || prev.phone.match(/^\+\d{1,4}\s*$/))
                                ? `${country.dialCode} `
                                : prev.phone,
                            }));
                            setErrors(prev => ({ ...prev, country: "" }));
                          }}
                          isRTL={isRTL}
                        />
                      </Field>

                      <Field
                        label="WhatsApp Number"
                        icon={Phone}
                        required
                        error={errors.phone}
                        hint="Make sure WhatsApp is active on this number"
                      >
                        <PhoneInput
                          value={form.phone}
                          onChange={(fullPhone) => set("phone", fullPhone)}
                          defaultCountryCode={findCountryByName(form.country)?.code || "EG"}
                          placeholder="1234567890"
                          isRTL={isRTL}
                        />
                      </Field>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Date of Birth" icon={Cake} required error={errors.dateOfBirth}>
                          <input
                            type="date"
                            className={inputCls}
                            min={minDobStr}
                            max={maxDobStr}
                            value={form.dateOfBirth}
                            onChange={e => set("dateOfBirth", e.target.value)}
                          />
                        </Field>
                        <Field label="Gender" icon={UserCircle} required error={errors.gender}>
                          <div className="grid grid-cols-2 gap-2 h-[46px]">
                            {[
                              { value: "MALE",   label: "Male"   },
                              { value: "FEMALE", label: "Female" },
                            ].map(g => (
                              <button
                                key={g.value}
                                type="button"
                                onClick={() => set("gender", g.value)}
                                className={cn(
                                  "rounded-xl border-2 text-sm font-bold transition-all",
                                  form.gender === g.value
                                    ? "border-primary bg-primary text-white"
                                    : "border-sand-200 bg-sand-50 text-gray-600 hover:border-primary/30"
                                )}
                              >
                                {g.label}
                              </button>
                            ))}
                          </div>
                        </Field>
                      </div>

                      <Field
                        label="Native Language"
                        icon={Languages}
                        required
                        error={errors.nativeLanguage}
                        hint="The language you understand best"
                      >
                        <select
                          className={selectCls}
                          style={selectArrow}
                          value={form.nativeLanguage}
                          onChange={e => set("nativeLanguage", e.target.value)}
                        >
                          <option value="">Select your native language</option>
                          {nativeLanguages.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                          ))}
                        </select>
                      </Field>
                    </motion.div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <Field label="Who is this trial for?" required error={errors.studentType}>
                        <StudentTypeCards value={form.studentType} onChange={v => set("studentType", v)} />
                      </Field>

                      {form.studentType === "child" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-5 bg-blue-50/50 border-2 border-blue-100 rounded-2xl space-y-4"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Heart className="w-4 h-4 text-blue-600" />
                            <p className="text-sm font-bold text-blue-900">Parent / Guardian Info</p>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Parent Name" required error={errors.parentName}>
                              <input
                                className={inputCls}
                                placeholder="Parent full name"
                                value={form.parentName}
                                onChange={e => set("parentName", e.target.value)}
                              />
                            </Field>
                            <Field label="Relation" required error={errors.parentRelation}>
                              <select
                                className={selectCls}
                                style={selectArrow}
                                value={form.parentRelation}
                                onChange={e => set("parentRelation", e.target.value)}
                              >
                                <option value="">Select relation</option>
                                {parentRelations.map(r => (
                                  <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                              </select>
                            </Field>
                          </div>
                          <Field label="Parent Phone" required error={errors.parentPhone}>
                            <input
                              type="tel"
                              className={inputCls}
                              placeholder="+1 234 567 8900"
                              value={form.parentPhone}
                              onChange={e => set("parentPhone", e.target.value)}
                            />
                          </Field>
                        </motion.div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="What to Learn" icon={BookOpen} required error={errors.service}>
                          <select
                            className={selectCls}
                            style={selectArrow}
                            value={form.service}
                            onChange={e => set("service", e.target.value)}
                          >
                            <option value="">Select a service</option>
                            {services.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Current Level" icon={GraduationCap} required error={errors.currentLevel}>
                          <select
                            className={selectCls}
                            style={selectArrow}
                            value={form.currentLevel}
                            onChange={e => set("currentLevel", e.target.value)}
                          >
                            <option value="">Select your level</option>
                            {studentLevels.map(l => (
                              <option key={l.value} value={l.value}>
                                {l.label} &mdash; {l.desc}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>

                      <div className="p-5 bg-sand-50 border border-sand-200 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-primary" />
                          <p className="text-sm font-bold text-gray-900">Preferred Schedule</p>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Optional</span>
                        </div>
                        <Field label="Your Timezone" icon={MapPin}>
                          <select
                            className={selectCls}
                            style={selectArrow}
                            value={form.timezone}
                            onChange={e => set("timezone", e.target.value)}
                          >
                            {groupedTimezones.map(group => (
                              <optgroup key={group.region} label={group.region}>
                                {group.zones.map(tz => (
                                  <option key={tz} value={tz}>
                                    {tz.split("/")[1]?.replace(/_/g, " ") || tz}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </Field>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label="Preferred Date" icon={Calendar}>
                            <input
                              type="date"
                              className={inputCls}
                              min={new Date().toISOString().split("T")[0]}
                              value={form.preferredDate}
                              onChange={e => set("preferredDate", e.target.value)}
                            />
                          </Field>
                          <Field label="Preferred Time" icon={Clock}>
                            <input
                              type="time"
                              className={inputCls}
                              value={form.preferredTime}
                              onChange={e => set("preferredTime", e.target.value)}
                            />
                          </Field>
                        </div>
                      </div>

                      <Field label="Additional Notes" hint="Tell us anything else we should know">
                        <textarea
                          className={cn(inputCls, "resize-none h-20")}
                          placeholder="Any special requirements, goals, or questions..."
                          value={form.message}
                          onChange={e => set("message", e.target.value)}
                        />
                      </Field>

                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-emerald-800 leading-relaxed">
                            <strong>What happens next:</strong> Tajwedo Academy will create a free account and send you the setup link via email. Your first session is <strong>100% free</strong> &mdash; no payment required.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-sand-100">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sand-200 text-gray-600 hover:bg-sand-50 font-semibold text-sm transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading || emailStatus.available === false}
                      size="lg"
                      className="flex items-center gap-2 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Book Free Trial
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <p className="text-xs text-gray-400 text-center mt-6 flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3" />
              Your data is secure and will never be shared
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}