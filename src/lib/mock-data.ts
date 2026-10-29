import fundusSample1 from "@/assets/fundus-sample-1.jpg";
import {
  type DrGrade,
  type ScreeningRecord,
  type ReferralStatus,
} from "./types";

/**
 * MOCK screening records.
 *
 * These rows are clearly-marked demo data for the research prototype UI.
 * They must never be presented as real clinical results. Replace this
 * module with real records once a model backend and a database exist.
 */

export const MODEL_CARD = {
  name: "EyeCare DR Screening Model",
  version: "mock-v0.3",
  architecture: "CNN classifier (placeholder — not a real model)",
  inputSize: "224 × 224 px, colour fundus photograph",
  classes: 5,
  trainedOn: "Synthetic demo weights — not trained on real patient data",
} as const;


const probs = (...weights: number[]): number[] => weights;

let counter = 0;
function makeRecord(
  daysAgo: number,
  site: string,
  grade: DrGrade,
  confidence: number,
  gradeProbabilities: number[],
  referralStatus: ReferralStatus,
  reviewedBy: string | null,
): ScreeningRecord {
  counter += 1;
  const date = new Date(Date.UTC(2026, 9, 29)); // 29 Oct 2026
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return {
    id: `SCR-2026-${String(1040 + counter).padStart(4, "0")}`,
    site,
    createdAt: date.toISOString(),
    imageLabel: `fundus_capture_${String(310 + counter).padStart(3, "0")}.jpg`,
    grade,
    confidence,
    gradeProbabilities,
    referralStatus,
    reviewedBy,
  };
}

export const MOCK_SCREENINGS: ScreeningRecord[] = [
  makeRecord(0, "Kotra Vision Centre", 0, 0.96, probs(0.96, 0.03, 0.01, 0.0, 0.0), "none", null),
  makeRecord(0, "Sangam Mobile Camp", 2, 0.81, probs(0.07, 0.09, 0.81, 0.02, 0.01), "pending", null),
  makeRecord(1, "Kotra Vision Centre", 1, 0.88, probs(0.09, 0.88, 0.02, 0.01, 0.0), "none", null),
  makeRecord(1, "Bilaspur PHC", 4, 0.93, probs(0.01, 0.02, 0.03, 0.01, 0.93), "pending", null),
  makeRecord(2, "Dungarpur Vision Centre", 0, 0.97, probs(0.97, 0.02, 0.01, 0.0, 0.0), "none", null),
  makeRecord(3, "Sangam Mobile Camp", 3, 0.79, probs(0.03, 0.06, 0.1, 0.79, 0.02), "completed", "Dr. Mehta (review)"),
  makeRecord(4, "Kotra Vision Centre", 2, 0.84, probs(0.05, 0.08, 0.84, 0.02, 0.01), "pending", null),
  makeRecord(5, "Bilaspur PHC", 0, 0.95, probs(0.95, 0.04, 0.01, 0.0, 0.0), "none", null),
  makeRecord(6, "Dungarpur Vision Centre", 1, 0.9, probs(0.07, 0.9, 0.02, 0.01, 0.0), "completed", "Dr. Rao (review)"),
  makeRecord(8, "Kotra Vision Centre", 0, 0.94, probs(0.94, 0.05, 0.01, 0.0, 0.0), "none", null),
  makeRecord(9, "Sangam Mobile Camp", 2, 0.77, probs(0.08, 0.12, 0.77, 0.02, 0.01), "pending", null),
  makeRecord(11, "Bilaspur PHC", 1, 0.86, probs(0.1, 0.86, 0.03, 0.01, 0.0), "completed", "Dr. Rao (review)"),
  makeRecord(13, "Dungarpur Vision Centre", 0, 0.98, probs(0.98, 0.01, 0.01, 0.0, 0.0), "none", null),
  makeRecord(15, "Kotra Vision Centre", 4, 0.91, probs(0.01, 0.02, 0.04, 0.02, 0.91), "completed", "Dr. Mehta (review)"),
];

export { fundusSample1 };
export function computeStats(records: ScreeningRecord[]) {
  const total = records.length;
  const referred = records.filter((r) => r.grade >= 2).length;
  const pendingReferrals = records.filter((r) => r.grade >= 2 && r.referralStatus === "pending").length;
  const byGrade = [0, 1, 2, 3, 4].map(
    (g) => records.filter((r) => r.grade === g).length,
  ) as number[];
  return { total, referred, pendingReferrals, byGrade };
}
