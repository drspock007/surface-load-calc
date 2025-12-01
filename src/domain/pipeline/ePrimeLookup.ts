/**
 * CEPA Table 2-3: Design Values of E' (Modulus of Soil Reaction)
 * Direct lookup table by depth range and compaction level
 * Values in psi
 */

export type SoilTypeKey = 'FINE' | 'COARSE_WITH_FINES' | 'COARSE_NO_FINES';
export type CompactionLevel = 85 | 90 | 95 | 100;
export type DepthRange = '0-5' | '5-10' | '10-15' | '15-20';

/**
 * CEPA Manual Table 2-3: E' Design Values (psi)
 * Structure: E_PRIME_TABLE[soilType][depthRange][compaction]
 */
export const E_PRIME_TABLE: Record<SoilTypeKey, Record<DepthRange, Record<CompactionLevel, number>>> = {
  FINE: {
    '0-5':   { 85: 500,  90: 700,  95: 1000, 100: 1500 },
    '5-10':  { 85: 600,  90: 1000, 95: 1400, 100: 2000 },
    '10-15': { 85: 700,  90: 1200, 95: 1600, 100: 2300 },
    '15-20': { 85: 800,  90: 1300, 95: 1800, 100: 2600 },
  },
  COARSE_WITH_FINES: {
    '0-5':   { 85: 600,  90: 1000, 95: 1200, 100: 1900 },
    '5-10':  { 85: 900,  90: 1400, 95: 1800, 100: 2700 },
    '10-15': { 85: 1000, 90: 1500, 95: 2100, 100: 3200 },
    '15-20': { 85: 1100, 90: 1600, 95: 2400, 100: 3700 },
  },
  COARSE_NO_FINES: {
    '0-5':   { 85: 700,  90: 1000, 95: 1600, 100: 2500 },
    '5-10':  { 85: 1000, 90: 1500, 95: 2200, 100: 3300 },
    '10-15': { 85: 1050, 90: 1600, 95: 2400, 100: 3600 },
    '15-20': { 85: 1100, 90: 1700, 95: 2500, 100: 3800 },
  },
};

/**
 * Determine depth range from depth in feet
 */
function getDepthRange(H_ft: number): DepthRange {
  if (H_ft <= 5) return '0-5';
  if (H_ft <= 10) return '5-10';
  if (H_ft <= 15) return '10-15';
  return '15-20';
}

/**
 * Calculate E' using direct lookup table from CEPA Table 2-3
 * Interpolates between compaction levels if needed
 */
export function calculateEPrimeFromLookup(
  soilType: SoilTypeKey,
  compaction: number,
  H_ft: number
): number {
  const depthRange = getDepthRange(H_ft);
  const table = E_PRIME_TABLE[soilType][depthRange];
  
  // Clamp compaction to valid range
  if (compaction < 85) compaction = 85;
  if (compaction > 100) compaction = 100;
  
  // Exact match for standard compaction levels
  if (compaction === 85 || compaction === 90 || compaction === 95 || compaction === 100) {
    return table[compaction as CompactionLevel];
  }
  
  // Linear interpolation between nearest compaction levels
  if (compaction < 90) {
    const factor = (compaction - 85) / 5;
    return table[85] + factor * (table[90] - table[85]);
  }
  if (compaction < 95) {
    const factor = (compaction - 90) / 5;
    return table[90] + factor * (table[95] - table[90]);
  }
  // compaction is between 95-100
  const factor = (compaction - 95) / 5;
  return table[95] + factor * (table[100] - table[95]);
}
