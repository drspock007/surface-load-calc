// Main exports for pipeline domain
export * from './types';
export * from './unitConversions';

export { calculatePipelineTrack } from './calculations';
export { calculate2AxleVehicleVBA } from './vba2AxleEngine';
export { calculate3AxleVehicleVBA } from './vba3AxleEngine';
export { calculateGridLoadVBA } from './vbaGridEngine';

export type { PipelineTrackInputs, PipelineTrackResults } from './types';
export type { TwoAxleInputs, TwoAxleResults } from './types2Axle';
export type { ThreeAxleInputs, ThreeAxleResults } from './types3Axle';
export type { GridLoadInputs, GridLoadResults } from './typesGrid';

export * from './sensitivity';

// Unified entry point
export { computeSurfaceLoad, isPassingCalculation } from './computeSurfaceLoad';
export type { SurfaceLoadInputs, SurfaceLoadResults } from './computeSurfaceLoad';

// E' lookup table
export { getEPrimeCoefficients, calculateEPrimeFromLookup, E_PRIME_TABLE } from './ePrimeLookup';
export type { EPrimeCoefficients, SoilTypeKey, CompactionLevel } from './ePrimeLookup';

// Tire contact patch calculations
export { calculateContactPatch, convertContactPatchToEN } from './tirePatchCalculations';
export type { TireContactPatch } from './tirePatchCalculations';
