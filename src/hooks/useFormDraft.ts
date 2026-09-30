import { useEffect, useRef } from "react";
import { FieldValues, UseFormReset, UseFormWatch } from "react-hook-form";
import { mergeDraft, readWorkspace, writeWorkspace } from "@/utils/calculatorWorkspace";

/** Persist complete form drafts independently of the engine's input projection. */
export function useFormDraft<T extends FieldValues>(
  mode: string,
  watch: UseFormWatch<T>,
  reset: UseFormReset<T>,
  onRestore?: (values: T) => void,
) {
  const restore = useRef(onRestore);
  restore.current = onRestore;
  useEffect(() => {
    const key = `surface-loading-draft-${mode}`;
    const saved = readWorkspace<Record<string, unknown>>(key);
    const values = saved && typeof saved === "object" && !Array.isArray(saved)
      ? mergeDraft(watch(), saved) as T : watch();
    reset(values, { keepDefaultValues: true });
    restore.current?.(values);
    writeWorkspace(key, watch());
    const subscription = watch(() => writeWorkspace(key, watch()));
    return () => subscription.unsubscribe();
  }, [mode, watch, reset]);
}
