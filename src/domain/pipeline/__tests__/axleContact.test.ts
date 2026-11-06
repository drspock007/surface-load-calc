import { describe, expect, it } from 'vitest';
import { calculateAxleContact } from '../axleContact';
import { calculate2AxleVehicleVBA } from '../vba2AxleEngine';
import { calculate3AxleVehicleVBA } from '../vba3AxleEngine';
import { exampleRun } from '@/reports/__tests__/fixtures';
import { buildReportModel } from '@/reports/reportModel';

describe('Manufacturer ground contact', () => {
  for (const mode of ['2_AXLE', '3_AXLE'] as const) for (const units of ['SI', 'EN'] as const) for (const count of [2, 4]) {
    it(`${mode} ${units}, ${count} tires: matches equivalent manual geometry`, () => {
      const input = exampleRun(mode, units).input;
      input.contactPatchMode = 'GROUND_PRESSURE';
      input.contactPressureReference = 'Volvo A40G — loaded / 29.5R25';
      for (let n = 1; n <= 3; n++) {
        input[`axle${n}GroundPressure`] = n === 1 ? 139 : 167;
        input[`axle${n}GroundPressureUnit`] = 'kPa';
        input[`axle${n}TiresPerAxle`] = count;
        input[`axle${n}TirePressure`] = 8; // independent inflation draft
      }
      const calculate = mode === '2_AXLE' ? calculate2AxleVehicleVBA : calculate3AxleVehicleVBA;
      const result = calculate(input);
      const manual = { ...input, contactPatchMode: 'MANUAL' };
      for (const c of result.tireContacts!) {
        expect(c.pressure_psi * 6.894757293168).toBeCloseTo(c.axle === 1 ? 139 : 167, 3);
        expect(c.area_in2 * c.pressure_psi * count).toBeCloseTo(input[`axle${c.axle}Load`] * (units === 'SI' ? 2.2046226218 : 1), 3);
        manual[`axle${c.axle}TireLength`] = c.length_in * (units === 'SI' ? 25.4 : 1);
      }
      expect(calculate(manual).maxSurfacePressureOnPipe).toBeCloseTo(result.maxSurfacePressureOnPipe, 6);
      const run = { ...exampleRun(mode, units), input, result };
      const model = buildReportModel(run);
      expect(JSON.stringify(model)).toContain('Manufacturer ground pressure');
      expect(JSON.stringify(model)).toContain(input.contactPressureReference);
      expect(model.inputs.filter(t => /Axle \d ground contact/.test(t.title))).toHaveLength(mode === '2_AXLE' ? 2 : 3);
      // PDF uses the saved contact snapshot, even if the input projection is incomplete.
      run.input.axle1GroundPressure = 999;
      const savedTable = buildReportModel(run).inputs.find(t => t.title === 'Axle 1 ground contact')!;
      const exported = savedTable.rows.find(r => r[0] === 'Average ground contact pressure')!;
      expect(Number(exported[1])).toBeCloseTo(units === 'SI' ? 139 : 139 * 0.1450378911491, 3);
    });
  }
  it('distinguishes inflation estimates and manual pressures', () => {
    const input = { ...exampleRun().input, contactPatchMode: 'AUTO', axle1TirePressure: 8, axle1TirePressureUnit: 'bar', axle1TiresPerAxle: 2 };
    const inflation = calculateAxleContact(input, 1);
    expect(inflation.pressure_psi).toBeCloseTo(8 * 14.5038);
    const manual = calculateAxleContact({ ...input, contactPatchMode: 'MANUAL', axle1TireLength: 300 }, 1);
    expect(manual.area_in2).toBeCloseTo(input.axle1TireWidth * 300 / (25.4 ** 2));
  });
  it('rejects missing, empty, zero and nonfinite manufacturer pressure', () => {
    for (const value of [undefined, '', 0, -1, NaN, Infinity]) {
      expect(() => calculateAxleContact({ ...exampleRun().input, contactPatchMode: 'GROUND_PRESSURE', axle1GroundPressure: value, axle1TiresPerAxle: 2 }, 1)).toThrow('ground pressure');
    }
  });
  it('older reports show N/A without inventing contact data', () => {
    const run = exampleRun(); delete run.result.tireContacts;
    const table = buildReportModel(run).inputs.find(t => t.title === 'Axle 1 ground contact')!;
    expect(table.rows.every(r => r[1] === 'N/A')).toBe(true);
    expect(table.note).toContain('older calculation');
  });
});
