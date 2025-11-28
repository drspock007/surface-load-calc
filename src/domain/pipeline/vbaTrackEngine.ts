/**
 * VBA Track Vehicle Engine - Direct port from Kiefner Surface Loading Calculator
 * All calculations performed in ENGLISH units (inches, feet, psi, lb, lb/ft³)
 */

import { PipelineTrackInputs, PipelineTrackResults, DebugValues, LimitsUsed } from './types';
import { getCodeProfile, getCodeLabel } from './codeProfiles';

// VBA Constants
const PI = Math.PI;
const E_STEEL = 30e6; // psi
const POISSON = 0.3;
const ALPHA = 6.5e-6; // thermal expansion coefficient (1/°F)
const KR = 1; // coefficient of lateral earth pressure

interface InputsEN {
  // Pipe properties (EN units)
  D_in: number; // outer diameter (inches)
  t_in: number; // wall thickness (inches)
  MOP_psi: number; // max operating pressure (psi)
  SMYS_psi: number; // yield strength (psi)
  deltaT_F: number; // temperature change (°F)
  
  // Soil properties
  rho_lbft3: number; // soil density (lb/ft³)
  H_ft: number; // depth of cover (ft)
  beddingAngleDeg: number;
  soilLoadMethod: 'PRISM' | 'TRAP_DOOR';
  frictionAngleDeg: number;
  soilCohesion_psi: number;
  
  // E' (modulus of soil reaction)
  ePrimeMethod: 'LOOKUP' | 'USER_DEFINED';
  ePrimeUserDefined_psi?: number;
  soilType?: 'FINE' | 'COARSE_WITH_FINES' | 'COARSE_NO_FINES';
  compaction?: 80 | 85 | 90 | 95 | 100;
  
  // Track vehicle
  trackSeparation_ft: number; // center-to-center (ft)
  trackLength_ft: number; // (ft)
  vehicleWeight_lb: number; // total weight (lb)
  trackWidth_in: number; // (inches)
  
  // Analysis params
  pavementType: 'RIGID' | 'FLEXIBLE';
  vehicleClass: 'HIGHWAY' | 'FARM' | 'TRACK';
  equivStressMethod: 'TRESCA' | 'VON_MISES';
  codeCheck: 'B31_4' | 'B31_8' | 'CSA_Z662' | 'USER_DEFINED';
  userDefinedHoopLimit?: number; // fraction of SMYS
  userDefinedLongLimit?: number;
  userDefinedEquivLimit?: number;
}

interface DebugEN extends DebugValues {
  bsnqSUM1_psi: number;
  bsnqSUM2_psi: number;
  axleLoad_lb: number;
  pointLoad_lb: number;
  nW: number;
  nL: number;
  momentMAX_lbin: number;
  longLiveLocal_psi: number;
  longLiveBend_psi: number;
}

/**
 * Calculate bedding parameters based on bedding angle
 * Ported from VBA
 */
function calculateBeddingParams(beddingAngleDeg: number): { Kb: number; Kz: number; Theta: number } {
  switch (beddingAngleDeg) {
    case 0:
      return { Kb: 0.11, Kz: 0.083, Theta: 135 };
    case 30:
      return { Kb: 0.108, Kz: 0.088, Theta: 130 };
    case 60:
      return { Kb: 0.105, Kz: 0.1, Theta: 120 };
    case 90:
      return { Kb: 0.103, Kz: 0.108, Theta: 105 };
    case 120:
      return { Kb: 0.101, Kz: 0.116, Theta: 90 };
    case 150:
      return { Kb: 0.1, Kz: 0.12, Theta: 75 };
    case 180:
      return { Kb: 0.096, Kz: 0.127, Theta: 60 };
    default:
      // Default to 90 degrees
      return { Kb: 0.103, Kz: 0.108, Theta: 105 };
  }
}

/**
 * Calculate E' (modulus of soil reaction) using lookup table or user-defined
 * Ported from VBA
 */
function calculateEPrime(inputs: InputsEN): number {
  if (inputs.ePrimeMethod === 'USER_DEFINED' && inputs.ePrimeUserDefined_psi) {
    return inputs.ePrimeUserDefined_psi;
  }
  
  // Lookup method
  const soilType = inputs.soilType || 'COARSE_WITH_FINES';
  const compaction = inputs.compaction || 90;
  const H_ft = inputs.H_ft;
  
  let Epr1: number, Epr2: number, Epr3: number;
  
  // Coefficients from VBA lookup table
  if (soilType === 'FINE') {
    Epr1 = 500;
    Epr2 = 1;
    Epr3 = 2;
  } else if (soilType === 'COARSE_WITH_FINES') {
    Epr1 = 1000;
    Epr2 = 1;
    Epr3 = 2;
  } else { // COARSE_NO_FINES
    Epr1 = 1500;
    Epr2 = 1;
    Epr3 = 2;
  }
  
  // Formula: Eprime = Epr1 * (Epr2 ^ H_ft) * (Compact/100) ^ Epr3
  const ePrime = Epr1 * Math.pow(Epr2, H_ft) * Math.pow(compaction / 100, Epr3);
  
  return ePrime;
}

