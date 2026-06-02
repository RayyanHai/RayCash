"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getMonthlyReport } from "@/lib/api";
import type { MonthlyReport } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SpendingByCategoryChart from "@/app/dashboard/_components/SpendingByCategoryChart";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUSD(v: number, opts?: { sign?: boolean }) {
  const abs = Math.abs(v).toFixed(2);
  const prefix = opts?.sign ? (v >= 0 ? "+" : "−") : "$";
  return opts?.sign ? `${prefix}$${abs}` : `$${abs}`;
}

function formatPct(v: number, opts?: { sign?: boolean }) {
  const abs = Math.abs(v).toFixed(1);
  const sign = opts?.sign ? (v >= 0 ? "+" : "−") : "";
  return `${sign}${abs}%`;
}

function prevMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return m === 1
    ? `${y - 1}-12`
    : `${y}-${String(m - 1).padStart(2, "0")}`;
}

function nextMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return m === 12
    ? `${y + 1}-01`
    : `${y}-${String(m + 1).padStart(2, "0")}`;
}

function friendlyMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
}

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
  UNCATEGORIZED: "Uncategorized",
};

function catLabel(k: string) {
  return CATEGORY_LABELS[k] ?? k.replace(/_/g, " ");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const router = useRouter();
  const initialized = useRef(false);

  const today = new Date();
  const currentPeriod = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  const [userId, setUserId] = useState<string | null>(null);
  const [period, setPeriod] = useState(currentPeriod);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Init: read userId from localStorage
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const id = localStorage.getItem("raycash_user_id");
    if (!id) {
      router.replace("/login");
      return;
    }
    setUserId(id);
  }, [router]);

  // Fetch report whenever userId or period changes
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError("");
    getMonthlyReport(userId, period)
      .then((r) => {
        setReport(r);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, [userId, period]);

  const isFuture = period > currentPeriod;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
      {/* Header + period nav */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monthly Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deterministic breakdown — no AI, just your numbers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod(prevMonth(period))}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition"
          >
            ←
          </button>
          <span className="min-w-[140px] text-center text-sm font-medium">
            {friendlyMonth(period)}
          </span>
          <button
            onClick={() => setPeriod(nextMonth(period))}
            disabled={isFuture}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Loading report…
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load report: {error}
        </div>
      )}

      {!loading && !error && report && (
        <>
          {/* Hero: total spent + vs prior */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">
                  {formatUSD(report.total_spent)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  vs. Prior Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-3xl font-bold tabular-nums ${
                    report.vs_prior_month.delta > 0
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {formatUSD(report.vs_prior_month.delta, { sign: true })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatPct(report.vs_prior_month.pct, { sign: true })} change
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Budgets On Track
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.budgets.length === 0 ? (
                  <p className="text-3xl font-bold text-muted-foreground">—</p>
                ) : (
                  <>
                    <p className="text-3xl font-bold tabular-nums">
                      {report.budgets.filter((b) => b.status === "under").length}
                      <span className="text-lg font-normal text-muted-foreground">
                        /{report.budgets.length}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      budgets under limit
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Spending by category chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(report.totals_by_category).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No spending data for this period.
                </p>
              ) : (
                <SpendingByCategoryChart
                  totals={report.totals_by_category}
                />
              )}
            </CardContent>
          </Card>

          {/* Top movers */}
          {report.top_movers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Movers vs. Prior Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {report.top_movers.map((m) => (
                    <div
                      key={m.category}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{catLabel(m.category)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatUSD(m.current)} this month · {formatUSD(m.prior)} prior
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold tabular-nums ${
                            m.delta > 0 ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {formatUSD(m.delta, { sign: true })}
                        </p>
                        <p
                          className={`text-xs ${
                            m.delta > 0 ? "text-red-500" : "text-emerald-500"
                          }`}
                        >
                          {formatPct(m.pct, { sign: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-budget table */}
          {report.budgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Budget Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {report.budgets.map((b) => {
                    const pct = Math.min(100, Number(b.pct_used));
                    const barColor =
                      b.status === "over"
                        ? "bg-red-500"
                        : b.status === "warning"
                        ? "bg-amber-400"
                        : "bg-emerald-500";
                    return (
                      <div key={String(b.budget_id)} className="py-3 space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{catLabel(b.category)}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {formatUSD(Number(b.spent))} / {formatUSD(Number(b.limit))}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
