export type CalculationMode = 'SIMPLE' | 'PIPELINE_TRACK' | '2_AXLE' | '3_AXLE' | 'GRID';

export interface CalculationInput {
  loadMagnitude: number; // kN
  loadLength: number; // m
  loadWidth: number; // m
  depth: number; // m
  soilUnitWeight: number; // kN/m³
  calculationName: string;
}

export interface CalculationResult {
  surfaceStress: number; // kPa
  stressAtDepth: number; // kPa
  totalStress: number; // kPa
  loadArea: number; // m²
  contactPressure: number; // kPa
}

export interface CalculationRun {
  id: string;
  timestamp: number;
  mode: CalculationMode;
  input: CalculationInput | any; // can be PipelineTrackInputs for pipeline mode
  result: CalculationResult | any; // can be PipelineTrackResults for pipeline mode
}
