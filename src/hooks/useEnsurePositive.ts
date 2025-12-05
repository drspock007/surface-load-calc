import { UseFormSetValue, Path } from "react-hook-form";

/**
 * Creates a blur handler that ensures the field value is positive.
 * If a negative value is entered, it converts to its absolute value.
 */
export function createEnsurePositive<T extends Record<string, any>>(
  setValue: UseFormSetValue<T>
) {
  return (fieldName: Path<T>) => ({
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value < 0) {
        setValue(fieldName, Math.abs(value) as any);
      }
    }
  });
}
