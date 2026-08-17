import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnitsSystem, PipeMaterial } from "@/domain/pipeline/types";
import { InfoTooltip } from "@/components/InfoTooltip";
import { SteelPipeFields } from "./SteelPipeFields";
import { PePipeFields } from "./PePipeFields";
import { getPeOD, getPeWallThickness, DEFAULT_PE_SIZE_ID, DEFAULT_PE_DR } from "@/domain/pipeline/pePresets";
import { getPipeOD, getWallThickness, getSMYS } from "@/domain/pipeline/pipePresets";

interface PipeSelectorProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
  unitsSystem: UnitsSystem;
}

/**
 * Pipe definition block: material switch (steel / polyethylene) plus the
 * material specific fields.
 */
export function PipeSelector({ register, setValue, watch, errors, unitsSystem }: PipeSelectorProps) {
  const material = (watch("pipeMaterial") || "STEEL") as PipeMaterial;

  const handleMaterialChange = (value: string) => {
    const next = value as PipeMaterial;
    setValue("pipeMaterial", next);

    if (next === "PE") {
      // Apply the PE defaults so dimensions stay consistent with CSA B137.4
      const sizeId = watch("peSizeId") || DEFAULT_PE_SIZE_ID;
      const dr = watch("dimensionRatio") || DEFAULT_PE_DR;
      setValue("peSizeId", sizeId);
      setValue("dimensionRatio", dr);
      const od = getPeOD(sizeId, unitsSystem);
      if (od !== null) {
        setValue("pipeOD", od);
        setValue("pipeWT", getPeWallThickness(od, dr));
      }
    } else {
      // Restore the steel preset currently selected
      const nps = watch("selectedNPS") || "4";
      const schedule = watch("selectedSchedule") || "Sch 40 / STD";
      const grade = watch("selectedGrade") || "API 5L X52";
      const od = getPipeOD(nps, unitsSystem);
      const wt = getWallThickness(nps, schedule, unitsSystem);
      const smys = getSMYS(grade, unitsSystem);
      if (od !== null) setValue("pipeOD", od);
      if (wt !== null) setValue("pipeWT", wt);
      if (smys !== null) setValue("SMYS", smys);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pipeMaterial">Pipe Material<InfoTooltip text="Steel uses the CEPA stress checks. Polyethylene (CSA B137.4) uses the flexible pipe checks: ring deflection, bending strain, allowable pressure and buckling." /></Label>
        <Select value={material} onValueChange={handleMaterialChange}>
          <SelectTrigger id="pipeMaterial"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="STEEL">Steel (ASME B36.10 / API 5L)</SelectItem>
            <SelectItem value="PE">Polyethylene (CSA B137.4)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {material === "PE" ? (
        <PePipeFields register={register} setValue={setValue} watch={watch} errors={errors} unitsSystem={unitsSystem} />
      ) : (
        <SteelPipeFields register={register} setValue={setValue} watch={watch} errors={errors} unitsSystem={unitsSystem} />
      )}
    </div>
  );
}
