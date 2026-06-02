"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getGoals, createGoal, updateGoal, addContribution } from "@/lib/settings-api";
import type { GoalStatus } from "@/lib/types";

interface ContribForm {
  goalId: string;
  amount: string;
  note: string;
}

export default function GoalSettings({ userId }: { userId: string }) {
  const [goals, setGoals] = useState<GoalStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [contribForm, setContribForm] = useState<ContribForm | null>(null);

  // New goal form
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  async function loadGoals() {
    setLoading(true);
    try {
      setGoals(await getGoals(userId));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function handleCreate() {
    if (!newName.trim() || !newTarget || Number(newTarget) <= 0) {
      setError("Name and a valid target amount are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createGoal(userId, {
        name: newName.trim(),
        target_amount: Number(newTarget),
        deadline: newDeadline || null,
      });
      await loadGoals();
      setShowAdd(false);
      setNewName("");
      setNewTarget("");
      setNewDeadline("");
    } catch {
      setError("Failed to create goal.");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(goalId: string) {
    setSaving(true);
    try {
      await updateGoal(userId, goalId, { status: "archived" });
      await loadGoals();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddContribution() {
    if (!contribForm || !contribForm.amount || Number(contribForm.amount) <= 0) {
      setError("Enter a valid contribution amount.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addContribution(userId, contribForm.goalId, {
        amount: Number(contribForm.amount),
        date: new Date().toISOString().split("T")[0],
        note: contribForm.note || null,
      });
      await loadGoals();
      setContribForm(null);
    } catch {
      setError("Failed to add contribution.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading goals…</p>;
  }

  const activeGoals = goals.filter((g) => g.pct < 100);

  return (
    <div className="space-y-4">
      {activeGoals.length === 0 && !showAdd && (
        <p className="text-sm text-muted-foreground">
          No active goals. Add one below.
        </p>
      )}

      {activeGoals.map((g) => (
        <Card key={g.goal_id} size="sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{g.name}</span>
              <span
                className={`text-xs font-normal ${
                  g.on_track ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {g.on_track ? "On track" : "Behind"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">${g.saved.toFixed(2)} saved</span>
                <span className="text-muted-foreground">${g.target.toFixed(2)} goal</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(g.pct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{g.pct}% complete</span>
                {g.deadline && (
                  <span>
                    {g.weeks_left != null ? `${g.weeks_left} weeks left` : ""}{" "}
                    {g.required_weekly != null
                      ? `· $${g.required_weekly}/wk needed`
                      : ""}
                  </span>
                )}
              </div>
            </div>

            {/* Contribution form */}
            {contribForm?.goalId === g.goal_id ? (
              <div className="rounded-lg bg-muted/50 p-3 space-y-3">
                <p className="text-xs font-medium">Add contribution</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                        $
                      </span>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={contribForm.amount}
                        onChange={(e) =>
                          setContribForm((f) =>
                            f ? { ...f, amount: e.target.value } : f
                          )
                        }
                        className="pl-5"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Note (optional)</Label>
                    <Input
                      placeholder="e.g. Birthday money"
                      value={contribForm.note}
                      onChange={(e) =>
                        setContribForm((f) =>
                          f ? { ...f, note: e.target.value } : f
                        )
                      }
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddContribution} disabled={saving}>
                    {saving ? "Saving…" : "Add"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setContribForm(null);
                      setError("");
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setContribForm({ goalId: g.goal_id, amount: "", note: "" })
                  }
                  disabled={saving}
                >
                  Add contribution
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleArchive(g.goal_id)}
                  disabled={saving}
                >
                  Archive
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {showAdd ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>New goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="goal-name">Goal name</Label>
              <Input
                id="goal-name"
                placeholder='e.g. "Emergency Fund"'
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="goal-target">Target amount</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="goal-target"
                    type="number"
                    min={0}
                    placeholder="500"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="pl-6"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="goal-deadline">
                  Deadline{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={saving}>
                {saving ? "Adding…" : "Add Goal"}
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
        <Button
          variant="outline"
          onClick={() => setShowAdd(true)}
          className="w-full"
        >
          + Add a goal
        </Button>
      )}
    </div>
  );
}
