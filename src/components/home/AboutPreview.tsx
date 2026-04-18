"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Heart,
  Shield,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Container from "@/components/shared/Container";
import SectionHeader from "@/components/shared/SectionHeader";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const credentials = [
  { icon: GraduationCap, text: "Al-Azhar Educated" },
  { icon: Award, text: "Ijazah Certified" },
  { icon: BookOpen, text: "10+ Years Teaching" },
  { icon: MessageCircle, text: "Fluent English" },
  { icon: Heart, text: "Patient & Supportive" },
  { icon: Shield, text: "Trusted by 500+ Families" },
];

export default function AboutPreview() {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section ref={ref} className="section-padding bg-white relative overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* ===== LEFT: Visual ===== */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            {/* Main Image Container */}
            <div className="relative">
              {/* Background Decoration */}
              <div
                className="absolute -top-4 -left-4 w-full h-full rounded-3xl"
                style={{
                  background: "linear-gradient(135deg, #0D4F4F 0%, #1A6B5A 100%)",
                  opacity: 0.1,
                }}
              />

              {/* Image Placeholder */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-sand-100 aspect-[4/5] border border-sand-200/50 shadow-premium">
                {/* Replace with actual photo */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <span className="text-5xl font-bold text-primary font-arabic">إ</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-1">Ibrahim Abdelnasser</h4>
                  <p className="text-sm text-gray-500 mb-4">Quran & Arabic Teacher</p>
                  <p className="text-xs text-gray-400 italic text-center">
                    Replace with professional photo
                  </p>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-accent/20">
                    <polygon points="100,0 100,100 0,0" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Floating Experience Badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -right-4 md:-right-8 bg-white rounded-2xl shadow-premium-hover p-5 border border-sand-200/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-hero-gradient flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">10+</p>
                    <p className="text-sm text-gray-500">Years of Excellence</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Quran Verse */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-premium p-4 border border-sand-200/50 max-w-[200px]"
              >
                <p className="text-accent font-arabic text-right text-sm leading-loose">
                  ﴿ خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ ﴾
                </p>
                <p className="text-[10px] text-gray-400 mt-1 italic">
                  "The best of you are those who learn the Quran and teach it"
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* ===== RIGHT: Content ===== */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <SectionHeader
              title="Meet Your Teacher"
              subtitle="Dedicated to making Quran and Arabic accessible to everyone, everywhere."
              centered={false}
            />

            {/* Story */}
            <div className="space-y-4 mb-8">
              <p className="text-gray-600 leading-relaxed text-lg">
                Assalamu Alaikum! I am Ibrahim Abdelnasser, a passionate Quran, Arabic,
                and Islamic Studies teacher with over a decade of experience helping
                non-Arabic speakers connect with the beauty of the Quran.
              </p>
              <p className="text-gray-600 leading-relaxed">
                I believe every Muslim deserves access to quality Quran education,
                regardless of their language or background. My approach combines
                traditional Islamic scholarship with modern teaching methods, creating
                an experience that is both authentic and engaging.
              </p>
            </div>

            {/* Credentials Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {credentials.map((cred, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-sand-50 hover:bg-sand-100 transition-colors"
                >
                  <cred.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">
                    {cred.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/about">
                <Button
                  size="lg"
                  className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold px-6 shadow-lg shadow-primary/20"
                >
                  Read My Full Story
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/book-trial">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-semibold px-6"
                >
                  Book a Free Trial
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
