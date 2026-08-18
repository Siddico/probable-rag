import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  BookOpenText,
  Braces,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileSearch,
  FileText,
  Gauge,
  Layers,
  Library,
  Menu,
  MessageSquareQuote,
  Quote,
  RotateCcw,
  Send,
  Sparkles,
  Stethoscope,
  TimerReset,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Workflow,
  X,
} from "lucide-react";

import { About } from "@/components/About";
import { Logo } from "@/components/Logo";
import { EmptyState, Panel } from "@/components/Panel";
import { SidebarContent, type TabId } from "@/components/Sidebar";
import { SkeletonPanel, SkeletonSteps, SkeletonTable } from "@/components/Skeletons";
import { CORPUS, SUGGESTED_QUESTIONS } from "@/lib/corpus";
import {
  buildEntry,
  buildFailedEntry,
  confidenceScore,
  topChunk,
  useHistory,
  type HistoryEntry,
} from "@/lib/history";
import { askQuestion, type AskResult } from "@/lib/rag";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Probably RAG — AI Clinical Decision Support" },
      {
        name: "description",
        content:
          "Ask cardiovascular clinical questions and get grounded recommendations, evidence, citations and retrieval traces from the Probably RAG pipeline.",
      },
      { property: "og:title", content: "Probably RAG — AI Clinical Decision Support" },
      {
        property: "og:description",
        content:
          "Grounded cardiovascular recommendations with evidence, citations and full retrieval transparency.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PIPELINE_STEPS = [
  "Query normalized and embedded",
  "Retriever connected",
  "Top-k chunks re-ranked",
  "Refusal logic strictly enforced",
  "Structured output validated",
];

function timeAgo(at: number) {
  const s = Math.max(1, Math.round((Date.now() - at) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-success/15 text-success border-success/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  moderate: "bg-warning/15 text-warning border-warning/30",
  low: "bg-destructive/15 text-destructive border-destructive/30",
};

function ConfidenceBadge({ value, className = "" }: { value: string; className?: string }) {
  const style = CONFIDENCE_STYLES[value] ?? "bg-primary/15 text-accent border-border";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${style} ${className}`}
    >
      <Gauge className="h-3.5 w-3.5" strokeWidth={2} /> {value} confidence
    </span>
  );
}

function ScoreBadge({ score, className = "" }: { score: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground ${className}`}
    >
      <TrendingUp className="h-3.5 w-3.5 text-accent" strokeWidth={2} /> top score{" "}
      <span className="font-semibold text-foreground">{score.toFixed(3)}</span>
    </span>
  );
}

