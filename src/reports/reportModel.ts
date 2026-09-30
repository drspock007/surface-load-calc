import type { CalculationRun } from '@/types/calculation';

export type ReportStatus = 'PASS' | 'FAIL' | 'N/A';
export interface ReportTable { title: string; columns: string[]; rows: string[][]; note?: string }
export interface ReportModel {
  name: string; id: string; calculatedAt: string; mode: string; material: string;
  units: string; status: ReportStatus; stale: boolean;
  summary: ReportTable[]; inputs: ReportTable[]; checks: ReportTable[]; appendix: ReportTable[];
}
export interface ReportOptions { stale?: boolean; timeZone?: string }

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => value && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : {};
const get = (value: unknown, path: string): unknown => path.split('.').reduce<unknown>((obj, key) => record(obj)[key], value);
const labels: Record<string, string> = {
  PIPELINE_TRACK: 'Track vehicle', '2_AXLE': '2-axle vehicle', '3_AXLE': '3-axle vehicle', GRID: 'Grid load', SIMPLE: 'Simple surface load',
  STEEL: 'Steel', PE: 'Polyethylene', PRISM: 'Prism', TRAP_DOOR: 'Trap door', LOOKUP: 'Lookup table', USER_DEFINED: 'User defined',
  FINE: 'Fine-grained soil', COARSE_WITH_FINES: 'Coarse-grained soil with fines', COARSE_NO_FINES: 'Coarse-grained soil with little or no fines',
  FLEXIBLE: 'Flexible', RIGID: 'Rigid', HIGHWAY: 'Highway', FARM: 'Farm / construction', TRACK: 'Track',
  VON_MISES: 'Von Mises', TRESCA: 'Tresca', B31_4: 'ASME B31.4', B31_8: 'ASME B31.8', CSA_Z662: 'CSA Z662',
  MANUAL: 'Manual', AUTO: 'Automatic', CUSTOM: 'Custom', SHORT_TERM: 'Short term', LONG_TERM: 'Long term', TOTAL_LOAD: 'Total load', UNIFORM_PRESSURE: 'Uniform pressure',
};
export function formatReportValue(value: unknown): string {
  if (value === undefined || value === null || value === '' || (typeof value === 'number' && !Number.isFinite(value))) return 'N/A';
  if (typeof value === 'number') return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 4 }).format(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return typeof value === 'string' ? labels[value] ?? value : 'N/A';
}
const status = (value: unknown): ReportStatus => value === true ? 'PASS' : value === false ? 'FAIL' : 'N/A';
type Field = [path: string, label: string, unit?: string];
const table = (title: string, source: unknown, fields: Field[], note?: string): ReportTable => ({
  title, columns: ['Parameter', 'Value', 'Unit'],
  rows: fields.map(([path, label, unit]) => [label, formatReportValue(get(source, path)), unit || '-']), note,
});

