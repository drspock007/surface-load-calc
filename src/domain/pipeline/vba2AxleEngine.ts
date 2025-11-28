/**
 * VBA 2-Axle Vehicle Engine
 * Calculates stresses from a 2-axle vehicle load
 * Reuses Boussinesq and stress calculation logic
 */

import { TwoAxleInputs, TwoAxleResults } from './types2Axle';
import { calculatePassFail as calculatePassFailHelper } from './passFailHelpers';
import { 
  calculateBoussinesqFromPoints, 
  generateRectangularGrid, 
  generateStandardMeasurementPoints,
  PointLoad 
} from './boussinesqHelpers';

// Import shared calculation functions
import { 
  calculateBeddingParams,
  calculateEPrime,
  calculateSoilLoad,
  calculateImpactFactor,
  calculateHoopStress,
  calculateLongitudinalLiveStress,
  calculateEquivalentStress,
  calculatePassFail,
  convertPressureToUserUnits,
} from './sharedCalculations';

/**
 * Convert 2-Axle inputs to English units for calculation
 */
function convertInputsToEN(inputs: TwoAxleInputs): any {
  const isMetric = inputs.unitsSystem === 'SI';
  
  if (!isMetric) {
    return {
      ...inputs,
      axleSpacing_ft: inputs.axleSpacing,
      axle1Load_lb: inputs.axle1Load,
      axle2Load_lb: inputs.axle2Load,
      tireWidth_in: inputs.tireWidth,
      tireLength_in: inputs.tireLength,
      axleWidth_in: inputs.axleWidth,
      laneOffset_ft: inputs.laneOffset,
      // Pipe properties already in EN
      D_in: inputs.pipeOD,
      t_in: inputs.pipeWT,
      Pint_psi: inputs.MOP,
      SMYS_psi: inputs.SMYS,
      deltaT_F: inputs.deltaT,
      Rho_lbft3: inputs.soilDensity,
      H_ft: inputs.depthCover,
      Eprime_psi: inputs.ePrimeUserDefined,
    };
  }
  
  // Metric conversions
  return {
    ...inputs,
    axleSpacing_ft: inputs.axleSpacing * 3.280839895013, // m -> ft
    axle1Load_lb: inputs.axle1Load * 2.2046226218, // kg -> lb
    axle2Load_lb: inputs.axle2Load * 2.2046226218,
    tireWidth_in: inputs.tireWidth * 0.03937007874016, // mm -> in
    tireLength_in: inputs.tireLength * 0.03937007874016,
    axleWidth_in: inputs.axleWidth * 0.03937007874016,
    laneOffset_ft: inputs.laneOffset * 3.280839895013, // m -> ft
    D_in: inputs.pipeOD * 0.03937007874016, // mm -> in
    t_in: inputs.pipeWT * 0.03937007874016,
    Pint_psi: inputs.MOP * 0.1450378911491, // kPa -> psi
    SMYS_psi: inputs.SMYS * 145.0378911491, // MPa -> psi
    deltaT_F: inputs.deltaT * 9 / 5, // C -> F delta
    Rho_lbft3: inputs.soilDensity * 0.062427960576, // kg/m3 -> lb/ft3
    H_ft: inputs.depthCover * 3.280839895013, // m -> ft
    Eprime_psi: inputs.ePrimeUserDefined ? inputs.ePrimeUserDefined * 0.1450378911491 : undefined,
  };
}

/**
 * Main 2-Axle calculation engine
 */
