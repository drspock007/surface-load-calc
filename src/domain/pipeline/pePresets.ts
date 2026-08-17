/**
 * Polyethylene (PE) pipe presets — CSA B137.4 (PE pipe for gas) / ASTM D2513 sizing.
 *
 * Sources (values centralized here so they can be reviewed / adjusted easily):
 * - CSA B137.4: PE pipe dimensions (IPS and CTS series), DR based wall thickness.
 * - PPI TR-4 / CSA B137.4: HDB at 23 °C — PE2708 = 1250 psi (8.62 MPa),
 *   PE4710 = 1600 psi (11.03 MPa).
 * - PPI TR-3 design factor for gas service: 0.32 (PE2708) and 0.40 (PE4710).
 * - Apparent modulus of elasticity (PPI Handbook Chapter 6, 23 °C):
 *   short term (live/traffic loading) and 50-year long term (soil loading).
 */

import { UnitsSystem } from './types';

export interface PeSizePreset {
  id: string;
  label: string;
  series: 'IPS' | 'CTS' | 'CUSTOM';
  od_in: number | null;
  od_mm: number | null;
}

/** CSA B137.4 nominal sizes: CTS (small services) + IPS (mains) */
export const PE_SIZES: PeSizePreset[] = [
  { id: 'CTS-1/2', label: 'CTS 1/2"', series: 'CTS', od_in: 0.625, od_mm: 15.9 },
  { id: 'CTS-3/4', label: 'CTS 3/4"', series: 'CTS', od_in: 0.875, od_mm: 22.2 },
  { id: 'CTS-1', label: 'CTS 1"', series: 'CTS', od_in: 1.125, od_mm: 28.6 },
  { id: 'IPS-1/2', label: 'IPS 1/2"', series: 'IPS', od_in: 0.840, od_mm: 21.3 },
  { id: 'IPS-3/4', label: 'IPS 3/4"', series: 'IPS', od_in: 1.050, od_mm: 26.7 },
  { id: 'IPS-1', label: 'IPS 1"', series: 'IPS', od_in: 1.315, od_mm: 33.4 },
  { id: 'IPS-1 1/4', label: 'IPS 1 1/4"', series: 'IPS', od_in: 1.660, od_mm: 42.2 },
  { id: 'IPS-1 1/2', label: 'IPS 1 1/2"', series: 'IPS', od_in: 1.900, od_mm: 48.3 },
  { id: 'IPS-2', label: 'IPS 2"', series: 'IPS', od_in: 2.375, od_mm: 60.3 },
  { id: 'IPS-3', label: 'IPS 3"', series: 'IPS', od_in: 3.500, od_mm: 88.9 },
  { id: 'IPS-4', label: 'IPS 4"', series: 'IPS', od_in: 4.500, od_mm: 114.3 },
  { id: 'IPS-6', label: 'IPS 6"', series: 'IPS', od_in: 6.625, od_mm: 168.3 },
  { id: 'IPS-8', label: 'IPS 8"', series: 'IPS', od_in: 8.625, od_mm: 219.1 },
  { id: 'IPS-10', label: 'IPS 10"', series: 'IPS', od_in: 10.750, od_mm: 273.1 },
  { id: 'IPS-12', label: 'IPS 12"', series: 'IPS', od_in: 12.750, od_mm: 323.9 },
  { id: 'IPS-16', label: 'IPS 16"', series: 'IPS', od_in: 16.000, od_mm: 406.4 },
  { id: 'CUSTOM', label: 'Custom', series: 'CUSTOM', od_in: null, od_mm: null },
];

/** Standard dimension ratios of CSA B137.4 */
export const PE_DIMENSION_RATIOS = [7.3, 9, 9.3, 11, 13.5, 15.5, 17, 21, 26];

export interface PeMaterialPreset {
  designation: string;
  label: string;
  hdb_psi: number;
  hdb_mpa: number;
  designFactor: number; // gas service design factor (PPI TR-3)
  modulusShort_psi: number; // short term apparent modulus (live loads)
  modulusLong_psi: number; // 50-year apparent modulus (soil loads)
  poisson: number;
  alpha_perF: number; // thermal expansion coefficient
}

export const PE_MATERIALS: PeMaterialPreset[] = [
  {
    designation: 'PE2708',
    label: 'PE2708 (MDPE)',
    hdb_psi: 1250,
    hdb_mpa: 8.62,
    designFactor: 0.32,
    modulusShort_psi: 88000,
    modulusLong_psi: 28000,
    poisson: 0.45,
    alpha_perF: 1.0e-4,
  },
  {
    designation: 'PE4710',
    label: 'PE4710 (HDPE)',
    hdb_psi: 1600,
    hdb_mpa: 11.03,
    designFactor: 0.40,
    modulusShort_psi: 130000,
    modulusLong_psi: 29000,
    poisson: 0.45,
    alpha_perF: 8.0e-5,
  },
];

export const DEFAULT_PE_DESIGNATION = 'PE4710';
export const DEFAULT_PE_SIZE_ID = 'IPS-4';
export const DEFAULT_PE_DR = 11;
export const DEFAULT_PE_DEFLECTION_LIMIT_PCT = 5;
export const DEFAULT_PE_STRAIN_LIMIT_PCT = 5;

export function getPeMaterial(designation?: string): PeMaterialPreset {
  return (
    PE_MATERIALS.find((m) => m.designation === designation) ??
    PE_MATERIALS.find((m) => m.designation === DEFAULT_PE_DESIGNATION)!
  );
}

export function getPeSize(id?: string): PeSizePreset | null {
  return PE_SIZES.find((s) => s.id === id) ?? null;
}

/** Outside diameter of a PE size preset in the user's unit system */
export function getPeOD(id: string, units: UnitsSystem): number | null {
  const size = getPeSize(id);
  if (!size) return null;
  return units === 'EN' ? size.od_in : size.od_mm;
}

/** Wall thickness from OD and DR (same unit as OD) */
export function getPeWallThickness(od: number, dr: number): number {
  if (!od || !dr) return 0;
  return Math.round((od / dr) * 1000) / 1000;
}

/** Temperature de-rating factor for PE (PPI TR-4, service temperature in °C) */
export function getPeTemperatureFactor(tempC: number): number {
  if (tempC <= 23) return 1.0;
  if (tempC <= 30) return 0.9;
  if (tempC <= 40) return 0.78;
  if (tempC <= 50) return 0.63;
  return 0.5;
}
