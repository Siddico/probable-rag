import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

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

const COVER_SLOT = "cover";

const DEFAULT_SLOTS: TeamSlot[] = [
  { id: "m1", role: "member", title: "Team Member 01", name: null, photo: null, filled: false, updatedAt: null },
  { id: "m2", role: "member", title: "Team Member 02", name: null, photo: null, filled: false, updatedAt: null },
  { id: "m3", role: "member", title: "Team Member 03", name: null, photo: null, filled: false, updatedAt: null },
  { id: "m4", role: "member", title: "Team Member 04", name: null, photo: null, filled: false, updatedAt: null },
  { id: "s1", role: "supervisor", title: "Supervisor 01", name: null, photo: null, filled: false, updatedAt: null },
  { id: "s2", role: "supervisor", title: "Supervisor 02", name: null, photo: null, filled: false, updatedAt: null },
];

type Row = { slot_id: string; name: string | null; photo: string | null; updated_at: string };

async function fetchRows(): Promise<Row[]> {
  const { data } = await supabase.from("team_profiles").select("slot_id, name, photo, updated_at");
  return (data ?? []) as Row[];
}

function merge(rows: Row[]): TeamSlot[] {
  return DEFAULT_SLOTS.map((slot) => {
    const row = rows.find((r) => r.slot_id === slot.id);
    if (!row || (!row.name && !row.photo)) return slot;
    return {
      ...slot,
      name: row.name,
      photo: row.photo,
      filled: Boolean(row.name),
      updatedAt: new Date(row.updated_at).getTime(),
    };
  });
}

/** Shared team directory — stored in the cloud so every visitor sees the same people. */
export function useTeam() {
  const [slots, setSlots] = useState<TeamSlot[]>(DEFAULT_SLOTS);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    setSlots(merge(await fetchRows()));
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
    const channel = supabase
      .channel("team_profiles_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "team_profiles" }, () => {
        void refresh();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const save = useCallback((id: string, name: string, photo: string | null) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, name, photo, filled: true, updatedAt: Date.now() } : slot,
      ),
    );
    void supabase
      .from("team_profiles")
      .upsert({ slot_id: id, name, photo, updated_at: new Date().toISOString() })
      .then(({ error }) => {
        if (error) console.error("[team] save failed", error.message);
      });
  }, []);

  const clear = useCallback((id: string) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, name: null, photo: null, filled: false, updatedAt: null } : slot,
      ),
    );
    void supabase.from("team_profiles").delete().eq("slot_id", id);
  }, []);

  return { slots, ready, save, clear };
}

/** Shared group photo for the About header. */
export function useTeamCover() {
  const [cover, setCover] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("team_profiles")
      .select("photo")
      .eq("slot_id", COVER_SLOT)
      .maybeSingle();
    setCover((data as { photo: string | null } | null)?.photo ?? null);
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
    const channel = supabase
      .channel("team_cover_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "team_profiles" }, () => {
        void refresh();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh]);

  const saveCover = useCallback((dataUrl: string) => {
    setCover(dataUrl);
    void supabase
      .from("team_profiles")
      .upsert({ slot_id: COVER_SLOT, photo: dataUrl, updated_at: new Date().toISOString() })
      .then(({ error }) => {
        if (error) console.error("[team] cover save failed", error.message);
      });
  }, []);

  const clearCover = useCallback(() => {
    setCover(null);
    void supabase.from("team_profiles").delete().eq("slot_id", COVER_SLOT);
  }, []);

  return { cover, ready, saveCover, clearCover };
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Reads an image and downscales it to a compact JPEG data URL so shared
 * profiles stay small enough to sync instantly for everyone.
 */
export async function fileToDataUrl(file: File, maxSize = 900): Promise<string> {
  const raw = await readAsDataUrl(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = raw;
    });
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return raw;
  }
}
