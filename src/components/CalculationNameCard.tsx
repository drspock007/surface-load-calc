import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PresetManager } from "@/components/PresetManager";
import { PresetMode } from "@/utils/presetStorage/schema";
import { UnitsSystem } from "@/domain/pipeline/types";

interface CalculationNameCardProps {
  mode: PresetMode;
  placeholder: string;
  register: any;
  errors: any;
  watch: () => Record<string, unknown>;
  setValue: (name: any, value: any) => void;
  unitsSystem: UnitsSystem;
  setUnitsSystem: (system: UnitsSystem) => void;
}

/** Calculation name + preset management, shown at the bottom of every form. */
export const CalculationNameCard = ({
  mode,
  placeholder,
  register,
  errors,
  watch,
  setValue,
  unitsSystem,
  setUnitsSystem,
}: CalculationNameCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Calculation Name &amp; Presets</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`name-${mode}`}>Name *</Label>
        <Input id={`name-${mode}`} placeholder={placeholder} {...register("calculationName")} />
        {errors.calculationName && (
          <p className="text-sm text-destructive">{errors.calculationName.message as string}</p>
        )}
      </div>
      <PresetManager
        mode={mode}
        getCurrentValues={() => watch()}
        onLoad={(values) => {
          const vals = values as Record<string, unknown>;
          if (vals.unitsSystem && vals.unitsSystem !== unitsSystem) {
            setUnitsSystem(vals.unitsSystem as UnitsSystem);
          }
          Object.entries(vals).forEach(([key, val]) => setValue(key, val));
        }}
      />
    </CardContent>
  </Card>
);
