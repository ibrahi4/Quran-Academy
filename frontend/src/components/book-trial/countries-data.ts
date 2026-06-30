import countriesData from "world-countries";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js";

export interface CountryItem {
  /** ISO 3166-1 alpha-2 code (e.g., "EG", "US") */
  code: CountryCode;
  /** English official name */
  name: string;
  /** Native name (best effort) */
  nameNative: string;
  /** Arabic translation */
  nameAr: string;
  /** Emoji flag */
  flag: string;
  /** Phone calling code WITH + (e.g., "+20") */
  dialCode: string;
  /** Phone calling code WITHOUT + (e.g., "20") */
  dialCodeRaw: string;
  /** Region (Africa, Americas, Asia, Europe, Oceania) */
  region: string;
  /** Sub-region for grouping */
  subregion: string;
  /** Search keywords (lowercase) */
  searchTokens: string;
}

/**
 * Hand-curated Arabic translations for common countries.
 * Falls back to English name if not present.
 */
const AR_OVERRIDES: Record<string, string> = {
  EG: "\u0645\u0635\u0631",
  SA: "\u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629",
  AE: "\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a",
  QA: "\u0642\u0637\u0631",
  KW: "\u0627\u0644\u0643\u0648\u064a\u062a",
  BH: "\u0627\u0644\u0628\u062d\u0631\u064a\u0646",
  OM: "\u0639\u0645\u0627\u0646",
  JO: "\u0627\u0644\u0623\u0631\u062f\u0646",
  LB: "\u0644\u0628\u0646\u0627\u0646",
  PS: "\u0641\u0644\u0633\u0637\u064a\u0646",
  SY: "\u0633\u0648\u0631\u064a\u0627",
  IQ: "\u0627\u0644\u0639\u0631\u0627\u0642",
  YE: "\u0627\u0644\u064a\u0645\u0646",
  MA: "\u0627\u0644\u0645\u063a\u0631\u0628",
  DZ: "\u0627\u0644\u062c\u0632\u0627\u0626\u0631",
  TN: "\u062a\u0648\u0646\u0633",
  LY: "\u0644\u064a\u0628\u064a\u0627",
  SD: "\u0627\u0644\u0633\u0648\u062f\u0627\u0646",
  MR: "\u0645\u0648\u0631\u064a\u062a\u0627\u0646\u064a\u0627",
  SO: "\u0627\u0644\u0635\u0648\u0645\u0627\u0644",
  DJ: "\u062c\u064a\u0628\u0648\u062a\u064a",
  KM: "\u062c\u0632\u0631 \u0627\u0644\u0642\u0645\u0631",

  US: "\u0627\u0644\u0648\u0644\u0627\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u062d\u062f\u0629",
  GB: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062a\u062d\u062f\u0629",
  CA: "\u0643\u0646\u062f\u0627",
  AU: "\u0623\u0633\u062a\u0631\u0627\u0644\u064a\u0627",
  NZ: "\u0646\u064a\u0648\u0632\u064a\u0644\u0646\u062f\u0627",

  DE: "\u0623\u0644\u0645\u0627\u0646\u064a\u0627",
  FR: "\u0641\u0631\u0646\u0633\u0627",
  ES: "\u0625\u0633\u0628\u0627\u0646\u064a\u0627",
  IT: "\u0625\u064a\u0637\u0627\u0644\u064a\u0627",
  NL: "\u0647\u0648\u0644\u0646\u062f\u0627",
  BE: "\u0628\u0644\u062c\u064a\u0643\u0627",
  SE: "\u0627\u0644\u0633\u0648\u064a\u062f",
  NO: "\u0627\u0644\u0646\u0631\u0648\u064a\u062c",
  DK: "\u0627\u0644\u062f\u0646\u0645\u0627\u0631\u0643",
  CH: "\u0633\u0648\u064a\u0633\u0631\u0627",
  AT: "\u0627\u0644\u0646\u0645\u0633\u0627",
  IE: "\u0623\u064a\u0631\u0644\u0646\u062f\u0627",
  PT: "\u0627\u0644\u0628\u0631\u062a\u063a\u0627\u0644",
  PL: "\u0628\u0648\u0644\u0646\u062f\u0627",
  RU: "\u0631\u0648\u0633\u064a\u0627",
  TR: "\u062a\u0631\u0643\u064a\u0627",
  GR: "\u0627\u0644\u064a\u0648\u0646\u0627\u0646",
  FI: "\u0641\u0646\u0644\u0646\u062f\u0627",
  CZ: "\u062a\u0634\u064a\u0643\u064a\u0627",
  RO: "\u0631\u0648\u0645\u0627\u0646\u064a\u0627",
  UA: "\u0623\u0648\u0643\u0631\u0627\u0646\u064a\u0627",
  HU: "\u0627\u0644\u0645\u062c\u0631",

  PK: "\u0628\u0627\u0643\u0633\u062a\u0627\u0646",
  IN: "\u0627\u0644\u0647\u0646\u062f",
  BD: "\u0628\u0646\u063a\u0644\u0627\u062f\u064a\u0634",
  ID: "\u0625\u0646\u062f\u0648\u0646\u064a\u0633\u064a\u0627",
  MY: "\u0645\u0627\u0644\u064a\u0632\u064a\u0627",
  SG: "\u0633\u0646\u063a\u0627\u0641\u0648\u0631\u0629",
  PH: "\u0627\u0644\u0641\u0644\u0628\u064a\u0646",
  TH: "\u062a\u0627\u064a\u0644\u0627\u0646\u062f",
  VN: "\u0641\u064a\u062a\u0646\u0627\u0645",
  JP: "\u0627\u0644\u064a\u0627\u0628\u0627\u0646",
  KR: "\u0643\u0648\u0631\u064a\u0627 \u0627\u0644\u062c\u0646\u0648\u0628\u064a\u0629",
  CN: "\u0627\u0644\u0635\u064a\u0646",
  IR: "\u0625\u064a\u0631\u0627\u0646",
  AF: "\u0623\u0641\u063a\u0627\u0646\u0633\u062a\u0627\u0646",
  KZ: "\u0643\u0627\u0632\u0627\u062e\u0633\u062a\u0627\u0646",
  UZ: "\u0623\u0648\u0632\u0628\u0643\u0633\u062a\u0627\u0646",

  NG: "\u0646\u064a\u062c\u064a\u0631\u064a\u0627",
  KE: "\u0643\u064a\u0646\u064a\u0627",
  ZA: "\u062c\u0646\u0648\u0628 \u0623\u0641\u0631\u064a\u0642\u064a\u0627",
  ET: "\u0625\u062b\u064a\u0648\u0628\u064a\u0627",
  GH: "\u063a\u0627\u0646\u0627",
  SN: "\u0627\u0644\u0633\u0646\u063a\u0627\u0644",

  BR: "\u0627\u0644\u0628\u0631\u0627\u0632\u064a\u0644",
  MX: "\u0627\u0644\u0645\u0643\u0633\u064a\u0643",
  AR: "\u0627\u0644\u0623\u0631\u062c\u0646\u062a\u064a\u0646",
  CL: "\u062a\u0634\u064a\u0644\u064a",
  CO: "\u0643\u0648\u0644\u0648\u0645\u0628\u064a\u0627",
};

