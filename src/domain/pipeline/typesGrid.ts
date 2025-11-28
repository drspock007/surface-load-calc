import { UnitsSystem, BeddingAngleDeg, SoilLoadMethod, EPrimeMethod, SoilType, Compaction, EquivStressMethod, CodeCheck, PavementType, VehicleClass } from './types';
import { StressResults, PassFailSummary, DebugValues, LimitsUsed } from './types';

export type { UnitsSystem, BeddingAngleDeg, SoilLoadMethod, EPrimeMethod, SoilType, Compaction, EquivStressMethod, CodeCheck, PavementType, VehicleClass };

export interface GridLoadInputs {
  // System
  unitsSystem: UnitsSystem;
  calculationName: string;
  
  // Pipe properties
  pipeOD: number;
  pipeWT: number;
  MOP: number;
  SMYS: number;
  deltaT: number;
  
  // Soil properties
  soilDensity: number;
  depthCover: number;
  beddingAngleDeg: BeddingAngleDeg;
  soilLoadMethod: SoilLoadMethod;
  frictionAngleDeg: number;
  soilCohesion: number;
  kr: number;
  
  // E'
  ePrimeMethod: EPrimeMethod;
  ePrimeUserDefined?: number;
  soilType?: SoilType;
  compaction?: Compaction;
  
  // Grid load properties
  loadType: 'TOTAL_LOAD' | 'UNIFORM_PRESSURE'; // user choice
  totalLoad?: number; // if TOTAL_LOAD (lb or kg)
  uniformPressure?: number; // if UNIFORM_PRESSURE (psi or kPa)
  gridLength: number; // length of loaded area (ft or m)
  gridWidth: number; // width of loaded area (ft or m)
  gridOffsetX: number; // lateral offset from pipe centerline (ft or m)
  gridOffsetY: number; // longitudinal offset (ft or m)
  gridDivisionsX: number; // number of divisions in X direction (default 10)
  gridDivisionsY: number; // number of divisions in Y direction (default 10)
  
  // Analysis parameters
  pavementType: PavementType;
  vehicleClass: VehicleClass;
  equivStressMethod: EquivStressMethod;
  codeCheck: CodeCheck;
  userDefinedLimits?: {
    hoopLimitPct: number;
    longLimitPct: number;
    equivLimitPct: number;
  };
}

export interface GridLoadResults {
  maxSurfacePressureOnPipe: number;
  locationMaxLoad: string;
  impactFactorUsed: number;
  stresses: StressResults;
  allowableStress: number;
  passFailSummary: PassFailSummary;
  limitsUsed: LimitsUsed;
  ePrimeUsed: number;
  soilLoadOnPipe: number;
  deflectionRatio: number;
  debug: DebugValues;
}
