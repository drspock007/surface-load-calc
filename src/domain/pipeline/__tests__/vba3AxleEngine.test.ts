import { describe, it, expect } from 'vitest';
import { calculate3AxleVehicleVBA } from '../vba3AxleEngine';
import { ThreeAxleInputs } from '../types3Axle';

/**
 * CEPA Manual Example 1 - 3-Axle Wheel Vehicle
 * Reference: CEPA Kiefner 2014 Manual, Example 1
 * 
 * This test validates that our implementation matches the expected values
 * from the official CEPA manual calculations for a 3-axle highway vehicle.
 */

const cepaExample1Inputs: ThreeAxleInputs = {
  unitsSystem: 'EN',
  calculationName: 'CEPA Example 1 - 3-Axle Vehicle',
  
  // Pipe properties (same as Example 2)
  pipeOD: 16,           // inches
  pipeWT: 0.5,          // inches
  MOP: 1074,            // psi
  SMYS: 42000,          // psi
  deltaT: 20,           // °F
  
  // Soil properties (same as Example 2)
  soilDensity: 120,     // lb/ft³
  depthCover: 6.667,    // ft (80 inches)
  beddingAngleDeg: 30,  // degrees
  soilLoadMethod: 'PRISM',
  frictionAngleDeg: 30, // degrees
  soilCohesion: 0,      // psi
  kr: 1,                // dimensionless
  
  // E' - using lookup table method (same as Example 2)
  ePrimeMethod: 'LOOKUP',
  soilType: 'COARSE_WITH_FINES',
  compaction: 90,       // percent (moderate compaction)
  
  // 3-Axle vehicle properties from CEPA Example 1
  axle1To2Spacing: 10,    // ft - spacing between axle 1 and 2
  axle2To3Spacing: 4,     // ft - spacing between axle 2 and 3
  axle1Load: 15000,       // lb - front axle
  axle2Load: 25000,       // lb - middle axle
  axle3Load: 25000,       // lb - rear axle
  axle1TireWidth: 12,     // inches
  axle1TireLength: 8,     // inches
  axle2TireWidth: 12,     // inches
  axle2TireLength: 8,     // inches
  axle3TireWidth: 12,     // inches
  axle3TireLength: 8,     // inches
  axleWidth: 72,          // inches (6 ft center-to-center)
  laneOffset: 0,          // ft - centered over pipeline
  axle1TiresPerAxle: 2,   // Single
  axle2TiresPerAxle: 4,   // Dual
  axle3TiresPerAxle: 4,   // Dual
  contactPatchMode: 'MANUAL',
  
  // Analysis parameters
  pavementType: 'FLEXIBLE',
  vehicleClass: 'HIGHWAY',
  equivStressMethod: 'TRESCA',
  codeCheck: 'B31_4',
};

// Expected results from CEPA manual Example 1
const cepaExample1Expected = {
  impactFactor: 1.45,    // Flexible pavement, adjusted for depth
  
  // Hoop stresses (psi) - Example 1 values
  hoopLive_psi: 1708,           // Live load component (at zero pressure)
  hoopTotal_Zero_psi: 5367,     // Total hoop stress at zero pressure
  
  // Longitudinal stresses (psi)
  longTotal_Zero_psi: 6656,     // Total longitudinal at zero pressure
  
  // Equivalent stresses (psi)
  equivStress_Zero_psi: 12023,  // Equivalent stress at zero pressure
  
  // Pass/Fail
  shouldPass: true,             // Should pass all code checks
};

