/**
 * Unified entry point for all surface load calculations
 * Dispatches to the appropriate calculation engine based on vehicle type
 */

import { PipelineTrackInputs, PipelineTrackResults } from './types';
import { TwoAxleInputs, TwoAxleResults } from './types2Axle';
import { ThreeAxleInputs, ThreeAxleResults } from './types3Axle';
import { GridLoadInputs, GridLoadResults } from './typesGrid';

import { calculatePipelineTrack } from './calculations';
import { calculate2AxleVehicleVBA } from './vba2AxleEngine';
import { calculate3AxleVehicleVBA } from './vba3AxleEngine';
import { calculateGridLoadVBA } from './vbaGridEngine';

/**
 * Surface load input types - discriminated union
 */
export type SurfaceLoadInputs = 
  | { type: 'TRACK'; inputs: PipelineTrackInputs }
  | { type: '2_AXLE'; inputs: TwoAxleInputs }
  | { type: '3_AXLE'; inputs: ThreeAxleInputs }
  | { type: 'GRID'; inputs: GridLoadInputs };

/**
 * Surface load result types - discriminated union
 */
export type SurfaceLoadResults = 
  | { type: 'TRACK'; results: PipelineTrackResults }
  | { type: '2_AXLE'; results: TwoAxleResults }
  | { type: '3_AXLE'; results: ThreeAxleResults }
  | { type: 'GRID'; results: GridLoadResults };

/**
 * Main calculation dispatcher
 * Routes to the appropriate calculation engine based on vehicle type
 */
export function computeSurfaceLoad(config: SurfaceLoadInputs): SurfaceLoadResults {
  switch (config.type) {
    case 'TRACK':
      return {
        type: 'TRACK',
        results: calculatePipelineTrack(config.inputs)
      };
    
    case '2_AXLE':
      return {
        type: '2_AXLE',
        results: calculate2AxleVehicleVBA(config.inputs)
      };
    
    case '3_AXLE':
      return {
        type: '3_AXLE',
        results: calculate3AxleVehicleVBA(config.inputs)
      };
    
    case 'GRID':
      return {
        type: 'GRID',
        results: calculateGridLoadVBA(config.inputs)
      };
    
    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = config;
      throw new Error(`Unknown calculation type: ${(_exhaustive as any).type}`);
  }
}

/**
 * Helper to determine if results passed code check
 */
export function isPassingCalculation(results: SurfaceLoadResults): boolean {
  switch (results.type) {
    case 'TRACK':
      return results.results.passFailSummary.overallPass;
    case '2_AXLE':
      return results.results.passFailSummary.overallPass;
    case '3_AXLE':
      return results.results.passFailSummary.overallPass;
    case 'GRID':
      return results.results.passFailSummary.overallPass;
    default:
      return false;
  }
}
