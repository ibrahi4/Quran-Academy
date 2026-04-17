import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,

  ArrowUpRight,
  Heart,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { services } from "@/config/services";
import Container from "../shared/Container";
import Logo from "../shared/Logo";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Ibrahim", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Pricing & Plans", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

// const socialLinks = [
//   { icon: Youtube, href: siteConfig.social.youtube, label: "YouTube" },
//   { icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
//   { icon: Facebook, href: siteConfig.social.facebook, label: "Facebook" },
// ];

export default function Footer() {
  return (
    <footer className="relative bg-gray-900 text-gray-300 overflow-hidden">
      {/* Islamic Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M30 30l15-15v30L30 30zm0 0L15 15v30l15-15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Gold Top Border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

      <Container className="relative z-10">
        {/* ===== TOP SECTION: CTA ===== */}
        <div className="py-12 md:py-16 border-b border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Ready to Start Your Journey?
              </h3>
              <p className="text-gray-400 text-lg">
                Book a free trial lesson and experience the difference.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/book-trial"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent/90 text-gray-900 font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/20"
              >
                Book Free Trial
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <a
                href={siteConfig.contact.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/10 transition-all duration-300"
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* ===== MAIN FOOTER GRID ===== */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: About */}
          <div className="lg:col-span-1">
            <Logo light className="mb-6" />
            <p className="text-gray-400 leading-relaxed mb-6">
              Helping students worldwide connect with the Quran, Arabic language,
              and Islamic knowledge through personalized online education.
            </p>

            {/* Social Links
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-primary/20 text-gray-400 hover:text-accent transition-all duration-300 border border-white/5 hover:border-accent/20"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div> */}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="h-[3px] w-6 bg-accent rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-accent transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-accent transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="h-[3px] w-6 bg-accent rounded-full" />
              Services
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-gray-400 hover:text-accent transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-accent transition-colors" />
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <span className="h-[3px] w-6 bg-accent rounded-full" />
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-start gap-3 text-gray-400 hover:text-accent transition-colors group"
                >
                  <Mail className="w-5 h-5 mt-0.5 text-gray-500 group-hover:text-accent transition-colors" />
                  <span className="text-sm">{siteConfig.contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-accent transition-colors group"
                >
                  <Phone className="w-5 h-5 mt-0.5 text-gray-500 group-hover:text-accent transition-colors" />
                  <span className="text-sm">{siteConfig.contact.whatsapp}</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 mt-0.5 text-gray-500" />
                  <span className="text-sm">
                    Online — Teaching students
                    <br />
                    worldwide from Egypt
                  </span>
                </div>
              </li>
            </ul>

            {/* Quran Verse */}
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-accent/80 font-arabic text-right text-sm leading-loose mb-2">
                ﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾
              </p>
              <p className="text-gray-500 text-xs italic">
                &ldquo;And say: My Lord, increase me in knowledge&rdquo;
                <br />
                <span className="text-gray-600">— Quran 20:114</span>
              </p>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM BAR ===== */}
        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Ibrahim Abdelnasser. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-gray-600 text-xs flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-500" /> for the Ummah
          </p>
        </div>
      </Container>
    </footer>
  );
}