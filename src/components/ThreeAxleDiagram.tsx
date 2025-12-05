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
      <svg viewBox="0 0 580 280" className="w-full h-auto max-h-[280px]">
        {/* Title */}
        <text x="290" y="24" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">
          3-Axle Vehicle Configuration
        </text>

        {/* Axle 1-2 Spacing dimension line */}
        <line x1="100" y1="50" x2="260" y2="50" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="100" y1="45" x2="100" y2="55" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="260" y1="45" x2="260" y2="55" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <rect x="145" y="38" width="70" height="18" fill="hsl(45, 100%, 50%)" rx="3" />
        <text x="180" y="52" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
          {formatValue(axle1To2Spacing)} {depthUnit}
        </text>

        {/* Axle 2-3 Spacing dimension line */}
        <line x1="260" y1="50" x2="420" y2="50" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="420" y1="45" x2="420" y2="55" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <rect x="305" y="38" width="70" height="18" fill="hsl(45, 100%, 50%)" rx="3" />
        <text x="340" y="52" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
          {formatValue(axle2To3Spacing)} {depthUnit}
        </text>

        {/* Axle 1 (Left) */}
        <g transform="translate(100, 90)">
          <rect x="-40" y="0" width="80" height="4" fill="hsl(var(--foreground))" rx="1" />
          <rect x="-48" y="-10" width="16" height="24" fill="hsl(var(--foreground))" rx="2" />
          <rect x="32" y="-10" width="16" height="24" fill="hsl(var(--foreground))" rx="2" />
        </g>

        {/* Axle 2 (Middle) */}
        <g transform="translate(260, 90)">
          <rect x="-40" y="0" width="80" height="4" fill="hsl(var(--foreground))" rx="1" />
          <rect x="-48" y="-10" width="16" height="24" fill="hsl(var(--foreground))" rx="2" />
          <rect x="32" y="-10" width="16" height="24" fill="hsl(var(--foreground))" rx="2" />
        </g>

        {/* Axle 3 (Right) */}
        <g transform="translate(420, 90)">
          <rect x="-40" y="0" width="80" height="4" fill="hsl(var(--foreground))" rx="1" />
          <rect x="-48" y="-10" width="16" height="24" fill="hsl(var(--foreground))" rx="2" />
          <rect x="32" y="-10" width="16" height="24" fill="hsl(var(--foreground))" rx="2" />
        </g>

        {/* Pipeline (horizontal dashed line) */}
        <line
          x1="20"
          y1="130"
          x2="560"
          y2="130"
          stroke="hsl(210, 100%, 50%)"
          strokeWidth="3"
          strokeDasharray="10,5"
        />
        <text x="30" y="150" fill="hsl(210, 100%, 50%)" fontSize="12" fontStyle="italic">
          Pipeline
        </text>

        {/* Axle Width dimension (right side, vertical) */}
        <line x1="490" y1="92" x2="490" y2="130" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="485" y1="92" x2="495" y2="92" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="485" y1="130" x2="495" y2="130" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <rect x="500" y="100" width="55" height="20" fill="hsl(45, 100%, 50%)" rx="3" />
        <text x="527" y="115" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
          {formatValue(axleWidth)} {lengthUnit}
        </text>

        {/* Axle 1 Info Box */}
        <g transform="translate(100, 170)">
          <rect x="-55" y="0" width="110" height="70" fill="hsl(45, 100%, 50%)" rx="4" />
          <text x="0" y="18" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11" fontWeight="bold">
            Axle 1
          </text>
          <text x="0" y="34" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            {formatValue(axle1Load)} {forceUnit}
          </text>
          <text x="0" y="48" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            W: {formatValue(axle1TireWidth)} {lengthUnit}
          </text>
          <text x="0" y="62" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            P: {formatValue(axle1TirePressure)}
          </text>
        </g>

        {/* Axle 2 Info Box */}
        <g transform="translate(260, 170)">
          <rect x="-55" y="0" width="110" height="70" fill="hsl(45, 100%, 50%)" rx="4" />
          <text x="0" y="18" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11" fontWeight="bold">
            Axle 2
          </text>
          <text x="0" y="34" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            {formatValue(axle2Load)} {forceUnit}
          </text>
          <text x="0" y="48" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            W: {formatValue(axle2TireWidth)} {lengthUnit}
          </text>
          <text x="0" y="62" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            P: {formatValue(axle2TirePressure)}
          </text>
        </g>

        {/* Axle 3 Info Box */}
        <g transform="translate(420, 170)">
          <rect x="-55" y="0" width="110" height="70" fill="hsl(45, 100%, 50%)" rx="4" />
          <text x="0" y="18" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11" fontWeight="bold">
            Axle 3
          </text>
          <text x="0" y="34" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            {formatValue(axle3Load)} {forceUnit}
          </text>
          <text x="0" y="48" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            W: {formatValue(axle3TireWidth)} {lengthUnit}
          </text>
          <text x="0" y="62" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            P: {formatValue(axle3TirePressure)}
          </text>
        </g>
      </svg>
    </div>
  );
};
