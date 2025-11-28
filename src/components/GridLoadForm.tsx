import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calculator as CalcIcon } from "lucide-react";
import { GridLoadInputs, UnitsSystem, SoilLoadMethod, EPrimeMethod, BeddingAngleDeg, EquivStressMethod, CodeCheck, SoilType, Compaction, PavementType, VehicleClass } from "@/domain/pipeline/typesGrid";
import { PipeSelector } from "./PipelineTrackForm/PipeSelector";

const gridLoadSchema = z.object({
  calculationName: z.string().min(1, "Name is required"),
  unitsSystem: z.enum(["EN", "SI"]),
  pipeOD: z.number().positive(),
  pipeWT: z.number().positive(),
  MOP: z.number().min(0),
  SMYS: z.number().positive(),
  deltaT: z.number(),
  soilDensity: z.number().positive(),
  depthCover: z.number().min(0),
  beddingAngleDeg: z.number(),
  soilLoadMethod: z.enum(["PRISM", "TRAP_DOOR"]),
  frictionAngleDeg: z.number().min(0).max(90),
  soilCohesion: z.number().min(0),
  kr: z.number().positive(),
  ePrimeMethod: z.enum(["LOOKUP", "USER_DEFINED"]),
  ePrimeUserDefined: z.number().positive().optional(),
  soilType: z.enum(["FINE", "COARSE_WITH_FINES", "COARSE_NO_FINES"]).optional(),
  compaction: z.number().optional(),
  loadType: z.enum(["TOTAL_LOAD", "UNIFORM_PRESSURE"]),
  totalLoad: z.number().positive().optional(),
  uniformPressure: z.number().positive().optional(),
  gridLength: z.number().positive(),
  gridWidth: z.number().positive(),
  gridOffsetX: z.number(),
  gridOffsetY: z.number(),
  gridDivisionsX: z.number().int().min(1).max(50),
  gridDivisionsY: z.number().int().min(1).max(50),
  pavementType: z.enum(["RIGID", "FLEXIBLE"]),
  vehicleClass: z.enum(["HIGHWAY", "FARM", "TRACK"]),
  equivStressMethod: z.enum(["TRESCA", "VON_MISES"]),
  codeCheck: z.enum(["B31_4", "B31_8", "CSA_Z662", "USER_DEFINED"]),
  userDefinedLimits: z.object({
    hoopLimitPct: z.number().min(0).max(100),
    longLimitPct: z.number().min(0).max(100),
    equivLimitPct: z.number().min(0).max(100),
  }).optional(),
});

type GridLoadFormData = z.infer<typeof gridLoadSchema>;

interface GridLoadFormProps {
  onCalculate: (inputs: GridLoadInputs) => void;
}

