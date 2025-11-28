import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PavementType, VehicleClass, EquivStressMethod, CodeCheck, UnitsSystem } from "@/domain/pipeline/types";

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
                <SelectItem value="B31_4">B31.4</SelectItem>
                <SelectItem value="B31_8">B31.8</SelectItem>
                <SelectItem value="CSA_Z662">CSA Z662</SelectItem>
                <SelectItem value="USER_DEFINED">User Defined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {codeCheck === "USER_DEFINED" && (
          <div className="space-y-2">
            <Label htmlFor="userDefinedStressLimit">Allowable Stress Limit ({unitLabels.pressure}) *</Label>
            <Input
              id="userDefinedStressLimit"
              type="number"
              step="any"
              {...register("userDefinedStressLimit", { valueAsNumber: true })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
