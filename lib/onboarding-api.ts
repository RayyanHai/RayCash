import type {
  OnboardingState,
  OnboardingStepPayload,
  OnboardingStepResult,
  PrefillSuggestion,
} from "./types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const MOCK_PREFILL: PrefillSuggestion[] = [
  { category: "FOOD_AND_DRINK", suggested_limit: 280, basis: "avg last 2 months: $261.40" },
  { category: "TRANSPORTATION", suggested_limit: 80, basis: "avg last 2 months: $74.20" },
  { category: "ENTERTAINMENT", suggested_limit: 60, basis: "avg last 2 months: $53.80" },
  { category: "PERSONAL_CARE", suggested_limit: 45, basis: "avg last 2 months: $38.50" },
  { category: "SHOPPING", suggested_limit: 150, basis: "avg last 2 months: $142.00" },
  { category: "GENERAL_MERCHANDISE", suggested_limit: 100, basis: "avg last 2 months: $91.30" },
];

// In-memory mock store keyed by userId
const mockStates: Record<string, OnboardingState> = {};

function getOrCreate(userId: string): OnboardingState {
  if (!mockStates[userId]) {
    mockStates[userId] = {
      user_id: userId,
      completed_steps: [],
      prefill: MOCK_PREFILL,
      is_complete: false,
      onboarded_at: null,
    };
  }
  return mockStates[userId];
}

export async function getOnboardingState(userId: string): Promise<OnboardingState> {
  await delay(300);
  return { ...getOrCreate(userId), prefill: MOCK_PREFILL };
}

export async function postOnboardingStep(
  userId: string,
  payload: OnboardingStepPayload
): Promise<OnboardingStepResult> {
  await delay(300);
  const state = getOrCreate(userId);
  if (!state.completed_steps.includes(payload.step)) {
    state.completed_steps = [...state.completed_steps, payload.step].sort(
      (a, b) => a - b
    );
  }
  return {
    step: payload.step,
    completed_steps: state.completed_steps,
    is_complete: state.is_complete,
  };
}

export async function postOnboardingComplete(
  userId: string
): Promise<{ ok: boolean }> {
  await delay(300);
  const state = getOrCreate(userId);
  state.is_complete = true;
  state.onboarded_at = new Date().toISOString();
  return { ok: true };
}
