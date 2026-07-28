import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SoilLoadMethod, EPrimeMethod, SoilType, UnitsSystem } from "@/domain/pipeline/types";
import { createEnsurePositive } from "@/hooks/useEnsurePositive";
import { InfoTooltip } from "@/components/InfoTooltip";

interface SoilLoadSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  unitsSystem: UnitsSystem;
}

export const SoilLoadSection = ({ 
  register, 
  errors, 
  watch, 
  setValue, 
  unitsSystem 
}: SoilLoadSectionProps) => {
  const ensurePositive = createEnsurePositive(setValue);

  const unitLabels = unitsSystem === "EN" 
    ? { pressure: "psi" }
    : { pressure: "kPa" };

  const soilLoadMethod = watch("soilLoadMethod");
  const ePrimeMethod = watch("ePrimeMethod");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Soil Load & E' Parameters</CardTitle>
        <CardDescription>Soil loading method and modulus of soil reaction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="soilLoadMethod">Soil Load Method *<InfoTooltip text="Prism = full weight of soil column above pipe (conservative). Trap Door = arching model reducing load with friction." /></Label>
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
              <Label htmlFor="frictionAngleDeg">Friction Angle (°) *<InfoTooltip text="Internal friction angle of the backfill (typ. 25-40°). Used only for the Trap Door soil load method." /></Label>
              <Input
                id="frictionAngleDeg"
                type="number"
                step="any"
                min="0"
                max="90"
                {...register("frictionAngleDeg", { valueAsNumber: true })}
                {...ensurePositive("frictionAngleDeg")}
              />
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">E' (Modulus of Soil Reaction)</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ePrimeMethod">Method *<InfoTooltip text="E' = modulus of soil reaction. Lookup uses CEPA Table 2-3 by soil type and compaction. User Defined lets you enter a value directly." /></Label>
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
                min="0"
                {...register("ePrimeUserDefined", { valueAsNumber: true })}
                {...ensurePositive("ePrimeUserDefined")}
              />
              </div>
            )}

            {ePrimeMethod === "LOOKUP" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type *<InfoTooltip text="CEPA soil classification driving the E' lookup in Table 2-3." /></Label>
                  <Select
                    value={watch("soilType")}
                    onValueChange={(v) => setValue("soilType", v as SoilType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FINE">Fine-grained with less than 25% sand content</SelectItem>
                      <SelectItem value="COARSE_WITH_FINES">Coarse-grained with fines</SelectItem>
                      <SelectItem value="COARSE_NO_FINES">Coarse-grained with little or no fines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compaction">Compaction (%) *<InfoTooltip text="Percentage of Standard Proctor Density of the backfill. Higher compaction = higher E'." /></Label>
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
  );
};
