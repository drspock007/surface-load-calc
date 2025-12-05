interface TwoAxleDiagramProps {
  axle1Load: number;
  axle2Load: number;
  axle1TireWidth: number;
  axle2TireWidth: number;
  axle1TirePressure?: number;
  axle2TirePressure?: number;
  axle1TirePressureUnit?: string;
  axle2TirePressureUnit?: string;
  axleSpacing: number;
  axleWidth: number;
  unitsSystem: "EN" | "SI";
}

export const TwoAxleDiagram = ({
  axle1Load,
  axle2Load,
  axle1TireWidth,
  axle2TireWidth,
  axle1TirePressure,
  axle2TirePressure,
  axle1TirePressureUnit = "kg/m2",
  axle2TirePressureUnit = "kg/m2",
  axleSpacing,
  axleWidth,
  unitsSystem,
}: TwoAxleDiagramProps) => {
  const forceUnit = unitsSystem === "EN" ? "lb" : "kg";
  const lengthUnit = unitsSystem === "EN" ? "in" : "mm";
  const depthUnit = unitsSystem === "EN" ? "ft" : "m";

  const formatValue = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return "—";
    return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  return (
    <div className="w-full bg-muted/30 border border-border rounded-lg p-4 mb-4">
      <svg viewBox="0 0 500 280" className="w-full h-auto max-h-[280px]">
        {/* Title */}
        <text x="250" y="24" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">
          2-Axle Vehicle Configuration
        </text>

        {/* Axle Spacing dimension line (top) */}
        <line x1="140" y1="50" x2="360" y2="50" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="140" y1="45" x2="140" y2="55" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="360" y1="45" x2="360" y2="55" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        {/* Axle Spacing label */}
        <rect x="210" y="38" width="80" height="20" fill="hsl(45, 100%, 50%)" rx="3" />
        <text x="250" y="53" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12" fontWeight="bold" fontFamily="monospace">
          {formatValue(axleSpacing)} {depthUnit}
        </text>

        {/* Axle 1 (Left) - horizontal bar with tires on ends */}
        <g transform="translate(140, 90)">
          {/* Axle bar (horizontal) */}
          <rect x="-50" y="0" width="100" height="4" fill="hsl(var(--foreground))" rx="1" />
          {/* Left tire */}
          <rect x="-60" y="-10" width="18" height="24" fill="hsl(var(--foreground))" rx="2" />
          {/* Right tire */}
          <rect x="42" y="-10" width="18" height="24" fill="hsl(var(--foreground))" rx="2" />
        </g>

        {/* Axle 2 (Right) - horizontal bar with tires on ends */}
        <g transform="translate(360, 90)">
          {/* Axle bar (horizontal) */}
          <rect x="-50" y="0" width="100" height="4" fill="hsl(var(--foreground))" rx="1" />
          {/* Left tire */}
          <rect x="-60" y="-10" width="18" height="24" fill="hsl(var(--foreground))" rx="2" />
          {/* Right tire */}
          <rect x="42" y="-10" width="18" height="24" fill="hsl(var(--foreground))" rx="2" />
        </g>

        {/* Pipeline (horizontal dashed line) */}
        <line
          x1="30"
          y1="130"
          x2="470"
          y2="130"
          stroke="hsl(210, 100%, 50%)"
          strokeWidth="3"
          strokeDasharray="10,5"
        />
        <text x="40" y="150" fill="hsl(210, 100%, 50%)" fontSize="12" fontStyle="italic">
          Pipeline
        </text>

        {/* Axle Width dimension (right side, vertical) */}
        <line x1="430" y1="92" x2="430" y2="130" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="425" y1="92" x2="435" y2="92" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="425" y1="130" x2="435" y2="130" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        {/* Axle Width label */}
        <rect x="440" y="100" width="55" height="20" fill="hsl(45, 100%, 50%)" rx="3" />
        <text x="467" y="115" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="11" fontWeight="bold" fontFamily="monospace">
          {formatValue(axleWidth)} {lengthUnit}
        </text>

        {/* Axle 1 Info Box */}
        <g transform="translate(140, 175)">
          <rect x="-70" y="0" width="140" height="75" fill="hsl(45, 100%, 50%)" rx="4" />
          <text x="0" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12" fontWeight="bold">
            Axle 1
          </text>
          <text x="0" y="38" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontFamily="monospace">
            Load: {formatValue(axle1Load)} {forceUnit}
          </text>
          <text x="0" y="52" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontFamily="monospace">
            Width: {formatValue(axle1TireWidth)} {lengthUnit}
          </text>
          <text x="0" y="66" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontFamily="monospace">
            P: {formatValue(axle1TirePressure)} {axle1TirePressureUnit}
          </text>
        </g>

        {/* Axle 2 Info Box */}
        <g transform="translate(360, 175)">
          <rect x="-70" y="0" width="140" height="75" fill="hsl(45, 100%, 50%)" rx="4" />
          <text x="0" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12" fontWeight="bold">
            Axle 2
          </text>
          <text x="0" y="38" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontFamily="monospace">
            Load: {formatValue(axle2Load)} {forceUnit}
          </text>
          <text x="0" y="52" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontFamily="monospace">
            Width: {formatValue(axle2TireWidth)} {lengthUnit}
          </text>
          <text x="0" y="66" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontFamily="monospace">
            P: {formatValue(axle2TirePressure)} {axle2TirePressureUnit}
          </text>
        </g>
      </svg>
    </div>
  );
};
