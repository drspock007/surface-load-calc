import { z } from "zod";
import { CalculationRun } from "@/types/calculation";

const STORAGE_KEY = "surface-loading-calculations";
const MAX_RUNS = 100;

// Zod schema for validating CalculationRun structure
const calculationRunSchema = z.object({
  id: z.string().max(100),
  timestamp: z.number().positive(),
  mode: z.enum(["SIMPLE", "PIPELINE_TRACK", "2_AXLE", "3_AXLE", "GRID"]),
  input: z.record(z.unknown()),
  result: z.record(z.unknown()),
});

const runsArraySchema = z.array(calculationRunSchema).max(MAX_RUNS);

export const storage = {
  getRuns: (): CalculationRun[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      // Validate stored data on retrieval to ensure integrity
      const validated = runsArraySchema.safeParse(parsed);
      return validated.success ? (validated.data as CalculationRun[]) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  },

  saveRun: (run: CalculationRun): void => {
    try {
      // Validate the run before saving
      const validatedRun = calculationRunSchema.safeParse(run);
      if (!validatedRun.success) {
        console.error("Invalid run data:", validatedRun.error);
        return;
      }
      
      const runs = storage.getRuns();
      runs.unshift(validatedRun.data as CalculationRun);
      
      // Enforce max runs limit
      const limitedRuns = runs.slice(0, MAX_RUNS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedRuns));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },

  deleteRun: (id: string): void => {
    try {
      // Validate id is a non-empty string
      if (typeof id !== "string" || id.length === 0 || id.length > 100) {
        console.error("Invalid run id");
        return;
      }
      
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
      // Validate input size to prevent DoS
      if (jsonString.length > 1024 * 1024) {
        console.error("Import data too large");
        return false;
      }
      
      const parsed = JSON.parse(jsonString);
      
      // Validate structure and content using Zod schema
      const validated = runsArraySchema.safeParse(parsed);
      if (!validated.success) {
        console.error("Validation error:", validated.error.message);
        return false;
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated.data));
      return true;
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