/**
 * Calculate soil load on pipe (Prism or Trap Door method)
 * Ported from VBA
 */
function calculateSoilLoad(inputs: InputsEN): number {
  const { rho_lbft3, H_ft, D_in, soilLoadMethod, frictionAngleDeg, soilCohesion_psi } = inputs;
  
  if (soilLoadMethod === 'PRISM') {
    // Prism method: Psoil = rho * H / 144 (convert psf to psi)
    return (rho_lbft3 * H_ft) / 144;
  }
  
  // Trap Door method (ported from VBA)
  const cohesion = soilCohesion_psi || 0; // conservative default
  const phiRad = (frictionAngleDeg * PI) / 180;
  
  // DenCoTerm = (rho/1728) - 2*(cohesion/144)/D
  const DenCoTerm = (rho_lbft3 / 1728) - (2 * (cohesion / 144)) / D_in;
  
  const q = (rho_lbft3 * H_ft) / 144; // soil surface pressure (psi)
  const H_in = H_ft * 12;
  
  // If shallow cover, use Prism
  if (H_in < 2.5 * D_in) {
    return (rho_lbft3 * H_ft) / 144;
  }
  
  // Trap Door formula (exponential decay)
  const Ka = (1 - Math.sin(phiRad)) / (1 + Math.sin(phiRad));
  const exponent = (-2 * Ka * H_in) / D_in;
  
  const Psoil = (DenCoTerm * D_in / (2 * Ka)) * (1 - Math.exp(exponent)) + q * Math.exp(exponent);
  
  return Psoil;
}

/**
 * Calculate Boussinesq pressure distribution from track loads
 * Ported from VBA - uses 6-inch grid of point loads
 */
function calculateBoussinesq(inputs: InputsEN): {
  bsnqMax_psi: number;
  bsnqSUM1_psi: number;
  bsnqSUM2_psi: number;
  location: string;
  contactPressure_psf: number;
  influenceFactor: number;
  axleLoad_lb: number;
  pointLoad_lb: number;
  nW: number;
  nL: number;
} {
  const { vehicleWeight_lb, trackSeparation_ft, trackLength_ft, trackWidth_in, H_ft } = inputs;
  
  // Axle load (half of vehicle weight per track)
  const axleLoad_lb = vehicleWeight_lb / 2;
  
  // Convert dimensions to inches
  const trackLength_in = trackLength_ft * 12;
  const trackWidth_in_val = trackWidth_in;
  
  // 6-inch grid
  const gridSpacing_in = 6;
  const nW = Math.ceil(trackWidth_in_val / gridSpacing_in);
  const nL = Math.ceil(trackLength_in / gridSpacing_in);
  
  // Point load at each grid point
  const pointLoad_lb = axleLoad_lb / (nW * nL);
  
  // Contact pressure (for reference)
  const contactArea_ft2 = (trackLength_in * trackWidth_in_val) / 144;
  const contactPressure_psf = axleLoad_lb / contactArea_ft2;
  
  // Measurement points (ported from VBA)
  // MP1: under the track (at edge)
  const MP1_X = (trackSeparation_ft * 12) / 2;
  const MP1_Y = 0;
  
  // MP2: between tracks (centerline)
  const MP2_X = 0;
  const MP2_Y = 0;
  
  // Track 1 coordinates (left side, centered at origin in Y)
  const Track1_X = (trackSeparation_ft * 12) / 2;
  const Track1_Y_start = -trackLength_in / 2;
  
  // Track 2 coordinates (right side, mirror of Track 1)
  const Track2_X = -(trackSeparation_ft * 12) / 2;
  const Track2_Y_start = -trackLength_in / 2;
  
  let bsnqSUM1 = 0;
  let bsnqSUM2 = 0;
  
  const H_in = H_ft * 12;
  
  // Loop through grid points on Track 1
  for (let iW = 0; iW < nW; iW++) {
    for (let iL = 0; iL < nL; iL++) {
      const x = Track1_X + (iW * gridSpacing_in) - (trackWidth_in_val / 2);
      const y = Track1_Y_start + (iL * gridSpacing_in);
      
      // Contribution to MP1
      const R1 = Math.sqrt(Math.pow(MP1_X - x, 2) + Math.pow(MP1_Y - y, 2));
      const contrib1 = (3 * pointLoad_lb) / (2 * PI * Math.pow(H_in, 2) * Math.pow(1 + Math.pow(R1 / H_in, 2), 2.5));
      bsnqSUM1 += contrib1;
      
      // Contribution to MP2
      const R2 = Math.sqrt(Math.pow(MP2_X - x, 2) + Math.pow(MP2_Y - y, 2));
      const contrib2 = (3 * pointLoad_lb) / (2 * PI * Math.pow(H_in, 2) * Math.pow(1 + Math.pow(R2 / H_in, 2), 2.5));
      bsnqSUM2 += contrib2;
    }
  }
  
  // Loop through grid points on Track 2
  for (let iW = 0; iW < nW; iW++) {
    for (let iL = 0; iL < nL; iL++) {
      const x = Track2_X + (iW * gridSpacing_in) - (trackWidth_in_val / 2);
      const y = Track2_Y_start + (iL * gridSpacing_in);
      
      // Contribution to MP1
      const R1 = Math.sqrt(Math.pow(MP1_X - x, 2) + Math.pow(MP1_Y - y, 2));
      const contrib1 = (3 * pointLoad_lb) / (2 * PI * Math.pow(H_in, 2) * Math.pow(1 + Math.pow(R1 / H_in, 2), 2.5));
      bsnqSUM1 += contrib1;
      
      // Contribution to MP2
      const R2 = Math.sqrt(Math.pow(MP2_X - x, 2) + Math.pow(MP2_Y - y, 2));
      const contrib2 = (3 * pointLoad_lb) / (2 * PI * Math.pow(H_in, 2) * Math.pow(1 + Math.pow(R2 / H_in, 2), 2.5));
      bsnqSUM2 += contrib2;
    }
  }
  
  // Determine max and location
  const bsnqMax = Math.max(bsnqSUM1, bsnqSUM2);
  const location = bsnqSUM1 >= bsnqSUM2 
    ? "Under the tracks (at track edge)" 
    : "Between tracks (at centerline)";
  
  // Influence factor (max Boussinesq / contact pressure, for reference)
  const influenceFactor = bsnqMax / (contactPressure_psf / 144);
  
  return {
    bsnqMax_psi: bsnqMax,
    bsnqSUM1_psi: bsnqSUM1,
    bsnqSUM2_psi: bsnqSUM2,
    location,
    contactPressure_psf,
    influenceFactor,
    axleLoad_lb,
    pointLoad_lb,
    nW,
    nL
  };
}

