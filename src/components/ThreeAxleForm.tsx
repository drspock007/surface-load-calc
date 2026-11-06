import { peSchemaFields, PE_FORM_DEFAULTS, extractPeInputs } from "@/components/pipe/peFormFields";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
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
import { CalculationNameCard } from "@/components/CalculationNameCard";
import { useFormDraft } from "@/hooks/useFormDraft";
import { ThreeAxleInputs, UnitsSystem, SoilLoadMethod, EPrimeMethod, BeddingAngleDeg, EquivStressMethod, CodeCheck, SoilType, Compaction, PavementType, VehicleClass, TirePressureUnit } from "@/domain/pipeline/types3Axle";
import { PipeSelector } from "./PipelineTrackForm/PipeSelector";
import { SoilLoadSection } from "./PipelineTrackForm/SoilLoadSection";
import { AnalysisParametersSection } from "./AnalysisParametersSection";
import { SoilDensitySelector } from "./SoilDensitySelector";
import { convertFormValue } from "@/domain/pipeline/unitConversions";
import { calculateAxleContact } from "@/domain/pipeline/axleContact";
import { AxleContactSection } from "./AxleContactSection";
import { ThreeAxleDiagram } from "./ThreeAxleDiagram";
import { createEnsurePositive } from "@/hooks/useEnsurePositive";
import { InfoTooltip } from "@/components/InfoTooltip";

const threeAxleSchema = z.object({
  calculationName: z.string().optional(),
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
  ePrimeMethod: z.enum(["LOOKUP", "USER_DEFINED"]),
  ePrimeUserDefined: z.number().positive().optional(),
  soilType: z.enum(["FINE", "COARSE_WITH_FINES", "COARSE_NO_FINES"]).optional(),
  compaction: z.number().optional(),
  axle1To2Spacing: z.number().positive(),
  axle2To3Spacing: z.number().positive(),
  axle1Load: z.number().positive(),
  axle2Load: z.number().positive(),
  axle3Load: z.number().positive(),
  contactPatchMode: z.enum(["MANUAL", "AUTO", "GROUND_PRESSURE"]),
  contactPressureReference: z.string().optional(),
  axle1GroundPressure: z.union([z.number(), z.nan(), z.literal('')]).transform(value => value === '' ? NaN : value).optional(),
  axle1GroundPressureUnit: z.enum(["kPa", "kg/m2", "bar", "psig"]).optional(),
  axle2GroundPressure: z.union([z.number(), z.nan(), z.literal('')]).transform(value => value === '' ? NaN : value).optional(),
  axle2GroundPressureUnit: z.enum(["kPa", "kg/m2", "bar", "psig"]).optional(),
  axle3GroundPressure: z.union([z.number(), z.nan(), z.literal('')]).transform(value => value === '' ? NaN : value).optional(),
  axle3GroundPressureUnit: z.enum(["kPa", "kg/m2", "bar", "psig"]).optional(),
  // Axle 1 tire properties
  axle1TireWidth: z.number().positive(),
  axle1TireLength: z.union([z.number(), z.nan(), z.literal('')]).transform(value => value === '' ? NaN : value),
  axle1TirePressure: z.union([z.number(), z.nan(), z.literal('')]).transform(value => value === '' ? NaN : value).optional(),
  axle1TirePressureUnit: z.enum(["kPa", "kg/m2", "bar", "psig"]).optional(),
  axle1TiresPerAxle: z.number().int().positive().optional(),
  // Axle 2 tire properties
  axle2TireWidth: z.number().positive(),
  axle2TireLength: z.union([z.number(), z.nan(), z.literal('')]).transform(value => value === '' ? NaN : value),
  axle2TirePressure: z.union([z.number(), z.nan(), z.literal('')]).transform(value => value === '' ? NaN : value).optional(),
  axle2TirePressureUnit: z.enum(["kPa", "kg/m2", "bar", "psig"]).optional(),
  axle2TiresPerAxle: z.number().int().positive().optional(),
  // Axle 3 tire properties
  axle3TireWidth: z.number().positive(),
  axle3TireLength: z.union([z.number(), z.nan(), z.literal('')]).transform(value => value === '' ? NaN : value),
  axle3TirePressure: z.union([z.number(), z.nan(), z.literal('')]).transform(value => value === '' ? NaN : value).optional(),
  axle3TirePressureUnit: z.enum(["kPa", "kg/m2", "bar", "psig"]).optional(),
  axle3TiresPerAxle: z.number().int().positive().optional(),
  axleWidth: z.number().positive(),
  laneOffset: z.number(),
  pavementType: z.enum(["RIGID", "FLEXIBLE"]),
  vehicleClass: z.enum(["HIGHWAY", "FARM", "TRACK"]),
  equivStressMethod: z.enum(["TRESCA", "VON_MISES"]),
  codeCheck: z.enum(["B31_4", "B31_8", "CSA_Z662", "USER_DEFINED"]),
  selectedNPS: z.string().optional(),
  selectedSchedule: z.string().optional(),
  selectedGrade: z.string().optional(),
  userDefinedLimits: z.object({
    hoopLimitPct: z.number().min(0).max(100),
    longLimitPct: z.number().min(0).max(100),
    equivLimitPct: z.number().min(0).max(100),
  }).optional(),
  enableBendRadius: z.boolean().optional(),
  ...peSchemaFields,
}).superRefine((data, ctx) => {
  for (let axle = 1; axle <= 3; axle++) {
    try { calculateAxleContact(data, axle); } catch (error) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['contactPatchMode'], message: error instanceof Error ? error.message : 'Invalid contact inputs' });
    }
  }
});

