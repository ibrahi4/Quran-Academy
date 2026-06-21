"use client";

import { useEffect, useState, useRef } from "react";
import { Users, Clock, Globe, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "@/components/shared/Container";
import { useTranslations } from "next-intl";

const statConfigs = [
  { icon: Users, value: 500, suffix: "+" },
  { icon: Clock, value: 10, suffix: "+" },
  { icon: Globe, value: 15, suffix: "+" },
  { icon: Star, value: 4.9, suffix: "/5", isDecimal: true },
];

function AnimatedCounter({
  target,
  suffix,
  isDecimal = false,
  isInView,
}: {
  target: number;
  suffix: string;
  isDecimal?: boolean;
  isInView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;

      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, target, isDecimal]);

  return (
    <span>
      {isDecimal ? count.toFixed(1) : count}
      {suffix}
    </span>
  );
}

export default function TrustBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const t = useTranslations("trustBar");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative -mt-8 z-20 pb-8 pt-15">
      <Container>
        <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(139,111,71,0.2)] border border-[#E8DFD0] p-6 md:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {statConfigs.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 hover:bg-[#FDFBF7]",
                  index < statConfigs.length - 1 &&
                    "lg:border-r lg:border-[#E8DFD0] rtl:lg:border-r-0 rtl:lg:border-l rtl:lg:border-[#E8DFD0]"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-[#F4EBD9] flex items-center justify-center mb-3">
                  <stat.icon className="w-5 h-5 text-[#8B6F47]" />
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-[#8B6F47] tracking-tight">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    isDecimal={stat.isDecimal}
                    isInView={isInView}
                  />
                </h3>

                <p className="text-sm font-semibold text-[#2C2418] mt-1">
                  {t(`stats.${index}.label`)}
                </p>

                <p className="text-xs text-[#9C8A6E] mt-0.5">
                  {t(`stats.${index}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}