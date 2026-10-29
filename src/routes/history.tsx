import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { History as HistoryIcon, Search } from "lucide-react";

import { GradeBadge, ReferralChip } from "@/components/grade-badge";
import { MockDataBanner } from "@/components/mock-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_SCREENINGS } from "@/lib/mock-data";
import { DR_GRADES } from "@/lib/types";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "EyeCare — Screening History" },
      {
        name: "description",
        content:
          "Search and filter past diabetic retinopathy screenings by grade and referral status (demo records).",
      },
      { property: "og:title", content: "EyeCare — Screening History" },
      {
        property: "og:description",
        content: "Search and filter past demo screenings by grade and referral status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

const REFERRAL_FILTERS = [
  { value: "all", label: "All referral statuses" },
  { value: "pending", label: "Referral pending" },
  { value: "completed", label: "Referral completed" },
  { value: "none", label: "No referral needed" },
] as const;

function HistoryPage() {
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [referralFilter, setReferralFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const records = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_SCREENINGS.filter((r) => {
      if (q && !`${r.id} ${r.site}`.toLowerCase().includes(q)) return false;
      if (gradeFilter !== "all" && String(r.grade) !== gradeFilter) return false;
      if (referralFilter !== "all" && r.referralStatus !== referralFilter) return false;
      return true;
    }).sort((a, b) =>
      sortOrder === "newest"
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt),
    );
  }, [query, gradeFilter, referralFilter, sortOrder]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Screening History
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mock records only — search by screening ID or site, filter by grade and referral status.
        </p>
      </div>

      <MockDataBanner />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by screening ID or site…"
              className="pl-9"
              aria-label="Search screenings"
            />
          </div>
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="md:w-52" aria-label="Filter by DR grade">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All DR grades</SelectItem>
              {DR_GRADES.map((g) => (
                <SelectItem key={g.grade} value={String(g.grade)}>
                  {g.shortLabel} (grade {g.grade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={referralFilter} onValueChange={setReferralFilter}>
            <SelectTrigger className="md:w-56" aria-label="Filter by referral status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REFERRAL_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="md:w-44" aria-label="Sort screening history">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Screening</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Site</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                  <th className="px-4 py-3 font-medium">Referral</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{r.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(r.createdAt), "d MMM yyyy")}
                    </td>
                    <td className="px-4 py-3 text-foreground">{r.site}</td>
                    <td className="px-4 py-3">
                      <GradeBadge grade={r.grade} />
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {(r.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3">
                      <ReferralChip status={r.referralStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {records.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
              <HistoryIcon className="size-8 text-muted-foreground/60" aria-hidden="true" />
              <p className="font-medium text-foreground">No matching screenings</p>
              <p className="text-sm text-muted-foreground">
                Try a different search term or clear the filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setGradeFilter("all");
                  setReferralFilter("all");
                  setSortOrder("newest");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        <Badge variant="outline" className="mr-2 border-transparent bg-muted text-muted-foreground">
          Demo
        </Badge>
        Showing {records.length} of {MOCK_SCREENINGS.length} mock records.
      </p>
    </div>
  );
}
