// NOTE: This component requires recharts. Run: pnpm add recharts
// (recharts is not yet in package.json — the user will install it)

"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { mockMonthlyReport } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  totals?: Record<string, number>;
}

// Friendly display labels for Plaid category codes
const CATEGORY_LABELS: Record<string, string> = {
  FOOD_AND_DRINK: "Food & Drink",
  TRANSPORTATION: "Transport",
  ENTERTAINMENT: "Entertainment",
  GENERAL_MERCHANDISE: "Shopping",
  PERSONAL_CARE: "Personal Care",
  UTILITIES: "Utilities",
  EDUCATION: "Education",
  TRAVEL: "Travel",
  HEALTH_WELLNESS: "Health",
  HOME_IMPROVEMENT: "Home",
  RENT_AND_UTILITIES: "Rent & Utils",
};

const BAR_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
];

function formatUSD(value: number) {
  return `$${value.toFixed(0)}`;
}

export default function SpendingByCategoryChart({ totals }: Props) {
  const data = useMemo(() => {
    const source = totals ?? mockMonthlyReport.totals_by_category;
    return Object.entries(source)
      .filter(([, amount]) => amount > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([category, amount]) => ({
        name: CATEGORY_LABELS[category] ?? category.replace(/_/g, " "),
        amount: parseFloat(amount.toFixed(2)),
      }));
  }, [totals]);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No category data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={formatUSD}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={86}
              />
              <Tooltip
                formatter={(value: number) => [formatUSD(value), "Spent"]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
                cursor={{ fill: "#f3f4f6" }}
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
