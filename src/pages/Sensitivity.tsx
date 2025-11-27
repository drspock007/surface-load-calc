import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/utils/storage";
import { PipelineTrackInputs } from "@/domain/pipeline/types";
import {
  SENSITIVITY_PARAMETERS,
  generateSensitivitySweep,
  exportToCSV,
  SensitivityResult,
} from "@/domain/pipeline/sensitivity";

const Sensitivity = () => {
  const { toast } = useToast();
  const [selectedParameter, setSelectedParameter] = useState<keyof PipelineTrackInputs>('depthCover');
  const [sweepMode, setSweepMode] = useState<'absolute' | 'percentage'>('percentage');
  const [percentRange, setPercentRange] = useState(20);
  const [percentStep, setPercentStep] = useState(5);
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(100);
  const [stepValue, setStepValue] = useState<number>(10);
  const [baseInputs, setBaseInputs] = useState<PipelineTrackInputs | null>(null);
  const [results, setResults] = useState<SensitivityResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Load the most recent Pipeline Track run as base case
  const loadBaseCase = () => {
    const runs = storage.getRuns();
    const pipelineRuns = runs.filter(r => r.mode === 'PIPELINE_TRACK');
    
    if (pipelineRuns.length === 0) {
      toast({
        title: "No Base Case",
        description: "Please run a Pipeline Track calculation first",
        variant: "destructive",
      });
      return;
    }

    const latestRun = pipelineRuns[0];
    setBaseInputs(latestRun.input as PipelineTrackInputs);
    
    toast({
      title: "Base Case Loaded",
      description: `Using "${latestRun.input.calculationName}"`,
    });
  };

  const runAnalysis = () => {
    if (!baseInputs) {
      toast({
        title: "No Base Case",
        description: "Please load a base case first",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    try {
      const config = sweepMode === 'percentage'
        ? { mode: 'percentage' as const, percentRange, percentStep }
        : { mode: 'absolute' as const, min: minValue, max: maxValue, step: stepValue };

      const sweepResults = generateSensitivitySweep(baseInputs, selectedParameter, config);

      if (sweepResults.length === 0) {
        throw new Error("No results generated");
      }

      if (sweepResults.length > 200) {
        toast({
          title: "Too Many Points",
          description: `Reduced from ${sweepResults.length} to 200 points`,
        });
      }

      setResults(sweepResults);
      
      toast({
        title: "Analysis Complete",
        description: `Generated ${sweepResults.length} data points`,
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) {
      toast({
        title: "No Data",
        description: "Run an analysis first",
        variant: "destructive",
      });
      return;
    }

    const param = SENSITIVITY_PARAMETERS.find(p => p.key === selectedParameter);
    if (!param) return;

    const unit = baseInputs?.unitsSystem === 'SI' ? param.unitSI : param.unit;
    const csv = exportToCSV(results, param.label, unit);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensitivity_${selectedParameter}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "CSV file downloaded",
    });
  };

  // Chart data
  const chartData = useMemo(() => {
    return results.map(r => ({
      parameter: r.parameterValue,
      hoop: r.hoopPctSmysMopHigh * 100,
      long: r.longPctSmysMopHigh * 100,
      equiv: r.equivPctSmysMopHigh * 100,
    }));
  }, [results]);

  const selectedParam = SENSITIVITY_PARAMETERS.find(p => p.key === selectedParameter);
  const paramUnit = baseInputs?.unitsSystem === 'SI' ? selectedParam?.unitSI : selectedParam?.unit;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Sensitivity Analysis</h1>
          <p className="text-muted-foreground">
            Analyze how parameter variations affect pipeline stress
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Select parameter and range</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!baseInputs && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Load a base case from your calculation history
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={loadBaseCase} 
                  variant="outline" 
                  className="w-full"
                >
                  Load Base Case
                </Button>

                {baseInputs && (
                  <div className="text-sm p-3 bg-secondary rounded-md">
                    <div className="font-medium">Base Case:</div>
                    <div className="text-muted-foreground">{baseInputs.calculationName}</div>
                    <div className="text-xs mt-1">
                      Units: {baseInputs.unitsSystem === 'EN' ? 'English' : 'Metric'}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Parameter to Vary</Label>
                  <Select
                    value={selectedParameter}
                    onValueChange={(v) => setSelectedParameter(v as keyof PipelineTrackInputs)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SENSITIVITY_PARAMETERS.map(param => (
                        <SelectItem key={param.key} value={param.key}>
                          {param.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Tabs value={sweepMode} onValueChange={(v) => setSweepMode(v as 'absolute' | 'percentage')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="percentage">Percentage</TabsTrigger>
                    <TabsTrigger value="absolute">Absolute</TabsTrigger>
                  </TabsList>

                  <TabsContent value="percentage" className="space-y-3">
                    <div className="space-y-2">
                      <Label>Range (±%)</Label>
                      <Input
                        type="number"
                        value={percentRange}
                        onChange={(e) => setPercentRange(parseFloat(e.target.value))}
                        placeholder="20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Step (%)</Label>
                      <Input
                        type="number"
                        value={percentStep}
                        onChange={(e) => setPercentStep(parseFloat(e.target.value))}
                        placeholder="5"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="absolute" className="space-y-3">
                    <div className="space-y-2">
                      <Label>Min ({paramUnit})</Label>
                      <Input
                        type="number"
                        value={minValue}
                        onChange={(e) => setMinValue(parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max ({paramUnit})</Label>
                      <Input
                        type="number"
                        value={maxValue}
                        onChange={(e) => setMaxValue(parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Step ({paramUnit})</Label>
                      <Input
                        type="number"
                        value={stepValue}
                        onChange={(e) => setStepValue(parseFloat(e.target.value))}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="pt-4 space-y-2">
                  <Button 
                    onClick={runAnalysis} 
                    disabled={!baseInputs || isCalculating}
                    className="w-full"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {isCalculating ? 'Calculating...' : 'Run Analysis'}
                  </Button>

                  <Button
                    onClick={handleExport}
                    variant="outline"
                    disabled={results.length === 0}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {results.length > 0 && (
              <>
                {/* Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Stress vs {selectedParam?.label}</CardTitle>
                    <CardDescription>Variation of stresses at MOP (High values)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="parameter" 
                          label={{ value: `${selectedParam?.label} (${paramUnit})`, position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis label={{ value: '% SMYS', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="hoop" stroke="hsl(var(--chart-1))" name="Hoop" strokeWidth={2} />
                        <Line type="monotone" dataKey="long" stroke="hsl(var(--chart-2))" name="Longitudinal" strokeWidth={2} />
                        <Line type="monotone" dataKey="equiv" stroke="hsl(var(--chart-3))" name="Equivalent" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Results Table</CardTitle>
                    <CardDescription>{results.length} data points</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-2">{selectedParam?.label} ({paramUnit})</th>
                            <th className="text-right p-2">Hoop %SMYS</th>
                            <th className="text-right p-2">Long %SMYS</th>
                            <th className="text-right p-2">Equiv %SMYS</th>
                            <th className="text-center p-2">Pass/Fail</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((r, i) => (
                            <tr key={i} className="border-b hover:bg-secondary/50">
                              <td className="p-2">{r.parameterValue.toFixed(3)}</td>
                              <td className="text-right p-2">{(r.hoopPctSmysMopHigh * 100).toFixed(2)}%</td>
                              <td className="text-right p-2">{(r.longPctSmysMopHigh * 100).toFixed(2)}%</td>
                              <td className="text-right p-2">{(r.equivPctSmysMopHigh * 100).toFixed(2)}%</td>
                              <td className="text-center p-2">
                                <span className={r.passFail ? "text-green-600" : "text-red-600"}>
                                  {r.passFail ? 'PASS' : 'FAIL'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {results.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Configure parameters and run analysis to see results</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Sensitivity;
