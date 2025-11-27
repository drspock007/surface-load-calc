export type UnitsSystem = 'EN' | 'SI';
export type VehicleType = 'TRACK';
export type SoilLoadMethod = 'PRISM' | 'TRAP_DOOR';
export type EPrimeMethod = 'LOOKUP' | 'USER_DEFINED';
export type BeddingAngleDeg = 0 | 30 | 60 | 90 | 120 | 150 | 180;
export type EquivStressMethod = 'TRESCA' | 'VON_MISES';
export type CodeCheck = 'B31_4' | 'B31_8' | 'CSA_Z662' | 'USER_DEFINED';
export type SoilType = 'FINE' | 'COARSE_WITH_FINES' | 'COARSE_NO_FINES';
export type Compaction = 80 | 85 | 90 | 95 | 100;
export type PavementType = 'RIGID' | 'FLEXIBLE';
export type VehicleClass = 'HIGHWAY' | 'FARM' | 'TRACK';

export interface PipelineTrackInputs {
  // System
  unitsSystem: UnitsSystem;
  calculationName: string;
  
  // Pipe properties
  pipeOD: number; // D - outer diameter
  pipeWT: number; // t - wall thickness
  MOP: number; // PintMOP - maximum operating pressure
  SMYS: number; // specified minimum yield strength
  deltaT: number; // temperature change from installation
  
  // Soil properties
  soilDensity: number; // unit weight
  depthCover: number; // H - depth to top of pipe
  beddingAngleDeg: BeddingAngleDeg;
  soilLoadMethod: SoilLoadMethod;
  frictionAngleDeg: number; // for Trap Door method
  soilCohesion: number; // optional, default 0
  kr: number; // coefficient of lateral earth pressure, default 1
  
  // E' (modulus of soil reaction)
  ePrimeMethod: EPrimeMethod;
  ePrimeUserDefined?: number; // if USER_DEFINED
  soilType?: SoilType; // if LOOKUP
  compaction?: Compaction; // if LOOKUP
  
  // Track vehicle properties
  trackSeparation: number; // center-to-center distance between tracks
  trackLength: number;
  trackVehicleWeight: number; // total weight
  trackWidth: number;
  
  // Analysis parameters
  pavementType: PavementType;
  vehicleClass: VehicleClass;
  equivStressMethod: EquivStressMethod;
  codeCheck: CodeCheck;
  userDefinedStressLimit?: number; // if USER_DEFINED
}

export interface StressComponents {
  pressure: number;
  earth: number;
  thermal: number;
  total: number;
}

export interface HoopStresses {
  high: number;
  low: number;
  components: StressComponents;
}

export interface LongitudinalStresses {
  high: number;
  low: number;
  components: StressComponents;
}

export interface EquivalentStresses {
  high: number;
  low: number;
  percentSMYS: number;
}

export interface StressResults {
  atZeroPressure: {
    hoop: HoopStresses;
    longitudinal: LongitudinalStresses;
    equivalent: EquivalentStresses;
  };
  atMOP: {
    hoop: HoopStresses;
    longitudinal: LongitudinalStresses;
    equivalent: EquivalentStresses;
  };
}

export interface PassFailSummary {
  hoopAtZero: boolean;
  hoopAtMOP: boolean;
  longitudinalAtZero: boolean;
  longitudinalAtMOP: boolean;
  equivalentAtZero: boolean;
  equivalentAtMOP: boolean;
  overallPass: boolean;
}

export interface DebugValues {
  soilPressure_psi: number;
  boussinesqMax_psi: number;
  impactFactorDepth: number;
  Kb: number;
  Kz: number;
  Theta: number;
  ePrime_psi: number;
  hoopSoil_psi: number;
  hoopLive_psi: number;
  hoopInt_psi: number;
  longSoil_psi: number;
  longLive_psi: number;
  longInt_psi: number;
  longTherm_psi: number;
  contactPressure_psf: number;
  influenceFactor: number;
  bsnqSUM1_psi?: number;
  bsnqSUM2_psi?: number;
  axleLoad_lb?: number;
  pointLoad_lb?: number;
  nW?: number;
  nL?: number;
  momentMAX_lbin?: number;
  longLiveLocal_psi?: number;
  longLiveBend_psi?: number;
}

export interface PipelineTrackResults {
  maxSurfacePressureOnPipe: number; // Boussinesq max * impact factor
  locationMaxLoad: string; // description of location
  impactFactorUsed: number;
  stresses: StressResults;
  allowableStress: number;
  passFailSummary: PassFailSummary;
  
  // Intermediate values for reference
  ePrimeUsed: number;
  soilLoadOnPipe: number;
  deflectionRatio: number;
  
  // Debug values
  debug: DebugValues;
}
