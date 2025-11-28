import { UnitsSystem } from './types';

// Diamètres nominaux (NPS) avec OD correspondant
export const PIPE_SIZES = [
  { nps: "2", label: "NPS 2\"", od_in: 2.375, od_mm: 60.3 },
  { nps: "3", label: "NPS 3\"", od_in: 3.5, od_mm: 88.9 },
  { nps: "4", label: "NPS 4\"", od_in: 4.5, od_mm: 114.3 },
  { nps: "6", label: "NPS 6\"", od_in: 6.625, od_mm: 168.3 },
  { nps: "8", label: "NPS 8\"", od_in: 8.625, od_mm: 219.1 },
  { nps: "10", label: "NPS 10\"", od_in: 10.75, od_mm: 273.0 },
  { nps: "12", label: "NPS 12\"", od_in: 12.75, od_mm: 323.8 },
  { nps: "14", label: "NPS 14\"", od_in: 14, od_mm: 355.6 },
  { nps: "16", label: "NPS 16\"", od_in: 16, od_mm: 406.4 },
  { nps: "18", label: "NPS 18\"", od_in: 18, od_mm: 457.2 },
  { nps: "20", label: "NPS 20\"", od_in: 20, od_mm: 508.0 },
  { nps: "24", label: "NPS 24\"", od_in: 24, od_mm: 609.6 },
  { nps: "30", label: "NPS 30\"", od_in: 30, od_mm: 762.0 },
  { nps: "36", label: "NPS 36\"", od_in: 36, od_mm: 914.4 },
  { nps: "42", label: "NPS 42\"", od_in: 42, od_mm: 1066.8 },
  { nps: "48", label: "NPS 48\"", od_in: 48, od_mm: 1219.2 },
  { nps: "CUSTOM", label: "Custom", od_in: null, od_mm: null },
];

// Épaisseurs de paroi par NPS (schedules standards)
export const WALL_THICKNESS_BY_NPS: Record<string, Array<{schedule: string, wt_in: number, wt_mm: number}>> = {
  "2": [
    { schedule: "STD (0.154\")", wt_in: 0.154, wt_mm: 3.91 },
    { schedule: "XS (0.218\")", wt_in: 0.218, wt_mm: 5.54 },
    { schedule: "XXS (0.343\")", wt_in: 0.343, wt_mm: 8.71 },
  ],
  "3": [
    { schedule: "STD (0.216\")", wt_in: 0.216, wt_mm: 5.49 },
    { schedule: "XS (0.300\")", wt_in: 0.300, wt_mm: 7.62 },
    { schedule: "XXS (0.437\")", wt_in: 0.437, wt_mm: 11.10 },
  ],
  "4": [
    { schedule: "STD (0.237\")", wt_in: 0.237, wt_mm: 6.02 },
    { schedule: "XS (0.337\")", wt_in: 0.337, wt_mm: 8.56 },
    { schedule: "XXS (0.531\")", wt_in: 0.531, wt_mm: 13.49 },
  ],
  "6": [
    { schedule: "STD (0.280\")", wt_in: 0.280, wt_mm: 7.11 },
    { schedule: "XS (0.432\")", wt_in: 0.432, wt_mm: 10.97 },
    { schedule: "XXS (0.718\")", wt_in: 0.718, wt_mm: 18.24 },
  ],
  "8": [
    { schedule: "STD (0.322\")", wt_in: 0.322, wt_mm: 8.18 },
    { schedule: "XS (0.500\")", wt_in: 0.500, wt_mm: 12.70 },
    { schedule: "XXS (0.875\")", wt_in: 0.875, wt_mm: 22.23 },
  ],
  "10": [
    { schedule: "STD (0.365\")", wt_in: 0.365, wt_mm: 9.27 },
    { schedule: "XS (0.500\")", wt_in: 0.500, wt_mm: 12.70 },
    { schedule: "XXS (1.000\")", wt_in: 1.000, wt_mm: 25.40 },
  ],
  "12": [
    { schedule: "STD (0.375\")", wt_in: 0.375, wt_mm: 9.53 },
    { schedule: "XS (0.500\")", wt_in: 0.500, wt_mm: 12.70 },
    { schedule: "XXS (1.000\")", wt_in: 1.000, wt_mm: 25.40 },
  ],
  "14": [
    { schedule: "STD (0.375\")", wt_in: 0.375, wt_mm: 9.53 },
    { schedule: "XS (0.500\")", wt_in: 0.500, wt_mm: 12.70 },
    { schedule: "XXS (0.750\")", wt_in: 0.750, wt_mm: 19.05 },
  ],
  "16": [
    { schedule: "STD (0.375\")", wt_in: 0.375, wt_mm: 9.53 },
    { schedule: "XS (0.500\")", wt_in: 0.500, wt_mm: 12.70 },
    { schedule: "XXS (0.843\")", wt_in: 0.843, wt_mm: 21.41 },
  ],
  "18": [
    { schedule: "STD (0.375\")", wt_in: 0.375, wt_mm: 9.53 },
    { schedule: "XS (0.500\")", wt_in: 0.500, wt_mm: 12.70 },
    { schedule: "XXS (0.937\")", wt_in: 0.937, wt_mm: 23.80 },
  ],
  "20": [
    { schedule: "STD (0.375\")", wt_in: 0.375, wt_mm: 9.53 },
    { schedule: "XS (0.500\")", wt_in: 0.500, wt_mm: 12.70 },
    { schedule: "XXS (1.031\")", wt_in: 1.031, wt_mm: 26.19 },
  ],
  "24": [
    { schedule: "STD (0.375\")", wt_in: 0.375, wt_mm: 9.53 },
    { schedule: "XS (0.500\")", wt_in: 0.500, wt_mm: 12.70 },
    { schedule: "XXS (0.687\")", wt_in: 0.687, wt_mm: 17.45 },
  ],
  "30": [
    { schedule: "STD (0.375\")", wt_in: 0.375, wt_mm: 9.53 },
    { schedule: "XS (0.500\")", wt_in: 0.500, wt_mm: 12.70 },
    { schedule: "0.625\"", wt_in: 0.625, wt_mm: 15.88 },
  ],
  "36": [
    { schedule: "STD (0.375\")", wt_in: 0.375, wt_mm: 9.53 },
    { schedule: "XS (0.500\")", wt_in: 0.500, wt_mm: 12.70 },
    { schedule: "0.625\"", wt_in: 0.625, wt_mm: 15.88 },
    { schedule: "0.750\"", wt_in: 0.750, wt_mm: 19.05 },
  ],
  "42": [
    { schedule: "0.375\"", wt_in: 0.375, wt_mm: 9.53 },
    { schedule: "0.500\"", wt_in: 0.500, wt_mm: 12.70 },
    { schedule: "0.625\"", wt_in: 0.625, wt_mm: 15.88 },
    { schedule: "0.750\"", wt_in: 0.750, wt_mm: 19.05 },
  ],
  "48": [
    { schedule: "0.375\"", wt_in: 0.375, wt_mm: 9.53 },
    { schedule: "0.500\"", wt_in: 0.500, wt_mm: 12.70 },
    { schedule: "0.625\"", wt_in: 0.625, wt_mm: 15.88 },
    { schedule: "0.750\"", wt_in: 0.750, wt_mm: 19.05 },
  ],
  "CUSTOM": [],
};

