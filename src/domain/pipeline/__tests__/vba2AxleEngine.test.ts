import { describe, it, expect } from 'vitest';
import { calculate2AxleVehicleVBA } from '../vba2AxleEngine';
import { TwoAxleInputs } from '../types2Axle';

/**
 * 2-Axle Vehicle - Excel VBA Reference Comparison
 * 
 * Parameters from user-provided Excel screenshot:
 * Pipe: D=114.3mm, t=6.02mm, MOP=7070kPa, SMYS=359MPa, ΔT=65°C
 * Soil: γ=1600kg/m³, H=1.6m, bedding=30°, Prism, friction=30°
 * E': Lookup, Coarse with fines, 90% compaction
 * Vehicle: Farm (IF=1.25), 2 axles
 *   Axle 1: 36000 kg (front, Single=2 tires), Axle 2: 67000 kg (rear, Dual=4 tires)
 *   Spacing: 4.215m, Tire Width: 652mm, Tire Pressure: 71400 kg/m², AUTO mode
 *   Axle Width: 2929mm, Lane offset: 0
 * Analysis: Flexible pavement, Von Mises, CSA Z662
 */

const excelInputs: TwoAxleInputs = {
  unitsSystem: 'SI',
  calculationName: 'Excel VBA Reference - 2-Axle Farm Vehicle',

  // Pipe properties
  pipeOD: 114.3,       // mm
  pipeWT: 6.02,        // mm
  MOP: 7070,           // kPa
  SMYS: 359000,        // kPa (359 MPa)
  deltaT: 65,          // °C

  // Soil properties
  soilDensity: 1600,   // kg/m³
  depthCover: 1.6,     // m
  beddingAngleDeg: 30,
  soilLoadMethod: 'PRISM',
  frictionAngleDeg: 30,
  soilCohesion: 0,
  kr: 1,

  // E'
  ePrimeMethod: 'LOOKUP',
  soilType: 'COARSE_WITH_FINES',
  compaction: 90,

  // 2-Axle vehicle
  axleSpacing: 4.215,       // m
  axle1Load: 36000,         // kg (front)
  axle2Load: 67000,         // kg (rear)

  // Tire properties - AUTO mode
  contactPatchMode: 'AUTO',
  axle1TireWidth: 652,      // mm
  axle1TireLength: 0,       // calculated in AUTO
  axle1TirePressure: 71400, // kg/m²
  axle1TirePressureUnit: 'kg/m2',
  axle1TiresPerAxle: 2,     // Single (front)

  axle2TireWidth: 652,      // mm
  axle2TireLength: 0,       // calculated in AUTO
  axle2TirePressure: 71400, // kg/m²
  axle2TirePressureUnit: 'kg/m2',
  axle2TiresPerAxle: 4,     // Dual (rear)

  axleWidth: 2929,          // mm
  laneOffset: 0,            // m

  // Analysis
  pavementType: 'FLEXIBLE',
  vehicleClass: 'FARM',
  equivStressMethod: 'VON_MISES',
  codeCheck: 'CSA_Z662',
};

// Excel reference values (kPa)
const excelExpected = {
  sigma_H_Total_Zero: 23380,     // kPa
  sigma_H_Total_MOP: 88888,     // kPa
  sigma_L_Total_Zero: 207334,    // kPa
  sigma_L_Total_MOP: 226958,    // kPa
  sigma_E_Zero_VonMises: 219958, // kPa
  sigma_E_MOP_VonMises: 208025, // kPa
};

