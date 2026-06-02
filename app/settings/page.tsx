"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BudgetSettings from "./_components/BudgetSettings";
import GoalSettings from "./_components/GoalSettings";
import ProfileSettings from "./_components/ProfileSettings";

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("raycash_user_id");
    if (!id) {
      router.replace("/login");
      return;
    }
    setUserId(id);
  }, [router]);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your budgets, goals, and preferences.
          </p>
        </div>

        <Tabs defaultValue="budgets">
          <TabsList>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="budgets" className="mt-4">
            <BudgetSettings userId={userId} />
          </TabsContent>

          <TabsContent value="goals" className="mt-4">
            <GoalSettings userId={userId} />
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <ProfileSettings userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
