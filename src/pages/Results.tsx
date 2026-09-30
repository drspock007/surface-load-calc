import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CalculationRun } from "@/types/calculation";
import { CalculationResults } from "@/components/results/CalculationResults";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const run = location.state?.run as CalculationRun | undefined;
  return <Layout>
    <SEO title="Results | CEPA Buried Pipeline Surface Loading Calculator" description="Detailed CEPA stress analysis results" path="/results" />
    {run ? <CalculationResults run={run} onBack={() => navigate(-1)}
      onEditInputs={() => navigate("/calculator")} onHistory={() => navigate("/runs")} /> :
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground mb-4">No calculation results to display</p>
        <Button onClick={() => navigate("/calculator")}>Go to Calculator</Button>
      </div>}
  </Layout>;
}
