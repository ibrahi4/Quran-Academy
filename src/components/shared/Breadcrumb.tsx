"use client";

import { Link } from "@/i18n/navigation";
import { ChevronRight, ChevronLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/hooks/useLocale";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  const { isRTL } = useLocale();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-2 text-sm", className)}
    >
      <Link
        href="/"
        className="text-gray-400 hover:text-primary transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Chevron className="w-3.5 h-3.5 text-gray-300" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-gray-400 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
