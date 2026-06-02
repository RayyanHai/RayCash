"use client";

import type { BudgetStatus } from "@/lib/types";
import { mockBudgetStatuses } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  budgets?: BudgetStatus[];
}

// Friendly display labels for Plaid category codes
const CATEGORY_LABELS: Record<string, string> = {
  FOOD_AND_DRINK: "Food & Drink",
  TRANSPORTATION: "Transportation",
  ENTERTAINMENT: "Entertainment",
  GENERAL_MERCHANDISE: "Shopping",
  PERSONAL_CARE: "Personal Care",
  UTILITIES: "Utilities",
  EDUCATION: "Education",
  TRAVEL: "Travel",
  HEALTH_WELLNESS: "Health & Wellness",
  HOME_IMPROVEMENT: "Home Improvement",
  RENT_AND_UTILITIES: "Rent & Utilities",
};

function formatUSD(value: number) {
  return `$${value.toFixed(2)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function StatusBadge({ status }: { status: BudgetStatus["status"] }) {
  if (status === "over") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        Over budget
      </span>
    );
  }
  if (status === "warning") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        Nearing limit
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
      On track
    </span>
  );
}

function progressBarColor(status: BudgetStatus["status"]) {
  if (status === "over") return "bg-red-500";
  if (status === "warning") return "bg-amber-400";
  return "bg-emerald-500";
}

export default function BudgetsView({ budgets }: Props) {
  const items = budgets ?? mockBudgetStatuses;

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No budgets set up yet.
          </CardContent>
        </Card>
      ) : (
        items.map((budget) => {
          const displayPct = clamp(budget.pct_used, 0, 100);
          const label =
            CATEGORY_LABELS[budget.category] ??
            budget.category.replace(/_/g, " ");

          return (
            <Card key={budget.budget_id} size="sm">
              <CardContent className="space-y-2">
                {/* Top row: category + badge */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-foreground">
                    {label}
                  </span>
                  <StatusBadge status={budget.status} />
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${progressBarColor(budget.status)}`}
                    style={{ width: `${displayPct}%` }}
                  />
                </div>

                {/* Spent / limit labels */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatUSD(budget.spent)} spent of{" "}
                    {formatUSD(budget.limit)}
                  </span>
                  <span>{budget.pct_used.toFixed(0)}% used</span>
                </div>

                {/* Projection */}
                <p className="text-xs text-muted-foreground">
                  Projected:{" "}
                  <span className="font-medium text-foreground">
                    {formatUSD(budget.projected_end_of_period)}
                  </span>{" "}
                  by month end
                </p>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
