import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnitsSystem } from "@/domain/pipeline/types";
import { PE_SIZES, PE_DIMENSION_RATIOS, PE_MATERIALS, getPeOD, getPeWallThickness } from "@/domain/pipeline/pePresets";
import { createEnsurePositive } from "@/hooks/useEnsurePositive";
import { InfoTooltip } from "@/components/InfoTooltip";

interface PePipeFieldsProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
  unitsSystem: UnitsSystem;
}

export function PePipeFields({ register, setValue, watch, errors, unitsSystem }: PePipeFieldsProps) {
  const ensurePositive = createEnsurePositive(setValue);

  const sizeId = watch("peSizeId") || "IPS-4";
  const dr = watch("dimensionRatio") || 11;
  const designation = watch("peDesignation") || "PE4710";
  const modulusMode = watch("peModulusMode") || "AUTO";
  const pipeOD = watch("pipeOD");

  const lengthUnit = unitsSystem === "EN" ? "in" : "mm";
  const stressUnit = unitsSystem === "EN" ? "psi" : "MPa";
  const isCustomSize = sizeId === "CUSTOM";

  const applyWallThickness = (od: number | undefined, ratio: number) => {
    if (od && ratio) setValue("pipeWT", getPeWallThickness(od, ratio));
  };

  const handleSizeChange = (id: string) => {
    setValue("peSizeId", id);
    if (id !== "CUSTOM") {
      const od = getPeOD(id, unitsSystem);
      if (od !== null) {
        setValue("pipeOD", od);
        applyWallThickness(od, dr);
      }
    }
  };

  const handleDRChange = (value: string) => {
    const ratio = parseFloat(value);
    setValue("dimensionRatio", ratio);
    applyWallThickness(pipeOD, ratio);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="peSizeId">Nominal Size (CSA B137.4)<InfoTooltip text="IPS or CTS polyethylene pipe size per CSA B137.4. Selecting a size fills the outer diameter." /></Label>
          <Select value={sizeId} onValueChange={handleSizeChange}>
            <SelectTrigger id="peSizeId"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PE_SIZES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                  {s.od_in !== null && ` (${unitsSystem === "EN" ? s.od_in + '"' : s.od_mm + " mm"} OD)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dimensionRatio">Dimension Ratio (DR)<InfoTooltip text="DR = OD / wall thickness. The wall thickness is computed automatically from the OD and the DR." /></Label>
          <Select value={String(dr)} onValueChange={handleDRChange}>
            <SelectTrigger id="dimensionRatio"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PE_DIMENSION_RATIOS.map((r) => (
                <SelectItem key={r} value={String(r)}>DR {r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pipeOD">Pipe Outer Diameter ({lengthUnit})<InfoTooltip text="Outer diameter of the PE pipe. Locked when a CSA B137.4 size is selected." /></Label>
          <Input
            id="pipeOD"
            type="number"
            step="any"
            min="0"
            {...register("pipeOD", { valueAsNumber: true })}
            {...ensurePositive("pipeOD")}
            onBlur={(e) => {
              const od = parseFloat(e.target.value);
              if (!isNaN(od)) applyWallThickness(Math.abs(od), dr);
            }}
            disabled={!isCustomSize}
            className={!isCustomSize ? "bg-muted" : ""}
          />
          {errors.pipeOD && <p className="text-sm text-destructive">{errors.pipeOD.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pipeWT">Wall Thickness ({lengthUnit}) = OD / DR<InfoTooltip text="Minimum wall thickness derived from the dimension ratio." /></Label>
          <Input id="pipeWT" type="number" step="any" {...register("pipeWT", { valueAsNumber: true })} disabled className="bg-muted" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="peDesignation">Material Designation<InfoTooltip text="PE cell classification. Sets the HDB, design factor and apparent modulus defaults." /></Label>
          <Select value={designation} onValueChange={(v) => setValue("peDesignation", v)}>
            <SelectTrigger id="peDesignation"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PE_MATERIALS.map((m) => (
                <SelectItem key={m.designation} value={m.designation}>
                  {m.label} — HDB {unitsSystem === "EN" ? `${m.hdb_psi} psi` : `${m.hdb_mpa} MPa`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="peModulusMode">Elastic Modulus<InfoTooltip text="PE modulus is time dependent. AUTO uses the short-term modulus for live loads and the 50-year modulus for soil loads." /></Label>
          <Select value={modulusMode} onValueChange={(v) => setValue("peModulusMode", v)}>
            <SelectTrigger id="peModulusMode"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="AUTO">Auto (short term live + long term soil)</SelectItem>
              <SelectItem value="SHORT_TERM">Short term only</SelectItem>
              <SelectItem value="LONG_TERM">Long term (50 years) only</SelectItem>
              <SelectItem value="CUSTOM">Custom value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {modulusMode === "CUSTOM" && (
        <div className="space-y-2">
          <Label htmlFor="peModulus">Apparent Modulus ({stressUnit})<InfoTooltip text="Apparent modulus of elasticity used for both soil and live load deflection." /></Label>
          <Input id="peModulus" type="number" step="any" min="0" {...register("peModulus", { valueAsNumber: true })} {...ensurePositive("peModulus")} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="peHDB">HDB override ({stressUnit})<InfoTooltip text="Hydrostatic Design Basis. Leave empty to use the designation default." /></Label>
          <Input id="peHDB" type="number" step="any" min="0" {...register("peHDB", { valueAsNumber: true })} {...ensurePositive("peHDB")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="peDeflectionLimitPct">Deflection limit (%)<InfoTooltip text="Allowable ring deflection as a percentage of the diameter. 5 % is the usual limit for PE." /></Label>
          <Input id="peDeflectionLimitPct" type="number" step="any" min="0" {...register("peDeflectionLimitPct", { valueAsNumber: true })} {...ensurePositive("peDeflectionLimitPct")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="peStrainLimitPct">Bending strain limit (%)<InfoTooltip text="Allowable wall bending strain. 5 % is commonly used for PE pipe." /></Label>
          <Input id="peStrainLimitPct" type="number" step="any" min="0" {...register("peStrainLimitPct", { valueAsNumber: true })} {...ensurePositive("peStrainLimitPct")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="peServiceTempC">Service Temperature (°C)<InfoTooltip text="Operating temperature used to de-rate the allowable pressure (PPI TR-4)." /></Label>
        <Input id="peServiceTempC" type="number" step="any" {...register("peServiceTempC", { valueAsNumber: true })} />
      </div>
    </div>
  );
}
