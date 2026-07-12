"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/hooks/useLocale";
import { Manrope } from "next/font/google";


interface LogoProps {
  className?: string;
  light?: boolean;
}
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export default function Logo({ className = "", light = false }: LogoProps) {
  const { isRTL } = useLocale();

  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <div className="relative w-18 h-18 pb-2 rounded- flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden">
          <Image
            src="/Tajwedo-Public-Assets/logo.png"
            alt="Tajwedo Academy"
            width={100}
            height={100}
            className="object-contain"
            priority
          />
        </div>
        {/* Accent dot */}
      </div>

      {/* Brand Text */}
      <div className={`flex flex-col leading-none ${manrope.className}`}>
        <h1
          className={`text-[25px] font-extrabold tracking-[-0.05em] ${
            light ? "text-white" : "text-[#163A32]"
          }`}
        >
          <span className={light ? "text-[#E8C56A]" : "text-[#C89B3C]"}>T</span>
          ajwed<span className={light ? "text-[#E8C56A]" : "text-[#C89B3C]"}>o</span>
        </h1>
 
        <span
          className={`mt-1 pl-1 text-[11px] font-semibold tracking-[0.55em] ${
            light ? "text-white/70" : "text-[#B78A2A]"
          }`}
        >
          ACADEMY
        </span>
      </div>
    </Link>
  );
}