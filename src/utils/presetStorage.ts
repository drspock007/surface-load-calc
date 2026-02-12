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
