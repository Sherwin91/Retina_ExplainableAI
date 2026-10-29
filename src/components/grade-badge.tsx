import { Badge } from "@/components/ui/badge";
import { gradeInfo, type DrGrade } from "@/lib/types";

/** Coloured status badge for a DR grade, using grade severity tokens. */
export function GradeBadge({ grade, className }: { grade: DrGrade; className?: string }) {
  const info = gradeInfo(grade);
  return (
    <Badge
      variant="outline"
      className={`border-transparent bg-${info.colorToken}/15 font-medium text-${info.colorToken} ${className ?? ""}`}
    >
      <span className={`size-1.5 rounded-full bg-${info.colorToken}`} aria-hidden="true" />
      {info.shortLabel}
    </Badge>
  );
}

export function ReferralChip({ status }: { status: "none" | "pending" | "completed" }) {
  const map = {
    none: { label: "Not referred", cls: "bg-muted text-muted-foreground" },
    pending: { label: "Referral pending", cls: "bg-grade-2/15 text-grade-2" },
    completed: { label: "Referral completed", cls: "bg-grade-0/15 text-grade-0" },
  } as const;
  const { label, cls } = map[status];
  return (
    <Badge variant="outline" className={`border-transparent ${cls}`}>
      {label}
    </Badge>
  );
}
