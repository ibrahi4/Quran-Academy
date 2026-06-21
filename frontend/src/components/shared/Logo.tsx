"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className = "", light = false }: LogoProps) {
  const { isRTL } = useLocale();

  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <div
          className={`relative w-11 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden ${
            light
              ? "bg-white/10 border border-white/20 backdrop-blur-sm"
              : "bg-primary/5 border border-primary/15"
          }`}
        >
          <Image
            src="/Quranic-Public-Assets/logo.png"
            alt="Quranic Academy"
            width={88}
            height={88}
            className=" "
            priority
          />
        </div>
        {/* Accent dot */}
   
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <span
          className={`text-lg font-bold tracking-tight transition-colors ${
            light ? "text-white" : "text-gray-900"
          }`}
        >
          Quranic
        </span>
        <span
          className={`text-[11px] font-semibold tracking-[0.15em] uppercase mt-0.5 ${
            light ? "text-white/70" : "text-accent"
          }`}
        >
          Academy
        </span>
      </div>
    </Link>
  );
}