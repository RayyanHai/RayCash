"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const NUDGE_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "weekly", label: "Weekly digest" },
  { value: "daily-digest", label: "Daily digest" },
];

export default function ProfileSettings({ userId }: { userId: string }) {
  const [sources, setSources] = useState<string[]>(["part-time"]);
  const [cadence, setCadence] = useState("monthly");
  const [roughMonthly, setRoughMonthly] = useState("800");
  const [nudge, setNudge] = useState("weekly");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleSource(id: string) {
    setSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    // Simulate API call — Track B will wire the real endpoint
    await new Promise((r) => setTimeout(r, 300));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      {/* Income pattern */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>Income pattern</CardTitle>
          <CardDescription>
            Helps us understand your cash flow for smarter nudges.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Income sources</Label>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cadence">Pay cadence</Label>
              <select
                id="cadence"
                value={cadence}
                onChange={(e) => setCadence(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
              >
                {CADENCES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="rough-monthly">Rough monthly income</Label>
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
          </div>
        </CardContent>
      </Card>

      {/* Nudge preference */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>Check-in frequency</CardTitle>
          <CardDescription>
            How often you want spending summaries sent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {NUDGE_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className={[
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors text-sm",
                  nudge === value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="nudge"
                  value={value}
                  checked={nudge === value}
                  onChange={() => setNudge(value)}
                  className="accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {saved && (
          <p className="text-sm text-green-600">Changes saved!</p>
        )}
      </div>
    </div>
  );
}
