import { GameInfo } from "@/types/games";

export const gamesConfig: GameInfo[] = [
  {
    id: "arabic-letters",
    slug: "arabic-letters",
    icon: "pencil",
    color: "#4CAF50",
    bgGradient: "from-green-400 to-emerald-600",
    totalLevels: 28,
    minAge: 4,
    maxAge: 12,
  },
  {
    id: "tajweed",
    slug: "tajweed",
    icon: "book",
    color: "#2196F3",
    bgGradient: "from-blue-400 to-indigo-600",
    totalLevels: 15,
    minAge: 7,
    maxAge: 15,
  },
  {
    id: "noor-albayan",
    slug: "noor-albayan",
    icon: "sunrise",
    color: "#FF9800",
    bgGradient: "from-orange-400 to-amber-600",
    totalLevels: 20,
    minAge: 4,
    maxAge: 10,
  },
  {
    id: "word-pronunciation",
    slug: "word-pronunciation",
    icon: "mic",
    color: "#9C27B0",
    bgGradient: "from-purple-400 to-violet-600",
    totalLevels: 25,
    minAge: 5,
    maxAge: 12,
  },
  {
    id: "word-writing",
    slug: "word-writing",
    icon: "pen",
    color: "#E91E63",
    bgGradient: "from-pink-400 to-rose-600",
    totalLevels: 20,
    minAge: 5,
    maxAge: 12,
  },
];

export interface ArabicLetterFull {
  id: number;
  letter: string;
  name: string;
  nameEn: string;
  sound: string;
  group: "sun" | "moon";
  tashkeel: {
    fatha: string;   // with fatHa
    damma: string;   // with Damma
    kasra: string;   // with Kasra
    sukun: string;   // with Sukun
  };
  example: {
    word: string;
    meaning: string;
    meaningEn: string;
  };
}