// Grades d'acier avec SMYS en psi ET MPa (PAS kPa!)
export const STEEL_GRADES = [
  { grade: "API 5L Grade B", label: "Grade B", smys_psi: 35000, smys_mpa: 241 },
  { grade: "API 5L X42", label: "X42", smys_psi: 42000, smys_mpa: 290 },
  { grade: "API 5L X46", label: "X46", smys_psi: 46000, smys_mpa: 317 },
  { grade: "API 5L X52", label: "X52", smys_psi: 52000, smys_mpa: 359 },
  { grade: "API 5L X56", label: "X56", smys_psi: 56000, smys_mpa: 386 },
  { grade: "API 5L X60", label: "X60", smys_psi: 60000, smys_mpa: 414 },
  { grade: "API 5L X65", label: "X65", smys_psi: 65000, smys_mpa: 448 },
  { grade: "API 5L X70", label: "X70", smys_psi: 70000, smys_mpa: 483 },
  { grade: "API 5L X80", label: "X80", smys_psi: 80000, smys_mpa: 552 },
  { grade: "CUSTOM", label: "Custom", smys_psi: null, smys_mpa: null },
];

// Helper pour obtenir les options de WT pour un NPS donné
export function getWallThicknessOptions(nps: string) {
  const options = WALL_THICKNESS_BY_NPS[nps] || [];
  return [...options, { schedule: "Custom", wt_in: null, wt_mm: null }];
}

// Helper pour obtenir les valeurs selon le système d'unités
export function getPipeOD(nps: string, unitsSystem: UnitsSystem): number | null {
  const pipe = PIPE_SIZES.find(p => p.nps === nps);
  if (!pipe) return null;
  return unitsSystem === "EN" ? pipe.od_in : pipe.od_mm;
}

export function getWallThickness(nps: string, schedule: string, unitsSystem: UnitsSystem): number | null {
  const options = WALL_THICKNESS_BY_NPS[nps];
  if (!options) return null;
  const wt = options.find(w => w.schedule === schedule);
  if (!wt) return null;
  return unitsSystem === "EN" ? wt.wt_in : wt.wt_mm;
}

export function getSMYS(grade: string, unitsSystem: UnitsSystem): number | null {
  const steel = STEEL_GRADES.find(s => s.grade === grade);
  if (!steel) return null;
  return unitsSystem === "EN" ? steel.smys_psi : steel.smys_mpa;
}
