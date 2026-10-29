import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  ImagePlus,
  Loader2,
  RotateCcw,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { MockDataBanner } from "@/components/mock-banner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { setCurrentResult } from "@/lib/screening-store";
import {
  UPLOAD_RULES,
  isMockMode,
  runPrediction,
  validateFundusImage,
} from "@/services/predict";

export const Route = createFileRoute("/screening")({
  head: () => ({
    meta: [
      { title: "EyeCare — New Screening" },
      {
        name: "description",
        content:
          "Upload a retinal fundus image for diabetic retinopathy screening (research prototype, demo analysis).",
      },
      { property: "og:title", content: "EyeCare — New Screening" },
      {
        property: "og:description",
        content: "Upload a retinal fundus image for demo DR screening.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewScreening,
});

type Phase = "idle" | "ready" | "analyzing" | "error";

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function NewScreening() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");

  const acceptFile = useCallback((candidate: File | undefined | null) => {
    if (!candidate) return;
    const problem = validateFundusImage(candidate);
    if (problem) {
      setError(problem.message);
      setFile(null);
      setPreview(null);
      setPhase("idle");
      return;
    }
    setError(null);
    setFile(candidate);
    setPreview(URL.createObjectURL(candidate));
    setPhase("ready");
  }, []);

  const clearFile = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setError(null);
    setPhase("idle");
  }, [preview]);

  const analyze = useCallback(async () => {
    if (!file) return;
    setPhase("analyzing");
    setError(null);
    try {
      const result = await runPrediction(file);
      clearFile();
      setCurrentResult(result);
      await navigate({ to: "/results" });
    } catch (err) {
      setPhase("error");
      setError(
        err instanceof Error && err.name !== "AbortError"
          ? err.message
          : "Analysis failed. Please check the image and try again.",
      );
    }
  }, [file, clearFile, navigate]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          New Screening
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a retinal fundus photograph to run a demo DR analysis. No patient
          names or personal details are required.
        </p>
      </div>

      <MockDataBanner />

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Fundus image</CardTitle>
          <CardDescription>
            JPEG or PNG · {formatBytes(UPLOAD_RULES.maxBytes)} maximum · colour fundus
            photograph, one eye per image
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!preview ? (
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload fundus image"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                acceptFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
                dragActive
                  ? "border-primary bg-accent"
                  : "border-border bg-muted/40 hover:border-primary/50 hover:bg-accent/50"
              }`}
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <UploadCloud className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drag &amp; drop the fundus image here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={UPLOAD_RULES.acceptedTypes.join(",")}
                className="sr-only"
                onChange={(e) => {
                  acceptFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 rounded-xl border bg-muted/40 p-4 sm:flex-row sm:items-start">
                <img
                  src={preview}
                  alt="Uploaded fundus image preview"
                  width={220}
                  height={220}
                  className="size-[220px] rounded-lg bg-black object-contain"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="truncate text-sm font-medium text-foreground" title={file?.name}>
                    {file?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file ? formatBytes(file.size) : ""} · ready for demo analysis
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-grade-0" aria-hidden="true" />
                      File type validated (JPEG/PNG)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-grade-0" aria-hidden="true" />
                      Size within the 10 MB limit
                    </li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFile}
                  disabled={phase === "analyzing"}
                >
                  <Trash2 aria-hidden="true" />
                  Remove
                </Button>
              </div>

              {phase === "analyzing" ? (
                <div className="space-y-3 rounded-xl border bg-accent/40 p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
                    <p className="text-sm font-medium text-foreground">
                      Analyzing image… running the demo model
                    </p>
                  </div>
                  <Progress value={70} className="h-2" aria-label="Analysis in progress" />
                  <p className="text-xs text-muted-foreground">
                    Mock inference — the response is simulated and takes a few seconds.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={analyze} className="flex-1 sm:flex-none">
                    <Eye aria-hidden="true" />
                    Analyze image
                  </Button>
                  <Button variant="outline" onClick={clearFile}>
                    Choose another image
                  </Button>
                </div>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive" role="alert">
              <AlertCircle className="size-4" aria-hidden="true" />
              <AlertTitle>Upload problem</AlertTitle>
              <AlertDescription className="flex flex-wrap items-center gap-3">
                {error}
                {phase === "error" && (
                  <Button size="sm" variant="outline" onClick={clearFile}>
                    <RotateCcw aria-hidden="true" />
                    Start over
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Analysis service:{" "}
        <code className="rounded bg-muted px-1.5 py-0.5">POST /predict</code> —{" "}
        {isMockMode
          ? "not configured yet, so this prototype runs in clearly-marked mock mode."
          : "configured; responses still pass through demo validation."}{" "}
        Images never leave this device in mock mode.
      </p>
    </div>
  );
}
