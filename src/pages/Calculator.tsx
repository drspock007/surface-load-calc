import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalculationMode, CalculationRun } from "@/types/calculation";
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

import { Button } from "@/components/ui/button";
import { CalculationResults } from "@/components/results/CalculationResults";
import { draftKey, modes, getSavedResult, isWorkspaceMode, lastModeKey, readWorkspace, resultKey, serialize, useWorkspaceRevision, WorkspaceMode, writeWorkspace } from "@/utils/calculatorWorkspace";

const Calculator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const storageUnavailable = useWorkspaceRevision();
  const remembered = readWorkspace<WorkspaceMode>(lastModeKey);
  const requested = params.get("mode");
  const mode = isWorkspaceMode(requested) ? requested : isWorkspaceMode(remembered) ? remembered : "PIPELINE_TRACK";
  const saved = getSavedResult(mode);
  const view = params.get("view") === "results" && saved ? "results" : "inputs";
  const draft = readWorkspace<Record<string, unknown>>(draftKey(mode));
  const stale = saved && serialize(draft) !== serialize(saved.draft);
  const navigationRef = useRef<HTMLDivElement>(null);
  const previousView = useRef(`${mode}:${view}`);

  useEffect(() => {
    writeWorkspace(lastModeKey, mode);
    if (params.get("mode") !== mode || params.get("view") !== view) {
      setParams({ mode, view }, { replace: true });
    }
  }, [mode, view, params, setParams]);

  useEffect(() => {
    const next = `${mode}:${view}`;
    if (previousView.current !== next && previousView.current.startsWith(`${mode}:`)) {
      navigationRef.current?.querySelector<HTMLElement>('[data-state="active"][role="tab"]')?.focus({ preventScroll: true });
      navigationRef.current?.scrollIntoView?.({ block: "start" });
    }
    previousView.current = next;
  }, [mode, view]);

  const changeView = (next: string) => setParams({ mode, view: next });
  const showResult = (run: CalculationRun) => {
    writeWorkspace(resultKey(mode), { run, draft: readWorkspace(draftKey(mode)) ?? {} });
    changeView("results");
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
        description: "Results are ready to review",
      });
      showResult(run);
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
        description: "Results are ready to review",
      });
      showResult(run);
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
        description: "Results are ready to review",
      });
      showResult(run);
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
        description: "Results are ready to review",
      });
      showResult(run);
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const workspace = <>

        {storageUnavailable && <p role="status" className="mb-4 rounded border border-amber-500 p-3 text-sm">
          Browser storage is unavailable. Your work is kept for this session, but may not be available after reloading or closing this page.
        </p>}

        <Tabs value={view} onValueChange={changeView}>
          <div ref={navigationRef} className="scroll-mt-4 mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inputs">Inputs</TabsTrigger>
              <TabsTrigger value="results" disabled={!saved}>Results{stale ? " •" : ""}</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="inputs" forceMount hidden={view !== "inputs"} className="data-[state=inactive]:hidden">
            {mode === "PIPELINE_TRACK" && <PipelineTrackForm onCalculate={handlePipelineCalculate} />}
            {mode === "2_AXLE" && <TwoAxleForm onCalculate={handle2AxleCalculate} />}
            {mode === "3_AXLE" && <ThreeAxleForm onCalculate={handle3AxleCalculate} />}
            {mode === "GRID" && <GridLoadForm onCalculate={handleGridCalculate} />}
          </TabsContent>
          <TabsContent value="results">
            {saved && <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                {stale && <p role="status" className="text-sm text-amber-700 dark:text-amber-400">Recalculate required — these results reflect the previous inputs.</p>}
                <Button variant="outline" onClick={() => changeView("inputs")}>Edit inputs</Button>
              </div>
              <CalculationResults run={saved.run} embedded onBack={() => changeView("inputs")}
                onEditInputs={() => changeView("inputs")} onHistory={() => navigate("/runs")} />
            </>}
          </TabsContent>
        </Tabs>
  </>;

  return (
    <Layout>
      <SEO title="Calculator | CEPA Buried Pipeline Surface Loading" description="Run CEPA buried pipeline surface load calculations for track vehicles, 2-axle, 3-axle, and grid loads with instant stress results." path="/calculator" />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Calculator</h1>
          <p className="text-muted-foreground">
            Select a mode, enter parameters, and review results
          </p>
        </div>

        <Tabs value={mode} onValueChange={(v) => {
            setParams({ mode: v, view: "inputs" });
            // GA4: track analysis type selection
            trackEvent("analysis_mode_select", { analysis_mode: v });
          }} className="mb-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">Pipeline Loading Analysis</h2>
              <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="PIPELINE_TRACK">Track Vehicle</TabsTrigger>
                <TabsTrigger value="2_AXLE">2-Axle</TabsTrigger>
                <TabsTrigger value="3_AXLE">3-Axle</TabsTrigger>
                <TabsTrigger value="GRID">Grid Load</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {modes.map(option => (
            <TabsContent key={option} value={option}>
              {mode === option ? workspace : null}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Calculator;
