import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Trash2, FolderOpen, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  PresetMode,
  PresetEntry,
  getPresets,
  savePreset,
  deletePreset,
  exportPresetsToJSON,
  importPresetsFromJSON,
} from "@/utils/presetStorage";

interface PresetManagerProps {
  mode: PresetMode;
  getCurrentValues: () => Record<string, unknown>;
  onLoad: (values: Record<string, unknown>) => void;
}

export const PresetManager = ({ mode, getCurrentValues, onLoad }: PresetManagerProps) => {
  const [presets, setPresets] = useState<PresetEntry[]>(() => getPresets(mode));
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshPresets = () => setPresets(getPresets(mode));

  const handleLoad = (name: string) => {
    const preset = presets.find((p) => p.name === name);
    if (preset) {
      onLoad(preset.values);
      toast.success(`Preset "${name}" loaded`);
      setSelectedPreset("");
    }
  };

  const handleSave = () => {
    const trimmed = presetName.trim();
    if (!trimmed) return;
    const values = getCurrentValues();
    const { calculationName, ...valuesToSave } = values as Record<string, unknown>;
    const ok = savePreset(mode, trimmed, valuesToSave);
    if (ok) {
      toast.success(`Preset "${trimmed}" saved`);
      refreshPresets();
      setSaveDialogOpen(false);
      setPresetName("");
    } else {
      toast.error("Maximum 20 presets reached. Delete one first.");
    }
  };

  const handleDelete = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deletePreset(mode, name);
    refreshPresets();
    toast.success(`Preset "${name}" deleted`);
  };

  const handleExport = () => {
    if (presets.length === 0) {
      toast.error("No presets to export");
      return;
    }
    const json = exportPresetsToJSON(mode);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presets-${mode}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${presets.length} preset(s) exported`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("File too large (max 1 MB)");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = importPresetsFromJSON(mode, reader.result as string);
      if (result.error) {
        toast.error(result.error);
      } else {
        const parts: string[] = [`${result.imported} preset(s) imported`];
        if (result.skippedDuplicate > 0) parts.push(`${result.skippedDuplicate} duplicate(s) skipped`);
        if (result.skippedOverLimit > 0) parts.push(`${result.skippedOverLimit} over limit`);
        toast.success(parts.join(", "));
        refreshPresets();
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <>
      {/* Load Preset selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <FolderOpen className="w-4 h-4" />
          Load Preset
        </Label>
        <Select value={selectedPreset} onValueChange={handleLoad}>
          <SelectTrigger>
            <SelectValue placeholder={presets.length === 0 ? "No saved presets" : "Select a preset..."} />
          </SelectTrigger>
          <SelectContent>
            {presets.map((p) => (
              <div key={p.name} className="flex items-center justify-between pr-2">
                <SelectItem value={p.name} className="flex-1">
                  {p.name}
                </SelectItem>
                <button
                  type="button"
                  className="ml-1 p-1 rounded hover:bg-destructive/20 text-destructive"
                  onClick={(e) => handleDelete(p.name, e)}
                  title={`Delete "${p.name}"`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Save Preset button */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        size="lg"
        onClick={() => setSaveDialogOpen(true)}
      >
        <Save className="w-5 h-5 mr-2" />
        Save Preset
      </Button>

      {/* Export / Import buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleExport}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleImportClick}
        >
          <Upload className="w-4 h-4 mr-1.5" />
          Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
            <DialogDescription>
              Save current parameters under a name for quick reuse.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="preset-name">Preset Name</Label>
            <Input
              id="preset-name"
              placeholder="e.g., Standard Highway Crossing"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              maxLength={100}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!presetName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};