/**
 * Calculate impact factor with depth adjustment
 * Ported from VBA
 */
function calculateImpactFactor(inputs: InputsEN): { impactFactor: number; impactFactorDepth: number } {
  const { vehicleClass, pavementType, H_ft } = inputs;
  
  let impactFactor = 1.0;
  
  // Base impact factor
  if (vehicleClass === 'HIGHWAY') {
    impactFactor = pavementType === 'RIGID' ? 1.0 : 1.5;
  } else if (vehicleClass === 'FARM') {
    impactFactor = 1.25;
  } else { // TRACK
    impactFactor = 1.5;
  }
  
  // Depth adjustment
  const H_in = H_ft * 12;
  let impactFactorDepth = impactFactor;
  
  if (H_in > 60) {
    impactFactorDepth = impactFactor - 0.0025 * (H_in - 60);
    // Clamp to minimum 1.0
    impactFactorDepth = Math.max(1.0, impactFactorDepth);
  }
  
  return { impactFactor, impactFactorDepth };
}

/**
 * Calculate hoop stress using CEPA formula
 * Ported from VBA
 */
function calculateHoopStress(
  P_psi: number, // external pressure (soil or live)
  Pint_psi: number, // internal pressure
  D_in: number,
  t_in: number,
  Kb: number,
  Kz: number,
  ePrime_psi: number
): number {
  const denominator = 1 + 3 * Kz * (Pint_psi / E_STEEL) * Math.pow(D_in / t_in, 3) 
                       + 0.0915 * (ePrime_psi / E_STEEL) * Math.pow(D_in / t_in, 3);
  
  const hoopStress = (3 * Kb * P_psi * Math.pow(D_in / t_in, 2)) / denominator;
  
  return hoopStress;
}

/**
 * Calculate longitudinal live load stress (local + axial bending)
 * Ported from VBA
 */
