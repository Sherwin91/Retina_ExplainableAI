import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Info, ScanEye, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

import { MockDataBanner } from "@/components/mock-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrentResult } from "@/lib/screening-store";
import { DR_GRADES, gradeInfo } from "@/lib/types";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "EyeCare — Screening Result" },
      {
        name: "description",
        content: "Screening result interface for the EyeCare research prototype.",
      },
    ],
  }),
  component: Results,
});

function Results() {
  const result = useCurrentResult();
  const hasPrediction = result?.source === "model" && result.grade !== undefined;
  const info =
    result?.source === "model" && result.grade !== undefined ? gradeInfo(result.grade) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Screening Result
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result
              ? `${result.id} · ${format(new Date(result.createdAt), "d MMM yyyy, HH:mm")}`
              : "No screening has been analyzed in this session"}
          </p>
        </div>
        <span className="rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
          {result?.source === "model" ? "Model output" : "Demo UI"}
        </span>
      </div>

      {result?.source !== "model" && <MockDataBanner />}

      {!result ? (
        <Card className="border-primary/30 bg-accent/30">
          <CardContent className="flex flex-col items-start gap-4 p-6">
            <Info className="size-8 text-primary" aria-hidden="true" />
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Demo UI — no real model prediction
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Upload an image from New Screening to preview the result interface. Until a
                validated model backend is connected, EyeCare will not show a grade, confidence,
                probability, or diagnosis.
              </p>
            </div>
            <Button asChild>
              <Link to="/screening">
                Start a demo upload <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display text-lg">Uploaded image</CardTitle>
              <CardDescription>{result.imageLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              {result.imageUrl ? (
                <img
                  src={result.imageUrl}
                  alt="Uploaded fundus image"
                  className="w-full rounded-lg bg-black object-contain"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                  Image unavailable
                </div>
              )}
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/explainability">
                  <ScanEye aria-hidden="true" /> View explainability
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-3">
            <Card className={!hasPrediction ? "border-primary/30" : undefined}>
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  {hasPrediction ? "Predicted grade" : "Prediction unavailable in demo mode"}
                </CardTitle>
                <CardDescription>
                  {hasPrediction
                    ? `International Clinical DR Severity Scale · confidence ${(result.confidence! * 100).toFixed(1)}%`
                    : "No grade or confidence is displayed because no real model response is connected."}
                </CardDescription>
              </CardHeader>
              {hasPrediction && info ? (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                    {DR_GRADES.map((grade) => (
                      <div
                        key={grade.grade}
                        className={`rounded-lg border p-3 text-center ${grade.grade === result.grade ? "ring-2 ring-ring" : "bg-muted/40"}`}
                      >
                        <span
                          className={`mx-auto block size-2.5 rounded-full bg-${grade.colorToken}`}
                          aria-hidden="true"
                        />
                        <p className="mt-2 text-xs font-semibold">{grade.shortLabel}</p>
                        <p className="text-[10px] text-muted-foreground">Grade {grade.grade}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-display text-xl font-semibold">{info.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{info.recommendation}</p>
                  </div>
                  <div className="space-y-2 border-t pt-4">
                    <p className="text-sm font-medium">Class probabilities</p>
                    {DR_GRADES.map((grade) => {
                      const probability = result.gradeProbabilities?.[grade.grade] ?? 0;
                      return (
                        <div key={grade.grade} className="flex items-center gap-3">
                          <span className="w-24 shrink-0 text-xs text-muted-foreground">
                            {grade.shortLabel}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full bg-${grade.colorToken}`}
                              style={{ width: `${probability * 100}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-xs tabular-nums">
                            {(probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              ) : (
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    This uploaded image is available for interface testing only. A qualified
                    clinician must make any clinical assessment.
                  </p>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  Referral guidance placeholder
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                Referral pathways, partner facilities, and follow-up instructions will be configured
                with local health authorities before deployment.
              </CardContent>
            </Card>

            <Alert className="border-destructive/30 bg-destructive/5">
              <ShieldAlert className="size-4 text-destructive" aria-hidden="true" />
              <AlertDescription>
                This interface is not a medical diagnosis. Do not use it to make clinical decisions.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/screening">
            Run another screening <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/history">Screening history</Link>
        </Button>
      </div>
    </div>
  );
}