/**
 * Convert ISO country code to emoji flag (works for all 249 countries).
 * Examples: "EG" -> "🇪🇬", "US" -> "🇺🇸"
 */
function codeToFlag(code: string): string {
  if (!code || code.length !== 2) return "\ud83c\udf10";
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0)),
  );
}

/**
 * Build the full country list from world-countries + libphonenumber-js.
 * This runs ONCE at module load.
 */
const RAW_COUNTRIES: CountryItem[] = (countriesData as any[])
  .map((c: any) => {
    const iso2 = c.cca2 as string;
    if (!iso2) return null;

    // Get phone code from libphonenumber-js (the authoritative source)
    let dialCode = "";
    try {
      dialCode = getCountryCallingCode(iso2 as CountryCode);
    } catch {
      // Country not supported by libphonenumber, skip
      return null;
    }

    const name = c.name?.common || iso2;
    const nameNative =
      c.name?.nativeName?.[Object.keys(c.name?.nativeName || {})[0]]?.common ||
      name;
    const nameAr = AR_OVERRIDES[iso2] || name;

    return {
      code: iso2 as CountryCode,
      name,
      nameNative,
      nameAr,
      flag: codeToFlag(iso2),
      dialCode: `+${dialCode}`,
      dialCodeRaw: dialCode,
      region: c.region || "",
      subregion: c.subregion || "",
      searchTokens: [
        name,
        nameNative,
        nameAr,
        iso2,
        c.cca3,
        `+${dialCode}`,
        dialCode,
        c.region,
        c.subregion,
        ...(c.altSpellings || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    } as CountryItem;
  })
  .filter((c): c is CountryItem => c !== null);

/** All countries (250+), sorted alphabetically by English name */
export const ALL_COUNTRIES: CountryItem[] = [...RAW_COUNTRIES].sort((a, b) =>
  a.name.localeCompare(b.name),
);

/** Priority countries shown at the top (MENA region) */
const PRIORITY_CODES = [
  "EG", "SA", "AE", "QA", "KW", "BH", "OM",
  "JO", "LB", "PS", "SY", "IQ", "YE",
  "MA", "DZ", "TN", "LY", "SD",
];

/** Countries reordered with priority countries first */
export const COUNTRIES_PRIORITIZED: CountryItem[] = [
  ...PRIORITY_CODES.map((code) => ALL_COUNTRIES.find((c) => c.code === code)).filter(
    Boolean,
  ) as CountryItem[],
  ...ALL_COUNTRIES.filter((c) => !PRIORITY_CODES.includes(c.code)),
];

/* ─────────────────────────── Lookup helpers ─────────────────────────── */

const BY_CODE = new Map(ALL_COUNTRIES.map((c) => [c.code, c]));
const BY_NAME = new Map(ALL_COUNTRIES.map((c) => [c.name.toLowerCase(), c]));

export function findCountryByCode(code: string): CountryItem | undefined {
  if (!code) return undefined;
  return BY_CODE.get(code.toUpperCase() as CountryCode);
}

export function findCountryByName(name: string): CountryItem | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase().trim();
  return (
    BY_NAME.get(lower) ||
    ALL_COUNTRIES.find(
      (c) => c.nameAr === name || c.nameNative.toLowerCase() === lower,
    )
  );
}

/**
 * Detect country from phone number prefix.
 * Returns the longest matching prefix (e.g., "+1242" -> Bahamas, not "+1" USA).
 */
export function findCountryByDialCode(phone: string): CountryItem | undefined {
  if (!phone) return undefined;
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) return undefined;

  // Try longest dial code first
  return [...ALL_COUNTRIES]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((c) => cleaned.startsWith(c.dialCode));
}

/**
 * Search countries by query.
 * Matches against: name, native name, Arabic name, ISO codes, dial code, region.
 */
export function searchCountries(query: string): CountryItem[] {
  if (!query.trim()) return COUNTRIES_PRIORITIZED;
  const q = query.toLowerCase().trim();
  const cleanDigits = q.replace(/[^\d+]/g, "");

  return COUNTRIES_PRIORITIZED.filter((c) => {
    if (c.searchTokens.includes(q)) return true;
    // If query is digits, also match against dial code
    if (cleanDigits && c.dialCodeRaw.includes(cleanDigits.replace("+", ""))) {
      return true;
    }
    return false;
  });
}