import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Pencil,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { fileToDataUrl, useTeam, type TeamSlot } from "@/lib/team";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function TeamCard({
  slot,
  index,
  onSave,
  onClear,
}: {
  slot: TeamSlot;
  index: number;
  onSave: (id: string, name: string, photo: string | null) => void;
  onClear: (id: string) => void;
}) {
  const [editing, setEditing] = useState(!slot.filled);
  const [name, setName] = useState(slot.name ?? "");
  const [photo, setPhoto] = useState<string | null>(slot.photo);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setName(slot.name ?? "");
      setPhoto(slot.photo);
    }
  }, [slot.name, slot.photo, editing]);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 1200);
    return () => clearTimeout(t);
  }, [justSaved]);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1_500_000) {
      setError("Please choose an image under 1.5 MB.");
      return;
    }
    try {
      setPhoto(await fileToDataUrl(file));
      setError(null);
    } catch {
      setError("Could not read that image.");
    }
  };

  const commit = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Enter a full name first.");
      return;
    }
    setError(null);
    onSave(slot.id, trimmed, photo);
    setEditing(false);
    setJustSaved(true);
  };

  const avatar = (
    <div
      className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-secondary/60 ${
        slot.filled && !editing ? "" : "ring-1 ring-primary/30"
      }`}
    >
      {photo ? (
        <img
          src={photo}
          alt={slot.name ? `${slot.name} — ${slot.title}` : `${slot.title} photo`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      ) : name.trim() ? (
        <span className="font-display text-xl font-semibold text-gradient">
          {initials(name.trim())}
        </span>
      ) : (
        <UserRound className="h-8 w-8 text-muted-foreground" />
      )}
    </div>
  );

  return (
    <article
      className={`glass lift reveal shine-on-hover group relative overflow-hidden rounded-3xl p-6 ${
        justSaved ? "animate-pop-in" : ""
      }`}
      style={{ animationDelay: justSaved ? "0ms" : `${index * 90}ms` }}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/25 blur-3xl transition-opacity duration-500 group-hover:opacity-100 md:opacity-60" />

      <div className="relative flex flex-col items-start gap-4">
        <div className={`relative rounded-2xl ${slot.filled && !editing ? "avatar-ring" : ""}`}>
          <div className="relative rounded-2xl bg-background">{avatar}</div>
          {editing && (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label={`Upload photo for ${slot.title}`}
                className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-transform duration-200 hover:scale-110 active:scale-95"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void pick(e.target.files?.[0])}
              />
            </>
          )}
        </div>

        <div className="w-full min-w-0">
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-accent">{slot.title}</p>
          <p className="mt-1 break-words font-display text-lg font-semibold leading-snug">
            {slot.filled ? slot.name : "Available slot"}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {slot.filled ? (
              <>
                <span className="grid h-4 w-4 place-items-center rounded-full gradient-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" />
                </span>
                Profile saved · editable anytime
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 animate-pulse-soft" /> Add your name and photo
              </>
            )}
          </p>
        </div>
      </div>

      <div
        className="relative grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: editing ? "1fr" : "0fr", opacity: editing ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div className="mt-5 flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
              }}
              placeholder="Type your full name"
              className="w-full min-w-0 rounded-xl border border-input bg-input/40 px-4 py-2.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={commit}
                className="lift inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Check className="h-4 w-4" /> Save profile
              </button>
              {slot.filled && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                    setName(slot.name ?? "");
                    setPhoto(slot.photo);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              )}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>
      </div>

      {slot.filled && !editing && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="lift inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            type="button"
            onClick={() => {
              onClear(slot.id);
              setName("");
              setPhoto(null);
              setEditing(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      )}
    </article>
  );
}

export function About() {
  const { slots, ready, save, clear } = useTeam();
  const members = slots.filter((s) => s.role === "member");
  const supervisors = slots.filter((s) => s.role === "supervisor");
  const filled = slots.filter((s) => s.filled).length;

  return (
    <div className="flex flex-col gap-8">
      <section className="glass reveal relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-70 animate-aurora bg-[radial-gradient(45%_60%_at_15%_10%,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_70%),radial-gradient(40%_55%_at_85%_20%,color-mix(in_oklab,var(--accent)_24%,transparent),transparent_70%)]" />
        <div className="relative">
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-accent">About the project</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            <span className="text-gradient">Retrieval-grounded clinical intelligence</span>
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Probably RAG embeds every clinical query, matches it against a curated evidence corpus,
            re-ranks the strongest passages, and answers only when the retrieved evidence supports a
            recommendation — otherwise the pipeline refuses. Each answer ships with its evidence,
            citations, and raw chunks so the reasoning trail stays fully auditable.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { k: "Pipeline", v: "Embed → Retrieve → Re-rank → Validate" },
              { k: "Guardrail", v: "Strict refusal without evidence" },
              { k: "Team", v: `${filled}/6 profiles registered` },
            ].map((item) => (
              <div
                key={item.k}
                className="lift rounded-2xl border border-border bg-secondary/50 p-4"
              >
                <p className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
                  {item.k}
                </p>
                <p className="mt-1.5 text-sm font-medium">{item.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <header className="mb-4 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground">
            <UserRound className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold">The Team</h3>
            <p className="text-xs text-muted-foreground">
              Four builders behind the pipeline — every profile stays editable.
            </p>
          </div>
        </header>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {ready &&
            members.map((slot, i) => (
              <TeamCard key={slot.id} slot={slot} index={i} onSave={save} onClear={clear} />
            ))}
        </div>
      </section>

      <section>
        <header className="mb-4 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold">Supervisors</h3>
            <p className="text-xs text-muted-foreground">Academic and clinical oversight.</p>
          </div>
        </header>
        <div className="grid gap-5 sm:grid-cols-2">
          {ready &&
            supervisors.map((slot, i) => (
              <TeamCard key={slot.id} slot={slot} index={i} onSave={save} onClear={clear} />
            ))}
        </div>
      </section>
    </div>
  );
}
