/**
 * VBA 3-Axle Vehicle Engine
 * Calculates stresses from a 3-axle vehicle load
 */

import { ThreeAxleInputs, ThreeAxleResults } from './types3Axle';
import { 
  calculateBoussinesqFromPoints, 
  generateRectangularGrid, 
  generateStandardMeasurementPoints,
  PointLoad 
} from './boussinesqHelpers';
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
      tireWidth_in: inputs.tireWidth,
      tireLength_in: inputs.tireLength,
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
    tireWidth_in: inputs.tireWidth * 0.03937007874016,
    tireLength_in: inputs.tireLength * 0.03937007874016,
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
  
  const pointLoads: PointLoad[] = [];
  
  // Axle 1 (front)
  const axle1_Y = -(inputsEN.axle1To2Spacing_ft + inputsEN.axle2To3Spacing_ft) * 12 / 2;
  const axle1Loads = generateRectangularGrid(
    inputsEN.laneOffset_ft * 12,
    axle1_Y,
    inputsEN.tireWidth_in * 2,
    inputsEN.tireLength_in,
    inputsEN.axle1Load_lb,
    6
  );
  
  // Axle 2 (middle)
  const axle2_Y = (inputsEN.axle2To3Spacing_ft - inputsEN.axle1To2Spacing_ft) * 12 / 2;
  const axle2Loads = generateRectangularGrid(
    inputsEN.laneOffset_ft * 12,
    axle2_Y,
    inputsEN.tireWidth_in * 2,
    inputsEN.tireLength_in,
    inputsEN.axle2Load_lb,
    6
  );
  
  // Axle 3 (rear)
  const axle3_Y = (inputsEN.axle1To2Spacing_ft + inputsEN.axle2To3Spacing_ft) * 12 / 2;
  const axle3Loads = generateRectangularGrid(
    inputsEN.laneOffset_ft * 12,
    axle3_Y,
    inputsEN.tireWidth_in * 2,
    inputsEN.tireLength_in,
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
  
  const passFailResult = calculatePassFail(inputs.codeCheck, inputs.userDefinedStressLimit, hoopZeroHigh, hoopMOPHigh, longZeroHigh, longMOPHigh, equivZero.pctSMYS, equivMOP.pctSMYS, inputsEN.SMYS_psi);
  
  const deflectionRatio = (soilLoad.Psoil_psi + BsnqIF) * Math.pow(inputsEN.D_in / inputsEN.t_in, 3) / ePrime.ePrime_psi;
  
  const results: ThreeAxleResults = {
    maxSurfacePressureOnPipe: convertPressureToUserUnits(BsnqIF, inputs.unitsSystem),
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
    allowableStress: passFailResult.allowableStress,
    passFailSummary: passFailResult.passFailSummary,
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
  
  return results;
}
