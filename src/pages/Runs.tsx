import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { storage } from "@/utils/storage";
import { CalculationRun } from "@/types/calculation";
import { Trash2, Download, Upload, Eye, Calculator, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Runs = () => {
  const [runs, setRuns] = useState<CalculationRun[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadRuns = () => {
    setRuns(storage.getRuns());
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleDelete = (id: string) => {
    storage.deleteRun(id);
    loadRuns();
    setDeleteId(null);
    toast({
      title: "Deleted",
      description: "Calculation run has been removed",
    });
  };

  const handleExport = () => {
    const json = storage.exportToJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `surface-loading-calculations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exported",
      description: "Calculations exported to JSON file",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = storage.importFromJSON(content);
      if (success) {
        loadRuns();
        toast({
          title: "Imported",
          description: "Calculations imported successfully",
        });
      } else {
        toast({
          title: "Import Failed",
          description: "Invalid JSON format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleView = (run: CalculationRun) => {
    navigate("/results", { state: { run } });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calculation History</h1>
            <p className="text-muted-foreground">View, export, or import saved calculations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={runs.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Import
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </Button>
            <Link to="/calculator">
              <Button>
                <Calculator className="w-4 h-4 mr-2" />
                New
              </Button>
            </Link>
          </div>
        </div>

        {runs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No saved calculations yet. Start a new calculation to see results here.
              </p>
              <Link to="/calculator">
                <Button>
                  <Calculator className="w-4 h-4 mr-2" />
                  Start Calculating
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {runs.map((run) => (
              <Card key={run.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{run.input.calculationName}</CardTitle>
                        <Badge variant={run.mode === 'PIPELINE_TRACK' ? 'default' : 'secondary'}>
                          {run.mode === 'PIPELINE_TRACK' ? 'Pipeline' : 'Simple'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(run.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleView(run)}
                        title="View results"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteId(run.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {run.mode === 'SIMPLE' || !run.mode ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Load</p>
                        <p className="font-medium">{run.input.loadMagnitude} kN</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Depth</p>
                        <p className="font-medium">{run.input.depth} m</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contact Pressure</p>
                        <p className="font-medium text-primary">{run.result.contactPressure} kPa</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Stress</p>
                        <p className="font-medium">{run.result.totalStress} kPa</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      Pipeline calculation preview - click View for full results
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Calculation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The calculation run will be permanently removed from
              local storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Runs;
