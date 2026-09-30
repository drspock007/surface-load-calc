import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import type { ReportModel, ReportTable } from './reportModel';

export interface ReportAssets { regularFont: string; boldFont: string; logo: string }
const ink: [number, number, number] = [30, 41, 59];
const orange: [number, number, number] = [234, 126, 0];
const muted: [number, number, number] = [85, 98, 115];

/** Draw real PDF text and tables. No DOM, screenshot, engine, or viewport dependency. */
export function renderReport(model: ReportModel, assets: ReportAssets): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true, putOnlyUsedFonts: true });
  doc.addFileToVFS('Report-Regular.ttf', assets.regularFont);
  doc.addFont('Report-Regular.ttf', 'Report', 'normal');
  doc.addFileToVFS('Report-Bold.ttf', assets.boldFont);
  doc.addFont('Report-Bold.ttf', 'Report', 'bold');
  doc.setProperties({ title: model.name, subject: 'Buried pipeline surface loading calculation', author: 'Giovanni Malagnino Consulting', creator: 'Surface Load Calculator' });
  let y = 30;
  const finalY = () => (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const common = {
    margin: { top: 29, bottom: 23, left: 17, right: 17 },
    styles: { font: 'Report', fontSize: 8.5, cellPadding: 1.6, textColor: ink, lineColor: [221, 226, 233] as [number, number, number], lineWidth: 0.1, overflow: 'linebreak' as const },
  };
  const section = (table: ReportTable) => {
    if (y > 238) { doc.addPage(); y = 29; }
    autoTable(doc, {
      ...common, startY: y, pageBreak: 'avoid', rowPageBreak: 'avoid', showHead: 'everyPage', showFoot: 'lastPage',
      head: [[{ content: table.title, colSpan: table.columns.length, styles: { fillColor: ink, textColor: [255, 255, 255], fontSize: 10, cellPadding: 3 } }], table.columns],
      body: table.rows,
      foot: table.note ? [[{ content: table.note, colSpan: table.columns.length }]] : undefined,
      headStyles: { fillColor: [239, 242, 246], textColor: ink, fontStyle: 'bold' },
      footStyles: { fillColor: [255, 255, 255], textColor: muted, fontStyle: 'normal', fontSize: 7.5 },
      alternateRowStyles: { fillColor: [249, 250, 252] },
      didParseCell: data => {
        if (data.section === 'body' && ['PASS', 'FAIL'].includes(data.cell.raw as string)) {
          data.cell.styles.textColor = data.cell.raw === 'PASS' ? [22, 101, 52] : [153, 27, 27];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
    y = finalY() + 5;
  };
  const paragraph = (text: string, large = false) => {
    autoTable(doc, { ...common, startY: y, theme: 'plain', body: [[text]],
      styles: { ...common.styles, lineWidth: 0, fontSize: large ? 19 : 9, fontStyle: large ? 'bold' : 'normal', cellPadding: { top: 0, right: 0, bottom: 4, left: 0 } },
    });
    y = finalY() + 2;
  };
  paragraph('Surface loading analysis', true);
  paragraph(model.name);
  section({ title: 'Calculation overview', columns: ['Reference', 'Details'], rows: [
    ['Calculation ID', model.id], ['Calculated on', model.calculatedAt], ['Loading mode', model.mode], ['Pipe material', model.material], ['Unit system', model.units], ['Overall stored result', model.status],
  ] });
  if (model.stale) paragraph('DRAFT CHANGES NOT INCLUDED: This report contains the last completed calculation. Inputs have changed since that calculation; recalculate to export the updated inputs and results.');
  model.summary.forEach(section);
  paragraph('This report reproduces the saved calculation, including its input parameters and engine checks.');
  const group = (title: string, tables: ReportTable[]) => {
    if (!tables.length) return;
    // Reuse lightly occupied continuation pages instead of leaving a nearly blank page.
    if (title === 'Input parameters' || y > 100) { doc.addPage(); y = 30; }
    else y += 5;
    paragraph(title, true);
    tables.forEach(section);
  };
  group('Input parameters', model.inputs);
  group('Detailed verification', model.checks);
  group('Technical appendix', model.appendix);
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.addImage(assets.logo, 'PNG', 17, 8, 13, 13);
    doc.setFont('Report', 'bold').setFontSize(9).setTextColor(...ink);
    doc.text('GIOVANNI MALAGNINO CONSULTING', 34, 13);
    doc.setFont('Report', 'normal').setFontSize(7.5).setTextColor(...muted);
    doc.text('Buried pipeline surface loading | Calculation report', 34, 18);
    doc.setDrawColor(...orange).setLineWidth(0.6).line(17, 24, 193, 24);
    doc.setDrawColor(216, 223, 232).setLineWidth(0.2).line(17, 279, 193, 279);
    doc.setFont('Report', 'normal').setFontSize(7).setTextColor(...muted);
    // IDs can come from imported runs; wrap neither footer nor pagination.
    const footer = doc.splitTextToSize(`Calculation ${model.id}`, 135)[0];
    doc.text(footer, 17, 284);
    doc.text(`Page ${page} / ${pages}`, 193, 284, { align: 'right' });
    doc.text('Surface Load Calculator', 17, 289);
  }
  return doc;
}
