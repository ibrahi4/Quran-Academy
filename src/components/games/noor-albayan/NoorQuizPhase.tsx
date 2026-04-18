"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  CheckCircle,
  XCircle,
  Zap,
  Headphones,
  Eye,
  ArrowRightLeft,
  Sparkles,
} from "lucide-react";
import ProgressBar from "../shared/ProgressBar";
import useArabicAudio from "@/hooks/useArabicAudio";
import type { NoorAlBayanLevel, NoorAlBayanItem } from "@/config/noorAlBayan";

interface NoorQuizPhaseProps {
  level: NoorAlBayanLevel;
  allLevels: NoorAlBayanLevel[];
  onScoreUpdate: (points: number, isCorrect: boolean) => void;
  onComplete: (result: {
    score: number;
    maxScore: number;
    correct: number;
    total: number;
    stars: number;
  }) => void;
}

interface Question {
  type: "identify" | "listen" | "match" | "reverse";
  prompt: string;
  displayText?: string;
  audio?: string;
  options: { text: string; isCorrect: boolean }[];
  icon: React.ReactNode;
  color: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomItems(
  items: NoorAlBayanItem[],
  exclude: NoorAlBayanItem,
  count: number
): NoorAlBayanItem[] {
  return shuffleArray(items.filter((item) => item.id !== exclude.id)).slice(
    0,
    count
  );
}

export default function NoorQuizPhase({
  level,
  allLevels,
  onScoreUpdate,
  onComplete,
}: NoorQuizPhaseProps) {
  const TOTAL_QUESTIONS = 8;
  const POINTS_PER_QUESTION = 20;
  const { speak, isPlaying } = useArabicAudio();

  const allSameStageItems = useMemo(() => {
    return allLevels
      .filter((l) => l.stage === level.stage)
      .flatMap((l) => l.items);
  }, [allLevels, level.stage]);

  const questions: Question[] = useMemo(() => {
    const qs: Question[] = [];
    const items = level.items;
    const pool =
      allSameStageItems.length > 4 ? allSameStageItems : items;

    for (let q = 0; q < TOTAL_QUESTIONS; q++) {
      const targetItem = items[q % items.length];
      const wrongItems = getRandomItems(pool, targetItem, 3);
      const questionType = q % 4;

      if (questionType === 0) {
        qs.push({
          type: "identify",
          prompt: "\u0645\u0627 \u0647\u0648 \u0627\u0644\u0646\u0637\u0642 \u0627\u0644\u0635\u062D\u064A\u062D\u061F",
          displayText: targetItem.text,
          options: shuffleArray([
            { text: targetItem.transliteration, isCorrect: true },
            ...wrongItems.map((w) => ({
              text: w.transliteration,
              isCorrect: false,
            })),
          ]),
          icon: <Eye className="w-5 h-5" />,
          color: "text-blue-600",
        });
      } else if (questionType === 1) {
        qs.push({
          type: "reverse",
          prompt: `\u0627\u062E\u062A\u0631: ${targetItem.transliteration}`,
          options: shuffleArray([
            { text: targetItem.text, isCorrect: true },
            ...wrongItems.map((w) => ({
              text: w.text,
              isCorrect: false,
            })),
          ]),
          icon: <ArrowRightLeft className="w-5 h-5" />,
          color: "text-purple-600",
        });
      } else if (questionType === 2) {
        qs.push({
          type: "listen",
          prompt: "\u0627\u0633\u062A\u0645\u0639 \u0648\u0627\u062E\u062A\u0631 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629",
          audio: targetItem.text,
          options: shuffleArray([
            { text: targetItem.text, isCorrect: true },
            ...wrongItems.map((w) => ({
              text: w.text,
              isCorrect: false,
            })),
          ]),
          icon: <Headphones className="w-5 h-5" />,
          color: "text-green-600",
        });
      } else {
        const wrongItems2 = getRandomItems(pool, targetItem, 3);
        qs.push({
          type: "match",
          prompt: `\u0645\u0627 \u0647\u0648 "${targetItem.text}"\u061F`,
          displayText: targetItem.text,
          options: shuffleArray([
            { text: targetItem.transliteration, isCorrect: true },
            ...wrongItems2.map((w) => ({
              text: w.transliteration,
              isCorrect: false,
            })),
          ]),
          icon: <Sparkles className="w-5 h-5" />,
          color: "text-orange-600",
        });
      }
    }
    return qs;
  }, [level, allSameStageItems]);

  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const question = questions[currentQ];

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (isAnswered) return;

      setSelectedAnswer(optionIndex);
      setIsAnswered(true);

      const isCorrect = question.options[optionIndex].isCorrect;

      if (isCorrect) {
        const streakBonus = Math.min(streak * 5, 25);
        const points = POINTS_PER_QUESTION + streakBonus;
        setCorrectCount((prev) => prev + 1);
        setTotalScore((prev) => prev + points);
        setStreak((prev) => prev + 1);
        onScoreUpdate(points, true);
      } else {
        setStreak(0);
        onScoreUpdate(0, false);
      }

      setTimeout(() => {
        if (currentQ < TOTAL_QUESTIONS - 1) {
          setCurrentQ((prev) => prev + 1);
          setSelectedAnswer(null);
          setIsAnswered(false);
        } else {
          const finalCorrect = isCorrect
            ? correctCount + 1
            : correctCount;
          const finalScore = isCorrect
            ? totalScore +
              POINTS_PER_QUESTION +
              Math.min(streak * 5, 25)
            : totalScore;
          const percentage = (finalCorrect / TOTAL_QUESTIONS) * 100;
          const stars =
            percentage >= 95 ? 3 : percentage >= 70 ? 2 : percentage >= 40 ? 1 : 0;

          onComplete({
            score: finalScore,
            maxScore: TOTAL_QUESTIONS * (POINTS_PER_QUESTION + 25),
            correct: finalCorrect,
            total: TOTAL_QUESTIONS,
            stars,
          });
        }
      }, 1500);
    },
    [
      isAnswered,
      question,
      currentQ,
      correctCount,
      totalScore,
      streak,
      onScoreUpdate,
      onComplete,
    ]
  );

  const isArabicText = (text: string): boolean => {
    return /[\u0600-\u06FF]/.test(text);
  };

  return (
    <div className="container-custom py-6 md:py-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <ProgressBar
          current={currentQ + 1}
          total={TOTAL_QUESTIONS}
          color="bg-orange-500"
        />
      </div>

      {streak >= 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-4"
        >
          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold">
            <Zap className="w-4 h-4 fill-orange-400" />
            {streak}x Streak!
          </span>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 ${question.color}`}
            >
              {question.icon}
              {question.type === "listen"
                ? "Listening"
                : question.type === "identify"
                  ? "Reading"
                  : question.type === "reverse"
                    ? "Matching"
                    : "Challenge"}
            </span>
          </div>

          <div className="text-center mb-8">
            {question.type === "listen" && question.audio && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                onClick={() => speak(question.audio!, true)}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-200 hover:scale-105 active:scale-95 transition-transform mb-4"
              >
                <Volume2 className={`w-10 h-10 text-white ${isPlaying ? "animate-pulse" : ""}`} />
              </motion.button>
            )}

            {question.displayText && (
              <motion.div
                className="mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <button
                  onClick={() => speak(question.displayText!, true)}
                  className="group relative inline-block"
                >
                  <span
                    className="text-6xl md:text-7xl font-bold font-arabic"
                    style={{ color: level.color }}
                  >
                    {question.displayText}
                  </span>
                  <Volume2 className="w-4 h-4 text-gray-300 group-hover:text-orange-400 absolute -top-1 -right-5 transition-colors" />
                </button>
              </motion.div>
            )}

            <h2 className="text-xl md:text-2xl font-bold text-gray-800 font-arabic">
              {question.prompt}
            </h2>
          </div>

          <div className="grid gap-3 grid-cols-2">
            {question.options.map((option, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrectOption = option.isCorrect;
              const showResult = isAnswered;
              const isArabic = isArabicText(option.text);

              let bgClass =
                "bg-white border-gray-200 hover:border-orange-400 hover:shadow-md";
              if (showResult && isCorrectOption) {
                bgClass =
                  "bg-green-50 border-green-500 shadow-lg shadow-green-100";
              } else if (showResult && isSelected && !isCorrectOption) {
                bgClass =
                  "bg-red-50 border-red-400 shadow-lg shadow-red-100";
              } else if (isSelected) {
                bgClass = "bg-orange-50 border-orange-400";
              }

              return (
                <motion.button
                  key={i}
                  whileHover={!isAnswered ? { scale: 1.03 } : {}}
                  whileTap={!isAnswered ? { scale: 0.97 } : {}}
                  onClick={() => handleAnswer(i)}
                  disabled={isAnswered}
                  className={`relative p-5 md:p-6 rounded-2xl border-2 transition-all duration-300 ${bgClass}`}
                >
                  <span
                    className={`font-bold block ${
                      isArabic
                        ? "font-arabic text-2xl md:text-3xl"
                        : "text-lg md:text-xl"
                    } ${
                      showResult && isCorrectOption
                        ? "text-green-700"
                        : showResult && isSelected && !isCorrectOption
                          ? "text-red-600"
                          : "text-gray-800"
                    }`}
                  >
                    {option.text}
                  </span>

                  {showResult && isCorrectOption && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <CheckCircle className="w-6 h-6 text-green-500 fill-green-100" />
                    </motion.div>
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <XCircle className="w-6 h-6 text-red-500 fill-red-100" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
