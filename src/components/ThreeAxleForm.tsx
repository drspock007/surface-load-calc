import { useState, useMemo } from "react";
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
import { PresetManager } from "@/components/PresetManager";
import { ThreeAxleInputs, UnitsSystem, SoilLoadMethod, EPrimeMethod, BeddingAngleDeg, EquivStressMethod, CodeCheck, SoilType, Compaction, PavementType, VehicleClass, TirePressureUnit } from "@/domain/pipeline/types3Axle";
import { PipeSelector } from "./PipelineTrackForm/PipeSelector";
import { SoilLoadSection } from "./PipelineTrackForm/SoilLoadSection";
import { AnalysisParametersSection } from "./AnalysisParametersSection";
import { SoilDensitySelector } from "./SoilDensitySelector";
import { convertFormValue } from "@/domain/pipeline/unitConversions";
import { calculateContactPatch, convertTirePressureToPsi, convertTirePressureBetweenUnits } from "@/domain/pipeline/tirePatchCalculations";
import { ThreeAxleDiagram } from "./ThreeAxleDiagram";
import { createEnsurePositive } from "@/hooks/useEnsurePositive";

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
  // Axle 1 tire properties
  axle1TireWidth: z.number().positive(),
  axle1TireLength: z.number().positive(),
  axle1TirePressure: z.number().positive().optional(),
  axle1TirePressureUnit: z.enum(["kPa", "kg/m2", "bar", "psig"]).optional(),
  axle1TiresPerAxle: z.number().int().positive().optional(),
  // Axle 2 tire properties
  axle2TireWidth: z.number().positive(),
  axle2TireLength: z.number().positive(),
  axle2TirePressure: z.number().positive().optional(),
  axle2TirePressureUnit: z.enum(["kPa", "kg/m2", "bar", "psig"]).optional(),
  axle2TiresPerAxle: z.number().int().positive().optional(),
  // Axle 3 tire properties
  axle3TireWidth: z.number().positive(),
  axle3TireLength: z.number().positive(),
  axle3TirePressure: z.number().positive().optional(),
  axle3TirePressureUnit: z.enum(["kPa", "kg/m2", "bar", "psig"]).optional(),
  axle3TiresPerAxle: z.number().int().positive().optional(),
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
  enableBendRadius: z.boolean().optional(),
});

type ThreeAxleFormData = z.infer<typeof threeAxleSchema>;

interface ThreeAxleFormProps {
  onCalculate: (inputs: ThreeAxleInputs) => void;
}

