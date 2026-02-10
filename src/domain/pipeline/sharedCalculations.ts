/**
 * Shared calculation functions for all vehicle types
 * Simplified implementations based on VBA Track Engine logic
 */

import { SoilLoadMethod, EPrimeMethod, SoilType, Compaction, CodeCheck, PavementType, VehicleClass, EquivStressMethod } from './types';
import { calculateEPrimeFromLookup } from './ePrimeLookup';

/**
 * CEPA Manual Table 2-1: Spangler Stress Formula Parameters
 */
export function calculateBeddingParams(beddingAngleDeg: number): { Kb: number; Kz: number; Theta: number } {
  // CEPA Manual Table 2-1: Spangler Stress Formula Parameters
  // Theta values corrected to match vbaTrackEngine.ts for VBA parity
  switch (beddingAngleDeg) {
    case 0: return { Kb: 0.294, Kz: 0.110, Theta: 135 };
    case 30: return { Kb: 0.235, Kz: 0.108, Theta: 130 };
    case 60: return { Kb: 0.189, Kz: 0.103, Theta: 120 };
    case 90: return { Kb: 0.157, Kz: 0.096, Theta: 105 };
    case 120: return { Kb: 0.138, Kz: 0.089, Theta: 90 };
    case 150: return { Kb: 0.128, Kz: 0.085, Theta: 75 };
    case 180: return { Kb: 0.125, Kz: 0.083, Theta: 60 };
    default: return { Kb: 0.157, Kz: 0.096, Theta: 105 };
  }
}

export function calculateEPrime(
  method: EPrimeMethod,
  userDefined_psi: number | undefined,
  soilType: SoilType | undefined,
  compaction: Compaction | undefined,
  H_ft: number
): { ePrime_psi: number } {
  if (method === 'USER_DEFINED' && userDefined_psi) {
    return { ePrime_psi: userDefined_psi };
  }
  
  // Use full lookup table
  const soilTypeKey = soilType || 'COARSE_WITH_FINES';
  const compactionValue = compaction || 90;
  const ePrime_psi = calculateEPrimeFromLookup(soilTypeKey, compactionValue, H_ft);
  
  return { ePrime_psi };
}

export function calculateSoilLoad(
  method: SoilLoadMethod,
  Rho_lbft3: number,
  H_ft: number,
  D_in: number,
  frictionAngleDeg: number,
  cohesion_psi: number
): { Psoil_psi: number } {
  if (method === 'PRISM') {
    return { Psoil_psi: Rho_lbft3 * H_ft / 144 };
  }
  
  // Trap Door method
  const H_in = H_ft * 12;
  
  if (H_in < 2.5 * D_in) {
    return { Psoil_psi: Rho_lbft3 * H_ft / 144 };
  }
  
  const PhiRad = frictionAngleDeg * Math.PI / 180;
  const DenCoTerm = (Rho_lbft3 / 1728) - (2 * cohesion_psi / 144) / D_in;
  const q = Rho_lbft3 * H_ft / 144;
  
  const Psoil_psi = DenCoTerm * D_in * (1 - Math.exp(-2 * H_in * Math.tan(PhiRad) / D_in)) / (2 * Math.tan(PhiRad)) + q * Math.exp(-2 * H_in * Math.tan(PhiRad) / D_in);
  
  return { Psoil_psi };
}

export function calculateImpactFactor(
  vehicleClass: VehicleClass,
  pavementType: PavementType,
  H_ft: number
): { impactFactorDepth: number } {
  let IF = 1.0;
  
  if (vehicleClass === 'HIGHWAY') {
    IF = pavementType === 'RIGID' ? 1.0 : 1.5;
  } else if (vehicleClass === 'FARM') {
    IF = 1.25;
  } else if (vehicleClass === 'TRACK') {
    IF = 1.5;
  }
  
  const H_in = H_ft * 12;
  let IFdepth = IF;
  
  if (H_in > 60) {
    IFdepth = IF - 0.0025 * (H_in - 60);
    IFdepth = Math.max(1.0, IFdepth);
  }
  
  return { impactFactorDepth: IFdepth };
}

