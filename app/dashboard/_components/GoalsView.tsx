"use client";

import type { GoalStatus } from "@/lib/types";
import { mockGoalStatuses } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  goals?: GoalStatus[];
  onAddContribution?: (goalId: string) => void;
}

function formatUSD(value: number) {
  return `$${value.toFixed(2)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function OnTrackBadge({ onTrack }: { onTrack: boolean }) {
  if (onTrack) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
        On track
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      Behind
    </span>
  );
}

function LinearProgress({ pct, onTrack }: { pct: number; onTrack: boolean }) {
  const clamped = clamp(pct, 0, 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-all ${
          onTrack ? "bg-emerald-500" : "bg-amber-400"
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export default function GoalsView({ goals, onAddContribution }: Props) {
  const items = goals ?? mockGoalStatuses;

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No goals set up yet.
          </CardContent>
        </Card>
      ) : (
        items.map((goal) => (
          <Card key={goal.goal_id} size="sm">
            <CardContent className="space-y-3">
              {/* Name + badge */}
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-sm text-foreground leading-tight">
                  {goal.name}
                </span>
                <OnTrackBadge onTrack={goal.on_track} />
              </div>

              {/* Progress bar + pct */}
              <div className="space-y-1">
                <LinearProgress pct={goal.pct} onTrack={goal.on_track} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {formatUSD(goal.saved)} saved of {formatUSD(goal.target)}
                  </span>
                  <span>{goal.pct.toFixed(0)}%</span>
                </div>
              </div>

              {/* Deadline + weeks left */}
              {goal.deadline && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span>
                    Deadline:{" "}
                    <span className="font-medium text-foreground">
                      {goal.deadline}
                    </span>
                  </span>
                  {goal.weeks_left !== null && (
                    <span>
                      {goal.weeks_left} week{goal.weeks_left !== 1 ? "s" : ""}{" "}
                      left
                    </span>
                  )}
                  {goal.required_weekly !== null && (
                    <span>
                      Need:{" "}
                      <span className="font-medium text-foreground">
                        {formatUSD(goal.required_weekly)}/wk
                      </span>
                    </span>
                  )}
                </div>
              )}

              {/* Add contribution button — Track D wires the modal */}
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddContribution?.(goal.goal_id)}
                >
                  Add contribution
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
