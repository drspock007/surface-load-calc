import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalculationMode } from "@/types/calculation";
import { calculatePipelineTrack } from "@/utils/calculations";
import { calculate2AxleVehicleVBA, calculate3AxleVehicleVBA, calculateGridLoadVBA } from "@/domain/pipeline";
import { storage } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { PipelineTrackForm } from "@/components/PipelineTrackForm/index";
import { TwoAxleForm } from "@/components/TwoAxleForm";
import { ThreeAxleForm } from "@/components/ThreeAxleForm";
import { GridLoadForm } from "@/components/GridLoadForm";
import { PipelineTrackInputs } from "@/domain/pipeline/types";
import { TwoAxleInputs } from "@/domain/pipeline/types2Axle";
import { ThreeAxleInputs } from "@/domain/pipeline/types3Axle";
import { GridLoadInputs } from "@/domain/pipeline/typesGrid";
import { SEO } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";

const Calculator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<CalculationMode>('PIPELINE_TRACK');

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
      <SEO title="Calculator | CEPA Buried Pipeline Surface Loading" description="Run CEPA buried pipeline surface load calculations for track vehicles, 2-axle, 3-axle, and grid loads with instant stress results." path="/calculator" />
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">New Calculation</h1>
          <p className="text-muted-foreground">
            Select calculation mode and enter parameters
          </p>
        </div>

        <Tabs value={mode} onValueChange={(v) => {
            setMode(v as CalculationMode);
            // GA4: track analysis type selection
            trackEvent("analysis_mode_select", { analysis_mode: v });
          }} className="mb-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Pipeline Loading Analysis</h3>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="PIPELINE_TRACK">Track Vehicle</TabsTrigger>
                <TabsTrigger value="2_AXLE">2-Axle</TabsTrigger>
                <TabsTrigger value="3_AXLE">3-Axle</TabsTrigger>
                <TabsTrigger value="GRID">Grid Load</TabsTrigger>
              </TabsList>
            </div>
          </div>

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
