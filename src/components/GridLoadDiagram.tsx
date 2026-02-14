interface GridLoadDiagramProps {
  gridLength: number;
  gridWidth: number;
  gridOffsetX: number;
  gridOffsetY: number;
  totalLoad?: number;
  uniformPressure?: number;
  loadType: "TOTAL_LOAD" | "UNIFORM_PRESSURE";
  unitsSystem: "EN" | "SI";
  gridDivisionsX: number;
  gridDivisionsY: number;
}

export const GridLoadDiagram = ({
  gridLength,
  gridWidth,
  gridOffsetX,
  gridOffsetY,
  totalLoad,
  uniformPressure,
  loadType,
  unitsSystem,
  gridDivisionsX,
  gridDivisionsY,
}: GridLoadDiagramProps) => {
  const depthUnit = unitsSystem === "EN" ? "ft" : "m";
  const forceUnit = unitsSystem === "EN" ? "lb" : "kg";
  const pressureUnit = unitsSystem === "EN" ? "psi" : "kPa";

  const fmt = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return "—";
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // SVG layout constants
  const svgW = 500;
  const svgH = 360;
  const pipeY = svgH / 2; // pipeline at vertical center
  const pipeCenterX = svgW / 2;

  // Scale: map the larger of grid dimensions to ~120px
  const maxDim = Math.max(gridLength || 1, gridWidth || 1, Math.abs(gridOffsetX) * 2 + (gridWidth || 1), Math.abs(gridOffsetY) * 2 + (gridLength || 1));
  const scale = 140 / maxDim;

  const rectW = Math.max((gridWidth || 1) * scale, 20);
  const rectH = Math.max((gridLength || 1) * scale, 20);

  // Grid center position (offset from pipe center)
  const offsetXpx = (gridOffsetX || 0) * scale;
  const offsetYpx = (gridOffsetY || 0) * scale;

  const gridCenterX = pipeCenterX + offsetXpx;
  const gridCenterY = pipeY - offsetYpx; // Y inverted in SVG
  const gridLeft = gridCenterX - rectW / 2;
  const gridTop = gridCenterY - rectH / 2;

  const loadLabel =
    loadType === "TOTAL_LOAD"
      ? `Load: ${fmt(totalLoad)} ${forceUnit}`
      : `Pressure: ${fmt(uniformPressure)} ${pressureUnit}`;

  return (
    <div className="w-full bg-muted/30 border border-border rounded-lg p-4 mb-4">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto max-h-[360px]">
        {/* Title */}
        <text x={svgW / 2} y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">
          Grid Load Configuration (Top View)
        </text>

        {/* Hatching pattern */}
        <defs>
          <pattern id="gridHatch" patternUnits="userSpaceOnUse" width="8" height="8">
            <path d="M0,8 L8,0" stroke="hsl(var(--foreground))" strokeWidth="1" opacity="0.4" />
          </pattern>
        </defs>

        {/* Pipeline (horizontal dashed line) */}
        <line x1="30" y1={pipeY} x2={svgW - 30} y2={pipeY} stroke="hsl(210, 100%, 50%)" strokeWidth="4" strokeDasharray="12,6" />
        <text x="40" y={pipeY + 16} fill="hsl(210, 100%, 50%)" fontSize="11" fontStyle="italic">Pipeline</text>

        {/* Grid rectangle */}
        <rect x={gridLeft} y={gridTop} width={rectW} height={rectH} fill="hsl(var(--primary)/0.15)" stroke="hsl(var(--primary))" strokeWidth="2" rx="3" />
        <rect x={gridLeft} y={gridTop} width={rectW} height={rectH} fill="url(#gridHatch)" rx="3" />

        {/* Grid subdivision lines */}
        {Array.from({ length: (gridDivisionsX || 1) - 1 }, (_, i) => {
          const x = gridLeft + ((i + 1) * rectW) / (gridDivisionsX || 1);
          return <line key={`vd${i}`} x1={x} y1={gridTop} x2={x} y2={gridTop + rectH} stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.2" />;
        })}
        {Array.from({ length: (gridDivisionsY || 1) - 1 }, (_, i) => {
          const y = gridTop + ((i + 1) * rectH) / (gridDivisionsY || 1);
          return <line key={`hd${i}`} x1={gridLeft} y1={y} x2={gridLeft + rectW} y2={y} stroke="hsl(var(--foreground))" strokeWidth="0.5" opacity="0.2" />;
        })}

        {/* Divisions label */}
        <g transform={`translate(${gridLeft + rectW - 4}, ${gridTop + rectH + 14})`}>
          <rect x="-28" y="-10" width="56" height="16" fill="hsl(var(--muted-foreground))" rx="3" opacity="0.8" />
          <text x="0" y="3" textAnchor="middle" fill="hsl(var(--background))" fontSize="9" fontWeight="bold" fontFamily="monospace">
            {gridDivisionsX} × {gridDivisionsY}
          </text>
        </g>

        {/* Load label pill above grid */}
        <g transform={`translate(${gridCenterX}, ${gridTop - 18})`}>
          <rect x="-80" y="-13" width="160" height="24" fill="hsl(var(--primary))" rx="4" />
          <text x="0" y="4" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
            {loadLabel}
          </text>
        </g>

        {/* Grid Width dimension (horizontal, above grid) */}
        <line x1={gridLeft} y1={gridTop - 42} x2={gridLeft + rectW} y2={gridTop - 42} stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1={gridLeft} y1={gridTop - 47} x2={gridLeft} y2={gridTop - 37} stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <line x1={gridLeft + rectW} y1={gridTop - 47} x2={gridLeft + rectW} y2={gridTop - 37} stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <g transform={`translate(${gridCenterX}, ${gridTop - 52})`}>
          <rect x="-55" y="-11" width="110" height="20" fill="hsl(var(--primary))" rx="3" />
          <text x="0" y="4" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
            Width: {fmt(gridWidth)} {depthUnit}
          </text>
        </g>

        {/* Grid Length dimension (vertical, right side) */}
        {(() => {
          const dimX = gridLeft + rectW + 12;
          return (
            <>
              <line x1={dimX} y1={gridTop} x2={dimX} y2={gridTop + rectH} stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
              <line x1={dimX - 5} y1={gridTop} x2={dimX + 5} y2={gridTop} stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
              <line x1={dimX - 5} y1={gridTop + rectH} x2={dimX + 5} y2={gridTop + rectH} stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
              <g transform={`translate(${dimX + 12}, ${gridCenterY}) rotate(-90)`}>
                <rect x="-50" y="-11" width="100" height="20" fill="hsl(var(--primary))" rx="3" />
                <text x="0" y="4" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  Length: {fmt(gridLength)} {depthUnit}
                </text>
              </g>
            </>
          );
        })()}

        {/* Offset X dimension (horizontal, from pipe center to grid center) */}
        {gridOffsetX !== 0 && (() => {
          const dimY = pipeY + 24;
          const fromX = pipeCenterX;
          const toX = gridCenterX;
          return (
            <>
              <line x1={fromX} y1={dimY} x2={toX} y2={dimY} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4,3" />
              <line x1={fromX} y1={dimY - 5} x2={fromX} y2={dimY + 5} stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
              <line x1={toX} y1={dimY - 5} x2={toX} y2={dimY + 5} stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
              <g transform={`translate(${(fromX + toX) / 2}, ${dimY + 16})`}>
                <rect x="-55" y="-11" width="110" height="20" fill="hsl(var(--primary))" rx="3" />
                <text x="0" y="4" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  Offset X: {fmt(gridOffsetX)} {depthUnit}
                </text>
              </g>
            </>
          );
        })()}

        {/* Offset Y dimension (vertical, from pipe to grid center) */}
        {gridOffsetY !== 0 && (() => {
          const dimX = gridLeft - 16;
          const fromY = pipeY;
          const toY = gridCenterY;
          return (
            <>
              <line x1={dimX} y1={fromY} x2={dimX} y2={toY} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4,3" />
              <line x1={dimX - 5} y1={fromY} x2={dimX + 5} y2={fromY} stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
              <line x1={dimX - 5} y1={toY} x2={dimX + 5} y2={toY} stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
              <g transform={`translate(${dimX - 12}, ${(fromY + toY) / 2}) rotate(-90)`}>
                <rect x="-55" y="-11" width="110" height="20" fill="hsl(var(--primary))" rx="3" />
                <text x="0" y="4" textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  Offset Y: {fmt(gridOffsetY)} {depthUnit}
                </text>
              </g>
            </>
          );
        })()}

        {/* Vertical guide line from grid center to pipeline */}
        <line x1={gridCenterX} y1={gridCenterY} x2={gridCenterX} y2={pipeY} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
      </svg>
    </div>
  );
};
