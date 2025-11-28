/**
 * Shared pass/fail calculation helper for all pipeline calculation engines
 */
import { CodeCheck, LimitsUsed } from './types';
import { getCodeProfile, getCodeLabel } from './codeProfiles';

export interface PassFailResult {
  hoopPass: boolean;
  longPass: boolean;
  equivPass: boolean;
  overallPass: boolean;
  allowableStress_psi: number;
  limitsUsed: LimitsUsed;
}

export function calculatePassFail(
  codeCheck: CodeCheck,
  userDefinedLimits: { hoopLimitPct: number; longLimitPct: number; equivLimitPct: number } | undefined,
  hoopMaxPct: number,
  longMaxPct: number,
  equivMaxPct: number
): PassFailResult {
  const profile = codeCheck === 'USER_DEFINED' ? null : getCodeProfile(codeCheck);
  
  let hoopLimit: number;
  let longLimit: number;
  let equivLimit: number;
  
  if (profile) {
    hoopLimit = profile.hoopLimitPct;
    longLimit = profile.longLimitPct;
    equivLimit = profile.equivLimitPct;
  } else {
    hoopLimit = userDefinedLimits?.hoopLimitPct || 90;
    longLimit = userDefinedLimits?.longLimitPct || 90;
    equivLimit = userDefinedLimits?.equivLimitPct || 90;
  }
  
  const hoopPass = hoopMaxPct <= hoopLimit;
  const longPass = longMaxPct <= longLimit;
  const equivPass = equivMaxPct <= equivLimit;
  const overallPass = hoopPass && longPass && equivPass;
  
  const limitsUsed: LimitsUsed = {
    code: codeCheck,
    codeLabel: getCodeLabel(codeCheck),
    hoopLimitPct: hoopLimit,
    longLimitPct: longLimit,
    equivLimitPct: equivLimit,
    usesSustainedLongCheck: profile?.usesSustainedLongCheck || false,
  };
  
  return {
    hoopPass,
    longPass,
    equivPass,
    overallPass,
    allowableStress_psi: 0, // Placeholder
    limitsUsed,
  };
}
