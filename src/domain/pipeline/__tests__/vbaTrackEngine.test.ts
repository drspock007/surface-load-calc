import { describe, it, expect } from 'vitest';
import { calculateTrackVehicleVBA } from '../vbaTrackEngine';
import { PipelineTrackInputs } from '../types';

/**
 * CEPA Manual Example 2 - Track Vehicle (Komatsu PC400 Trackhoe)
 * Reference: CEPA Kiefner 2014 Manual, Example 2
 * 
 * This test validates that our implementation matches the expected values
 * from the official CEPA manual calculations.
 */

const cepaExample2Inputs: PipelineTrackInputs = {
  unitsSystem: 'EN',
  calculationName: 'CEPA Example 2 - Track Vehicle',
  
  // Pipe properties (Section 2 of manual)
  pipeOD: 16,           // inches
  pipeWT: 0.5,          // inches
  MOP: 1074,            // psi
  SMYS: 42000,          // psi
  deltaT: 20,           // °F
  
  // Soil properties (Section 3 of manual)
  soilDensity: 120,     // lb/ft³
  depthCover: 6.667,    // ft (80 inches)
  beddingAngleDeg: 30,  // degrees
  soilLoadMethod: 'PRISM',
  frictionAngleDeg: 30, // degrees
  soilCohesion: 0,      // psi
  kr: 1,                // dimensionless
  
  // E' - using lookup table method
  ePrimeMethod: 'LOOKUP',
  soilType: 'COARSE_WITH_FINES',
  compaction: 90,       // percent (moderate compaction)
  
  // Track vehicle properties (Section 4 of manual)
  trackSeparation: 9,           // ft
  trackLength: 14.3,            // ft
  trackVehicleWeight: 93916,    // lbs
  trackWidth: 27.6,             // inches
  
  // Analysis parameters (Section 5 of manual)
  pavementType: 'FLEXIBLE',
  vehicleClass: 'TRACK',
  equivStressMethod: 'TRESCA',
  codeCheck: 'B31_4',
};

// Expected results from CEPA manual Example 2
const cepaExample2Expected = {
  impactFactor: 1.45,
  
  // Hoop stresses (psi)
  hoopInternal_psi: 17184,      // Internal pressure component
  hoopLive_psi: 2032,           // Live load component (at zero pressure)
  hoopLiveMOP_psi: 1509,        // Live load component (at MOP)
  hoopTotal_Zero_psi: 5691,     // Total hoop stress at zero pressure
  hoopTotal_MOP_psi: 21410,     // Total hoop stress at MOP
  
  // Longitudinal stresses (psi)
  longLive_Zero_psi: 1973,      // Live load component at zero pressure
  longLiveMOP_psi: 1804,        // Live load component at MOP
  longTotal_Zero_psi: 6971,     // Total longitudinal at zero pressure
  longTotal_MOP_psi: 11674,     // Total longitudinal at MOP
  
  // Equivalent stresses (psi)
  equivStress_Zero_psi: 12662,  // Equivalent stress at zero pressure
  equivStress_MOP_psi: 21410,   // Equivalent stress at MOP
  
  // Pass/Fail
  shouldPass: true,             // Should pass all code checks
};

describe('CEPA Example 2 - Track Vehicle Validation', () => {
  const results = calculateTrackVehicleVBA(cepaExample2Inputs);
  
  // Tolerance for numerical comparison (5% to account for rounding and interpolation)
  const tolerance = 0.05;
  
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
    it('should calculate impact factor matching CEPA manual (1.45)', () => {
      expectWithinTolerance(
        results.impactFactorUsed,
        cepaExample2Expected.impactFactor,
        'Impact Factor'
      );
    });
  });

  describe('Hoop Stresses', () => {
    it('σH_Internal should be ~17184 psi', () => {
      const hoopInternal = results.debug.hoopInt_psi || 0;
      expectWithinTolerance(
        hoopInternal,
        cepaExample2Expected.hoopInternal_psi,
        'Hoop Internal Stress'
      );
    });
    
    it('σH_Live (at zero pressure) should be ~2032 psi', () => {
      const hoopLive = results.debug.hoopLive_psi || 0;
      expectWithinTolerance(
        hoopLive,
        cepaExample2Expected.hoopLive_psi,
        'Hoop Live Load Stress (Zero Pressure)'
      );
    });
    
    it('σH_Total (at zero pressure) should be ~5691 psi', () => {
      expectWithinTolerance(
        results.stresses.atZeroPressure.hoop.high,
        cepaExample2Expected.hoopTotal_Zero_psi,
        'Hoop Total Stress (Zero Pressure)'
      );
    });
    
    it('σH_Total (at MOP) should be ~21410 psi', () => {
      expectWithinTolerance(
        results.stresses.atMOP.hoop.high,
        cepaExample2Expected.hoopTotal_MOP_psi,
        'Hoop Total Stress (MOP)'
      );
    });
  });

  describe('Longitudinal Stresses', () => {
    it('σL_Live (at zero pressure) should be ~1973 psi', () => {
      const longLive = results.debug.longLive_psi || 0;
      expectWithinTolerance(
        longLive,
        cepaExample2Expected.longLive_Zero_psi,
        'Longitudinal Live Load (Zero Pressure)'
      );
    });
    
    it('σL_Total (at zero pressure) should be ~6971 psi', () => {
      expectWithinTolerance(
        results.stresses.atZeroPressure.longitudinal.high,
        cepaExample2Expected.longTotal_Zero_psi,
        'Longitudinal Total Stress (Zero Pressure)'
      );
    });
    
    it('σL_Total (at MOP) should be ~11674 psi', () => {
      expectWithinTolerance(
        results.stresses.atMOP.longitudinal.high,
        cepaExample2Expected.longTotal_MOP_psi,
        'Longitudinal Total Stress (MOP)'
      );
    });
  });

  describe('Equivalent Stresses (Tresca Method)', () => {
    it('σE (at zero pressure) should be ~12662 psi', () => {
      expectWithinTolerance(
        results.stresses.atZeroPressure.equivalent.high,
        cepaExample2Expected.equivStress_Zero_psi,
        'Equivalent Stress (Zero Pressure)'
      );
    });
    
    it('σE (at MOP) should be ~21410 psi', () => {
      expectWithinTolerance(
        results.stresses.atMOP.equivalent.high,
        cepaExample2Expected.equivStress_MOP_psi,
        'Equivalent Stress (MOP)'
      );
    });
  });

  describe('Pass/Fail Criteria', () => {
    it('should PASS all code checks per CEPA manual', () => {
      expect(results.passFailSummary.overallPass).toBe(cepaExample2Expected.shouldPass);
    });
    
    it('should pass hoop stress check at zero pressure', () => {
      expect(results.passFailSummary.hoopAtZero).toBe(true);
    });
    
    it('should pass hoop stress check at MOP', () => {
      expect(results.passFailSummary.hoopAtMOP).toBe(true);
    });
    
    it('should pass longitudinal stress check at zero pressure', () => {
      expect(results.passFailSummary.longitudinalAtZero).toBe(true);
    });
    
    it('should pass longitudinal stress check at MOP', () => {
      expect(results.passFailSummary.longitudinalAtMOP).toBe(true);
    });
    
    it('should pass equivalent stress check at zero pressure', () => {
      expect(results.passFailSummary.equivalentAtZero).toBe(true);
    });
    
    it('should pass equivalent stress check at MOP', () => {
      expect(results.passFailSummary.equivalentAtMOP).toBe(true);
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
});
