import { useCallback, useEffect, useState } from "react";

export type Role = "member" | "supervisor";

export type TeamSlot = {
  id: string;
  role: Role;
  title: string;
  name: string | null;
  photo: string | null;
  filled: boolean;
  updatedAt: number | null;
};

const STORAGE_KEY = "probably-rag-team-v1";

const DEFAULT_SLOTS: TeamSlot[] = [
  { id: "m1", role: "member", title: "Team Member 01", name: null, photo: null, filled: false, updatedAt: null },
  { id: "m2", role: "member", title: "Team Member 02", name: null, photo: null, filled: false, updatedAt: null },
  { id: "m3", role: "member", title: "Team Member 03", name: null, photo: null, filled: false, updatedAt: null },
  { id: "m4", role: "member", title: "Team Member 04", name: null, photo: null, filled: false, updatedAt: null },
  { id: "s1", role: "supervisor", title: "Supervisor 01", name: null, photo: null, filled: false, updatedAt: null },
  { id: "s2", role: "supervisor", title: "Supervisor 02", name: null, photo: null, filled: false, updatedAt: null },
];

function read(): TeamSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SLOTS;
    const parsed = JSON.parse(raw) as TeamSlot[];
    return DEFAULT_SLOTS.map((slot) => {
      const found = parsed.find((p) => p.id === slot.id);
      return found ? { ...slot, ...found, id: slot.id, role: slot.role } : slot;
    });
  } catch {
    return DEFAULT_SLOTS;
  }
}

export function useTeam() {
  const [slots, setSlots] = useState<TeamSlot[]>(DEFAULT_SLOTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSlots(read());
    setReady(true);
  }, []);

  const save = useCallback((id: string, name: string, photo: string | null) => {
    setSlots((prev) => {
      const next = prev.map((slot) =>
        slot.id === id
          ? { ...slot, name, photo, filled: true, updatedAt: Date.now() }
          : slot,
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage full or unavailable */
      }
      return next;
    });
  }, []);

  const clear = useCallback((id: string) => {
    setSlots((prev) => {
      const next = prev.map((slot) =>
        slot.id === id ? { ...slot, name: null, photo: null, filled: false, updatedAt: null } : slot,
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage full or unavailable */
      }
      return next;
    });
  }, []);

  return { slots, ready, save, clear };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });
}
