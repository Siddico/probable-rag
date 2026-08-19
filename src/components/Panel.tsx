import { ChevronDown, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

export function Panel({
  icon: Icon,
  title,
  hint,
  action,
  children,
  className = "",
  collapsible = false,
  defaultOpen = true,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const expanded = collapsible ? open : true;

  const header = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-accent ring-1 ring-border">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <h2 className="truncate font-display text-sm font-semibold tracking-[0.08em]">{title}</h2>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </>
  );

  return (
    <section className={`glass reveal rounded-3xl p-5 md:p-6 ${className}`}>
      <header className={`flex items-center gap-3 ${expanded ? "mb-4" : ""}`}>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="group flex min-w-0 flex-1 items-center gap-3"
          >
            {header}
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:text-accent ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        ) : (
          header
        )}
        {action}
      </header>
      <div
        className="grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr", opacity: expanded ? 1 : 0 }}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary/70 text-muted-foreground animate-pulse-soft">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <p className="font-display text-sm">{title}</p>
      <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
