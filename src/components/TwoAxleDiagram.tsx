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
      <svg viewBox="0 0 400 220" className="w-full h-auto max-h-[220px]">
        {/* Background */}
        <rect x="0" y="0" width="400" height="220" fill="transparent" />
        
        {/* Pipeline (horizontal dashed line) */}
        <line
          x1="20"
          y1="110"
          x2="380"
          y2="110"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeDasharray="8,4"
        />
        <text x="30" y="125" fill="hsl(var(--primary))" fontSize="10" fontFamily="monospace">
          Pipeline
        </text>

        {/* Axle 1 (Left) */}
        <g transform="translate(100, 60)">
          {/* Axle bar */}
          <rect x="-60" y="20" width="120" height="4" fill="hsl(var(--foreground))" rx="1" />
          {/* Tires */}
          <rect x="-70" y="10" width="20" height="24" fill="hsl(var(--foreground))" rx="2" />
          <rect x="50" y="10" width="20" height="24" fill="hsl(var(--foreground))" rx="2" />
        </g>

        {/* Axle 2 (Right) */}
        <g transform="translate(280, 60)">
          {/* Axle bar */}
          <rect x="-60" y="20" width="120" height="4" fill="hsl(var(--foreground))" rx="1" />
          {/* Tires */}
          <rect x="-70" y="10" width="20" height="24" fill="hsl(var(--foreground))" rx="2" />
          <rect x="50" y="10" width="20" height="24" fill="hsl(var(--foreground))" rx="2" />
        </g>

        {/* Axle Spacing dimension line */}
        <line x1="100" y1="48" x2="280" y2="48" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="100" y1="44" x2="100" y2="52" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="280" y1="44" x2="280" y2="52" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        {/* Axle Spacing label */}
        <rect x="155" y="35" width="90" height="16" fill="hsl(45, 100%, 50%)" rx="2" />
        <text x="200" y="47" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
          {formatValue(axleSpacing)} {depthUnit}
        </text>

        {/* Axle Width dimension (vertical) */}
        <line x1="355" y1="70" x2="355" y2="150" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="351" y1="70" x2="359" y2="70" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="351" y1="150" x2="359" y2="150" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        {/* Axle Width label */}
        <rect x="362" y="102" width="35" height="16" fill="hsl(45, 100%, 50%)" rx="2" />
        <text x="380" y="114" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold" fontFamily="monospace">
          {formatValue(axleWidth)} {lengthUnit}
        </text>

        {/* Axle 1 Labels */}
        <g transform="translate(100, 145)">
          <rect x="-55" y="0" width="110" height="60" fill="hsl(45, 100%, 50%)" rx="3" />
          <text x="0" y="14" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold">
            Axle 1
          </text>
          <text x="0" y="28" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="monospace">
            Load: {formatValue(axle1Load)} {forceUnit}
          </text>
          <text x="0" y="40" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="monospace">
            Width: {formatValue(axle1TireWidth)} {lengthUnit}
          </text>
          <text x="0" y="52" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="monospace">
            P: {formatValue(axle1TirePressure)} {axle1TirePressureUnit}
          </text>
        </g>

        {/* Axle 2 Labels */}
        <g transform="translate(280, 145)">
          <rect x="-55" y="0" width="110" height="60" fill="hsl(45, 100%, 50%)" rx="3" />
          <text x="0" y="14" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold">
            Axle 2
          </text>
          <text x="0" y="28" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="monospace">
            Load: {formatValue(axle2Load)} {forceUnit}
          </text>
          <text x="0" y="40" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="monospace">
            Width: {formatValue(axle2TireWidth)} {lengthUnit}
          </text>
          <text x="0" y="52" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="monospace">
            P: {formatValue(axle2TirePressure)} {axle2TirePressureUnit}
          </text>
        </g>

        {/* Title */}
        <text x="10" y="18" fill="hsl(var(--foreground))" fontSize="11" fontWeight="bold">
          2-Axle Vehicle Configuration
        </text>
      </svg>
    </div>
  );
};
