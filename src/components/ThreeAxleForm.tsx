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
import { ThreeAxleInputs, UnitsSystem, SoilLoadMethod, EPrimeMethod, BeddingAngleDeg, EquivStressMethod, CodeCheck, SoilType, Compaction, PavementType, VehicleClass } from "@/domain/pipeline/types3Axle";
import { PipeSelector } from "./PipelineTrackForm/PipeSelector";
import { AnalysisParametersSection } from "./AnalysisParametersSection";
import { convertFormValue } from "@/domain/pipeline/unitConversions";

const threeAxleSchema = z.object({
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
  axle1To2Spacing: z.number().positive(),
  axle2To3Spacing: z.number().positive(),
  axle1Load: z.number().positive(),
  axle2Load: z.number().positive(),
  axle3Load: z.number().positive(),
  contactPatchMode: z.enum(["MANUAL", "AUTO"]),
  tirePressure: z.number().positive().optional(),
  tiresPerAxle: z.number().int().positive().optional(),
  tireWidth: z.number().positive(),
  tireLength: z.number().positive(),
  axleWidth: z.number().positive(),
  laneOffset: z.number(),
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

type ThreeAxleFormData = z.infer<typeof threeAxleSchema>;

interface ThreeAxleFormProps {
  onCalculate: (inputs: ThreeAxleInputs) => void;
}

export const ThreeAxleForm = ({ onCalculate }: ThreeAxleFormProps) => {
  const [unitsSystem, setUnitsSystem] = useState<UnitsSystem>("EN");
  
  const defaultValues: ThreeAxleFormData = {
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
    axle1To2Spacing: 12,
    axle2To3Spacing: 4,
    axle1Load: 12000,
    axle2Load: 17000,
    axle3Load: 17000,
    contactPatchMode: "MANUAL",
    tirePressure: 80,
    tiresPerAxle: 2,
    tireWidth: 8,
    tireLength: 10,
    axleWidth: 72,
    laneOffset: 0,
    pavementType: "FLEXIBLE",
    vehicleClass: "HIGHWAY",
    equivStressMethod: "VON_MISES",
    codeCheck: "B31_4",
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ThreeAxleFormData>({
    resolver: zodResolver(threeAxleSchema),
    defaultValues,
  });

  const ePrimeMethod = watch("ePrimeMethod");
  const soilLoadMethod = watch("soilLoadMethod");
  const codeCheck = watch("codeCheck");
  const contactPatchMode = watch("contactPatchMode");

  const onSubmit = (data: ThreeAxleFormData) => {
    const inputs: ThreeAxleInputs = {
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
      axle1To2Spacing: data.axle1To2Spacing,
      axle2To3Spacing: data.axle2To3Spacing,
      axle1Load: data.axle1Load,
      axle2Load: data.axle2Load,
      axle3Load: data.axle3Load,
      contactPatchMode: data.contactPatchMode,
      tirePressure: data.tirePressure,
      tiresPerAxle: data.tiresPerAxle,
      tireWidth: data.tireWidth,
      tireLength: data.tireLength,
      axleWidth: data.axleWidth,
      laneOffset: data.laneOffset,
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
    const oldSystem = unitsSystem;
    
    const currentValues = watch();
    setValue("pipeOD", convertFormValue(currentValues.pipeOD, oldSystem, newSystem, 'length') ?? currentValues.pipeOD);
    setValue("pipeWT", convertFormValue(currentValues.pipeWT, oldSystem, newSystem, 'length') ?? currentValues.pipeWT);
    setValue("MOP", convertFormValue(currentValues.MOP, oldSystem, newSystem, 'pressure') ?? currentValues.MOP);
    setValue("SMYS", convertFormValue(currentValues.SMYS, oldSystem, newSystem, 'smys') ?? currentValues.SMYS);
    setValue("deltaT", convertFormValue(currentValues.deltaT, oldSystem, newSystem, 'temp') ?? currentValues.deltaT);
    setValue("soilDensity", convertFormValue(currentValues.soilDensity, oldSystem, newSystem, 'density') ?? currentValues.soilDensity);
    setValue("depthCover", convertFormValue(currentValues.depthCover, oldSystem, newSystem, 'depth') ?? currentValues.depthCover);
    setValue("axle1To2Spacing", convertFormValue(currentValues.axle1To2Spacing, oldSystem, newSystem, 'depth') ?? currentValues.axle1To2Spacing);
    setValue("axle2To3Spacing", convertFormValue(currentValues.axle2To3Spacing, oldSystem, newSystem, 'depth') ?? currentValues.axle2To3Spacing);
    setValue("laneOffset", convertFormValue(currentValues.laneOffset, oldSystem, newSystem, 'depth') ?? currentValues.laneOffset);
    setValue("axle1Load", convertFormValue(currentValues.axle1Load, oldSystem, newSystem, 'force') ?? currentValues.axle1Load);
    setValue("axle2Load", convertFormValue(currentValues.axle2Load, oldSystem, newSystem, 'force') ?? currentValues.axle2Load);
    setValue("axle3Load", convertFormValue(currentValues.axle3Load, oldSystem, newSystem, 'force') ?? currentValues.axle3Load);
    if (currentValues.tirePressure) {
      setValue("tirePressure", convertFormValue(currentValues.tirePressure, oldSystem, newSystem, 'tirePressure'));
    }
    setValue("tireWidth", convertFormValue(currentValues.tireWidth, oldSystem, newSystem, 'length') ?? currentValues.tireWidth);
    setValue("tireLength", convertFormValue(currentValues.tireLength, oldSystem, newSystem, 'length') ?? currentValues.tireLength);
    setValue("axleWidth", convertFormValue(currentValues.axleWidth, oldSystem, newSystem, 'length') ?? currentValues.axleWidth);
    
    if (currentValues.ePrimeUserDefined) {
      setValue("ePrimeUserDefined", convertFormValue(currentValues.ePrimeUserDefined, oldSystem, newSystem, 'pressure'));
    }
    if (currentValues.soilCohesion) {
      setValue("soilCohesion", convertFormValue(currentValues.soilCohesion, oldSystem, newSystem, 'pressure') ?? 0);
    }
    
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
              <Label htmlFor="units-toggle-3" className="text-sm font-medium">
                {unitsSystem === "EN" ? "English" : "Metric"}
              </Label>
              <Switch id="units-toggle-3" checked={unitsSystem === "SI"} onCheckedChange={toggleUnits} />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calculation Name</CardTitle>
        </CardHeader>
        <CardContent>
          <Input placeholder="e.g., Truck Crossing Analysis" {...register("calculationName")} />
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
          <CardTitle>3-Axle Vehicle Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Axle 1-2 Spacing ({unitLabels.depth})</Label>
              <Input type="number" step="any" {...register("axle1To2Spacing", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Axle 2-3 Spacing ({unitLabels.depth})</Label>
              <Input type="number" step="any" {...register("axle2To3Spacing", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Lane Offset ({unitLabels.depth})</Label>
              <Input type="number" step="any" {...register("laneOffset", { valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Axle 1 Load ({unitLabels.force})</Label>
              <Input type="number" step="any" {...register("axle1Load", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Axle 2 Load ({unitLabels.force})</Label>
              <Input type="number" step="any" {...register("axle2Load", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Axle 3 Load ({unitLabels.force})</Label>
              <Input type="number" step="any" {...register("axle3Load", { valueAsNumber: true })} />
            </div>
          </div>
          
          {/* Contact Patch Mode Toggle */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <Label htmlFor="contact-mode-3" className="text-sm font-medium">Contact Patch Method</Label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {contactPatchMode === "MANUAL" ? "Manual Entry" : "From Tire Pressure"}
                </span>
                <Switch 
                  id="contact-mode-3"
                  checked={contactPatchMode === "AUTO"} 
                  onCheckedChange={(checked) => setValue("contactPatchMode", checked ? "AUTO" : "MANUAL")} 
                />
              </div>
            </div>
            
            {contactPatchMode === "AUTO" ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Tire Width ({unitLabels.length})</Label>
                  <Input type="number" step="any" {...register("tireWidth", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Tire Pressure ({unitLabels.pressure})</Label>
                  <Input type="number" step="any" {...register("tirePressure", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Tires Per Axle</Label>
                  <Select value={watch("tiresPerAxle")?.toString()} onValueChange={(v) => setValue("tiresPerAxle", parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 (Single)</SelectItem>
                      <SelectItem value="4">4 (Dual)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}
          </div>
          
          {contactPatchMode === "MANUAL" ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Tire Width ({unitLabels.length})</Label>
                <Input type="number" step="any" {...register("tireWidth", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Tire Length ({unitLabels.length})</Label>
                <Input type="number" step="any" {...register("tireLength", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Axle Width ({unitLabels.length})</Label>
                <Input type="number" step="any" {...register("axleWidth", { valueAsNumber: true })} />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tire Length ({unitLabels.length}) <span className="text-xs text-muted-foreground">(calculated)</span></Label>
                <Input 
                  type="number" 
                  step="any" 
                  {...register("tireLength", { valueAsNumber: true })} 
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Axle Width ({unitLabels.length})</Label>
                <Input type="number" step="any" {...register("axleWidth", { valueAsNumber: true })} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AnalysisParametersSection
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        unitsSystem={unitsSystem}
      />

      <Button type="submit" className="w-full" size="lg">
        <CalcIcon className="w-5 h-5 mr-2" />
        Calculate 3-Axle Vehicle Loading
      </Button>
    </form>
  );
};
