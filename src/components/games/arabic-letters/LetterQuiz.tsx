"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, CheckCircle, XCircle, Zap } from "lucide-react";
import ProgressBar from "../shared/ProgressBar";

interface Letter {
  id: number;
  letter: string;
  name: string;
  nameEn: string;
  sound: string;
  group: "sun" | "moon";
}

interface LetterQuizProps {
  currentLetter: Letter;
  allLetters: Letter[];
  onScoreUpdate: (points: number, isCorrect: boolean) => void;
  onComplete: (result: { score: number; maxScore: number; correct: number; total: number; stars: number }) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomLetters(allLetters: Letter[], exclude: Letter, count: number): Letter[] {
  return shuffleArray(allLetters.filter((l) => l.id !== exclude.id)).slice(0, count);
}

interface Question {
  type: string;
  prompt: string;
  displayLetter?: string;
  options: { text: string; isCorrect: boolean }[];
}

export default function LetterQuiz({ currentLetter, allLetters, onScoreUpdate, onComplete }: LetterQuizProps) {
  const TOTAL_QUESTIONS = 6;
  const POINTS_PER_QUESTION = 20;

  const questions = useMemo(() => {
    const qs: Question[] = [];
    const wrongLetters = getRandomLetters(allLetters, currentLetter, 3);

    qs.push({
      type: "identify-letter",
      prompt: `\u0623\u064A\u0646 \u062D\u0631\u0641 "${currentLetter.name}"?`,
      options: shuffleArray([
        { text: currentLetter.letter, isCorrect: true },
        ...wrongLetters.slice(0, 3).map((l) => ({ text: l.letter, isCorrect: false })),
      ]),
    });

    qs.push({
      type: "identify-name",
      prompt: "\u0645\u0627 \u0627\u0633\u0645 \u0647\u0630\u0627 \u0627\u0644\u062D\u0631\u0641?",
      displayLetter: currentLetter.letter,
      options: shuffleArray([
        { text: currentLetter.name, isCorrect: true },
        ...wrongLetters.slice(0, 3).map((l) => ({ text: l.name, isCorrect: false })),
      ]),
    });

    qs.push({
      type: "identify-sound",
      prompt: `\u0645\u0627 \u0635\u0648\u062A \u062D\u0631\u0641 "${currentLetter.letter}"?`,
      displayLetter: currentLetter.letter,
      options: shuffleArray([
        { text: currentLetter.sound.toUpperCase(), isCorrect: true },
        ...wrongLetters.slice(0, 3).map((l) => ({ text: l.sound.toUpperCase(), isCorrect: false })),
      ]),
    });

    const wrongLetters2 = getRandomLetters(allLetters, currentLetter, 3);
    qs.push({
      type: "identify-letter",
      prompt: `\u0627\u062E\u062A\u0631 \u062D\u0631\u0641 "${currentLetter.nameEn}"`,
      options: shuffleArray([
        { text: currentLetter.letter, isCorrect: true },
        ...wrongLetters2.slice(0, 3).map((l) => ({ text: l.letter, isCorrect: false })),
      ]),
    });

    const wrongLetters3 = getRandomLetters(allLetters, currentLetter, 3);
    qs.push({
      type: "identify-name",
      prompt: `"${currentLetter.letter}" - \u0645\u0627 \u0627\u0633\u0645\u0647?`,
      displayLetter: currentLetter.letter,
      options: shuffleArray([
        { text: currentLetter.nameEn, isCorrect: true },
        ...wrongLetters3.slice(0, 3).map((l) => ({ text: l.nameEn, isCorrect: false })),
      ]),
    });

    qs.push({
      type: "odd-one-out",
      prompt: `"${currentLetter.letter}" \u0647\u0644 \u0647\u0648 \u062D\u0631\u0641...?`,
      displayLetter: currentLetter.letter,
      options: shuffleArray([
        { text: currentLetter.group === "sun" ? "\u2600\uFE0F \u0634\u0645\u0633\u064A" : "\uD83C\uDF19 \u0642\u0645\u0631\u064A", isCorrect: true },
        { text: currentLetter.group === "sun" ? "\uD83C\uDF19 \u0642\u0645\u0631\u064A" : "\u2600\uFE0F \u0634\u0645\u0633\u064A", isCorrect: false },
      ]),
    });

    return qs;
  }, [currentLetter, allLetters]);

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
    [isAnswered, question, currentQ, correctCount, totalScore, streak, onScoreUpdate, onComplete]
  );

  const playLetterSound = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentLetter.letter);
      utterance.lang = "ar-SA";
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="container-custom py-6 md:py-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <ProgressBar current={currentQ + 1} total={TOTAL_QUESTIONS} color="bg-green-500" />
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
          <div className="text-center mb-8">
            {question.displayLetter && (
              <motion.div
                className="mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <button onClick={playLetterSound} className="group relative inline-block">
                  <span className="text-7xl md:text-8xl font-bold font-arabic text-green-600">
                    {question.displayLetter}
                  </span>
                  <Volume2 className="w-5 h-5 text-gray-400 group-hover:text-green-500 absolute -top-1 -right-6 transition-colors" />
                </button>
              </motion.div>
            )}

            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {question.prompt}
            </h2>
          </div>

          <div className="grid gap-3 grid-cols-2">
            {question.options.map((option, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrectOption = option.isCorrect;
              const showResult = isAnswered;

              let bgClass = "bg-white border-gray-200 hover:border-green-400 hover:shadow-md";
              if (showResult && isCorrectOption) {
                bgClass = "bg-green-50 border-green-500 shadow-lg shadow-green-100";
              } else if (showResult && isSelected && !isCorrectOption) {
                bgClass = "bg-red-50 border-red-400 shadow-lg shadow-red-100";
              } else if (isSelected) {
                bgClass = "bg-green-50 border-green-400";
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
                    className={`text-xl md:text-2xl font-bold ${
                      option.text.length <= 2 ? "font-arabic text-3xl" : ""
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
