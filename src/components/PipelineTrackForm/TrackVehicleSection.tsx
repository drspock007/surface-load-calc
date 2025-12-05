import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitsSystem } from "@/domain/pipeline/types";
import { createEnsurePositive } from "@/hooks/useEnsurePositive";

interface TrackVehicleSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  unitsSystem: UnitsSystem;
  setValue: UseFormSetValue<any>;
}

export const TrackVehicleSection = ({ 
  register, 
  errors, 
  unitsSystem,
  setValue 
}: TrackVehicleSectionProps) => {
  const ensurePositive = createEnsurePositive(setValue);

  const unitLabels = unitsSystem === "EN" 
    ? { length: "in", force: "lb" }
    : { length: "mm", force: "kN" };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Track Vehicle Properties</CardTitle>
        <CardDescription>Vehicle dimensions and loading parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="trackLength">Track Length ({unitLabels.length}) *</Label>
            <Input
              id="trackLength"
              type="number"
              step="any"
              min="0"
              {...register("trackLength", { valueAsNumber: true })}
              {...ensurePositive("trackLength")}
            />
            {errors.trackLength && <p className="text-sm text-destructive">{String(errors.trackLength.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackWidth">Track Width ({unitLabels.length}) *</Label>
            <Input
              id="trackWidth"
              type="number"
              step="any"
              min="0"
              {...register("trackWidth", { valueAsNumber: true })}
              {...ensurePositive("trackWidth")}
            />
            {errors.trackWidth && <p className="text-sm text-destructive">{String(errors.trackWidth.message)}</p>}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="trackSeparation">Track Separation ({unitLabels.length}) *</Label>
            <Input
              id="trackSeparation"
              type="number"
              step="any"
              min="0"
              {...register("trackSeparation", { valueAsNumber: true })}
              {...ensurePositive("trackSeparation")}
            />
            {errors.trackSeparation && <p className="text-sm text-destructive">{String(errors.trackSeparation.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackVehicleWeight">Vehicle Weight ({unitLabels.force}) *</Label>
            <Input
              id="trackVehicleWeight"
              type="number"
              step="any"
              min="0"
              {...register("trackVehicleWeight", { valueAsNumber: true })}
              {...ensurePositive("trackVehicleWeight")}
            />
            {errors.trackVehicleWeight && <p className="text-sm text-destructive">{String(errors.trackVehicleWeight.message)}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
