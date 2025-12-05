interface ThreeAxleDiagramProps {
  axle1Load: number;
  axle2Load: number;
  axle3Load: number;
  axle1TireWidth: number;
  axle2TireWidth: number;
  axle3TireWidth: number;
  axle1TirePressure?: number;
  axle2TirePressure?: number;
  axle3TirePressure?: number;
  axle1TirePressureUnit?: string;
  axle2TirePressureUnit?: string;
  axle3TirePressureUnit?: string;
  axle1To2Spacing: number;
  axle2To3Spacing: number;
  axleWidth: number;
  unitsSystem: "EN" | "SI";
}

export const ThreeAxleDiagram = ({
  axle1Load,
  axle2Load,
  axle3Load,
  axle1TireWidth,
  axle2TireWidth,
  axle3TireWidth,
  axle1TirePressure,
  axle2TirePressure,
  axle3TirePressure,
  axle1TirePressureUnit = "kg/m2",
  axle2TirePressureUnit = "kg/m2",
  axle3TirePressureUnit = "kg/m2",
  axle1To2Spacing,
  axle2To3Spacing,
  axleWidth,
  unitsSystem,
}: ThreeAxleDiagramProps) => {
  const forceUnit = unitsSystem === "EN" ? "lb" : "kg";
  const lengthUnit = unitsSystem === "EN" ? "in" : "mm";
  const depthUnit = unitsSystem === "EN" ? "ft" : "m";

  const formatValue = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return "—";
    return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  return (
    <div className="w-full bg-muted/30 border border-border rounded-lg p-4 mb-4">
      <svg viewBox="0 0 480 220" className="w-full h-auto max-h-[220px]">
        {/* Background */}
        <rect x="0" y="0" width="480" height="220" fill="transparent" />
        
        {/* Pipeline (horizontal dashed line) */}
        <line
          x1="20"
          y1="110"
          x2="460"
          y2="110"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeDasharray="8,4"
        />
        <text x="30" y="125" fill="hsl(var(--primary))" fontSize="10" fontFamily="monospace">
          Pipeline
        </text>

        {/* Axle 1 (Left) */}
        <g transform="translate(80, 60)">
          <rect x="-50" y="20" width="100" height="4" fill="hsl(var(--foreground))" rx="1" />
          <rect x="-58" y="10" width="16" height="24" fill="hsl(var(--foreground))" rx="2" />
          <rect x="42" y="10" width="16" height="24" fill="hsl(var(--foreground))" rx="2" />
        </g>

        {/* Axle 2 (Middle) */}
        <g transform="translate(220, 60)">
          <rect x="-50" y="20" width="100" height="4" fill="hsl(var(--foreground))" rx="1" />
          <rect x="-58" y="10" width="16" height="24" fill="hsl(var(--foreground))" rx="2" />
          <rect x="42" y="10" width="16" height="24" fill="hsl(var(--foreground))" rx="2" />
        </g>

        {/* Axle 3 (Right) */}
        <g transform="translate(360, 60)">
          <rect x="-50" y="20" width="100" height="4" fill="hsl(var(--foreground))" rx="1" />
          <rect x="-58" y="10" width="16" height="24" fill="hsl(var(--foreground))" rx="2" />
          <rect x="42" y="10" width="16" height="24" fill="hsl(var(--foreground))" rx="2" />
        </g>

        {/* Axle 1-2 Spacing dimension line */}
        <line x1="80" y1="48" x2="220" y2="48" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="80" y1="44" x2="80" y2="52" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="220" y1="44" x2="220" y2="52" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <rect x="115" y="35" width="70" height="16" fill="hsl(45, 100%, 50%)" rx="2" />
        <text x="150" y="47" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold" fontFamily="monospace">
          {formatValue(axle1To2Spacing)} {depthUnit}
        </text>

        {/* Axle 2-3 Spacing dimension line */}
        <line x1="220" y1="48" x2="360" y2="48" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="360" y1="44" x2="360" y2="52" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <rect x="255" y="35" width="70" height="16" fill="hsl(45, 100%, 50%)" rx="2" />
        <text x="290" y="47" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold" fontFamily="monospace">
          {formatValue(axle2To3Spacing)} {depthUnit}
        </text>

        {/* Axle Width dimension (vertical) */}
        <line x1="435" y1="70" x2="435" y2="150" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="431" y1="70" x2="439" y2="70" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="431" y1="150" x2="439" y2="150" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <rect x="442" y="102" width="35" height="16" fill="hsl(45, 100%, 50%)" rx="2" />
        <text x="460" y="114" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontWeight="bold" fontFamily="monospace">
          {formatValue(axleWidth)} {lengthUnit}
        </text>

        {/* Axle 1 Labels */}
        <g transform="translate(80, 145)">
          <rect x="-45" y="0" width="90" height="60" fill="hsl(45, 100%, 50%)" rx="3" />
          <text x="0" y="14" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold">
            Axle 1
          </text>
          <text x="0" y="28" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontFamily="monospace">
            {formatValue(axle1Load)} {forceUnit}
          </text>
          <text x="0" y="40" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontFamily="monospace">
            W: {formatValue(axle1TireWidth)} {lengthUnit}
          </text>
          <text x="0" y="52" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontFamily="monospace">
            P: {formatValue(axle1TirePressure)}
          </text>
        </g>

        {/* Axle 2 Labels */}
        <g transform="translate(220, 145)">
          <rect x="-45" y="0" width="90" height="60" fill="hsl(45, 100%, 50%)" rx="3" />
          <text x="0" y="14" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold">
            Axle 2
          </text>
          <text x="0" y="28" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontFamily="monospace">
            {formatValue(axle2Load)} {forceUnit}
          </text>
          <text x="0" y="40" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontFamily="monospace">
            W: {formatValue(axle2TireWidth)} {lengthUnit}
          </text>
          <text x="0" y="52" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontFamily="monospace">
            P: {formatValue(axle2TirePressure)}
          </text>
        </g>

        {/* Axle 3 Labels */}
        <g transform="translate(360, 145)">
          <rect x="-45" y="0" width="90" height="60" fill="hsl(45, 100%, 50%)" rx="3" />
          <text x="0" y="14" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold">
            Axle 3
          </text>
          <text x="0" y="28" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontFamily="monospace">
            {formatValue(axle3Load)} {forceUnit}
          </text>
          <text x="0" y="40" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontFamily="monospace">
            W: {formatValue(axle3TireWidth)} {lengthUnit}
          </text>
          <text x="0" y="52" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="7" fontFamily="monospace">
            P: {formatValue(axle3TirePressure)}
          </text>
        </g>

        {/* Title */}
        <text x="10" y="18" fill="hsl(var(--foreground))" fontSize="11" fontWeight="bold">
          3-Axle Vehicle Configuration
        </text>
      </svg>
    </div>
  );
};
