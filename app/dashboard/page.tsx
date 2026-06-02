"use client";

import Dashboard from "./_components/Dashboard";
import SpendingOverTimeChart from "./_components/SpendingOverTimeChart";
import SpendingByCategoryChart from "./_components/SpendingByCategoryChart";
import BudgetsView from "./_components/BudgetsView";
import GoalsView from "./_components/GoalsView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  mockTransactions,
  mockBudgetStatuses,
  mockGoalStatuses,
  mockMonthlyReport,
} from "@/lib/mock-data";

export default function DashboardPage() {
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
          </TabsList>

          {/* Overview tab: spending charts */}
          <TabsContent value="overview">
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              <SpendingOverTimeChart transactions={mockTransactions} />
              <SpendingByCategoryChart
                totals={mockMonthlyReport.totals_by_category}
              />
            </div>
          </TabsContent>

          {/* Budgets tab */}
          <TabsContent value="budgets">
            <BudgetsView budgets={mockBudgetStatuses} />
          </TabsContent>

          {/* Goals tab */}
          <TabsContent value="goals">
            <GoalsView goals={mockGoalStatuses} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
