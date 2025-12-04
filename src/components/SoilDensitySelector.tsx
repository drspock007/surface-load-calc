import { useState, useEffect } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnitsSystem } from "@/domain/pipeline/types";

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
  
  // Determine if current value matches a preset
  const isPresetValue = presets.some(p => p.value === currentValue);
  const [mode, setMode] = useState<"preset" | "custom">(isPresetValue ? "preset" : "custom");
  const [customValue, setCustomValue] = useState<number>(isPresetValue ? presets[2].value : currentValue);

  // Update mode when unit system changes
  useEffect(() => {
    const newPresets = unitsSystem === "EN" ? SOIL_DENSITY_PRESETS_EN : SOIL_DENSITY_PRESETS_SI;
    const matchesPreset = newPresets.some(p => p.value === currentValue);
    if (matchesPreset) {
      setMode("preset");
    }
  }, [unitsSystem, currentValue]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "custom") {
      setMode("custom");
      setValue("soilDensity", customValue);
    } else {
      setMode("preset");
      const numValue = parseFloat(selectedValue);
      setValue("soilDensity", numValue);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCustomValue(val);
    if (!isNaN(val)) {
      setValue("soilDensity", val);
    }
  };

  const selectValue = mode === "custom" ? "custom" : currentValue?.toString();

  return (
    <div className="space-y-2">
      <Label>Soil Density ({unitLabel}) *</Label>
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
      
      {mode === "custom" && (
        <Input
          type="number"
          step="any"
          value={customValue}
          onChange={handleCustomChange}
          placeholder={`Enter custom density (${unitLabel})`}
          className="mt-2"
        />
      )}
    </div>
  );
};