export const ThreeAxleForm = ({ onCalculate }: ThreeAxleFormProps) => {
  const [unitsSystem, setUnitsSystem] = useState<UnitsSystem>("SI");
  
  const defaultValues: ThreeAxleFormData = {
    calculationName: "",
    unitsSystem: "SI",
    pipeOD: 36,
    pipeWT: 0.5,
    MOP: 7070,
    SMYS: 52000,
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

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ThreeAxleFormData>({
    resolver: zodResolver(threeAxleSchema),
    defaultValues,
  });

  const ensurePositive = createEnsurePositive(setValue);

  const ePrimeMethod = watch("ePrimeMethod");
  const soilLoadMethod = watch("soilLoadMethod");
  const codeCheck = watch("codeCheck");
  const contactPatchMode = watch("contactPatchMode");

  // Watch values for real-time tire length calculation
  const axle1Load = watch("axle1Load");
  const axle1TireWidth = watch("axle1TireWidth");
  const axle1TirePressure = watch("axle1TirePressure");
  const axle1TirePressureUnit = watch("axle1TirePressureUnit") || "kg/m2";
  const axle1TiresPerAxle = watch("axle1TiresPerAxle") || 2;

  const axle2Load = watch("axle2Load");
  const axle2TireWidth = watch("axle2TireWidth");
  const axle2TirePressure = watch("axle2TirePressure");
  const axle2TirePressureUnit = watch("axle2TirePressureUnit") || "kg/m2";
  const axle2TiresPerAxle = watch("axle2TiresPerAxle") || 4;

  const axle3Load = watch("axle3Load");
  const axle3TireWidth = watch("axle3TireWidth");
  const axle3TirePressure = watch("axle3TirePressure");
  const axle3TirePressureUnit = watch("axle3TirePressureUnit") || "kg/m2";
  const axle3TiresPerAxle = watch("axle3TiresPerAxle") || 4;

  // Real-time tire length calculation for Axle 1
  const calculatedAxle1TireLength = useMemo(() => {
    if (!axle1Load || !axle1TireWidth || !axle1TirePressure || !axle1TiresPerAxle) return null;
    try {
      const load_lb = unitsSystem === "SI" ? axle1Load * 2.2046226218 : axle1Load;
      const width_in = unitsSystem === "SI" ? axle1TireWidth * 0.03937007874016 : axle1TireWidth;
      const pressure_psi = convertTirePressureToPsi(axle1TirePressure, axle1TirePressureUnit as TirePressureUnit);
      const patch = calculateContactPatch(load_lb, pressure_psi, axle1TiresPerAxle, width_in);
      return unitsSystem === "SI" ? patch.contactLength_in * 25.4 : patch.contactLength_in;
    } catch {
      return null;
    }
  }, [axle1Load, axle1TireWidth, axle1TirePressure, axle1TirePressureUnit, axle1TiresPerAxle, unitsSystem]);

  // Real-time tire length calculation for Axle 2
  const calculatedAxle2TireLength = useMemo(() => {
    if (!axle2Load || !axle2TireWidth || !axle2TirePressure || !axle2TiresPerAxle) return null;
    try {
      const load_lb = unitsSystem === "SI" ? axle2Load * 2.2046226218 : axle2Load;
      const width_in = unitsSystem === "SI" ? axle2TireWidth * 0.03937007874016 : axle2TireWidth;
      const pressure_psi = convertTirePressureToPsi(axle2TirePressure, axle2TirePressureUnit as TirePressureUnit);
      const patch = calculateContactPatch(load_lb, pressure_psi, axle2TiresPerAxle, width_in);
      return unitsSystem === "SI" ? patch.contactLength_in * 25.4 : patch.contactLength_in;
    } catch {
      return null;
    }
  }, [axle2Load, axle2TireWidth, axle2TirePressure, axle2TirePressureUnit, axle2TiresPerAxle, unitsSystem]);

  // Real-time tire length calculation for Axle 3
  const calculatedAxle3TireLength = useMemo(() => {
    if (!axle3Load || !axle3TireWidth || !axle3TirePressure || !axle3TiresPerAxle) return null;
    try {
      const load_lb = unitsSystem === "SI" ? axle3Load * 2.2046226218 : axle3Load;
      const width_in = unitsSystem === "SI" ? axle3TireWidth * 0.03937007874016 : axle3TireWidth;
      const pressure_psi = convertTirePressureToPsi(axle3TirePressure, axle3TirePressureUnit as TirePressureUnit);
      const patch = calculateContactPatch(load_lb, pressure_psi, axle3TiresPerAxle, width_in);
      return unitsSystem === "SI" ? patch.contactLength_in * 25.4 : patch.contactLength_in;
    } catch {
      return null;
    }
  }, [axle3Load, axle3TireWidth, axle3TirePressure, axle3TirePressureUnit, axle3TiresPerAxle, unitsSystem]);

  // Handlers for tire pressure unit change with value conversion
  const handleAxle1PressureUnitChange = (newUnit: TirePressureUnit) => {
    const currentPressure = watch("axle1TirePressure");
    const currentUnit = (watch("axle1TirePressureUnit") || "kg/m2") as TirePressureUnit;
    if (currentPressure && currentUnit !== newUnit) {
      const convertedValue = convertTirePressureBetweenUnits(currentPressure, currentUnit, newUnit);
      setValue("axle1TirePressure", parseFloat(convertedValue.toFixed(2)));
    }
    setValue("axle1TirePressureUnit", newUnit);
  };

  const handleAxle2PressureUnitChange = (newUnit: TirePressureUnit) => {
    const currentPressure = watch("axle2TirePressure");
    const currentUnit = (watch("axle2TirePressureUnit") || "kg/m2") as TirePressureUnit;
    if (currentPressure && currentUnit !== newUnit) {
      const convertedValue = convertTirePressureBetweenUnits(currentPressure, currentUnit, newUnit);
      setValue("axle2TirePressure", parseFloat(convertedValue.toFixed(2)));
    }
    setValue("axle2TirePressureUnit", newUnit);
  };

  const handleAxle3PressureUnitChange = (newUnit: TirePressureUnit) => {
    const currentPressure = watch("axle3TirePressure");
    const currentUnit = (watch("axle3TirePressureUnit") || "kg/m2") as TirePressureUnit;
    if (currentPressure && currentUnit !== newUnit) {
      const convertedValue = convertTirePressureBetweenUnits(currentPressure, currentUnit, newUnit);
      setValue("axle3TirePressure", parseFloat(convertedValue.toFixed(2)));
    }
    setValue("axle3TirePressureUnit", newUnit);
  };

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
      // Axle 1 tire properties
      axle1TireWidth: data.axle1TireWidth,
      axle1TireLength: data.contactPatchMode === "AUTO" && calculatedAxle1TireLength 
        ? calculatedAxle1TireLength 
        : data.axle1TireLength,
      axle1TirePressure: data.axle1TirePressure,
      axle1TirePressureUnit: data.axle1TirePressureUnit as TirePressureUnit | undefined,
      axle1TiresPerAxle: data.axle1TiresPerAxle,
      // Axle 2 tire properties
      axle2TireWidth: data.axle2TireWidth,
      axle2TireLength: data.contactPatchMode === "AUTO" && calculatedAxle2TireLength 
        ? calculatedAxle2TireLength 
        : data.axle2TireLength,
      axle2TirePressure: data.axle2TirePressure,
      axle2TirePressureUnit: data.axle2TirePressureUnit as TirePressureUnit | undefined,
      axle2TiresPerAxle: data.axle2TiresPerAxle,
      // Axle 3 tire properties
      axle3TireWidth: data.axle3TireWidth,
      axle3TireLength: data.contactPatchMode === "AUTO" && calculatedAxle3TireLength 
        ? calculatedAxle3TireLength 
        : data.axle3TireLength,
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input placeholder="e.g., Truck Crossing Analysis" {...register("calculationName")} />
            {errors.calculationName && <p className="text-sm text-destructive mt-1">{errors.calculationName.message}</p>}
          </div>
          <PresetManager
            mode="3axle"
            getCurrentValues={() => watch() as unknown as Record<string, unknown>}
            onLoad={(values) => {
              const vals = values as Record<string, unknown>;
              if (vals.unitsSystem && vals.unitsSystem !== unitsSystem) {
                setUnitsSystem(vals.unitsSystem as "EN" | "SI");
              }
              Object.entries(vals).forEach(([key, val]) => {
                if (key !== "calculationName") {
                  setValue(key as keyof ThreeAxleFormData, val as any);
                }
              });
            }}
          />
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
              <Input type="number" step="any" min="0" {...register("MOP", { valueAsNumber: true })} {...ensurePositive("MOP")} />
            </div>
            <div className="space-y-2">
              <Label>ΔT ({unitLabels.temp})</Label>
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
              <Label>Cover Depth ({unitLabels.depth})</Label>
              <Input type="number" step="any" min="0" {...register("depthCover", { valueAsNumber: true })} {...ensurePositive("depthCover")} />
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
              <Label>Axle 1-2 Spacing ({unitLabels.depth})</Label>
              <Input type="number" step="any" min="0" {...register("axle1To2Spacing", { valueAsNumber: true })} {...ensurePositive("axle1To2Spacing")} />
            </div>
            <div className="space-y-2">
              <Label>Axle 2-3 Spacing ({unitLabels.depth})</Label>
              <Input type="number" step="any" min="0" {...register("axle2To3Spacing", { valueAsNumber: true })} {...ensurePositive("axle2To3Spacing")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Axle 1 Load ({unitLabels.force})</Label>
              <Input type="number" step="any" min="0" {...register("axle1Load", { valueAsNumber: true })} {...ensurePositive("axle1Load")} />
            </div>
            <div className="space-y-2">
              <Label>Axle 2 Load ({unitLabels.force})</Label>
              <Input type="number" step="any" min="0" {...register("axle2Load", { valueAsNumber: true })} {...ensurePositive("axle2Load")} />
            </div>
            <div className="space-y-2">
              <Label>Axle 3 Load ({unitLabels.force})</Label>
              <Input type="number" step="any" min="0" {...register("axle3Load", { valueAsNumber: true })} {...ensurePositive("axle3Load")} />
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
            
            {contactPatchMode === "MANUAL" ? (
              <>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Axle 1 (Front) Contact Patch</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Contact Width per Side ({unitLabels.length})</Label>
                      <Input type="number" step="any" min="0" {...register("axle1TireWidth", { valueAsNumber: true })} />
                      <p className="text-xs text-muted-foreground">Total width for one side of axle</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Length ({unitLabels.length})</Label>
                      <Input type="number" step="any" min="0" {...register("axle1TireLength", { valueAsNumber: true })} />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Axle 2 (Middle) Contact Patch</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Contact Width per Side ({unitLabels.length})</Label>
                      <Input type="number" step="any" min="0" {...register("axle2TireWidth", { valueAsNumber: true })} />
                      <p className="text-xs text-muted-foreground">Total width for one side of axle</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Length ({unitLabels.length})</Label>
                      <Input type="number" step="any" min="0" {...register("axle2TireLength", { valueAsNumber: true })} />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Axle 3 (Rear) Contact Patch</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Contact Width per Side ({unitLabels.length})</Label>
                      <Input type="number" step="any" min="0" {...register("axle3TireWidth", { valueAsNumber: true })} />
                      <p className="text-xs text-muted-foreground">Total width for one side of axle</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Length ({unitLabels.length})</Label>
                      <Input type="number" step="any" min="0" {...register("axle3TireLength", { valueAsNumber: true })} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Axle 1 (Front) Contact Patch</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Single Tire Width ({unitLabels.length})</Label>
                      <Input type="number" step="any" min="0" {...register("axle1TireWidth", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tire Pressure</Label>
                      <div className="flex gap-2">
                        <Input type="number" step="any" min="0" {...register("axle1TirePressure", { valueAsNumber: true })} className="min-w-[80px]" />
                        <Select value={watch("axle1TirePressureUnit") || "kg/m2"} onValueChange={(v) => handleAxle1PressureUnitChange(v as TirePressureUnit)}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg/m2">kg/m²</SelectItem>
                            <SelectItem value="kPa">kPa</SelectItem>
                            <SelectItem value="bar">bar</SelectItem>
                            <SelectItem value="psig">psig</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tire Config</Label>
                      <Select value={watch("axle1TiresPerAxle")?.toString()} onValueChange={(v) => setValue("axle1TiresPerAxle", parseInt(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">Single</SelectItem>
                          <SelectItem value="4">Dual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Contact Width/Side</Label>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-primary/10 text-sm font-mono">
                        {(axle1TireWidth * (axle1TiresPerAxle === 4 ? 2 : 1)).toFixed(0)} {unitLabels.length}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Contact Length</Label>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-muted/30 text-sm font-mono">
                        {calculatedAxle1TireLength?.toFixed(1) || "—"} {unitLabels.length}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Axle 2 (Middle) Contact Patch</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Single Tire Width ({unitLabels.length})</Label>
                      <Input type="number" step="any" min="0" {...register("axle2TireWidth", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tire Pressure</Label>
                      <div className="flex gap-2">
                        <Input type="number" step="any" min="0" {...register("axle2TirePressure", { valueAsNumber: true })} className="min-w-[80px]" />
                        <Select value={watch("axle2TirePressureUnit") || "kg/m2"} onValueChange={(v) => handleAxle2PressureUnitChange(v as TirePressureUnit)}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg/m2">kg/m²</SelectItem>
                            <SelectItem value="kPa">kPa</SelectItem>
                            <SelectItem value="bar">bar</SelectItem>
                            <SelectItem value="psig">psig</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tire Config</Label>
                      <Select value={watch("axle2TiresPerAxle")?.toString()} onValueChange={(v) => setValue("axle2TiresPerAxle", parseInt(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">Single</SelectItem>
                          <SelectItem value="4">Dual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Contact Width/Side</Label>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-primary/10 text-sm font-mono">
                        {(axle2TireWidth * (axle2TiresPerAxle === 4 ? 2 : 1)).toFixed(0)} {unitLabels.length}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Contact Length</Label>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-muted/30 text-sm font-mono">
                        {calculatedAxle2TireLength?.toFixed(1) || "—"} {unitLabels.length}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Axle 3 (Rear) Contact Patch</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Single Tire Width ({unitLabels.length})</Label>
                      <Input type="number" step="any" min="0" {...register("axle3TireWidth", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tire Pressure</Label>
                      <div className="flex gap-2">
                        <Input type="number" step="any" min="0" {...register("axle3TirePressure", { valueAsNumber: true })} className="min-w-[80px]" />
                        <Select value={watch("axle3TirePressureUnit") || "kg/m2"} onValueChange={(v) => handleAxle3PressureUnitChange(v as TirePressureUnit)}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg/m2">kg/m²</SelectItem>
                            <SelectItem value="kPa">kPa</SelectItem>
                            <SelectItem value="bar">bar</SelectItem>
                            <SelectItem value="psig">psig</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tire Config</Label>
                      <Select value={watch("axle3TiresPerAxle")?.toString()} onValueChange={(v) => setValue("axle3TiresPerAxle", parseInt(v))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">Single</SelectItem>
                          <SelectItem value="4">Dual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Contact Width/Side</Label>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-primary/10 text-sm font-mono">
                        {(axle3TireWidth * (axle3TiresPerAxle === 4 ? 2 : 1)).toFixed(0)} {unitLabels.length}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Contact Length</Label>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-muted/30 text-sm font-mono">
                        {calculatedAxle3TireLength?.toFixed(1) || "—"} {unitLabels.length}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Axle Width ({unitLabels.length})</Label>
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
    </form>
  );
};