export function calculate2AxleVehicleVBA(inputs: TwoAxleInputs): TwoAxleResults {
  const inputsEN = convertInputsToEN(inputs);
  
  // Generate point loads for both axles
  const pointLoads: PointLoad[] = [];
  
  // Axle 1 (front) - assume centered on pipe initially
  const axle1_Y = -inputsEN.axleSpacing_ft * 12 / 2; // convert ft to inches, place before centerline
  const axle1Loads = generateRectangularGrid(
    inputsEN.laneOffset_ft * 12, // lateral offset in inches
    axle1_Y,
    inputsEN.tireWidth_in * 2, // two tires per axle (left + right)
    inputsEN.tireLength_in,
    inputsEN.axle1Load_lb,
    6 // 6-inch grid spacing
  );
  
  // Axle 2 (rear)
  const axle2_Y = inputsEN.axleSpacing_ft * 12 / 2;
  const axle2Loads = generateRectangularGrid(
    inputsEN.laneOffset_ft * 12,
    axle2_Y,
    inputsEN.tireWidth_in * 2,
    inputsEN.tireLength_in,
    inputsEN.axle2Load_lb,
    6
  );
  
  pointLoads.push(...axle1Loads, ...axle2Loads);
  
  // Measurement points
  const measurementPoints = generateStandardMeasurementPoints(
    inputsEN.laneOffset_ft * 12,
    0
  );
  
  // Calculate Boussinesq
  const boussinesq = calculateBoussinesqFromPoints(
    pointLoads,
    measurementPoints,
    inputsEN.H_ft
  );
  
  // Calculate impact factor
  const impactResult = calculateImpactFactor(
    inputs.vehicleClass,
    inputs.pavementType,
    inputsEN.H_ft
  );
  
  const BsnqIF = boussinesq.maxPressure_psi * impactResult.impactFactorDepth;
  
  // Calculate E'
  const ePrime = calculateEPrime(
    inputs.ePrimeMethod,
    inputsEN.Eprime_psi,
    inputs.soilType,
    inputs.compaction,
    inputsEN.H_ft
  );
  
  // Calculate soil load
  const soilLoad = calculateSoilLoad(
    inputs.soilLoadMethod,
    inputsEN.Rho_lbft3,
    inputsEN.H_ft,
    inputsEN.D_in,
    inputs.frictionAngleDeg,
    inputs.soilCohesion
  );
  
  // Calculate bedding params
  const bedding = calculateBeddingParams(inputs.beddingAngleDeg);
  
  // Calculate stresses (reuse Track logic)
  const stressZero = calculateHoopStress(
    soilLoad.Psoil_psi,
    BsnqIF,
    0, // zero pressure
    inputsEN.D_in,
    inputsEN.t_in,
    bedding.Kb,
    bedding.Kz,
    ePrime.ePrime_psi,
    inputs.kr
  );
  
  const stressMOP = calculateHoopStress(
    soilLoad.Psoil_psi,
    BsnqIF,
    inputsEN.Pint_psi,
    inputsEN.D_in,
    inputsEN.t_in,
    bedding.Kb,
    bedding.Kz,
    ePrime.ePrime_psi,
    inputs.kr
  );
  
  const longZero = calculateLongitudinalLiveStress(
    stressZero.hoopLive,
    BsnqIF,
    inputsEN.H_ft,
    inputsEN.D_in,
    inputsEN.t_in,
    ePrime.ePrime_psi,
    bedding.Theta,
    impactResult.impactFactorDepth
  );
  
  const longMOP = calculateLongitudinalLiveStress(
    stressMOP.hoopLive,
    BsnqIF,
    inputsEN.H_ft,
    inputsEN.D_in,
    inputsEN.t_in,
    ePrime.ePrime_psi,
    bedding.Theta,
    impactResult.impactFactorDepth
  );
  
  // Thermal stress
  const E = 30e6;
  const Alpha = 6.5e-6;
  const longTherm_psi = E * Alpha * inputsEN.deltaT_F;
  
  // Combine stresses
  const hoopZeroHigh = stressZero.hoopSoil + stressZero.hoopLive;
  const hoopZeroLow = stressZero.hoopSoil;
  const hoopMOPHigh = stressMOP.hoopSoil + stressMOP.hoopLive + stressMOP.hoopInt;
  const hoopMOPLow = stressMOP.hoopSoil + stressMOP.hoopInt;
  
  const Poisson = 0.3;
  const longZeroHigh = Poisson * stressZero.hoopSoil + longZero.longLive + longTherm_psi;
  const longZeroLow = Poisson * stressZero.hoopSoil + longTherm_psi;
  const longMOPHigh = Poisson * stressMOP.hoopSoil + longMOP.longLive + Poisson * stressMOP.hoopInt + longTherm_psi;
  const longMOPLow = Poisson * stressMOP.hoopSoil + Poisson * stressMOP.hoopInt + longTherm_psi;
  
  // Equivalent stresses
  const equivZero = calculateEquivalentStress(
    inputs.equivStressMethod,
    hoopZeroHigh,
    hoopZeroLow,
    longZeroHigh,
    longZeroLow,
    inputsEN.SMYS_psi
  );
  
  const equivMOP = calculateEquivalentStress(
    inputs.equivStressMethod,
    hoopMOPHigh,
    hoopMOPLow,
    longMOPHigh,
    longMOPLow,
    inputsEN.SMYS_psi
  );
  
  // Pass/Fail
  const passFailResult = calculatePassFailHelper(
    inputs.codeCheck,
    inputs.userDefinedLimits,
    Math.max(Math.abs(hoopZeroHigh), Math.abs(hoopMOPHigh)) / inputsEN.SMYS_psi * 100,
    Math.max(Math.abs(longZeroHigh), Math.abs(longMOPHigh)) / inputsEN.SMYS_psi * 100,
    Math.max(equivZero.pctSMYS, equivMOP.pctSMYS)
  );
  
  // Deflection ratio (simplified)
  const deflectionRatio = (soilLoad.Psoil_psi + BsnqIF) * Math.pow(inputsEN.D_in / inputsEN.t_in, 3) / ePrime.ePrime_psi;
  
  // Assemble results
  const results: TwoAxleResults = {
    maxSurfacePressureOnPipe: BsnqIF,
    locationMaxLoad: boussinesq.maxLocation,
    impactFactorUsed: impactResult.impactFactorDepth,
    stresses: {
      atZeroPressure: {
        hoop: {
          high: hoopZeroHigh,
          low: hoopZeroLow,
          components: {
            pressure: 0,
            earth: stressZero.hoopSoil,
            thermal: 0,
            total: hoopZeroHigh,
          },
        },
        longitudinal: {
          high: longZeroHigh,
          low: longZeroLow,
          components: {
            pressure: 0,
            earth: Poisson * stressZero.hoopSoil,
            thermal: longTherm_psi,
            total: longZeroHigh,
          },
        },
        equivalent: {
          high: equivZero.high,
          low: equivZero.low,
          percentSMYS: equivZero.pctSMYS,
        },
      },
      atMOP: {
        hoop: {
          high: hoopMOPHigh,
          low: hoopMOPLow,
          components: {
            pressure: stressMOP.hoopInt,
            earth: stressMOP.hoopSoil,
            thermal: 0,
            total: hoopMOPHigh,
          },
        },
        longitudinal: {
          high: longMOPHigh,
          low: longMOPLow,
          components: {
            pressure: Poisson * stressMOP.hoopInt,
            earth: Poisson * stressMOP.hoopSoil,
            thermal: longTherm_psi,
            total: longMOPHigh,
          },
        },
        equivalent: {
          high: equivMOP.high,
          low: equivMOP.low,
          percentSMYS: equivMOP.pctSMYS,
        },
      },
    },
    allowableStress: passFailResult.allowableStress_psi,
    passFailSummary: {
      hoopAtZero: passFailResult.hoopPass,
      hoopAtMOP: passFailResult.hoopPass,
      longitudinalAtZero: passFailResult.longPass,
      longitudinalAtMOP: passFailResult.longPass,
      equivalentAtZero: passFailResult.equivPass,
      equivalentAtMOP: passFailResult.equivPass,
      overallPass: passFailResult.overallPass,
    },
    limitsUsed: passFailResult.limitsUsed,
    ePrimeUsed: ePrime.ePrime_psi,
    soilLoadOnPipe: soilLoad.Psoil_psi,
    deflectionRatio,
    debug: {
      soilPressure_psi: soilLoad.Psoil_psi,
      boussinesqMax_psi: boussinesq.maxPressure_psi,
      impactFactorDepth: impactResult.impactFactorDepth,
      Kb: bedding.Kb,
      Kz: bedding.Kz,
      Theta: bedding.Theta,
      ePrime_psi: ePrime.ePrime_psi,
      hoopSoil_psi: stressMOP.hoopSoil,
      hoopLive_psi: stressMOP.hoopLive,
      hoopInt_psi: stressMOP.hoopInt,
      longSoil_psi: Poisson * stressMOP.hoopSoil,
      longLive_psi: longMOP.longLive,
      longInt_psi: Poisson * stressMOP.hoopInt,
      longTherm_psi,
      contactPressure_psf: boussinesq.contactPressure_psf,
      influenceFactor: boussinesq.influenceFactor,
    },
  };
  
  // Convert to user units
  return {
    ...results,
    maxSurfacePressureOnPipe: convertPressureToUserUnits(results.maxSurfacePressureOnPipe, inputs.unitsSystem),
    // ... (other conversions as needed)
  } as TwoAxleResults;
}
