"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface Letter {
  id: number;
  letter: string;
  name: string;
  nameEn: string;
}

interface LevelSelectorProps {
  levels: Letter[];
  completedLevels: Set<number>;
  onSelectLevel: (level: number) => void;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function LevelSelector({ levels, completedLevels, onSelectLevel }: LevelSelectorProps) {
  const t = useTranslations("games");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const floatingLetters = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      top: `${(seededRandom(i * 4 + 1) * 100).toFixed(2)}%`,
      left: `${(seededRandom(i * 4 + 2) * 100).toFixed(2)}%`,
      duration: 3 + seededRandom(i * 4 + 3) * 3,
      delay: seededRandom(i * 4 + 4) * 2,
      letterIndex: Math.floor(seededRandom(i * 4 + 5) * levels.length),
    }));
  }, [levels.length]);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          {mounted && floatingLetters.map((item, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10 font-arabic text-6xl font-bold"
              style={{ top: item.top, left: item.left }}
              animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
              transition={{ duration: item.duration, repeat: Infinity, delay: item.delay }}
            >
              {levels[item.letterIndex]?.letter}
            </motion.div>
          ))}
        </div>

        <div className="container-custom relative z-10">
          <Link href="/games" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>{t("play")}</span>
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black mb-3"
          >
            {t("arabic-letters.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80 mb-6"
          >
            {t("arabic-letters.description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">{completedLevels.size}/{levels.length}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
              <span className="font-bold">{completedLevels.size * 3}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-10">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 md:gap-4">
          {levels.map((letter, index) => {
            const isCompleted = completedLevels.has(index);
            const isLocked = index > 0 && !completedLevels.has(index - 1) && !completedLevels.has(index);
            const isNext = !isCompleted && (index === 0 || completedLevels.has(index - 1));

            return (
              <motion.button
                key={letter.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02, type: "spring" }}
                whileHover={!isLocked ? { scale: 1.1, y: -5 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                onClick={() => !isLocked && onSelectLevel(index)}
                disabled={isLocked}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2 ${
                  isCompleted
                    ? "bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 text-white shadow-lg shadow-green-200"
                    : isNext
                      ? "bg-white border-green-400 text-green-700 shadow-lg shadow-green-100 ring-4 ring-green-100"
                      : isLocked
                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:shadow-md"
                }`}
              >
                {isLocked ? (
                  <Lock className="w-5 h-5 text-gray-300" />
                ) : (
                  <>
                    <span className="text-2xl md:text-3xl font-bold font-arabic leading-none">
                      {letter.letter}
                    </span>
                    <span className="text-[10px] md:text-xs font-medium opacity-70">
                      {letter.nameEn}
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
                    className="absolute inset-0 rounded-2xl border-2 border-green-400"
                    animate={{ scale: [1, 1.05, 1], opacity: [1, 0.5, 1] }}
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