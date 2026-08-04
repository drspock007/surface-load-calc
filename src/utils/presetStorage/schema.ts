import { z } from "zod";

export type PresetMode = "track" | "2axle" | "3axle" | "grid";

export const PRESET_MODES: PresetMode[] = ["track", "2axle", "3axle", "grid"];

export const presetModeSchema = z.enum(["track", "2axle", "3axle", "grid"]);

export const presetEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  mode: presetModeSchema,
  values: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PresetEntry = z.infer<typeof presetEntrySchema>;

/** Legacy (v1) shape: a bare array without id / mode / updatedAt. */
export const legacyPresetEntrySchema = z.object({
  name: z.string().min(1).max(100),
  values: z.record(z.unknown()),
  createdAt: z.string(),
});

export const storeSchema = z.object({
  schemaVersion: z.literal(2),
  presets: z.array(presetEntrySchema),
});

export const MAX_PRESETS_PER_MODE = 50;
export const MAX_IMPORT_BYTES = 1024 * 1024;

export function storageKey(mode: PresetMode): string {
  return `surface-loading-presets-${mode}`;
}

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `p_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export interface StorageResult {
  ok: boolean;
  error?: string;
}

export const MODE_LABELS: Record<PresetMode, string> = {
  track: "Track vehicle",
  "2axle": "2-Axle",
  "3axle": "3-Axle",
  grid: "Grid load",
};
