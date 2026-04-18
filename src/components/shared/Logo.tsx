import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className = "", light = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      <div className="relative">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
            light
              ? "bg-white/10 border border-white/20"
              : "bg-primary/10 border border-primary/20"
          }`}
        >
          <span
            className={`text-xl font-bold ${
              light ? "text-white" : "text-primary"
            }`}
            style={{ fontFamily: "var(--font-arabic, serif)" }}
          >
            ق
          </span>
        </div>
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white" />
      </div>

      <div className="flex flex-col">
        <span
          className={`text-lg font-bold leading-tight tracking-tight transition-colors ${
            light ? "text-white" : "text-gray-900"
          }`}
        >
          Ibrahim
        </span>
        <span
          className={`text-xs font-medium tracking-wider uppercase ${
            light ? "text-white/70" : "text-accent"
          }`}
        >
          Abdelnasser
        </span>
      </div>
    </Link>
  );
}
