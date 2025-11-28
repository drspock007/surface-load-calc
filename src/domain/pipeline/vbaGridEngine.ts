/**
 * VBA Grid Load Engine
 * Calculates stresses from a uniform grid load
 */

import { GridLoadInputs, GridLoadResults } from './typesGrid';
import { calculatePassFail as calculatePassFailHelper } from './passFailHelpers';
import { 
  calculateBoussinesqFromPoints, 
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

function convertInputsToEN(inputs: GridLoadInputs): any {
  const isMetric = inputs.unitsSystem === 'SI';
  
  if (!isMetric) {
    return {
      ...inputs,
      totalLoad_lb: inputs.totalLoad,
      uniformPressure_psi: inputs.uniformPressure,
      gridLength_ft: inputs.gridLength,
      gridWidth_ft: inputs.gridWidth,
      gridOffsetX_ft: inputs.gridOffsetX,
      gridOffsetY_ft: inputs.gridOffsetY,
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
    totalLoad_lb: inputs.totalLoad ? inputs.totalLoad * 2.2046226218 : undefined,
    uniformPressure_psi: inputs.uniformPressure ? inputs.uniformPressure * 0.1450378911491 : undefined,
    gridLength_ft: inputs.gridLength * 3.280839895013,
    gridWidth_ft: inputs.gridWidth * 3.280839895013,
    gridOffsetX_ft: inputs.gridOffsetX * 3.280839895013,
    gridOffsetY_ft: inputs.gridOffsetY * 3.280839895013,
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

export function calculateGridLoadVBA(inputs: GridLoadInputs): GridLoadResults {
  const inputsEN = convertInputsToEN(inputs);
  
  // Determine total load based on input type
  let totalLoad_lb: number;
  if (inputs.loadType === 'TOTAL_LOAD' && inputsEN.totalLoad_lb) {
    totalLoad_lb = inputsEN.totalLoad_lb;
  } else if (inputs.loadType === 'UNIFORM_PRESSURE' && inputsEN.uniformPressure_psi) {
    const area_ft2 = inputsEN.gridLength_ft * inputsEN.gridWidth_ft;
    totalLoad_lb = inputsEN.uniformPressure_psi * area_ft2 * 144; // psi to psf, then to lb
  } else {
    throw new Error('Invalid load type or missing load value');
  }
  
  // Generate grid of point loads
  const pointLoads: PointLoad[] = [];
  const gridLength_in = inputsEN.gridLength_ft * 12;
  const gridWidth_in = inputsEN.gridWidth_ft * 12;
  const gridOffsetX_in = inputsEN.gridOffsetX_ft * 12;
  const gridOffsetY_in = inputsEN.gridOffsetY_ft * 12;
  
  const nX = inputs.gridDivisionsX;
  const nY = inputs.gridDivisionsY;
  const pointLoad_lb = totalLoad_lb / (nX * nY);
  
  const startX = gridOffsetX_in - gridWidth_in / 2;
  const startY = gridOffsetY_in - gridLength_in / 2;
  
  for (let iX = 0; iX < nX; iX++) {
    for (let iY = 0; iY < nY; iY++) {
      pointLoads.push({
        x: startX + (iX + 0.5) * (gridWidth_in / nX),
        y: startY + (iY + 0.5) * (gridLength_in / nY),
        load_lb: pointLoad_lb,
      });
    }
  }
  
  const measurementPoints = generateStandardMeasurementPoints(gridOffsetX_in, gridOffsetY_in);
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
  
  const results: GridLoadResults = {
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