describe('CEPA Example 1 - 3-Axle Vehicle Validation', () => {
  const results = calculate3AxleVehicleVBA(cepaExample1Inputs);
  
  // Tolerance for numerical comparison (10% to account for rounding, interpolation, and contact patch differences)
  const tolerance = 0.10;
  
  const withinTolerance = (actual: number, expected: number, tolerancePercent = tolerance): boolean => {
    if (expected === 0) {
      return Math.abs(actual) < 0.01; // Absolute tolerance for zero values
    }
    const diff = Math.abs((actual - expected) / expected);
    return diff <= tolerancePercent;
  };
  
  const expectWithinTolerance = (actual: number, expected: number, name: string) => {
    const isWithin = withinTolerance(actual, expected);
    const percentDiff = expected !== 0 ? ((actual - expected) / expected * 100).toFixed(2) : 'N/A';
    
    expect(isWithin, 
      `${name}: Expected ${expected}, got ${actual} (${percentDiff}% difference)`
    ).toBe(true);
  };

  describe('Impact Factor', () => {
    it('should calculate impact factor for highway/flexible pavement', () => {
      // Highway + Flexible = 1.5, adjusted for depth > 60"
      expect(results.impactFactorUsed).toBeGreaterThanOrEqual(1.0);
      expect(results.impactFactorUsed).toBeLessThanOrEqual(1.5);
    });
  });

  describe('Hoop Stresses', () => {
    it('σH_Live (at zero pressure) should be approximately ~1708 psi', () => {
      const hoopLive = results.debug.hoopLive_psi || 0;
      expectWithinTolerance(
        hoopLive,
        cepaExample1Expected.hoopLive_psi,
        'Hoop Live Load Stress (Zero Pressure)'
      );
    });
    
    it('σH_Total (at zero pressure) should be approximately ~5367 psi', () => {
      expectWithinTolerance(
        results.stresses.atZeroPressure.hoop.high,
        cepaExample1Expected.hoopTotal_Zero_psi,
        'Hoop Total Stress (Zero Pressure)'
      );
    });
  });

  describe('Longitudinal Stresses', () => {
    it('σL_Total (at zero pressure) should be approximately ~6656 psi', () => {
      expectWithinTolerance(
        results.stresses.atZeroPressure.longitudinal.high,
        cepaExample1Expected.longTotal_Zero_psi,
        'Longitudinal Total Stress (Zero Pressure)'
      );
    });
  });

  describe('Equivalent Stresses (Tresca Method)', () => {
    it('σE (at zero pressure) should be approximately ~12023 psi', () => {
      expectWithinTolerance(
        results.stresses.atZeroPressure.equivalent.high,
        cepaExample1Expected.equivStress_Zero_psi,
        'Equivalent Stress (Zero Pressure)'
      );
    });
  });

  describe('Pass/Fail Criteria', () => {
    it('should PASS all code checks per CEPA manual', () => {
      expect(results.passFailSummary.overallPass).toBe(cepaExample1Expected.shouldPass);
    });
  });

  describe('Results Structure Integrity', () => {
    it('should have all required stress components at zero pressure', () => {
      expect(results.stresses.atZeroPressure).toBeDefined();
      expect(results.stresses.atZeroPressure.hoop).toBeDefined();
      expect(results.stresses.atZeroPressure.longitudinal).toBeDefined();
      expect(results.stresses.atZeroPressure.equivalent).toBeDefined();
    });
    
    it('should have all required stress components at MOP', () => {
      expect(results.stresses.atMOP).toBeDefined();
      expect(results.stresses.atMOP.hoop).toBeDefined();
      expect(results.stresses.atMOP.longitudinal).toBeDefined();
      expect(results.stresses.atMOP.equivalent).toBeDefined();
    });
    
    it('should have pass/fail summary', () => {
      expect(results.passFailSummary).toBeDefined();
      expect(typeof results.passFailSummary.overallPass).toBe('boolean');
    });
    
    it('should have debug values', () => {
      expect(results.debug).toBeDefined();
      expect(results.impactFactorUsed).toBeDefined();
      expect(results.debug.ePrime_psi).toBeDefined();
    });
    
    it('should have limits used', () => {
      expect(results.limitsUsed).toBeDefined();
      expect(results.limitsUsed.code).toBe('B31_4');
    });
  });

  describe('Debug Values Validation', () => {
    it('should have reasonable E\' value (modulus of soil reaction)', () => {
      const ePrime = results.debug.ePrime_psi || 0;
      // E' for coarse soil with fines at 90% compaction should be in range
      expect(ePrime).toBeGreaterThan(500);
      expect(ePrime).toBeLessThan(5000);
    });
    
    it('should have positive surface pressure from Boussinesq', () => {
      const maxSurfacePressure = results.maxSurfacePressureOnPipe || 0;
      expect(maxSurfacePressure).toBeGreaterThan(0);
    });
    
    it('should calculate soil load (prism method)', () => {
      const soilLoad = results.debug.soilPressure_psi || 0;
      expect(soilLoad).toBeGreaterThan(0);
    });
  });
});
