"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, Check, X, ChevronDown, Globe, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COUNTRIES_PRIORITIZED,
  searchCountries,
  findCountryByName,
  type CountryItem,
} from "./countries-data";

interface CountrySelectProps {
  value: string;
  onChange: (countryName: string, country?: CountryItem) => void;
  placeholder?: string;
  isRTL?: boolean;
  disabled?: boolean;
  error?: string;
}

export default function CountrySelect({
  value,
  onChange,
  placeholder = "Select your country",
  isRTL = false,
  disabled = false,
  error,
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedCountry = useMemo(() => findCountryByName(value), [value]);
  const results = useMemo(() => searchCountries(query), [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        listRef.current &&
        !listRef.current.contains(target)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus input on open + reset highlight
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      setHighlightedIdx(0);
    }
  }, [open]);

  // Reset highlight when query changes
  useEffect(() => {
    setHighlightedIdx(0);
  }, [query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(
      `[data-idx="${highlightedIdx}"]`,
    ) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlightedIdx, open]);

  const handleSelect = useCallback(
    (country: CountryItem) => {
      onChange(country.name, country);
      setOpen(false);
      setQuery("");
    },
    [onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[highlightedIdx]) handleSelect(results[highlightedIdx]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  return (
    <div className="relative w-full">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "w-full px-4 py-3.5 rounded-xl border bg-sand-50 text-left flex items-center gap-3 transition-all",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          disabled && "opacity-60 cursor-not-allowed",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : open
              ? "border-primary/40 ring-2 ring-primary/20"
              : "border-sand-200 hover:border-sand-300",
        )}
      >
        {selectedCountry ? (
          <>
            <span className="text-2xl leading-none shrink-0">
              {selectedCountry.flag}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedCountry.name}
              </p>
              {isRTL && selectedCountry.nameAr !== selectedCountry.name && (
                <p className="text-[11px] text-gray-500 truncate">
                  {selectedCountry.nameAr}
                </p>
              )}
            </div>
            <span className="text-xs text-gray-500 font-mono shrink-0">
              {selectedCountry.dialCode}
            </span>
          </>
        ) : (
          <>
            <Globe className="w-5 h-5 text-gray-400 shrink-0" />
            <span className="flex-1 text-sm text-gray-400 truncate">
              {placeholder}
            </span>
          </>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
              aria-label="Clear selection"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {error}
        </p>
      )}

      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          className={cn(
            "absolute z-50 mt-2 w-full bg-white rounded-2xl border border-sand-200 shadow-2xl overflow-hidden",
            "animate-in fade-in-0 slide-in-from-top-2 duration-150",
          )}
          role="listbox"
        >
          {/* Search Input */}
          <div className="p-3 border-b border-sand-100 bg-sand-50/50">
            <div className="relative">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none",
                  isRTL ? "right-3" : "left-3",
                )}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRTL
                    ? "\u0627\u0628\u062d\u062b \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0643\u0648\u062f..."
                    : "Search by name, code, or dial code..."
                }
                className={cn(
                  "w-full py-2.5 rounded-lg border border-sand-200 bg-white text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
                  isRTL ? "pr-9 pl-3" : "pl-9 pr-3",
                )}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded",
                    isRTL ? "left-2" : "right-2",
                  )}
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
            {query && (
              <p className="text-[11px] text-gray-500 mt-2">
                {results.length}{" "}
                {isRTL
                  ? `\u0646\u062a\u064a\u062c\u0629 \u0644\u0640 "${query}"`
                  : `result${results.length !== 1 ? "s" : ""} for "${query}"`}
              </p>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto">
            {results.length === 0 ? (
              <div className="p-8 text-center">
                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? "\u0644\u0645 \u0646\u062c\u062f \u0623\u064a \u0646\u062a\u064a\u062c\u0629" : "No countries found"}
                </p>
                <p className="text-xs text-gray-500">
                  {isRTL
                    ? "\u062c\u0631\u0628 \u0628\u062d\u062b \u0623\u062e\u0631 \u0623\u0648 \u0627\u0644\u0643\u0648\u062f \u0627\u0644\u062f\u0648\u0644\u064a"
                    : "Try a different search or country code"}
                </p>
              </div>
            ) : (
              <>
                {/* Priority section header */}
                {!query && (
                  <div className="px-4 py-2 bg-amber-50/50 border-b border-amber-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <span>\u2728</span>
                      {isRTL ? "\u0627\u0644\u062f\u0648\u0644 \u0627\u0644\u0639\u0631\u0628\u064a\u0629" : "Middle East & North Africa"}
                    </p>
                  </div>
                )}

                {results.map((country, idx) => {
                  const isSelected = selectedCountry?.code === country.code;
                  const isHighlighted = idx === highlightedIdx;
                  const isFirstNonPriority =
                    !query &&
                    idx > 0 &&
                    idx === results.findIndex(
                      (c) => !["EG", "SA", "AE", "QA", "KW", "BH", "OM", "JO", "LB", "PS", "SY", "IQ", "YE", "MA", "DZ", "TN", "LY", "SD"].includes(c.code),
                    );

                  return (
                    <div key={country.code}>
                      {isFirstNonPriority && (
                        <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            {isRTL ? "\u0628\u0627\u0642\u064a \u0627\u0644\u062f\u0648\u0644" : "All countries"}
                          </p>
                        </div>
                      )}
                      <button
                        type="button"
                        data-idx={idx}
                        onClick={() => handleSelect(country)}
                        onMouseEnter={() => setHighlightedIdx(idx)}
                        role="option"
                        aria-selected={isSelected}
                        className={cn(
                          "w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors",
                          isHighlighted && !isSelected && "bg-sand-100",
                          isSelected && "bg-primary/10",
                        )}
                      >
                        <span className="text-2xl leading-none shrink-0">
                          {country.flag}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm truncate",
                              isSelected
                                ? "font-bold text-primary"
                                : "font-medium text-gray-900",
                            )}
                          >
                            {country.name}
                          </p>
                          {country.nameNative !== country.name && (
                            <p className="text-[11px] text-gray-500 truncate">
                              {country.nameNative}
                            </p>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-xs font-mono shrink-0",
                            isSelected
                              ? "text-primary font-bold"
                              : "text-gray-500",
                          )}
                        >
                          {country.dialCode}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-sand-50 border-t border-sand-100 flex items-center justify-between text-[10px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white border border-sand-200 rounded font-mono">\u2191\u2193</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white border border-sand-200 rounded font-mono">\u21b5</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white border border-sand-200 rounded font-mono">Esc</kbd>
              <span>Close</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}