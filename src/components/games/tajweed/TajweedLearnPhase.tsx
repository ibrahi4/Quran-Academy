"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Play,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Pause,
  Info,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useArabicAudio from "@/hooks/useArabicAudio";
import type { TajweedRule, TajweedExample } from "@/config/tajweed";

interface TajweedLearnPhaseProps {
  rule: TajweedRule;
  onStartQuiz: () => void;
}

export default function TajweedLearnPhase({ rule, onStartQuiz }: TajweedLearnPhaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedExamples, setViewedExamples] = useState<Set<number>>(new Set([0]));
  const [direction, setDirection] = useState(0);
  const [showExplanation, setShowExplanation] = useState(true);
  const { speak, stop, isPlaying } = useArabicAudio();

  const currentExample: TajweedExample = rule.examples[currentIndex];

  const playExample = useCallback(() => {
    speak(currentExample.text, true);
    setViewedExamples((prev) => new Set([...prev, currentIndex]));
  }, [currentExample.text, currentIndex, speak]);

  const goNext = useCallback(() => {
    if (currentIndex < rule.examples.length - 1) {
      setDirection(1);
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setViewedExamples((prev) => new Set([...prev, next]));
    }
  }, [currentIndex, rule.examples.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-xl mx-auto px-4 py-8 md:py-12">

        {/* Rule Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6"
        >
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${rule.color}, ${rule.color}88)` }} />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: rule.color + "15" }}>
                {rule.icon}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 font-arabic">{rule.name}</h2>
                <p className="text-sm text-gray-400">{rule.nameEn}</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-arabic leading-relaxed font-semibold">{rule.description}</p>
                  <p className="text-xs text-blue-500 mt-1">{rule.descriptionEn}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Example Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6"
        >
          {/* Progress dots */}
          <div className="flex items-center gap-1 px-4 pt-4">
            {rule.examples.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "bg-blue-500" : viewedExamples.has(i) ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

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
                {/* Surah Reference */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600">
                    <BookOpen className="w-3 h-3" />
                    {currentExample.surah} - Ayah {currentExample.ayah}
                  </span>
                </div>

                {/* Arabic Text with color highlight */}
                <button onClick={playExample} className="group relative inline-block mb-4 cursor-pointer">
                  <span className="text-4xl md:text-5xl font-bold font-arabic leading-relaxed text-gray-900 block font-quran">
                    {currentExample.text}
                  </span>
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Volume2 className={`w-5 h-5 ${isPlaying ? "text-blue-500 animate-pulse" : "text-gray-300 group-hover:text-blue-400"} transition-colors`} />
                  </motion.div>
                </button>

                {/* Rule Color Tag */}
                <div className="mb-4">
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: rule.color }}
                  >
                    {rule.icon} {rule.name}
                  </span>
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-4 mt-3"
                    style={{ backgroundColor: rule.color + "10", borderColor: rule.color + "30", borderWidth: 1 }}
                  >
                    <p className="text-sm font-bold font-arabic" style={{ color: rule.color }}>{currentExample.explanation}</p>
                    <p className="text-xs text-gray-500 mt-1">{currentExample.explanationEn}</p>
                  </motion.div>
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
                currentIndex === 0 ? "text-gray-300 bg-gray-50" : "text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95"
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { isPlaying ? stop() : playExample(); }}
                className={`p-4 rounded-2xl font-bold transition-all active:scale-95 ${
                  isPlaying ? "bg-blue-500 text-white shadow-lg shadow-blue-200" : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className={`p-3 rounded-2xl transition-all active:scale-95 ${
                  showExplanation ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400"
                }`}
              >
                <Info className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={goNext}
              disabled={currentIndex === rule.examples.length - 1}
              className={`p-3 rounded-2xl transition-all ${
                currentIndex === rule.examples.length - 1 ? "text-gray-300 bg-gray-50" : "text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95"
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </motion.div>

        {/* All Examples Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <h3 className="text-center text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            <BookOpen className="w-4 h-4 inline me-1" />
            All Examples
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {rule.examples.map((example, i) => (
              <motion.button
                key={example.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setCurrentIndex(i);
                  speak(example.text, true);
                  setViewedExamples((prev) => new Set([...prev, i]));
                }}
                className={`relative rounded-xl p-4 text-start border-2 transition-all active:scale-[0.99] ${
                  i === currentIndex
                    ? "border-blue-400 bg-blue-50 shadow-md"
                    : viewedExamples.has(i)
                      ? "border-green-300 bg-green-50"
                      : "border-gray-100 bg-white hover:border-blue-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: rule.color + "15" }}>
                    <Volume2 className="w-5 h-5" style={{ color: rule.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xl font-arabic font-bold text-gray-800 block font-quran">{example.text}</span>
                    <span className="text-xs text-gray-400">{example.surah} - {example.surahEn}</span>
                  </div>
                  {viewedExamples.has(i) && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-[9px]">&#10003;</span>
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Start Quiz CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center pb-6">
          <Button
            onClick={onStartQuiz}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white rounded-2xl py-7 text-xl font-bold shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.99]"
          >
            <Sparkles className="w-6 h-6 me-2" />
            Start Quiz
            <ArrowRight className="w-6 h-6 ms-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
