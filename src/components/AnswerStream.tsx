import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Scale, ShieldCheck, Snowflake } from "lucide-react";

import type { SafetyAnalysis } from "@/lib/rag";

/** ChatGPT-style progressive text reveal. */
export function useTypewriter(text: string, active: boolean, speed = 12) {
  const [shown, setShown] = useState(active ? "" : text);

  useEffect(() => {
    if (!active) {
      setShown(text);
      return;
    }
    setShown("");
    if (!text) return;
    let i = 0;
    const step = Math.max(1, Math.round(text.length / 220));
    const id = setInterval(() => {
      i = Math.min(text.length, i + step);
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);

  return { shown, done: shown.length >= text.length };
}

export function StreamedText({
  text,
  active,
  className = "",
}: {
  text: string;
  active: boolean;
  className?: string;
}) {
  const { shown, done } = useTypewriter(text, active);
  return (
    <p className={`whitespace-pre-wrap text-sm leading-relaxed ${className}`}>
      {shown}
      {!done && (
        <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-accent animate-pulse-soft" />
      )}
    </p>
  );
}

const METRICS: {
  key: keyof SafetyAnalysis;
  label: string;
  question: string;
  icon: typeof Snowflake;
}[] = [
  {
    key: "confidence_score",
    label: "Confidence",
    question: "How sure is the model about this answer?",
    icon: Snowflake,
  },
  {
    key: "citation_accuracy",
    label: "Citation Accuracy",
    question: "Does the citation match a real, correct source location?",
    icon: CheckCircle2,
  },
  {
    key: "faithfulness",
    label: "Faithfulness",
    question: "Does the answer contain only facts present in the retrieved text?",
    icon: Scale,
  },
];

function pct(v: unknown) {
  return typeof v === "number" ? Math.max(0, Math.min(1, v)) : null;
}

export function SafetyAnalysisBlock({ safety }: { safety: SafetyAnalysis }) {
  return (
    <div className="animate-pop-in mt-6 rounded-2xl border border-border bg-secondary/50 p-4 md:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/15 text-accent ring-1 ring-border">
          <ShieldCheck className="h-4 w-4" strokeWidth={2} />
        </span>
        <h3 className="font-display text-sm font-semibold tracking-[0.06em]">Safety Analysis</h3>
      </div>

      {safety.reasoning && (
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">Reasoning:</strong> {safety.reasoning}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {METRICS.map(({ key, label, question, icon: Icon }, i) => {
          const value = pct(safety[key]);
          return (
            <article
              key={label}
              className="lift reveal flex flex-col gap-2 rounded-xl border border-border bg-background/40 p-4"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
                <p className="truncate font-display text-xs font-semibold tracking-[0.06em]">
                  {label}
                </p>
              </div>
              <p className="font-display text-2xl font-semibold">
                {value === null ? "N/A" : value.toFixed(2)}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full gradient-primary transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ width: `${(value ?? 0) * 100}%` }}
                />
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{question}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}


/** Compact inline pipeline trace — one row instead of a tall static card. */
export function PipelineStrip({
  steps,
  loading,
  done,
}: {
  steps: string[];
  loading: boolean;
  done: boolean;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!loading) {
      setActive(done ? steps.length : 0);
      return;
    }
    setActive(0);
    const id = setInterval(() => setActive((v) => Math.min(steps.length - 1, v + 1)), 420);
    return () => clearInterval(id);
  }, [loading, done, steps.length]);

  if (!loading && !done) return null;

  return (
    <div className="glass reveal mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl px-4 py-3">
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" strokeWidth={2} />
      )}
      {steps.map((step, i) => {
        const reached = i < active || (!loading && done);
        return (
          <span
            key={step}
            className={`inline-flex items-center gap-1.5 text-[11px] transition-colors duration-500 ${
              reached ? "text-foreground" : "text-muted-foreground/60"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                reached ? "bg-success" : "bg-muted-foreground/40"
              }`}
            />
            {step}
          </span>
        );
      })}
    </div>
  );
}
