import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import { CalculationResults } from '@/components/results/CalculationResults';
import { TooltipProvider } from '@/components/ui/tooltip';
import { exampleRun } from './fixtures';
const { exportPdf, toast } = vi.hoisted(() => ({ exportPdf: vi.fn(), toast: vi.fn() }));
vi.mock('../exportCalculationPdf', () => ({ exportCalculationPdf: exportPdf }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast }) }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const show = (run = exampleRun(), stale = false) => render(<TooltipProvider><CalculationResults run={run} stale={stale} onBack={vi.fn()} onEditInputs={vi.fn()} onHistory={vi.fn()} /></TooltipProvider>);
describe('export action', () => {
  it('exports the displayed snapshot and stale flag, disables duplicate requests, then re-enables', async () => {
    let finish!: () => void;
    exportPdf.mockImplementation(() => new Promise<void>(resolve => { finish = resolve; }));
    const run = exampleRun(); show(run, true);
    const button = screen.getByRole('button', { name: 'Export PDF' });
    fireEvent.click(button); fireEvent.click(button);
    await waitFor(() => expect(exportPdf).toHaveBeenCalledTimes(1));
    expect(exportPdf).toHaveBeenCalledWith(run, { stale: true });
    expect(screen.getByRole('button', { name: 'Generating PDF…' }).hasAttribute('disabled')).toBe(true);
    await act(async () => finish());
    expect(screen.getByRole('button', { name: 'Export PDF' }).hasAttribute('disabled')).toBe(false);
  });
  it('reports an error and allows retry', async () => {
    exportPdf.mockRejectedValueOnce(new Error('font download failed')).mockResolvedValueOnce(undefined);
    show(); fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'PDF export failed', variant: 'destructive' })));
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    await waitFor(() => expect(exportPdf).toHaveBeenCalledTimes(2));
  });
  it('keeps export available for incomplete historical runs', async () => {
    const run = { id: 'old', timestamp: 0, mode: 'GRID' as const, input: {}, result: {} };
    exportPdf.mockResolvedValue(undefined); show(run);
    expect(screen.getByText(/incomplete details/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    await waitFor(() => expect(exportPdf).toHaveBeenCalledWith(run, { stale: false }));
  });
});
