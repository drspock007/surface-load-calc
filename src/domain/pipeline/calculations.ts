import {
  PipelineTrackInputs,
  PipelineTrackResults,
  SoilType,
  Compaction,
  StressResults,
  PassFailSummary,
} from './types';
import { convertInputsToEN, convertOutputsFromEN } from './unitConversions';

// E' lookup table (psi) based on soil type and compaction
const E_PRIME_LOOKUP: Record<SoilType, Record<Compaction, number>> = {
  FINE: {
    80: 500,
    85: 700,
    90: 1000,
    95: 1500,
    100: 2000,
  },
  COARSE_WITH_FINES: {
    80: 1000,
    85: 1500,
    90: 2000,
    95: 2500,
    100: 3000,
  },
  COARSE_NO_FINES: {
    80: 1500,
    85: 2000,
    90: 2500,
    95: 3000,
    100: 3500,
  },
};

// Impact factors by pavement type and vehicle class
const IMPACT_FACTORS: Record<string, Record<string, number>> = {
  RIGID: {
    HIGHWAY: 1.5,
    FARM: 1.75,
    TRACK: 1.0,
  },
  FLEXIBLE: {
    HIGHWAY: 1.5,
    FARM: 1.75,
    TRACK: 1.0,
  },
};

// Code allowable stress factors (fraction of SMYS)
const CODE_ALLOWABLE_FACTORS: Record<string, number> = {
  B31_4: 0.9,
  B31_8: 0.9,
  CSA_Z662: 0.9,
};

/**
 * Get E' (modulus of soil reaction) in psi
 */
function getEPrime(inputs: PipelineTrackInputs): number {
  if (inputs.ePrimeMethod === 'USER_DEFINED' && inputs.ePrimeUserDefined) {
    return convertInputsToEN(inputs.ePrimeUserDefined, inputs.unitsSystem, 'pressure');
  }
  
  if (inputs.ePrimeMethod === 'LOOKUP' && inputs.soilType && inputs.compaction) {
    return E_PRIME_LOOKUP[inputs.soilType][inputs.compaction];
  }
  
  // Default fallback
  return 1000;
}

/**
 * Calculate soil load on pipe using Prism or Trap Door method
 * Returns load in lb/ft
 */
function calculateSoilLoad(inputs: PipelineTrackInputs, D_in: number, H_ft: number, gamma_lbft3: number): number {
  const D_ft = D_in / 12;
  
  if (inputs.soilLoadMethod === 'PRISM') {
    // Prism method: W = gamma * H * D
    return gamma_lbft3 * H_ft * D_ft;
  } else {
    // Trap Door method (simplified)
    const phi = inputs.frictionAngleDeg * Math.PI / 180;
    const K = (1 - Math.sin(phi)) / (1 + Math.sin(phi));
    const cohesion_psf = convertInputsToEN(inputs.soilCohesion, inputs.unitsSystem, 'pressure') * 144;
    
    const trapDoorFactor = 1 - Math.exp(-K * H_ft / D_ft);
    return gamma_lbft3 * D_ft * trapDoorFactor * (H_ft - cohesion_psf / gamma_lbft3);
  }
}

/**
 * Calculate maximum surface pressure using Boussinesq theory
 * Returns pressure in psi
 */
function calculateBoussinesqPressure(
  trackWeight_lb: number,
  trackLength_in: number,
  trackWidth_in: number,
  trackSeparation_in: number,
  depth_ft: number
): { maxPressure: number; location: string } {
  // Convert to feet
  const L_ft = trackLength_in / 12;
  const W_ft = trackWidth_in / 12;
  const S_ft = trackSeparation_in / 12;
  const Z_ft = depth_ft;
  
  // Contact pressure
  const contactArea_ft2 = L_ft * W_ft;
  const contactPressure_psf = (trackWeight_lb / 2) / contactArea_ft2; // divide by 2 for each track
  
  // Simplified Boussinesq for rectangular area
  // Maximum occurs directly under center of track or between tracks
  
  // Influence factor (simplified)
  const influenceFactor = 1 / (1 + Math.pow(Z_ft / Math.sqrt(contactArea_ft2), 2));
  
  // Check center between tracks
  const betweenTracksInfluence = 2 * influenceFactor; // both tracks contribute
  
  // Maximum pressure
  const maxPressure_psf = contactPressure_psf * betweenTracksInfluence;
  const maxPressure_psi = maxPressure_psf / 144;
  
  const location = trackSeparation_in < 2 * trackWidth_in 
    ? "Between tracks (overlapping influence)"
    : "Under track centerline";
  
  return { maxPressure: maxPressure_psi, location };
}

