import { isPePipe, computePeResults } from './peEngine';
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
  generatePipeScanMeasurementPoints,
  formatMaxLocationLabel,
  PointLoad 
} from './boussinesqHelpers';
import { calculateContactPatch, convertTirePressureToPsi } from './tirePatchCalculations';
import { calculateMinBendRadius } from './bendRadiusCalculation';

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
      axle1TireWidth_in: inputs.axle1TireWidth,
      axle1TireLength_in: inputs.axle1TireLength,
      axle2TireWidth_in: inputs.axle2TireWidth,
      axle2TireLength_in: inputs.axle2TireLength,
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
    axle1TireWidth_in: inputs.axle1TireWidth * 0.03937007874016, // mm -> in
    axle1TireLength_in: inputs.axle1TireLength * 0.03937007874016,
    axle2TireWidth_in: inputs.axle2TireWidth * 0.03937007874016,
    axle2TireLength_in: inputs.axle2TireLength * 0.03937007874016,
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
  
  // Calculate tire contact dimensions if AUTO mode (per-axle)
  let axle1TireWidth_in = inputsEN.axle1TireWidth_in;
  let axle1TireLength_in = inputsEN.axle1TireLength_in;
  let axle2TireWidth_in = inputsEN.axle2TireWidth_in;
  let axle2TireLength_in = inputsEN.axle2TireLength_in;
  
  if (inputs.contactPatchMode === 'AUTO') {
    // Axle 1 - calculate contact patch using tire pressure unit conversion
    if (inputs.axle1TirePressure && inputs.axle1TiresPerAxle) {
      // Convert tire pressure to psi using selected unit
      const tirePressure1_psi = convertTirePressureToPsi(
        inputs.axle1TirePressure,
        inputs.axle1TirePressureUnit || 'kPa'
      );
      const patch1 = calculateContactPatch(
        inputsEN.axle1Load_lb,
        tirePressure1_psi,
        inputs.axle1TiresPerAxle,
        axle1TireWidth_in
      );
      axle1TireLength_in = patch1.contactLength_in;
    }
    
    // Axle 2 - calculate contact patch using tire pressure unit conversion
    if (inputs.axle2TirePressure && inputs.axle2TiresPerAxle) {
      const tirePressure2_psi = convertTirePressureToPsi(
        inputs.axle2TirePressure,
        inputs.axle2TirePressureUnit || 'kPa'
      );
      const patch2 = calculateContactPatch(
        inputsEN.axle2Load_lb,
        tirePressure2_psi,
        inputs.axle2TiresPerAxle,
        axle2TireWidth_in
      );
      axle2TireLength_in = patch2.contactLength_in;
    }
  }
  
  // Generate point loads for both axles - separate left/right grids
  const pointLoads: PointLoad[] = [];
  const halfAxleWidth_in = inputsEN.axleWidth_in / 2;
  const laneOffset_in = inputsEN.laneOffset_ft * 12;
  
  // Determine contact width per side based on Single (2 tires) or Dual (4 tires)
  // Single = 1 tire per side → tireWidth
  // Dual = 2 tires per side (jumelés) → tireWidth * 2
  const axle1WidthPerSide = (inputs.axle1TiresPerAxle || 2) === 4 ? axle1TireWidth_in * 2 : axle1TireWidth_in;
  const axle2WidthPerSide = (inputs.axle2TiresPerAxle || 2) === 4 ? axle2TireWidth_in * 2 : axle2TireWidth_in;
  
  // Axle 1 (front) - left and right tire patches
  const axle1_Y = -inputsEN.axleSpacing_ft * 12 / 2;
  const axle1LeftLoads = generateRectangularGrid(
    laneOffset_in - halfAxleWidth_in, // left tire center
    axle1_Y,
    axle1WidthPerSide,
    axle1TireLength_in,
    inputsEN.axle1Load_lb / 2, // half the axle load
    6
  );
  const axle1RightLoads = generateRectangularGrid(
    laneOffset_in + halfAxleWidth_in, // right tire center
    axle1_Y,
    axle1WidthPerSide,
    axle1TireLength_in,
    inputsEN.axle1Load_lb / 2,
    6
  );
  
  // Axle 2 (rear) - left and right tire patches
  const axle2_Y = inputsEN.axleSpacing_ft * 12 / 2;
  const axle2LeftLoads = generateRectangularGrid(
    laneOffset_in - halfAxleWidth_in,
    axle2_Y,
    axle2WidthPerSide,
    axle2TireLength_in,
    inputsEN.axle2Load_lb / 2,
    6
  );
  const axle2RightLoads = generateRectangularGrid(
    laneOffset_in + halfAxleWidth_in,
    axle2_Y,
    axle2WidthPerSide,
    axle2TireLength_in,
    inputsEN.axle2Load_lb / 2,
    6
  );
  
  pointLoads.push(...axle1LeftLoads, ...axle1RightLoads, ...axle2LeftLoads, ...axle2RightLoads);
  
  // Measurement points - scan along pipeline to find true max pressure
  const measurementPoints = generatePipeScanMeasurementPoints(
    laneOffset_in,
    [axle1_Y, axle2_Y]
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
    boussinesq.maxPressure_psi,
    impactResult.impactFactorDepth,
    inputsEN.D_in,
    inputsEN.t_in,
    inputsEN.H_ft,
    bedding.Theta,
    ePrime.ePrime_psi
  );
  
  const longMOP = calculateLongitudinalLiveStress(
    stressMOP.hoopLive,
    boussinesq.maxPressure_psi,
    impactResult.impactFactorDepth,
    inputsEN.D_in,
    inputsEN.t_in,
    inputsEN.H_ft,
    bedding.Theta,
    ePrime.ePrime_psi
  );
  
  // Thermal stress
  const E = 30e6;
  const Alpha = 6.5e-6;
  const longTherm_psi = E * Alpha * inputsEN.deltaT_F;
  
  // Combine stresses (VBA-conformant formulas)
  // Hoop High = soil + live (+ internal at MOP)
  // Hoop Low = internal - soil - live (VBA: HoopZeroLow = 0 - HoopSoil - HoopLive)
  const hoopZeroHigh = stressZero.hoopSoil + stressZero.hoopLive;
  const hoopZeroLow = -stressZero.hoopSoil - stressZero.hoopLive;
  const hoopMOPHigh = stressMOP.hoopSoil + stressMOP.hoopLive + stressMOP.hoopInt;
  const hoopMOPLow = stressMOP.hoopInt - stressMOP.hoopSoil - stressMOP.hoopLive;
  
  const Poisson = 0.3;
  // Longitudinal High = Poisson*hoopSoil + longLive + Poisson*hoopInt + thermal
  // Longitudinal Low = Poisson*hoopInt + thermal - Poisson*hoopSoil - longLive (VBA formula)
  const longZeroHigh = Poisson * stressZero.hoopSoil + longZero.longLive + longTherm_psi;
  const longZeroLow = longTherm_psi - Poisson * stressZero.hoopSoil - longZero.longLive;
  const longMOPHigh = Poisson * stressMOP.hoopSoil + longMOP.longLive + Poisson * stressMOP.hoopInt + longTherm_psi;
  const longMOPLow = Poisson * stressMOP.hoopInt + longTherm_psi - Poisson * stressMOP.hoopSoil - longMOP.longLive;
  
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
  
  // B31.4 sustained longitudinal check (if applicable)
  const longInt_Zero = 0;
  const longInt_MOP = Poisson * stressMOP.hoopInt;
  const longSoil_Zero = Poisson * stressZero.hoopSoil;
  const longSoil_MOP = Poisson * stressMOP.hoopSoil;
  
  let sustainedLongMaxPct = 0;
  if (inputs.codeCheck === 'B31_4') {
    // B31.4 sustained check: |internal ± earth + thermal|
    const sustainedZeroHigh = Math.abs(longInt_Zero + longSoil_Zero + longTherm_psi);
    const sustainedZeroLow = Math.abs(longInt_Zero - longSoil_Zero + longTherm_psi);
    const sustainedMOPHigh = Math.abs(longInt_MOP + longSoil_MOP + longTherm_psi);
    const sustainedMOPLow = Math.abs(longInt_MOP - longSoil_MOP + longTherm_psi);
    
    const sustainedMax = Math.max(sustainedZeroHigh, sustainedZeroLow, sustainedMOPHigh, sustainedMOPLow);
    sustainedLongMaxPct = (sustainedMax / inputsEN.SMYS_psi) * 100;
  }
  
  // Pass/Fail
  const hoopMaxPct = Math.max(Math.abs(hoopZeroHigh), Math.abs(hoopMOPHigh)) / inputsEN.SMYS_psi * 100;
  const longMaxPct = Math.max(
    Math.abs(longZeroHigh), 
    Math.abs(longMOPHigh),
    sustainedLongMaxPct
  ) / inputsEN.SMYS_psi * 100;
  // pctSMYS already returns percentage (0-100)
  const equivMaxPct = Math.max(equivZero.pctSMYS, equivMOP.pctSMYS);
  
  const passFailResult = calculatePassFailHelper(
    inputs.codeCheck,
    inputs.userDefinedLimits,
    hoopMaxPct,
    longMaxPct,
    equivMaxPct
  );
  
  // Deflection ratio (simplified)
  const deflectionRatio = (soilLoad.Psoil_psi + BsnqIF) * Math.pow(inputsEN.D_in / inputsEN.t_in, 3) / ePrime.ePrime_psi;
  
  // Assemble results
  const results: TwoAxleResults = {
    maxSurfacePressureOnPipe: BsnqIF,
    locationMaxLoad: formatMaxLocationLabel(boussinesq.maxY_in, inputs.unitsSystem),
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
  
  // PE (CSA B137.4) flexible pipe checks
  if (isPePipe(inputs)) {
    results.peResults = computePeResults(inputs, {
      D_in: inputsEN.D_in,
      t_in: inputsEN.t_in,
      H_ft: inputsEN.H_ft,
      Psoil_psi: soilLoad.Psoil_psi,
      Plive_psi: BsnqIF,
      Pint_psi: inputsEN.Pint_psi,
      ePrime_psi: ePrime.ePrime_psi,
      Kb: bedding.Kb,
      unitsSystem: inputs.unitsSystem,
    });
  }
  // Convert all stress outputs to user units
  return {
    ...results,
    maxSurfacePressureOnPipe: convertPressureToUserUnits(results.maxSurfacePressureOnPipe, inputs.unitsSystem),
    allowableStress: convertPressureToUserUnits(results.allowableStress, inputs.unitsSystem),
    ePrimeUsed: convertPressureToUserUnits(results.ePrimeUsed, inputs.unitsSystem),
    soilLoadOnPipe: convertPressureToUserUnits(results.soilLoadOnPipe, inputs.unitsSystem),
    stresses: {
      atZeroPressure: {
        hoop: {
          high: convertPressureToUserUnits(results.stresses.atZeroPressure.hoop.high, inputs.unitsSystem),
          low: convertPressureToUserUnits(results.stresses.atZeroPressure.hoop.low, inputs.unitsSystem),
          components: {
            pressure: convertPressureToUserUnits(results.stresses.atZeroPressure.hoop.components.pressure, inputs.unitsSystem),
            earth: convertPressureToUserUnits(results.stresses.atZeroPressure.hoop.components.earth, inputs.unitsSystem),
            thermal: convertPressureToUserUnits(results.stresses.atZeroPressure.hoop.components.thermal, inputs.unitsSystem),
            total: convertPressureToUserUnits(results.stresses.atZeroPressure.hoop.components.total, inputs.unitsSystem),
          },
        },
        longitudinal: {
          high: convertPressureToUserUnits(results.stresses.atZeroPressure.longitudinal.high, inputs.unitsSystem),
          low: convertPressureToUserUnits(results.stresses.atZeroPressure.longitudinal.low, inputs.unitsSystem),
          components: {
            pressure: convertPressureToUserUnits(results.stresses.atZeroPressure.longitudinal.components.pressure, inputs.unitsSystem),
            earth: convertPressureToUserUnits(results.stresses.atZeroPressure.longitudinal.components.earth, inputs.unitsSystem),
            thermal: convertPressureToUserUnits(results.stresses.atZeroPressure.longitudinal.components.thermal, inputs.unitsSystem),
            total: convertPressureToUserUnits(results.stresses.atZeroPressure.longitudinal.components.total, inputs.unitsSystem),
          },
        },
        equivalent: {
          high: convertPressureToUserUnits(results.stresses.atZeroPressure.equivalent.high, inputs.unitsSystem),
          low: convertPressureToUserUnits(results.stresses.atZeroPressure.equivalent.low, inputs.unitsSystem),
          percentSMYS: results.stresses.atZeroPressure.equivalent.percentSMYS,
        },
      },
      atMOP: {
        hoop: {
          high: convertPressureToUserUnits(results.stresses.atMOP.hoop.high, inputs.unitsSystem),
          low: convertPressureToUserUnits(results.stresses.atMOP.hoop.low, inputs.unitsSystem),
          components: {
            pressure: convertPressureToUserUnits(results.stresses.atMOP.hoop.components.pressure, inputs.unitsSystem),
            earth: convertPressureToUserUnits(results.stresses.atMOP.hoop.components.earth, inputs.unitsSystem),
            thermal: convertPressureToUserUnits(results.stresses.atMOP.hoop.components.thermal, inputs.unitsSystem),
            total: convertPressureToUserUnits(results.stresses.atMOP.hoop.components.total, inputs.unitsSystem),
          },
        },
        longitudinal: {
          high: convertPressureToUserUnits(results.stresses.atMOP.longitudinal.high, inputs.unitsSystem),
          low: convertPressureToUserUnits(results.stresses.atMOP.longitudinal.low, inputs.unitsSystem),
          components: {
            pressure: convertPressureToUserUnits(results.stresses.atMOP.longitudinal.components.pressure, inputs.unitsSystem),
            earth: convertPressureToUserUnits(results.stresses.atMOP.longitudinal.components.earth, inputs.unitsSystem),
            thermal: convertPressureToUserUnits(results.stresses.atMOP.longitudinal.components.thermal, inputs.unitsSystem),
            total: convertPressureToUserUnits(results.stresses.atMOP.longitudinal.components.total, inputs.unitsSystem),
          },
        },
        equivalent: {
          high: convertPressureToUserUnits(results.stresses.atMOP.equivalent.high, inputs.unitsSystem),
          low: convertPressureToUserUnits(results.stresses.atMOP.equivalent.low, inputs.unitsSystem),
          percentSMYS: results.stresses.atMOP.equivalent.percentSMYS,
        },
      },
    },
    debug: {
      ...results.debug,
      soilPressure_psi: convertPressureToUserUnits(results.debug.soilPressure_psi, inputs.unitsSystem),
      boussinesqMax_psi: convertPressureToUserUnits(results.debug.boussinesqMax_psi, inputs.unitsSystem),
      ePrime_psi: convertPressureToUserUnits(results.debug.ePrime_psi, inputs.unitsSystem),
      hoopSoil_psi: convertPressureToUserUnits(results.debug.hoopSoil_psi, inputs.unitsSystem),
      hoopLive_psi: convertPressureToUserUnits(results.debug.hoopLive_psi, inputs.unitsSystem),
      hoopInt_psi: convertPressureToUserUnits(results.debug.hoopInt_psi, inputs.unitsSystem),
      longSoil_psi: convertPressureToUserUnits(results.debug.longSoil_psi, inputs.unitsSystem),
      longLive_psi: convertPressureToUserUnits(results.debug.longLive_psi, inputs.unitsSystem),
      longInt_psi: convertPressureToUserUnits(results.debug.longInt_psi, inputs.unitsSystem),
      longTherm_psi: convertPressureToUserUnits(results.debug.longTherm_psi, inputs.unitsSystem),
    },
    bendRadius: inputs.enableBendRadius ? calculateMinBendRadius({
      D_in: inputsEN.D_in,
      longHighZero_psi: longZeroHigh,
      longHighMOP_psi: longMOPHigh,
      longAllowable_psi: (passFailResult.limitsUsed.longLimitPct / 100) * inputsEN.SMYS_psi,
      unitsSystem: inputs.unitsSystem,
    }) : undefined,
  };
}
