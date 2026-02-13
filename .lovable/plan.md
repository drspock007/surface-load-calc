

# Dual-Unit Technical Reference Manual

## Problem

The current manual presents all formulas exclusively in English units (psi, lb/ft3, inches, etc.), with unit-dependent constants like 144, 1728, and 12 embedded in the equations. Engineers working in SI have no intuitive feel for these numbers and find the document harder to follow.

## Solution

Add **SI equivalents** throughout the manual so that both EN and SI users can read the document naturally. This is not about removing the EN formulas -- the CEPA methodology is defined in English units -- but about giving SI readers a parallel reference.

### What changes concretely

**1. Formulas with unit-conversion constants: show both versions side by side**

For each formula that contains a unit-dependent constant, add an "SI form" box immediately below. Example:

- **EN form** (current, unchanged):
  `P_soil = (rho x H) / 144`  where rho in lb/ft3, H in ft, result in psi

- **SI form** (new, added below):
  `P_soil = (rho x g x H) / 1000`  where rho in kg/m3, H in m, result in kPa

Similarly for DenCoTerm (1728 constant), thermal stress (195 x deltaT), impact factor depth threshold (60 in vs 1.5 m), etc.

**2. Tables: add SI column to all lookup tables**

- E' table (Appendix C): add a column showing values in kPa (multiply psi by 6.895)
- Bedding parameters table: units are dimensionless -- no change needed
- Material constants table: already has SI equivalents -- verify completeness
- Worked examples: add SI intermediate values in parentheses

**3. Constants summary: dual values everywhere**

Current: "Boussinesq grid spacing = 6 inches"
New: "Boussinesq grid spacing = 6 in (152 mm)"

Current: "Depth reduction threshold = 60 inches"
New: "Depth reduction threshold = 60 in (1.52 m)"

**4. Explanatory notes on unit-conversion constants**

Add a small note box (like the existing yellow notes) after formulas containing 144, 1728, or 12 explaining:
- 144 = 12^2 converts ft2 to in2 (psf to psi)
- 1728 = 12^3 converts ft3 to in3 (pcf to pci)
- 12 converts ft to in

This helps SI users understand WHY these numbers appear and that they are not empirical.

### What does NOT change

- The EN formulas remain the primary presentation (they match the CEPA source)
- Dimensionless formulas (Spangler, Boussinesq, Tresca, Von Mises, moment of inertia, lambda) stay as-is since they work in any consistent unit system
- The overall document structure and chapter numbering remain the same

## Technical Implementation

### File Modified

| File | Change |
|------|--------|
| `src/components/documentation/TechnicalManualContent.tsx` | Add SI formula variants, dual-unit constants, SI columns in tables, explanatory notes |

### New helper component

A small `SINote` styled block (light blue background, blue left border) to visually distinguish SI equivalents from the primary EN formulas. This pairs with the existing orange-bordered `Math` blocks.

### Scope of formula changes

| Section | EN constant | SI equivalent to add |
|---------|-------------|---------------------|
| Ch 3 Prism | /144 (psf to psi) | rho g H / 1000 (kPa) |
| Ch 3 Trap Door | /1728, /144 | SI density conversion |
| Ch 5 Impact Factor | 60 in threshold | 1.52 m threshold |
| Ch 7 Thermal | 195 deltaT psi | 1.344 deltaT MPa |
| Ch 7 Bending | H_in, L_load in inches | note: H_mm, L_mm equivalents |
| Ch 11 Bend Radius | E = 30M psi, D in inches | E = 207 GPa, D in mm |
| Ch 12 Constants | all in EN | add SI column |
| App A/B examples | EN values | add SI in parentheses |
| App C E' table | psi only | add kPa column |

