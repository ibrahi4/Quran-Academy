import { cn } from "@/lib/utils";

interface IslamicPatternProps {
  className?: string;
  opacity?: number;
  color?: string;
}

export default function IslamicPattern({
  className,
  opacity = 0.03,
  color = "#0D4F4F",
}: IslamicPatternProps) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ opacity }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="islamic-star"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* 8-pointed star pattern */}
            <polygon
              points="40,8 46,26 64,20 50,34 64,48 46,42 40,60 34,42 16,48 30,34 16,20 34,26"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
            />
            {/* Inner octagon */}
            <polygon
              points="40,20 48,28 48,40 40,48 32,40 32,28"
              fill="none"
              stroke={color}
              strokeWidth="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-star)" />
      </svg>
    </div>
  );
}