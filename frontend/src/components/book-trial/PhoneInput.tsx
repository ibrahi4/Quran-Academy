"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, Check, ChevronDown, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AsYouType,
  parsePhoneNumberFromString,
  isValidPhoneNumber,
  type CountryCode,
} from "libphonenumber-js";
import {
  COUNTRIES_PRIORITIZED,
  searchCountries,
  findCountryByCode,
  findCountryByDialCode,
  type CountryItem,
} from "./countries-data";

interface PhoneInputProps {
  value: string;
  onChange: (e164: string, countryCode?: CountryCode, isValid?: boolean) => void;
  defaultCountryCode?: string;
  placeholder?: string;
  isRTL?: boolean;
  disabled?: boolean;
  showValidation?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  defaultCountryCode = "EG",
  placeholder,
  isRTL = false,
  disabled = false,
  showValidation = true,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<CountryCode>(
    (defaultCountryCode as CountryCode) || "EG",
  );
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const country = useMemo(
    () => findCountryByCode(selectedCode) || COUNTRIES_PRIORITIZED[0],
    [selectedCode],
  );

  /**
   * Parse the incoming `value` (E.164 format) to extract:
   * - which country it belongs to
   * - the national number (formatted nicely)
   */
  const { nationalNumber, isValid, isPossible } = useMemo(() => {
    if (!value || !value.trim()) {
      return { nationalNumber: "", isValid: false, isPossible: false };
    }

    // Try to detect country from the value
    const detected = findCountryByDialCode(value);
    if (detected && detected.code !== selectedCode) {
      setSelectedCode(detected.code);
    }

    try {
      const parsed = parsePhoneNumberFromString(value, selectedCode);
      if (parsed) {
        return {
          nationalNumber: parsed.formatNational(),
          isValid: parsed.isValid(),
          isPossible: parsed.isPossible(),
        };
      }
    } catch {
      // Fall through
    }

    // Fallback: strip dial code manually
    const stripped = value
      .replace(country.dialCode, "")
      .replace(/^\+\d+/, "")
      .trim();
    return {
      nationalNumber: stripped,
      isValid: false,
      isPossible: stripped.length >= 6,
    };
  }, [value, selectedCode, country.dialCode]);

  // Filter search results
  const results = useMemo(() => searchCountries(query), [query]);

  /* ─── Effects ─── */

  // Sync default country code on mount
  useEffect(() => {
    if (defaultCountryCode && !value) {
      const newCode = defaultCountryCode.toUpperCase() as CountryCode;
      if (newCode !== selectedCode && findCountryByCode(newCode)) {
        setSelectedCode(newCode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCountryCode]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 30);
      setHighlightedIdx(0);
    }
  }, [open]);

  // Reset highlight on search
  useEffect(() => {
    setHighlightedIdx(0);
  }, [query]);

  /* ─── Handlers ─── */

  const emitChange = useCallback(
    (newNationalNumber: string, newCountryCode: CountryCode) => {
      const newCountry = findCountryByCode(newCountryCode);
      if (!newCountry) return;

      const cleaned = newNationalNumber.replace(/\D/g, "");
      const e164 = cleaned ? `${newCountry.dialCode}${cleaned}` : "";

      let valid = false;
      try {
        if (e164) valid = isValidPhoneNumber(e164, newCountryCode);
      } catch {
        valid = false;
      }

      onChange(e164, newCountryCode, valid);
    },
    [onChange],
  );

