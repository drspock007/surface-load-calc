/**
 * Complete E' (Modulus of Soil Reaction) Lookup Table
 * Based on VBA EprimeModulusSoilReaction_Track logic
 */

export interface EPrimeCoefficients {
  Epr1: number;
  Epr2: number;
  Epr3: number;
}

export type SoilTypeKey = 'FINE' | 'COARSE_WITH_FINES' | 'COARSE_NO_FINES';
export type CompactionLevel = 80 | 85 | 90 | 95 | 100;

/**
 * Complete E' lookup table from VBA
 * Structure: E_PRIME_TABLE[soilType][compaction] = { Epr1, Epr2, Epr3 }
 * Formula: E' = Epr1 * (Epr2 ^ H) * ((compaction / 100) ^ Epr3)
 */
export const E_PRIME_TABLE: Record<SoilTypeKey, Record<CompactionLevel, EPrimeCoefficients>> = {
  FINE: {
    80: { Epr1: 500, Epr2: 1.0, Epr3: 4.8 },
    85: { Epr1: 700, Epr2: 1.0, Epr3: 4.5 },
    90: { Epr1: 1000, Epr2: 1.0, Epr3: 4.0 },
    95: { Epr1: 1500, Epr2: 1.0, Epr3: 3.3 },
    100: { Epr1: 3000, Epr2: 1.0, Epr3: 2.5 },
  },
  COARSE_WITH_FINES: {
    80: { Epr1: 1000, Epr2: 1.0, Epr3: 4.8 },
    85: { Epr1: 1400, Epr2: 1.0, Epr3: 4.5 },
    90: { Epr1: 2000, Epr2: 1.0, Epr3: 4.0 },
    95: { Epr1: 3000, Epr2: 1.0, Epr3: 3.3 },
    100: { Epr1: 6000, Epr2: 1.0, Epr3: 2.5 },
  },
  COARSE_NO_FINES: {
    80: { Epr1: 1500, Epr2: 1.0, Epr3: 4.8 },
    85: { Epr1: 2100, Epr2: 1.0, Epr3: 4.5 },
    90: { Epr1: 3000, Epr2: 1.0, Epr3: 4.0 },
    95: { Epr1: 4500, Epr2: 1.0, Epr3: 3.3 },
    100: { Epr1: 9000, Epr2: 1.0, Epr3: 2.5 },
  },
};

/**
 * Get E' coefficients from lookup table
 * Interpolates if compaction is not exactly at a table value
 */
export function getEPrimeCoefficients(
  soilType: SoilTypeKey,
  compaction: number
): EPrimeCoefficients {
  const validCompactions: CompactionLevel[] = [80, 85, 90, 95, 100];
  
  // Find exact match
  if (validCompactions.includes(compaction as CompactionLevel)) {
    return E_PRIME_TABLE[soilType][compaction as CompactionLevel];
  }
  
  // Interpolate between nearest values
  let lowerComp = 80;
  let upperComp = 100;
  
  for (let i = 0; i < validCompactions.length - 1; i++) {
    if (compaction >= validCompactions[i] && compaction <= validCompactions[i + 1]) {
      lowerComp = validCompactions[i];
      upperComp = validCompactions[i + 1];
      break;
    }
  }
  
  // Clamp if outside range
  if (compaction < 80) {
    return E_PRIME_TABLE[soilType][80];
  }
  if (compaction > 100) {
    return E_PRIME_TABLE[soilType][100];
  }
  
  const lowerCoeffs = E_PRIME_TABLE[soilType][lowerComp as CompactionLevel];
  const upperCoeffs = E_PRIME_TABLE[soilType][upperComp as CompactionLevel];
  
  const factor = (compaction - lowerComp) / (upperComp - lowerComp);
  
  return {
    Epr1: lowerCoeffs.Epr1 + factor * (upperCoeffs.Epr1 - lowerCoeffs.Epr1),
    Epr2: lowerCoeffs.Epr2 + factor * (upperCoeffs.Epr2 - lowerCoeffs.Epr2),
    Epr3: lowerCoeffs.Epr3 + factor * (upperCoeffs.Epr3 - lowerCoeffs.Epr3),
  };
}

/**
 * Calculate E' using the lookup table and formula
 * E' = Epr1 * (Epr2 ^ H_ft) * ((compaction / 100) ^ Epr3)
 */
export function calculateEPrimeFromLookup(
  soilType: SoilTypeKey,
  compaction: number,
  H_ft: number
): number {
  const coeffs = getEPrimeCoefficients(soilType, compaction);
  const ePrime_psi = coeffs.Epr1 * Math.pow(coeffs.Epr2, H_ft) * Math.pow(compaction / 100, coeffs.Epr3);
  return ePrime_psi;
}
