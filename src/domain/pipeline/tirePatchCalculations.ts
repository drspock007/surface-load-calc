/**
 * Tire Contact Patch Calculation Module
 * Calculates tire contact dimensions based on load and pressure
 */

import { TirePressureUnit } from './types';

export interface TireContactPatch {
  contactLength_in: number;
  contactWidth_in: number;
  contactArea_in2: number;
}

/**
 * Conversion factors from various tire pressure units to psi
 * VBA uses kg/m² with factor 0.001422335835237
 */
const TIRE_PRESSURE_TO_PSI: Record<TirePressureUnit, number> = {
  'kPa': 0.1450378911491,      // 1 kPa = 0.145 psi
  'kg/m2': 0.001422335835237,  // 1 kg/m² = 0.00142 psi (VBA factor)
  'bar': 14.5038,              // 1 bar = 14.5 psi
  'psig': 1.0,                 // already in psi
};

/**
 * Convert tire pressure from any supported unit to psi
 */
export function convertTirePressureToPsi(
  pressure: number,
  fromUnit: TirePressureUnit
): number {
  return pressure * TIRE_PRESSURE_TO_PSI[fromUnit];
}

/**
 * Calculate tire contact patch dimensions from axle load, tire pressure, and tire width
 * (Matches original VBA logic)
 * 
 * @param axleLoad_lb - Total load on the axle (pounds)
 * @param tirePressure_psi - Tire inflation pressure (psi)
 * @param tiresPerAxle - Number of tires on the axle (typically 2 for single, 4 for dual)
 * @param tireWidth_in - Tire contact width (inches) - user input
 * @returns Contact patch dimensions
 */
export function calculateContactPatch(
  axleLoad_lb: number,
  tirePressure_psi: number,
  tiresPerAxle: number,
  tireWidth_in: number
): TireContactPatch {
  // Validate inputs
  if (axleLoad_lb <= 0 || tirePressure_psi <= 0 || tiresPerAxle <= 0 || tireWidth_in <= 0) {
    throw new Error('Invalid input values for contact patch calculation');
  }

  // Calculate load per tire
  const loadPerTire_lb = axleLoad_lb / tiresPerAxle;
  
  // Contact area = Load / Pressure (assumes uniform pressure distribution)
  const contactArea_in2 = loadPerTire_lb / tirePressure_psi;
  
  // Calculate contact length from area and width (VBA formula)
  // Area = Width * Length
  // Therefore: Length = Area / Width
  const contactLength_in = contactArea_in2 / tireWidth_in;
  
  return {
    contactLength_in,
    contactWidth_in: tireWidth_in,
    contactArea_in2,
  };
}

/**
 * Convert contact patch from metric to English units
 */
export function convertContactPatchToEN(
  axleLoad_kg: number,
  tirePressure_kPa: number,
  tiresPerAxle: number,
  tireWidth_mm: number
): TireContactPatch {
  // Convert to English units
  const axleLoad_lb = axleLoad_kg * 2.2046226218;
  const tirePressure_psi = tirePressure_kPa * 0.1450378911491;
  const tireWidth_in = tireWidth_mm * 0.03937007874016;
  
  return calculateContactPatch(axleLoad_lb, tirePressure_psi, tiresPerAxle, tireWidth_in);
}
