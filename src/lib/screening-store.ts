import { useSyncExternalStore } from "react";
import { type ScreeningResult } from "./types";

/**
 * Tiny client-side store holding the most recent analysis result so the
 * Results and Explainability pages can read it after the New Screening
 * flow finishes. Falls back to a demo record when empty.
 */

let current: ScreeningResult | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return current;
}

export function setCurrentResult(result: ScreeningResult) {
  current = result;
  listeners.forEach((l) => l());
}

export function clearCurrentResult() {
  current = null;
  listeners.forEach((l) => l());
}

export function useCurrentResult(): ScreeningResult | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
