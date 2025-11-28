/**
 * Pipeline Code Profiles - Centralized code reference definitions
 * Each profile defines limits and behavior for pass/fail checks
 */

export type CodeCheckType = 'B31_4' | 'B31_8' | 'CSA_Z662' | 'USER_DEFINED';

export interface CodeProfile {
  code: CodeCheckType;
  label: string;
  description: string;
  hoopLimitPct: number; // % SMYS
  longLimitPct: number; // % SMYS
  equivLimitPct: number; // % SMYS
  usesSustainedLongCheck: boolean; // B31.4 applies additional sustained check
}

/**
 * Default code profiles with standard limits
 * Note: For surface-load screening, all codes use 90% SMYS as default limit
 */
export const CODE_PROFILES: Record<Exclude<CodeCheckType, 'USER_DEFINED'>, CodeProfile> = {
  B31_4: {
    code: 'B31_4',
    label: 'ASME B31.4',
    description: 'Liquid transportation systems for hydrocarbons',
    hoopLimitPct: 90,
    longLimitPct: 90,
    equivLimitPct: 90,
    usesSustainedLongCheck: true, // B31.4 checks internal + thermal ± earth separately
  },
  B31_8: {
    code: 'B31_8',
    label: 'ASME B31.8',
    description: 'Gas transmission and distribution systems',
    hoopLimitPct: 90,
    longLimitPct: 90,
    equivLimitPct: 90,
    usesSustainedLongCheck: false,
  },
  CSA_Z662: {
    code: 'CSA_Z662',
    label: 'CSA Z662',
    description: 'Oil and gas pipeline systems (Canada)',
    hoopLimitPct: 90,
    longLimitPct: 90,
    equivLimitPct: 90,
    usesSustainedLongCheck: false,
  },
};

/**
 * Get code profile by code check type
 */
export function getCodeProfile(codeCheck: CodeCheckType): CodeProfile | null {
  if (codeCheck === 'USER_DEFINED') {
    return null; // User-defined has custom limits
  }
  return CODE_PROFILES[codeCheck];
}

/**
 * Get human-readable label for code check
 */
export function getCodeLabel(codeCheck: CodeCheckType): string {
  const profile = getCodeProfile(codeCheck);
  return profile ? profile.label : 'User Defined';
}

/**
 * Get description for code check
 */
export function getCodeDescription(codeCheck: CodeCheckType): string {
  const profile = getCodeProfile(codeCheck);
  return profile ? profile.description : 'Custom stress limits';
}
