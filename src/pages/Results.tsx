import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, FileText, CheckCircle2, XCircle } from "lucide-react";
import { CalculationRun } from "@/types/calculation";
import { PipelineTrackResults } from "@/domain/pipeline/types";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const run = location.state?.run as CalculationRun | undefined;

  if (!run) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-muted-foreground mb-4">No calculation results to display</p>
          <Button onClick={() => navigate("/calculator")}>Go to Calculator</Button>
        </div>
      </Layout>
    );
  }

  const isPipeline = run.mode === "PIPELINE_TRACK";
  const pipelineResult = isPipeline ? (run.result as PipelineTrackResults) : null;

  const formatValue = (value: number, decimals = 2) => {
    return value.toFixed(decimals);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Calculation Results</h1>
              <Badge variant={isPipeline ? "default" : "secondary"}>
                {isPipeline ? "Pipeline Track" : "Simple"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{run.input.calculationName}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(run.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {!isPipeline ? (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Input Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Load Magnitude</p>
                    <p className="text-lg font-semibold">{run.input.loadMagnitude} kN</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Depth Below Surface</p>
                    <p className="text-lg font-semibold">{run.input.depth} m</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Load Area</p>
                    <p className="text-lg font-semibold">
                      {run.input.loadLength} × {run.input.loadWidth} m
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Soil Unit Weight</p>
                    <p className="text-lg font-semibold">{run.input.soilUnitWeight} kN/m³</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          ) : run.mode === 'PIPELINE_TRACK' ? (
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Track Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Max Surface Pressure</p>
                    <p className="text-2xl font-bold">{run.result.maxSurfacePressureOnPipe?.toFixed(2)} {run.input.unitsSystem === 'EN' ? 'psi' : 'kPa'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p>{run.result.locationMaxLoad}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pass/Fail</p>
                    <Badge variant={run.result.passFailSummary?.overallPass ? "default" : "destructive"}>
                      {run.result.passFailSummary?.overallPass ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : pipelineResult && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Units System</p>
                    <p className="text-lg font-semibold">{run.input.unitsSystem === 'EN' ? 'English (psi, in, ft, lb)' : 'Metric (kPa, mm, m, kN)'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Impact Factor</p>
                    <p className="text-lg font-semibold">{formatValue(pipelineResult.impactFactorUsed)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Pressure Location</p>
                    <p className="text-lg font-semibold">{pipelineResult.locationMaxLoad}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Surface Pressure on Pipe</p>
                    <p className="text-lg font-semibold">
                      {formatValue(pipelineResult.maxSurfacePressureOnPipe)} {run.input.unitsSystem === 'EN' ? 'psi' : 'kPa'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Stress Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    Hoop Stresses
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-3 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground mb-1">At Zero Pressure</p>
                      <p className="font-mono">High: {formatValue(pipelineResult.stresses.atZeroPressure.hoop.high)} psi</p>
                      <p className="font-mono">Low: {formatValue(pipelineResult.stresses.atZeroPressure.hoop.low)} psi</p>
                      <p className="text-xs text-muted-foreground mt-2">Components:</p>
                      <p className="text-xs font-mono">Earth: {formatValue(pipelineResult.stresses.atZeroPressure.hoop.components.earth)}</p>
                      <p className="text-xs font-mono">Thermal: {formatValue(pipelineResult.stresses.atZeroPressure.hoop.components.thermal)}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground mb-1">At MOP</p>
                      <p className="font-mono">High: {formatValue(pipelineResult.stresses.atMOP.hoop.high)} psi</p>
                      <p className="font-mono">Low: {formatValue(pipelineResult.stresses.atMOP.hoop.low)} psi</p>
                      <p className="text-xs text-muted-foreground mt-2">Components:</p>
                      <p className="text-xs font-mono">Pressure: {formatValue(pipelineResult.stresses.atMOP.hoop.components.pressure)}</p>
                      <p className="text-xs font-mono">Earth: {formatValue(pipelineResult.stresses.atMOP.hoop.components.earth)}</p>
                      <p className="text-xs font-mono">Thermal: {formatValue(pipelineResult.stresses.atMOP.hoop.components.thermal)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Longitudinal Stresses</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-3 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground mb-1">At Zero Pressure</p>
                      <p className="font-mono">High: {formatValue(pipelineResult.stresses.atZeroPressure.longitudinal.high)} psi</p>
                      <p className="font-mono">Low: {formatValue(pipelineResult.stresses.atZeroPressure.longitudinal.low)} psi</p>
                      <p className="text-xs text-muted-foreground mt-2">Components:</p>
                      <p className="text-xs font-mono">Earth: {formatValue(pipelineResult.stresses.atZeroPressure.longitudinal.components.earth)}</p>
                      <p className="text-xs font-mono">Thermal: {formatValue(pipelineResult.stresses.atZeroPressure.longitudinal.components.thermal)}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground mb-1">At MOP</p>
                      <p className="font-mono">High: {formatValue(pipelineResult.stresses.atMOP.longitudinal.high)} psi</p>
                      <p className="font-mono">Low: {formatValue(pipelineResult.stresses.atMOP.longitudinal.low)} psi</p>
                      <p className="text-xs text-muted-foreground mt-2">Components:</p>
                      <p className="text-xs font-mono">Pressure: {formatValue(pipelineResult.stresses.atMOP.longitudinal.components.pressure)}</p>
                      <p className="text-xs font-mono">Earth: {formatValue(pipelineResult.stresses.atMOP.longitudinal.components.earth)}</p>
                      <p className="text-xs font-mono">Thermal: {formatValue(pipelineResult.stresses.atMOP.longitudinal.components.thermal)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Equivalent Stresses ({run.input.equivStressMethod})</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-3 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground mb-1">At Zero Pressure</p>
                      <p className="font-mono">High: {formatValue(pipelineResult.stresses.atZeroPressure.equivalent.high)} psi</p>
                      <p className="font-mono">Low: {formatValue(pipelineResult.stresses.atZeroPressure.equivalent.low)} psi</p>
                      <p className="text-sm font-semibold mt-2">
                        {formatValue(pipelineResult.stresses.atZeroPressure.equivalent.percentSMYS)}% SMYS
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground mb-1">At MOP</p>
                      <p className="font-mono">High: {formatValue(pipelineResult.stresses.atMOP.equivalent.high)} psi</p>
                      <p className="font-mono">Low: {formatValue(pipelineResult.stresses.atMOP.equivalent.low)} psi</p>
                      <p className="text-sm font-semibold mt-2">
                        {formatValue(pipelineResult.stresses.atMOP.equivalent.percentSMYS)}% SMYS
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pass/Fail Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="font-medium">Code Check</span>
                    <span className="text-sm">{run.input.codeCheck}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="font-medium">Allowable Stress Limit</span>
                    <span className="text-sm">{formatValue(pipelineResult.allowableStress)} {run.input.unitsSystem === 'EN' ? 'psi' : 'kPa'}</span>
                  </div>
                  
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span>Hoop @ Zero Pressure</span>
                      {pipelineResult.passFailSummary.hoopAtZero ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span>Hoop @ MOP</span>
                      {pipelineResult.passFailSummary.hoopAtMOP ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span>Longitudinal @ Zero Pressure</span>
                      {pipelineResult.passFailSummary.longitudinalAtZero ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span>Longitudinal @ MOP</span>
                      {pipelineResult.passFailSummary.longitudinalAtMOP ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span>Equivalent @ Zero Pressure</span>
                      {pipelineResult.passFailSummary.equivalentAtZero ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span>Equivalent @ MOP</span>
                      {pipelineResult.passFailSummary.equivalentAtMOP ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-4 bg-primary/10 rounded border-2 border-primary/20">
                      <span className="font-bold text-lg">Overall Result</span>
                      {pipelineResult.passFailSummary.overallPass ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                          <span className="font-bold text-green-600">PASS</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-6 w-6 text-destructive" />
                          <span className="font-bold text-destructive">FAIL</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Debug / Intermediate Values</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="debug">
                    <AccordionTrigger>View Intermediate Calculations</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Loading Parameters</h4>
                          <div className="grid gap-2 text-sm font-mono">
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Soil Pressure</span>
                              <span>{formatValue(pipelineResult.debug.soilPressure_psi)} psi</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Boussinesq Max</span>
                              <span>{formatValue(pipelineResult.debug.boussinesqMax_psi)} psi</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Impact Factor @ Depth</span>
                              <span>{formatValue(pipelineResult.debug.impactFactorDepth)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Contact Pressure</span>
                              <span>{formatValue(pipelineResult.debug.contactPressure_psf)} psf</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Influence Factor</span>
                              <span>{formatValue(pipelineResult.debug.influenceFactor, 4)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-2">Pipe Response Coefficients</h4>
                          <div className="grid gap-2 text-sm font-mono">
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Kb (Bedding Factor)</span>
                              <span>{formatValue(pipelineResult.debug.Kb, 4)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Kz (Depth Factor)</span>
                              <span>{formatValue(pipelineResult.debug.Kz, 4)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Theta (Bedding Angle)</span>
                              <span>{formatValue(pipelineResult.debug.Theta)}°</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>E' (Soil Modulus)</span>
                              <span>{formatValue(pipelineResult.debug.ePrime_psi)} psi</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-2">Stress Components (psi)</h4>
                          <div className="grid gap-2 text-sm font-mono">
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Hoop - Soil</span>
                              <span>{formatValue(pipelineResult.debug.hoopSoil_psi)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Hoop - Live Load</span>
                              <span>{formatValue(pipelineResult.debug.hoopLive_psi)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Hoop - Internal Pressure</span>
                              <span>{formatValue(pipelineResult.debug.hoopInt_psi)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Long - Soil</span>
                              <span>{formatValue(pipelineResult.debug.longSoil_psi)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Long - Live Load</span>
                              <span>{formatValue(pipelineResult.debug.longLive_psi)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Long - Internal Pressure</span>
                              <span>{formatValue(pipelineResult.debug.longInt_psi)}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span>Long - Thermal</span>
                              <span>{formatValue(pipelineResult.debug.longTherm_psi)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </>
        )}

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate("/calculator")}>
            New Calculation
          </Button>
          <Button variant="outline" onClick={() => navigate("/runs")}>
            View History
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Results;
