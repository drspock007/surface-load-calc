import { UnitsSystem } from './types';

// Conversion factors
const IN_TO_MM = 25.4;
const MM_TO_IN = 1 / IN_TO_MM;
const FT_TO_M = 0.3048;
const M_TO_FT = 1 / FT_TO_M;
const PSI_TO_MPA = 0.00689476;
const MPA_TO_PSI = 1 / PSI_TO_MPA;
const PSI_TO_KPA = 6.89476;
const KPA_TO_PSI = 1 / PSI_TO_KPA;
const LB_TO_KG = 0.453592;
const KG_TO_LB = 1 / LB_TO_KG;
const LB_FT3_TO_KG_M3 = 16.0185;
const KG_M3_TO_LB_FT3 = 1 / LB_FT3_TO_KG_M3;

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

// Length conversions (mm <-> in)
export const lengthConv: LengthConversion = {
  toEN: (mm: number) => mm * MM_TO_IN,
  toSI: (inches: number) => inches * IN_TO_MM,
};

// Length conversions for depth (m <-> ft)
export const depthConv: LengthConversion = {
  toEN: (m: number) => m * M_TO_FT,
  toSI: (ft: number) => ft * FT_TO_M,
};

// Pressure conversions (MPa <-> psi) for SMYS
export const smysConv: PressureConversion = {
  toEN: (mpa: number) => mpa * MPA_TO_PSI,
  toSI: (psi: number) => psi * PSI_TO_MPA,
};

// Pressure conversions (kPa <-> psi) for MOP
export const pressureConv: PressureConversion = {
  toEN: (kPa: number) => kPa * KPA_TO_PSI,
  toSI: (psi: number) => psi * PSI_TO_KPA,
};

// Force conversions (kg <-> lb)
export const forceConv: ForceConversion = {
  toEN: (kg: number) => kg * KG_TO_LB,
  toSI: (lb: number) => lb * LB_TO_KG,
};

// Density conversions (kg/m³ <-> lb/ft³)
export const densityConv: DensityConversion = {
  toEN: (kgm3: number) => kgm3 * KG_M3_TO_LB_FT3,
  toSI: (lbft3: number) => lbft3 * LB_FT3_TO_KG_M3,
};

// Temperature conversions (°C <-> °F)
export const tempConv = {
  toEN: (celsius: number) => celsius * 9/5 + 32,
  toSI: (fahrenheit: number) => (fahrenheit - 32) * 5/9,
};

/**
 * Convert input values from user's unit system to ENGLISH units for calculation
 */
export function convertInputsToEN(
  value: number,
  fromSystem: UnitsSystem,
  conversionType: 'length' | 'depth' | 'pressure' | 'smys' | 'force' | 'density' | 'temp' | 'tirePressure'
): number {
  if (fromSystem === 'EN') return value;
  
  switch (conversionType) {
    case 'length':
      return lengthConv.toEN(value);
    case 'depth':
      return depthConv.toEN(value);
    case 'pressure':
    case 'tirePressure':
      return pressureConv.toEN(value);
    case 'smys':
      return smysConv.toEN(value);
    case 'force':
      return forceConv.toEN(value);
    case 'density':
      return densityConv.toEN(value);
    case 'temp':
      return tempConv.toEN(value);
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
  conversionType: 'length' | 'depth' | 'pressure' | 'smys' | 'force' | 'density' | 'temp' | 'tirePressure'
): number {
  if (toSystem === 'EN') return value;
  
  switch (conversionType) {
    case 'length':
      return lengthConv.toSI(value);
    case 'depth':
      return depthConv.toSI(value);
    case 'pressure':
    case 'tirePressure':
      return pressureConv.toSI(value);
    case 'smys':
      return smysConv.toSI(value);
    case 'force':
      return forceConv.toSI(value);
    case 'density':
      return densityConv.toSI(value);
    case 'temp':
      return tempConv.toSI(value);
    default:
      return value;
  }
}

/**
 * Helper to round to reasonable precision
 */
function roundToPrecision(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Convert form field value when toggling units
 */
export function convertFormValue(
  value: number | undefined,
  fromSystem: UnitsSystem,
  toSystem: UnitsSystem,
  fieldType: 'length' | 'depth' | 'pressure' | 'smys' | 'force' | 'density' | 'temp' | 'tirePressure'
): number | undefined {
  if (value === undefined || fromSystem === toSystem) return value;
  
  let converted: number;
  if (toSystem === 'EN') {
    converted = convertInputsToEN(value, fromSystem, fieldType);
  } else {
    converted = convertOutputsFromEN(value, toSystem, fieldType);
  }
  
  // Round to appropriate precision
  const precision = fieldType === 'length' ? 3 : fieldType === 'smys' ? 0 : 2;
  return roundToPrecision(converted, precision);
}