  const handleCountrySelect = (c: CountryItem) => {
    setSelectedCode(c.code);
    setOpen(false);
    setQuery("");
    // Re-emit with the new country code
    emitChange(nationalNumber.replace(/\D/g, ""), c.code);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Use libphonenumber-js AsYouType formatter
    const formatter = new AsYouType(selectedCode);
    const formatted = formatter.input(e.target.value);
    const digits = formatted.replace(/\D/g, "");
    emitChange(digits, selectedCode);
  };

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
      if (results[highlightedIdx]) handleCountrySelect(results[highlightedIdx]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const displayPlaceholder = placeholder || getExamplePlaceholder(country.code);

  /* ─── Render ─── */

  return (
    <div className="relative w-full" dir="ltr">
      {/* Main Input Group */}
      <div
        className={cn(
          "flex items-stretch w-full rounded-xl border bg-sand-50 overflow-hidden transition-all",
          "focus-within:ring-2 focus-within:ring-primary/20",
          disabled && "opacity-60 cursor-not-allowed",
          showValidation && value && isValid
            ? "border-emerald-300 focus-within:border-emerald-400 focus-within:ring-emerald-100"
            : showValidation && value && !isPossible
              ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
              : open
                ? "border-primary/40 ring-2 ring-primary/20"
                : "border-sand-200",
        )}
      >
        {/* Country Code Selector */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-2 px-3 py-3.5 hover:bg-sand-100 transition-colors border-r border-sand-200 shrink-0"
        >
          <span className="text-2xl leading-none">{country.flag}</span>
          <span className="text-sm font-semibold text-gray-700 font-mono">
            {country.dialCode}
          </span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-gray-400 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {/* Phone Number Input */}
        <input
          ref={inputRef}
          type="tel"
          value={nationalNumber}
          onChange={handleNumberChange}
          placeholder={displayPlaceholder}
          disabled={disabled}
          autoComplete="tel-national"
          className="flex-1 min-w-0 px-3 py-3.5 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed"
        />

        {/* Validation Icon */}
        {showValidation && value && (
          <div className="flex items-center pr-3">
            {isValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : isPossible ? (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {showValidation && value && (
        <p
          className={cn(
            "mt-1.5 text-[11px] flex items-center gap-1",
            isValid
              ? "text-emerald-600"
              : isPossible
                ? "text-amber-600"
                : "text-red-600",
          )}
        >
          {isValid ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Valid {country.name} phone number
            </>
          ) : isPossible ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Keep typing...
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3" />
              Please enter a valid phone number
            </>
          )}
        </p>
      )}

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-50 mt-2 w-full max-w-md bg-white rounded-2xl border border-sand-200 shadow-2xl overflow-hidden",
            "animate-in fade-in-0 slide-in-from-top-2 duration-150",
          )}
          role="listbox"
        >
          {/* Search */}
          <div className="p-3 border-b border-sand-100 bg-sand-50/50">
            <div className="relative">
              <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRTL
                    ? "\u0627\u0628\u062d\u062b \u0639\u0646 \u062f\u0648\u0644\u0629 \u0623\u0648 \u0643\u0648\u062f..."
                    : "Search country or code (e.g., +20)..."
                }
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-sand-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto">
            {results.length === 0 ? (
              <div className="p-8 text-center">
                <Phone className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No matches found</p>
              </div>
            ) : (
              results.map((c, idx) => {
                const isSelected = country.code === c.code;
                const isHighlighted = idx === highlightedIdx;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    onMouseEnter={() => setHighlightedIdx(idx)}
                    className={cn(
                      "w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors",
                      isHighlighted && !isSelected && "bg-sand-100",
                      isSelected && "bg-primary/10",
                    )}
                  >
                    <span className="text-2xl leading-none shrink-0">{c.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm truncate",
                          isSelected
                            ? "font-bold text-primary"
                            : "font-medium text-gray-900",
                        )}
                      >
                        {c.name}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-mono font-semibold shrink-0",
                        isSelected ? "text-primary" : "text-gray-600",
                      )}
                    >
                      {c.dialCode}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get example phone format for placeholder.
 */
function getExamplePlaceholder(code: CountryCode): string {
  const examples: Partial<Record<CountryCode, string>> = {
    EG: "10 1234 5678",
    SA: "5X XXX XXXX",
    AE: "5X XXX XXXX",
    US: "(555) 123-4567",
    GB: "7400 123456",
    DE: "1512 3456789",
    FR: "6 12 34 56 78",
    IN: "98765 43210",
    PK: "300 1234567",
  };
  return examples[code] || "Phone number";
}