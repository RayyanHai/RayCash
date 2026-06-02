"use client";

import type { RecurringCandidate } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  candidates: RecurringCandidate[];
  loading?: boolean;
}

function cadenceLabel(days: number): string {
  if (days <= 10) return "Weekly";
  if (days <= 18) return "Bi-weekly";
  if (days <= 35) return "Monthly";
  if (days <= 50) return "Every 6 weeks";
  if (days <= 65) return "Every 2 months";
  return "Quarterly";
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  if (confidence >= 0.8) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
        High confidence
      </span>
    );
  }
  if (confidence >= 0.6) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        Medium confidence
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
      Low confidence
    </span>
  );
}

function formatUSD(v: number) {
  return `$${v.toFixed(2)}`;
}

function capitalize(s: string) {
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function RecurringView({ candidates, loading }: Props) {
  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Detecting recurring charges…
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No recurring charges detected yet. Sync more transactions to let the
          algorithm find your subscriptions.
        </CardContent>
      </Card>
    );
  }

  // Sort: high confidence first
  const sorted = [...candidates].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {sorted.length} recurring charge{sorted.length !== 1 ? "s" : ""} detected
        from your transaction history. These are proposals — confirm or dismiss each
        one.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((c) => (
          <Card key={c.merchant} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {capitalize(c.merchant)}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {c.sample_count} charges detected
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {formatUSD(c.typical_amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cadenceLabel(c.cadence_days)} · every {c.cadence_days}d
                  </p>
                </div>
                <ConfidenceBadge confidence={c.confidence} />
              </div>

              {/* Action stubs — wired in Phase 3+ */}
              <div className="flex gap-2 pt-1">
                <button
                  className="flex-1 rounded-md border border-emerald-600 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                  onClick={() => {/* TODO: POST /recurring/confirm */}}
                >
                  Confirm
                </button>
                <button
                  className="flex-1 rounded-md border border-gray-300 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                  onClick={() => {/* TODO: POST /recurring/dismiss */}}
                >
                  Dismiss
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
