/**
 * Shared calculation functions for all vehicle types
 * Simplified implementations based on VBA Track Engine logic
 */

import { SoilLoadMethod, EPrimeMethod, SoilType, Compaction, CodeCheck, PavementType, VehicleClass, EquivStressMethod } from './types';
import { calculateEPrimeFromLookup } from './ePrimeLookup';

export function calculateBeddingParams(beddingAngleDeg: number): { Kb: number; Kz: number; Theta: number } {
  switch (beddingAngleDeg) {
    case 0: return { Kb: 0.11, Kz: 0.083, Theta: 135 };
    case 30: return { Kb: 0.108, Kz: 0.088, Theta: 130 };
    case 60: return { Kb: 0.105, Kz: 0.1, Theta: 120 };
    case 90: return { Kb: 0.103, Kz: 0.108, Theta: 105 };
    case 120: return { Kb: 0.101, Kz: 0.116, Theta: 90 };
    case 150: return { Kb: 0.1, Kz: 0.12, Theta: 75 };
    case 180: return { Kb: 0.096, Kz: 0.127, Theta: 60 };
    default: return { Kb: 0.103, Kz: 0.108, Theta: 105 };
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
  Plive_psi: number,
  H_ft: number,
  D_in: number,
  t_in: number,
  Eprime_psi: number,
  Theta: number,
  impactFactor: number
): { longLive: number; longLiveLocal: number; longLiveBend: number } {
  const E = 30e6;
  const Poisson = 0.3;
  
  // Local bending
  const Beta = Math.pow(12 * (1 - Poisson * Poisson), 1/8);
  const longLiveLocal = (0.153 / 1.56) * Math.pow(Beta, 4) * hoopLive_psi;
  
  // Axial bending
  const H_in = H_ft * 12;
  const Inertia = Math.PI / 4 * (Math.pow(D_in / 2, 4) - Math.pow(D_in / 2 - t_in, 4));
  const Lambda = Math.pow((Eprime_psi * D_in * Theta / 360) / (4 * E * Inertia), 0.25);
  
  const Wsurf = Plive_psi * 2 * Math.PI * H_in * H_in / 3 * impactFactor;
  const Lload = H_in * Math.tan(29.9 * Math.PI / 180);
  const Ppipe = Wsurf / (Math.PI * Lload * Lload);
  
  // Simplified moment calculation (avoid huge loops)
  const maxIterations = Math.min(500, Math.floor(100 * Lload));
  let momentMAX = 0;
  
  for (let i = 0; i <= maxIterations; i++) {
    const x = (i / maxIterations) * 100 * Lload;
    const M = (Ppipe * Lload * Lload / (2 * Lambda)) * 
      (Math.exp(-Lambda * x) * (Math.cos(Lambda * x) - Math.sin(Lambda * x)) + 1);
    momentMAX = Math.max(momentMAX, Math.abs(M));
  }
  
  const longLiveBend = (momentMAX * D_in) / (2 * Inertia);
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
    const cases = [
      Math.abs(hoopHigh - longHigh),
      Math.abs(hoopHigh - longLow),
      Math.abs(hoopLow - longHigh),
      Math.abs(hoopLow - longLow),
    ];
    const high = Math.max(...cases);
    const low = Math.min(...cases);
    return { high, low, pctSMYS: high / SMYS_psi };
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
    return { high, low, pctSMYS: high / SMYS_psi };
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