export const GridLoadForm = ({ onCalculate }: GridLoadFormProps) => {
  const [unitsSystem, setUnitsSystem] = useState<UnitsSystem>("EN");
  
  const defaultValues: GridLoadFormData = {
    calculationName: "",
    unitsSystem: "EN",
    pipeOD: 36,
    pipeWT: 0.5,
    MOP: 1000,
    SMYS: 52000,
    deltaT: 0,
    soilDensity: 120,
    depthCover: 4,
    beddingAngleDeg: 90,
    soilLoadMethod: "PRISM",
    frictionAngleDeg: 30,
    soilCohesion: 0,
    kr: 1,
    ePrimeMethod: "LOOKUP",
    soilType: "COARSE_WITH_FINES",
    compaction: 90,
    loadType: "TOTAL_LOAD",
    totalLoad: 50000,
    gridLength: 20,
    gridWidth: 10,
    gridOffsetX: 0,
    gridOffsetY: 0,
    gridDivisionsX: 10,
    gridDivisionsY: 10,
    pavementType: "FLEXIBLE",
    vehicleClass: "FARM",
    equivStressMethod: "VON_MISES",
    codeCheck: "B31_4",
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<GridLoadFormData>({
    resolver: zodResolver(gridLoadSchema),
    defaultValues,
  });

  const ePrimeMethod = watch("ePrimeMethod");
  const soilLoadMethod = watch("soilLoadMethod");
  const codeCheck = watch("codeCheck");
  const loadType = watch("loadType");

  const onSubmit = (data: GridLoadFormData) => {
    const inputs: GridLoadInputs = {
      calculationName: data.calculationName,
      unitsSystem: data.unitsSystem,
      pipeOD: data.pipeOD,
      pipeWT: data.pipeWT,
      MOP: data.MOP,
      SMYS: data.SMYS,
      deltaT: data.deltaT,
      soilDensity: data.soilDensity,
      depthCover: data.depthCover,
      beddingAngleDeg: data.beddingAngleDeg as BeddingAngleDeg,
      soilLoadMethod: data.soilLoadMethod,
      frictionAngleDeg: data.frictionAngleDeg,
      soilCohesion: data.soilCohesion,
      kr: data.kr,
      ePrimeMethod: data.ePrimeMethod,
      ePrimeUserDefined: data.ePrimeUserDefined,
      soilType: data.soilType,
      compaction: data.compaction as Compaction | undefined,
      loadType: data.loadType,
      totalLoad: data.totalLoad,
      uniformPressure: data.uniformPressure,
      gridLength: data.gridLength,
      gridWidth: data.gridWidth,
      gridOffsetX: data.gridOffsetX,
      gridOffsetY: data.gridOffsetY,
      gridDivisionsX: data.gridDivisionsX,
      gridDivisionsY: data.gridDivisionsY,
      pavementType: data.pavementType,
      vehicleClass: data.vehicleClass,
      equivStressMethod: data.equivStressMethod,
      codeCheck: data.codeCheck,
      ...(data.userDefinedLimits && 
        data.userDefinedLimits.hoopLimitPct !== undefined && 
        data.userDefinedLimits.longLimitPct !== undefined && 
        data.userDefinedLimits.equivLimitPct !== undefined
        ? { userDefinedLimits: data.userDefinedLimits as { hoopLimitPct: number; longLimitPct: number; equivLimitPct: number } }
        : {}
      ),
    };
    onCalculate(inputs);
  };

  const toggleUnits = (checked: boolean) => {
    const newSystem: UnitsSystem = checked ? "SI" : "EN";
    setUnitsSystem(newSystem);
    setValue("unitsSystem", newSystem);
  };

  const unitLabels = unitsSystem === "EN" 
    ? { length: "in", depth: "ft", pressure: "psi", smys: "psi", density: "lb/ft³", force: "lb", temp: "°F" }
    : { length: "mm", depth: "m", pressure: "kPa", smys: "MPa", density: "kg/m³", force: "kg", temp: "°C" };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Unit System</CardTitle>
              <CardDescription>Select measurement system</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="units-toggle-grid" className="text-sm font-medium">
                {unitsSystem === "EN" ? "English" : "Metric"}
              </Label>
              <Switch id="units-toggle-grid" checked={unitsSystem === "SI"} onCheckedChange={toggleUnits} />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calculation Name</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="e.g., Storage Area Load" {...register("calculationName")} />
          {errors.calculationName && <p className="text-sm text-destructive mt-1">{errors.calculationName.message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Properties</CardTitle>
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
              <Label>MOP ({unitLabels.pressure})</Label>
              <Input type="number" step="any" {...register("MOP", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>ΔT ({unitLabels.temp})</Label>
              <Input type="number" step="any" {...register("deltaT", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Soil Density ({unitLabels.density})</Label>
              <Input type="number" step="any" {...register("soilDensity", { valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Cover Depth ({unitLabels.depth})</Label>
              <Input type="number" step="any" {...register("depthCover", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Bedding Angle (°)</Label>
              <Select value={watch("beddingAngleDeg")?.toString()} onValueChange={(v) => setValue("beddingAngleDeg", parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, 30, 60, 90, 120, 150, 180].map((angle) => (
                    <SelectItem key={angle} value={angle.toString()}>{angle}°</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kr</Label>
              <Input type="number" step="any" {...register("kr", { valueAsNumber: true })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grid Load Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Load Type</Label>
            <Select value={watch("loadType")} onValueChange={(v) => setValue("loadType", v as "TOTAL_LOAD" | "UNIFORM_PRESSURE")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TOTAL_LOAD">Total Load</SelectItem>
                <SelectItem value="UNIFORM_PRESSURE">Uniform Pressure</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {loadType === "TOTAL_LOAD" && (
            <div className="space-y-2">
              <Label>Total Load ({unitLabels.force})</Label>
              <Input type="number" step="any" {...register("totalLoad", { valueAsNumber: true })} />
            </div>
          )}
          
          {loadType === "UNIFORM_PRESSURE" && (
            <div className="space-y-2">
              <Label>Uniform Pressure ({unitLabels.pressure})</Label>
              <Input type="number" step="any" {...register("uniformPressure", { valueAsNumber: true })} />
            </div>
          )}
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Grid Length ({unitLabels.depth})</Label>
              <Input type="number" step="any" {...register("gridLength", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Grid Width ({unitLabels.depth})</Label>
              <Input type="number" step="any" {...register("gridWidth", { valueAsNumber: true })} />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Offset X ({unitLabels.depth})</Label>
              <Input type="number" step="any" {...register("gridOffsetX", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Offset Y ({unitLabels.depth})</Label>
              <Input type="number" step="any" {...register("gridOffsetY", { valueAsNumber: true })} />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Divisions X (1-50)</Label>
              <Input type="number" min="1" max="50" {...register("gridDivisionsX", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Divisions Y (1-50)</Label>
              <Input type="number" min="1" max="50" {...register("gridDivisionsY", { valueAsNumber: true })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Vehicle Class</Label>
              <Select value={watch("vehicleClass")} onValueChange={(v) => setValue("vehicleClass", v as VehicleClass)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGHWAY">Highway</SelectItem>
                  <SelectItem value="FARM">Farm/Construction</SelectItem>
                  <SelectItem value="TRACK">Track</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pavement Type</Label>
              <Select value={watch("pavementType")} onValueChange={(v) => setValue("pavementType", v as PavementType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RIGID">Rigid</SelectItem>
                  <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg">
        <CalcIcon className="w-5 h-5 mr-2" />
        Calculate Grid Load
      </Button>
    </form>
  );
};
