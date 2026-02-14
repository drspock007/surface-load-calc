

# Grid Load Diagram

## What gets built

A dynamic SVG diagram (top-down view) inserted into the Grid Load form, showing:

- A **rectangular loaded area** (hatched or shaded) representing the grid, with labeled dimensions (Grid Length and Grid Width)
- A **horizontal dashed blue pipeline** running left-to-right through the center of the view
- **Offset X** dimension arrow showing lateral displacement from pipe centerline to grid center
- **Offset Y** dimension arrow showing longitudinal displacement along the pipe axis
- **Total Load or Uniform Pressure** label displayed above the grid rectangle
- All labels update in real-time as form values change (same pattern as TrackVehicleDiagram)

The diagram visually clarifies the meaning of Offset X (perpendicular to pipeline) vs Offset Y (along pipeline), which is the most common source of confusion for this calculation mode.

## Visual layout (top-down view)

```text
        Grid Width
      |<--------->|
  --- +===========+ ---
  |   |  hatched  |  |   Grid Length
  |   |   area    |  |   (along Y)
  --- +===========+ ---
            |
            |<-- Offset X -->|
  ============================= Pipeline (dashed blue, horizontal)
            |
            Offset Y (vertical distance from pipe to grid center)
```

## Technical details

### New file
`src/components/GridLoadDiagram.tsx` -- a single component (~120 lines)

**Props:** `gridLength`, `gridWidth`, `gridOffsetX`, `gridOffsetY`, `totalLoad`, `uniformPressure`, `loadType`, `unitsSystem`

**Behavior:**
- Uses the same styling conventions as TrackVehicleDiagram (muted background, border, primary-colored labels, monospace values)
- Pipeline always drawn horizontally at the vertical center of the SVG
- Grid rectangle positioned relative to pipeline center using Offset X and Offset Y
- Dimension lines with end ticks for Length, Width, Offset X, Offset Y
- Load value shown in a primary-colored pill above the grid

### Modified file
`src/components/GridLoadForm.tsx` -- import and render `GridLoadDiagram` inside the "Grid Load Properties" card, right after the inputs (before the closing `</CardContent>`)

Pass watched values as props:
```
<GridLoadDiagram
  gridLength={watch("gridLength")}
  gridWidth={watch("gridWidth")}
  gridOffsetX={watch("gridOffsetX")}
  gridOffsetY={watch("gridOffsetY")}
  totalLoad={watch("totalLoad")}
  uniformPressure={watch("uniformPressure")}
  loadType={loadType}
  unitsSystem={unitsSystem}
/>
```

