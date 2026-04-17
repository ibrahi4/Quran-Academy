import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className, light = false }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-3 group", className)}>
      {/* Logo Icon - Islamic Geometric Star */}
      <div className="relative">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105",
            light
              ? "bg-white/10 border border-white/20"
              : "bg-primary/10 border border-primary/20"
          )}
        >
          {/* Arabic Letter ق (Qaf) for Quran */}
          <span
            className={cn(
              "text-xl font-bold font-arabic",
              light ? "text-white" : "text-primary"
            )}
          >
            ق
          </span>
        </div>
        {/* Gold Accent Dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-sand-50" />
      </div>

      {/* Logo Text */}
      <div className="flex flex-col">
        <span
          className={cn(
            "text-lg font-bold leading-tight tracking-tight transition-colors",
            light ? "text-white" : "text-gray-900"
          )}
        >
          Ibrahim
        </span>
        <span
          className={cn(
            "text-xs font-medium tracking-wider uppercase",
            light ? "text-white/70" : "text-accent"
          )}
        >
          Abdelnasser
        </span>
      </div>
    </Link>
  );
}