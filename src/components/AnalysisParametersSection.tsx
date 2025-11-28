import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PavementType, VehicleClass, EquivStressMethod, CodeCheck, UnitsSystem } from "@/domain/pipeline/types";
import { getCodeLabel, getCodeDescription, CODE_PROFILES } from "@/domain/pipeline/codeProfiles";

interface AnalysisParametersSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  unitsSystem: UnitsSystem;
}

export const AnalysisParametersSection = ({ 
  register, 
  errors, 
  watch, 
  setValue, 
  unitsSystem 
}: AnalysisParametersSectionProps) => {
  const unitLabels = unitsSystem === "EN" 
    ? { pressure: "psi" }
    : { pressure: "kPa" };

  const codeCheck = watch("codeCheck");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Parameters</CardTitle>
        <CardDescription>Impact factors, stress methods, and code checks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
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
                <SelectItem value="HIGHWAY">Highway</SelectItem>
                <SelectItem value="FARM">Farm / Construction</SelectItem>
                <SelectItem value="TRACK">Track</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
        </div>

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
                <SelectItem value="TRESCA">Tresca</SelectItem>
                <SelectItem value="VON_MISES">Von Mises</SelectItem>
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
                <SelectItem value="B31_4">{getCodeLabel('B31_4')}</SelectItem>
                <SelectItem value="B31_8">{getCodeLabel('B31_8')}</SelectItem>
                <SelectItem value="CSA_Z662">{getCodeLabel('CSA_Z662')}</SelectItem>
                <SelectItem value="USER_DEFINED">User Defined</SelectItem>
              </SelectContent>
            </Select>
            {codeCheck !== "USER_DEFINED" && (
              <p className="text-xs text-muted-foreground mt-1">
                Default limits: {CODE_PROFILES[codeCheck as keyof typeof CODE_PROFILES]?.hoopLimitPct}% SMYS for Hoop, Longitudinal, and Equivalent stresses. 
                Choose 'User Defined' to customize.
              </p>
            )}
          </div>
        </div>

        {codeCheck === "USER_DEFINED" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Define custom stress limits as percentage of SMYS (0-100%)
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="userDefinedLimits.hoopLimitPct">Hoop Limit (% SMYS) *</Label>
                <Input
                  id="userDefinedLimits.hoopLimitPct"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  defaultValue={90}
                  {...register("userDefinedLimits.hoopLimitPct", { 
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be >= 0" },
                    max: { value: 100, message: "Must be <= 100" }
                  })}
                />
                {errors.userDefinedLimits && 'hoopLimitPct' in errors.userDefinedLimits && errors.userDefinedLimits.hoopLimitPct && (
                  <p className="text-xs text-destructive">{String(errors.userDefinedLimits.hoopLimitPct.message)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="userDefinedLimits.longLimitPct">Longitudinal Limit (% SMYS) *</Label>
                <Input
                  id="userDefinedLimits.longLimitPct"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  defaultValue={90}
                  {...register("userDefinedLimits.longLimitPct", { 
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be >= 0" },
                    max: { value: 100, message: "Must be <= 100" }
                  })}
                />
                {errors.userDefinedLimits && 'longLimitPct' in errors.userDefinedLimits && errors.userDefinedLimits.longLimitPct && (
                  <p className="text-xs text-destructive">{String(errors.userDefinedLimits.longLimitPct.message)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="userDefinedLimits.equivLimitPct">Equivalent Limit (% SMYS) *</Label>
                <Input
                  id="userDefinedLimits.equivLimitPct"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  defaultValue={90}
                  {...register("userDefinedLimits.equivLimitPct", { 
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be >= 0" },
                    max: { value: 100, message: "Must be <= 100" }
                  })}
                />
                {errors.userDefinedLimits && 'equivLimitPct' in errors.userDefinedLimits && errors.userDefinedLimits.equivLimitPct && (
                  <p className="text-xs text-destructive">{String(errors.userDefinedLimits.equivLimitPct.message)}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
