"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "@/lib/settings-api";
import type { BudgetStatus } from "@/lib/types";

const CATEGORIES = [
  "FOOD_AND_DRINK",
  "TRANSPORTATION",
  "ENTERTAINMENT",
  "PERSONAL_CARE",
  "SHOPPING",
  "GENERAL_MERCHANDISE",
  "RENT_AND_UTILITIES",
  "BILLS_AND_UTILITIES",
  "HEALTH_AND_FITNESS",
  "EDUCATION",
  "TRAVEL",
  "OTHER",
];

const PERIODS = ["monthly", "weekly", "biweekly"];

const STATUS_COLORS: Record<string, string> = {
  under: "text-green-600",
  warning: "text-yellow-600",
  over: "text-red-600",
};

interface EditState {
  budgetId: string;
  limitAmount: string;
  period: string;
}

export default function BudgetSettings({ userId }: { userId: string }) {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("FOOD_AND_DRINK");
  const [newLimit, setNewLimit] = useState("");
  const [newPeriod, setNewPeriod] = useState("monthly");
  const [error, setError] = useState("");

  async function loadBudgets() {
    setLoading(true);
    try {
      setBudgets(await getBudgets(userId));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function handleDelete(budgetId: string) {
    setSaving(true);
    try {
      await deleteBudget(userId, budgetId);
      setBudgets((prev) => prev.filter((b) => b.budget_id !== budgetId));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit() {
    if (!editState) return;
    setSaving(true);
    setError("");
    try {
      await updateBudget(userId, editState.budgetId, {
        limit_amount: Number(editState.limitAmount),
        period: editState.period,
      });
      await loadBudgets();
      setEditState(null);
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    if (!newLimit || Number(newLimit) <= 0) {
      setError("Enter a valid limit amount.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createBudget(userId, {
        category: newCategory,
        limit_amount: Number(newLimit),
        period: newPeriod,
      });
      await loadBudgets();
      setShowAdd(false);
      setNewLimit("");
      setNewCategory("FOOD_AND_DRINK");
      setNewPeriod("monthly");
    } catch {
      setError("Failed to create budget.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading budgets…</p>;
  }

  return (
    <div className="space-y-4">
      {budgets.length === 0 && !showAdd && (
        <p className="text-sm text-muted-foreground">
          No budgets yet. Add one below.
        </p>
      )}

      {budgets.map((b) => (
        <Card key={b.budget_id} size="sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{b.category.replace(/_/g, " ")}</span>
              <span className={`text-xs font-normal ${STATUS_COLORS[b.status]}`}>
                {b.status === "over"
                  ? "Over budget"
                  : b.status === "warning"
                  ? "Getting close"
                  : "On track"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editState?.budgetId === b.budget_id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Monthly limit</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        $
                      </span>
                      <Input
                        type="number"
                        min={0}
                        value={editState.limitAmount}
                        onChange={(e) =>
                          setEditState((s) =>
                            s ? { ...s, limitAmount: e.target.value } : s
                          )
                        }
                        className="pl-6"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Period</Label>
                    <select
                      value={editState.period}
                      onChange={(e) =>
                        setEditState((s) =>
                          s ? { ...s, period: e.target.value } : s
                        )
                      }
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none"
                    >
                      {PERIODS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditState(null)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-sm space-y-0.5">
                  <p>
                    <span className="font-medium">${b.spent.toFixed(2)}</span>
                    <span className="text-muted-foreground"> / ${b.limit.toFixed(2)}</span>
                  </p>
                  <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        b.status === "over"
                          ? "bg-red-500"
                          : b.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(b.pct_used, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setEditState({
                        budgetId: b.budget_id,
                        limitAmount: String(b.limit),
                        period: "monthly",
                      })
                    }
                    disabled={saving}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(b.budget_id)}
                    disabled={saving}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {showAdd ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>New budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label>Category</Label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Limit</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="pl-6"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Period</Label>
                <select
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none"
                >
                  {PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={saving}>
                {saving ? "Adding…" : "Add Budget"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAdd(false);
                  setError("");
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowAdd(true)} className="w-full">
          + Add a budget
        </Button>
      )}
    </div>
  );
}
