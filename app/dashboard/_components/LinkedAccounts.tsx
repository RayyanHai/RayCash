"use client";

import { useState } from "react";
import { syncItem } from "@/lib/api";
import type { Item } from "@/lib/api";
import PlaidLinkButton from "./PlaidLinkButton";

interface Props {
  items: Item[];
  userId: string;
  onLinked: (item: Item) => void;
  onSynced: () => void;
}

export default function LinkedAccounts({
  items,
  userId,
  onLinked,
  onSynced,
}: Props) {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncCounts, setSyncCounts] = useState<Record<string, number>>({});

  async function handleSync(itemId: string) {
    setSyncing(itemId);
    try {
      const result = await syncItem(itemId);
      setSyncCounts((prev) => ({ ...prev, [itemId]: result.transactions_synced }));
      if (result.transactions_synced > 0) onSynced();
    } finally {
      setSyncing(null);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">
          Linked Accounts
        </h2>
        <PlaidLinkButton userId={userId} onSuccess={onLinked} />
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
          No accounts linked yet. Connect a bank above.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {item.institution_name ?? "Unknown Bank"}
                </p>
                <p className="mt-0.5 font-mono text-xs text-gray-400">
                  {item.plaid_item_id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {syncCounts[item.id] !== undefined && (
                  <span className="text-xs text-green-600">
                    +{syncCounts[item.id]} new
                  </span>
                )}
                <button
                  onClick={() => handleSync(item.id)}
                  disabled={syncing === item.id}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  {syncing === item.id ? "Syncing…" : "Sync"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
