import type { CalculationRun, CalculationMode } from '@/types/calculation';
import type { PipelineTrackInputs, UnitsSystem } from '@/domain/pipeline/types';
import type { TwoAxleInputs } from '@/domain/pipeline/types2Axle';
import type { ThreeAxleInputs } from '@/domain/pipeline/types3Axle';
import type { GridLoadInputs } from '@/domain/pipeline/typesGrid';
import { calculatePipelineTrack, calculate2AxleVehicleVBA, calculate3AxleVehicleVBA, calculateGridLoadVBA } from '@/domain/pipeline';

export const reportModes = ['PIPELINE_TRACK', '2_AXLE', '3_AXLE', 'GRID'] as const;
export function exampleRun(mode: CalculationMode = '2_AXLE', units: UnitsSystem = 'SI', pe = false): CalculationRun {
  const si = units === 'SI';
  const input = {
    calculationName: 'Example - Pipeline crossing / Montréal', unitsSystem: units,
    pipeMaterial: pe ? 'PE' : 'STEEL', pipeOD: si ? 219.1 : 8.626, pipeWT: si ? 8.18 : 0.322,
    MOP: pe ? si ? 100 : 14.5 : si ? 3000 : 435, SMYS: si ? 359 : 52069, deltaT: si ? 10 : 18,
    soilDensity: si ? 1600 : 100, depthCover: si ? 1.8 : 5.9055, beddingAngleDeg: 30,
    soilLoadMethod: 'PRISM', frictionAngleDeg: 30, soilCohesion: 0, kr: 1, ePrimeMethod: 'LOOKUP', soilType: 'COARSE_WITH_FINES', compaction: 90,
    trackSeparation: si ? 2.8 : 9.186, trackLength: si ? 6 : 19.685, trackWidth: si ? 500 : 19.685, trackVehicleWeight: si ? 15000 : 33069,
    axleSpacing: si ? 4 : 13.123, axle1To2Spacing: si ? 4 : 13.123, axle2To3Spacing: si ? 1.5 : 4.921,
    axle1Load: si ? 7500 : 16534, axle2Load: si ? 12000 : 26455, axle3Load: si ? 12000 : 26455,
    contactPatchMode: 'MANUAL', axle1TireWidth: si ? 315 : 12.4, axle1TireLength: si ? 300 : 11.81, axle2TireWidth: si ? 630 : 24.8, axle2TireLength: si ? 300 : 11.81, axle3TireWidth: si ? 630 : 24.8, axle3TireLength: si ? 300 : 11.81,
    axleWidth: si ? 2300 : 90.55, laneOffset: 0,
    loadType: 'TOTAL_LOAD', totalLoad: si ? 50000 : 110231, gridLength: si ? 6 : 19.685, gridWidth: si ? 3 : 9.843, gridOffsetX: 0, gridOffsetY: 0, gridDivisionsX: 10, gridDivisionsY: 10,
    pavementType: 'FLEXIBLE', vehicleClass: 'HIGHWAY', equivStressMethod: 'VON_MISES', codeCheck: 'USER_DEFINED', userDefinedLimits: { hoopLimitPct: 85, longLimitPct: 80, equivLimitPct: 90 }, enableBendRadius: !pe,
    peSizeId: 'IPS-8', peDesignation: 'PE4710', dimensionRatio: 11, peModulusMode: 'AUTO', peServiceTempC: 23, peDeflectionLimitPct: 5, peStrainLimitPct: 5,
  };
  const result = mode === 'PIPELINE_TRACK' ? calculatePipelineTrack(input as PipelineTrackInputs) : mode === '2_AXLE' ? calculate2AxleVehicleVBA(input as TwoAxleInputs) : mode === '3_AXLE' ? calculate3AxleVehicleVBA(input as ThreeAxleInputs) : calculateGridLoadVBA(input as GridLoadInputs);
  return { id: `example-${mode}-${units}-${pe ? 'PE' : 'STEEL'}`, timestamp: Date.UTC(2026, 8, 30, 16, 30), mode, input, result };
}
