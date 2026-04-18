import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  titleClassName?: string;
  light?: boolean;
}

export default function SectionHeader({
  title,
  subtitle,
  centered = true,
  className = "",
  titleClassName = "",
  light = false,
}: SectionHeaderProps) {
  return (
    <div className={`${centered ? "text-center" : ""} mb-12 md:mb-16 ${className}`}>
      {/* Top Decorative Element */}
      <div className={`flex items-center gap-3 mb-4 ${centered ? "justify-center" : ""}`}>
        <span className="h-[2px] w-8 bg-accent rounded-full" />
        <span className="h-[2px] w-3 bg-accent/50 rounded-full" />
      </div>

      {/* Title */}
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight ${
          light ? "text-white" : "text-gray-900"
        } ${titleClassName}`}
      >
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          className={`mt-4 text-lg md:text-xl max-w-2xl ${
            centered ? "mx-auto" : ""
          } ${light ? "text-white/80" : "text-gray-600"}`}
        >
          {subtitle}
        </p>
      )}

      {/* Bottom Decorative Line */}
      <div className={`flex items-center gap-2 mt-6 ${centered ? "justify-center" : ""}`}>
        <span className="h-[3px] w-12 bg-accent rounded-full" />
        <span className="h-[3px] w-3 bg-primary/30 rounded-full" />
        <span className="h-[3px] w-3 bg-primary/20 rounded-full" />
      </div>
    </div>
  );
}
