import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitsSystem } from "@/domain/pipeline/types";
import { createEnsurePositive } from "@/hooks/useEnsurePositive";
import { TrackVehicleDiagram } from "@/components/TrackVehicleDiagram";
import { InfoTooltip } from "@/components/InfoTooltip";

interface TrackVehicleSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  unitsSystem: UnitsSystem;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export const TrackVehicleSection = ({ 
  register, 
  errors, 
  unitsSystem,
  setValue,
  watch
}: TrackVehicleSectionProps) => {
  const ensurePositive = createEnsurePositive(setValue);

  const trackLength = watch("trackLength") || 0;
  const trackWidth = watch("trackWidth") || 0;
  const trackSeparation = watch("trackSeparation") || 0;
  const trackVehicleWeight = watch("trackVehicleWeight") || 0;

  const unitLabels = unitsSystem === "EN" 
    ? { length: "in", force: "lb" }
    : { length: "mm", force: "kg" };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Track Vehicle Properties</CardTitle>
        <CardDescription>Vehicle dimensions and loading parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TrackVehicleDiagram
          trackLength={trackLength}
          trackWidth={trackWidth}
          trackSeparation={trackSeparation}
          vehicleWeight={trackVehicleWeight}
          unitsSystem={unitsSystem}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="trackLength">Track Length ({unitLabels.length}) *<InfoTooltip text="Length of the track footprint in contact with the ground (along the direction of travel)." /></Label>
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
            <Label htmlFor="trackWidth">Track Width ({unitLabels.length}) *<InfoTooltip text="Width of a single track shoe (transverse to direction of travel)." /></Label>
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
            <Label htmlFor="trackSeparation">Track Separation ({unitLabels.length}) *<InfoTooltip text="Centerline-to-centerline distance between the two tracks." /></Label>
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
            <Label htmlFor="trackVehicleWeight">Vehicle Weight ({unitLabels.force}) *<InfoTooltip text="Total gross weight of the tracked vehicle, distributed equally between both tracks." /></Label>
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
