/**
 * Settings API — real backend calls for budget and goal CRUD.
 * All functions delegate to lib/api.ts which points at NEXT_PUBLIC_API_URL.
 *
 * NOTE: The mock signature in the old settings components used
 * (userId, budgetId, payload) ordering. The real API helpers in api.ts use
 * (budgetId, userId, payload). The re-exports below normalise to the
 * (userId, id, payload) convention used by the settings UI components so we
 * don't have to change the call-sites in the settings screens.
 */

import {
  getBudgetStatuses,
  createBudget as _createBudget,
  updateBudget as _updateBudget,
  deleteBudget as _deleteBudget,
  getGoalStatuses,
  createGoal as _createGoal,
  updateGoal as _updateGoal,
  addContribution as _addContribution,
} from "./api";
import type {
  BudgetCreate,
  BudgetStatus,
  BudgetUpdate,
  Budget,
  GoalContribution,
  GoalContributionCreate,
  GoalCreate,
  GoalStatus,
  GoalUpdate,
  Goal,
} from "./types";

// ---------------------------------------------------------------------------
// Budgets
// ---------------------------------------------------------------------------

export async function getBudgets(userId: string): Promise<BudgetStatus[]> {
  return getBudgetStatuses(userId);
}

export async function createBudget(
  userId: string,
  data: BudgetCreate
): Promise<Budget> {
  return _createBudget(userId, data);
}

/** Note: arg order is (userId, budgetId, data) to match settings UI call-sites. */
export async function updateBudget(
  userId: string,
  budgetId: string,
  data: BudgetUpdate
): Promise<Budget> {
  return _updateBudget(budgetId, userId, data);
}

export async function deleteBudget(
  userId: string,
  budgetId: string
): Promise<void> {
  await _deleteBudget(budgetId, userId);
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export async function getGoals(userId: string): Promise<GoalStatus[]> {
  return getGoalStatuses(userId);
}

export async function createGoal(
  userId: string,
  data: GoalCreate
): Promise<Goal> {
  return _createGoal(userId, data);
}

/** Note: arg order is (userId, goalId, data) to match settings UI call-sites. */
export async function updateGoal(
  userId: string,
  goalId: string,
  data: GoalUpdate
): Promise<Goal> {
  return _updateGoal(goalId, userId, data);
}

export async function addContribution(
  userId: string,
  goalId: string,
  data: GoalContributionCreate
): Promise<GoalContribution> {
  return _addContribution(goalId, userId, data);
}
