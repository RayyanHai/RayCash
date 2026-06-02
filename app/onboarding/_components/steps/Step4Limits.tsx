"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepActions } from "./Step1Income";
import type { PrefillSuggestion } from "@/lib/types";
import type { StepProps } from "./types";

interface Props extends StepProps {
  selectedCategories: string[];
  prefill: PrefillSuggestion[];
}

const CATEGORY_LABELS: Record<string, string> = {
  FOOD_AND_DRINK: "Food & Drink",
  TRANSPORTATION: "Transportation",
  ENTERTAINMENT: "Entertainment",
  PERSONAL_CARE: "Personal Care",
  SHOPPING: "Shopping",
  GENERAL_MERCHANDISE: "General Merch",
  RENT_AND_UTILITIES: "Rent & Utilities",
  BILLS_AND_UTILITIES: "Bills & Utilities",
  HEALTH_AND_FITNESS: "Health & Fitness",
  EDUCATION: "Education",
  TRAVEL: "Travel",
  OTHER: "Other",
};

export default function Step4Limits({
  onNext,
  onBack,
  onSkip,
  saving,
  isFirst,
  isLast,
  selectedCategories,
  prefill,
}: Props) {
  const prefillMap = new Map(prefill.map((p) => [p.category, p]));

  const [limits, setLimits] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const cat of selectedCategories) {
      const suggestion = prefillMap.get(cat);
      initial[cat] = suggestion ? String(suggestion.suggested_limit) : "";
    }
    return initial;
  });

  function handleSubmit() {
    const budgets = selectedCategories
      .filter((cat) => limits[cat] && Number(limits[cat]) > 0)
      .map((cat) => ({
        category: cat,
        limit_amount: Number(limits[cat]),
        period: "monthly",
      }));
    onNext({ budgets });
  }

  const categoriesToShow =
    selectedCategories.length > 0
      ? selectedCategories
      : Array.from(prefillMap.keys());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set your monthly spending limits</CardTitle>
        <CardDescription>
          We pre-filled these based on your recent spending — adjust freely.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoriesToShow.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            You didn&apos;t select any categories. Hit Skip to continue.
          </p>
        ) : (
          <div className="space-y-3">
            {categoriesToShow.map((cat) => {
              const suggestion = prefillMap.get(cat);
              return (
                <div key={cat} className="space-y-1">
                  <Label htmlFor={`limit-${cat}`}>
                    {CATEGORY_LABELS[cat] ?? cat.replace(/_/g, " ")}
                  </Label>
                  {suggestion && (
                    <p className="text-xs text-muted-foreground">{suggestion.basis}</p>
                  )}
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      id={`limit-${cat}`}
                      type="number"
                      min={0}
                      placeholder={suggestion ? String(suggestion.suggested_limit) : "0"}
                      value={limits[cat] ?? ""}
                      onChange={(e) =>
                        setLimits((prev) => ({ ...prev, [cat]: e.target.value }))
                      }
                      className="pl-6"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
