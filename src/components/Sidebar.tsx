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
  const row = `lift group relative flex items-center rounded-xl py-2.5 text-sm transition-colors ${
    collapsed ? "justify-center px-0" : "gap-3 px-3 text-left"
  }`;

  return (
    <div className={`flex h-full flex-col gap-8 py-4 md:py-5 ${collapsed ? "px-3" : "px-4 md:px-5"}`}>
      <div className={`flex items-center ${collapsed ? "justify-center" : "min-w-0 gap-3"}`}>
        <Logo size={42} />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold tracking-[0.18em]">
              PROBABLY
            </p>
            <p className="truncate font-display text-xs tracking-[0.3em] text-muted-foreground">
              RAG
            </p>
          </div>
        )}
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
              className={`${row} reveal overflow-hidden ${
                isActive
                  ? "bg-secondary/80 text-foreground ring-1 ring-border"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {!collapsed && (
                <span
                  className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full transition-opacity duration-300 ${
                    isActive ? "gradient-primary opacity-100" : "opacity-0"
                  }`}
                />
              )}
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-all duration-300 ${
                  isActive
                    ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "bg-secondary/70 text-muted-foreground group-hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.9} />
              </span>
              {!collapsed && <span className="truncate font-medium">{label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1.5 border-t border-border pt-4">
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          className={`${row} text-muted-foreground hover:bg-secondary/60 hover:text-foreground`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary/70">
            {theme === "dark" ? (
              <Sun className="h-4 w-4" strokeWidth={1.9} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.9} />
            )}
          </span>
          {!collapsed && (
            <span className="truncate">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`${row} hidden text-muted-foreground hover:bg-secondary/60 hover:text-foreground md:flex`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary/70">
              <ChevronLeft
                className={`h-4 w-4 transition-transform duration-300 ${
                  collapsed ? "rotate-180" : ""
                }`}
                strokeWidth={1.9}
              />
            </span>
            {!collapsed && <span className="truncate">Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );
}
