import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnitsSystem } from "@/domain/pipeline/types";
import { PIPE_SIZES, STEEL_GRADES, getWallThicknessOptions, getPipeOD, getWallThickness, getSMYS } from "@/domain/pipeline/pipePresets";

interface PipeSelectorProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
  unitsSystem: UnitsSystem;
}

export function PipeSelector({ register, setValue, watch, errors, unitsSystem }: PipeSelectorProps) {
  const selectedNPS = watch("selectedNPS") || "CUSTOM";
  const selectedSchedule = watch("selectedSchedule") || "Custom";
  const selectedGrade = watch("selectedGrade") || "CUSTOM";

  const pipeOD = watch("pipeOD");
  const pipeWT = watch("pipeWT");
  const SMYS = watch("SMYS");

  const unitLabels = unitsSystem === "EN" 
    ? { length: "in", smys: "psi" }
    : { length: "mm", smys: "MPa" };

  const handleNPSChange = (nps: string) => {
    setValue("selectedNPS", nps);
    if (nps !== "CUSTOM") {
      const od = getPipeOD(nps, unitsSystem);
      if (od !== null) {
        setValue("pipeOD", od);
      }
      // Reset schedule when NPS changes
      setValue("selectedSchedule", "Custom");
      setValue("pipeWT", "");
    }
  };

  const handleScheduleChange = (schedule: string) => {
    setValue("selectedSchedule", schedule);
    if (schedule !== "Custom" && selectedNPS !== "CUSTOM") {
      const wt = getWallThickness(selectedNPS, schedule, unitsSystem);
      if (wt !== null) {
        setValue("pipeWT", wt);
      }
    }
  };

  const handleGradeChange = (grade: string) => {
    setValue("selectedGrade", grade);
    if (grade !== "CUSTOM") {
      const smys = getSMYS(grade, unitsSystem);
      if (smys !== null) {
        setValue("SMYS", smys);
      }
    }
  };

  const wallThicknessOptions = selectedNPS !== "CUSTOM" 
    ? getWallThicknessOptions(selectedNPS)
    : [{ schedule: "Custom", wt_in: null, wt_mm: null }];

  const isCustomNPS = selectedNPS === "CUSTOM";
  const isCustomSchedule = selectedSchedule === "Custom";
  const isCustomGrade = selectedGrade === "CUSTOM";

  return (
    <div className="space-y-4">
      {/* NPS Selection */}
      <div className="space-y-2">
        <Label htmlFor="selectedNPS">Nominal Pipe Size (NPS)</Label>
        <Select value={selectedNPS} onValueChange={handleNPSChange}>
          <SelectTrigger id="selectedNPS">
            <SelectValue placeholder="Select NPS..." />
          </SelectTrigger>
          <SelectContent>
            {PIPE_SIZES.map((pipe) => (
              <SelectItem key={pipe.nps} value={pipe.nps}>
                {pipe.label}
                {pipe.nps !== "CUSTOM" && ` (${unitsSystem === "EN" ? pipe.od_in + '"' : pipe.od_mm + ' mm'} OD)`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipe OD */}
      <div className="space-y-2">
        <Label htmlFor="pipeOD">Pipe Outer Diameter ({unitLabels.length})</Label>
        <Input
          id="pipeOD"
          type="number"
          step="any"
          {...register("pipeOD", { valueAsNumber: true })}
          disabled={!isCustomNPS}
          className={!isCustomNPS ? "bg-muted" : ""}
        />
        {errors.pipeOD && (
          <p className="text-sm text-destructive">{errors.pipeOD.message as string}</p>
        )}
      </div>

      {/* Wall Thickness Selection */}
      <div className="space-y-2">
        <Label htmlFor="selectedSchedule">Wall Thickness Schedule</Label>
        <Select 
          value={selectedSchedule} 
          onValueChange={handleScheduleChange}
          disabled={isCustomNPS}
        >
          <SelectTrigger id="selectedSchedule">
            <SelectValue placeholder="Select schedule..." />
          </SelectTrigger>
          <SelectContent>
            {wallThicknessOptions.map((wt, idx) => (
              <SelectItem key={idx} value={wt.schedule}>
                {wt.schedule}
                {wt.schedule !== "Custom" && ` (${unitsSystem === "EN" ? wt.wt_in + '"' : wt.wt_mm + ' mm'})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipe WT */}
      <div className="space-y-2">
        <Label htmlFor="pipeWT">Pipe Wall Thickness ({unitLabels.length})</Label>
        <Input
          id="pipeWT"
          type="number"
          step="any"
          {...register("pipeWT", { valueAsNumber: true })}
          disabled={!isCustomSchedule && !isCustomNPS}
          className={!isCustomSchedule && !isCustomNPS ? "bg-muted" : ""}
        />
        {errors.pipeWT && (
          <p className="text-sm text-destructive">{errors.pipeWT.message as string}</p>
        )}
      </div>

      {/* Steel Grade Selection */}
      <div className="space-y-2">
        <Label htmlFor="selectedGrade">Steel Grade</Label>
        <Select value={selectedGrade} onValueChange={handleGradeChange}>
          <SelectTrigger id="selectedGrade">
            <SelectValue placeholder="Select grade..." />
          </SelectTrigger>
          <SelectContent>
            {STEEL_GRADES.map((steel) => (
              <SelectItem key={steel.grade} value={steel.grade}>
                {steel.grade}
                {steel.grade !== "CUSTOM" && ` (${unitsSystem === "EN" ? steel.smys_psi.toLocaleString() + ' psi' : steel.smys_mpa + ' MPa'})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SMYS */}
      <div className="space-y-2">
        <Label htmlFor="SMYS">Specified Minimum Yield Strength ({unitLabels.smys})</Label>
        <Input
          id="SMYS"
          type="number"
          step="any"
          {...register("SMYS", { valueAsNumber: true })}
          disabled={!isCustomGrade}
          className={!isCustomGrade ? "bg-muted" : ""}
        />
        {errors.SMYS && (
          <p className="text-sm text-destructive">{errors.SMYS.message as string}</p>
        )}
      </div>
    </div>
  );
}
