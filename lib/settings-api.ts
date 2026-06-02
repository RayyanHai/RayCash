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
} from "./types";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ---------------------------------------------------------------------------
// Budget mock store
// ---------------------------------------------------------------------------

let mockBudgets: Budget[] = [
  {
    id: "b1",
    user_id: "",
    category: "FOOD_AND_DRINK",
    limit_amount: 280,
    period: "monthly",
    active: true,
  },
  {
    id: "b2",
    user_id: "",
    category: "TRANSPORTATION",
    limit_amount: 80,
    period: "monthly",
    active: true,
  },
  {
    id: "b3",
    user_id: "",
    category: "ENTERTAINMENT",
    limit_amount: 60,
    period: "monthly",
    active: true,
  },
];

let mockGoals: Goal[] = [
  {
    id: "g1",
    user_id: "",
    name: "Emergency Fund",
    target_amount: 1000,
    deadline: "2026-12-31",
    status: "active",
  },
  {
    id: "g2",
    user_id: "",
    name: "Spring Break Trip",
    target_amount: 500,
    deadline: "2026-03-01",
    status: "active",
  },
];

let mockContributions: GoalContribution[] = [
  { id: "c1", goal_id: "g1", amount: 50, date: "2026-05-01", note: "Paycheck" },
  { id: "c2", goal_id: "g1", amount: 25, date: "2026-05-15", note: null },
  { id: "c3", goal_id: "g2", amount: 100, date: "2026-05-10", note: "Birthday money" },
];

let nextId = 100;
function genId() {
  return String(nextId++);
}

// ---------------------------------------------------------------------------
// Budget API
// ---------------------------------------------------------------------------

export async function getBudgets(userId: string): Promise<BudgetStatus[]> {
  await delay(300);
  return mockBudgets
    .filter((b) => b.active)
    .map((b) => {
      const spent = Math.round(b.limit_amount * (0.3 + Math.random() * 0.6) * 100) / 100;
      const remaining = Math.max(0, b.limit_amount - spent);
      const pct_used = Math.round((spent / b.limit_amount) * 100);
      return {
        budget_id: b.id,
        category: b.category,
        limit: b.limit_amount,
        spent,
        remaining,
        pct_used,
        projected_end_of_period: Math.round(spent * 1.3 * 100) / 100,
        status: pct_used >= 100 ? "over" : pct_used >= 75 ? "warning" : "under",
      } as BudgetStatus;
    });
}

export async function createBudget(
  userId: string,
  payload: BudgetCreate
): Promise<Budget> {
  await delay(300);
  const budget: Budget = {
    id: genId(),
    user_id: userId,
    category: payload.category,
    limit_amount: payload.limit_amount,
    period: payload.period ?? "monthly",
    active: true,
  };
  mockBudgets = [...mockBudgets, budget];
  return budget;
}

export async function updateBudget(
  userId: string,
  budgetId: string,
  payload: BudgetUpdate
): Promise<Budget> {
  await delay(300);
  mockBudgets = mockBudgets.map((b) => {
    if (b.id !== budgetId) return b;
    return {
      ...b,
      ...(payload.limit_amount !== undefined && { limit_amount: payload.limit_amount }),
      ...(payload.period !== undefined && { period: payload.period }),
      ...(payload.active !== undefined && { active: payload.active }),
    };
  });
  const updated = mockBudgets.find((b) => b.id === budgetId);
  if (!updated) throw new Error("Budget not found");
  return updated;
}

export async function deleteBudget(userId: string, budgetId: string): Promise<void> {
  await delay(300);
  mockBudgets = mockBudgets.filter((b) => b.id !== budgetId);
}

// ---------------------------------------------------------------------------
// Goal API
// ---------------------------------------------------------------------------

export async function getGoals(userId: string): Promise<GoalStatus[]> {
  await delay(300);
  return mockGoals.map((g) => {
    const contribs = mockContributions.filter((c) => c.goal_id === g.id);
    const saved = contribs.reduce((sum, c) => sum + c.amount, 0);
    const remaining = Math.max(0, g.target_amount - saved);
    const pct = Math.round((saved / g.target_amount) * 100);

    let weeks_left: number | null = null;
    let required_weekly: number | null = null;
    let on_track = false;

    if (g.deadline) {
      const msLeft = new Date(g.deadline).getTime() - Date.now();
      weeks_left = Math.max(0, Math.floor(msLeft / (7 * 24 * 60 * 60 * 1000)));
      required_weekly = weeks_left > 0 ? Math.ceil(remaining / weeks_left) : remaining;
      on_track = pct >= 50;
    }

    return {
      goal_id: g.id,
      name: g.name,
      target: g.target_amount,
      saved,
      remaining,
      pct,
      deadline: g.deadline,
      weeks_left,
      required_weekly,
      on_track,
    } as GoalStatus;
  });
}

export async function createGoal(
  userId: string,
  payload: GoalCreate
): Promise<Goal> {
  await delay(300);
  const goal: Goal = {
    id: genId(),
    user_id: userId,
    name: payload.name,
    target_amount: payload.target_amount,
    deadline: payload.deadline ?? null,
    status: "active",
  };
  mockGoals = [...mockGoals, goal];
  return goal;
}

export async function updateGoal(
  userId: string,
  goalId: string,
  payload: Partial<Goal>
): Promise<Goal> {
  await delay(300);
  mockGoals = mockGoals.map((g) =>
    g.id === goalId ? { ...g, ...payload } : g
  );
  const updated = mockGoals.find((g) => g.id === goalId);
  if (!updated) throw new Error("Goal not found");
  return updated;
}

export async function addContribution(
  userId: string,
  goalId: string,
  payload: GoalContributionCreate
): Promise<GoalContribution> {
  await delay(300);
  const contribution: GoalContribution = {
    id: genId(),
    goal_id: goalId,
    amount: payload.amount,
    date: payload.date,
    note: payload.note ?? null,
  };
  mockContributions = [...mockContributions, contribution];
  return contribution;
}
