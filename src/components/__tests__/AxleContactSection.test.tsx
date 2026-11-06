import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { AxleContactSection } from '../AxleContactSection';
import { useFormDraft } from '@/hooks/useFormDraft';
import { exampleRun } from '@/reports/__tests__/fixtures';

// Native selects make the form-state contract independent of Radix pointer APIs in jsdom.
vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: {value: string; onValueChange: (v: string) => void; children: React.ReactNode}) => <select value={value} onChange={e => onValueChange(e.target.value)}>{children}</select>,
  SelectContent: ({ children }: {children: React.ReactNode}) => <>{children}</>,
  SelectItem: ({ value, children }: {value: string; children: React.ReactNode}) => <option value={value}>{children}</option>,
  SelectTrigger: () => null, SelectValue: () => null,
}));
let testKey = 0;
function Harness() {
  const { watch, setValue, reset } = useForm({ defaultValues: { ...exampleRun('3_AXLE').input, contactPatchMode: 'GROUND_PRESSURE', axle1TiresPerAxle: 2, axle2TiresPerAxle: 4, axle3TiresPerAxle: 4, axle1TirePressure: 8, axle1TirePressureUnit: 'bar', axle1GroundPressure: 139, axle2GroundPressure: 167, axle3GroundPressure: 167, contactPressureReference: 'Catalog - loaded' } });
  useFormDraft(`contact-test-${testKey}`, watch, reset);
  return <AxleContactSection values={watch()} axleCount={3} onChange={(key, value) => setValue(key, value)} />;
}
afterEach(() => { cleanup(); localStorage.clear(); testKey++; });
describe('Contact inputs', () => {
  it('keeps inflation and manufacturer values independent when switching methods', () => {
    render(<Harness />);
    const method = screen.getAllByRole('combobox')[0];
    fireEvent.change(method, { target: { value: 'AUTO' } });
    expect((screen.getAllByLabelText('Tire inflation pressure')[0] as HTMLInputElement).value).toBe('8');
    fireEvent.change(method, { target: { value: 'GROUND_PRESSURE' } });
    expect((screen.getAllByLabelText('Manufacturer ground pressure')[0] as HTMLInputElement).value).toBe('139');
    expect((screen.getByLabelText('Manufacturer / catalog reference') as HTMLInputElement).value).toBe('Catalog - loaded');
  });
  it('restores a deliberately empty pressure and the reference after remount', () => {
    const view = render(<Harness />);
    fireEvent.change(screen.getAllByLabelText('Manufacturer ground pressure')[0], { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Manufacturer / catalog reference'), { target: { value: 'Montréal - test' } });
    view.unmount(); render(<Harness />);
    expect((screen.getAllByLabelText('Manufacturer ground pressure')[0] as HTMLInputElement).value).toBe('');
    expect(screen.getByText('Axle 1: ground pressure must be positive.')).toBeTruthy();
    expect((screen.getByLabelText('Manufacturer / catalog reference') as HTMLInputElement).value).toBe('Montréal - test');
  });
  it('converts the entered ground pressure when its unit changes', () => {
    render(<Harness />);
    const selects = within(screen.getByRole('region', { name: 'Tire contact patches' })).getAllByRole('combobox');
    // Method, axle 1 count, axle 1 pressure unit.
    fireEvent.change(selects[2], { target: { value: 'bar' } });
    expect(Number((screen.getAllByLabelText('Manufacturer ground pressure')[0] as HTMLInputElement).value)).toBeCloseTo(1.39, 4);
    expect(screen.getAllByText('139 kPa')).toHaveLength(1);
  });
});
