/**
 * PE (polyethylene, CSA B137.4) analysis layer.
 * Reuses the surface load / soil load values produced by the CEPA engines
 * and applies the flexible-pipe design checks.
 */

import { UnitsSystem, PeResults, PeInputFields } from './types';
import { runPeChecks, PeCheckContext, PeCheckOutput } from './peChecks';
import { getPeMaterial, getPeTemperatureFactor, DEFAULT_PE_DEFLECTION_LIMIT_PCT, DEFAULT_PE_STRAIN_LIMIT_PCT } from './pePresets';
import { convertOutputsFromEN, smysConv } from './unitConversions';

export interface PeEngineContext {
  D_in: number;
  t_in: number;
  H_ft: number;
  Psoil_psi: number;
  Plive_psi: number;
  Pint_psi: number;
  ePrime_psi: number;
  Kb: number;
  unitsSystem: UnitsSystem;
}

/** True when the calculation must use the PE (flexible pipe) branch */
export function isPePipe(inputs: PeInputFields): boolean {
  return inputs.pipeMaterial === 'PE';
}

/** Apparent modulus (psi) used for pipe wall stiffness, per selected mode */
export function getPeModulusPsi(inputs: PeInputFields, mode: 'LIVE' | 'SOIL'): number {
  const material = getPeMaterial(inputs.peDesignation);
  if (inputs.peModulusMode === 'CUSTOM' && inputs.peModulus && inputs.peModulus > 0) {
    // User modulus is entered in MPa (SI) or psi (EN)
    return inputs.unitsSystem === 'EN' ? inputs.peModulus : smysConv.toEN(inputs.peModulus);
  }
  if (inputs.peModulusMode === 'LONG_TERM') return material.modulusLong_psi;
  if (inputs.peModulusMode === 'SHORT_TERM') return material.modulusShort_psi;
  return mode === 'LIVE' ? material.modulusShort_psi : material.modulusLong_psi;
}

/** Young's modulus (psi) of the pipe wall used by the shared stress formulas */
export function getPipeModulusPsi(inputs: PeInputFields): number {
  if (!isPePipe(inputs)) return 30e6;
  return getPeModulusPsi(inputs, 'LIVE');
}

/** Thermal expansion coefficient (1/°F) of the pipe material */
export function getPipeAlphaPerF(inputs: PeInputFields): number {
  if (!isPePipe(inputs)) return 6.5e-6;
  return getPeMaterial(inputs.peDesignation).alpha_perF;
}

function toDisplayPressure(check: PeCheckOutput, units: UnitsSystem) {
  return {
    value: convertOutputsFromEN(check.value, units, 'pressure'),
    limit: convertOutputsFromEN(check.limit, units, 'pressure'),
    pass: check.pass,
    utilizationPct: check.utilizationPct,
  };
}

export function computePeResults(inputs: PeInputFields, ctx: PeEngineContext): PeResults {
  const material = getPeMaterial(inputs.peDesignation);
  const tempFactor = getPeTemperatureFactor(inputs.peServiceTempC ?? 23);

  const checkCtx: PeCheckContext = {
    D_in: ctx.D_in,
    t_in: ctx.t_in,
    H_ft: ctx.H_ft,
    Psoil_psi: ctx.Psoil_psi,
    Plive_psi: ctx.Plive_psi,
    Pint_psi: ctx.Pint_psi,
    ePrime_psi: ctx.ePrime_psi,
    Kb: ctx.Kb,
    peModulusLive_psi: getPeModulusPsi(inputs, 'LIVE'),
    peModulusSoil_psi: getPeModulusPsi(inputs, 'SOIL'),
    hdb_psi: inputs.peHDB && inputs.peHDB > 0
      ? (inputs.unitsSystem === 'EN' ? inputs.peHDB : smysConv.toEN(inputs.peHDB))
      : material.hdb_psi,
    designFactor: material.designFactor,
    temperatureFactor: tempFactor,
    deflectionLimitPct: inputs.peDeflectionLimitPct ?? DEFAULT_PE_DEFLECTION_LIMIT_PCT,
    strainLimitPct: inputs.peStrainLimitPct ?? DEFAULT_PE_STRAIN_LIMIT_PCT,
    deflectionLag: 1.0,
    shapeFactor: 4.0,
  };

  const r = runPeChecks(checkCtx);
  const units = ctx.unitsSystem;

  return {
    designation: material.designation,
    dimensionRatio: r.dimensionRatio,
    temperatureFactor: tempFactor,
    modulusLive: convertOutputsFromEN(checkCtx.peModulusLive_psi, units, 'smys'),
    modulusSoil: convertOutputsFromEN(checkCtx.peModulusSoil_psi, units, 'smys'),
    hdb: convertOutputsFromEN(checkCtx.hdb_psi, units, 'smys'),
    designFactor: material.designFactor,
    ringDeflectionPct: { ...r.ringDeflectionPct },
    bendingStrainPct: { ...r.bendingStrainPct },
    internalPressure: toDisplayPressure(r.internalPressure, units),
    buckling: toDisplayPressure(r.buckling, units),
    criticalBucklingPressure: convertOutputsFromEN(r.criticalBucklingPressure_psi, units, 'pressure'),
    allowablePressure: convertOutputsFromEN(r.allowablePressure_psi, units, 'pressure'),
    bucklingSafetyFactor: r.bucklingSafetyFactor,
    overallPass: r.overallPass,
  };
}