function calculateLongitudinalLiveStress(
  hoopLive_psi: number,
  bsnqMax_psi: number,
  impactFactorDepth: number,
  D_in: number,
  t_in: number,
  H_ft: number,
  Theta: number,
  ePrime_psi: number
): { longLive_psi: number; longLiveLocal_psi: number; longLiveBend_psi: number; momentMAX_lbin: number } {
  // Local bending component
  const Beta = Math.pow(12 * (1 - Math.pow(POISSON, 2)), 1/8);
  const longLiveLocal = (0.153 / 1.56) * Math.pow(Beta, 4) * hoopLive_psi;
  
  // Axial bending component
  const H_in = H_ft * 12;
  
  // Moment of inertia
  const R_out = D_in / 2;
  const R_in = R_out - t_in;
  const Inertia = (PI / 4) * (Math.pow(R_out, 4) - Math.pow(R_in, 4));
  
  // Lambda parameter
  const Lambda = Math.pow((ePrime_psi * D_in * Theta / 360) / (4 * E_STEEL * Inertia), 0.25);
  
  // Load on pipe from Boussinesq (ported from VBA)
  const Wsurf = bsnqMax_psi * 2 * PI * Math.pow(H_in, 2) / 3 * impactFactorDepth;
  
  // Load length
  const Lload = H_in * Math.tan((29.9 * PI) / 180); // 29.9 degrees
  
  // Distributed load on pipe
  const Ppipe = Wsurf / (PI * Math.pow(Lload, 2));
  
  // Calculate moment distribution (ported from VBA)
  // VBA loops from -100*Lload to +100*Lload with step size
  // We'll use a reasonable step to avoid massive iterations
  const maxRange = 100 * Lload;
  const stepSize = Math.max(1, Lload / 50); // at least 1 inch, or Lload/50
  
  let Mmax = 0;
  let Mmin1 = 0;
  let Mmin2 = 0;
  
  // Iterate along pipe length
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
    
    // Track max and min
    if (M > Mmax) Mmax = M;
    if (absX <= Lload && M < Mmin1) Mmin1 = M;
    if (absX > Lload && M < Mmin2) Mmin2 = M;
  }
  
  const momentMAX = Math.max(Math.abs(Mmax), Math.abs(Mmin1), Math.abs(Mmin2));
  const longLiveBend = momentMAX * (D_in / 2) / Inertia;
  
  const longLive = longLiveBend + longLiveLocal;
  
  return { longLive_psi: longLive, longLiveLocal_psi: longLiveLocal, longLiveBend_psi: longLiveBend, momentMAX_lbin: momentMAX };
}

/**
 * Main VBA Track Engine calculation
 */
