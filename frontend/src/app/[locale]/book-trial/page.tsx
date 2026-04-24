"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Video, MessageCircle, Star, Users, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { siteConfig } from "@/config/site";

const expectations = [
  { icon: Clock, text: "30-minute free session" },
  { icon: Video, text: "Via Zoom or Google Meet" },
  { icon: MessageCircle, text: "Assess your current level" },
  { icon: CheckCircle2, text: "Get a personalized plan" },
  { icon: Star, text: "Experience my teaching style" },
  { icon: Users, text: "No commitment required" },
];

const serviceOptions = [
  "Quran Recitation and Memorization",
  "Tajweed",
  "Arabic Language",
  "Islamic Studies",
  "Kids Program",
  "New Muslims Program",
];

export default function BookTrialPage() {
  const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "", country: "", service: "", studentType: "", preferredTime: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) { setStatus("success"); setFormData({ name: "", email: "", whatsapp: "", country: "", service: "", studentType: "", preferredTime: "", message: "" }); }
      else { setStatus("error"); }
    } catch { setStatus("error"); }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all";

  return (
    <main>
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
              <span className="text-white/80 text-sm font-medium">100% Free — No Commitment</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Book Your <span className="text-accent">Free Trial</span> Lesson
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
              Experience a personalized 30-minute session and see the difference quality teaching makes.
            </p>
          </div>
        </Container>
      </section>

      <section className="section-padding bg-sand-50">
        <Container>
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What to Expect</h2>
              <div className="space-y-4 mb-8">
                {expectations.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white border border-sand-200/50">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-2xl bg-white border border-sand-200/50 shadow-premium">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">&ldquo;The free trial was amazing. Ibrahim assessed my level, explained everything clearly, and I signed up right away.&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-sm font-bold text-primary">S</span></div>
                  <div><p className="text-sm font-semibold text-gray-900">Sarah M.</p><p className="text-xs text-gray-500">Texas, USA</p></div>
                </div>
              </div>
              <div className="mt-6 p-5 rounded-2xl bg-green-50 border border-green-100">
                <p className="text-sm font-semibold text-gray-900 mb-2">Prefer WhatsApp?</p>
                <p className="text-xs text-gray-600 mb-3">Send a message directly and I will respond within hours.</p>
                <a href={siteConfig.contact.whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-all">
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-6 md:p-10 border border-sand-200/50 shadow-premium">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Your Session</h2>
                <p className="text-gray-500 mb-8">Fill out the form and I will contact you within 24 hours.</p>
                {status === "success" ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Received!</h3>
                    <p className="text-gray-600 mb-6">JazakAllahu Khairan! I will contact you within 24 hours to confirm your trial session.</p>
                    <button onClick={() => setStatus("idle")} className="text-primary font-semibold hover:underline">Submit another booking</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div><label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your full name" className={inputClass} /></div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" className={inputClass} /></div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div><label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp *</label><input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} required placeholder="+1 234 567 8900" className={inputClass} /></div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label><input type="text" name="country" value={formData.country} onChange={handleChange} required placeholder="e.g., USA (EST)" className={inputClass} /></div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div><label className="block text-sm font-semibold text-gray-700 mb-2">Service *</label><select name="service" value={formData.service} onChange={handleChange} required className={inputClass}><option value="">Select a service</option>{serviceOptions.map((s) => (<option key={s} value={s}>{s}</option>))}</select></div>
                      <div><label className="block text-sm font-semibold text-gray-700 mb-2">Student Type *</label><select name="studentType" value={formData.studentType} onChange={handleChange} required className={inputClass}><option value="">Select type</option><option value="self">Myself (Adult)</option><option value="child">My Child</option><option value="family">Family</option></select></div>
                    </div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Time (Optional)</label><input type="text" name="preferredTime" value={formData.preferredTime} onChange={handleChange} placeholder="e.g., Weekdays after 5 PM EST" className={inputClass} /></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Message (Optional)</label><textarea name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="Tell me about your goals..." className={`${inputClass} resize-none`} /></div>
                    <Button type="submit" disabled={status === "loading"} size="lg" className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-6 text-base shadow-lg shadow-primary/20">
                      {status === "loading" ? (<span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span>) : (<span className="flex items-center gap-2"><Send className="w-4 h-4" /> Submit Booking Request</span>)}
                    </Button>
                    {status === "error" && <p className="text-sm text-red-500 text-center">Something went wrong. Please try again or contact via WhatsApp.</p>}
                    <p className="text-xs text-gray-400 text-center">By submitting, you agree to be contacted via email and WhatsApp.</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
