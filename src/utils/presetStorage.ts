import { z } from "zod";

export type PresetMode = "track" | "2axle" | "3axle" | "grid";

const presetEntrySchema = z.object({
  name: z.string().min(1).max(100),
  values: z.record(z.unknown()),
  createdAt: z.string(),
});

const presetsArraySchema = z.array(presetEntrySchema);

export type PresetEntry = z.infer<typeof presetEntrySchema>;

const MAX_PRESETS_PER_MODE = 20;

function storageKey(mode: PresetMode): string {
  return `surface-loading-presets-${mode}`;
}

export function getPresets(mode: PresetMode): PresetEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(mode));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = presetsArraySchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function savePreset(mode: PresetMode, name: string, values: Record<string, unknown>): boolean {
  const presets = getPresets(mode);
  const existingIndex = presets.findIndex((p) => p.name === name);

  const entry: PresetEntry = {
    name: name.trim().slice(0, 100),
    values,
    createdAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    presets[existingIndex] = entry;
  } else {
    if (presets.length >= MAX_PRESETS_PER_MODE) return false;
    presets.push(entry);
  }

  localStorage.setItem(storageKey(mode), JSON.stringify(presets));
  return true;
}

export function deletePreset(mode: PresetMode, name: string): void {
  const presets = getPresets(mode).filter((p) => p.name !== name);
  localStorage.setItem(storageKey(mode), JSON.stringify(presets));
}

/* ── Export / Import ────────────────────────────────────── */

const presetModeSchema = z.enum(["track", "2axle", "3axle", "grid"]);

const exportFileSchema = z.object({
  version: z.literal(1),
  mode: presetModeSchema,
  exportedAt: z.string(),
  presets: z.array(presetEntrySchema).max(MAX_PRESETS_PER_MODE),
});

export interface ImportResult {
  imported: number;
  skippedDuplicate: number;
  skippedOverLimit: number;
  error?: string;
}

export function exportPresetsToJSON(mode: PresetMode): string {
  const data = {
    version: 1 as const,
    mode,
    exportedAt: new Date().toISOString(),
    presets: getPresets(mode),
  };
  return JSON.stringify(data, null, 2);
}

export function importPresetsFromJSON(mode: PresetMode, jsonString: string): ImportResult {
  if (jsonString.length > 1024 * 1024) {
    return { imported: 0, skippedDuplicate: 0, skippedOverLimit: 0, error: "File too large (max 1 MB)" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { imported: 0, skippedDuplicate: 0, skippedOverLimit: 0, error: "Invalid JSON file" };
  }

  const result = exportFileSchema.safeParse(parsed);
  if (!result.success) {
    return { imported: 0, skippedDuplicate: 0, skippedOverLimit: 0, error: "Invalid file structure" };
  }

  if (result.data.mode !== mode) {
    return {
      imported: 0, skippedDuplicate: 0, skippedOverLimit: 0,
      error: `Mode mismatch: file is "${result.data.mode}", current mode is "${mode}"`,
    };
  }

  const existing = getPresets(mode);
  const existingNames = new Set(existing.map((p) => p.name));
  let skippedDuplicate = 0;
  let skippedOverLimit = 0;
  let imported = 0;

  for (const preset of result.data.presets) {
    if (existingNames.has(preset.name)) {
      skippedDuplicate++;
      continue;
    }
    if (existing.length + imported >= MAX_PRESETS_PER_MODE) {
      skippedOverLimit++;
      continue;
    }
    existing.push(preset);
    imported++;
  }

  localStorage.setItem(storageKey(mode), JSON.stringify(existing));
  return { imported, skippedDuplicate, skippedOverLimit };
}
