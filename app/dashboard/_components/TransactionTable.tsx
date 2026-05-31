import type { Transaction } from "@/lib/api";

interface Props {
  transactions: Transaction[];
}

function formatAmount(amount: number): string {
  const abs = Math.abs(amount).toFixed(2);
  return amount < 0 ? `-$${abs}` : `+$${abs}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  FOOD_AND_DRINK: "Food & Drink",
  TRANSFER: "Transfer",
  PAYROLL: "Payroll",
  GENERAL_MERCHANDISE: "Shopping",
  TRAVEL: "Travel",
  ENTERTAINMENT: "Entertainment",
  Software: "Software",
  Uncategorized: "—",
};

function formatCategory(raw: string | null): string {
  if (!raw) return "—";
  return CATEGORY_LABELS[raw] ?? raw;
}

export default function TransactionTable({ transactions }: Props) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-gray-900">
        Transactions
        {transactions.length > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-400">
            {transactions.length}
          </span>
        )}
      </h2>

      {transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
          No transactions yet. Sync an account to pull them in.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  Merchant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{tx.date}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {tx.merchant_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatCategory(tx.category)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      tx.amount < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {formatAmount(tx.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.posted
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {tx.posted ? "Posted" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