export function calculateHoopStress(
  Psoil_psi: number,
  Plive_psi: number,
  Pint_psi: number,
  D_in: number,
  t_in: number,
  Kb: number,
  Kz: number,
  Eprime_psi: number,
  kr: number
): { hoopSoil: number; hoopLive: number; hoopInt: number } {
  const E = 30e6;
  const denominator = 1 + 3 * Kz * (Pint_psi / E) * Math.pow(D_in / t_in, 3) + 0.0915 * (Eprime_psi / E) * Math.pow(D_in / t_in, 3);
  
  const hoopSoil = (3 * Kb * Psoil_psi * Math.pow(D_in / t_in, 2)) / denominator;
  const hoopLive = (3 * Kb * Plive_psi * Math.pow(D_in / t_in, 2)) / denominator;
  const hoopInt = (Pint_psi * D_in) / (2 * t_in);
  
  return { hoopSoil, hoopLive, hoopInt };
}

export function calculateLongitudinalLiveStress(
  hoopLive_psi: number,
  bsnqMax_psi: number,
  impactFactorDepth: number,
  D_in: number,
  t_in: number,
  H_ft: number,
  Theta: number,
  ePrime_psi: number
): { longLive: number; longLiveLocal: number; longLiveBend: number } {
  const E = 30e6;
  const Poisson = 0.3;
  const PI = Math.PI;
  
  // Local bending component
  const Beta = Math.pow(12 * (1 - Math.pow(Poisson, 2)), 1/8);
  const longLiveLocal = (0.153 / 1.56) * Math.pow(Beta, 4) * hoopLive_psi;
  
  // Axial bending component
  const H_in = H_ft * 12;
  
  // Moment of inertia
  const R_out = D_in / 2;
  const R_in = R_out - t_in;
  const Inertia = (PI / 4) * (Math.pow(R_out, 4) - Math.pow(R_in, 4));
  
  // Lambda parameter
  const Lambda = Math.pow((ePrime_psi * D_in * Theta / 360) / (4 * E * Inertia), 0.25);
  
  // Load on pipe from Boussinesq (VBA: Wsurf = bsnq * 2*PI*H^2/3 * IF)
  const Wsurf = bsnqMax_psi * 2 * PI * Math.pow(H_in, 2) / 3 * impactFactorDepth;
  
  // Load length
  const Lload = H_in * Math.tan((29.9 * PI) / 180);
  
  // Distributed load on pipe
  const Ppipe = Wsurf / (PI * Math.pow(Lload, 2));
  
  // Calculate moment distribution (ported from VBA Track Engine)
  const maxRange = 100 * Lload;
  const stepSize = Math.max(1, Lload / 50);
  
  let Mmax = 0;
  let Mmin1 = 0;
  let Mmin2 = 0;
  
  for (let x = -maxRange; x <= maxRange; x += stepSize) {
    const absX = Math.abs(x);
    
    let M = 0;
    
    if (absX <= Lload) {
      // Within load region
      const term1 = Ppipe / (4 * Math.pow(Lambda, 3));
      const expTerm = Math.exp(-Lambda * absX);
      const M1 = term1 * expTerm * (Math.cos(Lambda * absX) + Math.sin(Lambda * absX));
      const M2 = -Ppipe * Math.pow(absX, 2) / 2;
      M = M1 + M2;
    } else {
      // Outside load region
      const term1 = Ppipe / (4 * Math.pow(Lambda, 3));
      const expTerm1 = Math.exp(-Lambda * absX);
      const expTerm2 = Math.exp(-Lambda * (absX - Lload));
      const M1 = term1 * expTerm1 * (Math.cos(Lambda * absX) + Math.sin(Lambda * absX));
      const M2 = -term1 * expTerm2 * (Math.cos(Lambda * (absX - Lload)) + Math.sin(Lambda * (absX - Lload)));
      M = M1 + M2;
    }
    
    if (M > Mmax) Mmax = M;
    if (absX <= Lload && M < Mmin1) Mmin1 = M;
    if (absX > Lload && M < Mmin2) Mmin2 = M;
  }
  
  const momentMAX = Math.max(Math.abs(Mmax), Math.abs(Mmin1), Math.abs(Mmin2));
  const longLiveBend = momentMAX * (D_in / 2) / Inertia;
  
  const longLive = longLiveBend + longLiveLocal;
  
  return { longLive, longLiveLocal, longLiveBend };
}