describe('2-Axle Engine - Excel VBA Reference Comparison', () => {
  const results = calculate2AxleVehicleVBA(excelInputs);

  const tolerance = 0.10; // 10%

  const withinTolerance = (actual: number, expected: number): boolean => {
    if (expected === 0) return Math.abs(actual) < 0.01;
    return Math.abs((actual - expected) / expected) <= tolerance;
  };

  const expectWithinTolerance = (actual: number, expected: number, name: string) => {
    const pctDiff = expected !== 0
      ? ((actual - expected) / expected * 100).toFixed(2)
      : 'N/A';
    expect(
      withinTolerance(actual, expected),
      `${name}: Expected ${expected}, got ${actual} (${pctDiff}% diff)`
    ).toBe(true);
  };

  // Log all results for debugging
  it('should log intermediate values for debugging', () => {
    console.log('=== 2-Axle Engine Debug Output ===');
    console.log('Impact Factor:', results.impactFactorUsed);
    console.log('E\' used (kPa):', results.ePrimeUsed);
    console.log('Soil load (kPa):', results.soilLoadOnPipe);
    console.log('Max surface pressure (kPa):', results.maxSurfacePressureOnPipe);
    console.log('--- Hoop Stress ---');
    console.log('  Zero: high=', results.stresses.atZeroPressure.hoop.high, 'low=', results.stresses.atZeroPressure.hoop.low);
    console.log('  MOP:  high=', results.stresses.atMOP.hoop.high, 'low=', results.stresses.atMOP.hoop.low);
    console.log('--- Longitudinal Stress ---');
    console.log('  Zero: high=', results.stresses.atZeroPressure.longitudinal.high, 'low=', results.stresses.atZeroPressure.longitudinal.low);
    console.log('  MOP:  high=', results.stresses.atMOP.longitudinal.high, 'low=', results.stresses.atMOP.longitudinal.low);
    console.log('--- Equivalent Stress (Von Mises) ---');
    console.log('  Zero: high=', results.stresses.atZeroPressure.equivalent.high, '%SMYS=', results.stresses.atZeroPressure.equivalent.percentSMYS);
    console.log('  MOP:  high=', results.stresses.atMOP.equivalent.high, '%SMYS=', results.stresses.atMOP.equivalent.percentSMYS);
    console.log('--- Debug ---');
    console.log('  boussinesqMax_psi:', results.debug.boussinesqMax_psi);
    console.log('  hoopSoil_psi:', results.debug.hoopSoil_psi);
    console.log('  hoopLive_psi:', results.debug.hoopLive_psi);
    console.log('  hoopInt_psi:', results.debug.hoopInt_psi);
    console.log('  longLive_psi:', results.debug.longLive_psi);
    console.log('  longTherm_psi:', results.debug.longTherm_psi);
    console.log('  Kb:', results.debug.Kb, 'Kz:', results.debug.Kz, 'Theta:', results.debug.Theta);
    expect(true).toBe(true);
  });

  describe('Hoop Stress', () => {
    it('σH_Total at zero pressure ≈ 23,380 kPa', () => {
      expectWithinTolerance(
        results.stresses.atZeroPressure.hoop.high,
        excelExpected.sigma_H_Total_Zero,
        'σH_Total_Zero'
      );
    });

    it('σH_Total at MOP ≈ 88,888 kPa', () => {
      expectWithinTolerance(
        results.stresses.atMOP.hoop.high,
        excelExpected.sigma_H_Total_MOP,
        'σH_Total_MOP'
      );
    });
  });

  describe('Longitudinal Stress', () => {
    it('σL_Total at zero pressure ≈ 207,334 kPa', () => {
      expectWithinTolerance(
        results.stresses.atZeroPressure.longitudinal.high,
        excelExpected.sigma_L_Total_Zero,
        'σL_Total_Zero'
      );
    });

    it('σL_Total at MOP ≈ 226,958 kPa', () => {
      expectWithinTolerance(
        results.stresses.atMOP.longitudinal.high,
        excelExpected.sigma_L_Total_MOP,
        'σL_Total_MOP'
      );
    });
  });

  describe('Equivalent Stress (Von Mises)', () => {
    it('σE at zero pressure ≈ 219,958 kPa', () => {
      expectWithinTolerance(
        results.stresses.atZeroPressure.equivalent.high,
        excelExpected.sigma_E_Zero_VonMises,
        'σE_Zero_VonMises'
      );
    });

    it('σE at MOP ≈ 208,025 kPa', () => {
      expectWithinTolerance(
        results.stresses.atMOP.equivalent.high,
        excelExpected.sigma_E_MOP_VonMises,
        'σE_MOP_VonMises'
      );
    });
  });

  describe('Impact Factor', () => {
    it('should use IF≈1.24 for Farm vehicle at H=1.6m', () => {
      // IF=1.25 base, depth=1.6m=62.99in > 60in → IF = 1.25 - 0.0025*(62.99-60) = 1.2425
      expect(results.impactFactorUsed).toBeCloseTo(1.2425, 1);
    });
  });

  describe('Results Structure', () => {
    it('should have complete stress results', () => {
      expect(results.stresses.atZeroPressure).toBeDefined();
      expect(results.stresses.atMOP).toBeDefined();
      expect(results.passFailSummary).toBeDefined();
      expect(results.debug).toBeDefined();
      expect(results.limitsUsed.code).toBe('CSA_Z662');
    });

    it('should have positive debug values', () => {
      expect(results.debug.ePrime_psi).toBeGreaterThan(0);
      expect(results.debug.soilPressure_psi).toBeGreaterThan(0);
      expect(results.maxSurfacePressureOnPipe).toBeGreaterThan(0);
    });
  });
});
