import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Database,
  Eye,
  FlaskConical,
  ListChecks,
  MapPin,
  Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MODEL_CARD } from "@/lib/mock-data";
import { DR_GRADES } from "@/lib/types";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "EyeCare — About & Limitations" },
      {
        name: "description",
        content:
          "About the EyeCare explainable diabetic retinopathy screening research prototype, its scope and limitations.",
      },
      { property: "og:title", content: "EyeCare — About & Limitations" },
      {
        property: "og:description",
        content: "About EyeCare, a research prototype for explainable DR screening.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

const LIMITATIONS = [
  "All predictions in this prototype are mock data. No inference model is connected, so no grade reflects any real retina.",
  "A real model can be wrong. Sensitivity and specificity on rural field images are unknown until validated on local data.",
  "Image quality (focus, exposure, media opacity) strongly affects grading; poor captures should be rejected before analysis.",
  "The five-grade scale simplifies clinical reality. Features such as diabetic macular oedema require separate assessment.",
  "No patient names or identifiers are collected, and none should be entered — records are anonymous screening IDs only.",
  "Explainability heatmaps show model attention, not medically verified lesion locations.",
];

function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          About EyeCare
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A research prototype for explainable diabetic retinopathy screening in
          rural India.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Eye className="size-5 text-primary" aria-hidden="true" />
            The project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Diabetic retinopathy (DR) is a leading cause of preventable blindness, and
            people in rural areas often reach care late. EyeCare is designed so a
            technician at a vision centre or mobile camp can photograph a retina,
            get an immediate DR severity grade, and route sight-threatening cases to
            an ophthalmologist quickly.
          </p>
          <p>
            The screening flow is deliberately explainable: every result is paired
            with a Grad-CAM heatmap so reviewers can see where the model looked, and
            every screening keeps an anonymous record for follow-up and audit.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">The five DR grades</CardTitle>
          <CardDescription>
            International Clinical DR Severity Scale used by the prototype
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DR_GRADES.map((g) => (
            <div key={g.grade} className="flex flex-wrap items-start gap-3 text-sm">
              <span
                className={`mt-1 size-2.5 shrink-0 rounded-full bg-${g.colorToken}`}
                aria-hidden="true"
              />
              <div>
                <p className="font-medium text-foreground">
                  Grade {g.grade} — {g.label}
                </p>
                <p className="text-muted-foreground">{g.recommendation}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-amber-300/60 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg text-amber-950">
            <AlertTriangle className="size-5 text-amber-600" aria-hidden="true" />
            Limitations — read before using
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-amber-900">
            {LIMITATIONS.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Stethoscope className="size-5 text-primary" aria-hidden="true" />
              Referral guidance (placeholder)
            </CardTitle>
            <CardDescription>
              To be configured for each deployment site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              When a screening reaches grade 2 or above, EyeCare flags it for
              referral. The specific partner hospital, teleconsultation contact,
              transport support and follow-up schedule will be defined with the
              local health authority before any deployment.
            </p>
            <p className="rounded-lg bg-muted p-3 text-xs">
              Placeholder — no referral network is connected in this prototype.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Database className="size-5 text-primary" aria-hidden="true" />
              Technical status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Model card: {MODEL_CARD.name}, {MODEL_CARD.version} — synthetic demo
                weights only.
              </li>
              <li className="flex items-start gap-2">
                <ListChecks className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Intended real backend: a FastAPI service at{" "}
                <code className="rounded bg-muted px-1.5 py-0.5">POST /predict</code>,
                already wired into the app's API service layer.
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Planned inputs: colour fundus photographs (JPEG/PNG, ≤10 MB) from
                field camps; no patient personal data.
              </li>
            </ul>
            <p className="text-xs">
              No paid external AI service is used or required.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Medical research prototype disclaimer.
            </span>{" "}
            EyeCare is not a certified medical device and has not been evaluated by
            any regulatory authority. Nothing in this application is medical advice,
            diagnosis or treatment. If you have concerns about your vision, please
            see a qualified eye-care professional.
          </p>
          <Button asChild variant="outline">
            <Link to="/screening">Try the demo flow</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
