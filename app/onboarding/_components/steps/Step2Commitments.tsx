"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StepActions } from "./Step1Income";
import type { StepProps } from "./types";

interface Commitment {
  id: string;
  name: string;
  amount: string;
  category: string;
}

const INITIAL_COMMITMENTS: Commitment[] = [
  { id: "r1", name: "Rent / Housing", amount: "650", category: "RENT_AND_UTILITIES" },
  { id: "r2", name: "Phone bill", amount: "45", category: "BILLS_AND_UTILITIES" },
  { id: "r3", name: "Spotify", amount: "5.99", category: "ENTERTAINMENT" },
];

const CATEGORIES = [
  "RENT_AND_UTILITIES",
  "BILLS_AND_UTILITIES",
  "FOOD_AND_DRINK",
  "TRANSPORTATION",
  "ENTERTAINMENT",
  "PERSONAL_CARE",
  "SHOPPING",
  "OTHER",
];

export default function Step2Commitments({
  onNext,
  onBack,
  onSkip,
  saving,
  isFirst,
  isLast,
}: StepProps) {
  const [rows, setRows] = useState<Commitment[]>(INITIAL_COMMITMENTS);

  function updateRow(id: string, field: keyof Commitment, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  function deleteRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: "",
        amount: "",
        category: "OTHER",
      },
    ]);
  }

  function handleSubmit() {
    onNext({
      commitments: rows.map((r) => ({
        name: r.name,
        amount: r.amount ? Number(r.amount) : 0,
        category: r.category,
      })),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixed monthly commitments</CardTitle>
        <CardDescription>
          Things you pay every month no matter what — edit, delete, or add rows.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_80px_130px_32px] gap-2 text-xs text-muted-foreground font-medium px-1">
          <span>Name</span>
          <span>Amount</span>
          <span>Category</span>
          <span />
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1fr_80px_130px_32px] gap-2 items-center"
            >
              <Input
                placeholder="e.g. Gym"
                value={row.name}
                onChange={(e) => updateRow(row.id, "name", e.target.value)}
              />
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                  $
                </span>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={row.amount}
                  onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                  className="pl-5"
                />
              </div>
              <select
                value={row.category}
                onChange={(e) => updateRow(row.id, "category", e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => deleteRow(row.id)}
                className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addRow} className="w-full">
          + Add a commitment
        </Button>

        <StepActions
          onBack={onBack}
          onSkip={onSkip}
          onNext={handleSubmit}
          saving={saving}
          isFirst={isFirst}
          isLast={isLast}
        />
      </CardContent>
    </Card>
  );
}
