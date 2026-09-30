import { useSyncExternalStore } from "react";
import { CalculationRun } from "@/types/calculation";

export const modes = ["PIPELINE_TRACK", "2_AXLE", "3_AXLE", "GRID"] as const;
export type WorkspaceMode = typeof modes[number];
export const isWorkspaceMode = (value: unknown): value is WorkspaceMode => modes.includes(value as WorkspaceMode);
export const draftKey = (mode: WorkspaceMode) => `surface-loading-draft-${({ PIPELINE_TRACK: "track", "2_AXLE": "2axle", "3_AXLE": "3axle", GRID: "grid" })[mode]}`;
export const resultKey = (mode: WorkspaceMode) => `surface-loading-workspace-result-${mode}`;
export const lastModeKey = "surface-loading-workspace-mode";
export interface SavedResult { run: CalculationRun; draft: Record<string, unknown> }

const memory = new Map<string, unknown>();
const listeners = new Set<() => void>();
let revision = 0;
let unavailable = false;
const emit = () => { revision++; listeners.forEach(listener => listener()); };
const failed = () => { if (!unavailable) { unavailable = true; emit(); } };

// Stable serialization also preserves cleared numeric inputs (NaN) as empty fields.
export function serialize(value: unknown): string {
  return JSON.stringify(value, (_key, item) => {
    if (typeof item === "number" && !Number.isFinite(item)) return "";
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]]));
    }
    return item;
  });
}
export function readWorkspace<T>(key: string): T | undefined {
  if (memory.has(key)) return memory.get(key) as T;
  let raw: string | null;
  try { raw = localStorage.getItem(key); } catch { failed(); return undefined; }
  try {
    const value = raw ? JSON.parse(raw) : undefined;
    memory.set(key, value);
    return value;
  } catch { return undefined; }
}
export function writeWorkspace(key: string, value: unknown) {
  const encoded = serialize(value);
  const changed = serialize(memory.get(key)) !== encoded;
  memory.set(key, JSON.parse(encoded));
  try { localStorage.setItem(key, encoded); } catch { failed(); }
  if (changed) emit();
}
export function useWorkspaceRevision() {
  useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => revision);
  return unavailable;
}
export function getSavedResult(mode: WorkspaceMode): SavedResult | undefined {
  const saved = readWorkspace<SavedResult>(resultKey(mode));
  return saved?.run?.mode === mode && saved.run.input && saved.run.result && saved.draft ? saved : undefined;
}

export function mergeDraft(defaults: Record<string, unknown>, saved: Record<string, unknown>): Record<string, unknown> {
  const merged = { ...defaults };
  for (const [key, value] of Object.entries(saved)) {
    if (["__proto__", "constructor", "prototype"].includes(key)) continue;
    const base = defaults[key];
    merged[key] = value && typeof value === "object" && !Array.isArray(value) && base && typeof base === "object" && !Array.isArray(base)
      ? mergeDraft(base as Record<string, unknown>, value as Record<string, unknown>) : value;
  }
  return merged;
}
