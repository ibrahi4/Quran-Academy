"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap } from "lucide-react";

interface ScorePopupProps {
  score: number;
  show: boolean;
  type?: "correct" | "wrong" | "bonus";
}

export default function ScorePopup({ score, show, type = "correct" }: ScorePopupProps) {
  const config = {
    correct: { color: "text-green-500", icon: Check, bg: "bg-green-100" },
    wrong: { color: "text-red-500", icon: X, bg: "bg-red-100" },
    bonus: { color: "text-yellow-500", icon: Zap, bg: "bg-yellow-100" },
  };

  const { color, icon: Icon, bg } = config[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -60, scale: 1 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.8 }}
          className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl ${bg}`}>
            <Icon className={`w-8 h-8 ${color}`} />
            <span className={`text-3xl md:text-4xl font-black ${color}`}>
              {type === "wrong" ? "" : `+${score}`}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}