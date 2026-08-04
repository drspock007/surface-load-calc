import { useEffect, useRef } from "react";
import { FieldValues, UseFormReset, UseFormWatch } from "react-hook-form";

/**
 * Persists the current (unsaved) form values in localStorage so the user
 * recovers everything - including the calculation name - when coming back
 * to the calculator after running a calculation.
 */
export function useFormDraft<T extends FieldValues>(
  mode: string,
  watch: UseFormWatch<T>,
  reset: UseFormReset<T>,
  onRestore?: (values: T) => void,
) {
  const key = `surface-loading-draft-${mode}`;
  const ready = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const values = JSON.parse(raw) as T;
        reset(values, { keepDefaultValues: true });
        onRestore?.(values);
      }
    } catch {
      // Ignore unreadable / corrupted drafts
    }
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = watch((values) => {
      if (!ready.current) return;
      try {
        localStorage.setItem(key, JSON.stringify(values));
      } catch {
        // Storage full or blocked: draft persistence is best-effort
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);
}
