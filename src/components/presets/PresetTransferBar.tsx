import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { MAX_IMPORT_BYTES, PRESET_MODES, PresetMode } from "@/utils/presetStorage/schema";
import { ParsedImport, buildExportPayload, downloadJSON, parseImportFile } from "@/utils/presetStorage/transfer";

interface PresetTransferBarProps {
  mode: PresetMode;
  count: number;
  onFileParsed: (data: ParsedImport) => void;
}

export const PresetTransferBar = ({ mode, count, onFileParsed }: PresetTransferBarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stamp = new Date().toISOString().slice(0, 10);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      toast.error("File too large (max 1 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const { data, error } = parseImportFile(reader.result as string);
      if (error || !data) {
        toast.error(error ?? "Invalid file");
        return;
      }
      const total = PRESET_MODES.reduce((n, m) => n + (data[m]?.length ?? 0), 0);
      if (total === 0) {
        toast.error("This file contains no preset");
        return;
      }
      onFileParsed(data);
    };
    reader.readAsText(file);
  };

  return (
    <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-start">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          if (count === 0) return toast.error("No preset to export");
          downloadJSON(`presets-${mode}-${stamp}.json`, buildExportPayload([mode]));
          toast.success(`${count} preset(s) exported`);
        }}
      >
        <Download className="mr-1.5 h-4 w-4" />
        Export this mode
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          downloadJSON(`presets-all-${stamp}.json`, buildExportPayload(PRESET_MODES));
          toast.success("All presets exported");
        }}
      >
        <Download className="mr-1.5 h-4 w-4" />
        Export all modes
      </Button>
      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
        <Upload className="mr-1.5 h-4 w-4" />
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={onFileChange}
      />
    </DialogFooter>
  );
};
