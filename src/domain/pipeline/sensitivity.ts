import { PipelineTrackInputs, PipelineTrackResults } from './types';
import { TwoAxleInputs, TwoAxleResults } from './types2Axle';
import { ThreeAxleInputs, ThreeAxleResults } from './types3Axle';
import { GridLoadInputs, GridLoadResults } from './typesGrid';
import { calculatePipelineTrack } from './calculations';
import { calculate2AxleVehicleVBA } from './vba2AxleEngine';
import { calculate3AxleVehicleVBA } from './vba3AxleEngine';
import { calculateGridLoadVBA } from './vbaGridEngine';
import { CalculationMode } from '@/types/calculation';

export type PipelineInputs = PipelineTrackInputs | TwoAxleInputs | ThreeAxleInputs | GridLoadInputs;
type PipelineResults = PipelineTrackResults | TwoAxleResults | ThreeAxleResults | GridLoadResults;

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
 * @param mode - Calculation mode (Track, 2-Axle, 3-Axle, Grid)
 * @returns Normalized sensitivity result
 */
export function runScenario(
  baseInputs: PipelineInputs,
  overrides: Partial<PipelineInputs>,
  mode: CalculationMode
): SensitivityResult {
  if (baseInputs.pipeMaterial === 'PE') {
    throw new Error("Sensitivity stress analysis requires a steel base case; % SMYS does not apply to PE.");
  }
  // Clone base inputs and apply overrides
  const inputs = {
    ...baseInputs,
    ...overrides,
  } as PipelineInputs;

  // Run calculation based on mode
  let result: PipelineResults;
  switch (mode) {
    case 'PIPELINE_TRACK':
      result = calculatePipelineTrack(inputs as PipelineTrackInputs);
      break;
    case '2_AXLE':
      result = calculate2AxleVehicleVBA(inputs as TwoAxleInputs);
      break;
    case '3_AXLE':
      result = calculate3AxleVehicleVBA(inputs as ThreeAxleInputs);
      break;
    case 'GRID':
      result = calculateGridLoadVBA(inputs as GridLoadInputs);
      break;
    default:
      throw new Error(`Unsupported mode for sensitivity: ${mode}`);
  }

  // Extract the parameter value (first override key)
  const overrideKey = Object.keys(overrides)[0];
  const parameterValue = (inputs as unknown as Record<string, number>)[overrideKey] as number;

  // Engines return SI stresses in kPa, but SI SMYS inputs are in MPa.
  const smys = inputs.SMYS * (inputs.unitsSystem === 'SI' ? 1000 : 1);
  if (!Number.isFinite(smys) || smys <= 0) throw new Error("A positive SMYS is required.");

  // Store fractions consistently; UI and CSV convert to percent exactly once.
  return {
    parameterValue,
    hoopPctSmysMopHigh: Math.abs(result.stresses.atMOP.hoop.high) / smys,
    longPctSmysMopHigh: Math.abs(result.stresses.atMOP.longitudinal.high) / smys,
    equivPctSmysMopHigh: result.stresses.atMOP.equivalent.percentSMYS / 100,
    passFail: result.passFailSummary.overallPass,
    controllingLocation: result.locationMaxLoad,
    impactFactor: result.impactFactorUsed,
    boussinesqMax: result.debug.boussinesqMax_psi / (inputs.unitsSystem === 'SI' ? 6.894757293168 : 1),
  };
}

/**
 * Parameter definition for sensitivity analysis
 */
export interface SensitivityParameter {
  key: string;
  label: string;
  unit: string;
  unitSI: string;
  modes: CalculationMode[]; // Which modes support this parameter
}

/**
 * Available parameters for sensitivity analysis by mode
 */