export function calculateEquivalentStress(
  method: EquivStressMethod,
  hoopHigh: number,
  hoopLow: number,
  longHigh: number,
  longLow: number,
  SMYS_psi: number
): { high: number; low: number; pctSMYS: number } {
  if (method === 'TRESCA') {
    // VBA Tresca: Max(Abs(hoop - long), hoop, long) for each combination
    const cases = [
      Math.max(Math.abs(hoopHigh - longHigh), hoopHigh, longHigh),
      Math.max(Math.abs(hoopHigh - longLow), hoopHigh, longLow),
      Math.max(Math.abs(hoopLow - longHigh), hoopLow, longHigh),
      Math.max(Math.abs(hoopLow - longLow), hoopLow, longLow),
    ];
    const high = Math.max(...cases);
    const low = Math.min(...cases);
    // pctSMYS as percentage (0-100), not ratio
    return { high, low, pctSMYS: (high / SMYS_psi) * 100 };
  } else {
    // Von Mises
    const cases = [
      Math.sqrt(hoopHigh * hoopHigh - hoopHigh * longHigh + longHigh * longHigh),
      Math.sqrt(hoopHigh * hoopHigh - hoopHigh * longLow + longLow * longLow),
      Math.sqrt(hoopLow * hoopLow - hoopLow * longHigh + longHigh * longHigh),
      Math.sqrt(hoopLow * hoopLow - hoopLow * longLow + longLow * longLow),
    ];
    const high = Math.max(...cases);
    const low = Math.min(...cases);
    // pctSMYS as percentage (0-100), not ratio
    return { high, low, pctSMYS: (high / SMYS_psi) * 100 };
  }
}

export function calculatePassFail(
  codeCheck: CodeCheck,
  userDefinedLimit: number | undefined,
  hoopZeroHigh: number,
  hoopMOPHigh: number,
  longZeroHigh: number,
  longMOPHigh: number,
  equivZeroPct: number,
  equivMOPPct: number,
  SMYS_psi: number
): { 
  allowableStress: number; 
  passFailSummary: {
    hoopAtZero: boolean;
    hoopAtMOP: boolean;
    longitudinalAtZero: boolean;
    longitudinalAtMOP: boolean;
    equivalentAtZero: boolean;
    equivalentAtMOP: boolean;
    overallPass: boolean;
  } 
} {
  const limit = codeCheck === 'USER_DEFINED' && userDefinedLimit ? userDefinedLimit : 0.9;
  const allowableStress = SMYS_psi * limit;
  
  return {
    allowableStress,
    passFailSummary: {
      hoopAtZero: hoopZeroHigh <= allowableStress,
      hoopAtMOP: hoopMOPHigh <= allowableStress,
      longitudinalAtZero: longZeroHigh <= allowableStress,
      longitudinalAtMOP: longMOPHigh <= allowableStress,
      equivalentAtZero: equivZeroPct <= limit,
      equivalentAtMOP: equivMOPPct <= limit,
      overallPass: 
        hoopZeroHigh <= allowableStress &&
        hoopMOPHigh <= allowableStress &&
        longZeroHigh <= allowableStress &&
        longMOPHigh <= allowableStress &&
        equivZeroPct <= limit &&
        equivMOPPct <= limit,
    },
  };
}

export function convertPressureToUserUnits(value_psi: number, unitsSystem: 'EN' | 'SI'): number {
  if (unitsSystem === 'EN') return value_psi;
  return value_psi / 0.1450378911491; // psi -> kPa
}
