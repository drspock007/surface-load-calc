import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateAxleContact, contactMethodLabels, type ContactMethod } from '@/domain/pipeline/axleContact';
import { convertTirePressureBetweenUnits } from '@/domain/pipeline/tirePatchCalculations';
import type { TirePressureUnit } from '@/domain/pipeline/types';

export function AxleContactSection({ values, axleCount, onChange }: {
  values: object; axleCount: 2 | 3; onChange: (key: string, value: string | number) => void;
}) {
  const id = useId();
  const data = values as Record<string, unknown>;
  const method = data.contactPatchMode as ContactMethod;
  const si = data.unitsSystem === 'SI';
  const lengthUnit = si ? 'mm' : 'in';
  const format = (v: number) => Number.isFinite(v) ? v.toLocaleString('en-GB', { maximumFractionDigits: 3 }) : 'N/A';
  const numeric = (key: string, label: string) => <div className="space-y-2">
    <Label htmlFor={`${id}-${key}`}>{label}</Label>
    <Input id={`${id}-${key}`} type="number" step="any" min="0" value={typeof data[key] === 'number' && Number.isFinite(data[key]) ? data[key] as number : ''}
      onChange={e => onChange(key, e.target.value === '' ? NaN : Number(e.target.value))} />
  </div>;
  return <section className="space-y-4 p-4 border rounded-lg bg-muted/20" aria-label="Tire contact patches">
    <Label htmlFor={`${id}-method`}>Contact Patch Method</Label>
    <Select value={method} onValueChange={value => onChange('contactPatchMode', value)}>
      <SelectTrigger id={`${id}-method`} className="h-auto min-h-10 text-left whitespace-normal"><SelectValue /></SelectTrigger>
      <SelectContent>{Object.entries(contactMethodLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
    </Select>
    <p className="text-sm text-muted-foreground">{method === 'GROUND_PRESSURE'
      ? 'Use the manufacturer’s ground pressure for the selected tires and loaded/unloaded condition. Area per tire = load per tire / ground pressure. Loads are shared equally between tires on each axle.'
      : method === 'AUTO' ? 'Estimate only: average ground contact pressure is assumed equal to tire inflation pressure. Area per tire = load per tire / inflation pressure.'
      : 'Enter the footprint of one tire. Dual tires are combined on each side of the axle. Average ground pressure = load per tire / contact area.'}</p>
    {method === 'GROUND_PRESSURE' && <div className="space-y-2">
      <Label htmlFor={`${id}-reference`}>Manufacturer / catalog reference</Label>
      <Input id={`${id}-reference`} value={String(data.contactPressureReference ?? '')} onChange={e => onChange('contactPressureReference', e.target.value)} placeholder="e.g., Volvo A40G — 29.5R25 — Loaded — brochure page" />
    </div>}
    {Array.from({ length: axleCount }, (_, i) => i + 1).map(n => {
      const prefix = `axle${n}`;
      const pressureKey = prefix + (method === 'GROUND_PRESSURE' ? 'GroundPressure' : 'TirePressure');
      const unitKey = pressureKey + 'Unit';
      const pressureUnit = (data[unitKey] ?? 'kPa') as TirePressureUnit;
      let contact: ReturnType<typeof calculateAxleContact> | undefined;
      let error = '';
      try { contact = calculateAxleContact(data, n); } catch (e) { error = e instanceof Error ? e.message : 'Complete contact inputs.'; }
      return <div key={n} className="space-y-3 border-t pt-3">
        <h4 className="text-sm font-medium">Axle {n} ({n === 1 ? 'Front' : n === axleCount ? 'Rear' : 'Middle'}) Contact Patch</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {numeric(prefix + 'TireWidth', `Single tire contact width (${lengthUnit})`)}
          <div className="space-y-2">
            <Label htmlFor={`${id}-${prefix}-count`}>Tires per axle</Label>
            <Select value={String(data[prefix + 'TiresPerAxle'] ?? 2)} onValueChange={v => onChange(prefix + 'TiresPerAxle', Number(v))}>
              <SelectTrigger id={`${id}-${prefix}-count`}><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="2">2 — Single</SelectItem><SelectItem value="4">4 — Dual</SelectItem></SelectContent>
            </Select>
          </div>
          {method === 'MANUAL' ? numeric(prefix + 'TireLength', `Contact length (${lengthUnit})`) : <>
            {numeric(pressureKey, method === 'GROUND_PRESSURE' ? 'Manufacturer ground pressure' : 'Tire inflation pressure')}
            <div className="space-y-2">
              <Label htmlFor={`${id}-${unitKey}`}>Pressure unit</Label>
              <Select value={pressureUnit} onValueChange={unit => {
                const value = data[pressureKey];
                if (typeof value === 'number' && Number.isFinite(value)) onChange(pressureKey, convertTirePressureBetweenUnits(value, pressureUnit, unit as TirePressureUnit));
                onChange(unitKey, unit);
              }}>
                <SelectTrigger id={`${id}-${unitKey}`}><SelectValue /></SelectTrigger>
                <SelectContent>{(['kPa', 'bar', 'psig', 'kg/m2'] as const).map(unit => <SelectItem key={unit} value={unit}>{unit === 'psig' ? (method === 'GROUND_PRESSURE' ? 'psi' : 'psig') : unit === 'kg/m2' ? 'kgf/m²' : unit}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </>}
        </div>
        {contact ? <dl className="grid gap-2 text-sm sm:grid-cols-2 bg-muted/30 p-3 rounded-md">
          <div><dt className="text-muted-foreground">Load per tire</dt><dd>{format(contact.loadPerTire_lb * (si ? 0.00444822161526 : 1))} {si ? 'kN' : 'lbf'}</dd></div>
          <div><dt className="text-muted-foreground">Contact area per tire</dt><dd>{format(contact.area_in2 * (si ? 0.00064516 : 1))} {si ? 'm²' : 'in²'}</dd></div>
          <div><dt className="text-muted-foreground">Contact length</dt><dd>{format(contact.length_in * (si ? 25.4 : 1))} {lengthUnit}</dd></div>
          <div><dt className="text-muted-foreground">Average ground contact pressure</dt><dd>{format(contact.pressure_psi * (si ? 6.894757293168 : 1))} {si ? 'kPa' : 'psi'}</dd></div>
        </dl> : <p role="status" className="text-sm text-destructive">{error}</p>}
      </div>;
    })}
  </section>;
}
