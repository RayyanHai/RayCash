"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StepProps } from "./types";

const INCOME_SOURCES = [
  { id: "part-time", label: "Part-time job" },
  { id: "parents-family", label: "Parents / family" },
  { id: "financial-aid", label: "Financial aid / scholarships" },
  { id: "freelance", label: "Freelance / gig work" },
  { id: "other", label: "Other" },
];

const CADENCES = [
  { value: "monthly", label: "Monthly" },
  { value: "bi-weekly", label: "Every 2 weeks" },
  { value: "irregular", label: "Irregular" },
];

export default function Step1Income({ onNext, onBack, onSkip, saving, isFirst, isLast }: StepProps) {
  const [sources, setSources] = useState<string[]>([]);
  const [cadence, setCadence] = useState("monthly");
  const [roughMonthly, setRoughMonthly] = useState("");

  function toggleSource(id: string) {
    setSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    onNext({
      sources,
      cadence,
      rough_monthly: roughMonthly ? Number(roughMonthly) : null,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Where does your money come from?</CardTitle>
        <CardDescription>
          No judgment — just helps us set realistic budgets for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Income sources */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Income sources (pick all that apply)</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {INCOME_SOURCES.map(({ id, label }) => (
              <label
                key={id}
                className={[
                  "flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors text-sm",
                  sources.includes(id)
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={sources.includes(id)}
                  onChange={() => toggleSource(id)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Cadence */}
        <div className="space-y-2">
          <Label htmlFor="cadence">How often do you get paid?</Label>
          <select
            id="cadence"
            value={cadence}
            onChange={(e) => setCadence(e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {CADENCES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Rough monthly */}
        <div className="space-y-2">
          <Label htmlFor="rough-monthly">
            Rough monthly income{" "}
            <span className="text-muted-foreground font-normal">(ballpark is fine)</span>
          </Label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              $
            </span>
            <Input
              id="rough-monthly"
              type="number"
              min={0}
              placeholder="e.g. 800"
              value={roughMonthly}
              onChange={(e) => setRoughMonthly(e.target.value)}
              className="pl-6"
            />
          </div>
        </div>

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

// Shared step action buttons — inlined here and also imported by other steps
export function StepActions({
  onBack,
  onSkip,
  onNext,
  saving,
  isFirst,
  isLast,
}: {
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  saving: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex gap-2">
        {!isFirst && (
          <Button variant="outline" size="sm" onClick={onBack} disabled={saving}>
            Back
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onSkip} disabled={saving}>
          Skip
        </Button>
      </div>
      <Button size="sm" onClick={onNext} disabled={saving}>
        {saving ? "Saving…" : isLast ? "Finish" : "Save & Continue"}
      </Button>
    </div>
  );
}