/**
 * Calculate pipe deflection ratio
 */
function calculateDeflection(
  soilLoad_lbft: number,
  surfaceLoad_psi: number,
  D_in: number,
  E_prime_psi: number,
  beddingAngle: number
): number {
  // Convert surface load to lb/in
  const surfaceLoad_lbin = surfaceLoad_psi * D_in;
  
  // Bedding coefficient
  const Kb = 0.1 + 0.9 * (beddingAngle / 180);
  
  // Total load
  const totalLoad_lbin = (soilLoad_lbft / 12) + surfaceLoad_lbin;
  
  // Deflection ratio (simplified Iowa formula)
  const deflectionRatio = (Kb * totalLoad_lbin) / (E_prime_psi * D_in);
  
  return deflectionRatio;
}

/**
 * Calculate stress components
 */
function calculateStresses(
  inputs: PipelineTrackInputs,
  D_in: number,
  t_in: number,
  Pint_psi: number,
  deflectionRatio: number,
  deltaT: number,
  kr: number
): StressResults {
  // Hoop stress from internal pressure
  const hoopPressure = (Pint_psi * D_in) / (2 * t_in);
  
  // Hoop stress from deflection (bending)
  const E_steel = 29e6; // psi
  const hoopEarth = E_steel * deflectionRatio / 2;
  
  // Thermal stress (hoop)
  const alpha = 6.5e-6; // 1/°F
  const poisson = 0.3;
  const hoopThermal = -E_steel * alpha * deltaT / (1 - poisson);
  
  // Longitudinal stress from internal pressure
  const longPressure = (Pint_psi * D_in) / (4 * t_in);
  
  // Longitudinal stress from earth load (simplified)
  const longEarth = -kr * hoopEarth;
  
  // Longitudinal thermal stress
  const longThermal = -E_steel * alpha * deltaT;
  
  // Calculate at zero pressure
  const atZero = {
    hoop: {
      high: hoopEarth + hoopThermal,
      low: -hoopEarth + hoopThermal,
      components: {
        pressure: 0,
        earth: hoopEarth,
        thermal: hoopThermal,
        total: hoopEarth + hoopThermal,
      },
    },
    longitudinal: {
      high: longEarth + longThermal,
      low: longEarth + longThermal,
      components: {
        pressure: 0,
        earth: longEarth,
        thermal: longThermal,
        total: longEarth + longThermal,
      },
    },
    equivalent: {
      high: 0,
      low: 0,
      percentSMYS: 0,
    },
  };
  
  // Calculate at MOP
  const atMOP = {
    hoop: {
      high: hoopPressure + hoopEarth + hoopThermal,
      low: hoopPressure - hoopEarth + hoopThermal,
      components: {
        pressure: hoopPressure,
        earth: hoopEarth,
        thermal: hoopThermal,
        total: hoopPressure + hoopEarth + hoopThermal,
      },
    },
    longitudinal: {
      high: longPressure + longEarth + longThermal,
      low: longPressure + longEarth + longThermal,
      components: {
        pressure: longPressure,
        earth: longEarth,
        thermal: longThermal,
        total: longPressure + longEarth + longThermal,
      },
    },
    equivalent: {
      high: 0,
      low: 0,
      percentSMYS: 0,
    },
  };
  
  // Calculate equivalent stresses
  const SMYS_psi = convertInputsToEN(inputs.SMYS, inputs.unitsSystem, 'pressure');
  
  if (inputs.equivStressMethod === 'VON_MISES') {
    // Von Mises at zero
    atZero.equivalent.high = Math.sqrt(
      Math.pow(atZero.hoop.high, 2) + 
      Math.pow(atZero.longitudinal.high, 2) - 
      atZero.hoop.high * atZero.longitudinal.high
    );
    atZero.equivalent.low = Math.sqrt(
      Math.pow(atZero.hoop.low, 2) + 
      Math.pow(atZero.longitudinal.low, 2) - 
      atZero.hoop.low * atZero.longitudinal.low
    );
    atZero.equivalent.percentSMYS = (Math.max(atZero.equivalent.high, atZero.equivalent.low) / SMYS_psi) * 100;
    
    // Von Mises at MOP
    atMOP.equivalent.high = Math.sqrt(
      Math.pow(atMOP.hoop.high, 2) + 
      Math.pow(atMOP.longitudinal.high, 2) - 
      atMOP.hoop.high * atMOP.longitudinal.high
    );
    atMOP.equivalent.low = Math.sqrt(
      Math.pow(atMOP.hoop.low, 2) + 
      Math.pow(atMOP.longitudinal.low, 2) - 
      atMOP.hoop.low * atMOP.longitudinal.low
    );
    atMOP.equivalent.percentSMYS = (Math.max(atMOP.equivalent.high, atMOP.equivalent.low) / SMYS_psi) * 100;
  } else {
    // Tresca
    atZero.equivalent.high = Math.abs(atZero.hoop.high - atZero.longitudinal.high);
    atZero.equivalent.low = Math.abs(atZero.hoop.low - atZero.longitudinal.low);
    atZero.equivalent.percentSMYS = (Math.max(atZero.equivalent.high, atZero.equivalent.low) / SMYS_psi) * 100;
    
    atMOP.equivalent.high = Math.abs(atMOP.hoop.high - atMOP.longitudinal.high);
    atMOP.equivalent.low = Math.abs(atMOP.hoop.low - atMOP.longitudinal.low);
    atMOP.equivalent.percentSMYS = (Math.max(atMOP.equivalent.high, atMOP.equivalent.low) / SMYS_psi) * 100;
  }
  
  return { atZeroPressure: atZero, atMOP };
}

