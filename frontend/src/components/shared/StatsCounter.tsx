"use client";

import { useEffect, useState } from "react";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";

interface StatsCounterProps {
  end: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  light?: boolean;
}

export default function StatsCounter({
  end,
  label,
  icon,
  className,
  light = false,
}: StatsCounterProps) {
  const { ref, isInView } = useIntersectionObserver({ threshold: 0.3 });
  const [count, setCount] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const numericPart = end.replace(/[^0-9.]/g, "");
    const suffix = end.replace(/[0-9.]/g, "");
    const target = parseFloat(numericPart);
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;

      if (step >= steps) {
        setCount(`${numericPart}${suffix}`);
        clearInterval(timer);
      } else {
        const displayNum =
          target >= 100
            ? Math.floor(current).toString()
            : current.toFixed(1);
        setCount(`${displayNum}${suffix}`);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center text-center p-4",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-3 p-2.5 rounded-xl",
            light ? "bg-white/10" : "bg-primary/10"
          )}
        >
          {icon}
        </div>
      )}
      <span
        className={cn(
          "text-3xl md:text-4xl font-bold tracking-tight",
          light ? "text-white" : "text-primary"
        )}
      >
        {count}
      </span>
      <span
        className={cn(
          "text-sm font-medium mt-1",
          light ? "text-white/70" : "text-gray-500"
        )}
      >
        {label}
      </span>
    </div>
  );
}