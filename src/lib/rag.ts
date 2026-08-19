export const API_URL =
  import.meta.env["VITE_API_URL"] || "https://frontend-fawn-three-88.vercel.app";

// localtunnel shows an interstitial page unless this header is present.
// Vercel doesn't need it (and a custom header would force a CORS preflight).
const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  ...(/\.loca\.lt$/i.test(new URL(API_URL).hostname)
    ? { "bypass-tunnel-reminder": "true" }
    : {}),
};


export type Citation = {
  document?: string;
  section?: string;
  [key: string]: unknown;
};

export type SafetyAnalysis = {
  reasoning?: string;
  confidence_score?: number;
  citation_accuracy?: number;
  faithfulness?: number;
  [key: string]: unknown;
};

export type StructuredOutput = {
  recommendation?: string;
  evidence?: string;
  citations?: Citation[];
  confidence?: string;
  safety_analysis?: SafetyAnalysis;
  [key: string]: unknown;
};

export type RetrievedChunk = {
  chunk_id?: string;
  score?: number;
  dense?: number;
  bm25?: number;
  text?: string;
  metadata?: {
    section?: string;
    section_path?: string;
    is_reference?: boolean;
    document?: string;
    [key: string]: unknown;
  };
};

export type AskResult = {
  structured_output?: StructuredOutput;
  retrieved_chunks?: RetrievedChunk[];
  raw_json?: string;
};

export type PipelineStatus = {
  pipeline_ready?: boolean;
  retriever_connected?: boolean;
  has_keys?: boolean;
};

export async function fetchStatus(): Promise<PipelineStatus | null> {
  try {
    const res = await fetch(`${API_URL}/api/status`, { headers: BASE_HEADERS });
    if (!res.ok) return null;
    return (await res.json()) as PipelineStatus;
  } catch {
    return null;
  }
}

export async function askQuestion(query: string): Promise<AskResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/query`, {
      method: "POST",
      headers: BASE_HEADERS,
      body: JSON.stringify({ query }),
    });
  } catch {
    throw new Error(
      `Could not reach the backend at ${API_URL}. Make sure the server (and the tunnel) is running.`,
    );
  }

  if (res.status === 503) {
    throw new Error("The pipeline is still initializing on the server. Try again in a few seconds.");
  }
  if (res.status >= 500) {
    throw new Error(`Server error (${res.status}). The pipeline failed while answering.`);
  }
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}). The pipeline did not return a result.`);
  }

  return (await res.json()) as AskResult;
}
