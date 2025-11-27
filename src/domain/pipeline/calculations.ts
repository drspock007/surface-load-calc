import { PipelineTrackInputs, PipelineTrackResults } from './types';
import { calculateTrackVehicleVBA } from './vbaTrackEngine';

/**
 * Main entry point for Pipeline Track Vehicle calculations
 * Uses VBA-parity engine for accurate results
 */
export function calculatePipelineTrack(inputs: PipelineTrackInputs): PipelineTrackResults {
  return calculateTrackVehicleVBA(inputs);
}
