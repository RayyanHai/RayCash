// NOTE: This component requires recharts. Run: pnpm add recharts
// (recharts is not yet in package.json — the user will install it)

"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Transaction } from "@/lib/types";
import { mockTransactions } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Range = "1m" | "3m" | "6m";

interface Props {
  transactions?: Transaction[];
  range?: Range;
}

function formatUSD(value: number) {
  return `$${value.toFixed(0)}`;
}

function getWeekKey(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  // Get Monday of the week
  const day = date.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

function getDayKey(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

function cutoffDate(range: Range): Date {
  const now = new Date();
  const months = range === "1m" ? 1 : range === "3m" ? 3 : 6;
  const d = new Date(now);
  d.setMonth(d.getMonth() - months);
  return d;
}

export default function SpendingOverTimeChart({
  transactions,
  range: initialRange = "3m",
}: Props) {
  const [range, setRange] = useState<Range>(initialRange);

  const data = useMemo(() => {
    const txns = transactions ?? mockTransactions;
    const cutoff = cutoffDate(range);

    // Filter to debits only (amount < 0) within the range
    const filtered = txns.filter((tx) => {
      if (tx.amount >= 0) return false;
      const txDate = new Date(tx.date + "T00:00:00");
      return txDate >= cutoff;
    });

    // Group by week (1m uses day-level granularity)
    const grouped: Record<string, number> = {};
    for (const tx of filtered) {
      const key = range === "1m" ? getDayKey(tx.date) : getWeekKey(tx.date);
      grouped[key] = (grouped[key] ?? 0) + Math.abs(tx.amount);
    }

    // Sort by key (MM/DD strings sort lexicographically correctly within a year)
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, total]) => ({ label, total: parseFloat(total.toFixed(2)) }));
  }, [transactions, range]);

  const ranges: Range[] = ["1m", "3m", "6m"];

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Spending Over Time</CardTitle>
          <div className="flex gap-1">
            {ranges.map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "outline"}
                size="xs"
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No spending data for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={data}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatUSD}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                formatter={(value: number) => [formatUSD(value), "Spent"]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#spendGradient)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
