import { UnitsSystem, BeddingAngleDeg, SoilLoadMethod, EPrimeMethod, SoilType, Compaction, EquivStressMethod, CodeCheck, PavementType, VehicleClass } from './types';
import { StressResults, PassFailSummary, DebugValues, LimitsUsed } from './types';

export type { UnitsSystem, BeddingAngleDeg, SoilLoadMethod, EPrimeMethod, SoilType, Compaction, EquivStressMethod, CodeCheck, PavementType, VehicleClass };

export interface ThreeAxleInputs {
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
  
  // 3-Axle vehicle properties
  axle1To2Spacing: number; // distance axle 1 to 2 (ft or m)
  axle2To3Spacing: number; // distance axle 2 to 3 (ft or m)
  axle1Load: number; // front axle load (lb or kg)
  axle2Load: number; // middle axle load (lb or kg)
  axle3Load: number; // rear axle load (lb or kg)
  tireWidth: number; // tire contact width (in or mm)
  tireLength: number; // tire contact length (in or mm)
  axleWidth: number; // track width / lateral spacing (in or mm)
  laneOffset: number; // offset from pipe centerline (ft or m)
  
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

export interface ThreeAxleResults {
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
