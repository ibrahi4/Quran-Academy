// ===== Game Types =====

export type GameCategory =
  | "arabic-letters"
  | "tajweed"
  | "noor-albayan"
  | "word-pronunciation"
  | "word-writing";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type GameStatus = "locked" | "unlocked" | "completed";

export interface GameInfo {
  id: GameCategory;
  slug: string;
  icon: string;
  color: string;
  bgGradient: string;
  totalLevels: number;
  minAge: number;
  maxAge: number;
}

export interface GameLevel {
  id: number;
  difficulty: DifficultyLevel;
  status: GameStatus;
  starsEarned: number;
  maxStars: number;
}

export interface GameProgress {
  gameId: GameCategory;
  currentLevel: number;
  totalStars: number;
  completedLevels: number;
  lastPlayed?: Date;
}

export interface GameQuestion {
  id: string;
  type: "multiple-choice" | "drag-drop" | "match" | "write" | "listen" | "speak";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  hint?: string;
  audioUrl?: string;
  imageUrl?: string;
  points: number;
}

export interface GameSession {
  gameId: GameCategory;
  level: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  starsEarned: number;
}

export interface ArabicLetter {
  id: number;
  letter: string;
  name: string;
  nameEn: string;
  sound: string;
  position: {
    isolated: string;
    initial: string;
    medial: string;
    final: string;
  };
  example: {
    word: string;
    meaning: string;
  };
  audioUrl: string;
  group: "sun" | "moon";
  category: "throat" | "tongue" | "lips" | "nose" | "mouth";
}

export interface TajweedRule {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  color: string;
  examples: {
    text: string;
    highlighted: string;
    audioUrl: string;
  }[];
}

export interface WordItem {
  id: string;
  word: string;
  meaning: string;
  transliteration: string;
  audioUrl: string;
  imageUrl: string;
  category: string;
  difficulty: DifficultyLevel;
  letters: string[];
}
