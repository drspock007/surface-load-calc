import { describe, expect, it } from 'vitest';
import { buildReportModel, formatReportValue, reportFilename } from '../reportModel';
import { exampleRun, reportModes } from './fixtures';

const text = (model: ReturnType<typeof buildReportModel>) => JSON.stringify(model);
describe('report model', () => {
  for (const mode of reportModes) for (const units of ['SI', 'EN'] as const) for (const pe of [false, true]) {
    it(`preserves ${mode} ${units} ${pe ? 'PE' : 'steel'} results without mutation`, () => {
      const run = exampleRun(mode, units, pe), before = JSON.stringify(run);
      const model = buildReportModel(run, { timeZone: 'America/Toronto' });
      expect(JSON.stringify(run)).toBe(before);
      expect(model.status).toBe((pe ? run.result.peResults.overallPass : run.result.passFailSummary.overallPass) ? 'PASS' : 'FAIL');
      expect(model.summary[0].rows[0]).toEqual(['Maximum surface pressure on pipe', formatReportValue(run.result.maxSurfacePressureOnPipe), units === 'SI' ? 'kPa' : 'psi']);
      expect(model.calculatedAt).toContain('America/Toronto');
      expect(model.inputs.some(t => t.title.includes('loading'))).toBe(true);
      expect(model.checks.some(t => t.title === 'PE design values')).toBe(pe);
      expect(model.checks.some(t => t.title.startsWith('Stress results'))).toBe(!pe);
    });
  }
  it('uses actual debug units instead of misleading field suffixes', () => {
    const track = buildReportModel(exampleRun('PIPELINE_TRACK'));
    const axle = buildReportModel(exampleRun('2_AXLE'));
    expect(track.appendix[0].rows.find(r => r[0] === 'Contact pressure')?.[2]).toBe('kPa');
    expect(axle.appendix[0].rows.find(r => r[0] === 'Contact pressure')?.[2]).toBe('psf');
    expect(axle.appendix[0].rows.find(r => r[0] === 'Soil pressure')?.[2]).toBe('kPa');
  });
  it('handles incomplete historic results with N/A rather than zeros or invented PASS', () => {
    const model = buildReportModel({ id: 'old', timestamp: NaN, mode: 'GRID', input: {}, result: {} });
    expect(model.status).toBe('N/A');
    expect(model.calculatedAt).toBe('N/A');
    expect(model.summary[0].rows[0]).toEqual(['Maximum surface pressure on pipe', 'N/A', 'N/A']);
    expect(model.checks.find(t => t.title.startsWith('Stress results'))?.rows.every(r => r[5] === 'N/A')).toBe(true);
  });
  it('preserves failed checks, zero values and a no-bend condition', () => {
    const run = exampleRun();
    run.result.passFailSummary.overallPass = false;
    run.result.bendRadius = { hasMargin: false, minRadius: null, marginZero: 0, marginMOP: -25, sigmaRemaining: -25, governingCondition: 'MOP' };
    const model = buildReportModel(run, { stale: true });
    expect(model.status).toBe('FAIL'); expect(model.stale).toBe(true);
    expect(text(model)).toContain('No bend is permissible');
    expect(model.checks.find(t => t.title === 'Bend radius analysis')?.rows).toContainEqual(['Margin at zero pressure', '0', 'kPa']);
    expect(text(model)).not.toContain('Infinity');
  });
  it('formats missing/nonfinite values and sanitizes long filenames', () => {
    for (const value of [undefined, null, '', NaN, Infinity]) expect(formatReportValue(value)).toBe('N/A');
    expect(formatReportValue(0)).toBe('0');
    expect(reportFilename('../Montréal: test/one')).toBe('-Montréal- test-one-report.pdf');
    expect(reportFilename('a'.repeat(500)).length).toBeLessThan(120);
  });
});
