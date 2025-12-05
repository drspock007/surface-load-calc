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
      <svg viewBox="0 0 500 400" className="w-full h-auto max-h-[400px]">
        {/* Title */}
        <text x="250" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">
          3-Axle Vehicle Configuration (Top View)
        </text>

        {/* Axle 1 (Top) */}
        <g transform="translate(250, 55)">
          <rect x="-80" y="-2" width="160" height="4" fill="hsl(var(--foreground))" rx="1" />
          <rect x="-100" y="-10" width="22" height="20" fill="hsl(var(--foreground))" rx="3" />
          <rect x="78" y="-10" width="22" height="20" fill="hsl(var(--foreground))" rx="3" />
          <text x="130" y="5" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold">Axle 1</text>
        </g>

        {/* Pipeline (between Axle 1 and Axle 2) */}
        <line
          x1="30"
          y1="110"
          x2="470"
          y2="110"
          stroke="hsl(210, 100%, 50%)"
          strokeWidth="4"
          strokeDasharray="12,6"
        />
        <text x="40" y="125" fill="hsl(210, 100%, 50%)" fontSize="10" fontStyle="italic">
          Pipeline
        </text>

        {/* Axle 2 (Middle) */}
        <g transform="translate(250, 165)">
          <rect x="-80" y="-2" width="160" height="4" fill="hsl(var(--foreground))" rx="1" />
          <rect x="-100" y="-10" width="22" height="20" fill="hsl(var(--foreground))" rx="3" />
          <rect x="78" y="-10" width="22" height="20" fill="hsl(var(--foreground))" rx="3" />
          <text x="130" y="5" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold">Axle 2</text>
        </g>

        {/* Axle 3 (Bottom) */}
        <g transform="translate(250, 245)">
          <rect x="-80" y="-2" width="160" height="4" fill="hsl(var(--foreground))" rx="1" />
          <rect x="-100" y="-10" width="22" height="20" fill="hsl(var(--foreground))" rx="3" />
          <rect x="78" y="-10" width="22" height="20" fill="hsl(var(--foreground))" rx="3" />
          <text x="130" y="5" fill="hsl(var(--foreground))" fontSize="10" fontWeight="bold">Axle 3</text>
        </g>

        {/* Axle 1-2 Separation dimension (vertical, left side) */}
        <line x1="55" y1="55" x2="55" y2="165" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="50" y1="55" x2="60" y2="55" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="50" y1="165" x2="60" y2="165" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        <g transform="translate(40, 110) rotate(-90)">
          <rect x="-30" y="-10" width="60" height="16" fill="hsl(45, 100%, 50%)" rx="3" />
          <text x="0" y="3" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold" fontFamily="monospace">
            {formatValue(axle1To2Spacing)} {depthUnit}
          </text>
        </g>

        {/* Axle 2-3 Separation dimension (vertical, left side) */}
        <line x1="55" y1="165" x2="55" y2="245" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="50" y1="245" x2="60" y2="245" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        <g transform="translate(40, 205) rotate(-90)">
          <rect x="-30" y="-10" width="60" height="16" fill="hsl(45, 100%, 50%)" rx="3" />
          <text x="0" y="3" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold" fontFamily="monospace">
            {formatValue(axle2To3Spacing)} {depthUnit}
          </text>
        </g>

        {/* Axle Width dimension (horizontal, bottom) */}
        <line x1="150" y1="275" x2="350" y2="275" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="150" y1="270" x2="150" y2="280" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="350" y1="270" x2="350" y2="280" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        <rect x="210" y="267" width="80" height="16" fill="hsl(45, 100%, 50%)" rx="3" />
        <text x="250" y="279" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold" fontFamily="monospace">
          {formatValue(axleWidth)} {lengthUnit}
        </text>

        {/* Info boxes at bottom */}
        <g transform="translate(85, 305)">
          <rect x="-55" y="0" width="110" height="42" fill="hsl(45, 100%, 50%)" rx="4" />
          <text x="0" y="12" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold">Axle 1</text>
          <text x="0" y="24" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="monospace">
            {formatValue(axle1Load)} {forceUnit} | W:{formatValue(axle1TireWidth)}
          </text>
          <text x="0" y="36" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="monospace">
            P: {formatValue(axle1TirePressure)} {axle1TirePressureUnit}
          </text>
        </g>

        <g transform="translate(250, 305)">
          <rect x="-55" y="0" width="110" height="42" fill="hsl(45, 100%, 50%)" rx="4" />
          <text x="0" y="12" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold">Axle 2</text>
          <text x="0" y="24" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="monospace">
            {formatValue(axle2Load)} {forceUnit} | W:{formatValue(axle2TireWidth)}
          </text>
          <text x="0" y="36" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="monospace">
            P: {formatValue(axle2TirePressure)} {axle2TirePressureUnit}
          </text>
        </g>

        <g transform="translate(415, 305)">
          <rect x="-55" y="0" width="110" height="42" fill="hsl(45, 100%, 50%)" rx="4" />
          <text x="0" y="12" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold">Axle 3</text>
          <text x="0" y="24" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="monospace">
            {formatValue(axle3Load)} {forceUnit} | W:{formatValue(axle3TireWidth)}
          </text>
          <text x="0" y="36" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontFamily="monospace">
            P: {formatValue(axle3TirePressure)} {axle3TirePressureUnit}
          </text>
        </g>
      </svg>
    </div>
  );
};
