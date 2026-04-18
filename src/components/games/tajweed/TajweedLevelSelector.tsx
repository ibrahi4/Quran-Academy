"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Lock,
  CheckCircle,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Trophy,
  Flame,
  GraduationCap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { TajweedRule } from "@/config/tajweed";

interface TajweedLevelSelectorProps {
  rules: TajweedRule[];
  completedLevels: Set<number>;
  onSelectLevel: (index: number) => void;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function TajweedLevelSelector({
  rules,
  completedLevels,
  onSelectLevel,
}: TajweedLevelSelectorProps) {
  const t = useTranslations("games");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const floatingItems = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      top: `${(seededRandom(i * 5 + 1) * 100).toFixed(2)}%`,
      left: `${(seededRandom(i * 5 + 2) * 100).toFixed(2)}%`,
      duration: 3 + seededRandom(i * 5 + 3) * 4,
      delay: seededRandom(i * 5 + 4) * 2,
      size: 20 + seededRandom(i * 5 + 5) * 30,
    }));
  }, []);

  const totalStars = completedLevels.size * 3;
  const progressPercent = Math.round((completedLevels.size / rules.length) * 100);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          {mounted && floatingItems.map((item, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10 font-arabic font-bold select-none"
              style={{ top: item.top, left: item.left, fontSize: item.size }}
              animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
              transition={{ duration: item.duration, repeat: Infinity, delay: item.delay }}
            >
              {rules[i % rules.length]?.icon}
            </motion.div>
          ))}
        </div>

        <div className="container-custom relative z-10">
          <Link href="/games" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>{t("play")}</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black">{t("tajweed.title")}</h1>
              <p className="text-white/80 text-sm md:text-base">{t("tajweed.description")}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white/80">
                  <BookOpen className="w-4 h-4 inline me-1" />
                  Mastery Progress
                </span>
                <span className="text-sm font-bold">{progressPercent}%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold">{completedLevels.size}/{rules.length}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                <span className="font-bold">{totalStars}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-200" />
                <span className="font-bold">{rules.length} Rules</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {rules.map((rule, index) => {
            const isCompleted = completedLevels.has(index);
            const isLocked = index > 0 && !completedLevels.has(index - 1) && !completedLevels.has(index);
            const isNext = !isCompleted && (index === 0 || completedLevels.has(index - 1));

            return (
              <motion.button
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: "spring" }}
                whileHover={!isLocked ? { scale: 1.03, y: -4 } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                onClick={() => !isLocked && onSelectLevel(index)}
                disabled={isLocked}
                className={`relative rounded-2xl p-5 text-start transition-all duration-300 border-2 ${
                  isCompleted
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-lg shadow-green-100"
                    : isNext
                      ? "bg-white border-blue-400 shadow-lg shadow-blue-100 ring-4 ring-blue-100"
                      : isLocked
                        ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                {isLocked ? (
                  <div className="flex items-center justify-center py-4">
                    <Lock className="w-8 h-8 text-gray-300" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: rule.color + "15" }}
                      >
                        {rule.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-black text-gray-900 leading-tight font-arabic">{rule.name}</h3>
                        <p className="text-xs text-gray-400">{rule.nameEn}</p>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: rule.color }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-arabic leading-relaxed line-clamp-2">{rule.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">{rule.examples.length} examples</span>
                      {isCompleted && (
                        <div className="flex items-center gap-0.5">
                          {[0, 1, 2].map((s) => (
                            <Star key={s} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {isCompleted && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-5 h-5 text-green-500 fill-green-500" />
                  </motion.div>
                )}

                {isNext && !isCompleted && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-blue-400"
                    animate={{ scale: [1, 1.02, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