export function calculateTrackVehicleVBA(inputs: PipelineTrackInputs): PipelineTrackResults {
  // Convert inputs to EN units
  const inputsEN = convertInputsToEN(inputs);
  
  // (1) Bedding parameters
  const { Kb, Kz, Theta } = calculateBeddingParams(inputsEN.beddingAngleDeg);
  
  // (2) E' (modulus of soil reaction)
  const ePrime_psi = calculateEPrime(inputsEN);
  
  // (3) Soil load
  const soilPressure_psi = calculateSoilLoad(inputsEN);
  
  // (4) Boussinesq
  const boussinesq = calculateBoussinesq(inputsEN);
  
  // (5) Impact factor
  const { impactFactor, impactFactorDepth } = calculateImpactFactor(inputsEN);
  const bsnqIF_psi = impactFactorDepth * boussinesq.bsnqMax_psi;
  
  // (6) Hoop stresses - AT ZERO PRESSURE
  const hoopSoil_Zero = calculateHoopStress(soilPressure_psi, 0, inputsEN.D_in, inputsEN.t_in, Kb, Kz, ePrime_psi);
  const hoopLive_Zero = calculateHoopStress(bsnqIF_psi, 0, inputsEN.D_in, inputsEN.t_in, Kb, Kz, ePrime_psi);
  const hoopInt_Zero = 0; // no internal pressure
  
  const hoopZeroHigh = hoopSoil_Zero + hoopLive_Zero + hoopInt_Zero;
  const hoopZeroLow = hoopSoil_Zero - hoopLive_Zero + hoopInt_Zero;
  
  // (7) Hoop stresses - AT MOP
  const hoopSoil_MOP = calculateHoopStress(soilPressure_psi, inputsEN.MOP_psi, inputsEN.D_in, inputsEN.t_in, Kb, Kz, ePrime_psi);
  const hoopLive_MOP = calculateHoopStress(bsnqIF_psi, inputsEN.MOP_psi, inputsEN.D_in, inputsEN.t_in, Kb, Kz, ePrime_psi);
  const hoopInt_MOP = inputsEN.MOP_psi * inputsEN.D_in / (2 * inputsEN.t_in);
  
  const hoopMOPHigh = hoopSoil_MOP + hoopLive_MOP + hoopInt_MOP;
  const hoopMOPLow = hoopSoil_MOP - hoopLive_MOP + hoopInt_MOP;
  
  // (8) Longitudinal stresses - AT ZERO PRESSURE
  const longSoil_Zero = POISSON * hoopSoil_Zero;
  const longInt_Zero = 0;
  const longTherm = E_STEEL * ALPHA * inputsEN.deltaT_F;
  
  const longLive_Zero_calc = calculateLongitudinalLiveStress(
    hoopLive_Zero,
    boussinesq.bsnqMax_psi,
    impactFactorDepth,
    inputsEN.D_in,
    inputsEN.t_in,
    inputsEN.H_ft,
    Theta,
    ePrime_psi
  );
  const longLive_Zero = longLive_Zero_calc.longLive_psi;
  
  const longZeroHigh = longSoil_Zero + longLive_Zero + longInt_Zero + longTherm;
  const longZeroLow = longSoil_Zero - longLive_Zero + longInt_Zero + longTherm;
  
  // (9) Longitudinal stresses - AT MOP
  const longSoil_MOP = POISSON * hoopSoil_MOP;
  const longInt_MOP = POISSON * hoopInt_MOP;
  
  const longLive_MOP_calc = calculateLongitudinalLiveStress(
    hoopLive_MOP,
    boussinesq.bsnqMax_psi,
    impactFactorDepth,
    inputsEN.D_in,
    inputsEN.t_in,
    inputsEN.H_ft,
    Theta,
    ePrime_psi
  );
  const longLive_MOP = longLive_MOP_calc.longLive_psi;
  
  const longMOPHigh = longSoil_MOP + longLive_MOP + longInt_MOP + longTherm;
  const longMOPLow = longSoil_MOP - longLive_MOP + longInt_MOP + longTherm;
  
  // (10) Equivalent stresses (Tresca or Von Mises)
  const equivZero = calculateEquivalentStress(
    hoopZeroHigh, hoopZeroLow,
    longZeroHigh, longZeroLow,
    inputsEN.equivStressMethod
  );
  
  const equivMOP = calculateEquivalentStress(
    hoopMOPHigh, hoopMOPLow,
    longMOPHigh, longMOPLow,
    inputsEN.equivStressMethod
  );
  
  // (11) Pass/Fail with limits info
  const passFailSummary = calculatePassFail(
    hoopZeroHigh, hoopZeroLow, hoopMOPHigh, hoopMOPLow,
    longZeroHigh, longZeroLow, longMOPHigh, longMOPLow,
    hoopSoil_Zero, longSoil_Zero, longTherm, // For B31.4 sustained check at zero
    hoopSoil_MOP, longSoil_MOP, hoopInt_MOP, longInt_MOP, // For B31.4 sustained check at MOP
    equivZero.high, equivZero.low, equivMOP.high, equivMOP.low,
    inputsEN.SMYS_psi,
    inputsEN.codeCheck,
    inputsEN.userDefinedHoopLimit,
    inputsEN.userDefinedLongLimit,
    inputsEN.userDefinedEquivLimit
  );
  
  // (12) Calculate E' (already calculated above)
  const ePrime_psi_final = ePrime_psi;
  
  // (13) Deflection ratio (for reference, from CEPA)
  const deflectionRatio = (3 * Kb * soilPressure_psi * Math.pow(inputsEN.D_in / inputsEN.t_in, 2)) / 
    (1 + 3 * Kz * (inputsEN.MOP_psi / E_STEEL) * Math.pow(inputsEN.D_in / inputsEN.t_in, 3) 
     + 0.0915 * (ePrime_psi_final / E_STEEL) * Math.pow(inputsEN.D_in / inputsEN.t_in, 3)) / E_STEEL;
  
  // Assemble debug values
  const debug: DebugEN = {
    soilPressure_psi,
    boussinesqMax_psi: boussinesq.bsnqMax_psi,
    impactFactorDepth,
    Kb,
    Kz,
    Theta,
    ePrime_psi,
    hoopSoil_psi: hoopSoil_MOP,
    hoopLive_psi: hoopLive_MOP,
    hoopInt_psi: hoopInt_MOP,
    longSoil_psi: longSoil_MOP,
    longLive_psi: longLive_MOP,
    longInt_psi: longInt_MOP,
    longTherm_psi: longTherm,
    contactPressure_psf: boussinesq.contactPressure_psf,
    influenceFactor: boussinesq.influenceFactor,
    bsnqSUM1_psi: boussinesq.bsnqSUM1_psi,
    bsnqSUM2_psi: boussinesq.bsnqSUM2_psi,
    axleLoad_lb: boussinesq.axleLoad_lb,
    pointLoad_lb: boussinesq.pointLoad_lb,
    nW: boussinesq.nW,
    nL: boussinesq.nL,
    momentMAX_lbin: longLive_MOP_calc.momentMAX_lbin,
    longLiveLocal_psi: longLive_MOP_calc.longLiveLocal_psi,
    longLiveBend_psi: longLive_MOP_calc.longLiveBend_psi,
  };
  
  // Convert outputs to user units (if SI)
  const results: PipelineTrackResults = {
    maxSurfacePressureOnPipe: convertPressureToUserUnits(bsnqIF_psi, inputs.unitsSystem),
    locationMaxLoad: boussinesq.location,
    impactFactorUsed: impactFactorDepth,
    stresses: {
      atZeroPressure: {
        hoop: {
          high: convertPressureToUserUnits(hoopZeroHigh, inputs.unitsSystem),
          low: convertPressureToUserUnits(hoopZeroLow, inputs.unitsSystem),
          components: {
            pressure: 0,
            earth: convertPressureToUserUnits(hoopSoil_Zero, inputs.unitsSystem),
            thermal: 0,
            total: convertPressureToUserUnits(hoopZeroHigh, inputs.unitsSystem),
          }
        },
        longitudinal: {
          high: convertPressureToUserUnits(longZeroHigh, inputs.unitsSystem),
          low: convertPressureToUserUnits(longZeroLow, inputs.unitsSystem),
          components: {
            pressure: 0,
            earth: convertPressureToUserUnits(longSoil_Zero, inputs.unitsSystem),
            thermal: convertPressureToUserUnits(longTherm, inputs.unitsSystem),
            total: convertPressureToUserUnits(longZeroHigh, inputs.unitsSystem),
          }
        },
        equivalent: {
          high: convertPressureToUserUnits(equivZero.high, inputs.unitsSystem),
          low: convertPressureToUserUnits(equivZero.low, inputs.unitsSystem),
          percentSMYS: equivZero.percentSMYS,
        }
      },
      atMOP: {
        hoop: {
          high: convertPressureToUserUnits(hoopMOPHigh, inputs.unitsSystem),
          low: convertPressureToUserUnits(hoopMOPLow, inputs.unitsSystem),
          components: {
            pressure: convertPressureToUserUnits(hoopInt_MOP, inputs.unitsSystem),
            earth: convertPressureToUserUnits(hoopSoil_MOP, inputs.unitsSystem),
            thermal: 0,
            total: convertPressureToUserUnits(hoopMOPHigh, inputs.unitsSystem),
          }
        },
        longitudinal: {
          high: convertPressureToUserUnits(longMOPHigh, inputs.unitsSystem),
          low: convertPressureToUserUnits(longMOPLow, inputs.unitsSystem),
          components: {
            pressure: convertPressureToUserUnits(longInt_MOP, inputs.unitsSystem),
            earth: convertPressureToUserUnits(longSoil_MOP, inputs.unitsSystem),
            thermal: convertPressureToUserUnits(longTherm, inputs.unitsSystem),
            total: convertPressureToUserUnits(longMOPHigh, inputs.unitsSystem),
          }
        },
        equivalent: {
          high: convertPressureToUserUnits(equivMOP.high, inputs.unitsSystem),
          low: convertPressureToUserUnits(equivMOP.low, inputs.unitsSystem),
          percentSMYS: equivMOP.percentSMYS,
        }
      }
    },
    allowableStress: convertPressureToUserUnits(passFailSummary.allowableStress_psi, inputs.unitsSystem),
    passFailSummary: {
      hoopAtZero: passFailSummary.hoopAtZero,
      hoopAtMOP: passFailSummary.hoopAtMOP,
      longitudinalAtZero: passFailSummary.longitudinalAtZero,
      longitudinalAtMOP: passFailSummary.longitudinalAtMOP,
      equivalentAtZero: passFailSummary.equivalentAtZero,
      equivalentAtMOP: passFailSummary.equivalentAtMOP,
      overallPass: passFailSummary.overallPass,
    },
    limitsUsed: passFailSummary.limitsUsed,
    ePrimeUsed: convertPressureToUserUnits(ePrime_psi, inputs.unitsSystem),
    soilLoadOnPipe: convertPressureToUserUnits(soilPressure_psi, inputs.unitsSystem),
    deflectionRatio,
    debug: convertDebugToUserUnits(debug, inputs.unitsSystem),
  };
  
  return results;
}

