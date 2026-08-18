import {
  Brain,
  ChevronLeft,
  FileText,
  History,
  Info,
  MessageSquare,
  Moon,
  Sun,
} from "lucide-react";

export type TabId = "ask" | "history" | "sources" | "about";

const NAV: { id: TabId; label: string; icon: typeof MessageSquare }[] = [
  { id: "ask", label: "Ask Question", icon: MessageSquare },
  { id: "history", label: "History", icon: History },
  { id: "sources", label: "Sources", icon: FileText },
  { id: "about", label: "About", icon: Info },
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
        <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground">
          <Brain className="h-5 w-5" />
          <span className="absolute inset-0 rounded-xl animate-glow-ring" />
        </span>
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
        {NAV.map(({ id, label, icon: Icon }, i) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            title={label}
            className={`lift reveal relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left text-sm ${
              active === id
                ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span
              className={`truncate transition-all duration-300 ${
                collapsed ? "w-0 opacity-0" : "opacity-100"
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1.5 border-t border-border pt-4">
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          className="lift flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 shrink-0" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" />
          )}
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
            className="lift hidden items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground md:flex"
          >
            <ChevronLeft
              className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
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
