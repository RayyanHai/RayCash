"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StepActions } from "./Step1Income";
import type { StepProps } from "./types";

const NUDGE_OPTIONS = [
  {
    value: "off",
    label: "Off",
    description: "No nudges — I'll check in on my own.",
  },
  {
    value: "weekly",
    label: "Weekly digest",
    description: "One summary every Sunday. Calm, low noise.",
    recommended: true,
  },
  {
    value: "daily-digest",
    label: "Daily digest",
    description: "Daily recap of spending + budget status.",
  },
];

export default function Step6Nudge({
  onNext,
  onBack,
  onSkip,
  saving,
  isFirst,
  isLast,
}: StepProps) {
  const [selected, setSelected] = useState<string>("weekly");

  function handleSubmit() {
    onNext({ nudge_aggressiveness: selected });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How often do you want check-ins?</CardTitle>
        <CardDescription>
          We can send you spending summaries so you stay on track without
          obsessing over numbers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {NUDGE_OPTIONS.map(({ value, label, description, recommended }) => (
            <label
              key={value}
              className={[
                "flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                selected === value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted",
              ].join(" ")}
            >
              <input
                type="radio"
                name="nudge"
                value={value}
                checked={selected === value}
                onChange={() => setSelected(value)}
                className="mt-0.5 accent-primary"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {label}
                  {recommended && (
                    <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 font-normal">
                      recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </label>
          ))}
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
