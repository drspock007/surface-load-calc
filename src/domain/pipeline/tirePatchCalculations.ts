/**
 * Tire Contact Patch Calculation Module
 * Calculates tire contact dimensions based on load and pressure
 */

export interface TireContactPatch {
  contactLength_in: number;
  contactWidth_in: number;
  contactArea_in2: number;
}

/**
 * Calculate tire contact patch dimensions from axle load and tire pressure
 * 
 * @param axleLoad_lb - Total load on the axle (pounds)
 * @param tirePressure_psi - Tire inflation pressure (psi)
 * @param tiresPerAxle - Number of tires on the axle (typically 2 for single, 4 for dual)
 * @param aspectRatio - Width/Length ratio of contact patch (typically 0.8)
 * @returns Contact patch dimensions
 */
export function calculateContactPatch(
  axleLoad_lb: number,
  tirePressure_psi: number,
  tiresPerAxle: number = 2,
  aspectRatio: number = 0.8
): TireContactPatch {
  // Validate inputs
  if (axleLoad_lb <= 0 || tirePressure_psi <= 0 || tiresPerAxle <= 0) {
    throw new Error('Invalid input values for contact patch calculation');
  }

  // Calculate load per tire
  const loadPerTire_lb = axleLoad_lb / tiresPerAxle;
  
  // Contact area = Load / Pressure (assumes uniform pressure distribution)
  const contactArea_in2 = loadPerTire_lb / tirePressure_psi;
  
  // Calculate contact dimensions assuming rectangular patch with aspect ratio
  // width * length = area
  // width / length = aspectRatio
  // Therefore: length = sqrt(area / aspectRatio)
  //            width = area / length
  const contactLength_in = Math.sqrt(contactArea_in2 / aspectRatio);
  const contactWidth_in = contactArea_in2 / contactLength_in;
  
  return {
    contactLength_in,
    contactWidth_in,
    contactArea_in2,
  };
}

/**
 * Convert contact patch from metric to English units
 */
export function convertContactPatchToEN(
  axleLoad_kg: number,
  tirePressure_kPa: number,
  tiresPerAxle: number = 2,
  aspectRatio: number = 0.8
): TireContactPatch {
  // Convert to English units
  const axleLoad_lb = axleLoad_kg * 2.2046226218;
  const tirePressure_psi = tirePressure_kPa * 0.1450378911491;
  
  return calculateContactPatch(axleLoad_lb, tirePressure_psi, tiresPerAxle, aspectRatio);
}
