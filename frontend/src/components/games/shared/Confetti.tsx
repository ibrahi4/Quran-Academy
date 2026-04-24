"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import { motion } from "framer-motion";

const COLORS: string[] = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#F8C471", "#82E0AA",
  "#BB8FCE", "#85C1E9", "#FF9FF3", "#54A0FF",
];

type Intensity = "light" | "medium" | "heavy";

interface ConfettiProps {
  intensity?: Intensity;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const counts: Record<Intensity, number> = {
  light: 30,
  medium: 50,
  heavy: 80,
};

function subscribe(callback: () => void): () => void {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getWindowHeight(): number {
  return window.innerHeight;
}

function getServerHeight(): number {
  return 1000;
}

export default function Confetti({ intensity = "medium" }: ConfettiProps) {
  const count: number = counts[intensity];

  const windowHeight = useSyncExternalStore(
    subscribe,
    getWindowHeight,
    getServerHeight
  );

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_: unknown, i: number) => {
      const size: number = 6 + seededRandom(i * 10 + 2) * 10;
      return {
        color: COLORS[i % COLORS.length],
        startX: seededRandom(i * 10 + 3) * 100,
        delay: seededRandom(i * 10 + 4) * 0.8,
        duration: 2 + seededRandom(i * 10 + 5) * 3,
        size: size,
        rotation: seededRandom(i * 10 + 6) * 720 - 360,
        isCircle: seededRandom(i * 10 + 7) > 0.5,
        xMove1: (seededRandom(i * 10 + 8) - 0.5) * 300,
        xMove2: (seededRandom(i * 10 + 9) - 0.5) * 200,
      };
    });
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {particles.map((p, i: number) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${p.startX}%`,
            top: -30,
            width: p.size,
            height: p.isCircle ? p.size : p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
          }}
          initial={{ y: -30, rotate: 0, opacity: 1 }}
          animate={{
            y: [0, windowHeight + 100],
            rotate: [0, p.rotation],
            opacity: [1, 1, 1, 0],
            x: [0, p.xMove1, p.xMove2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
}