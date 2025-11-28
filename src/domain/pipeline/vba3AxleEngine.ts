/**
 * VBA 3-Axle Vehicle Engine
 * Calculates stresses from a 3-axle vehicle load
 */

import { ThreeAxleInputs, ThreeAxleResults } from './types3Axle';
import { calculatePassFail as calculatePassFailHelper } from './passFailHelpers';
import { 
  calculateBoussinesqFromPoints, 
  generateRectangularGrid, 
  generateStandardMeasurementPoints,
  PointLoad 
} from './boussinesqHelpers';
import { calculateContactPatch, convertContactPatchToEN } from './tirePatchCalculations';
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

function convertInputsToEN(inputs: ThreeAxleInputs): any {
  const isMetric = inputs.unitsSystem === 'SI';
  
  if (!isMetric) {
    return {
      ...inputs,
      axle1To2Spacing_ft: inputs.axle1To2Spacing,
      axle2To3Spacing_ft: inputs.axle2To3Spacing,
      axle1Load_lb: inputs.axle1Load,
      axle2Load_lb: inputs.axle2Load,
      axle3Load_lb: inputs.axle3Load,
      axle1TireWidth_in: inputs.axle1TireWidth,
      axle1TireLength_in: inputs.axle1TireLength,
      axle2TireWidth_in: inputs.axle2TireWidth,
      axle2TireLength_in: inputs.axle2TireLength,
      axle3TireWidth_in: inputs.axle3TireWidth,
      axle3TireLength_in: inputs.axle3TireLength,
      axleWidth_in: inputs.axleWidth,
      laneOffset_ft: inputs.laneOffset,
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
  
  return {
    ...inputs,
    axle1To2Spacing_ft: inputs.axle1To2Spacing * 3.280839895013,
    axle2To3Spacing_ft: inputs.axle2To3Spacing * 3.280839895013,
    axle1Load_lb: inputs.axle1Load * 2.2046226218,
    axle2Load_lb: inputs.axle2Load * 2.2046226218,
    axle3Load_lb: inputs.axle3Load * 2.2046226218,
    axle1TireWidth_in: inputs.axle1TireWidth * 0.03937007874016,
    axle1TireLength_in: inputs.axle1TireLength * 0.03937007874016,
    axle2TireWidth_in: inputs.axle2TireWidth * 0.03937007874016,
    axle2TireLength_in: inputs.axle2TireLength * 0.03937007874016,
    axle3TireWidth_in: inputs.axle3TireWidth * 0.03937007874016,
    axle3TireLength_in: inputs.axle3TireLength * 0.03937007874016,
    axleWidth_in: inputs.axleWidth * 0.03937007874016,
    laneOffset_ft: inputs.laneOffset * 3.280839895013,
    D_in: inputs.pipeOD * 0.03937007874016,
    t_in: inputs.pipeWT * 0.03937007874016,
    Pint_psi: inputs.MOP * 0.1450378911491,
    SMYS_psi: inputs.SMYS * 145.0378911491,
    deltaT_F: inputs.deltaT * 9 / 5,
    Rho_lbft3: inputs.soilDensity * 0.062427960576,
    H_ft: inputs.depthCover * 3.280839895013,
    Eprime_psi: inputs.ePrimeUserDefined ? inputs.ePrimeUserDefined * 0.1450378911491 : undefined,
  };
}

export function calculate3AxleVehicleVBA(inputs: ThreeAxleInputs): ThreeAxleResults {
  const inputsEN = convertInputsToEN(inputs);
  
  // Calculate tire contact dimensions if AUTO mode (per-axle)
  let axle1TireWidth_in = inputsEN.axle1TireWidth_in;
  let axle1TireLength_in = inputsEN.axle1TireLength_in;
  let axle2TireWidth_in = inputsEN.axle2TireWidth_in;
  let axle2TireLength_in = inputsEN.axle2TireLength_in;
  let axle3TireWidth_in = inputsEN.axle3TireWidth_in;
  let axle3TireLength_in = inputsEN.axle3TireLength_in;
  
  if (inputs.contactPatchMode === 'AUTO') {
    // Axle 1 - calculate contact patch
    if (inputs.axle1TirePressure && inputs.axle1TiresPerAxle) {
      const patch1 = inputs.unitsSystem === 'SI'
        ? convertContactPatchToEN(
            inputs.axle1Load,
            inputs.axle1TirePressure,
            inputs.axle1TiresPerAxle,
            inputs.axle1TireWidth
          )
        : calculateContactPatch(
            inputsEN.axle1Load_lb,
            inputs.axle1TirePressure,
            inputs.axle1TiresPerAxle,
            inputs.axle1TireWidth
          );
      axle1TireLength_in = patch1.contactLength_in;
    }
    
    // Axle 2 - calculate contact patch
    if (inputs.axle2TirePressure && inputs.axle2TiresPerAxle) {
      const patch2 = inputs.unitsSystem === 'SI'
        ? convertContactPatchToEN(
            inputs.axle2Load,
            inputs.axle2TirePressure,
            inputs.axle2TiresPerAxle,
            inputs.axle2TireWidth
          )
        : calculateContactPatch(
            inputsEN.axle2Load_lb,
            inputs.axle2TirePressure,
            inputs.axle2TiresPerAxle,
            inputs.axle2TireWidth
          );
      axle2TireLength_in = patch2.contactLength_in;
    }
    
    // Axle 3 - calculate contact patch
    if (inputs.axle3TirePressure && inputs.axle3TiresPerAxle) {
      const patch3 = inputs.unitsSystem === 'SI'
        ? convertContactPatchToEN(
            inputs.axle3Load,
            inputs.axle3TirePressure,
            inputs.axle3TiresPerAxle,
            inputs.axle3TireWidth
          )
        : calculateContactPatch(
            inputsEN.axle3Load_lb,
            inputs.axle3TirePressure,
            inputs.axle3TiresPerAxle,
            inputs.axle3TireWidth
          );
      axle3TireLength_in = patch3.contactLength_in;
    }
  }
  
  const pointLoads: PointLoad[] = [];
  
  // Axle 1 (front) - use axle-specific tire dimensions
  const axle1_Y = -(inputsEN.axle1To2Spacing_ft + inputsEN.axle2To3Spacing_ft) * 12 / 2;
  const axle1Loads = generateRectangularGrid(
    inputsEN.laneOffset_ft * 12,
    axle1_Y,
    axle1TireWidth_in * 2, // axle 1 specific
    axle1TireLength_in, // axle 1 specific
    inputsEN.axle1Load_lb,
    6
  );
  
  // Axle 2 (middle) - use axle-specific tire dimensions
  const axle2_Y = (inputsEN.axle2To3Spacing_ft - inputsEN.axle1To2Spacing_ft) * 12 / 2;
  const axle2Loads = generateRectangularGrid(
    inputsEN.laneOffset_ft * 12,
    axle2_Y,
    axle2TireWidth_in * 2, // axle 2 specific
    axle2TireLength_in, // axle 2 specific
    inputsEN.axle2Load_lb,
    6
  );
  
  // Axle 3 (rear) - use axle-specific tire dimensions
  const axle3_Y = (inputsEN.axle1To2Spacing_ft + inputsEN.axle2To3Spacing_ft) * 12 / 2;
  const axle3Loads = generateRectangularGrid(
    inputsEN.laneOffset_ft * 12,
    axle3_Y,
    axle3TireWidth_in * 2, // axle 3 specific
    axle3TireLength_in, // axle 3 specific
    inputsEN.axle3Load_lb,
    6
  );
  
  pointLoads.push(...axle1Loads, ...axle2Loads, ...axle3Loads);
  
  const measurementPoints = generateStandardMeasurementPoints(inputsEN.laneOffset_ft * 12, 0);
  const boussinesq = calculateBoussinesqFromPoints(pointLoads, measurementPoints, inputsEN.H_ft);
  const impactResult = calculateImpactFactor(inputs.vehicleClass, inputs.pavementType, inputsEN.H_ft);
  const BsnqIF = boussinesq.maxPressure_psi * impactResult.impactFactorDepth;
  
  const ePrime = calculateEPrime(inputs.ePrimeMethod, inputsEN.Eprime_psi, inputs.soilType, inputs.compaction, inputsEN.H_ft);
  const soilLoad = calculateSoilLoad(inputs.soilLoadMethod, inputsEN.Rho_lbft3, inputsEN.H_ft, inputsEN.D_in, inputs.frictionAngleDeg, inputs.soilCohesion);
  const bedding = calculateBeddingParams(inputs.beddingAngleDeg);
  
  const stressZero = calculateHoopStress(soilLoad.Psoil_psi, BsnqIF, 0, inputsEN.D_in, inputsEN.t_in, bedding.Kb, bedding.Kz, ePrime.ePrime_psi, inputs.kr);
  const stressMOP = calculateHoopStress(soilLoad.Psoil_psi, BsnqIF, inputsEN.Pint_psi, inputsEN.D_in, inputsEN.t_in, bedding.Kb, bedding.Kz, ePrime.ePrime_psi, inputs.kr);
  
  const longZero = calculateLongitudinalLiveStress(stressZero.hoopLive, BsnqIF, inputsEN.H_ft, inputsEN.D_in, inputsEN.t_in, ePrime.ePrime_psi, bedding.Theta, impactResult.impactFactorDepth);
  const longMOP = calculateLongitudinalLiveStress(stressMOP.hoopLive, BsnqIF, inputsEN.H_ft, inputsEN.D_in, inputsEN.t_in, ePrime.ePrime_psi, bedding.Theta, impactResult.impactFactorDepth);
  
  const E = 30e6;
  const Alpha = 6.5e-6;
  const Poisson = 0.3;
  const longTherm_psi = E * Alpha * inputsEN.deltaT_F;
  
  const hoopZeroHigh = stressZero.hoopSoil + stressZero.hoopLive;
  const hoopZeroLow = stressZero.hoopSoil;
  const hoopMOPHigh = stressMOP.hoopSoil + stressMOP.hoopLive + stressMOP.hoopInt;
  const hoopMOPLow = stressMOP.hoopSoil + stressMOP.hoopInt;
  
  const longZeroHigh = Poisson * stressZero.hoopSoil + longZero.longLive + longTherm_psi;
  const longZeroLow = Poisson * stressZero.hoopSoil + longTherm_psi;
  const longMOPHigh = Poisson * stressMOP.hoopSoil + longMOP.longLive + Poisson * stressMOP.hoopInt + longTherm_psi;
  const longMOPLow = Poisson * stressMOP.hoopSoil + Poisson * stressMOP.hoopInt + longTherm_psi;
  
  const equivZero = calculateEquivalentStress(inputs.equivStressMethod, hoopZeroHigh, hoopZeroLow, longZeroHigh, longZeroLow, inputsEN.SMYS_psi);
  const equivMOP = calculateEquivalentStress(inputs.equivStressMethod, hoopMOPHigh, hoopMOPLow, longMOPHigh, longMOPLow, inputsEN.SMYS_psi);
  
  // B31.4 sustained longitudinal check (if applicable)
  const longInt_Zero = 0;
  const longInt_MOP = Poisson * stressMOP.hoopInt;
  const longSoil_Zero = Poisson * stressZero.hoopSoil;
  const longSoil_MOP = Poisson * stressMOP.hoopSoil;
  
  let sustainedLongMaxPct = 0;
  if (inputs.codeCheck === 'B31_4') {
    const sustainedZeroHigh = Math.abs(longInt_Zero + longSoil_Zero + longTherm_psi);
    const sustainedZeroLow = Math.abs(longInt_Zero - longSoil_Zero + longTherm_psi);
    const sustainedMOPHigh = Math.abs(longInt_MOP + longSoil_MOP + longTherm_psi);
    const sustainedMOPLow = Math.abs(longInt_MOP - longSoil_MOP + longTherm_psi);
    
    const sustainedMax = Math.max(sustainedZeroHigh, sustainedZeroLow, sustainedMOPHigh, sustainedMOPLow);
    sustainedLongMaxPct = (sustainedMax / inputsEN.SMYS_psi) * 100;
  }
  
  const hoopMaxPct = Math.max(Math.abs(hoopZeroHigh), Math.abs(hoopMOPHigh)) / inputsEN.SMYS_psi * 100;
  const longMaxPct = Math.max(
    Math.abs(longZeroHigh), 
    Math.abs(longMOPHigh),
    sustainedLongMaxPct
  ) / inputsEN.SMYS_psi * 100;
  const equivMaxPct = Math.max(equivZero.pctSMYS, equivMOP.pctSMYS) * 100;
  
  const passFailResult = calculatePassFailHelper(
    inputs.codeCheck,
    inputs.userDefinedLimits,
    hoopMaxPct,
    longMaxPct,
    equivMaxPct
  );
  
  const deflectionRatio = (soilLoad.Psoil_psi + BsnqIF) * Math.pow(inputsEN.D_in / inputsEN.t_in, 3) / ePrime.ePrime_psi;
  
  const results: ThreeAxleResults = {
    maxSurfacePressureOnPipe: BsnqIF,
    locationMaxLoad: boussinesq.maxLocation,
    impactFactorUsed: impactResult.impactFactorDepth,
    stresses: {
      atZeroPressure: {
        hoop: {
          high: hoopZeroHigh,
          low: hoopZeroLow,
          components: { pressure: 0, earth: stressZero.hoopSoil, thermal: 0, total: hoopZeroHigh },
        },
        longitudinal: {
          high: longZeroHigh,
          low: longZeroLow,
          components: { pressure: 0, earth: Poisson * stressZero.hoopSoil, thermal: longTherm_psi, total: longZeroHigh },
        },
        equivalent: { high: equivZero.high, low: equivZero.low, percentSMYS: equivZero.pctSMYS },
      },
      atMOP: {
        hoop: {
          high: hoopMOPHigh,
          low: hoopMOPLow,
          components: { pressure: stressMOP.hoopInt, earth: stressMOP.hoopSoil, thermal: 0, total: hoopMOPHigh },
        },
        longitudinal: {
          high: longMOPHigh,
          low: longMOPLow,
          components: { pressure: Poisson * stressMOP.hoopInt, earth: Poisson * stressMOP.hoopSoil, thermal: longTherm_psi, total: longMOPHigh },
        },
        equivalent: { high: equivMOP.high, low: equivMOP.low, percentSMYS: equivMOP.pctSMYS },
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
  
  // Convert all outputs to user units
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
  };
}
