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
  BookOpen,
  Sparkles,
} from "lucide-react";
import ProgressBar from "../shared/ProgressBar";
import useArabicAudio from "@/hooks/useArabicAudio";
import type { TajweedRule, TajweedExample } from "@/config/tajweed";

interface TajweedQuizPhaseProps {
  rule: TajweedRule;
  allRules: TajweedRule[];
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
  type: "identify-rule" | "identify-example" | "listen-rule" | "which-rule";
  prompt: string;
  displayText?: string;
  audio?: string;
  ruleColor?: string;
  options: { text: string; isCorrect: boolean; color?: string }[];
  icon: React.ReactNode;
  badge: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function TajweedQuizPhase({
  rule,
  allRules,
  onScoreUpdate,
  onComplete,
}: TajweedQuizPhaseProps) {
  const TOTAL_QUESTIONS = 6;
  const POINTS_PER_QUESTION = 25;
  const { speak, isPlaying } = useArabicAudio();

  const otherRules = useMemo(() => {
    return allRules.filter((r) => r.id !== rule.id);
  }, [allRules, rule.id]);

  const questions: Question[] = useMemo(() => {
    const qs: Question[] = [];
    const examples = rule.examples;

    for (let q = 0; q < TOTAL_QUESTIONS; q++) {
      const example = examples[q % examples.length];
      const wrongRules = shuffleArray(otherRules).slice(0, 3);
      const questionType = q % 4;

      if (questionType === 0) {
        qs.push({
          type: "identify-rule",
          prompt: "\u0645\u0627 \u062D\u0643\u0645 \u0627\u0644\u062A\u062C\u0648\u064A\u062F \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0643\u0644\u0645\u0629\u061F",
          displayText: example.text,
          ruleColor: rule.color,
          options: shuffleArray([
            { text: `${rule.icon} ${rule.name}`, isCorrect: true, color: rule.color },
            ...wrongRules.map((r) => ({ text: `${r.icon} ${r.name}`, isCorrect: false, color: r.color })),
          ]),
          icon: <Eye className="w-5 h-5" />,
          badge: "Reading",
        });
      } else if (questionType === 1) {
        qs.push({
          type: "listen-rule",
          prompt: "\u0627\u0633\u062A\u0645\u0639 \u0648\u062D\u062F\u062F \u062D\u0643\u0645 \u0627\u0644\u062A\u062C\u0648\u064A\u062F",
          audio: example.text,
          options: shuffleArray([
            { text: `${rule.icon} ${rule.name}`, isCorrect: true, color: rule.color },
            ...wrongRules.map((r) => ({ text: `${r.icon} ${r.name}`, isCorrect: false, color: r.color })),
          ]),
          icon: <Headphones className="w-5 h-5" />,
          badge: "Listening",
        });
      } else if (questionType === 2) {
        const wrongExamples = shuffleArray(
          otherRules.flatMap((r) => r.examples.map((e) => ({ ...e, ruleName: r.name, ruleIcon: r.icon })))
        ).slice(0, 3);

        qs.push({
          type: "identify-example",
          prompt: `\u0623\u064A \u0645\u062B\u0627\u0644 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 "${rule.name}"\u061F`,
          options: shuffleArray([
            { text: example.text, isCorrect: true },
            ...wrongExamples.map((e) => ({ text: e.text, isCorrect: false })),
          ]),
          icon: <BookOpen className="w-5 h-5" />,
          badge: "Find Example",
        });
      } else {
        qs.push({
          type: "which-rule",
          prompt: `"${example.text}" - \u0645\u0627 \u0627\u0644\u062D\u0643\u0645\u061F`,
          displayText: example.text,
          options: shuffleArray([
            { text: rule.nameEn, isCorrect: true },
            ...wrongRules.slice(0, 3).map((r) => ({ text: r.nameEn, isCorrect: false })),
          ]),
          icon: <Sparkles className="w-5 h-5" />,
          badge: "Challenge",
        });
      }
    }
    return qs;
  }, [rule, otherRules]);

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
          const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
          const finalScore = isCorrect ? totalScore + POINTS_PER_QUESTION + Math.min(streak * 5, 25) : totalScore;
          const percentage = (finalCorrect / TOTAL_QUESTIONS) * 100;
          const stars = percentage >= 95 ? 3 : percentage >= 70 ? 2 : percentage >= 40 ? 1 : 0;
          onComplete({ score: finalScore, maxScore: TOTAL_QUESTIONS * (POINTS_PER_QUESTION + 25), correct: finalCorrect, total: TOTAL_QUESTIONS, stars });
        }
      }, 1500);
    },
    [isAnswered, question, currentQ, correctCount, totalScore, streak, onScoreUpdate, onComplete]
  );

  const isArabicText = (text: string): boolean => /[\u0600-\u06FF]/.test(text);

  return (
    <div className="container-custom py-6 md:py-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <ProgressBar current={currentQ + 1} total={TOTAL_QUESTIONS} color="bg-blue-500" />
      </div>

      {streak >= 2 && (
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-4">
          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold">
            <Zap className="w-4 h-4 fill-indigo-400" />
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-blue-600">
              {question.icon}
              {question.badge}
            </span>
          </div>

          <div className="text-center mb-8">
            {question.type === "listen-rule" && question.audio && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                onClick={() => speak(question.audio!, true)}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-transform mb-4"
              >
                <Volume2 className={`w-10 h-10 text-white ${isPlaying ? "animate-pulse" : ""}`} />
              </motion.button>
            )}

            {question.displayText && (
              <motion.div className="mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <button onClick={() => speak(question.displayText!, true)} className="group relative inline-block">
                  <span className="text-4xl md:text-5xl font-bold font-arabic font-quran" style={{ color: question.ruleColor || "#1e40af" }}>
                    {question.displayText}
                  </span>
                  <Volume2 className="w-4 h-4 text-gray-300 group-hover:text-blue-400 absolute -top-1 -right-5 transition-colors" />
                </button>
              </motion.div>
            )}

            <h2 className="text-xl md:text-2xl font-bold text-gray-800 font-arabic">{question.prompt}</h2>
          </div>

          <div className={`grid gap-3 ${question.type === "identify-example" ? "grid-cols-1" : "grid-cols-2"}`}>
            {question.options.map((option, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrectOption = option.isCorrect;
              const showResult = isAnswered;
              const isArabic = isArabicText(option.text);

              let bgClass = "bg-white border-gray-200 hover:border-blue-400 hover:shadow-md";
              if (showResult && isCorrectOption) bgClass = "bg-green-50 border-green-500 shadow-lg shadow-green-100";
              else if (showResult && isSelected && !isCorrectOption) bgClass = "bg-red-50 border-red-400 shadow-lg shadow-red-100";
              else if (isSelected) bgClass = "bg-blue-50 border-blue-400";

              return (
                <motion.button
                  key={i}
                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(i)}
                  disabled={isAnswered}
                  className={`relative p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 text-start ${bgClass}`}
                >
                  <span className={`font-bold block ${isArabic ? "font-arabic text-xl md:text-2xl font-quran" : "text-sm md:text-base"} ${
                    showResult && isCorrectOption ? "text-green-700" : showResult && isSelected && !isCorrectOption ? "text-red-600" : "text-gray-800"
                  }`}>
                    {option.text}
                  </span>

                  {showResult && isCorrectOption && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
                      <CheckCircle className="w-6 h-6 text-green-500 fill-green-100" />
                    </motion.div>
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
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
