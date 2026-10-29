import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ScanEye, UploadCloud } from "lucide-react";

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
import { Slider } from "@/components/ui/slider";
import { MOCK_SCREENINGS, fundusSample1 } from "@/lib/mock-data";
import { useCurrentResult } from "@/lib/screening-store";
import { gradeInfo } from "@/lib/types";
import gradCamDemo from "@/assets/fundus-gradcam.jpg";

export const Route = createFileRoute("/explainability")({
  head: () => ({
    meta: [
      { title: "EyeCare — Explainability" },
      {
        name: "description",
        content:
          "Grad-CAM heatmap explanation of the diabetic retinopathy screening model (demo data, adjustable overlay opacity).",
      },
      { property: "og:title", content: "EyeCare — Explainability" },
      {
        property: "og:description",
        content: "Grad-CAM heatmap overlay with adjustable opacity — demo data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Explainability,
});

function Explainability() {
  const current = useCurrentResult();
  const demo = current ?? {
    ...MOCK_SCREENINGS[3],
    imageUrl: fundusSample1,
    gradCamUrl: gradCamDemo,
  };
  const hasHeatmap = Boolean(demo.gradCamUrl);
  const [opacity, setOpacity] = useState(55);

  const base = demo.imageUrl ?? fundusSample1;
  const overlay = demo.gradCamUrl ?? gradCamDemo;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Explainability
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Where the model looked — Grad-CAM attention overlay for {demo.id}.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-amber-300/60 bg-amber-50 text-amber-900"
        >
          Demo heatmap
        </Badge>
      </div>

      <MockDataBanner />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display text-lg">Heatmap overlay</CardTitle>
            <CardDescription>
              Red areas = strongest model attention. Adjust the opacity slider to blend
              the heatmap over the original fundus image.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-lg bg-black">
              <img
                src={base}
                alt="Original fundus photograph"
                width={640}
                height={640}
                loading="lazy"
                className="w-full object-contain"
              />
              <img
                src={overlay}
                alt="Grad-CAM attention heatmap overlay (demo)"
                width={640}
                height={640}
                loading="lazy"
                aria-hidden="true"
                className="absolute inset-0 size-full object-contain transition-opacity"
                style={{ opacity: hasHeatmap ? opacity / 100 : 0 }}
              />
              <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                Fundus · {demo.imageLabel}
              </span>
              <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                Grad-CAM · {opacity}%
              </span>
            </div>

            <div className="space-y-2 px-1">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Fundus only</span>
                <span className="text-foreground">Opacity {opacity}%</span>
                <span>Heatmap only</span>
              </div>
              <Slider
                value={[opacity]}
                onValueChange={([v]) => setOpacity(v)}
                max={100}
                min={0}
                step={1}
                aria-label="Heatmap overlay opacity"
                disabled={!hasHeatmap}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <ScanEye className="size-5 text-primary" aria-hidden="true" />
                How to read this
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Grad-CAM highlights the image regions that contributed most to the
                predicted grade — in this demo, the lesion clusters in the upper-left
                retina and near the macula.
              </p>
              <p>
                It shows model attention, not clinical certainty. A bright region does
                not confirm disease, and a dark region does not rule it out.
              </p>
              <p className="rounded-lg bg-muted p-3 text-xs">
                Predicted grade for this record:{" "}
                <span className="font-semibold text-foreground">
                  {gradeInfo(demo.grade).label}
                </span>{" "}
                (demo). Review by an ophthalmologist is always required.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">
                {hasHeatmap ? "Try another image" : "No analysis yet"}
              </CardTitle>
              <CardDescription>
                {hasHeatmap
                  ? "Run a new demo screening to generate a fresh explanation."
                  : "Run a demo screening first to see an explanation."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/screening">
                  <UploadCloud aria-hidden="true" />
                  New screening
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
