import { calculateContactPatch, convertTirePressureToPsi } from './tirePatchCalculations';
import type { TirePressureUnit } from './types';

export type ContactMethod = 'MANUAL' | 'AUTO' | 'GROUND_PRESSURE';
export const contactMethodLabels: Record<ContactMethod, string> = {
  MANUAL: 'Contact dimensions', AUTO: 'Tire inflation pressure (estimate)', GROUND_PRESSURE: 'Manufacturer ground pressure',
};
export interface AxleContact {
  axle: number;
  method: ContactMethod;
  tireCount: number;
  loadPerTire_lb: number;
  width_in: number;
  length_in: number;
  area_in2: number;
  pressure_psi: number;
}
// Imperial snapshot shared by the engines, live preview and report. No pipe calculation here.
export function calculateAxleContact(input: object, axle: number): AxleContact {
  const data = input as Record<string, unknown>;
  const prefix = `axle${axle}`;
  const num = (suffix: string) => data[prefix + suffix] as number;
  const positive = (value: number, label: string) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) throw new Error(`Axle ${axle}: ${label} must be positive.`);
    return value;
  };
  const method = data.contactPatchMode as ContactMethod;
  if (!(method in contactMethodLabels)) throw new Error('Select a contact patch method.');
  const si = data.unitsSystem === 'SI';
  const load = positive(num('Load'), 'load') * (si ? 2.2046226218 : 1);
  const width = positive(num('TireWidth'), 'tire width') * (si ? 0.03937007874016 : 1);
  const count = num('TiresPerAxle') ?? (method === 'MANUAL' ? 2 : undefined);
  if (count !== 2 && count !== 4) throw new Error(`Axle ${axle}: select 2 or 4 tires.`);
  let length: number;
  if (method === 'MANUAL') {
    length = positive(num('TireLength'), 'contact length') * (si ? 0.03937007874016 : 1);
  } else {
    const key = method === 'GROUND_PRESSURE' ? 'GroundPressure' : 'TirePressure';
    const pressure = positive(num(key), method === 'GROUND_PRESSURE' ? 'ground pressure' : 'inflation pressure');
    const unit = (data[prefix + key + 'Unit'] ?? 'kPa') as TirePressureUnit;
    const psi = positive(convertTirePressureToPsi(pressure, unit), 'pressure');
    length = calculateContactPatch(load, psi, count, width).contactLength_in;
  }
  const area = width * length;
  return { axle, method, tireCount: count, loadPerTire_lb: load / count, width_in: width, length_in: length, area_in2: area, pressure_psi: load / count / area };
}
