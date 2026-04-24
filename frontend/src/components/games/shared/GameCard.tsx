"use client";

import React, { useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, ChevronRight, ChevronLeft, Sparkles, Pencil, BookOpen, Sunrise, Mic, PenTool } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";
import { GameInfo } from "@/types/games";
import { useTranslations } from "next-intl";

interface GameCardProgress {
  completedLevels: number;
  totalStars: number;
}

interface GameCardProps {
  game: GameInfo;
  index: number;
  progress?: GameCardProgress;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const GAME_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "arabic-letters": Pencil,
  "tajweed": BookOpen,
  "noor-albayan": Sunrise,
  "word-pronunciation": Mic,
  "word-writing": PenTool,
};

export default function GameCard({ game, index, progress }: GameCardProps) {
  const { isRTL } = useLocale();
  const t = useTranslations("games");
  const Arrow = isRTL ? ChevronLeft : ChevronRight;
  const completionPercent = progress
    ? Math.round((progress.completedLevels / game.totalLevels) * 100)
    : 0;

  const dots = useMemo(() => {
    const seed = index * 100;
    return Array.from({ length: 6 }, (_: unknown, i: number) => ({
      top: (20 + seededRandom(seed + i * 3 + 1) * 60).toFixed(2) + "%",
      left: (10 + seededRandom(seed + i * 3 + 2) * 80).toFixed(2) + "%",
      duration: 2 + seededRandom(seed + i * 3 + 3) * 2,
      delay: seededRandom(seed + i * 3 + 4) * 2,
    }));
  }, [index]);

  const IconComponent = GAME_ICONS[game.id] || Pencil;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Link href={`/games/${game.slug}`}>
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-500 border border-gray-100">
          <div className={`h-32 md:h-40 bg-gradient-to-br ${game.bgGradient} relative flex items-center justify-center overflow-hidden`}>
            <div className="absolute inset-0">
              {dots.map((dot, i: number) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-white/20 rounded-full"
                  style={{ top: dot.top, left: dot.left }}
                  animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: dot.duration, repeat: Infinity, delay: dot.delay }}
                />
              ))}
            </div>

            <div className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-white/30">
              <IconComponent className="w-10 h-10 text-white" />
            </div>

            <motion.div
              className="absolute top-3 right-3"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6 text-white/50" />
            </motion.div>
          </div>

          <div className="p-5 md:p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t(`${game.id}.title`)}</h3>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{t(`${game.id}.description`)}</p>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">{t("progress")}</span>
                <span className="text-xs font-bold text-gray-600">{completionPercent}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${game.bgGradient} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-sm font-semibold text-gray-700">{progress?.totalStars || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                {t("play")}
                <Arrow className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}