export const API_URL =
  import.meta.env["VITE_API_URL"] || "https://frontend-fawn-three-88.vercel.app";

export type Citation = {
  document?: string;
  section?: string;
  [key: string]: unknown;
};

export type StructuredOutput = {
  recommendation?: string;
  evidence?: string;
  citations?: Citation[];
  [key: string]: unknown;
};

export type RetrievedChunk = {
  score?: number;
  text?: string;
  metadata?: { section?: string; document?: string; [key: string]: unknown };
};

export type AskResult = {
  structured_output?: StructuredOutput;
  retrieved_chunks?: RetrievedChunk[];
};

export async function askQuestion(query: string): Promise<AskResult> {
  const res = await fetch(`${API_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status}). The pipeline did not return a result.`);
  }

  return (await res.json()) as AskResult;
}
