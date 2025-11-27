import { CalculationInput, CalculationResult } from "@/types/calculation";

// Re-export pipeline calculation
export { calculatePipelineTrack } from "@/domain/pipeline";
export type { PipelineTrackInputs, PipelineTrackResults } from "@/domain/pipeline";

/**
 * Legacy simple surface load calculation
 * Kept for backward compatibility
 */
export const calculateStress = (input: CalculationInput): CalculationResult => {
  const { loadMagnitude, loadLength, loadWidth, depth, soilUnitWeight } = input;

  // Calculate load area
  const loadArea = loadLength * loadWidth;

  // Contact pressure (uniform loading assumption)
  const contactPressure = loadMagnitude / loadArea;

  // Surface stress (same as contact pressure at surface)
  const surfaceStress = contactPressure;

  // Simplified stress at depth using Boussinesq approximation
  // For a uniformly loaded rectangular area, using simplified formula
  const influenceFactor = 1 / (1 + Math.pow(depth / Math.sqrt(loadArea), 2));
  const stressAtDepth = contactPressure * influenceFactor;

  // Total stress at depth (includes soil self-weight)
  const soilSelfWeight = soilUnitWeight * depth;
  const totalStress = stressAtDepth + soilSelfWeight;

  return {
    surfaceStress: Math.round(surfaceStress * 100) / 100,
    stressAtDepth: Math.round(stressAtDepth * 100) / 100,
    totalStress: Math.round(totalStress * 100) / 100,
    loadArea: Math.round(loadArea * 100) / 100,
    contactPressure: Math.round(contactPressure * 100) / 100,
  };
};
