/**
 * Onboarding API — real backend calls.
 * All functions delegate to lib/api.ts which points at NEXT_PUBLIC_API_URL.
 */

import {
  getOnboardingState as _getState,
  postOnboardingStep as _postStep,
  postOnboardingComplete as _postComplete,
} from "./api";
import type {
  OnboardingState,
  OnboardingStepPayload,
  OnboardingStepResult,
} from "./types";

export async function getOnboardingState(
  userId: string
): Promise<OnboardingState> {
  return _getState(userId);
}

export async function postOnboardingStep(
  userId: string,
  payload: OnboardingStepPayload
): Promise<OnboardingStepResult> {
  return _postStep(userId, payload);
}

export async function postOnboardingComplete(
  userId: string
): Promise<{ ok: boolean }> {
  return _postComplete(userId);
}
