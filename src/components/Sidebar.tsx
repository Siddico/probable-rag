import {
  Brain,
  FileText,
  History,
  Info,
  LogOut,
  MessageSquare,
  Moon,
  Settings,
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
};

export function SidebarContent({ active, onSelect, theme, onToggleTheme }: Props) {
  return (
    <div className="flex h-full flex-col gap-8 p-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary text-primary-foreground">
          <Brain className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold tracking-[0.18em]">
            PROBABLY
          </p>
          <p className="truncate font-display text-xs tracking-[0.3em] text-muted-foreground">
            RAG
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`lift flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${
              active === id
                ? "gradient-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
        <button
          type="button"
          onClick={onToggleTheme}
          className="lift flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 shrink-0" />
          ) : (
            <Moon className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <button
          type="button"
          className="lift flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span className="truncate">Settings</span>
        </button>
        <button
          type="button"
          className="lift flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </div>
  );
}
