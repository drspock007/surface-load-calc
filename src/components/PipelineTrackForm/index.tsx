import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calculator as CalcIcon } from "lucide-react";
import { 
  PipelineTrackInputs, 
  UnitsSystem,
  BeddingAngleDeg,
  Compaction
} from "@/domain/pipeline/types";
import { PipelineInputsSection } from "./PipelineInputsSection";
import { SoilLoadSection } from "./SoilLoadSection";
import { TrackVehicleSection } from "./TrackVehicleSection";
import { AnalysisParametersSection } from "./AnalysisParametersSection";

const pipelineSchema = z.object({
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
  trackSeparation: z.number().positive(),
  trackLength: z.number().positive(),
  trackVehicleWeight: z.number().positive(),
  trackWidth: z.number().positive(),
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

type PipelineFormData = z.infer<typeof pipelineSchema>;

interface PipelineTrackFormProps {
  onCalculate: (inputs: PipelineTrackInputs) => void;
}

export const PipelineTrackForm = ({ onCalculate }: PipelineTrackFormProps) => {
  const [unitsSystem, setUnitsSystem] = useState<UnitsSystem>("EN");
  
  const defaultValues: PipelineFormData = {
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
    trackSeparation: 72,
    trackLength: 120,
    trackVehicleWeight: 100000,
    trackWidth: 24,
    pavementType: "FLEXIBLE",
    vehicleClass: "TRACK",
    equivStressMethod: "VON_MISES",
    codeCheck: "B31_4",
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PipelineFormData>({
    resolver: zodResolver(pipelineSchema),
    defaultValues,
  });

  const onSubmit = (data: PipelineFormData) => {
    const inputs: PipelineTrackInputs = {
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
      trackSeparation: data.trackSeparation,
      trackLength: data.trackLength,
      trackVehicleWeight: data.trackVehicleWeight,
      trackWidth: data.trackWidth,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Unit System</CardTitle>
              <CardDescription>Select measurement system for inputs/outputs</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="units-toggle" className="text-sm font-medium">
                {unitsSystem === "EN" ? "English" : "Metric"}
              </Label>
              <Switch
                id="units-toggle"
                checked={unitsSystem === "SI"}
                onCheckedChange={toggleUnits}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calculation Name</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Pipeline Crossing Analysis 1"
              {...register("calculationName")}
            />
            {errors.calculationName && (
              <p className="text-sm text-destructive">{errors.calculationName.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <PipelineInputsSection 
        register={register} 
        errors={errors} 
        watch={watch} 
        setValue={setValue}
        unitsSystem={unitsSystem}
      />

      <SoilLoadSection 
        register={register} 
        errors={errors} 
        watch={watch} 
        setValue={setValue}
        unitsSystem={unitsSystem}
      />

      <TrackVehicleSection 
        register={register} 
        errors={errors} 
        unitsSystem={unitsSystem}
      />

      <AnalysisParametersSection 
        register={register} 
        errors={errors} 
        watch={watch} 
        setValue={setValue}
        unitsSystem={unitsSystem}
      />

      <Button type="submit" className="w-full" size="lg">
        <CalcIcon className="w-5 h-5 mr-2" />
        Calculate Pipeline Track
      </Button>
    </form>
  );
};
