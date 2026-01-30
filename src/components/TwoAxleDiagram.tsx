interface TwoAxleDiagramProps {
  axle1Load: number;
  axle2Load: number;
  axle1TireWidth: number;
  axle2TireWidth: number;
  axle1TirePressure?: number;
  axle2TirePressure?: number;
  axle1TirePressureUnit?: string;
  axle2TirePressureUnit?: string;
  axle1TiresPerAxle?: number;
  axle2TiresPerAxle?: number;
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
  axle1TiresPerAxle = 2,
  axle2TiresPerAxle = 4,
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

  // Calculate total contact width per side
  const axle1ContactWidth = axle1TireWidth * (axle1TiresPerAxle === 4 ? 2 : 1);
  const axle2ContactWidth = axle2TireWidth * (axle2TiresPerAxle === 4 ? 2 : 1);

  const isDual1 = axle1TiresPerAxle === 4;
  const isDual2 = axle2TiresPerAxle === 4;

  return (
    <div className="w-full bg-muted/30 border border-border rounded-lg p-4 mb-4">
      <svg viewBox="0 0 600 280" className="w-full h-auto max-h-[280px]">
        {/* Title */}
        <text x="200" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">
          2-Axle Vehicle Configuration (Top View)
        </text>

        {/* Axle 1 (Top) - horizontal bar with tires on ends */}
        <g transform="translate(200, 70)">
          {/* Axle bar (horizontal) */}
          <rect x="-80" y="-2" width="160" height="4" fill="hsl(var(--foreground))" rx="1" />
          {/* Left tire(s) */}
          {isDual1 ? (
            <>
              <rect x="-100" y="-12" width="11" height="24" fill="hsl(var(--foreground))" rx="2" />
              <rect x="-87" y="-12" width="11" height="24" fill="hsl(var(--foreground))" rx="2" />
            </>
          ) : (
            <rect x="-100" y="-12" width="24" height="24" fill="hsl(var(--foreground))" rx="3" />
          )}
          {/* Right tire(s) */}
          {isDual1 ? (
            <>
              <rect x="76" y="-12" width="11" height="24" fill="hsl(var(--foreground))" rx="2" />
              <rect x="89" y="-12" width="11" height="24" fill="hsl(var(--foreground))" rx="2" />
            </>
          ) : (
            <rect x="76" y="-12" width="24" height="24" fill="hsl(var(--foreground))" rx="3" />
          )}
        </g>

        {/* Info box Axle 1 - Right side, aligned with axle */}
        <g transform="translate(480, 70)">
          <rect x="-70" y="-25" width="140" height="50" fill="hsl(45, 100%, 50%)" rx="4" />
          <text x="0" y="-10" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold">
            Axle 1 ({isDual1 ? "Dual" : "Single"})
          </text>
          <text x="0" y="3" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            {formatValue(axle1Load)} {forceUnit}
          </text>
          <text x="0" y="15" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            W: {formatValue(axle1ContactWidth)} {lengthUnit}
          </text>
        </g>

        {/* Pipeline (horizontal dashed line between axles) */}
        <line
          x1="30"
          y1="130"
          x2="350"
          y2="130"
          stroke="hsl(210, 100%, 50%)"
          strokeWidth="4"
          strokeDasharray="12,6"
        />
        <text x="40" y="145" fill="hsl(210, 100%, 50%)" fontSize="11" fontStyle="italic">
          Pipeline
        </text>

        {/* Axle 2 (Bottom) - horizontal bar with tires on ends */}
        <g transform="translate(200, 190)">
          {/* Axle bar (horizontal) */}
          <rect x="-80" y="-2" width="160" height="4" fill="hsl(var(--foreground))" rx="1" />
          {/* Left tire(s) */}
          {isDual2 ? (
            <>
              <rect x="-100" y="-12" width="11" height="24" fill="hsl(var(--foreground))" rx="2" />
              <rect x="-87" y="-12" width="11" height="24" fill="hsl(var(--foreground))" rx="2" />
            </>
          ) : (
            <rect x="-100" y="-12" width="24" height="24" fill="hsl(var(--foreground))" rx="3" />
          )}
          {/* Right tire(s) */}
          {isDual2 ? (
            <>
              <rect x="76" y="-12" width="11" height="24" fill="hsl(var(--foreground))" rx="2" />
              <rect x="89" y="-12" width="11" height="24" fill="hsl(var(--foreground))" rx="2" />
            </>
          ) : (
            <rect x="76" y="-12" width="24" height="24" fill="hsl(var(--foreground))" rx="3" />
          )}
        </g>

        {/* Info box Axle 2 - Right side, aligned with axle */}
        <g transform="translate(480, 190)">
          <rect x="-70" y="-25" width="140" height="50" fill="hsl(45, 100%, 50%)" rx="4" />
          <text x="0" y="-10" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold">
            Axle 2 ({isDual2 ? "Dual" : "Single"})
          </text>
          <text x="0" y="3" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            {formatValue(axle2Load)} {forceUnit}
          </text>
          <text x="0" y="15" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontFamily="monospace">
            W: {formatValue(axle2ContactWidth)} {lengthUnit}
          </text>
        </g>

        {/* Axle Spacing dimension (vertical, left side) */}
        <line x1="60" y1="70" x2="60" y2="190" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="55" y1="70" x2="65" y2="70" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="55" y1="190" x2="65" y2="190" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        {/* Axle Spacing label */}
        <g transform="translate(45, 130) rotate(-90)">
          <rect x="-35" y="-12" width="70" height="18" fill="hsl(45, 100%, 50%)" rx="3" />
          <text x="0" y="3" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
            {formatValue(axleSpacing)} {depthUnit}
          </text>
        </g>

        {/* Axle Width dimension (horizontal, bottom) */}
        <line x1="100" y1="230" x2="300" y2="230" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="100" y1="225" x2="100" y2="235" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="300" y1="225" x2="300" y2="235" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        {/* Axle Width label */}
        <rect x="160" y="222" width="80" height="18" fill="hsl(45, 100%, 50%)" rx="3" />
        <text x="200" y="235" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
          {formatValue(axleWidth)} {lengthUnit}
        </text>
      </svg>
    </div>
  );
};
