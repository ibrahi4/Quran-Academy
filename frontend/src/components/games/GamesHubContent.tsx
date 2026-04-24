"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Gamepad2,
  Trophy,
  Star,
  Pencil,
  BookOpen,
  Mic,
} from "lucide-react";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/shared/SectionHeader";
import GameCard from "./shared/GameCard";
import { gamesConfig } from "@/config/games";

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const CONFETTI_COLORS: string[] = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#F8C471", "#82E0AA",
  "#BB8FCE", "#85C1E9", "#FF9FF3", "#54A0FF",
];

interface ConfettiPiece {
  color: string;
  width: number;
  height: number;
  top: string;
  left: string;
  rotation: number;
  duration: number;
  delay: number;
  isCircle: boolean;
}

function ConfettiBackground(): React.ReactElement {
  const pieces: ConfettiPiece[] = useMemo(() => {
    return Array.from({ length: 30 }, (_: unknown, i: number): ConfettiPiece => {
      const isCircle: boolean = seededRandom(i * 7 + 8) > 0.6;
      const w: number = Math.round((4 + seededRandom(i * 7 + 1) * 12) * 100) / 100;
      return {
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        width: w,
        height: isCircle ? w : Math.round((4 + seededRandom(i * 7 + 2) * 20) * 100) / 100,
        top: Math.round(seededRandom(i * 7 + 3) * 10000) / 100 + "%",
        left: Math.round(seededRandom(i * 7 + 4) * 10000) / 100 + "%",
        rotation: Math.round(seededRandom(i * 7 + 5) * 360),
        duration: Math.round((4 + seededRandom(i * 7 + 6) * 6) * 10) / 10,
        delay: Math.round(seededRandom(i * 7 + 7) * 30) / 10,
        isCircle: isCircle,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {pieces.map((p: ConfettiPiece, i: number) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : 2,
            top: p.top,
            left: p.left,
            transform: `rotate(${p.rotation}deg)`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [p.rotation, p.rotation + 30, p.rotation],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function GamesHubContent(): React.ReactElement {
  const t = useTranslations("games");

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      <section className="relative overflow-hidden bg-amber-400 text-gray-900 py-20 md:py-28">
        <ConfettiBackground />

        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm border-2 border-white/40 rounded-full px-6 py-3 mb-8"
            >
              <Gamepad2 className="w-5 h-5" />
              <span className="text-sm font-bold">{t("hero.badge")}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-6"
              style={{ textShadow: "3px 3px 0px rgba(139, 92, 246, 0.3)" }}
            >
              {t("hero.title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-800 mb-10 font-medium"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-6 md:gap-10"
            >
              <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-2xl px-5 py-3">
                <Gamepad2 className="w-5 h-5 text-purple-700" />
                <div className="text-start">
                  <p className="font-black text-lg">5</p>
                  <p className="text-xs font-semibold text-gray-700">{t("hero.games")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-2xl px-5 py-3">
                <Trophy className="w-5 h-5 text-purple-700" />
                <div className="text-start">
                  <p className="font-black text-lg">108</p>
                  <p className="text-xs font-semibold text-gray-700">{t("hero.levels")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-2xl px-5 py-3">
                <Star className="w-5 h-5 text-purple-700" />
                <div className="text-start">
                  <p className="font-black text-lg">324</p>
                  <p className="text-xs font-semibold text-gray-700">{t("hero.stars")}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H0Z"
              className="fill-amber-50"
            />
          </svg>
        </div>
      </section>

      <section className="section-padding -mt-4">
        <div className="container-custom">
          <SectionHeader title={t("allGames.title")} subtitle={t("allGames.subtitle")} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {gamesConfig.map((game, index: number) => (
              <GameCard key={game.id} game={game} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <SectionHeader title={t("features.title")} subtitle={t("features.subtitle")} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-amber-50 hover:shadow-premium transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-amber-400 rounded-2xl flex items-center justify-center">
                  {i === 0 && <Pencil className="w-7 h-7 text-white" />}
                  {i === 1 && <Mic className="w-7 h-7 text-white" />}
                  {i === 2 && <Star className="w-7 h-7 text-white" />}
                  {i === 3 && <BookOpen className="w-7 h-7 text-white" />}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {t(`features.items.${i}.title`)}
                </h3>
                <p className="text-sm text-gray-500">
                  {t(`features.items.${i}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}