function Index() {
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useState<TabId>("ask");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResult | null>(null);
  const { history, ready, add, remove, clear } = useHistory();
  const [restored, setRestored] = useState(false);
  const [copied, setCopied] = useState(false);

  // Restore the last successful answer after a reload so nothing is lost.
  useEffect(() => {
    if (!ready || restored) return;
    setRestored(true);
    const last = history.find((e) => e.ok && e.result);
    if (last?.result) {
      setResult(last.result);
      setQuery(last.query);
    }
  }, [ready, restored, history]);

  const runQuery = async (raw: string) => {
    const q = raw.trim();
    if (!q || loading) return;
    setQuery(q);
    setTab("ask");
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await askQuestion(q);
      setResult(data);
      add(buildEntry(q, data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      add(buildFailedEntry(q, message));
    } finally {
      setLoading(false);
    }
  };

  const openEntry = (entry: HistoryEntry) => {
    if (entry.result) {
      setQuery(entry.query);
      setResult(entry.result);
      setError(null);
      setTab("ask");
      return;
    }
    void runQuery(entry.query);
  };

  const selectTab = (next: TabId) => {
    setTab(next);
    setDrawerOpen(false);
  };

  const structured = result?.structured_output;
  const citations = structured?.citations ?? [];
  const chunks = result?.retrieved_chunks ?? [];
  const confidence = confidenceScore(result ?? undefined);
  const best = topChunk(result ?? undefined);

  const copyJson = async () => {
    if (!structured) return;
    await navigator.clipboard.writeText(JSON.stringify(structured, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside
        className={`glass sticky top-0 hidden h-screen shrink-0 overflow-hidden rounded-none transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:block ${
          collapsed ? "w-[84px]" : "w-[260px]"
        }`}
      >
        <SidebarContent
          active={tab}
          onSelect={selectTab}
          theme={theme}
          onToggleTheme={toggle}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
      </aside>

      {/* Mobile header */}
      <header className="glass sticky top-0 z-30 flex items-center gap-3 rounded-none px-4 py-3 md:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo size={32} glow={false} />
        <p className="truncate font-display text-sm font-semibold tracking-[0.24em]">
          PROBABLY RAG
        </p>
      </header>

      {/* Mobile drawer */}
      <div
        aria-hidden={!drawerOpen}
        className={`fixed inset-0 z-40 md:hidden ${drawerOpen ? "" : "pointer-events-none"}`}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`glass absolute inset-y-0 left-0 w-[260px] rounded-none transition-transform duration-300 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
          <SidebarContent active={tab} onSelect={selectTab} theme={theme} onToggleTheme={toggle} />
        </div>
      </div>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-10">
        <div className="reveal mb-8 flex items-center gap-4">
          <Logo size={54} />
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold tracking-[0.12em] md:text-4xl">
              <span className="text-gradient">PROBABLY RAG</span>
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              Retrieval-grounded cardiovascular decision support — every recommendation traced back
              to its source evidence.
            </p>
          </div>
        </div>

        {tab === "ask" && (
          <>
            <section className="glass reveal mb-6 rounded-3xl p-5 md:p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
                  <Stethoscope className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-sm font-semibold tracking-[0.08em]">
                    Clinical Query
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">
                    Grounded on {CORPUS.pages} pages of peer-reviewed cardiovascular evidence
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="relative min-w-0">
                  <MessageSquareQuote className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void runQuery(query);
                    }}
                    placeholder="Ask about risk factors, screening, prevention, therapy..."
                    className="w-full min-w-0 rounded-xl border border-input bg-input/40 py-3 pl-11 pr-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void runQuery(query)}
                  disabled={loading || !query.trim()}
                  className="lift inline-flex shrink-0 items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50"
                >
                  <Send className={`h-4 w-4 ${loading ? "animate-pulse-soft" : ""}`} />
                  {loading ? "Asking..." : "Ask"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-accent" /> Try
                </span>
                {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void runQuery(q)}
                    className="lift max-w-full truncate rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </section>

            {error && (
              <div className="reveal mb-6 flex items-start gap-3 rounded-3xl border border-destructive/40 bg-destructive/10 p-5 text-sm">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p>{error}</p>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[2fr_1.2fr]">
              <div className="flex min-w-0 flex-col gap-6">
                {loading ? (
                  <>
                    <SkeletonPanel title="Recommendation" lines={3} />
                    <SkeletonPanel title="Evidence" lines={4} />
                    <SkeletonTable />
                    <SkeletonPanel title="Raw JSON" lines={5} />
                  </>
                ) : structured ? (
                  <>
                    <Panel
                      icon={BadgeCheck}
                      title="Recommendation"
                      hint="Model answer constrained to retrieved evidence"
                      className="lift border-l-2 border-l-accent/60"
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {structured.recommendation || "No recommendation returned."}
                      </p>
                      {(confidence || typeof best?.score === "number") && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                          {confidence && <ConfidenceBadge value={confidence} />}
                          {typeof best?.score === "number" && <ScoreBadge score={best.score} />}
                          {best?.section && (
                            <span className="max-w-full truncate rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                              best match · {best.section}
                            </span>
                          )}
                        </div>
                      )}
                    </Panel>

                    <Panel icon={BookOpenText} title="Evidence" hint="Supporting passages summary">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {structured.evidence || "No evidence returned."}
                      </p>
                    </Panel>

                    <Panel
                      icon={Quote}
                      title="Citations"
                      hint={`${citations.length} reference${citations.length === 1 ? "" : "s"}`}
                    >
                      {citations.length ? (
                        <div className="-mx-2 overflow-x-auto px-2">
                          <table className="w-full min-w-[420px] text-left text-sm">
                            <thead>
                              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                                <th className="pb-3 pr-4 font-medium">#</th>
                                <th className="pb-3 pr-4 font-medium">Document</th>
                                <th className="pb-3 font-medium">Section</th>
                              </tr>
                            </thead>
                            <tbody>
                              {citations.map((c, i) => (
                                <tr key={i} className="border-t border-border">
                                  <td className="py-3 pr-4 text-xs text-accent">
                                    {String(i + 1).padStart(2, "0")}
                                  </td>
                                  <td className="py-3 pr-4">{c.document ?? "—"}</td>
                                  <td className="py-3 text-muted-foreground">{c.section ?? "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <EmptyState
                          icon={Quote}
                          title="No citations returned"
                          body="The pipeline answered without attaching reference metadata."
                        />
                      )}
                    </Panel>

                    <Panel
                      icon={Braces}
                      title="Raw structured output"
                      hint="Validated JSON payload"
                      action={
                        <button
                          type="button"
                          onClick={() => void copyJson()}
                          className="lift inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copied ? "Copied" : "Copy"}
                        </button>
                      }
                    >
                      <pre className="max-h-80 overflow-auto rounded-xl bg-secondary/60 p-4 text-xs leading-relaxed">
                        {JSON.stringify(structured, null, 2)}
                      </pre>
                    </Panel>
                  </>
                ) : (
                  <Panel icon={FileSearch} title="Awaiting query" hint="Pipeline idle">
                    <EmptyState
                      icon={Stethoscope}
                      title="Ask a clinical question to begin"
                      body="Type a question above or pick one of the suggested prompts — the retriever will pull the most relevant passages and ground the answer in them."
                    />
                  </Panel>
                )}
              </div>

              <div className="flex min-w-0 flex-col gap-6">
                {loading ? (
                  <>
                    <SkeletonSteps />
                    <SkeletonPanel title="Retrieved Chunks" lines={6} />
                  </>
                ) : (
                  <>
                    <Panel icon={Workflow} title="Pipeline Status" hint="Retrieval trace">
                      <ol className="flex flex-col gap-4">
                        {PIPELINE_STEPS.map((step, i) => (
                          <li key={step} className="flex items-start gap-3 text-sm">
                            <CheckCircle2
                              className={`mt-0.5 h-5 w-5 shrink-0 transition-colors duration-500 ${
                                result ? "text-success" : "text-muted-foreground/60"
                              }`}
                              style={{ transitionDelay: `${i * 90}ms` }}
                              strokeWidth={1.9}
                            />
                            <span className={result ? "" : "text-muted-foreground"}>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </Panel>

                    <Panel
                      icon={Layers}
                      title="Retrieved Chunks"
                      hint={`${chunks.length} passage${chunks.length === 1 ? "" : "s"} ranked${
                        typeof best?.score === "number" ? ` · best ${best.score.toFixed(3)}` : ""
                      }`}
                    >
                      {chunks.length ? (
                        <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
                          {chunks.slice(0, 5).map((chunk, i) => (
                            <article
                              key={i}
                              className="lift rounded-xl border border-border bg-secondary/50 p-4"
                            >
                              <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                                <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">
                                  {chunk.metadata?.section ?? "Unlabeled section"}
                                </p>
                                <span className="shrink-0 rounded-full bg-primary/20 px-2.5 py-1 text-xs text-accent">
                                  {typeof chunk.score === "number" ? chunk.score.toFixed(3) : "—"}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                {chunk.text ?? "—"}
                              </p>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          icon={Layers}
                          title="No passages yet"
                          body="Chunks retrieved for a query, with their similarity scores, will appear here."
                        />
                      )}
                    </Panel>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "history" && (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Panel
              icon={TimerReset}
              title="Query History"
              hint={`${history.length} saved question${history.length === 1 ? "" : "s"} — stored on this device`}
              action={
                history.length ? (
                  <button
                    type="button"
                    onClick={clear}
                    className="lift inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear
                  </button>
                ) : undefined
              }
            >
              {history.length ? (
                <ul className="flex flex-col gap-3">
                  {history.map((entry, i) => (
                    <li key={entry.id} className="reveal" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="lift group rounded-2xl border border-border bg-secondary/50 p-4">
                        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-xs font-semibold text-accent">
                            {String(history.length - i).padStart(2, "0")}
                          </span>
                          <button
                            type="button"
                            onClick={() => openEntry(entry)}
                            className="min-w-0 text-left"
                          >
                            <span className="block truncate text-sm group-hover:text-accent">
                              {entry.query}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {timeAgo(entry.at)} ·{" "}
                              {new Date(entry.at).toLocaleString(undefined, {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </button>
                          <button
                            type="button"
                            aria-label="Re-run query"
                            onClick={() => void runQuery(entry.query)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-transform duration-300 hover:-rotate-90 hover:text-accent"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete entry"
                            onClick={() => remove(entry.id)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {entry.ok ? (
                            <>
                              {entry.confidence && <ConfidenceBadge value={entry.confidence} />}
                              {typeof entry.topScore === "number" && (
                                <ScoreBadge score={entry.topScore} />
                              )}
                              <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground">
                                {entry.citations} citation{entry.citations === 1 ? "" : "s"}
                              </span>
                              <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground">
                                {entry.chunks} chunk{entry.chunks === 1 ? "" : "s"}
                              </span>
                              {entry.topSection && (
                                <span className="max-w-full truncate rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                                  {entry.topSection}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-xs text-destructive">
                              failed
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={TimerReset}
                  title="No questions asked yet"
                  body="Every clinical query is saved on this device with its confidence level and top retrieval score, so you can reopen the full answer any time."
                />
              )}
            </Panel>

            <Panel icon={Sparkles} title="Suggested Queries" hint="Curated from the corpus">
              <ul className="flex flex-col gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => void runQuery(q)}
                      className="lift reveal w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-left text-xs leading-relaxed text-muted-foreground hover:text-foreground"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        )}

        {tab === "sources" && (
          <div className="flex flex-col gap-6">
            <Panel icon={Library} title="Knowledge Base" hint="Indexed corpus powering the retriever">
              <article className="rounded-2xl border border-border bg-secondary/40 p-5">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
                    <FileText className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-sm leading-relaxed">{CORPUS.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{CORPUS.journal}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{CORPUS.authors}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs text-accent">
                        {CORPUS.pages} pages indexed
                      </span>
                      <a
                        href={CORPUS.doiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="lift inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> DOI {CORPUS.doi}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  {CORPUS.topics.map((t, i) => (
                    <span
                      key={t}
                      className="reveal rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            </Panel>

            <Panel
              icon={Quote}
              title="Cited in latest answer"
              hint={`${citations.length} citation${citations.length === 1 ? "" : "s"}`}
            >
              {citations.length ? (
                <ul className="grid gap-3 md:grid-cols-2">
                  {citations.map((c, i) => (
                    <li
                      key={i}
                      className="lift reveal rounded-2xl border border-border bg-secondary/50 p-4"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-xs text-accent">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="truncate text-sm font-medium">
                          {c.document ?? "Unknown document"}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {c.section ?? "Section not reported"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={FileSearch}
                  title="No answer cited yet"
                  body="Run a clinical query and the exact sections the model relied on will be listed here."
                />
              )}
            </Panel>
          </div>
        )}

        {tab === "about" && <About />}
      </main>
    </div>
  );
}
