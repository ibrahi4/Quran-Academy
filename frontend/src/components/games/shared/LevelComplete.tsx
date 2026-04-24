"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, RotateCcw, ArrowRight, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarsDisplay from "./StarsDisplay";
import { useLocale } from "@/hooks/useLocale";
import { useTranslations } from "next-intl";
import Confetti from "./Confetti";

interface LevelCompleteProps {
  score: number;
  maxScore: number;
  starsEarned: number;
  correctAnswers: number;
  totalQuestions: number;
  onNextLevel: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export default function LevelComplete({
  score,
  maxScore,
  starsEarned,
  correctAnswers,
  totalQuestions,
  onNextLevel,
  onRetry,
  onHome,
}: LevelCompleteProps) {
  const { isRTL } = useLocale();
  const t = useTranslations("games.levelComplete");
  const percentage = Math.round((score / maxScore) * 100);
  const NextArrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <>
      {starsEarned >= 2 && <Confetti />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-6"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-black text-gray-900 mb-2"
          >
            {starsEarned === 3
              ? t("perfect")
              : starsEarned === 2
                ? t("great")
                : t("good")}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mb-6"
          >
            <StarsDisplay earned={starsEarned} total={3} size="lg" />
          </motion.div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-primary/5 rounded-2xl p-4">
              <p className="text-2xl font-black text-primary">{score}</p>
              <p className="text-xs text-gray-500">{t("score")}</p>
            </div>
            <div className="bg-accent/10 rounded-2xl p-4">
              <p className="text-2xl font-black text-accent">
                {correctAnswers}/{totalQuestions}
              </p>
              <p className="text-xs text-gray-500">{t("correct")}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onNextLevel}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl py-6 text-lg font-bold shadow-lg shadow-primary/20"
            >
              {t("nextLevel")}
              <NextArrow className="w-5 h-5 ms-2" />
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={onRetry}
                variant="outline"
                className="flex-1 rounded-2xl py-5"
              >
                <RotateCcw className="w-4 h-4 me-2" />
                {t("retry")}
              </Button>
              <Button
                onClick={onHome}
                variant="outline"
                className="flex-1 rounded-2xl py-5"
              >
                <Home className="w-4 h-4 me-2" />
                {t("home")}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
