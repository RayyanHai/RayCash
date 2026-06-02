const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface User {
  id: string;
  email: string;
  display_name: string | null;
}

export interface Item {
  id: string;
  user_id: string;
  plaid_item_id: string;
  institution_id: string | null;
  institution_name: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  item_id: string;
  plaid_transaction_id: string;
  amount: number;
  merchant_name: string | null;
  category: string | null;
  date: string;
  posted: boolean;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`${init?.method ?? "GET"} ${path} → ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export function createOrGetUser(email: string, displayName?: string): Promise<User> {
  return request<User>("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, display_name: displayName ?? null }),
  });
}

export function getItems(userId: string): Promise<Item[]> {
  return request<Item[]>(`/plaid/items?user_id=${userId}`);
}

export function getLinkToken(userId: string): Promise<string> {
  return request<{ link_token: string }>("/plaid/link-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  }).then((d) => d.link_token);
}

export function getMockPublicToken(): Promise<string> {
  return request<{ public_token: string }>("/plaid/sandbox/public-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  }).then((d) => d.public_token);
}

export function exchangePublicToken(
  publicToken: string,
  userId: string
): Promise<Item> {
  return request<Item>("/plaid/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_token: publicToken, user_id: userId }),
  });
}

export function syncItem(
  itemId: string
): Promise<{ transactions_synced: number; new_cursor: string }> {
  return request(`/plaid/items/${itemId}/sync`, { method: "POST" });
}

export function getTransactions(userId: string): Promise<Transaction[]> {
  return request<Transaction[]>(`/transactions?user_id=${userId}`);
}

// ---------------------------------------------------------------------------
// Budgets
// ---------------------------------------------------------------------------

import type {
  Budget,
  BudgetCreate,
  BudgetStatus,
  BudgetUpdate,
  Goal,
  GoalContribution,
  GoalContributionCreate,
  GoalCreate,
  GoalStatus,
  GoalUpdate,
  MonthlyReport,
  OnboardingState,
  OnboardingStepPayload,
  OnboardingStepResult,
  RecurringCandidate,
} from "./types";

export function getBudgetStatuses(userId: string): Promise<BudgetStatus[]> {
  return request<BudgetStatus[]>(`/budgets?user_id=${userId}`);
}

export function createBudget(
  userId: string,
  data: BudgetCreate
): Promise<Budget> {
  return request<Budget>(`/budgets?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function updateBudget(
  budgetId: string,
  userId: string,
  data: BudgetUpdate
): Promise<Budget> {
  return request<Budget>(`/budgets/${budgetId}?user_id=${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deleteBudget(
  budgetId: string,
  userId: string
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(
    `/budgets/${budgetId}?user_id=${userId}`,
    { method: "DELETE" }
  );
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export function getGoalStatuses(userId: string): Promise<GoalStatus[]> {
  return request<GoalStatus[]>(`/goals?user_id=${userId}`);
}

export function createGoal(userId: string, data: GoalCreate): Promise<Goal> {
  return request<Goal>(`/goals?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function updateGoal(
  goalId: string,
  userId: string,
  data: GoalUpdate
): Promise<Goal> {
  return request<Goal>(`/goals/${goalId}?user_id=${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function addContribution(
  goalId: string,
  userId: string,
  data: GoalContributionCreate
): Promise<GoalContribution> {
  // Backend field is `contribution_date`, frontend type uses `date` — remap here.
  const body = {
    amount: data.amount,
    contribution_date: data.date,
    note: data.note ?? null,
  };
  return request<GoalContribution>(
    `/goals/${goalId}/contributions?user_id=${userId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

export function listContributions(
  goalId: string,
  userId: string
): Promise<GoalContribution[]> {
  return request<GoalContribution[]>(
    `/goals/${goalId}/contributions?user_id=${userId}`
  );
}

// ---------------------------------------------------------------------------
// Reports & insights
// ---------------------------------------------------------------------------

export function getMonthlyReport(
  userId: string,
  period?: string
): Promise<MonthlyReport> {
  const q = period
    ? `/reports/monthly?user_id=${userId}&period=${period}`
    : `/reports/monthly?user_id=${userId}`;
  return request<MonthlyReport>(q);
}

export function getRecurringInsights(
  userId: string
): Promise<RecurringCandidate[]> {
  return request<RecurringCandidate[]>(`/insights/recurring?user_id=${userId}`);
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export function getOnboardingState(userId: string): Promise<OnboardingState> {
  return request<OnboardingState>(`/onboarding/state?user_id=${userId}`);
}

export function postOnboardingStep(
  userId: string,
  payload: OnboardingStepPayload
): Promise<OnboardingStepResult> {
  return request<OnboardingStepResult>(`/onboarding/step?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function postOnboardingComplete(
  userId: string
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(
    `/onboarding/complete?user_id=${userId}`,
    { method: "POST" }
  );
}
