// @vitest-environment node
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildReportModel } from '../reportModel';
import { renderReport } from '../renderReport';
import { exampleRun, reportModes } from './fixtures';

const font = (name: string) => readFileSync(resolve('src/assets/report-fonts', name)).toString('base64');
const assets = { regularFont: font('DejaVuSans.ttf'), boldFont: font('DejaVuSans-Bold.ttf'), logo: `data:image/png;base64,${readFileSync(resolve('src/assets/logo.png')).toString('base64')}` };

describe('PDF rendering', () => {
  const cases = reportModes.flatMap(mode => [exampleRun(mode, 'SI'), exampleRun(mode, 'EN', true)]);
  const long = exampleRun(); long.id = 'long-name'; long.input.calculationName = ('Étude détaillée - Traversée Montréal / ΔT et θ - ').repeat(22);
  const incomplete = { id: 'historic-incomplete', timestamp: 0, mode: 'GRID' as const, input: {}, result: {} };
  const failed = exampleRun(); failed.id = 'failed'; failed.result.passFailSummary.overallPass = false;
  failed.result.bendRadius = { hasMargin: false, marginZero: 0, marginMOP: -12, sigmaRemaining: -12, governingCondition: 'MOP' };
  for (const run of [...cases, long, incomplete, failed]) it(`renders ${run.id}`, () => {
    const doc = renderReport(buildReportModel(run, { stale: run.id === 'long-name', timeZone: 'America/Toronto' }), assets);
    expect(doc.internal.pageSize.getWidth()).toBeCloseTo(210, 0);
    expect(doc.internal.pageSize.getHeight()).toBeCloseTo(297, 0);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(3);
    const output = Buffer.from(doc.output('arraybuffer'));
    expect(output.subarray(0, 5).toString()).toBe('%PDF-');
    if (process.env.REPORT_QA_DIR) {
      mkdirSync(process.env.REPORT_QA_DIR, { recursive: true });
      writeFileSync(resolve(process.env.REPORT_QA_DIR, `${run.id}.pdf`), output);
    }
  });
});