/**
 * Convert PipelineTrackInputs to ENGLISH units
 */
function convertInputsToEN(inputs: PipelineTrackInputs): InputsEN {
  const isMetric = inputs.unitsSystem === 'SI';
  
  return {
    D_in: isMetric ? mmToIn(inputs.pipeOD) : inputs.pipeOD,
    t_in: isMetric ? mmToIn(inputs.pipeWT) : inputs.pipeWT,
    MOP_psi: isMetric ? kPaToPsi(inputs.MOP) : inputs.MOP,
    SMYS_psi: isMetric ? MPaToPsi(inputs.SMYS) : inputs.SMYS,
    deltaT_F: isMetric ? celsiusToFahrenheit(inputs.deltaT) : inputs.deltaT,
    rho_lbft3: isMetric ? kgm3ToLbft3(inputs.soilDensity) : inputs.soilDensity,
    H_ft: isMetric ? mToFt(inputs.depthCover) : inputs.depthCover,
    beddingAngleDeg: inputs.beddingAngleDeg,
    soilLoadMethod: inputs.soilLoadMethod,
    frictionAngleDeg: inputs.frictionAngleDeg,
    soilCohesion_psi: isMetric ? kPaToPsi(inputs.soilCohesion) : inputs.soilCohesion,
    ePrimeMethod: inputs.ePrimeMethod,
    ePrimeUserDefined_psi: inputs.ePrimeUserDefined ? (isMetric ? kPaToPsi(inputs.ePrimeUserDefined) : inputs.ePrimeUserDefined) : undefined,
    soilType: inputs.soilType,
    compaction: inputs.compaction,
    trackSeparation_ft: isMetric ? mToFt(inputs.trackSeparation) : inputs.trackSeparation,
    trackLength_ft: isMetric ? mToFt(inputs.trackLength) : inputs.trackLength,
    vehicleWeight_lb: isMetric ? kgToLb(inputs.trackVehicleWeight) : inputs.trackVehicleWeight,
    trackWidth_in: isMetric ? mmToIn(inputs.trackWidth) : inputs.trackWidth,
    pavementType: inputs.pavementType,
    vehicleClass: inputs.vehicleClass,
    equivStressMethod: inputs.equivStressMethod,
    codeCheck: inputs.codeCheck,
    userDefinedHoopLimit: inputs.userDefinedLimits ? inputs.userDefinedLimits.hoopLimitPct / 100 : undefined,
    userDefinedLongLimit: inputs.userDefinedLimits ? inputs.userDefinedLimits.longLimitPct / 100 : undefined,
    userDefinedEquivLimit: inputs.userDefinedLimits ? inputs.userDefinedLimits.equivLimitPct / 100 : undefined,
  };
}

