import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnitsSystem } from "@/domain/pipeline/types";
import { PipeSelector } from "./PipeSelector";
import { SoilDensitySelector } from "@/components/SoilDensitySelector";

interface PipelineInputsSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  unitsSystem: UnitsSystem;
}

export const PipelineInputsSection = ({ 
  register, 
  errors, 
  watch, 
  setValue, 
  unitsSystem 
}: PipelineInputsSectionProps) => {
  const unitLabels = unitsSystem === "EN" 
    ? { length: "in", depth: "ft", pressure: "psi", smys: "psi", density: "lb/ft³", temp: "°F" }
    : { length: "mm", depth: "m", pressure: "kPa", smys: "MPa", density: "kg/m³", temp: "°C" };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline & Soil Properties</CardTitle>
        <CardDescription>Pipe dimensions, pressures, and soil parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pipe Selection with Presets */}
        <PipeSelector
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          unitsSystem={unitsSystem}
        />

        {/* MOP, ΔT, Soil Density */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="MOP">MOP ({unitLabels.pressure}) *</Label>
            <Input
              id="MOP"
              type="number"
              step="any"
              {...register("MOP", { valueAsNumber: true })}
            />
            {errors.MOP && <p className="text-sm text-destructive">{String(errors.MOP.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deltaT">ΔT ({unitLabels.temp})</Label>
            <Input
              id="deltaT"
              type="number"
              step="any"
              {...register("deltaT", { valueAsNumber: true })}
            />
          </div>

          <SoilDensitySelector
            setValue={setValue}
            watch={watch}
            unitsSystem={unitsSystem}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="depthCover">Cover Depth ({unitLabels.depth}) *</Label>
            <Input
              id="depthCover"
              type="number"
              step="any"
              {...register("depthCover", { valueAsNumber: true })}
            />
            {errors.depthCover && <p className="text-sm text-destructive">{String(errors.depthCover.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="beddingAngleDeg">Bedding Angle (°) *</Label>
            <Select
              value={watch("beddingAngleDeg")?.toString()}
              onValueChange={(v) => setValue("beddingAngleDeg", parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 30, 60, 90, 120, 150, 180].map((angle) => (
                  <SelectItem key={angle} value={angle.toString()}>
                    {angle}°
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
