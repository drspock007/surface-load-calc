/**
 * Minimum Bend Radius Calculation
 * Determines the minimum horizontal/vertical bend radius the pipe can sustain
 * given the remaining longitudinal stress margin after CEPA surface load analysis.
 *
 * Formula: R_min = E * D / (2 * sigma_remaining)
 * where sigma_remaining = sigma_allowable - sigma_long_existing
 */

import { UnitsSystem } from './types';

const E_STEEL_PSI = 30e6; // Young's modulus of steel (psi)

export interface BendRadiusInputs {
  D_in: number;                    // Outer diameter in inches
  longHighZero_psi: number;        // Longitudinal stress high @ zero pressure (psi)
  longHighMOP_psi: number;         // Longitudinal stress high @ MOP (psi)
  longAllowable_psi: number;       // Allowable longitudinal stress (psi)
  unitsSystem: UnitsSystem;
}

export interface BendRadiusResults {
  minRadius: number;               // R_min in ft (EN) or m (SI)
  sigmaRemaining: number;          // Remaining margin in psi (EN) or kPa (SI)
  governingCondition: 'Zero Pressure' | 'MOP';
  hasMargin: boolean;              // true if margin > 0 (bend is permissible)
  marginZero: number;              // Margin at zero pressure (display units)
  marginMOP: number;               // Margin at MOP (display units)
}

export function calculateMinBendRadius(inputs: BendRadiusInputs): BendRadiusResults {
  const { D_in, longHighZero_psi, longHighMOP_psi, longAllowable_psi, unitsSystem } = inputs;

  // 1. Compute margins (in psi)
  const marginZero_psi = longAllowable_psi - Math.abs(longHighZero_psi);
  const marginMOP_psi = longAllowable_psi - Math.abs(longHighMOP_psi);

  // 2. Governing condition = smallest margin
  const isZeroGoverning = marginZero_psi <= marginMOP_psi;
  const governingMargin_psi = isZeroGoverning ? marginZero_psi : marginMOP_psi;
  const governingCondition = isZeroGoverning ? 'Zero Pressure' as const : 'MOP' as const;

  // 3. If margin <= 0, no bend permissible
  if (governingMargin_psi <= 0) {
    const psiToDisplay = unitsSystem === 'SI' ? 6.894757 : 1; // psi -> kPa
    return {
      minRadius: Infinity,
      sigmaRemaining: governingMargin_psi * psiToDisplay,
      governingCondition,
      hasMargin: false,
      marginZero: marginZero_psi * psiToDisplay,
      marginMOP: marginMOP_psi * psiToDisplay,
    };
  }

  // 4. R_min = E * D / (2 * margin) → result in inches, convert to ft
  const R_min_in = (E_STEEL_PSI * D_in) / (2 * governingMargin_psi);
  const R_min_ft = R_min_in / 12;

  // 5. Convert to user units
  const psiToDisplay = unitsSystem === 'SI' ? 6.894757 : 1;
  const ftToDisplay = unitsSystem === 'SI' ? 0.3048 : 1; // ft -> m

  return {
    minRadius: R_min_ft * ftToDisplay,
    sigmaRemaining: governingMargin_psi * psiToDisplay,
    governingCondition,
    hasMargin: true,
    marginZero: marginZero_psi * psiToDisplay,
    marginMOP: marginMOP_psi * psiToDisplay,
  };
}