/**
 * Unit conversion helpers - matching VBA exactly
 */
function mmToIn(mm: number): number {
  return mm * 0.03937007874016;
}

function mToFt(m: number): number {
  return m * 3.280839895013;
}

function kPaToPsi(kPa: number): number {
  return kPa * 0.1450378911491;
}

function MPaToPsi(MPa: number): number {
  return MPa * 145.0378911491;
}

function kgToLb(kg: number): number {
  return kg * 2.2046226218;
}

function kgm3ToLbft3(kgm3: number): number {
  return kgm3 * 0.062427960576;
}

function celsiusToFahrenheit(C: number): number {
  return C * 9 / 5;
}

function psiToKPa(psi: number): number {
  return psi / 0.1450378911491;
}

function convertPressureToUserUnits(psi: number, unitsSystem: 'EN' | 'SI'): number {
  return unitsSystem === 'SI' ? psiToKPa(psi) : psi;
}

function convertDebugToUserUnits(debug: DebugEN, unitsSystem: 'EN' | 'SI'): DebugValues {
  if (unitsSystem === 'EN') {
    return debug as DebugValues;
  }
  
  // Convert to SI
  return {
    soilPressure_psi: psiToKPa(debug.soilPressure_psi),
    boussinesqMax_psi: psiToKPa(debug.boussinesqMax_psi),
    impactFactorDepth: debug.impactFactorDepth,
    Kb: debug.Kb,
    Kz: debug.Kz,
    Theta: debug.Theta,
    ePrime_psi: psiToKPa(debug.ePrime_psi),
    hoopSoil_psi: psiToKPa(debug.hoopSoil_psi),
    hoopLive_psi: psiToKPa(debug.hoopLive_psi),
    hoopInt_psi: psiToKPa(debug.hoopInt_psi),
    longSoil_psi: psiToKPa(debug.longSoil_psi),
    longLive_psi: psiToKPa(debug.longLive_psi),
    longInt_psi: psiToKPa(debug.longInt_psi),
    longTherm_psi: psiToKPa(debug.longTherm_psi),
    contactPressure_psf: debug.contactPressure_psf * 0.04788, // psf to Pa, then / 1000 for kPa
    influenceFactor: debug.influenceFactor,
  };
}

/**
 * Calculate equivalent stress (Tresca or Von Mises)
 * Ported from VBA
 */
function calculateEquivalentStress(
  hoopHigh: number,
  hoopLow: number,
  longHigh: number,
  longLow: number,
  method: 'TRESCA' | 'VON_MISES'
): { high: number; low: number; percentSMYS: number } {
  if (method === 'TRESCA') {
    // Tresca: 4 combinations (HH, HL, LH, LL)
    const equiv_HH = Math.abs(hoopHigh - longHigh);
    const equiv_HL = Math.abs(hoopHigh - longLow);
    const equiv_LH = Math.abs(hoopLow - longHigh);
    const equiv_LL = Math.abs(hoopLow - longLow);
    
    const high = Math.max(equiv_HH, equiv_HL, equiv_LH, equiv_LL);
    const low = Math.min(equiv_HH, equiv_HL, equiv_LH, equiv_LL);
    
    return { high, low, percentSMYS: 0 }; // Will be calculated later with SMYS
  } else {
    // Von Mises: sqrt(hoop^2 - hoop*long + long^2)
    const equiv_HH = Math.sqrt(Math.pow(hoopHigh, 2) - hoopHigh * longHigh + Math.pow(longHigh, 2));
    const equiv_HL = Math.sqrt(Math.pow(hoopHigh, 2) - hoopHigh * longLow + Math.pow(longLow, 2));
    const equiv_LH = Math.sqrt(Math.pow(hoopLow, 2) - hoopLow * longHigh + Math.pow(longHigh, 2));
    const equiv_LL = Math.sqrt(Math.pow(hoopLow, 2) - hoopLow * longLow + Math.pow(longLow, 2));
    
    const high = Math.max(equiv_HH, equiv_HL, equiv_LH, equiv_LL);
    const low = Math.min(equiv_HH, equiv_HL, equiv_LH, equiv_LL);
    
    return { high, low, percentSMYS: 0 };
  }
}

/**
 * Calculate pass/fail summary with B31.4 sustained longitudinal check
 * Uses 3 separate limits (hoop/long/equiv) and proper B31.4 logic
 */
