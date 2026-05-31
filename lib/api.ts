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
