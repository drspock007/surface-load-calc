import { PipelineTrackInputs, PipelineTrackResults } from './types';
import { calculatePipelineTrack } from './calculations';

/**
 * Normalized result structure for sensitivity analysis
 */
export interface SensitivityResult {
  parameterValue: number;
  hoopPctSmysMopHigh: number;
  longPctSmysMopHigh: number;
  equivPctSmysMopHigh: number;
  passFail: boolean | null;
  controllingLocation: string;
  impactFactor: number;
  boussinesqMax: number;
}

/**
 * Run a single scenario by overriding one parameter
 * @param baseInputs - Base case inputs
 * @param overrides - Parameter overrides (only one should be modified)
 * @returns Normalized sensitivity result
 */
export function runScenario(
  baseInputs: PipelineTrackInputs,
  overrides: Partial<PipelineTrackInputs>
): SensitivityResult {
  // Clone base inputs and apply overrides
  const inputs: PipelineTrackInputs = {
    ...baseInputs,
    ...overrides,
  };

  // Run calculation
  const result: PipelineTrackResults = calculatePipelineTrack(inputs);

  // Extract the parameter value (first override key)
  const overrideKey = Object.keys(overrides)[0] as keyof PipelineTrackInputs;
  const parameterValue = inputs[overrideKey] as number;

  // Normalize results
  return {
    parameterValue,
    hoopPctSmysMopHigh: result.stresses.atMOP.hoop.high / result.allowableStress,
    longPctSmysMopHigh: result.stresses.atMOP.longitudinal.high / result.allowableStress,
    equivPctSmysMopHigh: result.stresses.atMOP.equivalent.percentSMYS,
    passFail: result.passFailSummary.overallPass,
    controllingLocation: result.locationMaxLoad,
    impactFactor: result.impactFactorUsed,
    boussinesqMax: result.debug.boussinesqMax_psi,
  };
}

/**
 * Parameter definition for sensitivity analysis
 */
export interface SensitivityParameter {
  key: keyof PipelineTrackInputs;
  label: string;
  unit: string;
  unitSI: string;
}

/**
 * Available parameters for sensitivity analysis
 */
export const SENSITIVITY_PARAMETERS: SensitivityParameter[] = [
  { key: 'depthCover', label: 'Depth of Cover (H)', unit: 'ft', unitSI: 'm' },
  { key: 'soilDensity', label: 'Soil Density (ρ)', unit: 'lb/ft³', unitSI: 'kg/m³' },
  { key: 'MOP', label: 'Maximum Operating Pressure', unit: 'psi', unitSI: 'kPa' },
  { key: 'pipeOD', label: 'Pipe Outer Diameter (D)', unit: 'in', unitSI: 'mm' },
  { key: 'pipeWT', label: 'Pipe Wall Thickness (t)', unit: 'in', unitSI: 'mm' },
  { key: 'deltaT', label: 'Temperature Differential (ΔT)', unit: '°F', unitSI: '°C' },
  { key: 'ePrimeUserDefined', label: "E' (Modulus of Soil Reaction)", unit: 'psi', unitSI: 'kPa' },
  { key: 'trackVehicleWeight', label: 'Vehicle Load', unit: 'lb', unitSI: 'kg' },
];

/**
 * Generate sensitivity sweep
 * @param baseInputs - Base case inputs
 * @param parameter - Parameter to vary
 * @param config - Sweep configuration (either absolute or percentage-based)
 * @returns Array of sensitivity results
 */
export function generateSensitivitySweep(
  baseInputs: PipelineTrackInputs,
  parameter: keyof PipelineTrackInputs,
  config: {
    mode: 'absolute' | 'percentage';
    min?: number;
    max?: number;
    step?: number;
    percentRange?: number; // e.g., 20 for ±20%
    percentStep?: number; // e.g., 5 for steps of 5%
  }
): SensitivityResult[] {
  const results: SensitivityResult[] = [];
  const baseValue = baseInputs[parameter] as number;

  let values: number[] = [];

  if (config.mode === 'absolute') {
    // Generate absolute values
    const min = config.min ?? baseValue * 0.5;
    const max = config.max ?? baseValue * 1.5;
    const step = config.step ?? (max - min) / 20;

    for (let v = min; v <= max; v += step) {
      values.push(v);
    }
  } else {
    // Generate percentage-based values
    const percentRange = config.percentRange ?? 20;
    const percentStep = config.percentStep ?? 5;

    for (let p = -percentRange; p <= percentRange; p += percentStep) {
      values.push(baseValue * (1 + p / 100));
    }
  }

  // Limit to 200 points
  if (values.length > 200) {
    const samplingRate = Math.ceil(values.length / 200);
    values = values.filter((_, i) => i % samplingRate === 0);
  }

  // Run scenarios
  for (const value of values) {
    try {
      const result = runScenario(baseInputs, { [parameter]: value } as Partial<PipelineTrackInputs>);
      results.push(result);
    } catch (error) {
      console.error(`Error at ${parameter}=${value}:`, error);
    }
  }

  return results;
}

/**
 * Export results to CSV format
 */
export function exportToCSV(results: SensitivityResult[], parameterLabel: string, unit: string): string {
  const headers = [
    parameterLabel + ' (' + unit + ')',
    'Hoop %SMYS (MOP High)',
    'Long %SMYS (MOP High)',
    'Equiv %SMYS (MOP High)',
    'Pass/Fail',
    'Controlling Location',
    'Impact Factor',
    'Boussinesq Max (psi)',
  ];

  const rows = results.map(r => [
    r.parameterValue.toFixed(4),
    (r.hoopPctSmysMopHigh * 100).toFixed(2),
    (r.longPctSmysMopHigh * 100).toFixed(2),
    (r.equivPctSmysMopHigh * 100).toFixed(2),
    r.passFail ? 'PASS' : 'FAIL',
    r.controllingLocation,
    r.impactFactor.toFixed(4),
    r.boussinesqMax.toFixed(4),
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
