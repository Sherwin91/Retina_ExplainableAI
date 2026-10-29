/**
 * Shared domain types for EyeCare.
 *
 * IMPORTANT: Everything on these types currently comes from MOCK data.
 * No real inference model is connected yet.
 */

/** International Clinical DR Severity Scale (five grades). */
export type DrGrade = 0 | 1 | 2 | 3 | 4;

export interface DrGradeInfo {
  grade: DrGrade;
  label: string;
  shortLabel: string;
  /** Which token colour (grade-0 … grade-4) represents this severity. */
  colorToken: `grade-${0 | 1 | 2 | 3 | 4}`;
  recommendation: string;
  refersToSpecialist: boolean;
}

export const DR_GRADES: DrGradeInfo[] = [
  {
    grade: 0,
    label: "No DR",
    shortLabel: "No DR",
    colorToken: "grade-0",
    recommendation:
      "Routine follow-up. Recommend repeat screening in 12 months.",
    refersToSpecialist: false,
  },
  {
    grade: 1,
    label: "Mild Non-Proliferative DR",
    shortLabel: "Mild",
    colorToken: "grade-1",
    recommendation:
      "Repeat screening in 6–12 months. No urgent referral indicated.",
    refersToSpecialist: false,
  },
  {
    grade: 2,
    label: "Moderate Non-Proliferative DR",
    shortLabel: "Moderate",
    colorToken: "grade-2",
    recommendation:
      "Refer to an ophthalmologist for evaluation within a few weeks.",
    refersToSpecialist: true,
  },
  {
    grade: 3,
    label: "Severe Non-Proliferative DR",
    shortLabel: "Severe",
    colorToken: "grade-3",
    recommendation:
      "Urgent referral to an ophthalmologist within 4 weeks.",
    refersToSpecialist: true,
  },
  {
    grade: 4,
    label: "Proliferative DR",
    shortLabel: "Proliferative",
    colorToken: "grade-4",
    recommendation:
      "Immediate referral to a retinal specialist. Sight-threatening.",
    refersToSpecialist: true,
  },
];

export function gradeInfo(grade: DrGrade): DrGradeInfo {
  return DR_GRADES[grade];
}

export type ReferralStatus = "none" | "pending" | "completed";

export interface ScreeningRecord {
  /** Anonymous screening identifier — never a patient name. */
  id: string;
  /** Screening location (vision centre / camp), not patient identity. */
  site: string;
  createdAt: string; // ISO date
  imageLabel: string;
  grade: DrGrade;
  /** Model confidence for the predicted grade, 0–1. */
  confidence: number;
  /** Per-grade class confidences, 0–1, summing to ~1. */
  gradeProbabilities: number[];
  referralStatus: ReferralStatus;
  reviewedBy: string | null;
}

/** Result of one analysis run — mock until a real backend is connected. */
export interface ScreeningResult extends Omit<ScreeningRecord, "createdAt"> {
  createdAt: string;
  /** Where the result came from. */
  source: "mock" | "model";
  /** Duration of the analysis run in ms. */
  durationMs: number;
  /** Grad-CAM explanation overlay (same dimensions as the input image). */
  gradCamUrl?: string;
  /** The analysed image, as a data or bundled URL. */
  imageUrl?: string;
}
