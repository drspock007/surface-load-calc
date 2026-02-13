import React from 'react';

const styles: Record<string, React.CSSProperties> = {
  doc: { fontFamily: 'Georgia, "Times New Roman", serif', color: '#111', background: '#fff', maxWidth: 850, margin: '0 auto', padding: '40px 60px', lineHeight: 1.7, fontSize: 14 },
  title: { fontSize: 28, fontWeight: 700, textAlign: 'center' as const, marginBottom: 4, fontFamily: 'Georgia, serif' },
  subtitle: { fontSize: 16, textAlign: 'center' as const, color: '#444', marginBottom: 8 },
  disclaimer: { border: '2px solid #c00', padding: '12px 16px', margin: '24px 0', fontSize: 12, color: '#900', lineHeight: 1.5 },
  h1: { fontSize: 22, fontWeight: 700, borderBottom: '2px solid #222', paddingBottom: 4, marginTop: 36, marginBottom: 12, pageBreakBefore: 'always' as const },
  h2: { fontSize: 17, fontWeight: 700, marginTop: 24, marginBottom: 8 },
  h3: { fontSize: 15, fontWeight: 700, marginTop: 16, marginBottom: 6 },
  formula: { fontFamily: '"Courier New", monospace', background: '#f5f5f0', padding: '8px 12px', margin: '8px 0', borderLeft: '3px solid #ff8f05', display: 'block', fontSize: 13, overflowX: 'auto' as const },
  table: { borderCollapse: 'collapse' as const, width: '100%', margin: '12px 0', fontSize: 13 },
  th: { border: '1px solid #333', padding: '6px 10px', background: '#222', color: '#fff', fontWeight: 600, textAlign: 'center' as const },
  td: { border: '1px solid #999', padding: '5px 10px', textAlign: 'center' as const },
  tdLeft: { border: '1px solid #999', padding: '5px 10px', textAlign: 'left' as const },
  toc: { background: '#fafafa', padding: '16px 24px', margin: '16px 0', border: '1px solid #ddd' },
  tocItem: { marginBottom: 4, fontSize: 13 },
  note: { background: '#fffbe6', border: '1px solid #e6d600', padding: '8px 12px', margin: '8px 0', fontSize: 12 },
  varDef: { marginLeft: 24, fontSize: 13 },
  pageBreak: { pageBreakBefore: 'always' as const },
};

const F = ({ children }: { children: React.ReactNode }) => <code style={styles.formula}>{children}</code>;
const Var = ({ children }: { children: React.ReactNode }) => <span style={{ fontFamily: '"Courier New", monospace', fontStyle: 'italic' }}>{children}</span>;

