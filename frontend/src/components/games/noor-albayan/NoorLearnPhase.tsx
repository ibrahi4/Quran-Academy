"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Play,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Ear,
  Repeat,
  Sparkles,
  BookOpen,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useArabicAudio from "@/hooks/useArabicAudio";
import type { NoorAlBayanLevel, NoorAlBayanItem } from "@/config/noorAlBayan";

interface NoorLearnPhaseProps {
  level: NoorAlBayanLevel;
  onStartQuiz: () => void;
}

export default function NoorLearnPhase({ level, onStartQuiz }: NoorLearnPhaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedItems, setLearnedItems] = useState<Set<number>>(new Set());
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [direction, setDirection] = useState(0);
  const { speak, stop, isPlaying } = useArabicAudio();

  const currentItem: NoorAlBayanItem = level.items[currentIndex];
  const allLearned = learnedItems.size >= Math.min(level.items.length, 6);

  const playCurrentItem = useCallback(() => {
    speak(currentItem.text, true);
    setLearnedItems((prev) => new Set([...prev, currentIndex]));
  }, [currentItem.text, currentIndex, speak]);

  const goNext = useCallback(() => {
    if (currentIndex < level.items.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, level.items.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const playAll = useCallback(() => {
    let i = 0;
    const playNext = () => {
      if (i < level.items.length) {
        setCurrentIndex(i);
        setLearnedItems((prev) => new Set([...prev, i]));
        speak(level.items[i].text, true);
        i++;
        setTimeout(playNext, 2500);
      }
    };
    playNext();
  }, [level.items, speak]);

  const isWordOrSentence = level.stage === "words" || level.stage === "sentences";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-xl mx-auto px-4 py-8 md:py-12">
        {/* Level Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6"
        >
          <div
            className="h-2"
            style={{
              background: `linear-gradient(90deg, ${level.color}, ${level.color}88)`,
            }}
          />
          <div className="p-6 text-center">
            <span className="text-4xl mb-2 block">{level.icon}</span>
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              {level.title}
            </h2>
            <p className="text-sm text-gray-400">{level.titleEn}</p>
            <p className="text-sm text-gray-500 mt-2">
              {level.description}
            </p>
          </div>
        </motion.div>

        {/* Main Learning Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6"
        >
          {/* Progress indicator */}
          <div className="flex items-center gap-1 px-4 pt-4">
            {level.items.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "bg-orange-500"
                    : learnedItems.has(i)
                      ? "bg-green-400"
                      : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Item Display */}
          <div className="p-8 md:p-10">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction >= 0 ? 80 : -80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction >= 0 ? -80 : 80 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Arabic Text */}
                <button
                  onClick={playCurrentItem}
                  className="group relative inline-block mb-4 cursor-pointer"
                >
                  <span
                    className={`font-arabic font-bold leading-none text-gray-900 block ${
                      isWordOrSentence
                        ? "text-4xl md:text-5xl"
                        : "text-7xl md:text-9xl"
                    }`}
                    style={{ color: level.color }}
                  >
                    {currentItem.text}
                  </span>
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Volume2
                      className={`w-5 h-5 ${
                        isPlaying
                          ? "text-orange-500 animate-pulse"
                          : "text-gray-300 group-hover:text-orange-400"
                      } transition-colors`}
                    />
                  </motion.div>
                </button>

                {/* Transliteration */}
                {showTransliteration && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg text-gray-500 font-semibold mb-2"
                  >
                    {currentItem.transliteration}
                  </motion.p>
                )}

                {/* Meaning (for words & sentences) */}
                {currentItem.meaning && (
                  <div className="mt-3 bg-orange-50 rounded-2xl px-4 py-3 inline-block">
                    <p className="text-sm font-bold text-orange-700">
                      {currentItem.meaning}
                    </p>
                    {currentItem.meaningEn && (
                      <p className="text-xs text-orange-500">
                        {currentItem.meaningEn}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="px-6 pb-6 flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className={`p-3 rounded-2xl transition-all ${
                currentIndex === 0
                  ? "text-gray-300 bg-gray-50"
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95"
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { isPlaying ? stop() : playCurrentItem(); }}
                className={`p-4 rounded-2xl font-bold transition-all active:scale-95 ${
                  isPlaying
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                    : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={() => setShowTransliteration(!showTransliteration)}
                className={`p-3 rounded-2xl transition-all active:scale-95 ${
                  showTransliteration
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Ear className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={goNext}
              disabled={currentIndex === level.items.length - 1}
              className={`p-3 rounded-2xl transition-all ${
                currentIndex === level.items.length - 1
                  ? "text-gray-300 bg-gray-50"
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95"
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </motion.div>

        {/* Quick Grid - All Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-center text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            <BookOpen className="w-4 h-4 inline me-1" />
            All Items
          </h3>
          <div
            className={`grid gap-2 ${
              isWordOrSentence
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-4 sm:grid-cols-6"
            }`}
          >
            {level.items.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  setCurrentIndex(i);
                  speak(item.text, true);
                  setLearnedItems((prev) => new Set([...prev, i]));
                }}
                className={`relative rounded-xl p-3 text-center border-2 transition-all active:scale-95 ${
                  i === currentIndex
                    ? "border-orange-400 bg-orange-50 shadow-md"
                    : learnedItems.has(i)
                      ? "border-green-300 bg-green-50"
                      : "border-gray-100 bg-white hover:border-orange-200"
                }`}
              >
                <span
                  className={`font-arabic font-bold block ${
                    isWordOrSentence ? "text-lg" : "text-2xl"
                  }`}
                  style={{ color: i === currentIndex ? level.color : undefined }}
                >
                  {item.text}
                </span>
                {showTransliteration && (
                  <span className="text-[10px] text-gray-400 block">
                    {item.transliteration}
                  </span>
                )}
                {learnedItems.has(i) && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px]">✓</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Play All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={playAll}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl py-3 font-semibold transition-all active:scale-[0.99]"
          >
            <Repeat className="w-5 h-5" />
            Listen to All
          </button>
        </motion.div>

        {/* Start Quiz CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center pb-6"
        >
          <Button
            onClick={onStartQuiz}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white rounded-2xl py-7 text-xl font-bold shadow-xl shadow-orange-200 transition-all hover:scale-[1.02] active:scale-[0.99]"
          >
            <Sparkles className="w-6 h-6 me-2" />
            Start Quiz
            <ArrowRight className="w-6 h-6 ms-2" />
          </Button>
          {!allLearned && (
            <p className="text-xs text-gray-400 mt-2">
              Tip: Listen to at least 6 items before taking the quiz!
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
