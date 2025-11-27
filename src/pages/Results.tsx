import { useLocation, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalculationRun } from "@/types/calculation";
import { ArrowLeft, Calculator, History } from "lucide-react";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const run = location.state?.run as CalculationRun | undefined;

  if (!run) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-muted-foreground mb-4">No calculation results to display</p>
          <Link to="/calculator">
            <Button>Go to Calculator</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const { input, result, mode } = run;
  
  // Handle pipeline mode (to be fully implemented)
  if (mode === 'PIPELINE_TRACK') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Pipeline Calculation Results</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(run.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Coming Next: Detailed Stress Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive pipeline stress analysis with hoop, longitudinal, and equivalent stresses 
                will be displayed here when the pipeline calculator is fully implemented.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center">
            <Link to="/calculator">
              <Button variant="outline">
                <Calculator className="w-4 h-4 mr-2" />
                New Calculation
              </Button>
            </Link>
            <Link to="/runs">
              <Button variant="outline">
                <History className="w-4 h-4 mr-2" />
                View History
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Simple surface load mode (original)

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{input.calculationName}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(run.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contact Pressure</p>
                <p className="text-2xl font-bold text-primary">{result.contactPressure} kPa</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Stress at Depth</p>
                <p className="text-2xl font-bold text-accent">{result.stressAtDepth} kPa</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Stress</p>
                <p className="text-2xl font-bold text-foreground">{result.totalStress} kPa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Input Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Load Magnitude</span>
                <span className="font-medium">{input.loadMagnitude} kN</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Load Area (L × W)</span>
                <span className="font-medium">
                  {input.loadLength} × {input.loadWidth} m
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Calculated Area</span>
                <span className="font-medium">{result.loadArea} m²</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Depth Below Surface</span>
                <span className="font-medium">{input.depth} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Soil Unit Weight</span>
                <span className="font-medium">{input.soilUnitWeight} kN/m³</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Surface Stress</span>
                <span className="font-medium">{result.surfaceStress} kPa</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Contact Pressure</span>
                <span className="font-medium">{result.contactPressure} kPa</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Stress at {input.depth}m Depth</span>
                <span className="font-medium">{result.stressAtDepth} kPa</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Soil Self-Weight</span>
                <span className="font-medium">
                  {(result.totalStress - result.stressAtDepth).toFixed(2)} kPa
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Stress at Depth</span>
                <span className="font-medium">{result.totalStress} kPa</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/calculator">
            <Button variant="outline">
              <Calculator className="w-4 h-4 mr-2" />
              New Calculation
            </Button>
          </Link>
          <Link to="/runs">
            <Button variant="outline">
              <History className="w-4 h-4 mr-2" />
              View History
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Results;
