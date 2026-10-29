import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Hospital,
  Info,
  ScanEye,
  ShieldAlert,
} from "lucide-react";

import { MockDataBanner } from "@/components/mock-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCurrentResult } from "@/lib/screening-store";
import { MOCK_SCREENINGS } from "@/lib/mock-data";
import { fundusSample1 } from "@/lib/demo-bundle";
import {
  DR_GRADES,
  gradeInfo,
  type ScreeningResult,
} from "@/lib/types";
import { format } from "date-fns";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "EyeCare — Screening Result" },
      {
        name: "description",
        content:
          "Demo diabetic retinopathy grading across five severity levels with referral guidance (research prototype).",
      },
      { property: "og:title", content: "EyeCare — Screening Result" },
      {
        property: "og:description",
        content: "Demo DR grading with referral guidance — research prototype.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Results,
});

/** Demo record shown when no analysis has run yet in this session. */
function demoResult(): ScreeningResult {
  const r = MOCK_SCREENINGS[3];
  return {
    ...r,
    source: "mock",
    durationMs: 1850,
    gradCamUrl: undefined,
    imageUrl: fundusSample1,
  };
}

function Results() {
  const current = useCurrentResult();
  const result = current ?? demoResult();
  const info = gradeInfo(result.grade);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Screening Result
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.id} · {format(new Date(result.createdAt), "d MMM yyyy, HH:mm")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={
              result.source === "mock"
                ? "border-amber-300/60 bg-amber-50 text-amber-900"
                : "border-transparent bg-grade-0/15 text-grade-0"
            }
          >
            {result.source === "mock" ? "Mock output" : "Model output"}
          </Badge>
          {!current && (
            <Badge variant="outline" className="border-transparent bg-muted text-muted-foreground">
              Demo record
            </Badge>
          )}
        </div>
      </div>

      <MockDataBanner />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Analysed image</CardTitle>
            <CardDescription>{result.imageLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            {result.imageUrl ? (
              <img
                src={result.imageUrl}
                alt="Fundus image used for this screening"
                width={420}
                height={420}
                loading="lazy"
                className="w-full rounded-lg bg-black object-contain"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                Image unavailable
              </div>
            )}
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to="/explainability">
                <ScanEye aria-hidden="true" />
                View Grad-CAM explanation
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Predicted grade</CardTitle>
              <CardDescription>
                International Clinical DR Severity Scale · demo confidence{" "}
                {(result.confidence * 100).toFixed(1)}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                {DR_GRADES.map((g) => {
                  const active = g.grade === result.grade;
                  return (
                    <div
                      key={g.grade}
                      aria-current={active ? "true" : undefined}
                      className={`rounded-lg border p-3 text-center transition-colors ${
                        active
                          ? "border-transparent ring-2 ring-ring"
                          : "bg-muted/40"
                      }`}
                    >
                      <span
                        className={`mx-auto block size-2.5 rounded-full bg-${g.colorToken} ${
                          active ? "" : "opacity-40"
                        }`}
                        aria-hidden="true"
                      />
                      <p
                        className={`mt-2 text-xs font-semibold ${
                          active ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {g.shortLabel}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Grade {g.grade}</p>
                    </div>
                  );
                })}
              </div>

              <div>
                <p className="font-display text-xl font-semibold text-foreground">
                  {info.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {info.recommendation}
                </p>
              </div>

              <Separator />

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Class probabilities (demo)
                </p>
                <div className="space-y-2">
                  {DR_GRADES.map((g) => {
                    const p = result.gradeProbabilities[g.grade] ?? 0;
                    return (
                      <div key={g.grade} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-xs text-muted-foreground">
                          {g.shortLabel}
                        </span>
                        <div
                          className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                          role="img"
                          aria-label={`${(p * 100).toFixed(1)}% ${g.shortLabel}`}
                        >
                          <div
                            className={`h-full rounded-full bg-${g.colorToken}`}
                            style={{ width: `${Math.max(p * 100, 2)}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs tabular-nums text-foreground">
                          {(p * 100).toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {info.refersToSpecialist && (
            <Card className="border-grade-2/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <Hospital className="size-5 text-grade-2" aria-hidden="true" />
                  Referral guidance (placeholder)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Next steps:</span> share
                  this record with the partner ophthalmologist for teleconsultation and
                  schedule an in-person visit at the nearest district hospital.
                </p>
                <p>
                  Nearest referral centre, transport support and follow-up scheduling
                  will be configured per deployment site.
                </p>
              </CardContent>
            </Card>
          )}

          <Alert className="border-destructive/30 bg-destructive/5">
            <ShieldAlert className="size-4 text-destructive" aria-hidden="true" />
            <AlertCardTitle />
            <AlertDescription className="text-sm">
              {result.source === "mock"
                ? "This result was produced by mock logic, not a medical model. It must never be used for diagnosis or treatment decisions."
                : "Model outputs are investigational and require review by a qualified ophthalmologist before any clinical decision."}
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/screening">
            Run another screening
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/history">
            <Info aria-hidden="true" />
            Screening history
          </Link>
        </Button>
      </div>
    </div>
  );
}

/** Small wrapper so the alert title uses the display font. */
function AlertCardTitle() {
  return (
    <span className="font-display font-semibold text-foreground">
      Not a medical diagnosis
    </span>
  );
}
