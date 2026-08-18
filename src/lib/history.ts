import { useCallback, useEffect, useState } from "react";

import type { AskResult } from "./rag";

export type HistoryEntry = {
  id: string;
  query: string;
  at: number;
  ok: boolean;
  citations: number;
  chunks: number;
  confidence: string | null;
  topScore: number | null;
  topSection: string | null;
  error?: string;
  result?: AskResult;
};

const STORAGE_KEY = "probably-rag-history-v1";
const MAX_ENTRIES = 30;

export function confidenceScore(result: AskResult | undefined): string | null {
  const raw = result?.structured_output?.["confidence"];
  if (typeof raw === "string" && raw.trim()) return raw.trim().toLowerCase();
  if (typeof raw === "number") return `${Math.round(raw * 100)}%`;
  return null;
}

export function topChunk(result: AskResult | undefined) {
  const chunks = result?.retrieved_chunks ?? [];
  let best: { score: number; section: string | null } | null = null;
  for (const c of chunks) {
    if (typeof c.score !== "number") continue;
    if (!best || c.score > best.score) {
      best = { score: c.score, section: c.metadata?.section ?? null };
    }
  }
  return best;
}

export function buildEntry(query: string, result: AskResult): HistoryEntry {
  const best = topChunk(result);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    query,
    at: Date.now(),
    ok: true,
    citations: result.structured_output?.citations?.length ?? 0,
    chunks: result.retrieved_chunks?.length ?? 0,
    confidence: confidenceScore(result),
    topScore: best?.score ?? null,
    topSection: best?.section ?? null,
    result,
  };
}

export function buildFailedEntry(query: string, error: string): HistoryEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    query,
    at: Date.now(),
    ok: false,
    citations: 0,
    chunks: 0,
    confidence: null,
    topScore: null,
    topSection: null,
    error,
  };
}

function read(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

function persist(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full — retry with results stripped to keep the light metadata
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries.map(({ result: _result, ...rest }) => rest)),
      );
    } catch {
      /* storage unavailable */
    }
  }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setHistory(read());
    setReady(true);
  }, []);

  const add = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    persist([]);
  }, []);

  return { history, ready, add, remove, clear };
}
