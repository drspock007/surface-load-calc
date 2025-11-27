import { UnitsSystem } from './types';

// Conversion factors
const IN_TO_M = 0.0254;
const M_TO_IN = 1 / IN_TO_M;
const FT_TO_M = 0.3048;
const M_TO_FT = 1 / FT_TO_M;
const PSI_TO_KPA = 6.89476;
const KPA_TO_PSI = 1 / PSI_TO_KPA;
const LB_TO_KN = 0.00444822;
const KN_TO_LB = 1 / LB_TO_KN;
const LB_FT3_TO_KN_M3 = 0.157087;
const KN_M3_TO_LB_FT3 = 1 / LB_FT3_TO_KN_M3;

export interface LengthConversion {
  toEN: (value: number) => number;
  toSI: (value: number) => number;
}

export interface PressureConversion {
  toEN: (value: number) => number;
  toSI: (value: number) => number;
}

export interface ForceConversion {
  toEN: (value: number) => number;
  toSI: (value: number) => number;
}

export interface DensityConversion {
  toEN: (value: number) => number;
  toSI: (value: number) => number;
}

// Length conversions (m <-> in)
export const lengthConv: LengthConversion = {
  toEN: (m: number) => m * M_TO_IN,
  toSI: (inches: number) => inches * IN_TO_M,
};

// Length conversions for depth (m <-> ft)
export const depthConv: LengthConversion = {
  toEN: (m: number) => m * M_TO_FT,
  toSI: (ft: number) => ft * FT_TO_M,
};

// Pressure conversions (kPa <-> psi)
export const pressureConv: PressureConversion = {
  toEN: (kPa: number) => kPa * KPA_TO_PSI,
  toSI: (psi: number) => psi * PSI_TO_KPA,
};

// Force conversions (kN <-> lb)
export const forceConv: ForceConversion = {
  toEN: (kN: number) => kN * KN_TO_LB,
  toSI: (lb: number) => lb * LB_TO_KN,
};

// Density conversions (kN/m³ <-> lb/ft³)
export const densityConv: DensityConversion = {
  toEN: (kNm3: number) => kNm3 * KN_M3_TO_LB_FT3,
  toSI: (lbft3: number) => lbft3 * LB_FT3_TO_KN_M3,
};

/**
 * Convert input values from user's unit system to ENGLISH units for calculation
 */
export function convertInputsToEN(
  value: number,
  fromSystem: UnitsSystem,
  conversionType: 'length' | 'depth' | 'pressure' | 'force' | 'density'
): number {
  if (fromSystem === 'EN') return value;
  
  switch (conversionType) {
    case 'length':
      return lengthConv.toEN(value);
    case 'depth':
      return depthConv.toEN(value);
    case 'pressure':
      return pressureConv.toEN(value);
    case 'force':
      return forceConv.toEN(value);
    case 'density':
      return densityConv.toEN(value);
    default:
      return value;
  }
}

/**
 * Convert output values from ENGLISH units to user's unit system
 */
export function convertOutputsFromEN(
  value: number,
  toSystem: UnitsSystem,
  conversionType: 'length' | 'depth' | 'pressure' | 'force' | 'density'
): number {
  if (toSystem === 'EN') return value;
  
  switch (conversionType) {
    case 'length':
      return lengthConv.toSI(value);
    case 'depth':
      return depthConv.toSI(value);
    case 'pressure':
      return pressureConv.toSI(value);
    case 'force':
      return forceConv.toSI(value);
    case 'density':
      return densityConv.toSI(value);
    default:
      return value;
  }
}
