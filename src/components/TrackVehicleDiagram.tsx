interface TrackVehicleDiagramProps {
  trackLength: number;
  trackWidth: number;
  trackSeparation: number;
  vehicleWeight: number;
  unitsSystem: "EN" | "SI";
}

export const TrackVehicleDiagram = ({
  trackLength,
  trackWidth,
  trackSeparation,
  vehicleWeight,
  unitsSystem,
}: TrackVehicleDiagramProps) => {
  const forceUnit = unitsSystem === "EN" ? "lb" : "kg";
  const lengthUnit = unitsSystem === "EN" ? "in" : "mm";

  const formatValue = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return "—";
    return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  return (
    <div className="w-full bg-muted/30 border border-border rounded-lg p-4 mb-4">
      <svg viewBox="0 0 500 320" className="w-full h-auto max-h-[320px]">
        {/* Title */}
        <text x="250" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">
          Track Vehicle Configuration (Top View)
        </text>

        {/* Vehicle Weight label - top center */}
        <g transform="translate(250, 50)">
          <rect x="-70" y="-14" width="140" height="28" fill="hsl(var(--primary))" rx="4" />
          <text x="0" y="5" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="11" fontWeight="bold">
            Weight: {formatValue(vehicleWeight)} {forceUnit}
          </text>
        </g>

        {/* Vehicle body (gray rectangle) */}
        <rect x="150" y="90" width="200" height="140" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" rx="6" />

        {/* Left Track (with hatching pattern) */}
        <g transform="translate(100, 95)">
          <defs>
            <pattern id="trackHatch" patternUnits="userSpaceOnUse" width="8" height="8">
              <path d="M0,8 L8,0" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.5" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="40" height="130" fill="hsl(var(--foreground))" rx="4" />
          <rect x="2" y="2" width="36" height="126" fill="url(#trackHatch)" rx="3" />
        </g>

        {/* Right Track (with hatching pattern) */}
        <g transform="translate(360, 95)">
          <rect x="0" y="0" width="40" height="130" fill="hsl(var(--foreground))" rx="4" />
          <rect x="2" y="2" width="36" height="126" fill="url(#trackHatch)" rx="3" />
        </g>

        {/* Pipeline (horizontal dashed line) */}
        <line
          x1="50"
          y1="160"
          x2="450"
          y2="160"
          stroke="hsl(210, 100%, 50%)"
          strokeWidth="4"
          strokeDasharray="12,6"
        />
        <text x="60" y="175" fill="hsl(210, 100%, 50%)" fontSize="11" fontStyle="italic">
          Pipeline
        </text>

        {/* Track Length dimension (vertical, left side) */}
        <line x1="70" y1="95" x2="70" y2="225" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="65" y1="95" x2="75" y2="95" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="65" y1="225" x2="75" y2="225" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        {/* Track Length label */}
        <g transform="translate(55, 160) rotate(-90)">
          <rect x="-45" y="-12" width="90" height="20" fill="hsl(var(--primary))" rx="3" />
          <text x="0" y="4" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
            Length: {formatValue(trackLength)} {lengthUnit}
          </text>
        </g>

        {/* Track Width dimension (on right track) */}
        <line x1="360" y1="240" x2="400" y2="240" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="360" y1="235" x2="360" y2="245" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="400" y1="235" x2="400" y2="245" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        {/* Track Width label */}
        <g transform="translate(380, 260)">
          <rect x="-50" y="-12" width="100" height="20" fill="hsl(var(--primary))" rx="3" />
          <text x="0" y="4" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
            Width: {formatValue(trackWidth)} {lengthUnit}
          </text>
        </g>

        {/* Track Separation dimension (horizontal, bottom center) */}
        <line x1="120" y1="290" x2="380" y2="290" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="120" y1="285" x2="120" y2="295" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1="380" y1="285" x2="380" y2="295" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        
        {/* Track Separation label */}
        <rect x="185" y="282" width="130" height="20" fill="hsl(var(--primary))" rx="3" />
        <text x="250" y="296" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
          Separation: {formatValue(trackSeparation)} {lengthUnit}
        </text>
      </svg>
    </div>
  );
};
