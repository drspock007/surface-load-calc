import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnitsSystem } from "@/domain/pipeline/types";
import { InfoTooltip } from "@/components/InfoTooltip";

interface SoilDensitySelectorProps {
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  unitsSystem: UnitsSystem;
}

const SOIL_DENSITY_PRESETS_EN = [
  { value: 90, label: "90 lb/ft³ (Loose)" },
  { value: 100, label: "100 lb/ft³ (Medium)" },
  { value: 110, label: "110 lb/ft³ (Compacted)" },
  { value: 120, label: "120 lb/ft³ (Dense)" },
  { value: 130, label: "130 lb/ft³ (Saturated)" },
];

const SOIL_DENSITY_PRESETS_SI = [
  { value: 1440, label: "1440 kg/m³ (Loose)" },
  { value: 1600, label: "1600 kg/m³ (Medium)" },
  { value: 1760, label: "1760 kg/m³ (Compacted)" },
  { value: 1920, label: "1920 kg/m³ (Dense)" },
  { value: 2080, label: "2080 kg/m³ (Saturated)" },
];

export const SoilDensitySelector = ({ setValue, watch, unitsSystem }: SoilDensitySelectorProps) => {
  const presets = unitsSystem === "EN" ? SOIL_DENSITY_PRESETS_EN : SOIL_DENSITY_PRESETS_SI;
  const unitLabel = unitsSystem === "EN" ? "lb/ft³" : "kg/m³";
  
  const currentValue = watch("soilDensity");
  
  const isPresetValue = presets.some(p => p.value === currentValue);
  const customSelected = watch("soilDensityMode") === "custom";
  const isCustom = customSelected || !isPresetValue;
  const selectValue = isCustom ? "custom" : currentValue?.toString();

  const handleSelectChange = (selectedValue: string) => {
    // Radix may emit an empty value while restoring options after a unit change.
    if (!selectedValue) return;
    setValue("soilDensityMode", selectedValue === "custom" ? "custom" : "preset");
    if (selectedValue !== "custom") setValue("soilDensity", Number(selectedValue));
  };
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("soilDensity", e.target.value === "" ? NaN : Number(e.target.value));
  };
  const handleCustomBlur = () => {
    if (typeof currentValue === "number" && currentValue < 0) setValue("soilDensity", Math.abs(currentValue));
  };

  return (
    <div className="space-y-2">
      <Label>Soil Density ({unitLabel}) *<InfoTooltip text="Bulk unit weight of the backfill above the pipe. Presets follow common CEPA reference values (Loose to Saturated)." /></Label>
      <Select value={selectValue} onValueChange={handleSelectChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select soil density" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value.toString()}>
              {preset.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom...</SelectItem>
        </SelectContent>
      </Select>
      
      {isCustom && (
        <Input
          type="number"
          step="any"
          min="0"
          value={typeof currentValue === "number" && !Number.isFinite(currentValue) ? "" : currentValue ?? ""}
          onChange={handleCustomChange}
          onBlur={handleCustomBlur}
          placeholder={`Enter custom density (${unitLabel})`}
          className="mt-2"
        />
      )}
    </div>
  );
};
