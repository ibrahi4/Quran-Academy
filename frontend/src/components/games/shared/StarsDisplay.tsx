"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface StarsDisplayProps {
  earned: number;
  total?: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export default function StarsDisplay({
  earned,
  total = 3,
  size = "md",
  animated = true,
}: StarsDisplayProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={animated ? { scale: 0, rotate: -180 } : {}}
          animate={animated ? { scale: 1, rotate: 0 } : {}}
          transition={{
            delay: i * 0.2,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <Star
            className={`${sizes[size]} transition-all duration-300 ${
              i < earned
                ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]"
                : "text-gray-300"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}
