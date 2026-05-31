"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getItems, getTransactions } from "@/lib/api";
import type { Item, Transaction } from "@/lib/api";
import AgentChat from "./AgentChat";
import LinkedAccounts from "./LinkedAccounts";
import TransactionTable from "./TransactionTable";

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const id = localStorage.getItem("raycash_user_id");
    const em = localStorage.getItem("raycash_user_email") ?? "";
    if (!id) {
      router.replace("/login");
      return;
    }
    setUserId(id);
    setEmail(em);

    Promise.all([getItems(id), getTransactions(id)])
      .then(([itemsData, txData]) => {
        setItems(itemsData);
        setTransactions(txData);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [router]);

  async function refreshTransactions() {
    if (!userId) return;
    const txData = await getTransactions(userId).catch(() => null);
    if (txData) setTransactions(txData);
  }

  function handleSignOut() {
    localStorage.removeItem("raycash_user_id");
    localStorage.removeItem("raycash_user_email");
    router.replace("/login");
  }

  if (!userId || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            raycash
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <LinkedAccounts
          items={items}
          userId={userId}
          onLinked={(item) => {
            setItems((prev) => [...prev, item]);
          }}
          onSynced={refreshTransactions}
        />

        <TransactionTable transactions={transactions} />

        <AgentChat userId={userId} />
      </main>
    </div>
  );
}
