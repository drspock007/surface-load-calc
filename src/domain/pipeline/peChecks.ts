/**
 * Design checks for buried flexible polyethylene pipe (CSA B137.4).
 * All internal computations are done in English units (psi, in, ft).
 */

export interface PeCheckContext {
  D_in: number; // outside diameter
  t_in: number; // wall thickness
  H_ft: number; // depth of cover
  Psoil_psi: number; // vertical soil pressure at pipe crown
  Plive_psi: number; // live (surface) pressure including impact factor
  Pint_psi: number; // internal operating pressure (MOP)
  ePrime_psi: number; // modulus of soil reaction
  Kb: number; // bedding constant
  peModulusLive_psi: number; // short term apparent modulus
  peModulusSoil_psi: number; // long term apparent modulus
  hdb_psi: number; // hydrostatic design basis
  designFactor: number; // service design factor
  temperatureFactor: number; // temperature de-rating factor
  deflectionLimitPct: number;
  strainLimitPct: number;
  deflectionLag: number; // DL, deflection lag factor
  shapeFactor: number; // Df, bending strain shape factor
}

export interface PeCheckOutput {
  value: number;
  limit: number;
  pass: boolean;
  utilizationPct: number;
}

export interface PeChecksResult {
  ringDeflectionPct: PeCheckOutput;
  bendingStrainPct: PeCheckOutput;
  internalPressure: PeCheckOutput; // psi applied vs allowable
  buckling: PeCheckOutput; // psi applied vs critical
  bucklingSafetyFactor: number;
  dimensionRatio: number;
  allowablePressure_psi: number;
  criticalBucklingPressure_psi: number;
  overallPass: boolean;
}

function makeCheck(value: number, limit: number): PeCheckOutput {
  const utilizationPct = limit > 0 ? (value / limit) * 100 : 0;
  return { value, limit, pass: value <= limit, utilizationPct };
}

/** Iowa (Spangler) ring deflection, expressed as % of diameter */
export function calculatePeRingDeflectionPct(ctx: PeCheckContext): number {
  const r_in = (ctx.D_in - ctx.t_in) / 2; // mean radius
  const I = Math.pow(ctx.t_in, 3) / 12; // in^4 per inch of pipe length

  // Line loads per unit length (lb/in): soil uses long term modulus,
  // live load uses short term modulus, per PPI Handbook Chapter 6.
  const Wsoil = ctx.Psoil_psi * ctx.D_in;
  const Wlive = ctx.Plive_psi * ctx.D_in;

  const deflSoil =
    (ctx.deflectionLag * ctx.Kb * Wsoil * Math.pow(r_in, 3)) /
    (ctx.peModulusSoil_psi * I + 0.061 * ctx.ePrime_psi * Math.pow(r_in, 3));

  const deflLive =
    (ctx.Kb * Wlive * Math.pow(r_in, 3)) /
    (ctx.peModulusLive_psi * I + 0.061 * ctx.ePrime_psi * Math.pow(r_in, 3));

  return ((deflSoil + deflLive) / ctx.D_in) * 100;
}

/** Wall bending strain from ring deflection, in % */
export function calculatePeBendingStrainPct(deflectionPct: number, ctx: PeCheckContext): number {
  return ctx.shapeFactor * (ctx.t_in / ctx.D_in) * deflectionPct;
}

/** Allowable internal pressure, ISO/CSA pressure equation P = 2*HDB*DF*Ft/(DR-1) */
export function calculatePeAllowablePressure(ctx: PeCheckContext): number {
  const DR = ctx.D_in / ctx.t_in;
  if (DR <= 1) return 0;
  return (2 * ctx.hdb_psi * ctx.designFactor * ctx.temperatureFactor) / (DR - 1);
}

/** Critical buckling pressure of a constrained buried pipe (AWWA M55 / Luscher) */
export function calculatePeCriticalBuckling(ctx: PeCheckContext): number {
  const H_in = ctx.H_ft * 12;
  const I = Math.pow(ctx.t_in, 3) / 12;
  const r_in = (ctx.D_in - ctx.t_in) / 2;

  const Rw = 1.0; // no ground water assumed
  const Bprime = 1 / (1 + 4 * Math.exp(-0.213 * ctx.H_ft));

  const term = (Rw * Bprime * ctx.ePrime_psi * ctx.peModulusSoil_psi * I) / Math.pow(2 * r_in, 3);
  if (term <= 0) return 0;

  // Effective depth reduction is embedded in B'; result is in psi.
  const Pcr = 5.65 * Math.sqrt(term);
  return H_in > 0 ? Pcr : Pcr;
}

export function runPeChecks(ctx: PeCheckContext): PeChecksResult {
  const deflectionPct = calculatePeRingDeflectionPct(ctx);
  const strainPct = calculatePeBendingStrainPct(deflectionPct, ctx);
  const allowablePressure = calculatePeAllowablePressure(ctx);
  const Pcr = calculatePeCriticalBuckling(ctx);
  const appliedExternal = ctx.Psoil_psi + ctx.Plive_psi;

  const ringDeflectionPct = makeCheck(deflectionPct, ctx.deflectionLimitPct);
  const bendingStrainPct = makeCheck(strainPct, ctx.strainLimitPct);
  const internalPressure = makeCheck(ctx.Pint_psi, allowablePressure);
  // Buckling is checked with a safety factor of 2 (AWWA M55 recommendation)
  const buckling = makeCheck(appliedExternal, Pcr / 2);

  return {
    ringDeflectionPct,
    bendingStrainPct,
    internalPressure,
    buckling,
    bucklingSafetyFactor: appliedExternal > 0 ? Pcr / appliedExternal : Infinity,
    dimensionRatio: ctx.t_in > 0 ? ctx.D_in / ctx.t_in : 0,
    allowablePressure_psi: allowablePressure,
    criticalBucklingPressure_psi: Pcr,
    overallPass:
      ringDeflectionPct.pass && bendingStrainPct.pass && internalPressure.pass && buckling.pass,
  };
}
