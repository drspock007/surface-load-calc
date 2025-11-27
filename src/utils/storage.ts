import { CalculationRun } from "@/types/calculation";

const STORAGE_KEY = "surface-loading-calculations";

export const storage = {
  getRuns: (): CalculationRun[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  },

  saveRun: (run: CalculationRun): void => {
    try {
      const runs = storage.getRuns();
      runs.unshift(run);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },

  deleteRun: (id: string): void => {
    try {
      const runs = storage.getRuns().filter((run) => run.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
    } catch (error) {
      console.error("Error deleting from localStorage:", error);
    }
  },

  exportToJSON: (): string => {
    const runs = storage.getRuns();
    return JSON.stringify(runs, null, 2);
  },

  importFromJSON: (jsonString: string): boolean => {
    try {
      const runs = JSON.parse(jsonString);
      if (Array.isArray(runs)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error importing JSON:", error);
      return false;
    }
  },

  clearAll: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};