export function buildReportModel(run: CalculationRun, options: ReportOptions = {}): ReportModel {
  const input = record(run.input), result = record(run.result);
  const si = input.unitsSystem === 'SI';
  const knownUnits = input.unitsSystem === 'EN' || si;
  const unit = (metric: string, english: string) => knownUnits ? si ? metric : english : 'N/A';
  const small = unit('mm', 'in'), large = unit('m', 'ft'), pressure = unit('kPa', 'psi'), strength = unit('MPa', 'psi'), force = unit('kg', 'lb');
  // Older saved runs predate pipeMaterial; those calculations used steel.
  const pe = input.pipeMaterial === 'PE' || !!result.peResults;
  const zone = options.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = typeof run.timestamp === 'number' && Number.isFinite(run.timestamp) ? new Date(run.timestamp) : null;
  const model: ReportModel = {
    name: typeof input.calculationName === 'string' && input.calculationName.trim() ? input.calculationName.trim() : 'Untitled calculation',
    id: formatReportValue(run.id), calculatedAt: date && !Number.isNaN(date.getTime()) ? `${new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'long', timeZone: zone }).format(date)} (${zone})` : 'N/A',
    mode: formatReportValue(run.mode), material: run.mode === 'SIMPLE' ? 'N/A' : pe ? 'Polyethylene' : 'Steel',
    units: knownUnits ? si ? 'SI / Metric' : 'English / Imperial' : 'N/A',
    status: status(get(result, pe ? 'peResults.overallPass' : 'passFailSummary.overallPass')),
    stale: options.stale === true, summary: [], inputs: [], checks: [], appendix: [],
  };
  if (run.mode === 'SIMPLE') {
    model.units = 'SI / Metric';
    model.inputs.push(table('Surface load inputs', input, [['loadMagnitude', 'Load magnitude', 'kN'], ['depth', 'Depth below surface', 'm'], ['loadLength', 'Load length', 'm'], ['loadWidth', 'Load width', 'm'], ['soilUnitWeight', 'Soil unit weight', 'kg/m³']]));
    model.summary.push(table('Results', result, [['surfaceStress', 'Surface stress', 'kPa'], ['stressAtDepth', 'Stress at depth', 'kPa'], ['totalStress', 'Total stress', 'kPa'], ['loadArea', 'Load area', 'm²'], ['contactPressure', 'Contact pressure', 'kPa']]));
    return model;
  }
  model.summary.push(table('Key results', result, [['maxSurfacePressureOnPipe', 'Maximum surface pressure on pipe', pressure], ['locationMaxLoad', 'Maximum pressure location'], ['impactFactorUsed', 'Impact factor'], ['soilLoadOnPipe', 'Soil pressure on pipe', pressure], ['ePrimeUsed', "Soil reaction modulus E′", pressure]]));
  const pipeFields: Field[] = [['pipeOD', 'Outer diameter', small], ['pipeWT', 'Wall thickness', small], ['MOP', 'Maximum operating pressure', pressure]];
  if (pe) pipeFields.push(['peSizeId', 'Nominal size'], ['peDesignation', 'Material designation'], ['dimensionRatio', 'Dimension ratio DR'], ['peServiceTempC', 'Service temperature', '°C'], ['peModulusMode', 'Modulus method']);
  else pipeFields.push(['SMYS', 'Specified minimum yield strength', strength], ['deltaT', 'Temperature change ΔT', unit('°C', '°F')]);
  if (pe && input.peModulusMode === 'CUSTOM') pipeFields.push(['peModulus', 'Custom modulus', strength]);
  if (pe) for (const f of [['peHDB', 'Hydrostatic design basis override', strength], ['peDeflectionLimitPct', 'Deflection limit', '%'], ['peStrainLimitPct', 'Strain limit', '%']] as Field[]) if (input[f[0]] !== undefined) pipeFields.push(f);
  model.inputs.push(table('Pipe properties', input, pipeFields));
  const soil: Field[] = [['soilDensity', 'Soil density', unit('kg/m³', 'lb/ft³')], ['depthCover', 'Cover depth', large], ['beddingAngleDeg', 'Bedding angle', '°'], ['soilLoadMethod', 'Soil load method'], ['ePrimeMethod', 'Soil reaction modulus method']];
  if (input.soilLoadMethod === 'TRAP_DOOR') soil.push(['frictionAngleDeg', 'Friction angle', '°'], ['soilCohesion', 'Soil cohesion', pressure], ['kr', 'Lateral earth pressure coefficient']);
  if (input.ePrimeMethod === 'USER_DEFINED') soil.push(['ePrimeUserDefined', 'User-defined soil reaction modulus', pressure]);
  else soil.push(['soilType', 'Soil type'], ['compaction', 'Compaction', '%']);
  model.inputs.push(table('Soil properties', input, soil));
  if (run.mode === 'PIPELINE_TRACK') model.inputs.push(table('Track loading', input, [['trackLength', 'Track length', small], ['trackWidth', 'Track width', small], ['trackSeparation', 'Track separation', small], ['trackVehicleWeight', 'Vehicle weight', force]]));
  if (run.mode === '2_AXLE' || run.mode === '3_AXLE') {
    const load: Field[] = run.mode === '2_AXLE' ? [['axleSpacing', 'Axle spacing', large]] : [['axle1To2Spacing', 'Axle 1 to 2 spacing', large], ['axle2To3Spacing', 'Axle 2 to 3 spacing', large]];
    load.push(['axleWidth', 'Axle width', small], ['laneOffset', 'Lane offset', large], ['contactPatchMode', 'Contact patch method']);
    for (let n = 1; n <= (run.mode === '2_AXLE' ? 2 : 3); n++) {
      load.push([`axle${n}Load`, `Axle ${n} load`, force], [`axle${n}TireWidth`, `Axle ${n} tire width`, small], [`axle${n}TireLength`, `Axle ${n} contact length (stored)`, small]);
      if (input.contactPatchMode === 'AUTO') load.push([`axle${n}TirePressure`, `Axle ${n} tire pressure`, formatReportValue(input[`axle${n}TirePressureUnit`]).replace('kg/m2', 'kg/m²')], [`axle${n}TiresPerAxle`, `Axle ${n} tire count`]);
    }
    model.inputs.push(table('Vehicle loading', input, load));
  }
  if (run.mode === 'GRID') model.inputs.push(table('Grid loading', input, [['loadType', 'Load definition'], input.loadType === 'UNIFORM_PRESSURE' ? ['uniformPressure', 'Uniform pressure', pressure] : ['totalLoad', 'Total load', force], ['gridLength', 'Loaded area length', large], ['gridWidth', 'Loaded area width', large], ['gridOffsetX', 'Lateral offset', large], ['gridOffsetY', 'Longitudinal offset', large], ['gridDivisionsX', 'Grid divisions X'], ['gridDivisionsY', 'Grid divisions Y']]));
  const analysis: Field[] = [['pavementType', 'Pavement'], ['vehicleClass', 'Vehicle class']];
  if (!pe) analysis.push(['equivStressMethod', 'Equivalent stress method'], ['codeCheck', 'Code check'], ['enableBendRadius', 'Bend radius analysis']);
  if (!pe && input.codeCheck === 'USER_DEFINED') analysis.push(['userDefinedLimits.hoopLimitPct', 'Hoop limit', '% SMYS'], ['userDefinedLimits.longLimitPct', 'Longitudinal limit', '% SMYS'], ['userDefinedLimits.equivLimitPct', 'Equivalent limit', '% SMYS']);
  model.inputs.push(table('Analysis parameters', input, analysis));
  if (pe) {
    const checks = record(result.peResults);
    model.checks.push({ title: 'Polyethylene checks (CSA B137.4)', columns: ['Check', 'Value', 'Limit', 'Unit', 'Utilization %', 'Status'], rows: [
      ['ringDeflectionPct', 'Ring deflection', '%'], ['bendingStrainPct', 'Wall bending strain', '%'], ['internalPressure', 'Internal pressure', pressure], ['buckling', 'Buckling', pressure],
    ].map(([key, label, u]) => [label, formatReportValue(get(checks, `${key}.value`)), formatReportValue(get(checks, `${key}.limit`)), u, formatReportValue(get(checks, `${key}.utilizationPct`)), status(get(checks, `${key}.pass`))]) });
    model.checks.push(table('PE design values', checks, [['designation', 'Designation'], ['dimensionRatio', 'Dimension ratio'], ['hdb', 'Hydrostatic design basis', strength], ['designFactor', 'Design factor'], ['temperatureFactor', 'Temperature factor'], ['modulusLive', 'Modulus for live load', strength], ['modulusSoil', 'Modulus for soil load', strength], ['allowablePressure', 'Allowable internal pressure', pressure], ['criticalBucklingPressure', 'Critical buckling pressure', pressure], ['bucklingSafetyFactor', 'Buckling safety factor']]));
  } else {
    model.checks.push(table('Applied limits', result.limitsUsed, [['codeLabel', 'Code'], ['hoopLimitPct', 'Hoop limit', '% SMYS'], ['longLimitPct', 'Longitudinal limit', '% SMYS'], ['equivLimitPct', 'Equivalent limit', '% SMYS'], ['usesSustainedLongCheck', 'Sustained longitudinal check applied']], 'Statuses below are the stored engine checks, including any code-specific sustained longitudinal check.'));
    const rows: string[][] = [], components: string[][] = [];
    for (const [condition, label, suffix] of [['atZeroPressure', 'Zero pressure', 'AtZero'], ['atMOP', 'At MOP', 'AtMOP']]) {
      for (const [kind, name] of [['hoop', 'Hoop'], ['longitudinal', 'Longitudinal'], ['equivalent', 'Equivalent']]) {
        const stress = get(result, `stresses.${condition}.${kind}`);
        rows.push([label, name, formatReportValue(get(stress, 'high')), formatReportValue(get(stress, 'low')), kind === 'equivalent' ? formatReportValue(get(stress, 'percentSMYS')) : '-', status(get(result, `passFailSummary.${kind}${suffix}`))]);
        if (kind !== 'equivalent') components.push([label, name, ...['pressure', 'earth', 'thermal', 'total'].map(key => formatReportValue(get(stress, `components.${key}`)))]);
      }
    }
    model.checks.push({ title: `Stress results (${pressure})`, columns: ['Condition', 'Stress', 'High', 'Low', '% SMYS¹', 'Status'], rows, note: '¹ Stored equivalent stress / SMYS. Other percentages are not recomputed by the report.' });
    model.appendix.push({ title: `Stress components (${pressure})`, columns: ['Condition', 'Stress', 'Pressure', 'Earth', 'Thermal', 'Total'], rows: components });
    model.summary.push(table('Additional results', result, [['allowableStress', 'Allowable stress (stored)', pressure], ['deflectionRatio', 'Deflection ratio']]));
  }
  if (result.bendRadius) {
    const bend = record(result.bendRadius);
    model.checks.push(table('Bend radius analysis', bend, [['hasMargin', 'Positive longitudinal margin'], ['governingCondition', 'Governing condition'], ...(bend.hasMargin === true ? [['minRadius', 'Minimum radius', large] as Field] : []), ['sigmaRemaining', 'Remaining stress margin', pressure], ['marginZero', 'Margin at zero pressure', pressure], ['marginMOP', 'Margin at MOP', pressure]], bend.hasMargin === false ? 'No bend is permissible under the stored loading conditions.' : undefined));
  }
  const debug = record(result.debug);
  const debugFields: Field[] = [
    ['soilPressure_psi', 'Soil pressure', pressure], ['boussinesqMax_psi', 'Maximum Boussinesq pressure', pressure], ['impactFactorDepth', 'Depth impact factor'], ['Kb', 'Bending coefficient Kb'], ['Kz', 'Deflection coefficient Kz'], ['Theta', 'Bedding parameter θ', '°'], ['ePrime_psi', 'Soil reaction modulus E′', pressure],
    ['hoopSoil_psi', 'Hoop stress - soil', pressure], ['hoopLive_psi', 'Hoop stress - live load', pressure], ['hoopInt_psi', 'Hoop stress - internal pressure', pressure], ['longSoil_psi', 'Longitudinal stress - soil', pressure], ['longLive_psi', 'Longitudinal stress - live load', pressure], ['longInt_psi', 'Longitudinal stress - internal pressure', pressure], ['longTherm_psi', 'Longitudinal stress - thermal', pressure],
    // Only the track engine converts this field to kPa; other engines retain psf.
    ['contactPressure_psf', 'Contact pressure', run.mode === 'PIPELINE_TRACK' && si ? 'kPa' : 'psf'], ['influenceFactor', 'Influence factor'],
    ['bsnqSUM1_psi', 'Boussinesq sum 1', 'psi'], ['bsnqSUM2_psi', 'Boussinesq sum 2', 'psi'], ['axleLoad_lb', 'Axle load', 'lb'], ['pointLoad_lb', 'Point load', 'lb'], ['nW', 'Width subdivisions'], ['nL', 'Length subdivisions'], ['momentMAX_lbin', 'Maximum bending moment', 'lb·in'], ['longLiveLocal_psi', 'Local longitudinal live stress', 'psi'], ['longLiveBend_psi', 'Bending longitudinal live stress', 'psi'],
  ];
  if (Object.keys(debug).length) model.appendix.unshift(table('Intermediate values', debug, debugFields.filter(([key]) => key in debug), 'Stored intermediate values. Units follow each engine’s output convention; field-name suffixes do not always represent the stored units.'));
  return model;
}

export function reportFilename(name: string): string {
  const printable = Array.from(name.normalize('NFC'), char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127 ? '-' : char).join('');
  const safe = printable.replace(/[<>:"/\\|?*]/g, '-').replace(/\s+/g, ' ').replace(/^[. ]+|[. ]+$/g, '').slice(0, 100).trim() || 'calculation';
  return `${safe}-report.pdf`;
}
