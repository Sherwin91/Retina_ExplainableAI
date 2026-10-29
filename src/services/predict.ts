/**
 * Predict API service.
 *
 * Modular client for a future FastAPI inference backend. When
 * VITE_PREDICT_API_URL is configured, images are POSTed to `${base}/predict`.
 * Until then the service runs in clearly-marked MOCK mode and returns
 * deterministic demo data — never a real prediction.
 */

import gradCamMock from "@/assets/fundus-gradcam.jpg";
import { MODEL_CARD, MOCK_BUNDLE } from "@/lib/mock-data";
import { type DrGrade, type ScreeningResult } from "@/lib/types";

const API_BASE = import.meta.env.VITE_PREDICT_API_URL ?? "";
export const PREDICT_ENDPOINT = `${API_BASE || "http://localhost:8000"}/predict`;

export const isMockMode = API_BASE === "";

/** File constraints for fundus image uploads. */
export const UPLOAD_RULES = {
  acceptedTypes: ["image/jpeg", "image/png"] as const[],
  acceptedExtensions: [".jpg", ".jpeg", ".png"],
  maxBytes: 10 * 1024 * 1024, // 10 MB
  minBytes: 10 * 1024, // 10 KB
} as const;

export type UploadValidationError =
  | { kind: "type"; message: string }
  | { kind: "size"; message: string };

export function validateFundusImage(file: File): UploadValidationError | null {
  const name = file.name.toLowerCase();
  const extOk = UPLOAD_RULES.acceptedExtensions.some((ext) => name.endsWith(ext));
  if (!extOk || !UPLOAD_RULES.acceptedTypes.includes(file.type as never)) {
    return {
      kind: "type",
      message: "Unsupported file type. Please upload a JPEG or PNG fundus image.",
    };
  }
  if (file.size > UPLOAD_RULES.maxBytes) {
    return {
      kind: "size",
      message: "Image is larger than 10 MB. Please compress it and try again.",
    };
  }
  if (file.size < UPLOAD_RULES.minBytes) {
    return { kind: "size", message: "Image file looks empty or corrupted." };
  }
  return null;
}

/**
 * Deterministic pseudo-analysis derived from the file so identical inputs
 * give identical demo output. NOT a real model inference.
 */
function mockInference(file: File): ScreeningResult {
  let hash = 0;
  for (const byte of new TextEncoder().encode(file.name + file.size)) {
    hash = (hash * 31 + byte) >>> 0;
  }
  const roll = hash % 100;
  const grade: DrGrade = roll < 55 ? 0 : roll < 75 ? 1 : roll < 88 ? 2 : roll < 95 ? 3 : 4;
  const probabilities: number[] = [0, 1, 2, 3, 4].map((g) =>
    Math.abs(((hash >> (g * 5)) % 100) / 100),
  );
  probabilities[grade] = Math.max(probabilities[grade], 0.62 + (hash % 30) / 100);
  const sum = probabilities.reduce((a, b) => a + b, 0);
  const normalised = probabilities.map((p) => p / sum);

  return {
    id: `SCR-DEMO-${String(hash % 10000).padStart(4, "0")}`,
    site: "Local demo (no site recorded)",
    createdAt: new Date().toISOString(),
    imageLabel: file.name,
    grade,
    confidence: normalised[grade],
    gradeProbabilities: normalised,
    referralStatus: "none",
    reviewedBy: null,
    source: "mock",
    durationMs: 1400 + (hash % 800),
    gradCamUrl: gradCamMock,
    imageUrl: URL.createObjectURL(file),
  };
}

export interface PredictDeps {
  signal?: AbortSignal;
}

/**
 * Run one screening analysis. Uses the real backend when configured,
 * otherwise the deterministic mock above.
 */
export async function runPrediction(
  file: File,
  { signal }: PredictDeps = {},
): Promise<ScreeningResult> {
  if (isMockMode) {
    await new Promise((resolve, reject) => {
      const t = setTimeout(resolve, 2200);
      signal?.addEventListener("abort", () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
    return mockInference(file);
  }

  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(PREDICT_ENDPOINT, {
    method: "POST",
    body: formData,
    signal,
  });
  if (!response.ok) {
    throw new Error(`Inference service returned ${response.status}. Please try again.`);
  }
  const data = (await response.json()) as {
    grade: number;
    grade_probabilities: number[];
    grad_cam_url?: string;
    image_url?: string;
  };
  const grade = data.grade;
  if (!Number.isInteger(grade) || grade < 0 || grade > 4) {
    throw new Error("Inference service returned an invalid grade.");
  }
  return {
    id: `SCR-${Date.now()}`,
    site: "Remote inference",
    createdAt: new Date().toISOString(),
    imageLabel: file.name,
    grade: grade as DrGrade,
    confidence: data.grade_probabilities[grade] ?? 0,
    gradeProbabilities: data.grade_probabilities,
    referralStatus: "none",
    reviewedBy: null,
    source: "model",
    durationMs: 0,
    gradCamUrl: data.grad_cam_url,
    imageUrl: data.image_url,
  };
}

export { MODEL_CARD, MOCK_BUNDLE };