/**
 * Main calculation function
 */
export function calculatePipelineTrack(inputs: PipelineTrackInputs): PipelineTrackResults {
  // Convert all inputs to ENGLISH units (internal calculation)
  const D_in = convertInputsToEN(inputs.pipeOD, inputs.unitsSystem, 'length');
  const t_in = convertInputsToEN(inputs.pipeWT, inputs.unitsSystem, 'length');
  const Pint_psi = convertInputsToEN(inputs.MOP, inputs.unitsSystem, 'pressure');
  const SMYS_psi = convertInputsToEN(inputs.SMYS, inputs.unitsSystem, 'pressure');
  const H_ft = convertInputsToEN(inputs.depthCover, inputs.unitsSystem, 'depth');
  const gamma_lbft3 = convertInputsToEN(inputs.soilDensity, inputs.unitsSystem, 'density');
  const trackWeight_lb = convertInputsToEN(inputs.trackVehicleWeight, inputs.unitsSystem, 'force');
  const trackLength_in = convertInputsToEN(inputs.trackLength, inputs.unitsSystem, 'length');
  const trackWidth_in = convertInputsToEN(inputs.trackWidth, inputs.unitsSystem, 'length');
  const trackSeparation_in = convertInputsToEN(inputs.trackSeparation, inputs.unitsSystem, 'length');
  
  // Get E'
  const E_prime_psi = getEPrime(inputs);
  
  // Calculate soil load
  const soilLoad_lbft = calculateSoilLoad(inputs, D_in, H_ft, gamma_lbft3);
  
  // Calculate Boussinesq surface pressure
  const { maxPressure: boussinesqPressure_psi, location } = calculateBoussinesqPressure(
    trackWeight_lb,
    trackLength_in,
    trackWidth_in,
    trackSeparation_in,
    H_ft
  );
  
  // Apply impact factor
  const impactFactor = IMPACT_FACTORS[inputs.pavementType][inputs.vehicleClass];
  const maxSurfacePressure_psi = boussinesqPressure_psi * impactFactor;
  
  // Calculate deflection
  const deflectionRatio = calculateDeflection(
    soilLoad_lbft,
    maxSurfacePressure_psi,
    D_in,
    E_prime_psi,
    inputs.beddingAngleDeg
  );
  
  // Calculate stresses at zero and MOP
  const stresses = calculateStresses(
    inputs,
    D_in,
    t_in,
    0, // zero pressure
    deflectionRatio,
    inputs.deltaT,
    inputs.kr
  );
  
  const stressesAtMOP = calculateStresses(
    inputs,
    D_in,
    t_in,
    Pint_psi,
    deflectionRatio,
    inputs.deltaT,
    inputs.kr
  );
  
  // Combine results
  const finalStresses: StressResults = {
    atZeroPressure: stresses.atZeroPressure,
    atMOP: stressesAtMOP.atMOP,
  };
  
  // Determine allowable stress
  let allowableStress_psi: number;
  if (inputs.codeCheck === 'USER_DEFINED' && inputs.userDefinedStressLimit) {
    allowableStress_psi = convertInputsToEN(inputs.userDefinedStressLimit, inputs.unitsSystem, 'pressure');
  } else {
    const factor = CODE_ALLOWABLE_FACTORS[inputs.codeCheck];
    allowableStress_psi = factor * SMYS_psi;
  }
  
  // Pass/Fail evaluation
  const passFailSummary: PassFailSummary = {
    hoopAtZero: Math.abs(finalStresses.atZeroPressure.hoop.high) <= allowableStress_psi &&
                Math.abs(finalStresses.atZeroPressure.hoop.low) <= allowableStress_psi,
    hoopAtMOP: Math.abs(finalStresses.atMOP.hoop.high) <= allowableStress_psi &&
               Math.abs(finalStresses.atMOP.hoop.low) <= allowableStress_psi,
    longitudinalAtZero: Math.abs(finalStresses.atZeroPressure.longitudinal.high) <= allowableStress_psi &&
                        Math.abs(finalStresses.atZeroPressure.longitudinal.low) <= allowableStress_psi,
    longitudinalAtMOP: Math.abs(finalStresses.atMOP.longitudinal.high) <= allowableStress_psi &&
                       Math.abs(finalStresses.atMOP.longitudinal.low) <= allowableStress_psi,
    equivalentAtZero: finalStresses.atZeroPressure.equivalent.percentSMYS <= 90,
    equivalentAtMOP: finalStresses.atMOP.equivalent.percentSMYS <= 90,
    overallPass: false,
  };
  
  passFailSummary.overallPass = 
    passFailSummary.hoopAtZero &&
    passFailSummary.hoopAtMOP &&
    passFailSummary.longitudinalAtZero &&
    passFailSummary.longitudinalAtMOP &&
    passFailSummary.equivalentAtZero &&
    passFailSummary.equivalentAtMOP;
  
  // Convert outputs back to user's unit system
  const outputSystem = inputs.unitsSystem;
  
  return {
    maxSurfacePressureOnPipe: convertOutputsFromEN(maxSurfacePressure_psi, outputSystem, 'pressure'),
    locationMaxLoad: location,
    impactFactorUsed: impactFactor,
    stresses: finalStresses,
    allowableStress: convertOutputsFromEN(allowableStress_psi, outputSystem, 'pressure'),
    passFailSummary,
    ePrimeUsed: convertOutputsFromEN(E_prime_psi, outputSystem, 'pressure'),
    soilLoadOnPipe: soilLoad_lbft, // keeping in EN for now
    deflectionRatio: deflectionRatio,
  };
}
