/**
 * Shared Boussinesq calculation helpers
 * Extracted from vbaTrackEngine to be reusable across all vehicle types
 */

export interface PointLoad {
  x: number; // inches
  y: number; // inches
  load_lb: number;
}

export interface MeasurementPoint {
  x: number; // inches
  y: number; // inches
  label: string;
}

/**
 * Calculate Boussinesq pressure at measurement points from an array of point loads
 * Ported from VBA logic
 */
export function calculateBoussinesqFromPoints(
  pointLoads: PointLoad[],
  measurementPoints: MeasurementPoint[],
  H_ft: number
): {
  pressures_psi: number[];
  maxPressure_psi: number;
  maxLocation: string;
  influenceFactor: number;
  contactPressure_psf: number;
} {
  const H_in = H_ft * 12;
  const pressures: number[] = [];
  
  // Calculate total load and contact area (for reference)
  const totalLoad_lb = pointLoads.reduce((sum, p) => sum + p.load_lb, 0);
  
  // Estimate contact area from point load spread (rough approximation)
  const xCoords = pointLoads.map(p => p.x);
  const yCoords = pointLoads.map(p => p.y);
  const xRange = Math.max(...xCoords) - Math.min(...xCoords);
  const yRange = Math.max(...yCoords) - Math.min(...yCoords);
  const contactArea_ft2 = Math.max((xRange * yRange) / 144, 1); // prevent division by zero
  const contactPressure_psf = totalLoad_lb / contactArea_ft2;
  
  // Calculate pressure at each measurement point
  for (const mp of measurementPoints) {
    let pressure_psi = 0;
    
    for (const pl of pointLoads) {
      const dx = mp.x - pl.x;
      const dy = mp.y - pl.y;
      const R = Math.sqrt(dx * dx + dy * dy);
      
      // Boussinesq formula (ported from VBA)
      const contrib = (3 * pl.load_lb) / 
        (2 * Math.PI * H_in * H_in * Math.pow(1 + Math.pow(R / H_in, 2), 2.5));
      
      pressure_psi += contrib;
    }
    
    pressures.push(pressure_psi);
  }
  
  // Find max
  const maxPressure_psi = Math.max(...pressures);
  const maxIndex = pressures.indexOf(maxPressure_psi);
  const maxLocation = measurementPoints[maxIndex].label;
  
  // Influence factor (for reference, simplified)
  const influenceFactor = pressures.length > 0 ? maxPressure_psi / (contactPressure_psf / 144) : 1;
  
  return {
    pressures_psi: pressures,
    maxPressure_psi,
    maxLocation,
    influenceFactor,
    contactPressure_psf,
  };
}

/**
 * Generate a grid of point loads for a rectangular area
 * @param centerX - center X coordinate (inches)
 * @param centerY - center Y coordinate (inches)
 * @param width_in - width of area (inches)
 * @param length_in - length of area (inches)
 * @param totalLoad_lb - total load to distribute
 * @param gridSpacing_in - spacing between points (default 6 inches)
 */
export function generateRectangularGrid(
  centerX: number,
  centerY: number,
  width_in: number,
  length_in: number,
  totalLoad_lb: number,
  gridSpacing_in: number = 6
): PointLoad[] {
  const pointLoads: PointLoad[] = [];
  
  const nW = Math.max(1, Math.ceil(width_in / gridSpacing_in));
  const nL = Math.max(1, Math.ceil(length_in / gridSpacing_in));
  const pointLoad_lb = totalLoad_lb / (nW * nL);
  
  const startX = centerX - width_in / 2;
  const startY = centerY - length_in / 2;
  
  for (let iW = 0; iW < nW; iW++) {
    for (let iL = 0; iL < nL; iL++) {
      pointLoads.push({
        x: startX + (iW + 0.5) * (width_in / nW),
        y: startY + (iL + 0.5) * (length_in / nL),
        load_lb: pointLoad_lb,
      });
    }
  }
  
  return pointLoads;
}

/**
 * Generate standard measurement points for pipe analysis
 * MP1: Under the load center
 * MP2: At pipe centerline
 */
export function generateStandardMeasurementPoints(
  loadCenterX_in: number,
  loadCenterY_in: number
): MeasurementPoint[] {
  return [
    { x: loadCenterX_in, y: loadCenterY_in, label: 'Under load center' },
    { x: 0, y: 0, label: 'At pipe centerline' },
  ];
}
