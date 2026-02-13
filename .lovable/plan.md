

# Technical Reference Manual - PDF Generation

## Overview

Create a new `/documentation` page that renders a complete **Technical Reference Manual** and allows the user to export it as a PDF using `react-to-pdf` (already installed). All references cite the **CEPA Surface Loading Calculator User Manual** -- no mention of Kiefner anywhere in the document.

## Document Structure

### Front Matter
- Title: **"CEPA Surface Loading Stress Calculator -- Technical Reference Manual"**
- Version number, generation date
- Professional disclaimer: *"Results must be validated by a qualified professional engineer. This tool is intended for screening purposes only."*
- Table of Contents

### Chapter 1: Introduction and Scope
- Purpose: screening-level stress analysis for buried pipelines under surface loads
- Reference standard: CEPA Surface Loading Calculator User Manual
- Supported vehicle types: Track, 2-Axle, 3-Axle, Uniform Grid
- Supported code checks: ASME B31.4, ASME B31.8, CSA Z662, User-Defined
- Straight-pipe assumption (no curvature effects in primary stress)

### Chapter 2: Input Parameters
- Pipe properties: OD, WT, MOP, SMYS, delta-T, Poisson ratio (0.3), E_steel (30 x 10^6 psi), alpha (6.5 x 10^-6 /deg-F)
- Soil properties: density, depth of cover, bedding angle, friction angle, soil cohesion (default 0)
- E' modulus of soil reaction: full CEPA Table 2-3 reproduced (3 soil types x 4 depth ranges x 4 compaction levels)
- Vehicle/load configuration parameters per mode

### Chapter 3: Soil Load Calculation
- **Prism Method**: P_soil = rho x H / 144
- **Trap Door Method**: with shallow cover threshold (H_in < 2.5 x D --> fallback to Prism), friction decay formula, DenCoTerm with cohesion
- Formulas written out with variable definitions

### Chapter 4: Boussinesq Surface Pressure
- Point load formula: sigma_z = (3P) / (2 pi H^2 (1 + (R/H)^2)^2.5)
- Grid discretization: 6-inch spacing over rectangular contact patches
- Vehicle-specific patch layouts:
  - Track: two rectangular patches at +/- separation/2
  - 2-Axle / 3-Axle: separate left/right tire patches per axle, positioned at +/- axleWidth/2
- Pipe-axis scanning: 3-inch steps along Y to find true peak pressure
- Contact patch calculation: Area = Load / Pressure, Length = Area / Width

### Chapter 5: Impact Factor
- Base values: Highway rigid = 1.0, Highway flexible = 1.5, Farm = 1.25, Track = 1.5
- Depth reduction for H > 60 inches: IF_depth = IF_base - 0.0025 x (H_in - 60), minimum 1.0

### Chapter 6: Hoop Stress (Spangler Formula)
- CEPA Table 2-1 reproduced: Kb, Kz, Theta for all 7 bedding angles (0 to 180 degrees)
- Spangler denominator: 1 + 3 Kz (P_int / E)(D/t)^3 + 0.0915 (E'/E)(D/t)^3
- Hoop soil = 3 Kb P_soil (D/t)^2 / denominator
- Hoop live = 3 Kb P_live (D/t)^2 / denominator
- Hoop internal = P_int x D / (2t)
- High/Low definitions at Zero Pressure and MOP

### Chapter 7: Longitudinal Stress
- **Poisson component**: nu x sigma_hoop
- **Thermal component**: E x alpha x delta-T
- **Internal pressure component**: nu x P x D / (2t)
- **Live load bending (beam on elastic foundation)**:
  - Moment of inertia: I = (pi/4)(R_out^4 - R_in^4)
  - Lambda = ((E' x D x Theta/360) / (4 E I))^0.25
  - Surface load: W_surf = bsnq_max x 2 pi H^2 / 3 x IF
  - Load length: L_load = H_in x tan(29.9 deg)
  - Distributed load: P_pipe = W_surf / (pi x L_load^2)
  - Moment formulas for |x| <= L_load and |x| > L_load (both written out)
  - Bending stress: sigma_bend = M_max x (D/2) / I
- **Local bending**: sigma_local = (0.153 / 1.56) x Beta^4 x sigma_hoop_live, where Beta = (12(1-nu^2))^(1/8)
- Total longitudinal = bend + local + Poisson + thermal +/- pressure

### Chapter 8: Equivalent Stress and %SMYS
- **Tresca**: max(|sigma_H - sigma_L|, sigma_H, sigma_L) evaluated for all 4 high/low combinations
- **Von Mises**: sqrt(sigma_H^2 - sigma_H x sigma_L + sigma_L^2) for all 4 combinations
- %SMYS = (sigma_equiv_max / SMYS) x 100

### Chapter 9: Pass/Fail Criteria
- Code profiles table with limits:
  - ASME B31.4: 90% SMYS (hoop, long, equiv), sustained longitudinal check
  - ASME B31.8: 90% SMYS
  - CSA Z662: 90% SMYS
  - User-Defined: custom percentages
- Overall pass = all components pass

### Chapter 10: Tire Contact Patch (2-Axle / 3-Axle)
- AUTO mode: Area = (Axle Load / Tires per Axle) / Tire Pressure, Length = Area / Width
- Single (2 tires/axle) vs Dual (4 tires/axle) configurations
- Tire pressure unit conversions table (kPa, kg/m^2, bar, psig to psi)

### Chapter 11: Unit Conversions
- Complete table of all conversion factors (mm to in, m to ft, kPa to psi, MPa to psi, kg to lb, kg/m^3 to pcf, degC to degF, etc.)

### Constants Summary Table
- E_steel = 30,000,000 psi
- Poisson = 0.3
- Thermal expansion alpha = 6.5 x 10^-6 /deg-F
- Boussinesq grid spacing = 6 inches
- Pipe scan step = 3 inches

### Appendix A: Worked Example -- Track Vehicle (CEPA Manual Example 2)
- Full step-by-step numerical walkthrough with intermediate values

### Appendix B: Worked Example -- 2-Axle Vehicle
- Numerical walkthrough with reference values

### Appendix C: E' Lookup Table (CEPA Table 2-3 -- Complete)
- All 48 values (3 soil types x 4 depth ranges x 4 compaction levels)

---

## Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Documentation.tsx` | Page with PDF export button wrapping the manual content |
| `src/components/documentation/TechnicalManualContent.tsx` | Full document as a styled React component (print-optimized) |

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/documentation` route |
| `src/components/Layout.tsx` | Add "Manual" navigation link with FileText icon |

### Technical Details

- **PDF export**: `react-to-pdf` library (already installed), targeting a ref wrapping the document content
- **Styling**: White background, serif body font (Georgia), monospace for formulas, proper margins, page-break hints via CSS `break-before` / `break-inside`
- **Formulas**: Rendered using Unicode math notation (subscripts, superscripts, Greek letters via HTML entities) -- no LaTeX dependency
- **Tables**: Styled HTML tables for lookup values (E', bedding parameters, code profiles, unit conversions)
- **No Kiefner references**: All citations reference "CEPA Surface Loading Calculator User Manual" only
- **Component size**: The manual content component will be large (~1000+ lines) as it is essentially a static document; this is acceptable and preferable to over-splitting a printable document

