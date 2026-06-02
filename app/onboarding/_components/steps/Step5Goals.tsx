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
import { Label } from "@/components/ui/label";
import { StepActions } from "./Step1Income";
import type { StepProps } from "./types";

interface GoalRow {
  id: string;
  name: string;
  targetAmount: string;
  deadline: string;
  initialContribution: string;
}

export default function Step5Goals({
  onNext,
  onBack,
  onSkip,
  saving,
  isFirst,
  isLast,
}: StepProps) {
  const [goals, setGoals] = useState<GoalRow[]>([]);

  function addGoal() {
    setGoals((prev) => [
      ...prev,
      {
        id: `g-${Date.now()}`,
        name: "",
        targetAmount: "",
        deadline: "",
        initialContribution: "",
      },
    ]);
  }

  function updateGoal(id: string, field: keyof GoalRow, value: string) {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  }

  function removeGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function handleSubmit() {
    onNext({
      goals: goals
        .filter((g) => g.name.trim())
        .map((g) => ({
          name: g.name.trim(),
          target_amount: g.targetAmount ? Number(g.targetAmount) : 0,
          deadline: g.deadline || null,
          initial_contribution: g.initialContribution
            ? Number(g.initialContribution)
            : null,
        })),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set some savings goals</CardTitle>
        <CardDescription>
          Dream big — emergency fund, trip, new laptop. You can add more later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No goals yet — add one below or skip.
          </p>
        )}

        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-lg border border-border p-4 space-y-3 relative"
            >
              <button
                type="button"
                onClick={() => removeGoal(goal.id)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors text-sm"
              >
                ✕
              </button>

              <div className="space-y-1">
                <Label htmlFor={`goal-name-${goal.id}`}>Goal name</Label>
                <Input
                  id={`goal-name-${goal.id}`}
                  placeholder='e.g. "Emergency Fund" or "Spring Break trip"'
                  value={goal.name}
                  onChange={(e) => updateGoal(goal.id, "name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`goal-target-${goal.id}`}>Target amount</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      id={`goal-target-${goal.id}`}
                      type="number"
                      min={0}
                      placeholder="500"
                      value={goal.targetAmount}
                      onChange={(e) =>
                        updateGoal(goal.id, "targetAmount", e.target.value)
                      }
                      className="pl-6"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`goal-deadline-${goal.id}`}>
                    Deadline{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id={`goal-deadline-${goal.id}`}
                    type="date"
                    value={goal.deadline}
                    onChange={(e) =>
                      updateGoal(goal.id, "deadline", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor={`goal-contrib-${goal.id}`}>
                  Initial contribution{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id={`goal-contrib-${goal.id}`}
                    type="number"
                    min={0}
                    placeholder="0"
                    value={goal.initialContribution}
                    onChange={(e) =>
                      updateGoal(goal.id, "initialContribution", e.target.value)
                    }
                    className="pl-6"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addGoal} className="w-full">
          + Add a goal
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
