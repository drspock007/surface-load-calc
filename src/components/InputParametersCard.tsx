import { CalculationMode } from "@/types/calculation";
import { UnitsSystem } from "@/domain/pipeline/types";


interface InputParametersCardProps {
  mode: CalculationMode;
  input: any;
  compact?: boolean;
}

const getUnitLabels = (system: UnitsSystem) => ({
  length: system === 'EN' ? 'in' : 'mm',
  lengthLarge: system === 'EN' ? 'ft' : 'm',
  pressure: system === 'EN' ? 'psi' : 'kPa',
  stress: system === 'EN' ? 'psi' : 'MPa',
  force: system === 'EN' ? 'lb' : 'kg',
  density: system === 'EN' ? 'pcf' : 'kN/m³',
  temperature: system === 'EN' ? '°F' : '°C',
});

export const InputParametersCard = ({ mode, input, compact = false }: InputParametersCardProps) => {
  const units = getUnitLabels(input.unitsSystem || 'EN');
  
  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Pipe OD × WT</p>
          <p className="font-medium">{input.pipeOD} × {input.pipeWT} {units.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Depth Cover</p>
          <p className="font-medium">{input.depthCover} {units.lengthLarge}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Code Check</p>
          <p className="font-medium">{input.codeCheck}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Mode</p>
          <p className="font-medium">{getModeShortLabel(mode)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipe Properties */}
      <div>
        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Pipe Properties</h4>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          <ParamItem label="OD" value={input.pipeOD} unit={units.length} />
          <ParamItem label="Wall Thickness" value={input.pipeWT} unit={units.length} />
          <ParamItem label="MOP" value={input.MOP} unit={units.pressure} />
          <ParamItem label="SMYS" value={input.SMYS} unit={units.stress} />
          <ParamItem label="ΔT" value={input.deltaT} unit={units.temperature} />
        </div>
      </div>

      {/* Soil Properties */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Soil Properties</h4>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          <ParamItem label="Soil Density" value={input.soilDensity} unit={units.density} />
          <ParamItem label="Depth Cover" value={input.depthCover} unit={units.lengthLarge} />
          <ParamItem label="Bedding Angle" value={input.beddingAngleDeg} unit="°" />
          <ParamItem label="E' Method" value={input.ePrimeMethod} />
          {input.ePrimeMethod === 'USER_DEFINED' && (
            <ParamItem label="E' (User)" value={input.ePrimeUserDefined} unit={units.pressure} />
          )}
          {input.ePrimeMethod === 'CEPA_TABLE' && (
            <>
              <ParamItem label="Soil Type" value={input.soilType} />
              <ParamItem label="Compaction" value={input.compaction} />
            </>
          )}
          <ParamItem label="Friction Angle" value={input.frictionAngleDeg} unit="°" />
        </div>
      </div>

      {/* Vehicle/Load Properties based on mode */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
          {mode === 'PIPELINE_TRACK' ? 'Track Vehicle' : 
           mode === '2_AXLE' ? '2-Axle Vehicle' : 
           mode === '3_AXLE' ? '3-Axle Vehicle' : 
           mode === 'GRID' ? 'Grid Load' : 'Load'}
        </h4>
        {renderLoadParams(mode, input, units)}
      </div>

      {/* Analysis Parameters */}
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Analysis Parameters</h4>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
          <ParamItem label="Units System" value={input.unitsSystem === 'EN' ? 'English' : 'Metric'} />
          <ParamItem label="Pavement Type" value={input.pavementType} />
          <ParamItem label="Vehicle Class" value={input.vehicleClass} />
          <ParamItem label="Equiv. Stress Method" value={input.equivStressMethod} />
          <ParamItem label="Code Check" value={input.codeCheck} />
        </div>
      </div>
    </div>
  );
};

const ParamItem = ({ label, value, unit }: { label: string; value: any; unit?: string }) => (
  <div className="p-2 bg-muted/30 rounded">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-mono text-sm">
      {value !== undefined && value !== null ? String(value) : '—'}
      {unit && value !== undefined && value !== null && ` ${unit}`}
    </p>
  </div>
);

const getModeShortLabel = (mode: CalculationMode) => {
  switch (mode) {
    case 'PIPELINE_TRACK': return 'Track';
    case '2_AXLE': return '2-Axle';
    case '3_AXLE': return '3-Axle';
    case 'GRID': return 'Grid';
    default: return 'Simple';
  }
};

const renderLoadParams = (mode: CalculationMode, input: any, units: ReturnType<typeof getUnitLabels>) => {
  switch (mode) {
    case 'PIPELINE_TRACK':
      return (
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          <ParamItem label="Track Load" value={input.trackLoad} unit={units.force} />
          <ParamItem label="Track Width" value={input.trackWidth} unit={units.length} />
          <ParamItem label="Track Length" value={input.trackLength} unit={units.length} />
          <ParamItem label="Track Offset" value={input.trackOffsetY} unit={units.lengthLarge} />
        </div>
      );
    case '2_AXLE':
      return (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            <ParamItem label="Axle 1 Load" value={input.axle1Load} unit={units.force} />
            <ParamItem label="Axle 2 Load" value={input.axle2Load} unit={units.force} />
            <ParamItem label="Axle Spacing" value={input.axleSpacing} unit={units.lengthLarge} />
            <ParamItem label="Wheel Spacing" value={input.wheelSpacing} unit={units.length} />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <ParamItem label="Axle 1 Tire Width" value={input.axle1TireWidth} unit={units.length} />
            <ParamItem label="Axle 1 Tire Length" value={input.axle1TireLength} unit={units.length} />
            <ParamItem label="Axle 2 Tire Width" value={input.axle2TireWidth} unit={units.length} />
            <ParamItem label="Axle 2 Tire Length" value={input.axle2TireLength} unit={units.length} />
          </div>
        </div>
      );
    case '3_AXLE':
      return (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-5">
            <ParamItem label="Axle 1 Load" value={input.axle1Load} unit={units.force} />
            <ParamItem label="Axle 2 Load" value={input.axle2Load} unit={units.force} />
            <ParamItem label="Axle 3 Load" value={input.axle3Load} unit={units.force} />
            <ParamItem label="Spacing 1-2" value={input.axleSpacing12} unit={units.lengthLarge} />
            <ParamItem label="Spacing 2-3" value={input.axleSpacing23} unit={units.lengthLarge} />
          </div>
        </div>
      );
    case 'GRID':
      return (
        <div className="grid gap-3 md:grid-cols-4">
          <ParamItem label="Load Type" value={input.loadType} />
          {input.loadType === 'TOTAL_LOAD' && (
            <ParamItem label="Total Load" value={input.totalLoad} unit={units.force} />
          )}
          {input.loadType === 'UNIFORM_PRESSURE' && (
            <ParamItem label="Uniform Pressure" value={input.uniformPressure} unit={units.pressure} />
          )}
          <ParamItem label="Grid Length" value={input.gridLength} unit={units.lengthLarge} />
          <ParamItem label="Grid Width" value={input.gridWidth} unit={units.lengthLarge} />
        </div>
      );
    default:
      return null;
  }
};

export default InputParametersCard;
