import { cn } from "@/lib/utils";

interface GeometricDividerProps {
  className?: string;
  variant?: "default" | "gold" | "light";
}

export default function GeometricDivider({
  className,
  variant = "default",
}: GeometricDividerProps) {
  const colors = {
    default: "text-primary/10",
    gold: "text-accent/30",
    light: "text-white/10",
  };

  return (
    <div
      className={cn("flex items-center justify-center py-4", className)}
    >
      <svg
        width="200"
        height="20"
        viewBox="0 0 200 20"
        className={cn(colors[variant])}
      >
        {/* Left Line */}
        <line
          x1="0"
          y1="10"
          x2="70"
          y2="10"
          stroke="currentColor"
          strokeWidth="1"
        />
        {/* Center Diamond */}
        <polygon
          points="100,2 108,10 100,18 92,10"
          fill="currentColor"
        />
        {/* Inner Diamond */}
        <polygon
          points="100,5 105,10 100,15 95,10"
          fill="currentColor"
          opacity="0.5"
        />
        {/* Right Line */}
        <line
          x1="130"
          y1="10"
          x2="200"
          y2="10"
          stroke="currentColor"
          strokeWidth="1"
        />
        {/* Small Dots */}
        <circle cx="75" cy="10" r="2" fill="currentColor" />
        <circle cx="125" cy="10" r="2" fill="currentColor" />
      </svg>
    </div>
  );
}