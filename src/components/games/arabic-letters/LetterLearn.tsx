"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Play, Eye, EyeOff, ArrowRight, Sun, Moon, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import useArabicAudio from "@/hooks/useArabicAudio";
import type { ArabicLetterFull } from "@/config/games";

interface LetterLearnProps {
  letter: ArabicLetterFull;
  onStartQuiz: () => void;
}

type TashkeelKey = "fatha" | "damma" | "kasra" | "sukun";

const TASHKEEL_CONFIG = [
  { key: "fatha" as TashkeelKey, label: "\u0641\u064E\u062A\u0652\u062D\u064E\u0629", labelEn: "Fatha", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", ring: "ring-rose-300", iconBg: "bg-rose-100" },
  { key: "damma" as TashkeelKey, label: "\u0636\u064F\u0645\u0651\u064E\u0629", labelEn: "Damma", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", ring: "ring-sky-300", iconBg: "bg-sky-100" },
  { key: "kasra" as TashkeelKey, label: "\u0643\u064E\u0633\u0652\u0631\u064E\u0629", labelEn: "Kasra", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", ring: "ring-emerald-300", iconBg: "bg-emerald-100" },
  { key: "sukun" as TashkeelKey, label: "\u0633\u064F\u0643\u064F\u0648\u0646", labelEn: "Sukun", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", ring: "ring-violet-300", iconBg: "bg-violet-100" },
];

export default function LetterLearn({ letter, onStartQuiz }: LetterLearnProps) {
  const [activeTashkeel, setActiveTashkeel] = useState<TashkeelKey | null>(null);
  const [showForms, setShowForms] = useState(false);
  const { speak, stop, isPlaying } = useArabicAudio();

  const playLetter = () => {
    setActiveTashkeel(null);
    speak(letter.letter, true);
  };

  const playTashkeel = (key: TashkeelKey) => {
    setActiveTashkeel(key);
    speak(letter.tashkeel[key], true);
    setTimeout(() => setActiveTashkeel(null), 2000);
  };

  const forms = [
    { label: "\u0645\u0641\u0631\u062F\u0629", labelEn: "Isolated", form: letter.letter },
    { label: "\u0623\u0648\u0644", labelEn: "Initial", form: letter.letter + "\u0640" },
    { label: "\u0648\u0633\u0637", labelEn: "Medial", form: "\u0640" + letter.letter + "\u0640" },
    { label: "\u0622\u062E\u0631", labelEn: "Final", form: "\u0640" + letter.letter },
  ];

  const GroupIcon = letter.group === "sun" ? Sun : Moon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-xl mx-auto px-4 py-8 md:py-12">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-primary via-secondary to-primary h-2" />

          <div className="p-8 md:p-10 text-center">
            <div
              className="relative w-44 h-44 md:w-56 md:h-56 mx-auto mb-6 cursor-pointer group"
              onClick={playLetter}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 animate-pulse" />
              <div className="absolute inset-2 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 border-4 border-white">
                <span className="text-white text-7xl md:text-8xl font-bold font-arabic leading-none select-none">
                  {activeTashkeel ? letter.tashkeel[activeTashkeel] : letter.letter}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-2.5 shadow-lg border border-gray-200 group-hover:scale-110 transition-transform">
                <Volume2 className={"w-5 h-5 " + (isPlaying ? "text-primary animate-pulse" : "text-gray-400 group-hover:text-primary")} />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-1">{letter.name}</h2>
            <p className="text-base text-gray-400 mb-4">{letter.nameEn}</p>

            <div className={"inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold " +
              (letter.group === "sun" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200")}>
              <GroupIcon className="w-4 h-4" />
              <span>{letter.group === "sun" ? "Sun Letter" : "Moon Letter"}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <button
            onClick={() => { isPlaying ? stop() : playLetter(); }}
            className={"w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 " +
              (isPlaying
                ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                : "bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:bg-primary/90")}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            <span>{isPlaying ? "Playing..." : "Listen to Letter"}</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-center text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            Tashkeel Forms
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {TASHKEEL_CONFIG.map((tc) => (
              <button
                key={tc.key}
                onClick={() => playTashkeel(tc.key)}
                className={"relative p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md active:scale-[0.98] " +
                  tc.bg + " " + tc.border + " " +
                  (activeTashkeel === tc.key ? "ring-4 " + tc.ring + " shadow-md" : "")}
              >
                <span className={"text-4xl md:text-5xl font-bold font-arabic block mb-2 " + tc.color}>
                  {letter.tashkeel[tc.key]}
                </span>
                <span className="text-sm font-bold text-gray-700 block">{tc.label}</span>
                <span className="text-xs text-gray-400">{tc.labelEn}</span>
                <div className={"absolute top-3 right-3 " + tc.iconBg + " rounded-full p-1.5"}>
                  <Volume2 className={"w-3 h-3 " + tc.color} />
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-center text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            Example Word
          </h3>
          <button
            onClick={() => speak(letter.example.word, true)}
            className="w-full bg-white border-2 border-gray-100 rounded-2xl p-6 text-center hover:border-primary/30 hover:shadow-lg transition-all duration-200 active:scale-[0.99] group"
          >
            <span className="text-5xl font-bold font-arabic text-primary block mb-2">{letter.example.word}</span>
            <span className="text-base font-semibold text-gray-700 block">{letter.example.meaning}</span>
            <span className="text-sm text-gray-400 block mb-3">{letter.example.meaningEn}</span>
            <div className="flex items-center justify-center gap-2 text-gray-400 group-hover:text-primary transition-colors">
              <Volume2 className="w-4 h-4" />
              <span className="text-xs font-semibold">Tap to listen</span>
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowForms(!showForms)}
            className="w-full flex items-center justify-center gap-2 py-3 text-primary font-semibold hover:text-secondary transition-colors"
          >
            {showForms ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showForms ? "Hide Letter Forms" : "Show Letter Forms"}</span>
          </button>

          <AnimatePresence>
            {showForms && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-4 gap-3 mt-3 overflow-hidden"
              >
                {forms.map((form, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => speak(form.form, true)}
                    className="bg-white rounded-2xl p-4 text-center border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.97]"
                  >
                    <span className="text-2xl md:text-3xl font-arabic font-bold text-gray-800 block mb-1">{form.form}</span>
                    <span className="text-[10px] text-gray-500 block">{form.label}</span>
                    <span className="text-[9px] text-gray-400">{form.labelEn}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center pb-6"
        >
          <Button
            onClick={onStartQuiz}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-2xl py-7 text-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.99]"
          >
            Start Quiz
            <ArrowRight className="w-6 h-6 ms-2" />
          </Button>
        </motion.div>

      </div>
    </div>
  );
}
