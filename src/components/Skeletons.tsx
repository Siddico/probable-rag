export function Line({ className = "" }: { className?: string }) {
  return <div className={`shimmer h-3.5 rounded-md ${className}`} />;
}

export function SkeletonPanel({ title, lines = 3 }: { title: string; lines?: number }) {
  return (
    <section className="glass rounded-3xl p-6">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground">{title}</h2>
      <div className="flex flex-col gap-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Line key={i} className={i === lines - 1 ? "w-2/3" : "w-full"} />
        ))}
      </div>
    </section>
  );
}

export function SkeletonTable() {
  return (
    <section className="glass rounded-3xl p-6">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground">Citations</h2>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <Line />
            <Line className="w-3/4" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SkeletonSteps() {
  return (
    <section className="glass rounded-3xl p-6">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground">
        Pipeline Status
      </h2>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="shimmer h-6 w-6 shrink-0 rounded-full" />
            <Line className="w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
