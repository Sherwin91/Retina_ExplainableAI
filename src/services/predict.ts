/**
 * Predict API service.
 *
 * Modular client for a future FastAPI inference backend. When
 * VITE_PREDICT_API_URL is configured, images are POSTed to `${base}/predict`.
 * Until then the service runs in clearly-marked DEMO mode and returns an
 * uploaded image without a prediction.
 */

import { MODEL_CARD } from "@/lib/mock-data";
import { type DrGrade, type ScreeningResult } from "@/lib/types";

const API_BASE = import.meta.env["VITE_PREDICT_API_URL"] ?? "";
export const PREDICT_ENDPOINT = `${API_BASE || "http://localhost:8000"}/predict`;

export const isMockMode = API_BASE === "";

/** File constraints for fundus image uploads. */
export const UPLOAD_RULES = {
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  acceptedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  maxBytes: 10 * 1024 * 1024, // 10 MB
  minBytes: 10 * 1024, // 10 KB
} as const;

export type UploadValidationError =
  { kind: "type"; message: string } | { kind: "size"; message: string };

export function validateFundusImage(file: File): UploadValidationError | null {
  const name = file.name.toLowerCase();
  const extOk = UPLOAD_RULES.acceptedExtensions.some((ext) => name.endsWith(ext));
  if (!extOk || !UPLOAD_RULES.acceptedTypes.includes(file.type as never)) {
    return {
      kind: "type",
      message: "Unsupported file type. Please upload a JPEG, PNG, or WebP fundus image.",
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
 * Demo mode prepares the image for the UI but intentionally has no grade,
 * confidence, or explanation data.
 */
function demoUploadResult(file: File): ScreeningResult {
  return {
    id: `SCR-DEMO-${Date.now()}`,
    site: "Local demo (no site recorded)",
    createdAt: new Date().toISOString(),
    imageLabel: file.name,
    referralStatus: "none",
    reviewedBy: null,
    source: "mock",
    imageUrl: URL.createObjectURL(file),
    durationMs: 0,
  };
}

export interface PredictDeps {
  signal?: AbortSignal;
}

interface PredictResponse {
  status: "prediction";
  model_version: string;
  predicted_grade: number;
  grade_probabilities: number[];
  confidence?: number;
  explainability?: {
    status?: string;
    heatmap_url?: string;
  };
}

function isPredictResponse(
  data: PredictResponse | { detail?: { message?: string } },
): data is PredictResponse {
  return "status" in data && data.status === "prediction";
}

/**
 * Run one screening analysis. Uses the real backend when configured,
 * otherwise returns a demo record without a prediction. A demo upload must
 * never be presented as a clinical grade or confidence.
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
    return demoUploadResult(file);
  }

  const formData = new FormData();
  formData.append("image", file);
  const request: RequestInit = {
    method: "POST",
    body: formData,
  };
  if (signal) request.signal = signal;
  const response = await globalThis.fetch(PREDICT_ENDPOINT, request);
  let data: PredictResponse | { detail?: { message?: string } };
  try {
    data = (await response.json()) as PredictResponse | { detail?: { message?: string } };
  } catch {
    throw new Error(
      `Inference service returned an unreadable response (${response.status}). Please try again.`,
    );
  }
  if (!response.ok) {
    const message =
      "detail" in data && data.detail?.message
        ? data.detail.message
        : `Inference service returned ${response.status}.`;
    throw new Error(`${message} Please try again.`);
  }
  if (!isPredictResponse(data)) {
    throw new Error("Inference service returned an invalid response.");
  }
  const grade = data.predicted_grade;
  if (!Number.isInteger(grade) || grade < 0 || grade > 4) {
    throw new Error("Inference service returned an invalid grade.");
  }
  if (
    data.grade_probabilities.length !== 5 ||
    data.grade_probabilities.some((probability) => !Number.isFinite(probability) || probability < 0)
  ) {
    throw new Error("Inference service returned invalid grade probabilities.");
  }
  const confidence = data.confidence ?? data.grade_probabilities[grade];
  if (
    confidence === undefined ||
    !Number.isFinite(confidence) ||
    confidence < 0 ||
    confidence > 1
  ) {
    throw new Error("Inference service returned invalid confidence.");
  }
  const result: ScreeningResult = {
    id: `SCR-${Date.now()}`,
    site: "Remote inference",
    createdAt: new Date().toISOString(),
    imageLabel: file.name,
    grade: grade as DrGrade,
    confidence,
    gradeProbabilities: data.grade_probabilities,
    referralStatus: "none",
    reviewedBy: null,
    source: "model",
    durationMs: 0,
    imageUrl: URL.createObjectURL(file),
  };
  const heatmapUrl = data.explainability?.heatmap_url;
  if (heatmapUrl) result.gradCamUrl = heatmapUrl;
  return result;
}

export { MODEL_CARD };
