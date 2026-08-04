import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  PresetEntry,
  PRESET_MODES,
  PresetMode,
  MODE_LABELS,
  MAX_IMPORT_BYTES,
} from "@/utils/presetStorage/schema";
import {
  deletePreset,
  duplicatePreset,
  overwritePreset,
  renamePreset,
} from "@/utils/presetStorage/crud";
import {
  buildExportPayload,
  downloadJSON,
  ParsedImport,
  parseImportFile,
} from "@/utils/presetStorage/transfer";
import { PresetRow } from "./PresetRow";
import { PresetImportPreview } from "./PresetImportPreview";

interface PresetLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: PresetMode;
  presets: PresetEntry[];
  refresh: () => void;
  getCurrentValues: () => Record<string, unknown>;
  onLoad: (values: Record<string, unknown>) => void;
}

type SortKey = "name" | "updated";

export const PresetLibraryDialog = ({
  open,
  onOpenChange,
  mode,
  presets,
  refresh,
  getCurrentValues,
  onLoad,
}: PresetLibraryDialogProps) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [pendingImport, setPendingImport] = useState<ParsedImport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handle = (result: { ok: boolean; error?: string }, success: string) => {
    if (result.ok) {
      toast.success(success);
      refresh();
    } else {
      toast.error(result.error ?? "Operation failed");
    }
  };

  const visible = presets
    .filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : b.updatedAt.localeCompare(a.updatedAt),
    );

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
      const count = PRESET_MODES.reduce((n, m) => n + (data[m]?.length ?? 0), 0);
      if (count === 0) {
        toast.error("This file contains no preset");
        return;
      }
      setPendingImport(data);
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] w-[95vw] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preset library — {MODE_LABELS[mode]}</DialogTitle>
            <DialogDescription>
              Manage the parameter sets saved on this device, and move them between devices with a file.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1 space-y-1">
              <Label htmlFor="preset-search">Search</Label>
              <Input
                id="preset-search"
                placeholder="Filter by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-1 sm:w-44">
              <Label>Sort by</Label>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last modified</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            {visible.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {presets.length === 0 ? "No preset saved yet." : "No preset matches this search."}
              </p>
            ) : (
              visible.map((p) => (
                <PresetRow
                  key={p.id}
                  preset={p}
                  onLoad={() => {
                    onLoad(p.values);
                    toast.success(`Preset "${p.name}" loaded`);
                    onOpenChange(false);
                  }}
                  onRename={(name) => handle(renamePreset(mode, p.id, name), "Preset renamed")}
                  onDuplicate={() => handle(duplicatePreset(mode, p.id), "Preset duplicated")}
                  onOverwrite={() =>
                    handle(
                      overwritePreset(mode, p.id, getCurrentValues()),
                      `"${p.name}" updated with current values`,
                    )
                  }
                  onDelete={() => {
                    if (window.confirm(`Delete preset "${p.name}"?`)) {
                      handle(deletePreset(mode, p.id), "Preset deleted");
                    }
                  }}
                />
              ))
            )}
          </div>

          <PresetTransferBar mode={mode} count={presets.length} onFileParsed={setPendingImport} />
        </DialogContent>
      </Dialog>

      <PresetImportPreview
        data={pendingImport}
        onClose={() => setPendingImport(null)}
        onDone={refresh}
      />
    </>
  );
};
