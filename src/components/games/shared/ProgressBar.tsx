"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
  showLabel?: boolean;
  height?: "sm" | "md" | "lg";
}

export default function ProgressBar({
  current,
  total,
  color = "bg-primary",
  showLabel = true,
  height = "md",
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  const heights = {
    sm: "h-1.5",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">
            {current} / {total}
          </span>
          <span className="text-xs font-bold text-gray-600">
            {percentage}%
          </span>
        </div>
      )}
      <div className={`${heights[height]} bg-gray-100 rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
