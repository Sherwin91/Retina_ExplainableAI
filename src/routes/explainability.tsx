import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanEye, UploadCloud } from "lucide-react";
import { useState } from "react";

import { MockDataBanner } from "@/components/mock-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useCurrentResult } from "@/lib/screening-store";

export const Route = createFileRoute("/explainability")({
  head: () => ({
    meta: [
      { title: "EyeCare — Explainability" },
      {
        name: "description",
        content: "Model attention visualization for the EyeCare research prototype.",
      },
    ],
  }),
  component: Explainability,
});

function Explainability() {
  const result = useCurrentResult();
  const [opacity, setOpacity] = useState(55);
  const imageUrl = result?.imageUrl;
  const gradCamUrl = result?.gradCamUrl;
  const hasHeatmap = Boolean(gradCamUrl);
  const hasImage = Boolean(imageUrl);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Explainability
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review model attention only when a real explanation is available.
          </p>
        </div>
        <Badge variant="outline" className="border-amber-300/60 bg-amber-50 text-amber-900">
          {hasHeatmap ? "Model heatmap" : "Heatmap unavailable"}
        </Badge>
      </div>
      {result?.source !== "model" && <MockDataBanner />}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display text-lg">Image viewer</CardTitle>
            <CardDescription>
              Use fit-to-screen viewing and adjust heatmap opacity when an actual Grad-CAM output is
              returned.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {hasImage ? (
              <div className="relative mx-auto max-w-md overflow-hidden rounded-lg bg-black">
                <img
                  src={imageUrl}
                  alt="Uploaded fundus photograph"
                  className="w-full object-contain"
                />
                {hasHeatmap && (
                  <img
                    src={gradCamUrl}
                    alt="Grad-CAM model attention overlay"
                    className="absolute inset-0 size-full object-contain"
                    style={{ opacity: opacity / 100 }}
                  />
                )}
                {!hasHeatmap && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 p-6 text-center text-sm font-medium text-white">
                    Grad-CAM placeholder — no real heatmap is available
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                Upload an image first. No fundus image or heatmap is available in this session.
              </div>
            )}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fundus only</span>
                <span>Opacity {opacity}%</span>
                <span>Heatmap only</span>
              </div>
              <Slider
                value={[opacity]}
                onValueChange={([value]) => {
                  if (value !== undefined) setOpacity(value);
                }}
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
                Grad-CAM heatmaps indicate regions that influenced a model output; they do not prove
                clinical reasoning or identify lesions reliably.
              </p>
              <p>
                A bright region does not confirm disease, and a dark region does not rule it out.
                Any future output requires clinical review.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">No explanation yet?</CardTitle>
              <CardDescription>Run a screening to load its image into this viewer.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/screening">
                  <UploadCloud aria-hidden="true" /> New screening
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
