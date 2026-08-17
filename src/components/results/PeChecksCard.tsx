import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { PeCheckDisplay, PeResults, UnitsSystem } from "@/domain/pipeline/types";
import { InfoTooltip } from "@/components/InfoTooltip";

interface PeChecksCardProps {
  results: PeResults;
  unitsSystem: UnitsSystem;
}

const format = (value: number, decimals = 2) =>
  value === undefined || value === null || !isFinite(value) ? "N/A" : value.toFixed(decimals);

interface CheckRowProps {
  label: string;
  tooltip: string;
  check: PeCheckDisplay;
  unit: string;
  decimals?: number;
}

const CheckRow = ({ label, tooltip, check, unit, decimals = 2 }: CheckRowProps) => (
  <div className="p-3 bg-muted/50 rounded space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">
        {label}
        <InfoTooltip text={tooltip} />
      </span>
      {check.pass ? (
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      ) : (
        <XCircle className="h-5 w-5 text-destructive" />
      )}
    </div>
    <p className="font-mono text-sm">
      {format(check.value, decimals)} {unit} / limit {format(check.limit, decimals)} {unit}
    </p>
    <p className="text-xs text-muted-foreground">Utilization: {format(check.utilizationPct, 1)}%</p>
  </div>
);

export function PeChecksCard({ results, unitsSystem }: PeChecksCardProps) {
  const pressureUnit = unitsSystem === "EN" ? "psi" : "kPa";
  const stressUnit = unitsSystem === "EN" ? "psi" : "MPa";

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          Polyethylene Pipe Checks (CSA B137.4)
          <Badge variant={results.overallPass ? "default" : "destructive"}>
            {results.overallPass ? "PASS" : "FAIL"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <CheckRow
            label="Ring deflection"
            tooltip="Iowa (Spangler) deflection of the flexible pipe under soil and live load, expressed as a percentage of the diameter."
            check={results.ringDeflectionPct}
            unit="%"
          />
          <CheckRow
            label="Wall bending strain"
            tooltip="Bending strain in the pipe wall derived from the ring deflection and the wall thickness ratio."
            check={results.bendingStrainPct}
            unit="%"
          />
          <CheckRow
            label="Internal pressure"
            tooltip="Operating pressure vs allowable pressure P = 2·HDB·DF·Ft/(DR−1)."
            check={results.internalPressure}
            unit={pressureUnit}
            decimals={1}
          />
          <CheckRow
            label="Buckling"
            tooltip="External pressure (soil + live) vs the constrained buckling capacity with a safety factor of 2."
            check={results.buckling}
            unit={pressureUnit}
            decimals={1}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Designation / DR</p>
            <p className="font-mono">{results.designation} — DR {format(results.dimensionRatio, 1)}</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">HDB / design factor</p>
            <p className="font-mono">{format(results.hdb, 2)} {stressUnit} × {format(results.designFactor, 2)}</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Temperature factor</p>
            <p className="font-mono">{format(results.temperatureFactor, 2)}</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Modulus (live / soil)</p>
            <p className="font-mono">{format(results.modulusLive, 1)} / {format(results.modulusSoil, 1)} {stressUnit}</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Critical buckling pressure</p>
            <p className="font-mono">{format(results.criticalBucklingPressure, 1)} {pressureUnit}</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Buckling safety factor</p>
            <p className="font-mono">{format(results.bucklingSafetyFactor, 2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
