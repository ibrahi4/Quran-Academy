"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { noorAlBayanLevels } from "@/config/noorAlBayan";
import type { NoorAlBayanLevel } from "@/config/noorAlBayan";
import GameHeader from "../shared/GameHeader";
import LevelComplete from "../shared/LevelComplete";
import ScorePopup from "../shared/ScorePopup";
import NoorLevelSelector from "./NoorLevelSelector";
import NoorLearnPhase from "./NoorLearnPhase";
import NoorQuizPhase from "./NoorQuizPhase";

type GamePhase = "select" | "learn" | "quiz" | "complete";

interface QuizResult {
  score: number;
  maxScore: number;
  correct: number;
  total: number;
  stars: number;
}

export default function NoorAlBayanGame() {
  const t = useTranslations("games");
  const [phase, setPhase] = useState<GamePhase>("select");
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [scorePopup, setScorePopup] = useState({
    show: false,
    score: 0,
    type: "correct" as "correct" | "wrong" | "bonus",
  });

  const currentLevel: NoorAlBayanLevel = noorAlBayanLevels[currentLevelIndex];

  const handleSelectLevel = useCallback((index: number) => {
    setCurrentLevelIndex(index);
    setScore(0);
    setPhase("learn");
  }, []);

  const handleStartQuiz = useCallback(() => {
    setPhase("quiz");
  }, []);

  const handleScoreUpdate = useCallback(
    (points: number, isCorrect: boolean) => {
      if (isCorrect) {
        setScore((prev) => prev + points);
        setScorePopup({ show: true, score: points, type: "correct" });
      } else {
        setScorePopup({ show: true, score: 0, type: "wrong" });
      }
      setTimeout(
        () => setScorePopup((prev) => ({ ...prev, show: false })),
        1000
      );
    },
    []
  );

  const handleQuizComplete = useCallback(
    (result: QuizResult) => {
      setQuizResult(result);
      setScore(result.score);
      if (result.stars >= 1) {
        setCompletedLevels((prev) => new Set([...prev, currentLevelIndex]));
      }
      setPhase("complete");
    },
    [currentLevelIndex]
  );

  const handleNextLevel = useCallback(() => {
    if (currentLevelIndex < noorAlBayanLevels.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
      setScore(0);
      setQuizResult(null);
      setPhase("learn");
    } else {
      setPhase("select");
    }
  }, [currentLevelIndex]);

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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50">
      {phase !== "select" && (
        <GameHeader
          title={t("noor-albayan.title")}
          subtitle={currentLevel ? `${currentLevel.title} - ${currentLevel.titleEn}` : ""}
          currentLevel={currentLevelIndex + 1}
          totalLevels={noorAlBayanLevels.length}
          score={score}
          showBack={true}
          backHref="/games"
        />
      )}

      <ScorePopup
        show={scorePopup.show}
        score={scorePopup.score}
        type={scorePopup.type}
      />

      <AnimatePresence mode="wait">
        {phase === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <NoorLevelSelector
              levels={noorAlBayanLevels}
              completedLevels={completedLevels}
              onSelectLevel={handleSelectLevel}
            />
          </motion.div>
        )}

        {phase === "learn" && currentLevel && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <NoorLearnPhase
              level={currentLevel}
              onStartQuiz={handleStartQuiz}
            />
          </motion.div>
        )}

        {phase === "quiz" && currentLevel && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <NoorQuizPhase
              level={currentLevel}
              allLevels={noorAlBayanLevels}
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