export const TechnicalManualContent = React.forwardRef<HTMLDivElement>((_, ref) => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div ref={ref} style={styles.doc}>
      {/* FRONT MATTER */}
      <div style={{ textAlign: 'center', marginBottom: 40, paddingTop: 60 }}>
        <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #ff8f05, #e67e00)', borderRadius: 8, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 700 }}>σ</div>
        <h1 style={{ ...styles.title, marginBottom: 8 }}>CEPA Surface Loading Stress Calculator</h1>
        <h2 style={{ ...styles.subtitle, fontSize: 20, fontWeight: 400, fontStyle: 'italic' }}>Technical Reference Manual</h2>
        <p style={{ color: '#666', fontSize: 13, marginTop: 16 }}>Version 1.0 — Generated {today}</p>
      </div>

      <div style={styles.disclaimer}>
        <strong>DISCLAIMER:</strong> This tool is intended for screening-level analysis only. All results must be reviewed and validated by a qualified professional engineer before being used for design, construction, or operational decisions. The developers assume no liability for the use or misuse of results produced by this calculator.
      </div>

      {/* TABLE OF CONTENTS */}
      <div style={styles.toc}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>Table of Contents</h3>
        {[
          '1. Introduction and Scope',
          '2. Input Parameters',
          '3. Soil Load Calculation',
          '4. Boussinesq Surface Pressure',
          '5. Impact Factor',
          '6. Hoop Stress (Spangler Formula)',
          '7. Longitudinal Stress',
          '8. Equivalent Stress and %SMYS',
          '9. Pass/Fail Criteria',
          '10. Tire Contact Patch Calculation',
          '11. Minimum Bend Radius',
          '12. Unit Conversions',
          'Appendix A: Worked Example — Track Vehicle',
          'Appendix B: Worked Example — 2-Axle Vehicle',
          'Appendix C: E\' Lookup Table (CEPA Table 2-3)',
        ].map((item, i) => (
          <div key={i} style={styles.tocItem}>{item}</div>
        ))}
      </div>

      {/* CHAPTER 1 */}
      <h1 style={styles.h1}>1. Introduction and Scope</h1>
      <p>This document describes the calculation methodology implemented in the CEPA Surface Loading Stress Calculator. The tool performs screening-level stress analysis of buried steel pipelines subjected to surface vehicle loads, following the methodology defined in the <strong>CEPA Surface Loading Calculator User Manual</strong>.</p>

      <h2 style={styles.h2}>1.1 Purpose</h2>
      <p>The calculator determines whether a buried pipeline can safely sustain surface loads from vehicles or equipment crossing above it. It evaluates hoop, longitudinal, and equivalent stresses against allowable limits defined by applicable pipeline codes.</p>

      <h2 style={styles.h2}>1.2 Supported Vehicle Types</h2>
      <ul>
        <li><strong>Track Vehicle</strong> — Tracked equipment (excavators, dozers) with two rectangular contact patches</li>
        <li><strong>2-Axle Vehicle</strong> — Two-axle wheeled vehicles (trucks, pickups) with separate tire patches per axle</li>
        <li><strong>3-Axle Vehicle</strong> — Three-axle wheeled vehicles (tandem trucks) with separate tire patches per axle</li>
        <li><strong>Uniform Grid</strong> — Uniform distributed load over a rectangular area</li>
      </ul>

      <h2 style={styles.h2}>1.3 Supported Code Checks</h2>
      <ul>
        <li>ASME B31.4 — Liquid transportation systems</li>
        <li>ASME B31.8 — Gas transmission and distribution</li>
        <li>CSA Z662 — Oil and gas pipeline systems (Canada)</li>
        <li>User-Defined — Custom stress limits</li>
      </ul>

      <h2 style={styles.h2}>1.4 Assumptions</h2>
      <ul>
        <li>Straight pipe on elastic foundation (no curvature effects in primary stress)</li>
        <li>Elastic material behavior (steel within yield)</li>
        <li>Boussinesq elastic half-space for load dispersion</li>
        <li>Pipe self-weight is not included</li>
      </ul>

      {/* CHAPTER 2 */}
      <h1 style={styles.h1}>2. Input Parameters</h1>

      <h2 style={styles.h2}>2.1 Pipe Properties</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Parameter</th>
            <th style={styles.th}>Symbol</th>
            <th style={styles.th}>English Units</th>
            <th style={styles.th}>SI Units</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Outside Diameter', 'D', 'inches', 'mm'],
            ['Wall Thickness', 't', 'inches', 'mm'],
            ['Maximum Operating Pressure', 'MOP', 'psi', 'kPa'],
            ['Specified Minimum Yield Strength', 'SMYS', 'psi', 'MPa'],
            ['Temperature Differential', 'ΔT', '°F', '°C'],
          ].map(([p, s, e, si], i) => (
            <tr key={i}><td style={styles.tdLeft}>{p}</td><td style={styles.td}>{s}</td><td style={styles.td}>{e}</td><td style={styles.td}>{si}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={styles.h2}>2.2 Material Constants</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Constant</th><th style={styles.th}>Symbol</th><th style={styles.th}>Value</th></tr></thead>
        <tbody>
          <tr><td style={styles.tdLeft}>Young's Modulus of Steel</td><td style={styles.td}>E</td><td style={styles.td}>30,000,000 psi (207 GPa)</td></tr>
          <tr><td style={styles.tdLeft}>Poisson's Ratio</td><td style={styles.td}>ν</td><td style={styles.td}>0.3</td></tr>
          <tr><td style={styles.tdLeft}>Thermal Expansion Coefficient</td><td style={styles.td}>α</td><td style={styles.td}>6.5 × 10⁻⁶ /°F (11.7 × 10⁻⁶ /°C)</td></tr>
        </tbody>
      </table>

      <h2 style={styles.h2}>2.3 Soil Properties</h2>
      <table style={styles.table}>
        <thead>
          <tr><th style={styles.th}>Parameter</th><th style={styles.th}>Symbol</th><th style={styles.th}>English Units</th><th style={styles.th}>SI Units</th></tr>
        </thead>
        <tbody>
          {[
            ['Soil Density', 'ρ', 'lb/ft³ (pcf)', 'kg/m³'],
            ['Depth of Cover', 'H', 'ft', 'm'],
            ['Bedding Angle', 'θ_bed', 'degrees', 'degrees'],
            ['Soil Friction Angle', 'φ', 'degrees', 'degrees'],
            ['Soil Cohesion', 'c', 'psi', 'psi'],
            ['Coeff. of Lateral Earth Pressure', 'Kr', '—', '—'],
          ].map(([p, s, e, si], i) => (
            <tr key={i}><td style={styles.tdLeft}>{p}</td><td style={styles.td}>{s}</td><td style={styles.td}>{e}</td><td style={styles.td}>{si}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={styles.h2}>2.4 E' — Modulus of Soil Reaction</h2>
      <p>E' can be determined via direct lookup from CEPA Table 2-3 (based on soil type, compaction level, and depth range) or entered as a user-defined value. The complete lookup table is reproduced in <strong>Appendix C</strong>.</p>

      {/* CHAPTER 3 */}
      <h1 style={styles.h1}>3. Soil Load Calculation</h1>
      <p>Two methods are available for computing the earth pressure acting on the pipe crown.</p>

      <h2 style={styles.h2}>3.1 Prism Method</h2>
      <p>Assumes the full column of soil directly above the pipe transfers its weight:</p>
      <F>P_soil = ρ × H / 144     (psi)</F>
      <div style={styles.varDef}>
        <p>where <Var>ρ</Var> = soil unit weight (lb/ft³), <Var>H</Var> = depth of cover (ft)</p>
        <p>Division by 144 converts psf to psi.</p>
      </div>

      <h2 style={styles.h2}>3.2 Trap Door Method</h2>
      <p>Accounts for arching effects in the soil above the pipe. Used when the cover-to-diameter ratio is sufficient for arching to develop.</p>

      <h3 style={styles.h3}>Shallow Cover Check</h3>
      <p>If <Var>H_in {'<'} 2.5 × D</Var>, the soil is too shallow for arching and the Prism method is used as a fallback.</p>

      <h3 style={styles.h3}>Trap Door Formula</h3>
      <F>P_soil = (DenCoTerm × D) / (2 × K_a) × (1 − e^(−2 × K_a × H_in / D)) + q × e^(−2 × K_a × H_in / D)</F>
      <div style={styles.varDef}>
        <p>where:</p>
        <p><Var>K_a</Var> = (1 − sin φ) / (1 + sin φ)    — Rankine active earth pressure coefficient</p>
        <p><Var>DenCoTerm</Var> = (ρ / 1728) − 2 × (c / 144) / D</p>
        <p><Var>q</Var> = ρ × H / 144    — overburden pressure (psi)</p>
        <p><Var>H_in</Var> = H × 12    — depth in inches</p>
        <p><Var>D</Var> = pipe outside diameter (inches)</p>
        <p><Var>φ</Var> = soil friction angle (degrees)</p>
        <p><Var>c</Var> = soil cohesion (psi), default = 0</p>
      </div>

      {/* CHAPTER 4 */}
      <h1 style={styles.h1}>4. Boussinesq Surface Pressure</h1>
      <p>Surface loads are transferred to pipe depth using Boussinesq elastic half-space theory. Each vehicle contact patch is discretized into a grid of point loads, and the vertical stress at each measurement point is computed as the superposition of all point load contributions.</p>

      <h2 style={styles.h2}>4.1 Point Load Formula</h2>
      <F>σ_z = (3P) / (2π H² × (1 + (R/H)²)^2.5)</F>
      <div style={styles.varDef}>
        <p><Var>P</Var> = point load (lb)</p>
        <p><Var>H</Var> = depth of cover (inches)</p>
        <p><Var>R</Var> = horizontal distance from point load to measurement point (inches)</p>
        <p><Var>R</Var> = √(Δx² + Δy²)</p>
      </div>

      <h2 style={styles.h2}>4.2 Grid Discretization</h2>
      <p>Each rectangular contact patch is divided into a uniform grid with <strong>6-inch spacing</strong>. The number of grid cells:</p>
      <F>n_W = ⌈Width / 6⌉,  n_L = ⌈Length / 6⌉</F>
      <F>Point load = Total patch load / (n_W × n_L)</F>

      <h2 style={styles.h2}>4.3 Vehicle-Specific Patch Layouts</h2>

      <h3 style={styles.h3}>Track Vehicle</h3>
      <p>Two rectangular patches centered at ±(separation/2) from the vehicle centerline. Each track carries half the total vehicle weight.</p>

      <h3 style={styles.h3}>2-Axle / 3-Axle Vehicles</h3>
      <p>Each axle has two tire patches (left and right) positioned at ±(axleWidth/2) from the lane offset. For <strong>Single</strong> tire configuration (2 tires/axle), each side uses the tire width. For <strong>Dual</strong> configuration (4 tires/axle), each side uses tire width × 2. Each left/right patch receives half the axle load.</p>

      <h2 style={styles.h2}>4.4 Pipe-Axis Scanning</h2>
      <p>The calculator scans along the pipeline axis (Y-direction) at <strong>3-inch intervals</strong> to identify the true peak Boussinesq pressure. This is critical for multi-axle vehicles where the maximum pressure occurs directly under one axle rather than at the vehicle center.</p>
      <div style={styles.note}>
        <strong>Note:</strong> The scan extends ±36 inches beyond the outermost axle positions and also evaluates exact axle positions to avoid missing peaks.
      </div>

      {/* CHAPTER 5 */}
      <h1 style={styles.h1}>5. Impact Factor</h1>
      <p>A dynamic amplification factor is applied to the surface load to account for vehicle vibration and dynamic effects.</p>

      <h2 style={styles.h2}>5.1 Base Impact Factor</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Vehicle Class</th><th style={styles.th}>Pavement Type</th><th style={styles.th}>IF_base</th></tr></thead>
        <tbody>
          <tr><td style={styles.td}>Highway</td><td style={styles.td}>Rigid</td><td style={styles.td}>1.00</td></tr>
          <tr><td style={styles.td}>Highway</td><td style={styles.td}>Flexible</td><td style={styles.td}>1.50</td></tr>
          <tr><td style={styles.td}>Farm</td><td style={styles.td}>—</td><td style={styles.td}>1.25</td></tr>
          <tr><td style={styles.td}>Track</td><td style={styles.td}>—</td><td style={styles.td}>1.50</td></tr>
        </tbody>
      </table>

      <h2 style={styles.h2}>5.2 Depth Reduction</h2>
      <p>For burial depths exceeding 60 inches (5 ft), the impact factor is reduced:</p>
      <F>IF_depth = IF_base − 0.0025 × (H_in − 60),  minimum = 1.0</F>
      <div style={styles.varDef}>
        <p>where <Var>H_in</Var> = depth of cover in inches</p>
      </div>

      {/* CHAPTER 6 */}
      <h1 style={styles.h1}>6. Hoop Stress (Spangler Formula)</h1>

      <h2 style={styles.h2}>6.1 Bedding Parameters — CEPA Table 2-1</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Bedding Angle (°)</th><th style={styles.th}>K_b</th><th style={styles.th}>K_z</th><th style={styles.th}>Θ (°)</th></tr></thead>
        <tbody>
          {[
            [0, 0.294, 0.110, 135],
            [30, 0.235, 0.108, 130],
            [60, 0.189, 0.103, 120],
            [90, 0.157, 0.096, 105],
            [120, 0.138, 0.089, 90],
            [150, 0.128, 0.085, 75],
            [180, 0.125, 0.083, 60],
          ].map(([a, kb, kz, th], i) => (
            <tr key={i}><td style={styles.td}>{a}</td><td style={styles.td}>{kb}</td><td style={styles.td}>{kz}</td><td style={styles.td}>{th}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={styles.h2}>6.2 Spangler Denominator</h2>
      <F>Denom = 1 + 3 K_z × (P_int / E) × (D/t)³ + 0.0915 × (E'/E) × (D/t)³</F>

      <h2 style={styles.h2}>6.3 Hoop Stress Components</h2>
      <F>σ_hoop_soil = 3 × K_b × P_soil × (D/t)² / Denom</F>
      <F>σ_hoop_live = 3 × K_b × P_live × (D/t)² / Denom</F>
      <F>σ_hoop_int = P_int × D / (2t)</F>
      <div style={styles.varDef}>
        <p>where <Var>P_live</Var> = Boussinesq max pressure × Impact Factor</p>
      </div>

      <h2 style={styles.h2}>6.4 High/Low Stress Definitions</h2>
      <p>Stresses are evaluated at two internal pressure conditions:</p>
      <F>At Zero Pressure:   σ_H_high = σ_soil + σ_live,  σ_H_low = −σ_soil − σ_live</F>
      <F>At MOP:   σ_H_high = σ_soil + σ_live + σ_int,  σ_H_low = σ_int − σ_soil − σ_live</F>
      <div style={styles.varDef}>
        <p>"High" = maximum compressive stress at crown/invert; "Low" = minimum tensile stress at springline.</p>
      </div>

      {/* CHAPTER 7 */}
      <h1 style={styles.h1}>7. Longitudinal Stress</h1>
      <p>Total longitudinal stress consists of multiple components:</p>
      <F>σ_L = σ_L_bend + σ_L_local + ν × σ_hoop_soil ± ν × σ_hoop_int + E × α × ΔT</F>

      <h2 style={styles.h2}>7.1 Poisson Component</h2>
      <F>σ_L_Poisson_soil = ν × σ_hoop_soil</F>
      <F>σ_L_Poisson_int = ν × σ_hoop_int    (= ν × P × D / (2t))</F>

      <h2 style={styles.h2}>7.2 Thermal Component</h2>
      <F>σ_L_thermal = E × α × ΔT = 30×10⁶ × 6.5×10⁻⁶ × ΔT = 195 × ΔT (psi, for ΔT in °F)</F>

      <h2 style={styles.h2}>7.3 Live Load Bending — Beam on Elastic Foundation</h2>

      <h3 style={styles.h3}>Moment of Inertia</h3>
      <F>I = (π/4) × (R_out⁴ − R_in⁴)</F>
      <div style={styles.varDef}>
        <p><Var>R_out</Var> = D/2,  <Var>R_in</Var> = R_out − t</p>
      </div>

      <h3 style={styles.h3}>Characteristic Parameter (Lambda)</h3>
      <F>λ = ((E' × D × Θ / 360) / (4 × E × I))^0.25</F>
      <div style={styles.varDef}>
        <p><Var>Θ</Var> = bedding parameter from Table 2-1 (degrees)</p>
      </div>

      <h3 style={styles.h3}>Surface Load on Pipe</h3>
      <F>W_surf = σ_bsnq_max × 2π H² / 3 × IF_depth</F>
      <F>L_load = H_in × tan(29.9°)</F>
      <F>P_pipe = W_surf / (π × L_load²)</F>

      <h3 style={styles.h3}>Moment Distribution</h3>
      <p><strong>For |x| ≤ L_load</strong> (within load region):</p>
      <F>M(x) = [P_pipe / (4λ³)] × e^(−λ|x|) × [cos(λ|x|) + sin(λ|x|)] − P_pipe × x² / 2</F>

      <p><strong>For |x| {'>'} L_load</strong> (outside load region):</p>
      <F>M(x) = [P_pipe / (4λ³)] × e^(−λ|x|) × [cos(λ|x|) + sin(λ|x|)]</F>
      <F>       − [P_pipe / (4λ³)] × e^(−λ(|x|−L)) × [cos(λ(|x|−L)) + sin(λ(|x|−L))]</F>

      <p>The maximum absolute moment <Var>M_max</Var> is found by evaluating M(x) over the range −100×L_load to +100×L_load.</p>

      <h3 style={styles.h3}>Bending Stress</h3>
      <F>σ_L_bend = M_max × (D/2) / I</F>

      <h2 style={styles.h2}>7.4 Local Bending Component</h2>
      <F>β = (12 × (1 − ν²))^(1/8)</F>
      <F>σ_L_local = (0.153 / 1.56) × β⁴ × σ_hoop_live</F>

      <h2 style={styles.h2}>7.5 Total Longitudinal Stress</h2>
      <F>σ_L_live = σ_L_bend + σ_L_local</F>
      <F>σ_L_high = ν × σ_hoop_soil + σ_L_live + ν × σ_hoop_int + σ_thermal</F>
      <F>σ_L_low  = ν × σ_hoop_int + σ_thermal − ν × σ_hoop_soil − σ_L_live</F>

      {/* CHAPTER 8 */}
      <h1 style={styles.h1}>8. Equivalent Stress and %SMYS</h1>
      <p>Equivalent stress is computed for all four combinations of (Hoop High/Low) × (Long High/Low):</p>

      <h2 style={styles.h2}>8.1 Tresca Criterion</h2>
      <F>σ_eq = max(|σ_H − σ_L|, σ_H, σ_L)</F>
      <p>Evaluated for each combination; the maximum across all four is the governing equivalent stress.</p>

      <h2 style={styles.h2}>8.2 Von Mises Criterion</h2>
      <F>σ_eq = √(σ_H² − σ_H × σ_L + σ_L²)</F>
      <p>Evaluated for each combination; the maximum across all four is the governing equivalent stress.</p>

      <h2 style={styles.h2}>8.3 Percent SMYS</h2>
      <F>%SMYS = (σ_eq_max / SMYS) × 100</F>

      {/* CHAPTER 9 */}
      <h1 style={styles.h1}>9. Pass/Fail Criteria</h1>

      <h2 style={styles.h2}>9.1 Code Profiles</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Code</th>
            <th style={styles.th}>Hoop Limit (%SMYS)</th>
            <th style={styles.th}>Long. Limit (%SMYS)</th>
            <th style={styles.th}>Equiv. Limit (%SMYS)</th>
            <th style={styles.th}>Sustained Long. Check</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={styles.td}>ASME B31.4</td><td style={styles.td}>90%</td><td style={styles.td}>90%</td><td style={styles.td}>90%</td><td style={styles.td}>Yes</td></tr>
          <tr><td style={styles.td}>ASME B31.8</td><td style={styles.td}>90%</td><td style={styles.td}>90%</td><td style={styles.td}>90%</td><td style={styles.td}>No</td></tr>
          <tr><td style={styles.td}>CSA Z662</td><td style={styles.td}>90%</td><td style={styles.td}>90%</td><td style={styles.td}>90%</td><td style={styles.td}>No</td></tr>
          <tr><td style={styles.td}>User-Defined</td><td style={styles.td}>Custom</td><td style={styles.td}>Custom</td><td style={styles.td}>Custom</td><td style={styles.td}>No</td></tr>
        </tbody>
      </table>

      <h2 style={styles.h2}>9.2 ASME B31.4 Sustained Longitudinal Check</h2>
      <p>For B31.4, an additional check is performed on sustained longitudinal stresses (excluding live load bending):</p>
      <F>σ_L_sustained = |σ_L_int ± σ_L_soil + σ_thermal|</F>
      <p>This sustained stress must also remain below the longitudinal limit.</p>

      <h2 style={styles.h2}>9.3 Overall Pass Determination</h2>
      <p>Overall Pass = all of the following must be satisfied:</p>
      <ul>
        <li>Hoop stress ≤ Hoop limit (at both Zero and MOP)</li>
        <li>Longitudinal stress ≤ Long. limit (at both Zero and MOP)</li>
        <li>Equivalent stress ≤ Equiv. limit (at both Zero and MOP)</li>
      </ul>

      {/* CHAPTER 10 */}
      <h1 style={styles.h1}>10. Tire Contact Patch Calculation</h1>
      <p>For 2-Axle and 3-Axle vehicles, the tire contact patch dimensions can be calculated automatically from the axle load and tire inflation pressure.</p>

      <h2 style={styles.h2}>10.1 AUTO Mode Formula</h2>
      <F>Load per tire = Axle Load / Tires per Axle</F>
      <F>Contact Area = Load per tire / Tire Pressure    (in²)</F>
      <F>Contact Length = Contact Area / Tire Width    (in)</F>
      <div style={styles.varDef}>
        <p><strong>Single</strong> configuration: 2 tires/axle (1 per side)</p>
        <p><strong>Dual</strong> configuration: 4 tires/axle (2 per side), contact width per side = tire width × 2</p>
      </div>

      <h2 style={styles.h2}>10.2 Tire Pressure Unit Conversions</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>From</th><th style={styles.th}>To psi</th><th style={styles.th}>Factor</th></tr></thead>
        <tbody>
          <tr><td style={styles.td}>kPa</td><td style={styles.td}>psi</td><td style={styles.td}>0.14504</td></tr>
          <tr><td style={styles.td}>kg/m²</td><td style={styles.td}>psi</td><td style={styles.td}>0.001422</td></tr>
          <tr><td style={styles.td}>bar</td><td style={styles.td}>psi</td><td style={styles.td}>14.5038</td></tr>
          <tr><td style={styles.td}>psig</td><td style={styles.td}>psi</td><td style={styles.td}>1.0</td></tr>
        </tbody>
      </table>

      {/* CHAPTER 11 */}
      <h1 style={styles.h1}>11. Minimum Bend Radius</h1>
      <p>An optional analysis that calculates the tightest horizontal or vertical curve the pipeline can tolerate given the remaining longitudinal stress margin.</p>

      <h2 style={styles.h2}>11.1 Formula</h2>
      <F>R_min = (E × D) / (2 × σ_remaining)</F>
      <div style={styles.varDef}>
        <p><Var>σ_remaining</Var> = σ_allowable − |σ_L_existing|</p>
        <p><Var>E</Var> = 30 × 10⁶ psi</p>
        <p><Var>D</Var> = pipe outside diameter (inches)</p>
      </div>

      <h2 style={styles.h2}>11.2 Governing Condition</h2>
      <p>The bend radius is evaluated at both Zero Pressure and MOP conditions. The governing (most restrictive) case is the one with the <strong>smallest remaining margin</strong>. If the remaining margin is ≤ 0, no bend is permissible.</p>

      {/* CHAPTER 12 */}
      <h1 style={styles.h1}>12. Unit Conversions</h1>
      <p>All internal calculations are performed in English (Imperial) units. The following conversion factors are applied when converting between SI and English systems:</p>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Quantity</th><th style={styles.th}>From</th><th style={styles.th}>To</th><th style={styles.th}>Factor</th></tr></thead>
        <tbody>
          {[
            ['Length', 'mm', 'in', '÷ 25.4'],
            ['Depth', 'm', 'ft', '÷ 0.3048'],
            ['Pressure (MOP)', 'kPa', 'psi', '÷ 6.89476'],
            ['Stress (SMYS)', 'MPa', 'psi', '× 145.038'],
            ['Force / Weight', 'kg', 'lb', '× 2.20462'],
            ['Density', 'kg/m³', 'lb/ft³', '÷ 16.0185'],
            ['Temperature Δ', '°C', '°F', '× 9/5'],
          ].map(([q, f, t, fac], i) => (
            <tr key={i}><td style={styles.tdLeft}>{q}</td><td style={styles.td}>{f}</td><td style={styles.td}>{t}</td><td style={styles.td}>{fac}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={styles.h2}>12.1 Numerical Constants Summary</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Constant</th><th style={styles.th}>Value</th><th style={styles.th}>Usage</th></tr></thead>
        <tbody>
          <tr><td style={styles.tdLeft}>E_steel</td><td style={styles.td}>30,000,000 psi</td><td style={styles.td}>All stress calculations</td></tr>
          <tr><td style={styles.tdLeft}>Poisson's ratio (ν)</td><td style={styles.td}>0.3</td><td style={styles.td}>Longitudinal Poisson effect, local bending</td></tr>
          <tr><td style={styles.tdLeft}>Thermal expansion (α)</td><td style={styles.td}>6.5 × 10⁻⁶ /°F</td><td style={styles.td}>Thermal longitudinal stress</td></tr>
          <tr><td style={styles.tdLeft}>Boussinesq grid spacing</td><td style={styles.td}>6 inches</td><td style={styles.td}>Contact patch discretization</td></tr>
          <tr><td style={styles.tdLeft}>Pipe scan step</td><td style={styles.td}>3 inches</td><td style={styles.td}>Peak pressure detection</td></tr>
          <tr><td style={styles.tdLeft}>Depth reduction threshold</td><td style={styles.td}>60 inches</td><td style={styles.td}>Impact factor depth adjustment</td></tr>
          <tr><td style={styles.tdLeft}>Load spread angle</td><td style={styles.td}>29.9°</td><td style={styles.td}>Load length for bending moment</td></tr>
        </tbody>
      </table>

      {/* APPENDIX A */}
      <h1 style={styles.h1}>Appendix A: Worked Example — Track Vehicle</h1>
      <p>This example follows CEPA Manual Example 2.</p>

      <h2 style={styles.h2}>A.1 Input Data</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Parameter</th><th style={styles.th}>Value</th></tr></thead>
        <tbody>
          {[
            ['Pipe OD (D)', '12.75 in (NPS 12)'],
            ['Wall Thickness (t)', '0.250 in'],
            ['MOP', '0 psi (unpressurized)'],
            ['SMYS', '52,000 psi (X52)'],
            ['ΔT', '0 °F'],
            ['Soil Density (ρ)', '120 lb/ft³'],
            ['Depth of Cover (H)', '4 ft'],
            ['Bedding Angle', '90°'],
            ['Soil Load Method', 'Prism'],
            ['E\' Method', 'Lookup — Coarse w/ Fines, 90% compaction'],
            ['Track Separation', '6 ft'],
            ['Track Length', '10 ft'],
            ['Vehicle Weight', '80,000 lb'],
            ['Track Width', '24 in'],
            ['Vehicle Class', 'Track'],
            ['Pavement Type', 'Flexible'],
            ['Code Check', 'CSA Z662'],
            ['Equiv. Stress Method', 'Tresca'],
          ].map(([p, v], i) => (
            <tr key={i}><td style={styles.tdLeft}>{p}</td><td style={styles.td}>{v}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={styles.h2}>A.2 Step-by-Step Calculations</h2>

      <h3 style={styles.h3}>Step 1: Bedding Parameters</h3>
      <p>Bedding angle = 90° → K_b = 0.157, K_z = 0.096, Θ = 105°</p>

      <h3 style={styles.h3}>Step 2: E' (Modulus of Soil Reaction)</h3>
      <p>Soil type: Coarse w/ Fines, Compaction: 90%, Depth: 4 ft (range 0–5 ft)</p>
      <p>From CEPA Table 2-3: <strong>E' = 1,000 psi</strong></p>

      <h3 style={styles.h3}>Step 3: Soil Load (Prism Method)</h3>
      <F>P_soil = 120 × 4 / 144 = 3.333 psi</F>

      <h3 style={styles.h3}>Step 4: Boussinesq Surface Pressure</h3>
      <p>Track load per side = 80,000 / 2 = 40,000 lb</p>
      <p>Track area = 24 in × 120 in = 2,880 in²</p>
      <p>Grid: n_W = ⌈24/6⌉ = 4, n_L = ⌈120/6⌉ = 20</p>
      <p>Point load = 40,000 / (4 × 20) = 500 lb per point</p>
      <p>Boussinesq is summed over both tracks at measurement points under the tracks and between the tracks. The maximum value is selected.</p>

      <h3 style={styles.h3}>Step 5: Impact Factor</h3>
      <p>Vehicle class = Track → IF_base = 1.50</p>
      <p>H_in = 48 in ≤ 60 in → no depth reduction → IF_depth = 1.50</p>

      <h3 style={styles.h3}>Step 6: Hoop Stress</h3>
      <p>Denominator = 1 + 3 × 0.096 × (0/30×10⁶) × (12.75/0.25)³ + 0.0915 × (1000/30×10⁶) × (12.75/0.25)³</p>
      <p>σ_hoop_soil and σ_hoop_live calculated using Spangler formula.</p>

      <h3 style={styles.h3}>Step 7: Longitudinal Stress</h3>
      <p>Thermal component = 30×10⁶ × 6.5×10⁻⁶ × 0 = 0 psi</p>
      <p>Beam-on-elastic-foundation bending moment computed; local bending added.</p>

      <h3 style={styles.h3}>Step 8: Equivalent Stress (Tresca)</h3>
      <p>All four (Hoop H/L) × (Long H/L) combinations evaluated. Maximum governs.</p>

      <h3 style={styles.h3}>Step 9: Pass/Fail</h3>
      <p>CSA Z662 limit: 90% SMYS = 0.9 × 52,000 = 46,800 psi. All stress components compared against this limit.</p>

      {/* APPENDIX B */}
      <h1 style={styles.h1}>Appendix B: Worked Example — 2-Axle Vehicle</h1>

      <h2 style={styles.h2}>B.1 Input Data</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Parameter</th><th style={styles.th}>Value (SI input)</th><th style={styles.th}>Converted (EN)</th></tr></thead>
        <tbody>
          {[
            ['Pipe OD', '114.3 mm', '4.5 in'],
            ['Wall Thickness', '6.02 mm', '0.237 in'],
            ['MOP', '7,070 kPa', '1,025.5 psi'],
            ['SMYS', '359 MPa', '52,069 psi'],
            ['ΔT', '65 °C', '117 °F'],
            ['Soil Density', '1,800 kg/m³', '112.4 lb/ft³'],
            ['Depth of Cover', '1.6 m', '5.25 ft'],
            ['Bedding Angle', '90°', '90°'],
          ].map(([p, si, en], i) => (
            <tr key={i}><td style={styles.tdLeft}>{p}</td><td style={styles.td}>{si}</td><td style={styles.td}>{en}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={styles.h2}>B.2 Reference Results</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Stress Component</th><th style={styles.th}>Value (kPa)</th></tr></thead>
        <tbody>
          <tr><td style={styles.tdLeft}>Hoop Total @ Zero Pressure (High)</td><td style={styles.td}>≈ 23,380</td></tr>
          <tr><td style={styles.tdLeft}>Longitudinal Total @ Zero Pressure (High)</td><td style={styles.td}>≈ 207,334</td></tr>
          <tr><td style={styles.tdLeft}>Longitudinal Total @ MOP (High)</td><td style={styles.td}>≈ 226,958</td></tr>
          <tr><td style={styles.tdLeft}>Equivalent (Von Mises) @ Zero Pressure</td><td style={styles.td}>≈ 219,958</td></tr>
        </tbody>
      </table>

      {/* APPENDIX C */}
      <h1 style={styles.h1}>Appendix C: E' Lookup Table — CEPA Table 2-3</h1>
      <p>Design values of E' (Modulus of Soil Reaction) in psi, organized by soil type, depth range, and degree of compaction.</p>

      <h2 style={styles.h2}>C.1 Fine-Grained Soils</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Depth (ft)</th><th style={styles.th}>85%</th><th style={styles.th}>90%</th><th style={styles.th}>95%</th><th style={styles.th}>100%</th></tr></thead>
        <tbody>
          <tr><td style={styles.td}>0–5</td><td style={styles.td}>500</td><td style={styles.td}>700</td><td style={styles.td}>1,000</td><td style={styles.td}>1,500</td></tr>
          <tr><td style={styles.td}>5–10</td><td style={styles.td}>600</td><td style={styles.td}>1,000</td><td style={styles.td}>1,400</td><td style={styles.td}>2,000</td></tr>
          <tr><td style={styles.td}>10–15</td><td style={styles.td}>700</td><td style={styles.td}>1,200</td><td style={styles.td}>1,600</td><td style={styles.td}>2,300</td></tr>
          <tr><td style={styles.td}>15–20</td><td style={styles.td}>800</td><td style={styles.td}>1,300</td><td style={styles.td}>1,800</td><td style={styles.td}>2,600</td></tr>
        </tbody>
      </table>

      <h2 style={styles.h2}>C.2 Coarse-Grained Soils with Fines</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Depth (ft)</th><th style={styles.th}>85%</th><th style={styles.th}>90%</th><th style={styles.th}>95%</th><th style={styles.th}>100%</th></tr></thead>
        <tbody>
          <tr><td style={styles.td}>0–5</td><td style={styles.td}>600</td><td style={styles.td}>1,000</td><td style={styles.td}>1,200</td><td style={styles.td}>1,900</td></tr>
          <tr><td style={styles.td}>5–10</td><td style={styles.td}>900</td><td style={styles.td}>1,400</td><td style={styles.td}>1,800</td><td style={styles.td}>2,700</td></tr>
          <tr><td style={styles.td}>10–15</td><td style={styles.td}>1,000</td><td style={styles.td}>1,500</td><td style={styles.td}>2,100</td><td style={styles.td}>3,200</td></tr>
          <tr><td style={styles.td}>15–20</td><td style={styles.td}>1,100</td><td style={styles.td}>1,600</td><td style={styles.td}>2,400</td><td style={styles.td}>3,700</td></tr>
        </tbody>
      </table>

      <h2 style={styles.h2}>C.3 Coarse-Grained Soils without Fines</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Depth (ft)</th><th style={styles.th}>85%</th><th style={styles.th}>90%</th><th style={styles.th}>95%</th><th style={styles.th}>100%</th></tr></thead>
        <tbody>
          <tr><td style={styles.td}>0–5</td><td style={styles.td}>700</td><td style={styles.td}>1,000</td><td style={styles.td}>1,600</td><td style={styles.td}>2,500</td></tr>
          <tr><td style={styles.td}>5–10</td><td style={styles.td}>1,000</td><td style={styles.td}>1,500</td><td style={styles.td}>2,200</td><td style={styles.td}>3,300</td></tr>
          <tr><td style={styles.td}>10–15</td><td style={styles.td}>1,050</td><td style={styles.td}>1,600</td><td style={styles.td}>2,400</td><td style={styles.td}>3,600</td></tr>
          <tr><td style={styles.td}>15–20</td><td style={styles.td}>1,100</td><td style={styles.td}>1,700</td><td style={styles.td}>2,500</td><td style={styles.td}>3,800</td></tr>
        </tbody>
      </table>

      <div style={{ marginTop: 60, borderTop: '1px solid #999', paddingTop: 16, fontSize: 11, color: '#666', textAlign: 'center' }}>
        <p>CEPA Surface Loading Stress Calculator — Technical Reference Manual v1.0</p>
        <p>Reference: CEPA Surface Loading Calculator User Manual</p>
        <p>Generated {today}</p>
      </div>
    </div>
  );
});

TechnicalManualContent.displayName = 'TechnicalManualContent';
