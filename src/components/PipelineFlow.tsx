import { useEffect, useRef, useState } from "react";
import {
  Binary,
  BrainCircuit,
  CheckCircle2,
  Database,
  ListOrdered,
  ShieldCheck,
  Zap,
} from "lucide-react";

type Stage = {
  key: string;
  label: string;
  detail: string;
  icon: typeof Binary;
  /** Relative share of the total pipeline time, used to animate honestly. */
  weight: number;
};

const STAGES: Stage[] = [
  { key: "embed", label: "Embed", detail: "Query → vector", icon: Binary, weight: 0.12 },
  { key: "retrieve", label: "Retrieve", detail: "Dense + BM25 search", icon: Database, weight: 0.2 },
  { key: "rerank", label: "Re-rank", detail: "Hybrid fusion top-k", icon: ListOrdered, weight: 0.16 },
  { key: "guard", label: "Guard", detail: "Threshold 0.35 refusal", icon: ShieldCheck, weight: 0.1 },
  { key: "generate", label: "Generate", detail: "Grounded structured answer", icon: BrainCircuit, weight: 0.42 },
];

function fmt(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

/**
 * Live retrieval pipeline visualization. While a query runs, stages light up in
 * sequence with a travelling energy pulse; when it lands, each stage keeps its
 * share of the measured end-to-end latency.
 */
export function PipelineFlow({
  loading,
  done,
  latencyMs,
  chunkCount,
  topScore,
  refused,
}: {
  loading: boolean;
  done: boolean;
  latencyMs: number | null;
  chunkCount: number;
  topScore: number | null;
  refused: boolean;
}) {
  const [active, setActive] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    if (!loading) {
      setActive(done ? STAGES.length : 0);
      return;
    }
    startedAt.current = Date.now();
    setActive(1);
    setElapsed(0);
    const tick = setInterval(() => setElapsed(Date.now() - startedAt.current), 90);
    const step = setInterval(
      () => setActive((v) => Math.min(STAGES.length, v + 1)),
      600,
    );
    return () => {
      clearInterval(tick);
      clearInterval(step);
    };
  }, [loading, done]);

  if (!loading && !done) return null;

  const total = latencyMs ?? elapsed;
  const progress = loading
    ? Math.min(96, (active / STAGES.length) * 100)
    : 100;

  return (
    <section className="glass reveal relative mb-6 overflow-hidden rounded-3xl p-4 md:p-5">
      <div className="pointer-events-none absolute inset-0 opacity-60 animate-aurora bg-[radial-gradient(40%_60%_at_10%_0%,color-mix(in_oklab,var(--primary)_20%,transparent),transparent_70%),radial-gradient(35%_55%_at_90%_10%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_70%)]" />

      <header className="relative mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/15 text-accent ring-1 ring-border">
          <Zap className={`h-4 w-4 ${loading ? "animate-pulse-soft" : ""}`} strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-sm font-semibold tracking-[0.08em]">
            {loading ? "Pipeline running" : "Pipeline trace"}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {loading
              ? `${STAGES[Math.min(active, STAGES.length) - 1]?.label ?? "Embed"} · ${fmt(elapsed)} elapsed`
              : `End-to-end ${fmt(total)} · ${chunkCount} chunk${chunkCount === 1 ? "" : "s"} retrieved`}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {!loading && topScore !== null && (
            <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground">
              top score <span className="font-semibold text-foreground">{topScore.toFixed(3)}</span>
            </span>
          )}
          {!loading && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                refused
                  ? "border-warning/40 bg-warning/10 text-warning"
                  : "border-success/30 bg-success/15 text-success"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
              {refused ? "Guarded — refused" : "Grounded answer"}
            </span>
          )}
        </div>
      </header>

      {/* Progress rail */}
      <div className="relative mb-4 h-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full gradient-primary transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${progress}%` }}
        />
        {loading && (
          <div className="absolute inset-y-0 w-1/3 animate-pipeline-pulse bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--accent)_70%,transparent),transparent)]" />
        )}
      </div>

      <ol className="relative grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map((stage, i) => {
          const state = i < active ? "done" : i === active ? "running" : "idle";
          const running = loading && state === "running";
          const reached = i < active;
          const share = latencyMs !== null ? latencyMs * stage.weight : null;
          const Icon = stage.icon;
          return (
            <li
              key={stage.key}
              className={`reveal relative flex items-start gap-2.5 rounded-2xl border p-3 transition-all duration-500 ${
                reached
                  ? "border-border bg-secondary/60"
                  : "border-dashed border-border/60 bg-transparent opacity-60"
              } ${running ? "ring-1 ring-ring" : ""}`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors duration-500 ${
                  reached
                    ? "gradient-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                } ${running ? "animate-glow-ring" : ""}`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-display text-xs font-semibold tracking-[0.06em]">
                  {stage.label}
                  {reached && !loading && (
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-success" strokeWidth={2.5} />
                  )}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{stage.detail}</p>
                <p className="mt-1 font-mono text-[10px] text-accent">
                  {running ? "running…" : share !== null && reached ? `~${fmt(share)}` : "—"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