export const SENSITIVITY_PARAMETERS: SensitivityParameter[] = [
  // Common parameters (all modes)
  { key: 'depthCover', label: 'Depth of Cover (H)', unit: 'ft', unitSI: 'm', modes: ['PIPELINE_TRACK', '2_AXLE', '3_AXLE', 'GRID'] },
  { key: 'soilDensity', label: 'Soil Density (ρ)', unit: 'lb/ft³', unitSI: 'kg/m³', modes: ['PIPELINE_TRACK', '2_AXLE', '3_AXLE', 'GRID'] },
  { key: 'MOP', label: 'Maximum Operating Pressure', unit: 'psi', unitSI: 'kPa', modes: ['PIPELINE_TRACK', '2_AXLE', '3_AXLE', 'GRID'] },
  { key: 'pipeOD', label: 'Pipe Outer Diameter (D)', unit: 'in', unitSI: 'mm', modes: ['PIPELINE_TRACK', '2_AXLE', '3_AXLE', 'GRID'] },
  { key: 'pipeWT', label: 'Pipe Wall Thickness (t)', unit: 'in', unitSI: 'mm', modes: ['PIPELINE_TRACK', '2_AXLE', '3_AXLE', 'GRID'] },
  { key: 'deltaT', label: 'Temperature Differential (ΔT)', unit: '°F', unitSI: '°C', modes: ['PIPELINE_TRACK', '2_AXLE', '3_AXLE', 'GRID'] },
  { key: 'ePrimeUserDefined', label: "E' (Modulus of Soil Reaction)", unit: 'psi', unitSI: 'kPa', modes: ['PIPELINE_TRACK', '2_AXLE', '3_AXLE', 'GRID'] },
  
  // Track-specific
  { key: 'trackVehicleWeight', label: 'Track Vehicle Weight', unit: 'lb', unitSI: 'kg', modes: ['PIPELINE_TRACK'] },
  
  // 2-Axle specific
  { key: 'axleSpacing', label: 'Axle Spacing', unit: 'ft', unitSI: 'm', modes: ['2_AXLE'] },
  { key: 'axle1Load', label: 'Front Axle Load', unit: 'lb', unitSI: 'kg', modes: ['2_AXLE', '3_AXLE'] },
  { key: 'axle2Load', label: 'Rear Axle Load (2-Axle) / Middle Axle (3-Axle)', unit: 'lb', unitSI: 'kg', modes: ['2_AXLE', '3_AXLE'] },
  { key: 'laneOffset', label: 'Lane Offset from Pipe', unit: 'ft', unitSI: 'm', modes: ['2_AXLE', '3_AXLE'] },
  
  // 3-Axle specific
  { key: 'axle1To2Spacing', label: 'Axle 1 to 2 Spacing', unit: 'ft', unitSI: 'm', modes: ['3_AXLE'] },
  { key: 'axle2To3Spacing', label: 'Axle 2 to 3 Spacing', unit: 'ft', unitSI: 'm', modes: ['3_AXLE'] },
  { key: 'axle3Load', label: 'Rear Axle Load', unit: 'lb', unitSI: 'kg', modes: ['3_AXLE'] },
  
  // Grid specific
  { key: 'totalLoad', label: 'Total Grid Load', unit: 'lb', unitSI: 'kg', modes: ['GRID'] },
  { key: 'uniformPressure', label: 'Uniform Pressure', unit: 'psi', unitSI: 'kPa', modes: ['GRID'] },
  { key: 'gridLength', label: 'Grid Length', unit: 'ft', unitSI: 'm', modes: ['GRID'] },
  { key: 'gridWidth', label: 'Grid Width', unit: 'ft', unitSI: 'm', modes: ['GRID'] },
  { key: 'gridOffsetX', label: 'Grid Offset X (Lateral)', unit: 'ft', unitSI: 'm', modes: ['GRID'] },
  { key: 'gridOffsetY', label: 'Grid Offset Y (Longitudinal)', unit: 'ft', unitSI: 'm', modes: ['GRID'] },
];

/**
 * Generate sensitivity sweep
 * @param baseInputs - Base case inputs
 * @param parameter - Parameter to vary
 * @param config - Sweep configuration (either absolute or percentage-based)
 * @param mode - Calculation mode
 * @returns Array of sensitivity results
 */
export function generateSensitivitySweep(
  baseInputs: PipelineInputs,
  parameter: string,
  config: {
    mode: 'absolute' | 'percentage';
    min?: number;
    max?: number;
    step?: number;
    percentRange?: number; // e.g., 20 for ±20%
    percentStep?: number; // e.g., 5 for steps of 5%
  },
  calcMode: CalculationMode
): SensitivityResult[] {
  const results: SensitivityResult[] = [];
  const baseValue = (baseInputs as unknown as Record<string, number>)[parameter] as number;

  if (!Number.isFinite(baseValue)) {
    throw new Error(`Parameter ${parameter} not found in base inputs`);
  }

  let values: number[] = [];

  if (config.mode === 'absolute') {
    // Generate absolute values
    const min = config.min ?? baseValue * 0.5;
    const max = config.max ?? baseValue * 1.5;
    const step = config.step ?? (max - min) / 20;

    if (![min, max, step].every(Number.isFinite) || step <= 0 || max < min) {
      throw new Error("Enter a finite range with max ≥ min and a positive step.");
    }
    const count = Math.floor((max - min) / step + 1e-9) + 1;
    if (!Number.isFinite(count) || count > 200) throw new Error("Use a larger step: maximum 200 points.");
    values = Array.from({ length: count }, (_, i) => min + i * step);
  } else {
    // Generate percentage-based values
    const percentRange = config.percentRange ?? 20;
    const percentStep = config.percentStep ?? 5;

    if (![percentRange, percentStep].every(Number.isFinite) || percentRange < 0 || percentStep <= 0) {
      throw new Error("Enter a finite non-negative range and a positive step.");
    }
    const count = Math.floor(2 * percentRange / percentStep + 1e-9) + 1;
    if (!Number.isFinite(count) || count > 200) throw new Error("Use a larger step: maximum 200 points.");
    values = Array.from({ length: count }, (_, i) => baseValue * (1 + (-percentRange + i * percentStep) / 100));
  }

  // Run scenarios
  for (const value of values) {
    try {
      const result = runScenario(baseInputs, { [parameter]: value }, calcMode);
      results.push(result);
    } catch (error) {
      throw new Error(`${parameter}=${value}: ${error instanceof Error ? error.message : "Calculation failed"}`);
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
    r.passFail === null ? 'N/A' : r.passFail ? 'PASS' : 'FAIL',
    r.controllingLocation,
    r.impactFactor.toFixed(4),
    r.boussinesqMax.toFixed(4),
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
