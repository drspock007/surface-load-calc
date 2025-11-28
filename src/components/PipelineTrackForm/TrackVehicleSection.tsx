import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitsSystem } from "@/domain/pipeline/types";

interface TrackVehicleSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  unitsSystem: UnitsSystem;
}

export const TrackVehicleSection = ({ 
  register, 
  errors, 
  unitsSystem 
}: TrackVehicleSectionProps) => {
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
              {...register("trackLength", { valueAsNumber: true })}
            />
            {errors.trackLength && <p className="text-sm text-destructive">{String(errors.trackLength.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackWidth">Track Width ({unitLabels.length}) *</Label>
            <Input
              id="trackWidth"
              type="number"
              step="any"
              {...register("trackWidth", { valueAsNumber: true })}
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
              {...register("trackSeparation", { valueAsNumber: true })}
            />
            {errors.trackSeparation && <p className="text-sm text-destructive">{String(errors.trackSeparation.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackVehicleWeight">Vehicle Weight ({unitLabels.force}) *</Label>
            <Input
              id="trackVehicleWeight"
              type="number"
              step="any"
              {...register("trackVehicleWeight", { valueAsNumber: true })}
            />
            {errors.trackVehicleWeight && <p className="text-sm text-destructive">{String(errors.trackVehicleWeight.message)}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
