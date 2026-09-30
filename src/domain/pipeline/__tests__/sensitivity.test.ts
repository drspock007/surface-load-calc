import { describe, expect, it } from 'vitest';
import { exampleRun, reportModes } from '@/reports/__tests__/fixtures';
import { runScenario, generateSensitivitySweep, exportToCSV } from '../sensitivity';

describe('Sensitivity normalization', () => {
  for (const mode of reportModes) for (const units of ['SI', 'EN'] as const) {
    it(`${mode} ${units}: matches engine percentages, custom limits and status`, () => {
      const run = exampleRun(mode, units);
      const actual = runScenario(run.input, { depthCover: run.input.depthCover }, mode);
      const smys = run.input.SMYS * (units === 'SI' ? 1000 : 1);
      expect(actual.hoopPctSmysMopHigh * 100).toBeCloseTo(Math.abs(run.result.stresses.atMOP.hoop.high) / smys * 100);
      expect(actual.longPctSmysMopHigh * 100).toBeCloseTo(Math.abs(run.result.stresses.atMOP.longitudinal.high) / smys * 100);
      expect(actual.equivPctSmysMopHigh * 100).toBeCloseTo(run.result.stresses.atMOP.equivalent.percentSMYS);
      expect(actual.passFail).toBe(run.result.passFailSummary.overallPass);
      expect(exportToCSV([actual], 'Depth', 'm').split('\n')[1].split(',')[3]).toBe(run.result.stresses.atMOP.equivalent.percentSMYS.toFixed(2));
      const failed = runScenario(run.input, { MOP: units === 'SI' ? 1000000 : 145000 }, mode);
      expect(failed.equivPctSmysMopHigh).toBeGreaterThan(1);
      expect(failed.passFail).toBe(false);
    });
  }
  it('rejects PE rather than showing steel stress checks', () => {
    const run = exampleRun('GRID', 'SI', true);
    expect(() => runScenario(run.input, { depthCover: 2 }, 'GRID')).toThrow('steel');
  });
  it('rejects invalid and unbounded sweeps instead of freezing', () => {
    const run = exampleRun();
    for (const step of [0, -1, NaN, 0.000001]) {
      expect(() => generateSensitivitySweep(run.input, 'depthCover', { mode: 'absolute', min: 1, max: 2, step }, run.mode)).toThrow();
    }
    expect(generateSensitivitySweep(run.input, 'depthCover', { mode: 'percentage', percentRange: 20, percentStep: 5 }, run.mode)).toHaveLength(9);
  });
});
