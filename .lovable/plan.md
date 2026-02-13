
# Fix Preset Saving and Pipe Selector Restoration

## Problems Found

### Bug 1: Presets "don't appear" after saving
The `PresetManager` component initializes its preset list with `useState(() => getPresets(mode))`. This only runs once when the component mounts. The `refreshPresets()` call after saving does update the state correctly, BUT the `Select` component is **uncontrolled** (no `value` prop) -- so after loading a preset, the dropdown keeps showing the last selected preset name in the trigger, making it look like nothing changed. Additionally, if the user navigates away and comes back, the component remounts and should reload from localStorage correctly. The core display issue is that after saving a new preset, the Select trigger still shows the old selection text rather than resetting to "Select a preset...".

### Bug 2: Wall Thickness Schedule reverts to "Custom" on preset load
The form schemas (in all 4 forms: Track, 2-Axle, 3-Axle, Grid) do **not** include `selectedNPS`, `selectedSchedule`, or `selectedGrade` fields. These fields are used by `PipeSelector` via `watch()` and `setValue()`, but since they are not in the Zod schema, they are **stripped out** by `react-hook-form` validation. When `getCurrentValues()` calls `watch()`, it returns all registered fields -- but `selectedNPS`, `selectedSchedule`, `selectedGrade` are not registered via `register()`, they are only managed via `setValue()`. So when saving a preset, these selector states may be included, BUT when loading a preset back, `setValue("selectedSchedule", value)` works -- however the value was never saved in the first place because `watch()` may not return unregistered fields.

## Solution

### Fix 1: PresetManager -- add controlled state and reset after save/load

- Add a `selectedPreset` state to control the `Select` value
- Reset it to empty after loading (so the dropdown shows "Select a preset..." again, ready for next selection)
- This makes it clear that presets exist and can be re-selected

### Fix 2: Add selector fields to all form schemas

Add these optional fields to the Zod schema in all 4 forms:
- `selectedNPS: z.string().optional()`
- `selectedSchedule: z.string().optional()`
- `selectedGrade: z.string().optional()`

And add matching `defaultValues` entries. This ensures:
1. `watch()` returns these values when saving a preset
2. `setValue()` properly restores them when loading a preset
3. The NPS, Schedule, and Grade dropdowns show the correct saved selection

### Files to modify

| File | Change |
|------|--------|
| `src/components/PresetManager.tsx` | Add controlled `Select` value with reset after load |
| `src/components/PipelineTrackForm/index.tsx` | Add `selectedNPS`, `selectedSchedule`, `selectedGrade` to schema and defaults |
| `src/components/TwoAxleForm.tsx` | Same schema additions |
| `src/components/ThreeAxleForm.tsx` | Same schema additions |
| `src/components/GridLoadForm.tsx` | Same schema additions |
