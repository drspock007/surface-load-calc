import type { CalculationRun } from '@/types/calculation';
import regularFontUrl from '@/assets/report-fonts/DejaVuSans.ttf?url';
import boldFontUrl from '@/assets/report-fonts/DejaVuSans-Bold.ttf?url';
import logoUrl from '@/assets/logo.png';
import { buildReportModel, reportFilename, type ReportOptions } from './reportModel';
import { renderReport, type ReportAssets } from './renderReport';

async function base64Asset(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Report asset could not be loaded (${response.status})`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
let cachedAssets: Promise<ReportAssets> | undefined;
function assets() {
  cachedAssets ??= Promise.all([base64Asset(regularFontUrl), base64Asset(boldFontUrl), base64Asset(logoUrl)])
    .then(([regularFont, boldFont, logo]) => ({ regularFont, boldFont, logo: `data:image/png;base64,${logo}` }))
    .catch(error => { cachedAssets = undefined; throw error; });
  return cachedAssets;
}
export async function exportCalculationPdf(run: CalculationRun, options: ReportOptions = {}): Promise<void> {
  const model = buildReportModel(run, options);
  const pdf = renderReport(model, await assets());
  await pdf.save(reportFilename(model.name), { returnPromise: true });
}
