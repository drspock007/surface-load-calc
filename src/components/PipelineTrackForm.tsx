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
import { 
  PipelineTrackInputs, 
  UnitsSystem, 
  SoilLoadMethod, 
  EPrimeMethod,
  BeddingAngleDeg,
  EquivStressMethod,
  CodeCheck,
  SoilType,
  Compaction,
  PavementType,
  VehicleClass
} from "@/domain/pipeline/types";

const pipelineSchema = z.object({
  calculationName: z.string().min(1, "Name is required"),
  unitsSystem: z.enum(["EN", "SI"]),
  
  // Pipe properties
  pipeOD: z.number().positive(),
  pipeWT: z.number().positive(),
  MOP: z.number().min(0),
  SMYS: z.number().positive(),
  deltaT: z.number(),
  
  // Soil properties
  soilDensity: z.number().positive(), // lb/ft³ or kg/m³
  depthCover: z.number().min(0),
  beddingAngleDeg: z.number(),
  soilLoadMethod: z.enum(["PRISM", "TRAP_DOOR"]),
  frictionAngleDeg: z.number().min(0).max(90),
  soilCohesion: z.number().min(0),
  kr: z.number().positive(),
  
  // E' method
  ePrimeMethod: z.enum(["LOOKUP", "USER_DEFINED"]),
  ePrimeUserDefined: z.number().positive().optional(),
  soilType: z.enum(["FINE", "COARSE_WITH_FINES", "COARSE_NO_FINES"]).optional(),
  compaction: z.number().optional(),
  
  // Track vehicle
  trackSeparation: z.number().positive(),
  trackLength: z.number().positive(),
  trackVehicleWeight: z.number().positive(),
  trackWidth: z.number().positive(),
  
  // Analysis parameters
  pavementType: z.enum(["RIGID", "FLEXIBLE"]),
  vehicleClass: z.enum(["HIGHWAY", "FARM", "TRACK"]),
  equivStressMethod: z.enum(["TRESCA", "VON_MISES"]),
  codeCheck: z.enum(["B31_4", "B31_8", "CSA_Z662", "USER_DEFINED"]),
  userDefinedStressLimit: z.number().positive().optional(),
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
    
    // Pipe properties (EN: inches, psi, °F)
    pipeOD: 36,
    pipeWT: 0.5,
    MOP: 1000,
    SMYS: 52000,
    deltaT: 0,
    
    // Soil properties (EN: lb/ft³, ft, degrees)
    soilDensity: 120,
    depthCover: 4,
    beddingAngleDeg: 90,
    soilLoadMethod: "PRISM",
    frictionAngleDeg: 30,
    soilCohesion: 0,
    kr: 1,
    
    // E' method
    ePrimeMethod: "LOOKUP",
    soilType: "COARSE_WITH_FINES",
    compaction: 90,
    
    // Track vehicle (EN: inches, lb)
    trackSeparation: 72,
    trackLength: 120,
    trackVehicleWeight: 100000,
    trackWidth: 24,
    
    // Analysis
    pavementType: "FLEXIBLE",
    vehicleClass: "TRACK",
    equivStressMethod: "VON_MISES",
    codeCheck: "B31_4",
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PipelineFormData>({
    resolver: zodResolver(pipelineSchema),
    defaultValues,
  });

  const ePrimeMethod = watch("ePrimeMethod");
  const soilLoadMethod = watch("soilLoadMethod");
  const codeCheck = watch("codeCheck");

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
      userDefinedStressLimit: data.userDefinedStressLimit,
    };
    onCalculate(inputs);
  };

  const toggleUnits = (checked: boolean) => {
    const newSystem: UnitsSystem = checked ? "SI" : "EN";
    setUnitsSystem(newSystem);
    setValue("unitsSystem", newSystem);
  };

  const unitLabels = unitsSystem === "EN" 
    ? {
        length: "in",
        depth: "ft",
        pressure: "psi",
        density: "lb/ft³",
        force: "lb",
        temp: "°F"
      }
    : {
        length: "mm",
        depth: "m",
        pressure: "kPa",
        density: "kN/m³",
        force: "kN",
        temp: "°C"
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

      <Card>
        <CardHeader>
          <CardTitle>Pipeline & Soil Properties</CardTitle>
          <CardDescription>Pipe dimensions, pressures, and soil parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pipeOD">Outer Diameter ({unitLabels.length}) *</Label>
              <Input
                id="pipeOD"
                type="number"
                step="any"
                {...register("pipeOD", { valueAsNumber: true })}
              />
              {errors.pipeOD && <p className="text-sm text-destructive">{errors.pipeOD.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pipeWT">Wall Thickness ({unitLabels.length}) *</Label>
              <Input
                id="pipeWT"
                type="number"
                step="any"
                {...register("pipeWT", { valueAsNumber: true })}
              />
              {errors.pipeWT && <p className="text-sm text-destructive">{errors.pipeWT.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="MOP">MOP ({unitLabels.pressure}) *</Label>
              <Input
                id="MOP"
                type="number"
                step="any"
                {...register("MOP", { valueAsNumber: true })}
              />
              {errors.MOP && <p className="text-sm text-destructive">{errors.MOP.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="SMYS">SMYS ({unitLabels.pressure}) *</Label>
              <Input
                id="SMYS"
                type="number"
                step="any"
                {...register("SMYS", { valueAsNumber: true })}
              />
              {errors.SMYS && <p className="text-sm text-destructive">{errors.SMYS.message}</p>}
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

            <div className="space-y-2">
              <Label htmlFor="soilDensity">Soil Density ({unitsSystem === 'EN' ? 'lb/ft³' : 'kg/m³'}) *</Label>
              <Input
                id="soilDensity"
                type="number"
                step="any"
                {...register("soilDensity", { valueAsNumber: true })}
              />
              {errors.soilDensity && <p className="text-sm text-destructive">{errors.soilDensity.message}</p>}
            </div>
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
              {errors.depthCover && <p className="text-sm text-destructive">{errors.depthCover.message}</p>}
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

            <div className="space-y-2">
              <Label htmlFor="kr">Kr (lateral earth pressure) *</Label>
              <Input
                id="kr"
                type="number"
                step="any"
                {...register("kr", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="soilLoadMethod">Soil Load Method *</Label>
              <Select
                value={watch("soilLoadMethod")}
                onValueChange={(v) => setValue("soilLoadMethod", v as SoilLoadMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRISM">Prism</SelectItem>
                  <SelectItem value="TRAP_DOOR">Trap Door</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {soilLoadMethod === "TRAP_DOOR" && (
              <div className="space-y-2">
                <Label htmlFor="frictionAngleDeg">Friction Angle (°) *</Label>
                <Input
                  id="frictionAngleDeg"
                  type="number"
                  step="any"
                  {...register("frictionAngleDeg", { valueAsNumber: true })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="soilCohesion">Soil Cohesion ({unitLabels.pressure})</Label>
              <Input
                id="soilCohesion"
                type="number"
                step="any"
                {...register("soilCohesion", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">E' (Modulus of Soil Reaction)</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ePrimeMethod">Method *</Label>
                <Select
                  value={watch("ePrimeMethod")}
                  onValueChange={(v) => setValue("ePrimeMethod", v as EPrimeMethod)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOOKUP">Lookup Table</SelectItem>
                    <SelectItem value="USER_DEFINED">User Defined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {ePrimeMethod === "USER_DEFINED" && (
                <div className="space-y-2">
                  <Label htmlFor="ePrimeUserDefined">E' Value ({unitLabels.pressure}) *</Label>
                  <Input
                    id="ePrimeUserDefined"
                    type="number"
                    step="any"
                    {...register("ePrimeUserDefined", { valueAsNumber: true })}
                  />
                </div>
              )}

              {ePrimeMethod === "LOOKUP" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="soilType">Soil Type *</Label>
                    <Select
                      value={watch("soilType")}
                      onValueChange={(v) => setValue("soilType", v as SoilType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FINE">Fine</SelectItem>
                        <SelectItem value="COARSE_WITH_FINES">Coarse with Fines</SelectItem>
                        <SelectItem value="COARSE_NO_FINES">Coarse no Fines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compaction">Compaction (%) *</Label>
                    <Select
                      value={watch("compaction")?.toString()}
                      onValueChange={(v) => setValue("compaction", parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[80, 85, 90, 95, 100].map((comp) => (
                          <SelectItem key={comp} value={comp.toString()}>
                            {comp}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
              {errors.trackLength && <p className="text-sm text-destructive">{errors.trackLength.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackWidth">Track Width ({unitLabels.length}) *</Label>
              <Input
                id="trackWidth"
                type="number"
                step="any"
                {...register("trackWidth", { valueAsNumber: true })}
              />
              {errors.trackWidth && <p className="text-sm text-destructive">{errors.trackWidth.message}</p>}
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
              {errors.trackSeparation && <p className="text-sm text-destructive">{errors.trackSeparation.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackVehicleWeight">Vehicle Weight ({unitsSystem === 'EN' ? 'lb' : 'kg'}) *</Label>
              <Input
                id="trackVehicleWeight"
                type="number"
                step="any"
                {...register("trackVehicleWeight", { valueAsNumber: true })}
              />
              {errors.trackVehicleWeight && <p className="text-sm text-destructive">{errors.trackVehicleWeight.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pavementType">Pavement Type *</Label>
              <Select
                value={watch("pavementType")}
                onValueChange={(v) => setValue("pavementType", v as PavementType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RIGID">Rigid</SelectItem>
                  <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleClass">Vehicle Class *</Label>
              <Select
                value={watch("vehicleClass")}
                onValueChange={(v) => setValue("vehicleClass", v as VehicleClass)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRACK">Track</SelectItem>
                  <SelectItem value="HIGHWAY">Highway</SelectItem>
                  <SelectItem value="FARM">Farm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Parameters</CardTitle>
          <CardDescription>Stress calculation and code compliance settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="equivStressMethod">Equivalent Stress Method *</Label>
              <Select
                value={watch("equivStressMethod")}
                onValueChange={(v) => setValue("equivStressMethod", v as EquivStressMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VON_MISES">Von Mises</SelectItem>
                  <SelectItem value="TRESCA">Tresca</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codeCheck">Code Check *</Label>
              <Select
                value={watch("codeCheck")}
                onValueChange={(v) => setValue("codeCheck", v as CodeCheck)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B31_4">ASME B31.4</SelectItem>
                  <SelectItem value="B31_8">ASME B31.8</SelectItem>
                  <SelectItem value="CSA_Z662">CSA Z662</SelectItem>
                  <SelectItem value="USER_DEFINED">User Defined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {codeCheck === "USER_DEFINED" && (
            <div className="space-y-2">
              <Label htmlFor="userDefinedStressLimit">Stress Limit (% SMYS) *</Label>
              <Input
                id="userDefinedStressLimit"
                type="number"
                step="any"
                placeholder="e.g., 90 for 90% SMYS"
                {...register("userDefinedStressLimit", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Enter as percentage (e.g., 90 for 90% of SMYS)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg">
        <CalcIcon className="w-5 h-5 mr-2" />
        Calculate Pipeline Stresses
      </Button>
    </form>
  );
};
