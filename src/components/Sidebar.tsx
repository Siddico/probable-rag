import { ChevronLeft, Library, MessageSquareQuote, Moon, Sun, TimerReset, Users } from "lucide-react";

import { Logo } from "@/components/Logo";

export type TabId = "ask" | "history" | "sources" | "about";

const NAV: { id: TabId; label: string; icon: typeof Library }[] = [
  { id: "ask", label: "Ask Question", icon: MessageSquareQuote },
  { id: "history", label: "History", icon: TimerReset },
  { id: "sources", label: "Sources", icon: Library },
  { id: "about", label: "About", icon: Users },
];

type Props = {
  active: TabId;
  onSelect: (tab: TabId) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function SidebarContent({
  active,
  onSelect,
  theme,
  onToggleTheme,
  collapsed = false,
  onToggleCollapse,
}: Props) {
  return (
    <div className="flex h-full flex-col gap-8 p-4 md:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <Logo size={42} />
        <div
          className={`min-w-0 transition-all duration-300 ${
            collapsed ? "pointer-events-none w-0 -translate-x-2 opacity-0" : "opacity-100"
          }`}
        >
          <p className="truncate font-display text-sm font-semibold tracking-[0.18em]">PROBABLY</p>
          <p className="truncate font-display text-xs tracking-[0.3em] text-muted-foreground">
            RAG
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5">
        {NAV.map(({ id, label, icon: Icon }, i) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              title={label}
              aria-current={isActive ? "page" : undefined}
              className={`lift reveal group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                isActive
                  ? "bg-secondary/80 text-foreground ring-1 ring-border"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span
                className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-300 ${
                  isActive ? "gradient-primary opacity-100" : "opacity-0"
                }`}
              />
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-300 ${
                  isActive
                    ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "bg-secondary/70 text-muted-foreground group-hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <span
                className={`truncate font-medium transition-all duration-300 ${
                  collapsed ? "w-0 opacity-0" : "opacity-100"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1.5 border-t border-border pt-4">
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          className="lift flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary/70">
            {theme === "dark" ? (
              <Sun className="h-4 w-4" strokeWidth={1.9} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.9} />
            )}
          </span>
          <span
            className={`truncate transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "opacity-100"
            }`}
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="lift hidden items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground md:flex"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary/70">
              <ChevronLeft
                className={`h-4 w-4 transition-transform duration-300 ${
                  collapsed ? "rotate-180" : ""
                }`}
                strokeWidth={1.9}
              />
            </span>
            <span
              className={`truncate transition-all duration-300 ${
                collapsed ? "w-0 opacity-0" : "opacity-100"
              }`}
            >
              Collapse
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
