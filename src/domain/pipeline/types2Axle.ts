import { UnitsSystem, BeddingAngleDeg, SoilLoadMethod, EPrimeMethod, SoilType, Compaction, EquivStressMethod, CodeCheck, PavementType, VehicleClass } from './types';
import { StressResults, PassFailSummary, DebugValues } from './types';

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
  tireWidth: number; // tire contact width (in or mm)
  tireLength: number; // tire contact length (in or mm)
  axleWidth: number; // track width / lateral spacing (in or mm)
  laneOffset: number; // offset from pipe centerline (ft or m)
  
  // Analysis parameters
  pavementType: PavementType;
  vehicleClass: VehicleClass;
  equivStressMethod: EquivStressMethod;
  codeCheck: CodeCheck;
  userDefinedStressLimit?: number;
}

export interface TwoAxleResults {
  maxSurfacePressureOnPipe: number;
  locationMaxLoad: string;
  impactFactorUsed: number;
  stresses: StressResults;
  allowableStress: number;
  passFailSummary: PassFailSummary;
  ePrimeUsed: number;
  soilLoadOnPipe: number;
  deflectionRatio: number;
  debug: DebugValues;
}
