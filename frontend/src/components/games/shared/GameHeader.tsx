"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star, Trophy } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";

interface GameHeaderProps {
  title: string;
  subtitle?: string;
  currentLevel?: number;
  totalLevels?: number;
  score?: number;
  showBack?: boolean;
  backHref?: string;
}

export default function GameHeader({ title, subtitle, currentLevel, totalLevels, score = 0, showBack = true, backHref = "/games" }: GameHeaderProps) {
  const { isRTL } = useLocale();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="bg-white border-b border-gray-100 mt-16 md:mt-20">
      <div className="container-custom">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-3">
            {showBack && (
              <Link href={backHref} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all">
                <BackArrow className="w-5 h-5 text-gray-600" />
              </Link>
            )}
            <div>
              <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div key={score} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-bold text-amber-700 text-sm">{score}</span>
            </motion.div>
            {currentLevel && totalLevels && (
              <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-xl">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary text-sm">{currentLevel}/{totalLevels}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
