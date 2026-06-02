"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StepActions } from "./Step1Income";
import type { StepProps } from "./types";

const PLAID_CATEGORIES = [
  { id: "FOOD_AND_DRINK", label: "Food & Drink", emoji: "🍔" },
  { id: "TRANSPORTATION", label: "Transportation", emoji: "🚌" },
  { id: "ENTERTAINMENT", label: "Entertainment", emoji: "🎬" },
  { id: "PERSONAL_CARE", label: "Personal Care", emoji: "💆" },
  { id: "SHOPPING", label: "Shopping", emoji: "🛍️" },
  { id: "GENERAL_MERCHANDISE", label: "General Merch", emoji: "🏪" },
  { id: "RENT_AND_UTILITIES", label: "Rent & Utilities", emoji: "🏠" },
  { id: "BILLS_AND_UTILITIES", label: "Bills & Utilities", emoji: "📄" },
  { id: "HEALTH_AND_FITNESS", label: "Health & Fitness", emoji: "💪" },
  { id: "EDUCATION", label: "Education", emoji: "📚" },
  { id: "TRAVEL", label: "Travel", emoji: "✈️" },
  { id: "OTHER", label: "Other", emoji: "📦" },
];

interface Props extends StepProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
}

export default function Step3Categories({
  onNext,
  onBack,
  onSkip,
  saving,
  isFirst,
  isLast,
  selectedCategories,
  onCategoryChange,
}: Props) {
  function toggle(id: string) {
    onCategoryChange(
      selectedCategories.includes(id)
        ? selectedCategories.filter((c) => c !== id)
        : [...selectedCategories, id]
    );
  }

  function handleSubmit() {
    onNext({ categories: selectedCategories });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What do you want to track?</CardTitle>
        <CardDescription>
          Pick the categories you want to set spending limits for. You can always change this later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PLAID_CATEGORIES.map(({ id, label, emoji }) => {
            const selected = selectedCategories.includes(id);
            return (
              <label
                key={id}
                className={[
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors text-sm",
                  selected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={selected}
                  onChange={() => toggle(id)}
                />
                <span>{emoji}</span>
                <span>{label}</span>
              </label>
            );
          })}
        </div>

        {selectedCategories.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Select at least one to set limits on the next step.
          </p>
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
