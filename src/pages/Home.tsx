import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, FileText, History, Download, Upload, AlertTriangle } from "lucide-react";
import { Layout } from "@/components/Layout";

const Home = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-engineering-gradient rounded-xl mb-4">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Surface Loading Stress Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Calculate stress distribution from surface loads on soil. Analyze contact pressure,
            stress at depth, and total stress conditions for foundation and geotechnical applications.
          </p>
          <Link to="/calculator">
            <Button size="lg" className="mt-4">
              <Calculator className="w-5 h-5 mr-2" />
              New Calculation
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-5 h-5 text-primary" />
                Input Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Define load magnitude, dimensions, depth of interest, and soil properties for analysis.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calculator className="w-5 h-5 text-primary" />
                Calculate Results
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Get surface stress, stress at depth, and total stress values with detailed breakdown.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="w-5 h-5 text-primary" />
                Manage Runs
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Save calculations locally, export to JSON, or import previous calculation sets.
            </CardContent>
          </Card>
        </div>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Engineering Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              This calculator is provided as an engineering tool for preliminary analysis purposes.
              Results should be independently verified by a qualified professional engineer.
            </p>
            <p className="font-medium text-foreground">
              Do not use these calculations for final design or construction without proper
              professional review and approval.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4 justify-center">
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

export default Home;
