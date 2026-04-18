"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { arabicLetters } from "@/config/games";
import GameHeader from "../shared/GameHeader";
import LevelComplete from "../shared/LevelComplete";
import ScorePopup from "../shared/ScorePopup";
import ProgressBar from "../shared/ProgressBar";
import LevelSelector from "./LevelSelector";
import LetterLearn from "./LetterLearn";
import LetterQuiz from "./LetterQuiz";

type GamePhase = "select" | "learn" | "quiz" | "complete";

interface QuizResult {
  score: number;
  maxScore: number;
  correct: number;
  total: number;
  stars: number;
}

export default function ArabicLettersGame() {
  const t = useTranslations("games");
  const [phase, setPhase] = useState<GamePhase>("select");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [scorePopup, setScorePopup] = useState({ show: false, score: 0, type: "correct" as "correct" | "wrong" | "bonus" });

  const currentLetter = arabicLetters[currentLevel];

  const handleSelectLevel = useCallback((level: number) => {
    setCurrentLevel(level);
    setScore(0);
    setPhase("learn");
  }, []);

  const handleStartQuiz = useCallback(() => {
    setPhase("quiz");
  }, []);

  const handleScoreUpdate = useCallback((points: number, isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + points);
      setScorePopup({ show: true, score: points, type: "correct" });
    } else {
      setScorePopup({ show: true, score: 0, type: "wrong" });
    }
    setTimeout(() => setScorePopup((prev) => ({ ...prev, show: false })), 1000);
  }, []);

  const handleQuizComplete = useCallback((result: QuizResult) => {
    setQuizResult(result);
    setScore(result.score);
    if (result.stars >= 1) {
      setCompletedLevels((prev) => new Set([...prev, currentLevel]));
    }
    setPhase("complete");
  }, [currentLevel]);

  const handleNextLevel = useCallback(() => {
    if (currentLevel < arabicLetters.length - 1) {
      setCurrentLevel((prev) => prev + 1);
      setScore(0);
      setQuizResult(null);
      setPhase("learn");
    } else {
      setPhase("select");
    }
  }, [currentLevel]);

  const handleRetry = useCallback(() => {
    setScore(0);
    setQuizResult(null);
    setPhase("learn");
  }, []);

  const handleHome = useCallback(() => {
    setPhase("select");
    setQuizResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50">
      {phase !== "select" && (
        <GameHeader
          title={t("arabic-letters.title")}
          subtitle={currentLetter ? `${currentLetter.name} - ${currentLetter.nameEn}` : ""}
          currentLevel={currentLevel + 1}
          totalLevels={arabicLetters.length}
          score={score}
          showBack={true}
          backHref="/games"
        />
      )}

      <ScorePopup show={scorePopup.show} score={scorePopup.score} type={scorePopup.type} />

      <AnimatePresence mode="wait">
        {phase === "select" && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LevelSelector
              levels={arabicLetters}
              completedLevels={completedLevels}
              onSelectLevel={handleSelectLevel}
            />
          </motion.div>
        )}

        {phase === "learn" && currentLetter && (
          <motion.div key="learn" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <LetterLearn letter={currentLetter} onStartQuiz={handleStartQuiz} />
          </motion.div>
        )}

        {phase === "quiz" && currentLetter && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <LetterQuiz
              currentLetter={currentLetter}
              allLetters={arabicLetters}
              onScoreUpdate={handleScoreUpdate}
              onComplete={handleQuizComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "complete" && quizResult && (
        <LevelComplete
          score={quizResult.score}
          maxScore={quizResult.maxScore}
          starsEarned={quizResult.stars}
          correctAnswers={quizResult.correct}
          totalQuestions={quizResult.total}
          onNextLevel={handleNextLevel}
          onRetry={handleRetry}
          onHome={handleHome}
        />
      )}
    </div>
  );
}
