"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingState } from "@/lib/types";
import { postOnboardingStep, postOnboardingComplete } from "@/lib/onboarding-api";
import Step1Income from "./steps/Step1Income";
import Step2Commitments from "./steps/Step2Commitments";
import Step3Categories from "./steps/Step3Categories";
import Step4Limits from "./steps/Step4Limits";
import Step5Goals from "./steps/Step5Goals";
import Step6Nudge from "./steps/Step6Nudge";

interface Props {
  userId: string;
  initialState: OnboardingState;
}

const TOTAL_STEPS = 6;

function getInitialStep(completedSteps: number[]): number {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    if (!completedSteps.includes(i)) return i;
  }
  return TOTAL_STEPS;
}

export default function OnboardingWizard({ userId, initialState }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(
    getInitialStep(initialState.completed_steps)
  );
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    initialState.completed_steps
  );
  const [saving, setSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  async function handleSaveAndNext(answers: Record<string, unknown>) {
    setSaving(true);
    try {
      const result = await postOnboardingStep(userId, {
        step: currentStep,
        answers,
      });
      setCompletedSteps(result.completed_steps);
      await advanceOrFinish();
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    await advanceOrFinish();
  }

  async function advanceOrFinish() {
    if (currentStep === TOTAL_STEPS) {
      setSaving(true);
      try {
        await postOnboardingComplete(userId);
        router.replace("/dashboard");
      } finally {
        setSaving(false);
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }

  const stepProps = {
    onNext: handleSaveAndNext,
    onBack: handleBack,
    onSkip: handleSkip,
    saving,
    isFirst: currentStep === 1,
    isLast: currentStep === TOTAL_STEPS,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">raycash setup</h1>
          <p className="text-sm text-muted-foreground">
            Let&apos;s get your finances dialed in — takes about 2 minutes.
          </p>
        </div>

        {/* Step progress */}
        <StepProgress current={currentStep} total={TOTAL_STEPS} completed={completedSteps} />

        {/* Step content */}
        {currentStep === 1 && <Step1Income {...stepProps} />}
        {currentStep === 2 && <Step2Commitments {...stepProps} />}
        {currentStep === 3 && (
          <Step3Categories
            {...stepProps}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />
        )}
        {currentStep === 4 && (
          <Step4Limits
            {...stepProps}
            selectedCategories={selectedCategories}
            prefill={initialState.prefill}
          />
        )}
        {currentStep === 5 && <Step5Goals {...stepProps} />}
        {currentStep === 6 && <Step6Nudge {...stepProps} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step progress indicator
// ---------------------------------------------------------------------------

function StepProgress({
  current,
  total,
  completed,
}: {
  current: number;
  total: number;
  completed: number[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-muted-foreground">
        Step {current} of {total}
      </p>
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: total }, (_, i) => i + 1).map((step) => {
          const isDone = completed.includes(step);
          const isCurrent = step === current;
          return (
            <div
              key={step}
              className={[
                "flex items-center justify-center rounded-full text-xs font-semibold transition-colors",
                "size-7 border",
                isDone
                  ? "bg-primary text-primary-foreground border-primary"
                  : isCurrent
                  ? "border-primary text-primary bg-background"
                  : "border-border text-muted-foreground bg-background",
              ].join(" ")}
            >
              {isDone ? "✓" : step}
            </div>
          );
        })}
      </div>
    </div>
  );
}
