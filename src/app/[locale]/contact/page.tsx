"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
  // Youtube,
  // Instagram,
  // Facebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import { siteConfig } from "@/config/site";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: siteConfig.contact.email,
    link: "mailto:" + siteConfig.contact.email,
    description: "I respond within 24 hours",
  },
  {
    icon: Phone,
    title: "WhatsApp",
    value: siteConfig.contact.whatsapp,
    link: siteConfig.contact.whatsappLink,
    description: "Fastest way to reach me",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Online — Worldwide",
    link: null,
    description: "Teaching from Egypt to the world",
  },
  {
    icon: Clock,
    title: "Availability",
    value: "Flexible Hours",
    link: null,
    description: "All major time zones accommodated",
  },
];

// const socialLinks = [
//   { icon: Youtube, href: siteConfig.social.youtube, name: "YouTube" },
//   { icon: Instagram, href: siteConfig.social.instagram, name: "Instagram" },
//   { icon: Facebook, href: siteConfig.social.facebook, name: "Facebook" },
// ];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", whatsapp: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="contact-pattern"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <polygon
                  points="40,8 46,26 64,20 50,34 64,48 46,42 40,60 34,42 16,48 30,34 16,20 34,26"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.3"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contact-pattern)" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6">
              <span className="text-white/80 text-sm font-medium">
                Get In Touch
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Contact <span className="text-accent">Ibrahim</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
              Have a question or want to learn more? I would love to hear from
              you. Reach out anytime and I will get back to you promptly.
            </p>
          </div>
        </Container>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <section className="section-padding bg-sand-50">
        <Container>
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* ===== LEFT: Contact Info ===== */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h2>

              {/* Contact Cards */}
              <div className="space-y-4 mb-8">
                {contactInfo.map((info, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-sand-200/50 hover:shadow-premium transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {info.title}
                      </h3>
                      {info.link ? (
                        <a
                          href={info.link}
                          target={
                            info.link.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            info.link.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="text-primary font-medium text-sm hover:underline"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-gray-700 text-sm font-medium">
                          {info.value}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        {info.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="p-5 rounded-2xl bg-white border border-sand-200/50">
                <h3 className="font-semibold text-gray-900 mb-3">Follow Me</h3>
                {/* <div className="flex items-center gap-3">
                  {socialLinks.map((social, i) => (
                    <a
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-primary/5 hover:bg-primary/10 flex items-center justify-center text-primary transition-all duration-300"
                      aria-label={social.name}
                    >
                      <social.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div> */}
              </div>

              {/* Quick WhatsApp */}
              <div className="mt-6">
                <a
                  href={siteConfig.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-all shadow-lg shadow-green-500/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  Quick Chat on WhatsApp
                </a>
              </div>

              {/* Office Hours */}
              <div className="mt-6 p-5 rounded-2xl bg-primary/5 border border-primary/10">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Response Times
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center justify-between">
                    <span>WhatsApp</span>
                    <span className="font-medium text-primary">Within hours</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Email</span>
                    <span className="font-medium text-primary">Within 24 hours</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Contact Form</span>
                    <span className="font-medium text-primary">Within 24 hours</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* ===== RIGHT: Contact Form ===== */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-6 md:p-10 border border-sand-200/50 shadow-premium">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Send a Message
                </h2>
                <p className="text-gray-500 mb-8">
                  Fill out the form below and I will get back to you as soon as
                  possible.
                </p>

                {/* Success State */}
                {status === "success" ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-600 mb-2 max-w-md mx-auto">
                      JazakAllahu Khairan for reaching out! I have received your
                      message and will respond within 24 hours.
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                      Check your email for a confirmation.
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/5 text-primary font-semibold hover:bg-primary/10 transition-all"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  /* Form */
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      />
                    </div>

                    {/* Email & WhatsApp */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="your@email.com"
                          className="w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          WhatsApp Number{" "}
                          <span className="text-gray-400 font-normal">
                            (Optional)
                          </span>
                        </label>
                        <input
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleChange}
                          placeholder="+1 234 567 8900"
                          className="w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="How can I help you? Tell me about your learning goals, questions, or anything else..."
                        className="w-full px-4 py-3.5 rounded-xl border border-sand-200 bg-sand-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={status === "loading"}
                      size="lg"
                      className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold py-6 text-base shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === "loading" ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending Message...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Send Message
                        </span>
                      )}
                    </Button>

                    {/* Error Message */}
                    {status === "error" && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
                        <p className="text-sm text-red-600 font-medium">
                          Something went wrong. Please try again or contact me
                          directly via WhatsApp.
                        </p>
                      </div>
                    )}

                    {/* Privacy Note */}
                    <p className="text-xs text-gray-400 text-center">
                      Your information is safe. I will never share your details
                      with anyone. By submitting this form, you agree to be
                      contacted regarding your inquiry.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== MAP / GLOBAL REACH SECTION ===== */}
      <section className="section-padding bg-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Teaching Students Worldwide
            </h2>
            <p className="text-lg text-gray-600 mb-10">
              I work with students across all major time zones. No matter where
              you are, we will find a time that works for you.
            </p>

            {/* Countries Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { flag: "🇺🇸", name: "USA" },
                { flag: "🇬🇧", name: "UK" },
                { flag: "🇨🇦", name: "Canada" },
                { flag: "🇩🇪", name: "Germany" },
                { flag: "🇳🇱", name: "Netherlands" },
                { flag: "🇦🇺", name: "Australia" },
                { flag: "🇫🇷", name: "France" },
                { flag: "🇸🇪", name: "Sweden" },
                { flag: "🇳🇴", name: "Norway" },
                { flag: "🇧🇪", name: "Belgium" },
                { flag: "🇮🇪", name: "Ireland" },
                { flag: "🇦🇹", name: "Austria" },
              ].map((country, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-sand-50 border border-sand-200/50 hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span className="text-3xl">{country.flag}</span>
                  <span className="text-xs font-medium text-gray-600">
                    {country.name}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-6">
              And many more countries across Europe, Asia, and Africa
            </p>
          </div>
        </Container>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient" />
            <div className="absolute inset-0 opacity-[0.04]">
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="cta-contact-pattern"
                    x="0"
                    y="0"
                    width="80"
                    height="80"
                    patternUnits="userSpaceOnUse"
                  >
                    <polygon
                      points="40,8 46,26 64,20 50,34 64,48 46,42 40,60 34,42 16,48 30,34 16,20 34,26"
                      fill="none"
                      stroke="white"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="url(#cta-contact-pattern)"
                />
              </svg>
            </div>

            <div className="relative z-10 px-8 md:px-16 py-14 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
                Do not wait any longer. Book your free trial today and take the
                first step towards mastering Quran and Arabic.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/book-trial"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-gray-900 shadow-2xl transition-all duration-300 hover:shadow-amber-900/30"
                  style={{
                    background:
                      "linear-gradient(135deg, #C8A96E 0%, #d4a94a 100%)",
                  }}
                >
                  Book Free Trial
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
                <a
                  href={siteConfig.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/15 transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Chat
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
