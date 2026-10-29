import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ClipboardList,
  ImagePlus,
  ScanEye,
  TrendingUp,
} from "lucide-react";

import { GradeBadge, ReferralChip } from "@/components/grade-badge";
import { MockDataBanner } from "@/components/mock-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { computeStats, MODEL_CARD, MOCK_SCREENINGS } from "@/lib/mock-data";
import { DR_GRADES, gradeInfo } from "@/lib/types";
import { format, formatDistanceToNowStrict } from "date-fns";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EyeCare — Dashboard" },
      {
        name: "description",
        content:
          "Screening statistics and recent activity for the EyeCare diabetic retinopathy research prototype (demo data).",
      },
      { property: "og:title", content: "EyeCare — Dashboard" },
      {
        property: "og:description",
        content: "Screening statistics and recent activity — research prototype with demo data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof TrendingUp;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const stats = computeStats(MOCK_SCREENINGS);
  const recent = [...MOCK_SCREENINGS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  const maxGradeCount = Math.max(...stats.byGrade, 1);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of screening activity at participating vision centres.
          </p>
        </div>
        <Button asChild>
          <Link to="/screening">
            <ImagePlus aria-hidden="true" />
            Start new screening
          </Link>
        </Button>
      </div>

      <MockDataBanner />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Screenings (demo)"
          value={String(stats.total)}
          hint="Mock records in this prototype"
          icon={ClipboardList}
        />
        <StatCard
          label="Referable DR found"
          value={String(stats.referred)}
          hint="Grades 2–4 flagged for referral"
          icon={TrendingUp}
        />
        <StatCard
          label="Referrals pending"
          value={String(stats.pendingReferrals)}
          hint="Awaiting ophthalmologist review"
          icon={ArrowRight}
        />
        <StatCard
          label="Model version"
          value={MODEL_CARD.version}
          hint="Mock weights — no real inference"
          icon={ScanEye}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Grade distribution</CardTitle>
            <CardDescription>Demo screenings by DR severity grade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {DR_GRADES.map((g) => {
              const count = stats.byGrade[g.grade] ?? 0;
              return (
                <div key={g.grade} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                    {g.shortLabel}
                  </span>
                  <div
                    className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted"
                    role="img"
                    aria-label={`${count} screenings graded ${g.shortLabel}`}
                  >
                    <div
                      className={`h-full rounded-full bg-${g.colorToken}`}
                      style={{ width: `${(count / maxGradeCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs tabular-nums text-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">Recent activity</CardTitle>
              <CardDescription>Latest mock screening records</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/history">
                View all
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recent.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.site}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.id} ·{" "}
                      {formatDistanceToNowStrict(new Date(r.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <GradeBadge grade={r.grade} />
                  <ReferralChip status={r.referralStatus} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">About these numbers</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          <p>
            All statistics on this dashboard come from mock records and describe the
            interface only. In a real deployment, each screening would produce a grade
            on the International Clinical DR Severity Scale — from{" "}
            {gradeInfo(0).label} through {gradeInfo(4).label} — with referral guidance
            for sight-threatening grades. Last demo record generated{" "}
            {format(new Date(MOCK_SCREENINGS[0].createdAt), "d MMM yyyy")}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
