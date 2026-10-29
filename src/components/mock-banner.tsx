import { FlaskConical } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Persistent reminder that every prediction in the app is mock data.
 * Shown on every data-bearing page until a real model backend exists.
 */
export function MockDataBanner({ className }: { className?: string }) {
  return (
    <Alert className={`border-amber-300/60 bg-amber-50 text-amber-950 ${className ?? ""}`}>
      <FlaskConical className="size-4 text-amber-600" aria-hidden="true" />
      <AlertTitle className="font-display font-semibold">
        Demo data — not real medical results
      </AlertTitle>
      <AlertDescription className="text-amber-900">
        EyeCare is a research prototype. Every grade, confidence and heatmap shown
        here is mock output used to evaluate the interface. It must not be used for
        diagnosis or clinical decisions.
      </AlertDescription>
    </Alert>
  );
}
