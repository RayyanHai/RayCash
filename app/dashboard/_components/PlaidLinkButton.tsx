"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { exchangePublicToken, getLinkToken, getMockPublicToken } from "@/lib/api";
import type { Item } from "@/lib/api";

interface Props {
  userId: string;
  onSuccess: (item: Item) => void;
}

const IS_MOCK = process.env.NEXT_PUBLIC_PLAID_ENV === "mock";

function MockLinkButton({ userId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect() {
    setLoading(true);
    setError("");
    try {
      const publicToken = await getMockPublicToken();
      const item = await exchangePublicToken(publicToken, userId);
      onSuccess(item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleConnect}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Connecting…" : "Connect Mock Bank"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function RealLinkButton({ userId, onSuccess }: Props) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getLinkToken(userId).then(setLinkToken).catch((e) => {
      setError("Failed to initialize Plaid Link");
      console.error(e);
    });
  }, [userId]);

  const handleSuccess = useCallback(
    async (publicToken: string) => {
      setLinking(true);
      try {
        const item = await exchangePublicToken(publicToken, userId);
        onSuccess(item);
      } catch (e) {
        setError("Failed to link account");
        console.error(e);
      } finally {
        setLinking(false);
      }
    },
    [userId, onSuccess]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken ?? "",
    onSuccess: handleSuccess,
  });

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => open()}
        disabled={!ready || linking}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {linking ? "Connecting…" : "Connect Bank"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function PlaidLinkButton(props: Props) {
  return IS_MOCK ? <MockLinkButton {...props} /> : <RealLinkButton {...props} />;
}
