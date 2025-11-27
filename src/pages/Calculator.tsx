import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalculationInput, CalculationMode } from "@/types/calculation";
import { calculateStress, calculatePipelineTrack } from "@/utils/calculations";
import { calculate2AxleVehicleVBA, calculate3AxleVehicleVBA, calculateGridLoadVBA } from "@/domain/pipeline";
import { storage } from "@/utils/storage";
import { Calculator as CalcIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PipelineTrackForm } from "@/components/PipelineTrackForm";
import { TwoAxleForm } from "@/components/TwoAxleForm";
import { ThreeAxleForm } from "@/components/ThreeAxleForm";
import { GridLoadForm } from "@/components/GridLoadForm";
import { PipelineTrackInputs } from "@/domain/pipeline/types";
import { TwoAxleInputs } from "@/domain/pipeline/types2Axle";
import { ThreeAxleInputs } from "@/domain/pipeline/types3Axle";
import { GridLoadInputs } from "@/domain/pipeline/typesGrid";

const Calculator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<CalculationMode>('SIMPLE');
  
  const [input, setInput] = useState<CalculationInput>({
    calculationName: "",
    loadMagnitude: 100,
    loadLength: 2,
    loadWidth: 2,
    depth: 1,
    soilUnitWeight: 18,
  });

  const handleInputChange = (field: keyof CalculationInput, value: string) => {
    setInput((prev) => ({
      ...prev,
      [field]: field === "calculationName" ? value : parseFloat(value) || 0,
    }));
  };

  const handleCalculate = () => {
    if (!input.calculationName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a calculation name",
        variant: "destructive",
      });
      return;
    }

    if (
      input.loadMagnitude <= 0 ||
      input.loadLength <= 0 ||
      input.loadWidth <= 0 ||
      input.depth < 0 ||
      input.soilUnitWeight <= 0
    ) {
      toast({
        title: "Invalid Input",
        description: "All values must be positive (depth can be zero)",
        variant: "destructive",
      });
      return;
    }

    const result = calculateStress(input);
    const run = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode: 'SIMPLE' as CalculationMode,
      input,
      result,
    };

    storage.saveRun(run);
    toast({
      title: "Calculation Complete",
      description: "Results have been saved",
    });
    navigate("/results", { state: { run } });
  };

  const handlePipelineCalculate = (inputs: PipelineTrackInputs) => {
    try {
      const result = calculatePipelineTrack(inputs);
      const run = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        mode: 'PIPELINE_TRACK' as CalculationMode,
        input: inputs,
        result,
      };

      storage.saveRun(run);
      toast({
        title: "Pipeline Calculation Complete",
        description: "Results have been saved",
      });
      navigate("/results", { state: { run } });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handle2AxleCalculate = (inputs: TwoAxleInputs) => {
    try {
      const result = calculate2AxleVehicleVBA(inputs);
      const run = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        mode: '2_AXLE' as CalculationMode,
        input: inputs,
        result,
      };

      storage.saveRun(run);
      toast({
        title: "2-Axle Calculation Complete",
        description: "Results have been saved",
      });
      navigate("/results", { state: { run } });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handle3AxleCalculate = (inputs: ThreeAxleInputs) => {
    try {
      const result = calculate3AxleVehicleVBA(inputs);
      const run = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        mode: '3_AXLE' as CalculationMode,
        input: inputs,
        result,
      };

      storage.saveRun(run);
      toast({
        title: "3-Axle Calculation Complete",
        description: "Results have been saved",
      });
      navigate("/results", { state: { run } });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleGridCalculate = (inputs: GridLoadInputs) => {
    try {
      const result = calculateGridLoadVBA(inputs);
      const run = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        mode: 'GRID' as CalculationMode,
        input: inputs,
        result,
      };

      storage.saveRun(run);
      toast({
        title: "Grid Load Calculation Complete",
        description: "Results have been saved",
      });
      navigate("/results", { state: { run } });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">New Calculation</h1>
          <p className="text-muted-foreground">
            Select calculation mode and enter parameters
          </p>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as CalculationMode)} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="SIMPLE">Simple</TabsTrigger>
            <TabsTrigger value="PIPELINE_TRACK">Track</TabsTrigger>
            <TabsTrigger value="2_AXLE">2-Axle</TabsTrigger>
            <TabsTrigger value="3_AXLE">3-Axle</TabsTrigger>
            <TabsTrigger value="GRID">Grid</TabsTrigger>
          </TabsList>

          <TabsContent value="SIMPLE">
            <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>All measurements in SI units (kN, m, kN/m³, kPa)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Calculation Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Foundation Load Case 1"
                value={input.calculationName}
                onChange={(e) => handleInputChange("calculationName", e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="load">Load Magnitude (kN) *</Label>
                <Input
                  id="load"
                  type="number"
                  step="0.1"
                  value={input.loadMagnitude}
                  onChange={(e) => handleInputChange("loadMagnitude", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="depth">Depth Below Surface (m) *</Label>
                <Input
                  id="depth"
                  type="number"
                  step="0.1"
                  value={input.depth}
                  onChange={(e) => handleInputChange("depth", e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4 text-foreground">Load Area Dimensions</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="length">Length (m) *</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    value={input.loadLength}
                    onChange={(e) => handleInputChange("loadLength", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="width">Width (m) *</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    value={input.loadWidth}
                    onChange={(e) => handleInputChange("loadWidth", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4 text-foreground">Soil Properties</h3>
              <div className="space-y-2">
                <Label htmlFor="unitWeight">Soil Unit Weight (kN/m³) *</Label>
                <Input
                  id="unitWeight"
                  type="number"
                  step="0.1"
                  value={input.soilUnitWeight}
                  onChange={(e) => handleInputChange("soilUnitWeight", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Typical values: Sand 16-20, Clay 16-22, Gravel 18-22
                </p>
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full" size="lg">
              <CalcIcon className="w-5 h-5 mr-2" />
              Calculate Stress Distribution
            </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="PIPELINE_TRACK">
            <PipelineTrackForm onCalculate={handlePipelineCalculate} />
          </TabsContent>

          <TabsContent value="2_AXLE">
            <TwoAxleForm onCalculate={handle2AxleCalculate} />
          </TabsContent>

          <TabsContent value="3_AXLE">
            <ThreeAxleForm onCalculate={handle3AxleCalculate} />
          </TabsContent>

          <TabsContent value="GRID">
            <GridLoadForm onCalculate={handleGridCalculate} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Calculator;
