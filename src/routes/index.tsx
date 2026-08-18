import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Menu, Send, TriangleAlert, X } from "lucide-react";

import { About } from "@/components/About";
import { SidebarContent, type TabId } from "@/components/Sidebar";
import { SkeletonPanel, SkeletonSteps, SkeletonTable } from "@/components/Skeletons";
import { askQuestion, type AskResult } from "@/lib/rag";
import { useTheme } from "@/lib/theme";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Probably RAG — AI Clinical Decision Support" },
      {
        name: "description",
        content:
          "Ask clinical questions and get grounded recommendations, evidence, citations and retrieval traces from the Probably RAG pipeline.",
      },
      { property: "og:title", content: "Probably RAG — AI Clinical Decision Support" },
      {
        property: "og:description",
        content:
          "Grounded clinical recommendations with evidence, citations and full retrieval transparency.",
      },
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

function Index() {
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useState<TabId>("ask");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResult | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const handleAsk = async () => {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await askQuestion(q);
      setResult(data);
      setHistory((prev) => [q, ...prev].slice(0, 12));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const selectTab = (next: TabId) => {
    setTab(next);
    setDrawerOpen(false);
  };

  const structured = result?.structured_output;
  const citations = structured?.citations ?? [];
  const chunks = (result?.retrieved_chunks ?? []).slice(0, 3);

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
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-[0.12em] md:text-4xl">
            <span className="text-gradient">PROBABLY RAG</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Retrieval-grounded clinical decision support — every recommendation traced back to its
            source evidence.
          </p>
        </div>

        {tab === "ask" && (
          <>
            <section className="glass mb-6 rounded-3xl p-5 md:p-6">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleAsk();
                  }}
                  placeholder="Enter clinical query..."
                  className="w-full min-w-0 rounded-xl border border-input bg-input/40 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => void handleAsk()}
                  disabled={loading || !query.trim()}
                  className="lift inline-flex shrink-0 items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Asking..." : "Ask"}
                </button>
              </div>
            </section>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-3xl border border-destructive/40 bg-destructive/10 p-5 text-sm">
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
                    <section className="glass lift rounded-3xl p-6">
                      <h2 className="mb-3 text-sm font-semibold tracking-wide text-accent">
                        Recommendation
                      </h2>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {structured.recommendation || "No recommendation returned."}
                      </p>
                    </section>

                    <section className="glass lift rounded-3xl p-6">
                      <h2 className="mb-3 text-sm font-semibold tracking-wide text-accent">
                        Evidence
                      </h2>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {structured.evidence || "No evidence returned."}
                      </p>
                    </section>

                    <section className="glass rounded-3xl p-6">
                      <h2 className="mb-4 text-sm font-semibold tracking-wide text-accent">
                        Citations
                      </h2>
                      {citations.length ? (
                        <div className="-mx-2 overflow-x-auto px-2">
                          <table className="w-full min-w-[420px] text-left text-sm">
                            <thead>
                              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                                <th className="pb-3 pr-4 font-medium">Document</th>
                                <th className="pb-3 font-medium">Section</th>
                              </tr>
                            </thead>
                            <tbody>
                              {citations.map((c, i) => (
                                <tr key={i} className="border-t border-border">
                                  <td className="py-3 pr-4">{c.document ?? "—"}</td>
                                  <td className="py-3 text-muted-foreground">{c.section ?? "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No citations returned.</p>
                      )}
                    </section>

                    <section className="glass rounded-3xl p-6">
                      <h2 className="mb-4 text-sm font-semibold tracking-wide text-accent">
                        Raw structured output
                      </h2>
                      <pre className="max-h-80 overflow-auto rounded-xl bg-secondary/60 p-4 text-xs leading-relaxed">
                        {JSON.stringify(structured, null, 2)}
                      </pre>
                    </section>
                  </>
                ) : (
                  <section className="glass rounded-3xl p-8 text-sm text-muted-foreground">
                    Enter a clinical query above to run the retrieval pipeline.
                  </section>
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
                    <section className="glass rounded-3xl p-6">
                      <h2 className="mb-4 text-sm font-semibold tracking-wide text-accent">
                        Pipeline Status
                      </h2>
                      <ol className="flex flex-col gap-4">
                        {PIPELINE_STEPS.map((step) => (
                          <li key={step} className="flex items-start gap-3 text-sm">
                            <CheckCircle2
                              className={`mt-0.5 h-5 w-5 shrink-0 ${
                                result ? "text-success" : "text-muted-foreground"
                              }`}
                            />
                            <span className={result ? "" : "text-muted-foreground"}>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </section>

                    <section className="glass rounded-3xl p-6">
                      <h2 className="mb-4 text-sm font-semibold tracking-wide text-accent">
                        Retrieved Chunks
                      </h2>
                      {chunks.length ? (
                        <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
                          {chunks.map((chunk, i) => (
                            <article
                              key={i}
                              className="rounded-xl border border-border bg-secondary/50 p-4"
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
                        <p className="text-sm text-muted-foreground">
                          Chunks retrieved for a query will appear here.
                        </p>
                      )}
                    </section>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "history" && (
          <section className="glass rounded-3xl p-6">
            <h2 className="mb-4 font-display text-lg">History</h2>
            {history.length ? (
              <ul className="flex flex-col gap-2">
                {history.map((q, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(q);
                        setTab("ask");
                      }}
                      className="lift w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-left text-sm"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No questions asked yet this session.</p>
            )}
          </section>
        )}

        {tab === "sources" && (
          <section className="glass rounded-3xl p-6">
            <h2 className="mb-4 font-display text-lg">Sources</h2>
            {citations.length ? (
              <ul className="flex flex-col gap-2 text-sm">
                {citations.map((c, i) => (
                  <li key={i} className="rounded-xl border border-border bg-secondary/50 px-4 py-3">
                    <span className="font-medium">{c.document ?? "Unknown document"}</span>
                    <span className="text-muted-foreground"> — {c.section ?? "—"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sources cited by the latest answer will be listed here.
              </p>
            )}
          </section>
        )}

        {tab === "about" && (
          <section className="glass rounded-3xl p-6 text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-4 font-display text-lg text-foreground">About Probably RAG</h2>
            <p>
              Probably RAG is a retrieval-augmented clinical decision support interface. Queries are
              embedded, matched against a curated clinical corpus, re-ranked, and answered only when
              the retrieved evidence supports a recommendation — otherwise the pipeline refuses.
            </p>
            <p className="mt-3">
              Every answer ships with its evidence, citations, and the raw retrieved chunks so
              clinicians can audit the reasoning trail.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
