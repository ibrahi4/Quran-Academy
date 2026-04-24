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
  MapPin,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { NoorAlBayanLevel } from "@/config/noorAlBayan";

interface NoorLevelSelectorProps {
  levels: NoorAlBayanLevel[];
  completedLevels: Set<number>;
  onSelectLevel: (index: number) => void;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const STAGE_LABELS: Record<string, { ar: string; en: string; icon: string }> = {
  harakat: { ar: "\u0627\u0644\u062D\u0631\u0643\u0627\u062A", en: "Harakat", icon: "\u0650\u064E\u064F" },
  sukun: { ar: "\u0627\u0644\u0633\u0643\u0648\u0646", en: "Sukun", icon: "\u0652" },
  tanween: { ar: "\u0627\u0644\u062A\u0646\u0648\u064A\u0646", en: "Tanween", icon: "\u064B\u064C\u064D" },
  shaddah: { ar: "\u0627\u0644\u0634\u062F\u0629", en: "Shaddah", icon: "\u0651" },
  madd: { ar: "\u0627\u0644\u0645\u062F", en: "Madd", icon: "\u0640\u0640" },
  words: { ar: "\u0643\u0644\u0645\u0627\u062A", en: "Words", icon: "\u0643\u0644\u0645" },
  sentences: { ar: "\u062C\u0645\u0644", en: "Sentences", icon: "\u062C\u0645\u0644\u0629" },
};

export default function NoorLevelSelector({
  levels,
  completedLevels,
  onSelectLevel,
}: NoorLevelSelectorProps) {
  const t = useTranslations("games");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const floatingItems = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      top: `${(seededRandom(i * 5 + 1) * 100).toFixed(2)}%`,
      left: `${(seededRandom(i * 5 + 2) * 100).toFixed(2)}%`,
      duration: 3 + seededRandom(i * 5 + 3) * 4,
      delay: seededRandom(i * 5 + 4) * 2,
      emoji: ["\u2728", "\u2B50", "\u0628", "\u062A", "\u062B", "\u062C", "\u062D", "\u0633", "\u0634", "\u0639", "\u0642", "\u0646"][i],
      size: 20 + seededRandom(i * 5 + 5) * 30,
    }));
  }, []);

  const stages = useMemo(() => {
    const stageMap = new globalThis.Map<string, { label: typeof STAGE_LABELS[string]; levels: { level: NoorAlBayanLevel; globalIndex: number }[] }>();
    levels.forEach((level, index) => {
      if (!stageMap.has(level.stage)) {
        stageMap.set(level.stage, {
          label: STAGE_LABELS[level.stage] || { ar: level.stage, en: level.stage, icon: "?" },
          levels: [],
        });
      }
      stageMap.get(level.stage)!.levels.push({ level, globalIndex: index });
    });
    return Array.from(stageMap.entries());
  }, [levels]);

  const totalStars = completedLevels.size * 3;
  const progressPercent = Math.round((completedLevels.size / levels.length) * 100);

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          {mounted &&
            floatingItems.map((item, i) => (
              <motion.div
                key={i}
                className="absolute text-white/10 font-arabic font-bold select-none"
                style={{
                  top: item.top,
                  left: item.left,
                  fontSize: item.size,
                }}
                animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
                transition={{
                  duration: item.duration,
                  repeat: Infinity,
                  delay: item.delay,
                }}
              >
                {item.emoji}
              </motion.div>
            ))}
        </div>

        <div className="container-custom relative z-10">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("play")}</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-3"
          >
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black">
                {t("noor-albayan.title")}
              </h1>
              <p className="text-white/80 text-sm md:text-base">
                {t("noor-albayan.description")}
              </p>
            </div>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white/80">
                  <MapPin className="w-4 h-4 inline me-1" />
                  Journey Progress
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
                <span className="font-bold">
                  {completedLevels.size}/{levels.length}
                </span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                <span className="font-bold">{totalStars}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-200" />
                <span className="font-bold">{levels.length} Levels</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stages & Levels */}
      <div className="container-custom py-10">
        {stages.map(([stageName, stageData], stageIndex) => {
          const stageCompleted = stageData.levels.every((l) =>
            completedLevels.has(l.globalIndex)
          );
          const stageProgress = stageData.levels.filter((l) =>
            completedLevels.has(l.globalIndex)
          ).length;

          return (
            <motion.div
              key={stageName}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stageIndex * 0.1 }}
              className="mb-10"
            >
              {/* Stage Header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${
                    stageCompleted
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {stageCompleted ? (
                    <Trophy className="w-6 h-6" />
                  ) : (
                    <span className="font-arabic">
                      {stageData.label.icon}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-gray-900">
                      {stageData.label.ar}
                    </h2>
                    <span className="text-sm text-gray-400">
                      {stageData.label.en}
                    </span>
                    {stageCompleted && (
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${(stageProgress / stageData.levels.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {stageProgress}/{stageData.levels.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Level Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {stageData.levels.map(({ level, globalIndex }) => {
                  const isCompleted = completedLevels.has(globalIndex);
                  const isLocked =
                    globalIndex > 0 &&
                    !completedLevels.has(globalIndex - 1) &&
                    !completedLevels.has(globalIndex);
                  const isNext =
                    !isCompleted &&
                    (globalIndex === 0 ||
                      completedLevels.has(globalIndex - 1));

                  return (
                    <motion.button
                      key={level.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: globalIndex * 0.03,
                        type: "spring",
                      }}
                      whileHover={
                        !isLocked ? { scale: 1.05, y: -4 } : {}
                      }
                      whileTap={!isLocked ? { scale: 0.97 } : {}}
                      onClick={() => !isLocked && onSelectLevel(globalIndex)}
                      disabled={isLocked}
                      className={`relative rounded-2xl p-4 text-center transition-all duration-300 border-2 ${
                        isCompleted
                          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-lg shadow-green-100"
                          : isNext
                            ? "bg-white border-orange-400 shadow-lg shadow-orange-100 ring-4 ring-orange-100"
                            : isLocked
                              ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                              : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-md"
                      }`}
                    >
                      {isLocked ? (
                        <Lock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                      ) : (
                        <>
                          <span className="text-2xl mb-1 block">
                            {level.icon}
                          </span>
                          <span className="text-sm font-bold text-gray-800 block leading-tight">
                            {level.title}
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {level.titleEn}
                          </span>
                        </>
                      )}

                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 fill-green-500" />
                        </motion.div>
                      )}

                      {isNext && !isCompleted && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-orange-400"
                          animate={{
                            scale: [1, 1.03, 1],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}

                      {isCompleted && (
                        <div className="flex items-center justify-center gap-0.5 mt-2">
                          {[0, 1, 2].map((s) => (
                            <Star
                              key={s}
                              className="w-3 h-3 text-yellow-400 fill-yellow-400"
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
