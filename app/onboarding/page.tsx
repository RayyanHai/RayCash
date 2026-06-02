"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingWizard from "./_components/OnboardingWizard";
import type { OnboardingState } from "@/lib/types";
import { getOnboardingState } from "@/lib/onboarding-api";

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("raycash_user_id");
    if (!id) {
      router.replace("/login");
      return;
    }
    setUserId(id);
    getOnboardingState(id)
      .then((s) => {
        if (s.is_complete) {
          router.replace("/dashboard");
          return;
        }
        setState(s);
        setLoading(false);
      })
      .catch(() => {
        // If API fails, still allow onboarding with empty state
        setState({
          user_id: id,
          completed_steps: [],
          prefill: [],
          is_complete: false,
          onboarded_at: null,
        });
        setLoading(false);
      });
  }, [router]);

  if (loading || !userId || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  return <OnboardingWizard userId={userId} initialState={state} />;
}
