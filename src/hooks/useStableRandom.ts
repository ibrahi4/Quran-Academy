"use client";

import { useSyncExternalStore } from "react";

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface StableRandomItem {
  top: string;
  left: string;
  width: number;
  height: number;
}

export function useStableRandom(count: number, seed: number = 42): StableRandomItem[] {
  return Array.from({ length: count }, (_: unknown, i: number): StableRandomItem => ({
    top: (seededRandom(seed + i * 4 + 1) * 80 + 10).toFixed(4) + "%",
    left: (seededRandom(seed + i * 4 + 2) * 80 + 10).toFixed(4) + "%",
    width: 20 + seededRandom(seed + i * 4 + 3) * 60,
    height: 20 + seededRandom(seed + i * 4 + 4) * 60,
  }));
}

export function useHydrationSafe<T>(factory: () => T, fallback: T): T {
  return useSyncExternalStore(
    (callback: () => void) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => factory(),
    () => fallback
  );
}

function subscribeToNothing(): () => void {
  return () => {};
}

function getIsClient(): boolean {
  return true;
}

function getIsServer(): boolean {
  return false;
}

export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    getIsClient,
    getIsServer
  );
}