type ThreeAxleFormData = z.infer<typeof threeAxleSchema>;

interface ThreeAxleFormProps {
  onCalculate: (inputs: ThreeAxleInputs) => void;
}

export const ThreeAxleForm = ({ onCalculate }: ThreeAxleFormProps) => {
  const [unitsSystem, setUnitsSystem] = useState<UnitsSystem>("SI");
  
  const defaultValues: ThreeAxleFormData = {
    ...PE_FORM_DEFAULTS,
    calculationName: "",
    unitsSystem: "SI",
    pipeOD: 114.3,
    pipeWT: 6.02,
    MOP: 7070,
    SMYS: 359,
    selectedNPS: "4",
    selectedSchedule: "Sch 40 / STD",
    selectedGrade: "API 5L X52",
    deltaT: 10,
    soilDensity: 1600,
    depthCover: 1.2,
    beddingAngleDeg: 30,
    soilLoadMethod: "PRISM",
    frictionAngleDeg: 30,
    soilCohesion: 0,
    ePrimeMethod: "LOOKUP",
    soilType: "COARSE_WITH_FINES",
    compaction: 90,
    axle1To2Spacing: 4,
    axle2To3Spacing: 1.5,
    axle1Load: 12000,
    axle2Load: 17000,
    axle3Load: 17000,
    contactPatchMode: "AUTO",
    // Axle 1 defaults (front - single tires)
    axle1TireWidth: 315,
    axle1TireLength: 10,
    axle1TirePressure: 7,
    axle1TirePressureUnit: "bar",
    axle1TiresPerAxle: 2,
    // Axle 2 defaults (middle - dual tires)
    axle2TireWidth: 315,
    axle2TireLength: 10,
    axle2TirePressure: 7,
    axle2TirePressureUnit: "bar",
    axle2TiresPerAxle: 4,
    // Axle 3 defaults (rear - dual tires)
    axle3TireWidth: 315,
    axle3TireLength: 10,
    axle3TirePressure: 7,
    axle3TirePressureUnit: "bar",
    axle3TiresPerAxle: 4,
    axleWidth: 2400,
    laneOffset: 0,
    pavementType: "FLEXIBLE",
    vehicleClass: "HIGHWAY",
    equivStressMethod: "VON_MISES",
    codeCheck: "B31_4",
  };

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ThreeAxleFormData>({
    resolver: zodResolver(threeAxleSchema),
    defaultValues,
  });

  useFormDraft<ThreeAxleFormData>("3axle", watch, reset, (values) => {
    if (values.unitsSystem) setUnitsSystem(values.unitsSystem as UnitsSystem);
  });

  const ensurePositive = createEnsurePositive(setValue);

  const ePrimeMethod = watch("ePrimeMethod");
  const soilLoadMethod = watch("soilLoadMethod");
  const codeCheck = watch("codeCheck");
  const onSubmit = (data: ThreeAxleFormData) => {
    const inputs: ThreeAxleInputs = {
      ...extractPeInputs(data),
      calculationName: data.calculationName?.trim() || "Untitled calculation",
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
      kr: 1, // Hardcoded per VBA
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
      contactPressureReference: data.contactPressureReference,
      axle1GroundPressure: data.axle1GroundPressure,
      axle1GroundPressureUnit: data.axle1GroundPressureUnit,
      axle2GroundPressure: data.axle2GroundPressure,
      axle2GroundPressureUnit: data.axle2GroundPressureUnit,
      axle3GroundPressure: data.axle3GroundPressure,
      axle3GroundPressureUnit: data.axle3GroundPressureUnit,
      // Axle 1 tire properties
      axle1TireWidth: data.axle1TireWidth,
      axle1TireLength: calculateAxleContact(data, 1).length_in * (data.unitsSystem === "SI" ? 25.4 : 1),
      axle1TirePressure: data.axle1TirePressure,
      axle1TirePressureUnit: data.axle1TirePressureUnit as TirePressureUnit | undefined,
      axle1TiresPerAxle: data.axle1TiresPerAxle,
      // Axle 2 tire properties
      axle2TireWidth: data.axle2TireWidth,
      axle2TireLength: calculateAxleContact(data, 2).length_in * (data.unitsSystem === "SI" ? 25.4 : 1),
      axle2TirePressure: data.axle2TirePressure,
      axle2TirePressureUnit: data.axle2TirePressureUnit as TirePressureUnit | undefined,
      axle2TiresPerAxle: data.axle2TiresPerAxle,
      // Axle 3 tire properties
      axle3TireWidth: data.axle3TireWidth,
      axle3TireLength: calculateAxleContact(data, 3).length_in * (data.unitsSystem === "SI" ? 25.4 : 1),
      axle3TirePressure: data.axle3TirePressure,
      axle3TirePressureUnit: data.axle3TirePressureUnit as TirePressureUnit | undefined,
      axle3TiresPerAxle: data.axle3TiresPerAxle,
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
      enableBendRadius: data.enableBendRadius,
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
    setValue("axle1Load", convertFormValue(currentValues.axle1Load, oldSystem, newSystem, 'force') ?? currentValues.axle1Load);
    setValue("axle2Load", convertFormValue(currentValues.axle2Load, oldSystem, newSystem, 'force') ?? currentValues.axle2Load);
    setValue("axle3Load", convertFormValue(currentValues.axle3Load, oldSystem, newSystem, 'force') ?? currentValues.axle3Load);
    // Axle 1 tire properties
    setValue("axle1TireWidth", convertFormValue(currentValues.axle1TireWidth, oldSystem, newSystem, 'length') ?? currentValues.axle1TireWidth);
    setValue("axle1TireLength", convertFormValue(currentValues.axle1TireLength, oldSystem, newSystem, 'length') ?? currentValues.axle1TireLength);
    // Axle 2 tire properties
    setValue("axle2TireWidth", convertFormValue(currentValues.axle2TireWidth, oldSystem, newSystem, 'length') ?? currentValues.axle2TireWidth);
    setValue("axle2TireLength", convertFormValue(currentValues.axle2TireLength, oldSystem, newSystem, 'length') ?? currentValues.axle2TireLength);
    // Axle 3 tire properties
    setValue("axle3TireWidth", convertFormValue(currentValues.axle3TireWidth, oldSystem, newSystem, 'length') ?? currentValues.axle3TireWidth);
    setValue("axle3TireLength", convertFormValue(currentValues.axle3TireLength, oldSystem, newSystem, 'length') ?? currentValues.axle3TireLength);
    setValue("axleWidth", convertFormValue(currentValues.axleWidth, oldSystem, newSystem, 'length') ?? currentValues.axleWidth);
    
    if (currentValues.ePrimeUserDefined) {
      setValue("ePrimeUserDefined", convertFormValue(currentValues.ePrimeUserDefined, oldSystem, newSystem, 'pressure'));
    }
    if (currentValues.soilCohesion) {
      setValue("soilCohesion", convertFormValue(currentValues.soilCohesion, oldSystem, newSystem, 'pressure') ?? 0);
    }
    
    // GA4: track unit system switches
    trackEvent("units_system_change", { units_system: newSystem });
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
              <Label>MOP ({unitLabels.pressure})<InfoTooltip text="Maximum Operating Pressure — internal pressure used to compute hoop stress." /></Label>
              <Input type="number" step="any" min="0" {...register("MOP", { valueAsNumber: true })} {...ensurePositive("MOP")} />
            </div>
            <div className="space-y-2">
              <Label>ΔT ({unitLabels.temp})<InfoTooltip text="Temperature differential (operating − installation)." /></Label>
              <Input type="number" step="any" {...register("deltaT", { valueAsNumber: true })} />
            </div>
            <SoilDensitySelector
              setValue={setValue}
              watch={watch}
              unitsSystem={unitsSystem}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Cover Depth ({unitLabels.depth})<InfoTooltip text="Vertical distance from ground surface to top of pipe." /></Label>
              <Input type="number" step="any" min="0" {...register("depthCover", { valueAsNumber: true })} {...ensurePositive("depthCover")} />
            </div>
            <div className="space-y-2">
              <Label>Bedding Angle (°)<InfoTooltip text="Angular width of pipe support in the trench (CEPA Table 2-1)." /></Label>
              <Select value={watch("beddingAngleDeg")?.toString()} onValueChange={(v) => setValue("beddingAngleDeg", parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, 30, 60, 90, 120, 150, 180].map((angle) => (
                    <SelectItem key={angle} value={angle.toString()}>{angle}°</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <SoilLoadSection
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
        unitsSystem={unitsSystem}
      />

      <Card>
        <CardHeader>
          <CardTitle>3-Axle Vehicle Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dynamic Vehicle Diagram */}
          <ThreeAxleDiagram
            axle1Load={watch("axle1Load")}
            axle2Load={watch("axle2Load")}
            axle3Load={watch("axle3Load")}
            axle1TireWidth={watch("axle1TireWidth")}
            axle2TireWidth={watch("axle2TireWidth")}
            axle3TireWidth={watch("axle3TireWidth")}
            axle1TirePressure={watch("axle1TirePressure")}
            axle2TirePressure={watch("axle2TirePressure")}
            axle3TirePressure={watch("axle3TirePressure")}
            axle1TirePressureUnit={watch("axle1TirePressureUnit")}
            axle2TirePressureUnit={watch("axle2TirePressureUnit")}
            axle3TirePressureUnit={watch("axle3TirePressureUnit")}
            axle1TiresPerAxle={watch("axle1TiresPerAxle")}
            axle2TiresPerAxle={watch("axle2TiresPerAxle")}
            axle3TiresPerAxle={watch("axle3TiresPerAxle")}
            axle1To2Spacing={watch("axle1To2Spacing")}
            axle2To3Spacing={watch("axle2To3Spacing")}
            axleWidth={watch("axleWidth")}
            unitsSystem={unitsSystem}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Axle 1-2 Spacing ({unitLabels.depth})<InfoTooltip text="Distance between axle 1 and axle 2 centerlines." /></Label>
              <Input type="number" step="any" min="0" {...register("axle1To2Spacing", { valueAsNumber: true })} {...ensurePositive("axle1To2Spacing")} />
            </div>
            <div className="space-y-2">
              <Label>Axle 2-3 Spacing ({unitLabels.depth})<InfoTooltip text="Distance between axle 2 and axle 3 centerlines." /></Label>
              <Input type="number" step="any" min="0" {...register("axle2To3Spacing", { valueAsNumber: true })} {...ensurePositive("axle2To3Spacing")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Axle 1 Load ({unitLabels.force})<InfoTooltip text="Total load carried by axle 1 (front)." /></Label>
              <Input type="number" step="any" min="0" {...register("axle1Load", { valueAsNumber: true })} {...ensurePositive("axle1Load")} />
            </div>
            <div className="space-y-2">
              <Label>Axle 2 Load ({unitLabels.force})<InfoTooltip text="Total load carried by axle 2 (middle)." /></Label>
              <Input type="number" step="any" min="0" {...register("axle2Load", { valueAsNumber: true })} {...ensurePositive("axle2Load")} />
            </div>
            <div className="space-y-2">
              <Label>Axle 3 Load ({unitLabels.force})<InfoTooltip text="Total load carried by axle 3 (rear)." /></Label>
              <Input type="number" step="any" min="0" {...register("axle3Load", { valueAsNumber: true })} {...ensurePositive("axle3Load")} />
            </div>
          </div>
          
          <AxleContactSection values={watch()} axleCount={3} onChange={(key, value) => setValue(key as keyof ThreeAxleFormData, value as never, { shouldDirty: true })} />
          {errors.contactPatchMode && <p role="alert" className="text-sm text-destructive">{errors.contactPatchMode.message}</p>}

          <div className="space-y-2">
            <Label>Axle Width ({unitLabels.length})<InfoTooltip text="Track width of the vehicle: center-to-center distance between left and right tire groups." /></Label>
            <Input type="number" step="any" min="0" {...register("axleWidth", { valueAsNumber: true })} />
          </div>
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
      <CalculationNameCard
        mode="3axle"
        placeholder="e.g., Truck Crossing Analysis"
        register={register}
        errors={errors}
        watch={() => watch() as unknown as Record<string, unknown>}
        setValue={setValue}
        unitsSystem={unitsSystem}
        setUnitsSystem={setUnitsSystem}
      />

    </form>
  );
};
