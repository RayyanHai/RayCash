"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "./_components/Dashboard";
import SpendingOverTimeChart from "./_components/SpendingOverTimeChart";
import SpendingByCategoryChart from "./_components/SpendingByCategoryChart";
import BudgetsView from "./_components/BudgetsView";
import GoalsView from "./_components/GoalsView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getBudgetStatuses,
  getGoalStatuses,
  getMonthlyReport,
  getRecurringInsights,
  getTransactions,
} from "@/lib/api";
import type { BudgetStatus, GoalStatus, MonthlyReport, RecurringCandidate, Transaction } from "@/lib/types";
import RecurringView from "./_components/RecurringView";

export default function DashboardPage() {
  const router = useRouter();
  const initialized = useRef(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [goals, setGoals] = useState<GoalStatus[]>([]);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [recurring, setRecurring] = useState<RecurringCandidate[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const id = localStorage.getItem("raycash_user_id");
    if (!id) {
      router.replace("/login");
      return;
    }
    setUserId(id);

    // Fetch all analytics data in parallel — failures are soft (show empty state)
    Promise.allSettled([
      getTransactions(id),
      getBudgetStatuses(id),
      getGoalStatuses(id),
      getMonthlyReport(id),
      getRecurringInsights(id),
    ]).then(([txResult, budgetResult, goalResult, reportResult, recurringResult]) => {
      if (txResult.status === "fulfilled") setTransactions(txResult.value);
      if (budgetResult.status === "fulfilled") setBudgets(budgetResult.value);
      if (goalResult.status === "fulfilled") setGoals(goalResult.value);
      if (reportResult.status === "fulfilled") setReport(reportResult.value);
      if (recurringResult.status === "fulfilled") setRecurring(recurringResult.value);
      setLoadingAnalytics(false);
    });
  }, [router]);

  // Derive totals_by_category from transactions when report isn't loaded yet
  const categoryTotals: Record<string, number> =
    report?.totals_by_category ??
    transactions
      .filter((t) => t.amount < 0 && t.category)
      .reduce<Record<string, number>>((acc, t) => {
        const cat = t.category!;
        acc[cat] = (acc[cat] ?? 0) + Math.abs(t.amount);
        return acc;
      }, {});

  return (
    <>
      {/* Existing dashboard: linked accounts, transaction table, agent chat */}
      <Dashboard />

      {/* Extended analytics section */}
      <div className="mx-auto max-w-5xl px-6 pb-12">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
          </TabsList>

          {/* Overview tab: spending charts */}
          <TabsContent value="overview">
            {loadingAnalytics ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Loading analytics…
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                <SpendingOverTimeChart transactions={transactions} />
                <SpendingByCategoryChart totals={categoryTotals} />
              </div>
            )}
          </TabsContent>

          {/* Budgets tab */}
          <TabsContent value="budgets">
            {loadingAnalytics ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Loading budgets…
              </div>
            ) : (
              <BudgetsView budgets={budgets} />
            )}
          </TabsContent>

          {/* Goals tab */}
          <TabsContent value="goals">
            {loadingAnalytics ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Loading goals…
              </div>
            ) : (
              <GoalsView goals={goals} />
            )}
          </TabsContent>

          {/* Recurring charges tab */}
          <TabsContent value="recurring">
            <RecurringView
              candidates={recurring}
              loading={loadingAnalytics}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
