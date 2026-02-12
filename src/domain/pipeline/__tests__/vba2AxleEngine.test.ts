import { describe, it, expect } from 'vitest';
import { calculate2AxleVehicleVBA } from '../vba2AxleEngine';
import { TwoAxleInputs } from '../types2Axle';

/**
 * 2-Axle Vehicle - Excel VBA Reference Comparison
 * 
 * Parameters from user-provided Excel screenshot:
 * Pipe: D=114.3mm, t=6.02mm, MOP=7070kPa, SMYS=359MPa, ΔT=65°C
 * Soil: γ=1800kg/m³, H=1.2m, bedding=90°, Prism, friction=30°
 * E': Lookup, Coarse with fines, 90% compaction
 * Vehicle: Farm (IF=1.25), 2 axles
 *   Axle 1: 36000 kg, Axle 2: 67000 kg
 *   Spacing: 4m, Tire Width: 315mm, AUTO mode, ~8 bar
 *   Axle Width: 2300mm, Lane offset: 0
 * Analysis: Flexible pavement, Tresca, CSA Z662
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
  soilDensity: 1800,   // kg/m³
  depthCover: 1.2,     // m
  beddingAngleDeg: 90,
  soilLoadMethod: 'PRISM',
  frictionAngleDeg: 30,
  soilCohesion: 0,
  kr: 1,

  // E'
  ePrimeMethod: 'LOOKUP',
  soilType: 'COARSE_WITH_FINES',
  compaction: 90,

  // 2-Axle vehicle
  axleSpacing: 4,          // m
  axle1Load: 36000,        // kg (front)
  axle2Load: 67000,        // kg (rear)

  // Tire properties - AUTO mode
  contactPatchMode: 'AUTO',
  axle1TireWidth: 315,     // mm
  axle1TireLength: 0,      // calculated in AUTO
  axle1TirePressure: 8,    // bar
  axle1TirePressureUnit: 'bar',
  axle1TiresPerAxle: 4,    // Dual

  axle2TireWidth: 315,     // mm
  axle2TireLength: 0,      // calculated in AUTO
  axle2TirePressure: 8,    // bar
  axle2TirePressureUnit: 'bar',
  axle2TiresPerAxle: 4,    // Dual

  axleWidth: 2300,         // mm
  laneOffset: 0,           // m

  // Analysis
  pavementType: 'FLEXIBLE',
  vehicleClass: 'FARM',
  equivStressMethod: 'TRESCA',
  codeCheck: 'CSA_Z662',
};

// Excel reference values (kPa)
const excelExpected = {
  sigma_H_Total_Zero: 32100,     // kPa
  sigma_L_Total_Zero: 239161,    // kPa
  sigma_E_Zero_Tresca: 271261,   // kPa
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

  describe('Hoop Stress', () => {
    it('σH_Total at zero pressure ≈ 32,100 kPa', () => {
      expectWithinTolerance(
        results.stresses.atZeroPressure.hoop.high,
        excelExpected.sigma_H_Total_Zero,
        'σH_Total_Zero'
      );
    });
  });

  describe('Longitudinal Stress', () => {
    it('σL_Total at zero pressure ≈ 239,161 kPa', () => {
      expectWithinTolerance(
        results.stresses.atZeroPressure.longitudinal.high,
        excelExpected.sigma_L_Total_Zero,
        'σL_Total_Zero'
      );
    });
  });

  describe('Equivalent Stress (Tresca)', () => {
    it('σE at zero pressure ≈ 271,261 kPa', () => {
      expectWithinTolerance(
        results.stresses.atZeroPressure.equivalent.high,
        excelExpected.sigma_E_Zero_Tresca,
        'σE_Zero_Tresca'
      );
    });
  });

  describe('Impact Factor', () => {
    it('should use IF=1.25 for Farm vehicle', () => {
      expect(results.impactFactorUsed).toBeCloseTo(1.25, 2);
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