function calculatePassFail(
  hoopZeroHigh: number, hoopZeroLow: number,
  hoopMOPHigh: number, hoopMOPLow: number,
  longZeroHigh: number, longZeroLow: number,
  longMOPHigh: number, longMOPLow: number,
  hoopSoil_Zero: number, longSoil_Zero: number, longTherm: number,
  hoopSoil_MOP: number, longSoil_MOP: number, hoopInt_MOP: number, longInt_MOP: number,
  equivZeroHigh: number, equivZeroLow: number,
  equivMOPHigh: number, equivMOPLow: number,
  SMYS_psi: number,
  codeCheck: 'B31_4' | 'B31_8' | 'CSA_Z662' | 'USER_DEFINED',
  userDefinedHoopLimit?: number,
  userDefinedLongLimit?: number,
  userDefinedEquivLimit?: number
): {
  hoopAtZero: boolean;
  hoopAtMOP: boolean;
  longitudinalAtZero: boolean;
  longitudinalAtMOP: boolean;
  equivalentAtZero: boolean;
  equivalentAtMOP: boolean;
  overallPass: boolean;
  allowableStress_psi: number;
  limitsUsed: LimitsUsed;
} {
  // Get code profile or use user-defined limits
  const profile = codeCheck === 'USER_DEFINED' ? null : getCodeProfile(codeCheck);
  
  let hoopLimit: number;
  let longLimit: number;
  let equivLimit: number;
  let usesSustainedLongCheck: boolean;
  
  if (profile) {
    hoopLimit = profile.hoopLimitPct / 100;
    longLimit = profile.longLimitPct / 100;
    equivLimit = profile.equivLimitPct / 100;
    usesSustainedLongCheck = profile.usesSustainedLongCheck;
  } else {
    hoopLimit = userDefinedHoopLimit || 0.9;
    longLimit = userDefinedLongLimit || 0.9;
    equivLimit = userDefinedEquivLimit || 0.9;
    usesSustainedLongCheck = false;
  }
  
  const hoopAllowable_psi = hoopLimit * SMYS_psi;
  const longAllowable_psi = longLimit * SMYS_psi;
  const equivAllowable_psi = equivLimit * SMYS_psi;
  
  // Check hoop pass/fail
  const hoopAtZero = Math.max(Math.abs(hoopZeroHigh), Math.abs(hoopZeroLow)) <= hoopAllowable_psi;
  const hoopAtMOP = Math.max(Math.abs(hoopMOPHigh), Math.abs(hoopMOPLow)) <= hoopAllowable_psi;
  
  // Check longitudinal pass/fail
  let longitudinalAtZero = Math.max(Math.abs(longZeroHigh), Math.abs(longZeroLow)) <= longAllowable_psi;
  let longitudinalAtMOP = Math.max(Math.abs(longMOPHigh), Math.abs(longMOPLow)) <= longAllowable_psi;
  
  // B31.4 applies sustained longitudinal check (internal + thermal ± earth)
  if (usesSustainedLongCheck) {
    // At zero pressure: sustained = thermal ± earth (no internal pressure)
    const sustainedZeroHigh = Math.abs(longTherm + longSoil_Zero);
    const sustainedZeroLow = Math.abs(longTherm - longSoil_Zero);
    const sustainedZeroMax = Math.max(sustainedZeroHigh, sustainedZeroLow);
    const sustainedZeroPass = sustainedZeroMax <= longAllowable_psi;
    longitudinalAtZero = longitudinalAtZero && sustainedZeroPass;
    
    // At MOP: sustained = internal + thermal ± earth
    const sustainedMOPHigh = Math.abs(longInt_MOP + longTherm + longSoil_MOP);
    const sustainedMOPLow = Math.abs(longInt_MOP + longTherm - longSoil_MOP);
    const sustainedMOPMax = Math.max(sustainedMOPHigh, sustainedMOPLow);
    const sustainedMOPPass = sustainedMOPMax <= longAllowable_psi;
    longitudinalAtMOP = longitudinalAtMOP && sustainedMOPPass;
  }
  
  // Check equivalent pass/fail
  const equivalentAtZero = Math.max(Math.abs(equivZeroHigh), Math.abs(equivZeroLow)) <= equivAllowable_psi;
  const equivalentAtMOP = Math.max(Math.abs(equivMOPHigh), Math.abs(equivMOPLow)) <= equivAllowable_psi;
  
  const overallPass = hoopAtZero && hoopAtMOP && longitudinalAtZero && longitudinalAtMOP && equivalentAtZero && equivalentAtMOP;
  
  // Assemble limits info
  const limitsUsed: LimitsUsed = {
    code: codeCheck,
    codeLabel: getCodeLabel(codeCheck),
    hoopLimitPct: hoopLimit * 100,
    longLimitPct: longLimit * 100,
    equivLimitPct: equivLimit * 100,
    usesSustainedLongCheck,
  };
  
  return {
    hoopAtZero,
    hoopAtMOP,
    longitudinalAtZero,
    longitudinalAtMOP,
    equivalentAtZero,
    equivalentAtMOP,
    overallPass,
    allowableStress_psi: equivAllowable_psi,
    limitsUsed,
  };
}
