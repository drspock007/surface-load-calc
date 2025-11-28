import { UnitsSystem, BeddingAngleDeg, SoilLoadMethod, EPrimeMethod, SoilType, Compaction, EquivStressMethod, CodeCheck, PavementType, VehicleClass } from './types';
import { StressResults, PassFailSummary, DebugValues, LimitsUsed } from './types';

export type { UnitsSystem, BeddingAngleDeg, SoilLoadMethod, EPrimeMethod, SoilType, Compaction, EquivStressMethod, CodeCheck, PavementType, VehicleClass };

export interface TwoAxleInputs {
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
  
  // 2-Axle vehicle properties
  axleSpacing: number; // distance between axles (ft or m)
  axle1Load: number; // front axle load (lb or kg)
  axle2Load: number; // rear axle load (lb or kg)
  
  // Contact patch method
  contactPatchMode: 'MANUAL' | 'AUTO';
  
  // Axle 1 (front) tire properties
  axle1TireWidth: number; // tire contact width (in or mm)
  axle1TireLength: number; // tire contact length (in or mm) - INPUT in MANUAL, CALCULATED in AUTO
  axle1TirePressure?: number; // tire inflation pressure (psi or kPa) - used in AUTO mode
  axle1TiresPerAxle?: number; // number of tires (2 or 4) - used in AUTO mode
  
  // Axle 2 (rear) tire properties
  axle2TireWidth: number; // tire contact width (in or mm)
  axle2TireLength: number; // tire contact length (in or mm) - INPUT in MANUAL, CALCULATED in AUTO
  axle2TirePressure?: number; // tire inflation pressure (psi or kPa) - used in AUTO mode
  axle2TiresPerAxle?: number; // number of tires (2 or 4) - used in AUTO mode
  
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

export interface TwoAxleResults {
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
