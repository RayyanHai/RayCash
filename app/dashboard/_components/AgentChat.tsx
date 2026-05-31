"use client";

import { useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ToolCall {
  name: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  streaming?: boolean;
  error?: boolean;
}

interface Props {
  userId: string;
}

const TOOL_LABELS: Record<string, string> = {
  get_transactions: "Reading transactions",
  get_spending_by_category: "Analyzing spending",
  get_monthly_summary: "Summarizing month",
};

const SUGGESTIONS = [
  "How much did I spend this month?",
  "What are my biggest expense categories?",
  "Show me my most recent transactions.",
];

export default function AgentChat({ userId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMessage = text.trim();
    setInput("");
    setLoading(true);

    // History = all prior non-streaming text turns
    const history = messages
      .filter((m) => !m.streaming && m.content)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "", toolCalls: [], streaming: true },
    ]);

    try {
      const resp = await fetch(`${API_BASE}/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          message: userMessage,
          history,
        }),
      });

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event: Record<string, string>;
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (event.type === "tool_call") {
            setMessages((prev) =>
              prev.map((m, i) =>
                i === prev.length - 1
                  ? { ...m, toolCalls: [...(m.toolCalls ?? []), { name: event.name }] }
                  : m
              )
            );
          } else if (event.type === "text") {
            setMessages((prev) =>
              prev.map((m, i) =>
                i === prev.length - 1
                  ? { ...m, content: m.content + event.delta }
                  : m
              )
            );
          } else if (event.type === "done") {
            setMessages((prev) =>
              prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, streaming: false } : m
              )
            );
          } else if (event.type === "error") {
            setMessages((prev) =>
              prev.map((m, i) =>
                i === prev.length - 1
                  ? { ...m, content: event.message, streaming: false, error: true }
                  : m
              )
            );
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? {
                ...m,
                content: "Connection failed. Is the backend running?",
                streaming: false,
                error: true,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-gray-900">
        Ask about your finances
      </h2>

      <div className="flex flex-col rounded-2xl border border-gray-200 bg-white">
        {/* Message history */}
        <div className="flex min-h-64 flex-col gap-4 overflow-y-auto p-4 max-h-[420px]">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
              <p className="text-sm text-gray-400">
                Ask anything about your spending.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[85%] flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Tool call pills */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.toolCalls.map((tc, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                          {TOOL_LABELS[tc.name] ?? tc.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bubble */}
                  {(msg.content || msg.streaming) && (
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-gray-900 text-white"
                          : msg.error
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.content}
                      {msg.streaming && !msg.content && (
                        <span className="text-gray-400">…</span>
                      )}
                      {msg.streaming && msg.content && (
                        <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-current opacity-60 align-middle" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your spending…"
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Wait</span>
                </span>
              ) : (
                "Send"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