export const arabicLetters: ArabicLetterFull[] = [
  {
    id: 1, letter: "\u0627", name: "\u0623\u0644\u0641", nameEn: "Alif", sound: "a", group: "moon",
    tashkeel: { fatha: "\u0623\u064E", damma: "\u0623\u064F", kasra: "\u0623\u0650", sukun: "\u0623\u0652" },
    example: { word: "\u0623\u064E\u0633\u064E\u062F", meaning: "\u062D\u064A\u0648\u0627\u0646 \u0645\u0641\u062A\u0631\u0633", meaningEn: "Lion" }
  },
  {
    id: 2, letter: "\u0628", name: "\u0628\u0627\u0621", nameEn: "Ba", sound: "b", group: "moon",
    tashkeel: { fatha: "\u0628\u064E", damma: "\u0628\u064F", kasra: "\u0628\u0650", sukun: "\u0628\u0652" },
    example: { word: "\u0628\u064E\u0627\u0628", meaning: "\u0645\u062F\u062E\u0644", meaningEn: "Door" }
  },
  {
    id: 3, letter: "\u062A", name: "\u062A\u0627\u0621", nameEn: "Ta", sound: "t", group: "sun",
    tashkeel: { fatha: "\u062A\u064E", damma: "\u062A\u064F", kasra: "\u062A\u0650", sukun: "\u062A\u0652" },
    example: { word: "\u062A\u064F\u0641\u0651\u064E\u0627\u062D", meaning: "\u0641\u0627\u0643\u0647\u0629", meaningEn: "Apple" }
  },
  {
    id: 4, letter: "\u062B", name: "\u062B\u0627\u0621", nameEn: "Tha", sound: "th", group: "sun",
    tashkeel: { fatha: "\u062B\u064E", damma: "\u062B\u064F", kasra: "\u062B\u0650", sukun: "\u062B\u0652" },
    example: { word: "\u062B\u064E\u0639\u0652\u0644\u064E\u0628", meaning: "\u062D\u064A\u0648\u0627\u0646", meaningEn: "Fox" }
  },
  {
    id: 5, letter: "\u062C", name: "\u062C\u064A\u0645", nameEn: "Jeem", sound: "j", group: "moon",
    tashkeel: { fatha: "\u062C\u064E", damma: "\u062C\u064F", kasra: "\u062C\u0650", sukun: "\u062C\u0652" },
    example: { word: "\u062C\u064E\u0645\u064E\u0644", meaning: "\u062D\u064A\u0648\u0627\u0646 \u0627\u0644\u0635\u062D\u0631\u0627\u0621", meaningEn: "Camel" }
  },
  {
    id: 6, letter: "\u062D", name: "\u062D\u0627\u0621", nameEn: "Ha", sound: "h", group: "moon",
    tashkeel: { fatha: "\u062D\u064E", damma: "\u062D\u064F", kasra: "\u062D\u0650", sukun: "\u062D\u0652" },
    example: { word: "\u062D\u0650\u0635\u064E\u0627\u0646", meaning: "\u062D\u064A\u0648\u0627\u0646", meaningEn: "Horse" }
  },
  {
    id: 7, letter: "\u062E", name: "\u062E\u0627\u0621", nameEn: "Kha", sound: "kh", group: "moon",
    tashkeel: { fatha: "\u062E\u064E", damma: "\u062E\u064F", kasra: "\u062E\u0650", sukun: "\u062E\u0652" },
    example: { word: "\u062E\u064F\u0628\u0652\u0632", meaning: "\u0637\u0639\u0627\u0645", meaningEn: "Bread" }
  },
  {
    id: 8, letter: "\u062F", name: "\u062F\u0627\u0644", nameEn: "Dal", sound: "d", group: "sun",
    tashkeel: { fatha: "\u062F\u064E", damma: "\u062F\u064F", kasra: "\u062F\u0650", sukun: "\u062F\u0652" },
    example: { word: "\u062F\u064F\u0628\u0651", meaning: "\u062D\u064A\u0648\u0627\u0646", meaningEn: "Bear" }
  },
  {
    id: 9, letter: "\u0630", name: "\u0630\u0627\u0644", nameEn: "Thal", sound: "dh", group: "sun",
    tashkeel: { fatha: "\u0630\u064E", damma: "\u0630\u064F", kasra: "\u0630\u0650", sukun: "\u0630\u0652" },
    example: { word: "\u0630\u064E\u0647\u064E\u0628", meaning: "\u0645\u0639\u062F\u0646 \u062B\u0645\u064A\u0646", meaningEn: "Gold" }
  },
  {
    id: 10, letter: "\u0631", name: "\u0631\u0627\u0621", nameEn: "Ra", sound: "r", group: "sun",
    tashkeel: { fatha: "\u0631\u064E", damma: "\u0631\u064F", kasra: "\u0631\u0650", sukun: "\u0631\u0652" },
    example: { word: "\u0631\u064E\u062C\u064F\u0644", meaning: "\u0625\u0646\u0633\u0627\u0646", meaningEn: "Man" }
  },
  {
    id: 11, letter: "\u0632", name: "\u0632\u0627\u064A", nameEn: "Zay", sound: "z", group: "sun",
    tashkeel: { fatha: "\u0632\u064E", damma: "\u0632\u064F", kasra: "\u0632\u0650", sukun: "\u0632\u0652" },
    example: { word: "\u0632\u064E\u0647\u0652\u0631\u064E\u0629", meaning: "\u0646\u0628\u0627\u062A", meaningEn: "Flower" }
  },
  {
    id: 12, letter: "\u0633", name: "\u0633\u064A\u0646", nameEn: "Seen", sound: "s", group: "sun",
    tashkeel: { fatha: "\u0633\u064E", damma: "\u0633\u064F", kasra: "\u0633\u0650", sukun: "\u0633\u0652" },
    example: { word: "\u0633\u064E\u0645\u064E\u0643\u064E\u0629", meaning: "\u062D\u064A\u0648\u0627\u0646 \u0628\u062D\u0631\u064A", meaningEn: "Fish" }
  },
  {
    id: 13, letter: "\u0634", name: "\u0634\u064A\u0646", nameEn: "Sheen", sound: "sh", group: "sun",
    tashkeel: { fatha: "\u0634\u064E", damma: "\u0634\u064F", kasra: "\u0634\u0650", sukun: "\u0634\u0652" },
    example: { word: "\u0634\u064E\u0645\u0652\u0633", meaning: "\u0646\u062C\u0645", meaningEn: "Sun" }
  },
  {
    id: 14, letter: "\u0635", name: "\u0635\u0627\u062F", nameEn: "Sad", sound: "s", group: "sun",
    tashkeel: { fatha: "\u0635\u064E", damma: "\u0635\u064F", kasra: "\u0635\u0650", sukun: "\u0635\u0652" },
    example: { word: "\u0635\u064E\u0642\u0652\u0631", meaning: "\u0637\u0627\u0626\u0631", meaningEn: "Falcon" }
  },
  {
    id: 15, letter: "\u0636", name: "\u0636\u0627\u062F", nameEn: "Dad", sound: "d", group: "sun",
    tashkeel: { fatha: "\u0636\u064E", damma: "\u0636\u064F", kasra: "\u0636\u0650", sukun: "\u0636\u0652" },
    example: { word: "\u0636\u064E\u0648\u0652\u0621", meaning: "\u0646\u0648\u0631", meaningEn: "Light" }
  },
  {
    id: 16, letter: "\u0637", name: "\u0637\u0627\u0621", nameEn: "Taa", sound: "t", group: "sun",
    tashkeel: { fatha: "\u0637\u064E", damma: "\u0637\u064F", kasra: "\u0637\u0650", sukun: "\u0637\u0652" },
    example: { word: "\u0637\u064E\u0627\u0626\u0650\u0631", meaning: "\u062D\u064A\u0648\u0627\u0646 \u064A\u0637\u064A\u0631", meaningEn: "Bird" }
  },
  {
    id: 17, letter: "\u0638", name: "\u0638\u0627\u0621", nameEn: "Dhaa", sound: "dh", group: "sun",
    tashkeel: { fatha: "\u0638\u064E", damma: "\u0638\u064F", kasra: "\u0638\u0650", sukun: "\u0638\u0652" },
    example: { word: "\u0638\u064E\u0644\u0651", meaning: "\u062D\u0645\u0627\u064A\u0629 \u0645\u0646 \u0627\u0644\u0634\u0645\u0633", meaningEn: "Shadow" }
  },
  {
    id: 18, letter: "\u0639", name: "\u0639\u064A\u0646", nameEn: "Ain", sound: "a", group: "moon",
    tashkeel: { fatha: "\u0639\u064E", damma: "\u0639\u064F", kasra: "\u0639\u0650", sukun: "\u0639\u0652" },
    example: { word: "\u0639\u064E\u064A\u0652\u0646", meaning: "\u0639\u0636\u0648 \u0627\u0644\u0631\u0624\u064A\u0629", meaningEn: "Eye" }
  },
  {
    id: 19, letter: "\u063A", name: "\u063A\u064A\u0646", nameEn: "Ghain", sound: "gh", group: "moon",
    tashkeel: { fatha: "\u063A\u064E", damma: "\u063A\u064F", kasra: "\u063A\u0650", sukun: "\u063A\u0652" },
    example: { word: "\u063A\u064E\u064A\u0652\u0645", meaning: "\u0633\u062D\u0627\u0628", meaningEn: "Cloud" }
  },
  {
    id: 20, letter: "\u0641", name: "\u0641\u0627\u0621", nameEn: "Fa", sound: "f", group: "moon",
    tashkeel: { fatha: "\u0641\u064E", damma: "\u0641\u064F", kasra: "\u0641\u0650", sukun: "\u0641\u0652" },
    example: { word: "\u0641\u064E\u0631\u064E\u0627\u0634\u064E\u0629", meaning: "\u062D\u0634\u0631\u0629 \u062C\u0645\u064A\u0644\u0629", meaningEn: "Butterfly" }
  },
  {
    id: 21, letter: "\u0642", name: "\u0642\u0627\u0641", nameEn: "Qaf", sound: "q", group: "moon",
    tashkeel: { fatha: "\u0642\u064E", damma: "\u0642\u064F", kasra: "\u0642\u0650", sukun: "\u0642\u0652" },
    example: { word: "\u0642\u064E\u0645\u064E\u0631", meaning: "\u062C\u0631\u0645 \u0633\u0645\u0627\u0648\u064A", meaningEn: "Moon" }
  },
  {
    id: 22, letter: "\u0643", name: "\u0643\u0627\u0641", nameEn: "Kaf", sound: "k", group: "moon",
    tashkeel: { fatha: "\u0643\u064E", damma: "\u0643\u064F", kasra: "\u0643\u0650", sukun: "\u0643\u0652" },
    example: { word: "\u0643\u0650\u062A\u064E\u0627\u0628", meaning: "\u0644\u0644\u0642\u0631\u0627\u0621\u0629", meaningEn: "Book" }
  },
  {
    id: 23, letter: "\u0644", name: "\u0644\u0627\u0645", nameEn: "Lam", sound: "l", group: "sun",
    tashkeel: { fatha: "\u0644\u064E", damma: "\u0644\u064F", kasra: "\u0644\u0650", sukun: "\u0644\u0652" },
    example: { word: "\u0644\u064E\u064A\u0652\u0644", meaning: "\u0639\u0643\u0633 \u0627\u0644\u0646\u0647\u0627\u0631", meaningEn: "Night" }
  },
  {
    id: 24, letter: "\u0645", name: "\u0645\u064A\u0645", nameEn: "Meem", sound: "m", group: "moon",
    tashkeel: { fatha: "\u0645\u064E", damma: "\u0645\u064F", kasra: "\u0645\u0650", sukun: "\u0645\u0652" },
    example: { word: "\u0645\u064E\u0627\u0621", meaning: "\u0633\u0627\u0626\u0644", meaningEn: "Water" }
  },
  {
    id: 25, letter: "\u0646", name: "\u0646\u0648\u0646", nameEn: "Noon", sound: "n", group: "sun",
    tashkeel: { fatha: "\u0646\u064E", damma: "\u0646\u064F", kasra: "\u0646\u0650", sukun: "\u0646\u0652" },
    example: { word: "\u0646\u064E\u062C\u0652\u0645", meaning: "\u062C\u0631\u0645 \u0633\u0645\u0627\u0648\u064A", meaningEn: "Star" }
  },
  {
    id: 26, letter: "\u0647", name: "\u0647\u0627\u0621", nameEn: "Ha", sound: "h", group: "moon",
    tashkeel: { fatha: "\u0647\u064E", damma: "\u0647\u064F", kasra: "\u0647\u0650", sukun: "\u0647\u0652" },
    example: { word: "\u0647\u064E\u0627\u062A\u0650\u0641", meaning: "\u062C\u0647\u0627\u0632 \u0627\u062A\u0635\u0627\u0644", meaningEn: "Phone" }
  },
  {
    id: 27, letter: "\u0648", name: "\u0648\u0627\u0648", nameEn: "Waw", sound: "w", group: "moon",
    tashkeel: { fatha: "\u0648\u064E", damma: "\u0648\u064F", kasra: "\u0648\u0650", sukun: "\u0648\u0652" },
    example: { word: "\u0648\u064E\u0631\u0652\u062F\u064E\u0629", meaning: "\u0632\u0647\u0631\u0629", meaningEn: "Rose" }
  },
  {
    id: 28, letter: "\u064A", name: "\u064A\u0627\u0621", nameEn: "Ya", sound: "y", group: "moon",
    tashkeel: { fatha: "\u064A\u064E", damma: "\u064A\u064F", kasra: "\u064A\u0650", sukun: "\u064A\u0652" },
    example: { word: "\u064A\u064E\u062F", meaning: "\u0639\u0636\u0648 \u0641\u064A \u0627\u0644\u062C\u0633\u0645", meaningEn: "Hand" }
  },
];

export const gameRewards = {
  correctAnswer: 10,
  perfectLevel: 50,
  streakBonus: [0, 5, 10, 20, 30, 50],
  starThresholds: { one: 50, two: 75, three: 95 },
};
