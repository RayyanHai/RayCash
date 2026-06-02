/**
 * RayCash — shared type definitions (Phase 0 Contract)
 *
 * These types mirror the backend Contract (§4 of the build prompt) and are
 * the single source of truth for frontend tracks C and D.
 *
 * RULES
 * -----
 * - Do NOT compute numbers here. Every numeric field comes pre-computed from
 *   the finance engine via the API. The frontend only displays.
 * - money fields are `number` (JSON decimals arrive as numbers). Never use
 *   floating-point arithmetic on them — display only, or use a Decimal lib.
 * - nullable backend fields are `string | null`, `number | null`, etc.
 * - Track C and D may use mock fixtures that satisfy these interfaces until
 *   the real API (Track B) lands. Shape must match exactly.
 */

// ---------------------------------------------------------------------------
// Core entity types (mirror DB models)
// ---------------------------------------------------------------------------

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
  /** Negative = debit (money out); positive = credit (money in). */
  amount: number;
  merchant_name: string | null;
  category: string | null;
  /** YYYY-MM-DD */
  date: string;
  posted: boolean;
}

export interface Budget {
  id: string;
  user_id: string;
  /** Plaid personal_finance_category.primary, e.g. "FOOD_AND_DRINK" */
  category: string;
  limit_amount: number;
  /** "monthly" | "weekly" | "biweekly" */
  period: string;
  active: boolean;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  /** YYYY-MM-DD or null for open-ended goals */
  deadline: string | null;
  /** "active" | "achieved" | "archived" */
  status: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  amount: number;
  /** YYYY-MM-DD */
  date: string;
  note: string | null;
}

export interface UserProfile {
  id: string;
  user_id: string;
  income_pattern: IncomePattern | null;
  /** "off" | "weekly" | "daily-digest" */
  nudge_aggressiveness: string;
  /** ISO datetime string or null (null = not onboarded yet) */
  onboarded_at: string | null;
  raw_onboarding: Record<string, unknown> | null;
}

export interface IncomePattern {
  sources: string[];
  /** "monthly" | "bi-weekly" | "irregular" */
  cadence: string;
  rough_monthly: number;
}

// ---------------------------------------------------------------------------
// Computed status types (output of finance_engine — never recalculate FE-side)
// ---------------------------------------------------------------------------

export interface BudgetStatus {
  budget_id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  /** 0–100+ (can exceed 100 when over budget) */
  pct_used: number;
  /** Projected spend at end of period based on current daily run-rate */
  projected_end_of_period: number;
  /** "under" | "warning" | "over" */
  status: "under" | "warning" | "over";
}

export interface GoalStatus {
  goal_id: string;
  name: string;
  target: number;
  saved: number;
  remaining: number;
  /** 0–100+ */
  pct: number;
  /** YYYY-MM-DD or null */
  deadline: string | null;
  /** null when no deadline */
  weeks_left: number | null;
  /** null when no deadline */
  required_weekly: number | null;
  on_track: boolean;
}

export interface RecurringCandidate {
  merchant: string;
  typical_amount: number;
  cadence_days: number;
  /** 0.0–1.0 */
  confidence: number;
  sample_count: number;
}

// ---------------------------------------------------------------------------
// Report types
// ---------------------------------------------------------------------------

export interface TopMover {
  category: string;
  current: number;
  prior: number;
  delta: number;
  pct: number;
}

export interface MonthlyReport {
  /** YYYY-MM */
  period: string;
  totals_by_category: Record<string, number>;
  total_spent: number;
  vs_prior_month: {
    delta: number;
    pct: number;
  };
  budgets: BudgetStatus[];
  top_movers: TopMover[];
}

export interface ForecastOut {
  /** YYYY-MM */
  period: string;
  /** The raw engine-computed numbers passed to the LLM */
  numbers: Record<string, unknown>;
  /** AI-generated student-framed explanation */
  narrative: string;
  /** Short risk bullets the model flagged */
  risk_flags: string[];
}

// ---------------------------------------------------------------------------
// Onboarding types
// ---------------------------------------------------------------------------

export interface PrefillSuggestion {
  category: string;
  suggested_limit: number;
  /** Human-readable basis, e.g. "average of last 2 months: $312.40" */
  basis: string;
}

export interface OnboardingState {
  user_id: string;
  completed_steps: number[];
  prefill: PrefillSuggestion[];
  is_complete: boolean;
  /** ISO datetime or null */
  onboarded_at: string | null;
}

export interface OnboardingStepResult {
  step: number;
  completed_steps: number[];
  is_complete: boolean;
}

// ---------------------------------------------------------------------------
// API request payload types (used by frontend fetch helpers)
// ---------------------------------------------------------------------------

export interface BudgetCreate {
  category: string;
  limit_amount: number;
  period?: string;
}

export interface BudgetUpdate {
  limit_amount?: number;
  period?: string;
  active?: boolean;
}

export interface GoalCreate {
  name: string;
  target_amount: number;
  deadline?: string | null;
}

export interface GoalUpdate {
  name?: string;
  target_amount?: number;
  deadline?: string | null;
  status?: string;
}

export interface GoalContributionCreate {
  amount: number;
  date: string;
  note?: string | null;
}

export interface OnboardingStepPayload {
  step: number;
  answers: Record<string, unknown>;
}
