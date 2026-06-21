"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, Video, MessageCircle, Star, Users,
  Send, Loader2, Sparkles, BookOpen, Heart, Award, Moon,
  User, Mail, Phone, Globe, Calendar, ChevronRight, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { siteConfig } from "@/config/site";
import api from "@/lib/api/client";
import { useLocale } from "@/hooks/useLocale";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";

const serviceValues = [
  { value: "quran-recitation", label: "Quran Recitation" },
  { value: "tajweed-course",   label: "Tajweed Course"   },
  { value: "arabic-language",  label: "Arabic Language"  },
  { value: "islamic-studies",  label: "Islamic Studies"  },
  { value: "kids-program",     label: "Kids Program"     },
  { value: "new-muslims",      label: "New Muslims"      },
];

const studentTypeValues = [
  { value: "self",   label: "For Myself"      },
  { value: "child",  label: "For My Child"    },
  { value: "family", label: "For My Family"   },
];

const timezones = Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : ["UTC","America/New_York","Europe/London","Asia/Dubai","Africa/Cairo","Asia/Karachi"];

// ── Decorative background (kept from original) ──────────────
function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}
function FloatingShapes() {
  const shapes = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    size: 6 + seededRandom(i * 9 + 1) * 14,
    top:  seededRandom(i * 9 + 2) * 100 + "%",
    left: seededRandom(i * 9 + 4) * 100 + "%",
    duration: 5 + seededRandom(i * 9 + 5) * 7,
    delay:    seededRandom(i * 9 + 6) * 4,
    opacity:  0.15 + seededRandom(i * 9 + 7) * 0.2,
    isCircle: seededRandom(i * 9 + 3) > 0.5,
    rotation: seededRandom(i * 9 + 8) * 360,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s, i) => (
        <motion.div key={i} className="absolute"
          style={{ width: s.size, height: s.size, top: s.top, left: s.left,
            backgroundColor: `rgba(255,255,255,${s.opacity})`,
            borderRadius: s.isCircle ? "50%" : "4px",
            transform: `rotate(${s.rotation}deg)` }}
          animate={{ y: [0,-20,0], opacity: [s.opacity, s.opacity+0.1, s.opacity] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── Step indicator ───────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "Personal Info"  },
    { n: 2, label: "Timing"         },
    { n: 3, label: "Confirm"        },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, idx) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
              step > s.n  ? "bg-emerald-500 text-white shadow-md" :
              step === s.n ? "bg-primary text-white shadow-md ring-4 ring-primary/20" :
                            "bg-white text-gray-400 border-2 border-sand-200"
            )}>
              {step > s.n ? <CheckCircle2 className="w-5 h-5" /> : s.n}
            </div>
            <span className={cn("text-[10px] font-semibold hidden sm:block",
              step >= s.n ? "text-primary" : "text-gray-400")}>{s.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={cn("h-0.5 w-16 sm:w-24 mx-1 mb-5 rounded-full transition-all duration-500",
              step > s.n ? "bg-emerald-500" : "bg-sand-200")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Input wrapper ────────────────────────────────────────────
function Field({ label, icon: Icon, required, children }: {
  label: string; icon: any; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <div className="[&>*]:pl-10 [&>input]:w-full [&>select]:w-full [&>textarea]:w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm";

// ── Success screen ───────────────────────────────────────────
function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
        className="max-w-md w-full text-center bg-white rounded-3xl p-10 shadow-premium border border-sand-200">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Booking Received</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          JazakAllah Khair, {name.split(" ")[0]}! 🎉
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          Your free trial request has been received. We&apos;ve created an account for you.
        </p>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 text-left">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">📧 Check Your Email</p>
          <ul className="text-sm text-amber-800 space-y-1.5">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /><span>A welcome email with your account details</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /><span>A link to set your password &amp; access your dashboard</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" /><span>Session confirmation once our team reviews your request</span></li>
          </ul>
        </div>
        <Link href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          Back to Home
        </Link>
        <p className="text-xs text-gray-400 mt-4">
          Didn&apos;t receive the email? Check spam or{" "}
          <a href={siteConfig.contact?.whatsappLink || "#"} className="text-primary font-semibold hover:underline">contact us on WhatsApp</a>
        </p>
      </motion.div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function BookTrialContent() {
  const { isRTL } = useLocale();

  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", country: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    preferredDate: "", preferredTime: "",
    service: "", studentType: "", message: "",
  });

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim())   { toast.error("Full name is required");     return false; }
      if (!form.email.trim())  { toast.error("Email is required");          return false; }
      if (!form.phone.trim())  { toast.error("WhatsApp number is required"); return false; }
      if (!form.country.trim()){ toast.error("Country is required");        return false; }
    }
    if (step === 2) {
      if (!form.service)      { toast.error("Please select a service");     return false; }
      if (!form.studentType)  { toast.error("Please select student type");  return false; }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/bookings", {
        name:          form.name.trim(),
        email:         form.email.trim().toLowerCase(),
        phone:         form.phone.trim(),
        country:       form.country.trim(),
        timezone:      form.timezone,
        preferredDate: form.preferredDate || undefined,
        preferredTime: form.preferredTime || undefined,
        serviceSlug:   form.service,
        type:          "TRIAL",
        notes: [
          form.studentType ? `Student type: ${form.studentType}` : "",
          form.message.trim(),
        ].filter(Boolean).join("\n") || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) return <SuccessScreen name={form.name} />;

  return (
    <main dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 bg-hero-gradient" />
        <FloatingShapes />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent z-10" />

        <Container className="relative z-20">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-white/90 text-sm font-semibold">100% Free Trial Session</span>
            </motion.div>
            <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
              className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              Start Your{" "}
              <span className="text-accent relative">Quran Journey</span>
            </motion.h1>
            <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
              className="text-lg text-white/75 leading-relaxed max-w-2xl mx-auto mb-10">
              Book a free 30-minute trial with a qualified Quran teacher. No payment required.
            </motion.p>
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="flex flex-wrap items-center justify-center gap-4">
              {[
                { Icon: Clock,  num: "30",   label: "Minutes Free"  },
                { Icon: Users,  num: "500+", label: "Happy Students" },
                { Icon: Award,  num: "100%", label: "Satisfaction"  },
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

      {/* ── Form Section ── */}
      <section className="py-16 bg-sand-50">
        <Container>
          <div className="grid lg:grid-cols-5 gap-12">

            {/* Left: What to expect */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What to Expect</h2>
                <div className="space-y-3">
                  {[
                    { Icon: Clock,         text: "30-minute free session with a certified teacher" },
                    { Icon: Video,         text: "Online via Zoom or Google Meet"                  },
                    { Icon: MessageCircle, text: "Personalized assessment of your level"           },
                    { Icon: CheckCircle2,  text: "Custom learning plan created for you"            },
                    { Icon: Star,          text: "No commitment or payment required"               },
                    { Icon: Users,         text: "Choose from male or female teachers"             },
                  ].map(({ Icon, text }, i) => (
                    <motion.div key={i}
                      initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }}
                      viewport={{ once:true }} transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-sand-200/60 hover:shadow-sm transition-all">
                      <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-gray-700">{text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className="p-5 rounded-2xl bg-white border border-sand-200/60 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4 italic">
                  &ldquo;I was nervous about learning Quran online, but the trial session showed me how effective it is. Now I&apos;m on my 3rd month!&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">A</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Aisha M.</p>
                    <p className="text-xs text-gray-500">United Kingdom 🇬🇧</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-sm font-semibold text-gray-900 mb-1">Prefer WhatsApp?</p>
                <p className="text-xs text-gray-600 mb-3">Chat with us directly and we&apos;ll schedule your trial instantly</p>
                <a href={siteConfig.contact?.whatsappLink || "#"} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-all">
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Right: Multi-step Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-6 md:p-10 border border-sand-200/60 shadow-premium">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Book Your Free Trial</h2>
                  <p className="text-gray-500 text-sm mt-1">Step {step} of 3 — fill in your details below</p>
                </div>

                <StepBar step={step} />

                <form onSubmit={handleSubmit}>
                  {/* ── STEP 1: Personal Info ── */}
                  {step === 1 && (
                    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Full Name" icon={User} required>
                          <input className={inputCls} placeholder="Ahmed Al-Rashid"
                            value={form.name} onChange={e => set("name", e.target.value)} />
                        </Field>
                        <Field label="Email Address" icon={Mail} required>
                          <input type="email" className={inputCls} placeholder="ahmed@example.com"
                            value={form.email} onChange={e => set("email", e.target.value)} />
                        </Field>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="WhatsApp Number" icon={Phone} required>
                          <input type="tel" className={inputCls} placeholder="+1 234 567 8900"
                            value={form.phone} onChange={e => set("phone", e.target.value)} />
                        </Field>
                        <Field label="Country" icon={Globe} required>
                          <input className={inputCls} placeholder="United States"
                            value={form.country} onChange={e => set("country", e.target.value)} />
                        </Field>
                      </div>
                      <Field label="Your Timezone" icon={Globe}>
                        <select className={inputCls} value={form.timezone} onChange={e => set("timezone", e.target.value)}>
                          {timezones.map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>)}
                        </select>
                      </Field>
                    </motion.div>
                  )}

                  {/* ── STEP 2: Timing & Service ── */}
                  {step === 2 && (
                    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Preferred Date" icon={Calendar}>
                          <input type="date" className={inputCls}
                            min={new Date().toISOString().split("T")[0]}
                            value={form.preferredDate} onChange={e => set("preferredDate", e.target.value)} />
                        </Field>
                        <Field label="Preferred Time" icon={Clock}>
                          <input type="time" className={inputCls}
                            value={form.preferredTime} onChange={e => set("preferredTime", e.target.value)} />
                        </Field>
                      </div>
                      <Field label="What would you like to learn?" icon={BookOpen} required>
                        <select className={inputCls} value={form.service} onChange={e => set("service", e.target.value)}>
                          <option value="">Select a service...</option>
                          {serviceValues.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </Field>
                      <Field label="Who is this session for?" icon={Users} required>
                        <select className={inputCls} value={form.studentType} onChange={e => set("studentType", e.target.value)}>
                          <option value="">Select type...</option>
                          {studentTypeValues.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </Field>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                        <textarea className={cn(inputCls, "resize-none h-24")} placeholder="Tell us about your current level, goals, or any special requirements..."
                          value={form.message} onChange={e => set("message", e.target.value)} />
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 3: Summary ── */}
                  {step === 3 && (
                    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-4">
                      <div className="bg-sand-50 rounded-2xl p-5 border border-sand-200 space-y-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Review Your Details</p>
                        {[
                          { label: "Full Name",  value: form.name            },
                          { label: "Email",      value: form.email           },
                          { label: "WhatsApp",   value: form.phone           },
                          { label: "Country",    value: form.country         },
                          { label: "Service",    value: serviceValues.find(s => s.value === form.service)?.label      || "—" },
                          { label: "Student",    value: studentTypeValues.find(s => s.value === form.studentType)?.label || "—" },
                          { label: "Date",       value: form.preferredDate   || "Flexible" },
                          { label: "Time",       value: form.preferredTime   || "Flexible" },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between py-1.5 border-b border-sand-200/60 last:border-0">
                            <span className="text-xs text-gray-500 font-medium">{label}</span>
                            <span className="text-sm font-bold text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                      {form.message && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <p className="text-xs font-bold text-blue-700 mb-1">Your Notes:</p>
                          <p className="text-sm text-blue-800">{form.message}</p>
                        </div>
                      )}
                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-emerald-800 leading-relaxed">
                            By submitting, we&apos;ll create a free account for you and send setup instructions to your email. Your first session is completely free — no payment required.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Navigation ── */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-sand-100">
                    {step > 1 ? (
                      <button type="button" onClick={back}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sand-200 text-gray-600 hover:bg-sand-50 font-semibold text-sm transition-all">
                        <ChevronLeft className="w-4 h-4" /> Back
                      </button>
                    ) : <div />}

                    {step < 3 ? (
                      <button type="button" onClick={next}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-md shadow-primary/20 transition-all">
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <Button type="submit" disabled={loading} size="lg"
                        className="flex items-center gap-2 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20">
                        {loading
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                          : <><Send className="w-4 h-4" /> Book Free Trial</>}
                      </Button>
                    )}
                  </div>
                </form>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                🔒 Your data is secure and will never be shared with third parties
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}