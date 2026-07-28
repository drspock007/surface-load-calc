import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const styles: Record<string, React.CSSProperties> = {
  doc: { fontFamily: 'Georgia, "Times New Roman", serif', color: '#111', background: '#fff', maxWidth: 850, margin: '0 auto', padding: '40px 60px', lineHeight: 1.7, fontSize: 14 },
  title: { fontSize: 28, fontWeight: 700, textAlign: 'center' as const, marginBottom: 4, fontFamily: 'Georgia, serif' },
  subtitle: { fontSize: 16, textAlign: 'center' as const, color: '#444', marginBottom: 8 },
  disclaimer: { border: '2px solid #c00', padding: '12px 16px', margin: '24px 0', fontSize: 12, color: '#900', lineHeight: 1.5 },
  h1: { fontSize: 22, fontWeight: 700, borderBottom: '2px solid #222', paddingBottom: 4, marginTop: 36, marginBottom: 12, pageBreakBefore: 'always' as const },
  h2: { fontSize: 17, fontWeight: 700, marginTop: 24, marginBottom: 8 },
  h3: { fontSize: 15, fontWeight: 700, marginTop: 16, marginBottom: 6 },
  formulaBlock: { background: '#f5f5f0', padding: '10px 16px', margin: '8px 0', borderLeft: '3px solid #ff8f05', display: 'block', overflowX: 'auto' as const },
  table: { borderCollapse: 'collapse' as const, width: '100%', margin: '12px 0', fontSize: 13 },
  th: { border: '1px solid #333', padding: '6px 10px', background: '#222', color: '#fff', fontWeight: 600, textAlign: 'center' as const },
  td: { border: '1px solid #999', padding: '5px 10px', textAlign: 'center' as const },
  tdLeft: { border: '1px solid #999', padding: '5px 10px', textAlign: 'left' as const },
  toc: { background: '#fafafa', padding: '16px 24px', margin: '16px 0', border: '1px solid #ddd' },
  tocItem: { marginBottom: 4, fontSize: 13 },
  note: { background: '#fffbe6', border: '1px solid #e6d600', padding: '8px 12px', margin: '8px 0', fontSize: 12 },
  varDef: { marginLeft: 24, fontSize: 13 },
  pageBreak: { pageBreakBefore: 'always' as const },
  siNote: { background: '#eef6ff', border: '1px solid #b3d4fc', borderLeft: '3px solid #2979ff', padding: '8px 14px', margin: '8px 0', fontSize: 12.5 },
  siFormula: { background: '#eef6ff', padding: '10px 16px', margin: '8px 0', borderLeft: '3px solid #2979ff', display: 'block', overflowX: 'auto' as const },
  unitNote: { background: '#f3f0ff', border: '1px solid #c4b5fd', borderLeft: '3px solid #7c3aed', padding: '8px 14px', margin: '8px 0', fontSize: 12 },
};

/* Display math block with orange left border */
const Math = ({ tex }: { tex: string }) => {
  const html = katex.renderToString(tex, { displayMode: true, throwOnError: false, trust: true });
  return <div style={styles.formulaBlock} dangerouslySetInnerHTML={{ __html: html }} />;
};

/* Display math block with blue left border for SI equivalents */
const MathSI = ({ tex }: { tex: string }) => {
  const html = katex.renderToString(tex, { displayMode: true, throwOnError: false, trust: true });
  return <div style={styles.siFormula} dangerouslySetInnerHTML={{ __html: html }} />;
};

/* Inline math for variable references */
const V = ({ tex }: { tex: string }) => {
  const html = katex.renderToString(tex, { displayMode: false, throwOnError: false, trust: true });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

/* SI equivalent note block */
const SINote = ({ children }: { children: React.ReactNode }) => (
  <div style={styles.siNote}><strong style={{ color: '#1565c0' }}>SI Equivalent:</strong> {children}</div>
);

/* Unit conversion explanation note */
const UnitNote = ({ children }: { children: React.ReactNode }) => (
  <div style={styles.unitNote}><strong style={{ color: '#7c3aed' }}>Unit Note:</strong> {children}</div>
);

/* Helper to render E' table row with dual units */
const EPrimeRow = ({ depth, depthSI, v85, v90, v95, v100 }: { depth: string; depthSI: string; v85: number; v90: number; v95: number; v100: number }) => (
  <tr>
    <td style={styles.td}>{depth}<br /><span style={{ fontSize: 11, color: '#1565c0' }}>({depthSI})</span></td>
    <td style={styles.td}>{v85.toLocaleString()}<br /><span style={{ fontSize: 11, color: '#1565c0' }}>({(v85 * 6.895).toFixed(0)})</span></td>
    <td style={styles.td}>{v90.toLocaleString()}<br /><span style={{ fontSize: 11, color: '#1565c0' }}>({(v90 * 6.895).toFixed(0)})</span></td>
    <td style={styles.td}>{v95.toLocaleString()}<br /><span style={{ fontSize: 11, color: '#1565c0' }}>({(v95 * 6.895).toFixed(0)})</span></td>
    <td style={styles.td}>{v100.toLocaleString()}<br /><span style={{ fontSize: 11, color: '#1565c0' }}>({(v100 * 6.895).toFixed(0)})</span></td>
  </tr>
);

export const TechnicalManualContent = React.forwardRef<HTMLDivElement>((_, ref) => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div ref={ref} style={styles.doc}>
      {/* FRONT MATTER */}
      <div style={{ textAlign: 'center', marginBottom: 40, paddingTop: 60 }}>
        <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #ff8f05, #e67e00)', borderRadius: 8, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 700 }}>σ</div>
        <h1 style={{ ...styles.title, marginBottom: 8 }}>CEPA Surface Loading Stress Calculator</h2>
        <h2 style={{ ...styles.subtitle, fontSize: 20, fontWeight: 400, fontStyle: 'italic' }}>Technical Reference Manual</h2>
        <p style={{ color: '#666', fontSize: 13, marginTop: 16 }}>Version 1.0 — Generated {today}</p>
      </div>

      <div style={styles.disclaimer}>
        <strong>DISCLAIMER:</strong> This tool is intended for screening-level analysis only. All results must be reviewed and validated by a qualified professional engineer before being used for design, construction, or operational decisions. The developers assume no liability for the use or misuse of results produced by this calculator.
      </div>

      {/* LEGEND */}
      <div style={{ margin: '16px 0', padding: '12px 16px', background: '#fafafa', border: '1px solid #ddd', fontSize: 12.5 }}>
        <strong>Reading Guide — Color Legend:</strong>
        <div style={{ display: 'flex', gap: 24, marginTop: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 16, background: '#f5f5f0', borderLeft: '3px solid #ff8f05', display: 'inline-block' }} /> EN formula (primary)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 16, background: '#eef6ff', borderLeft: '3px solid #2979ff', display: 'inline-block' }} /> SI equivalent</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 16, background: '#f3f0ff', borderLeft: '3px solid #7c3aed', display: 'inline-block' }} /> Unit conversion note</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 16, background: '#fffbe6', border: '1px solid #e6d600', display: 'inline-block' }} /> Implementation note</div>
        </div>
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
      <h2 style={styles.h1}>1. Introduction and Scope</h2>
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

      <div style={styles.siNote}>
        <strong style={{ color: '#1565c0' }}>Note for SI users:</strong> All formulas in this manual are presented in their original English unit form as defined by the CEPA methodology. Where formulas contain unit-dependent constants (e.g. 144, 1728), an SI equivalent is provided in a <span style={{ color: '#2979ff', fontWeight: 600 }}>blue box</span> below. Dimensionless formulas (Boussinesq, Spangler, Tresca, Von Mises) work identically in any consistent unit system.
      </div>

      {/* CHAPTER 2 */}
      <h2 style={styles.h1}>2. Input Parameters</h2>

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
        <thead><tr><th style={styles.th}>Constant</th><th style={styles.th}>Symbol</th><th style={styles.th}>EN Value</th><th style={styles.th}>SI Value</th></tr></thead>
        <tbody>
          <tr><td style={styles.tdLeft}>Young's Modulus of Steel</td><td style={styles.td}><V tex="E" /></td><td style={styles.td}>30,000,000 psi</td><td style={styles.td}>207 GPa</td></tr>
          <tr><td style={styles.tdLeft}>Poisson's Ratio</td><td style={styles.td}><V tex="\nu" /></td><td style={styles.td} colSpan={2}>0.3 (dimensionless)</td></tr>
          <tr><td style={styles.tdLeft}>Thermal Expansion Coefficient</td><td style={styles.td}><V tex="\alpha" /></td><td style={styles.td}>6.5 × 10⁻⁶ /°F</td><td style={styles.td}>11.7 × 10⁻⁶ /°C</td></tr>
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
            ['Bedding Angle', 'θ_{bed}', 'degrees', 'degrees'],
            ['Soil Friction Angle', 'φ', 'degrees', 'degrees'],
            ['Soil Cohesion', 'c', 'psi', 'kPa'],
            ['Coeff. of Lateral Earth Pressure', 'K_r', '—', '—'],
          ].map(([p, s, e, si], i) => (
            <tr key={i}><td style={styles.tdLeft}>{p}</td><td style={styles.td}>{s}</td><td style={styles.td}>{e}</td><td style={styles.td}>{si}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={styles.h2}>2.4 E' — Modulus of Soil Reaction</h2>
      <p><V tex="E'" /> can be determined via direct lookup from CEPA Table 2-3 (based on soil type, compaction level, and depth range) or entered as a user-defined value. The complete lookup table is reproduced in <strong>Appendix C</strong>.</p>

      {/* CHAPTER 3 */}
      <h2 style={styles.h1}>3. Soil Load Calculation</h2>
      <p>Two methods are available for computing the earth pressure acting on the pipe crown.</p>

      <h2 style={styles.h2}>3.1 Prism Method</h2>
      <p>Assumes the full column of soil directly above the pipe transfers its weight:</p>
      <Math tex="P_{soil} = \frac{\rho \times H}{144} \quad \text{(psi)}" />
      <div style={styles.varDef}>
        <p>where <V tex="\rho" /> = soil unit weight (lb/ft³), <V tex="H" /> = depth of cover (ft)</p>
      </div>
      <UnitNote>The constant <V tex="144 = 12^2" /> converts ft² to in² (i.e., psf → psi). It is not an empirical value.</UnitNote>
      <SINote>
        <MathSI tex="P_{soil} = \frac{\rho \times g \times H}{1000} \quad \text{(kPa)}" />
        <div style={styles.varDef}>
          <p>where <V tex="\rho" /> = soil density (kg/m³), <V tex="g = 9.81" /> m/s², <V tex="H" /> = depth of cover (m). Division by 1000 converts Pa to kPa.</p>
        </div>
      </SINote>

      <h2 style={styles.h2}>3.2 Trap Door Method</h2>
      <p>Accounts for arching effects in the soil above the pipe. Used when the cover-to-diameter ratio is sufficient for arching to develop.</p>

      <h3 style={styles.h3}>Shallow Cover Check</h3>
      <p>If <V tex="H_{in} < 2.5 \times D" />, the soil is too shallow for arching and the Prism method is used as a fallback.</p>

      <h3 style={styles.h3}>Trap Door Formula</h3>
      <Math tex="P_{soil} = \frac{\text{DenCoTerm} \times D}{2\,K_a} \left(1 - e^{-2\,K_a\,H_{in}/D}\right) + q \cdot e^{-2\,K_a\,H_{in}/D}" />
      <div style={styles.varDef}>
        <p>where:</p>
        <p><V tex="K_a = \dfrac{1 - \sin\varphi}{1 + \sin\varphi}" /> — Rankine active earth pressure coefficient</p>
        <p><V tex="\text{DenCoTerm} = \dfrac{\rho}{1728} - \dfrac{2c}{144\,D}" /></p>
        <p><V tex="q = \dfrac{\rho \times H}{144}" /> — overburden pressure (psi)</p>
        <p><V tex="H_{in} = H \times 12" /> — depth in inches</p>
        <p><V tex="D" /> = pipe outside diameter (inches)</p>
        <p><V tex="\varphi" /> = soil friction angle (degrees)</p>
        <p><V tex="c" /> = soil cohesion (psi), default = 0</p>
      </div>
      <UnitNote>
        <V tex="1728 = 12^3" /> converts lb/ft³ to lb/in³ (pcf → pci). <V tex="144 = 12^2" /> converts psf to psi. <V tex="12" /> converts ft to in. These are purely geometric unit conversion factors.
      </UnitNote>
      <SINote>
        In SI, the DenCoTerm becomes:
        <MathSI tex="\text{DenCoTerm}_{SI} = \rho \cdot g - \frac{2c}{D_{m}} \quad \text{(Pa/m)}" />
        <div style={styles.varDef}>
          <p>where <V tex="\rho" /> in kg/m³, <V tex="g = 9.81" /> m/s², <V tex="c" /> in Pa, <V tex="D_m" /> = pipe diameter in m. Result in Pa; divide by 1000 for kPa.</p>
        </div>
      </SINote>

      {/* CHAPTER 4 */}
      <h2 style={styles.h1}>4. Boussinesq Surface Pressure</h2>
      <p>Surface loads are transferred to pipe depth using Boussinesq elastic half-space theory. Each vehicle contact patch is discretized into a grid of point loads, and the vertical stress at each measurement point is computed as the superposition of all point load contributions.</p>

      <h2 style={styles.h2}>4.1 Point Load Formula</h2>
      <Math tex="\sigma_z = \frac{3P}{2\pi H^2 \left(1 + \left(\dfrac{R}{H}\right)^2\right)^{2.5}}" />
      <div style={styles.varDef}>
        <p><V tex="P" /> = point load (lb)</p>
        <p><V tex="H" /> = depth of cover (inches)</p>
        <p><V tex="R" /> = horizontal distance from point load to measurement point (inches)</p>
        <p><V tex="R = \sqrt{\Delta x^2 + \Delta y^2}" /></p>
      </div>
      <SINote>This formula is <strong>dimensionless in form</strong> — it works identically in SI with <V tex="P" /> in N, <V tex="H" /> and <V tex="R" /> in m, giving <V tex="\sigma_z" /> in Pa. Use consistent units throughout.</SINote>

      <h2 style={styles.h2}>4.2 Grid Discretization</h2>
      <p>Each rectangular contact patch is divided into a uniform grid with <strong>6-inch (152 mm)</strong> spacing. The number of grid cells:</p>
      <Math tex="n_W = \lceil W / 6 \rceil, \quad n_L = \lceil L / 6 \rceil" />
      <Math tex="\text{Point load} = \frac{\text{Total patch load}}{n_W \times n_L}" />

      <h2 style={styles.h2}>4.3 Vehicle-Specific Patch Layouts</h2>

      <h3 style={styles.h3}>Track Vehicle</h3>
      <p>Two rectangular patches centered at <V tex="\pm(\text{separation}/2)" /> from the vehicle centerline. Each track carries half the total vehicle weight.</p>

      <h3 style={styles.h3}>2-Axle / 3-Axle Vehicles</h3>
      <p>Each axle has two tire patches (left and right) positioned at <V tex="\pm(\text{axleWidth}/2)" /> from the lane offset. For <strong>Single</strong> tire configuration (2 tires/axle), each side uses the tire width. For <strong>Dual</strong> configuration (4 tires/axle), each side uses tire width × 2. Each left/right patch receives half the axle load.</p>

      <h2 style={styles.h2}>4.4 Pipe-Axis Scanning</h2>
      <p>The calculator scans along the pipeline axis (Y-direction) at <strong>3-inch (76 mm) intervals</strong> to identify the true peak Boussinesq pressure. This is critical for multi-axle vehicles where the maximum pressure occurs directly under one axle rather than at the vehicle center.</p>
      <div style={styles.note}>
        <strong>Note:</strong> The scan extends ±36 inches (±914 mm) beyond the outermost axle positions and also evaluates exact axle positions to avoid missing peaks.
      </div>

      {/* CHAPTER 5 */}
      <h2 style={styles.h1}>5. Impact Factor</h2>
      <p>A dynamic amplification factor is applied to the surface load to account for vehicle vibration and dynamic effects.</p>

      <h2 style={styles.h2}>5.1 Base Impact Factor</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Vehicle Class</th><th style={styles.th}>Pavement Type</th><th style={styles.th}><V tex="IF_{base}" /></th></tr></thead>
        <tbody>
          <tr><td style={styles.td}>Highway</td><td style={styles.td}>Rigid</td><td style={styles.td}>1.00</td></tr>
          <tr><td style={styles.td}>Highway</td><td style={styles.td}>Flexible</td><td style={styles.td}>1.50</td></tr>
          <tr><td style={styles.td}>Farm</td><td style={styles.td}>—</td><td style={styles.td}>1.25</td></tr>
          <tr><td style={styles.td}>Track</td><td style={styles.td}>—</td><td style={styles.td}>1.50</td></tr>
        </tbody>
      </table>

      <h2 style={styles.h2}>5.2 Depth Reduction</h2>
      <p>For burial depths exceeding <strong>60 inches (1.52 m)</strong>, the impact factor is reduced:</p>
      <Math tex="IF_{depth} = IF_{base} - 0.0025 \times (H_{in} - 60), \quad \min = 1.0" />
      <div style={styles.varDef}>
        <p>where <V tex="H_{in}" /> = depth of cover in inches</p>
      </div>
      <UnitNote>The coefficient 0.0025 has units of <V tex="\text{in}^{-1}" />. It is an empirical reduction rate specific to the English unit formulation.</UnitNote>
      <SINote>
        <MathSI tex="IF_{depth} = IF_{base} - 0.0984 \times (H_{m} - 1.524), \quad \min = 1.0" />
        <div style={styles.varDef}>
          <p>where <V tex="H_m" /> = depth of cover in metres. The coefficient <V tex="0.0984 = 0.0025 \times 39.37" /> (in⁻¹ → m⁻¹) and <V tex="1.524 = 60 \times 0.0254" /> m.</p>
        </div>
      </SINote>

      {/* CHAPTER 6 */}
      <h2 style={styles.h1}>6. Hoop Stress (Spangler Formula)</h2>

      <h2 style={styles.h2}>6.1 Bedding Parameters — CEPA Table 2-1</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Bedding Angle (°)</th><th style={styles.th}><V tex="K_b" /></th><th style={styles.th}><V tex="K_z" /></th><th style={styles.th}><V tex="\Theta" /> (°)</th></tr></thead>
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
      <SINote>All bedding parameters are dimensionless — they apply identically in any unit system.</SINote>

      <h2 style={styles.h2}>6.2 Spangler Denominator</h2>
      <Math tex="\text{Denom} = 1 + 3\,K_z \cdot \frac{P_{int}}{E} \cdot \left(\frac{D}{t}\right)^3 + 0.0915 \cdot \frac{E'}{E} \cdot \left(\frac{D}{t}\right)^3" />
      <SINote>This formula is dimensionless — all terms are ratios. Use consistent pressure units for <V tex="P_{int}" />, <V tex="E" />, and <V tex="E'" /> (all in psi or all in kPa).</SINote>

      <h2 style={styles.h2}>6.3 Hoop Stress Components</h2>
      <Math tex="\sigma_{hoop,soil} = \frac{3\,K_b \cdot P_{soil} \cdot (D/t)^2}{\text{Denom}}" />
      <Math tex="\sigma_{hoop,live} = \frac{3\,K_b \cdot P_{live} \cdot (D/t)^2}{\text{Denom}}" />
      <Math tex="\sigma_{hoop,int} = \frac{P_{int} \cdot D}{2\,t}" />
      <div style={styles.varDef}>
        <p>where <V tex="P_{live}" /> = Boussinesq max pressure × Impact Factor</p>
      </div>

      <h2 style={styles.h2}>6.4 High/Low Stress Definitions</h2>
      <p>Stresses are evaluated at two internal pressure conditions:</p>
      <Math tex="\text{At Zero Pressure:} \quad \sigma_{H,high} = \sigma_{soil} + \sigma_{live}, \quad \sigma_{H,low} = -\sigma_{soil} - \sigma_{live}" />
      <Math tex="\text{At MOP:} \quad \sigma_{H,high} = \sigma_{soil} + \sigma_{live} + \sigma_{int}, \quad \sigma_{H,low} = \sigma_{int} - \sigma_{soil} - \sigma_{live}" />
      <div style={styles.varDef}>
        <p>"High" = maximum compressive stress at crown/invert; "Low" = minimum tensile stress at springline.</p>
      </div>

      {/* CHAPTER 7 */}
      <h2 style={styles.h1}>7. Longitudinal Stress</h2>
      <p>Total longitudinal stress consists of multiple components:</p>
      <Math tex="\sigma_L = \sigma_{L,bend} + \sigma_{L,local} + \nu\,\sigma_{hoop,soil} \pm \nu\,\sigma_{hoop,int} + E\,\alpha\,\Delta T" />

      <h2 style={styles.h2}>7.1 Poisson Component</h2>
      <Math tex="\sigma_{L,Poisson,soil} = \nu \cdot \sigma_{hoop,soil}" />
      <Math tex="\sigma_{L,Poisson,int} = \nu \cdot \sigma_{hoop,int} = \nu \cdot \frac{P \cdot D}{2\,t}" />

      <h2 style={styles.h2}>7.2 Thermal Component</h2>
      <Math tex="\sigma_{L,thermal} = E \cdot \alpha \cdot \Delta T = 30 \times 10^6 \times 6.5 \times 10^{-6} \times \Delta T = 195\,\Delta T \;\text{(psi)}" />
      <UnitNote>The constant 195 psi/°F arises from <V tex="E \cdot \alpha = 30 \times 10^6 \times 6.5 \times 10^{-6}" />. It is specific to English units (°F).</UnitNote>
      <SINote>
        <MathSI tex="\sigma_{L,thermal} = E \cdot \alpha \cdot \Delta T = 207{,}000 \times 11.7 \times 10^{-6} \times \Delta T = 1.344\,\Delta T \;\text{(MPa)}" />
        <div style={styles.varDef}>
          <p>where <V tex="E = 207{,}000" /> MPa, <V tex="\alpha = 11.7 \times 10^{-6}" /> /°C, <V tex="\Delta T" /> in °C.</p>
        </div>
      </SINote>

      <h2 style={styles.h2}>7.3 Live Load Bending — Beam on Elastic Foundation</h2>

      <h3 style={styles.h3}>Moment of Inertia</h3>
      <Math tex="I = \frac{\pi}{4}\left(R_{out}^4 - R_{in}^4\right)" />
      <div style={styles.varDef}>
        <p><V tex="R_{out} = D/2" />, &nbsp; <V tex="R_{in} = R_{out} - t" /></p>
      </div>
      <SINote>Dimensionless formula — use consistent length units (all in inches → result in in⁴; all in mm → result in mm⁴).</SINote>

      <h3 style={styles.h3}>Characteristic Parameter (Lambda)</h3>
      <Math tex="\lambda = \left(\frac{E' \cdot D \cdot \Theta / 360}{4\,E\,I}\right)^{0.25}" />
      <div style={styles.varDef}>
        <p><V tex="\Theta" /> = bedding parameter from Table 2-1 (degrees)</p>
      </div>
      <SINote>Dimensionless formula — use consistent units throughout. <V tex="\Theta / 360" /> is a dimensionless fraction of a circle.</SINote>

      <h3 style={styles.h3}>Surface Load on Pipe</h3>
      <Math tex="W_{surf} = \sigma_{bsnq,max} \times \frac{2\pi H^2}{3} \times IF_{depth}" />
      <Math tex="L_{load} = H_{in} \times \tan(29.9°)" />
      <Math tex="P_{pipe} = \frac{W_{surf}}{\pi \cdot L_{load}^2}" />
      <SINote>
        In SI: <V tex="H" /> and <V tex="L_{load}" /> in mm, <V tex="W_{surf}" /> in N, <V tex="P_{pipe}" /> in N/mm². The 29.9° load spread angle is dimensionless.
      </SINote>

      <h3 style={styles.h3}>Moment Distribution</h3>
      <p><strong>For <V tex="|x| \leq L_{load}" /></strong> (within load region):</p>
      <Math tex="M(x) = \frac{P_{pipe}}{4\lambda^3}\,e^{-\lambda|x|}\left[\cos(\lambda|x|) + \sin(\lambda|x|)\right] - \frac{P_{pipe}\,x^2}{2}" />

      <p><strong>For <V tex="|x| > L_{load}" /></strong> (outside load region):</p>
      <Math tex="M(x) = \frac{P_{pipe}}{4\lambda^3}\,e^{-\lambda|x|}\left[\cos(\lambda|x|) + \sin(\lambda|x|)\right] - \frac{P_{pipe}}{4\lambda^3}\,e^{-\lambda(|x|-L)}\left[\cos\!\big(\lambda(|x|-L)\big) + \sin\!\big(\lambda(|x|-L)\big)\right]" />

      <p>The maximum absolute moment <V tex="M_{max}" /> is found by evaluating <V tex="M(x)" /> over the range <V tex="-100 L_{load}" /> to <V tex="+100 L_{load}" />.</p>

      <h3 style={styles.h3}>Bending Stress</h3>
      <Math tex="\sigma_{L,bend} = \frac{M_{max} \cdot (D/2)}{I}" />

      <h2 style={styles.h2}>7.4 Local Bending Component</h2>
      <Math tex="\beta = \left(12\,(1 - \nu^2)\right)^{1/8}" />
      <Math tex="\sigma_{L,local} = \frac{0.153}{1.56} \cdot \beta^4 \cdot \sigma_{hoop,live}" />
      <SINote>These coefficients (0.153, 1.56) are dimensionless empirical constants — identical in any unit system.</SINote>

      <h2 style={styles.h2}>7.5 Total Longitudinal Stress</h2>
      <Math tex="\sigma_{L,live} = \sigma_{L,bend} + \sigma_{L,local}" />
      <Math tex="\sigma_{L,high} = \nu\,\sigma_{hoop,soil} + \sigma_{L,live} + \nu\,\sigma_{hoop,int} + \sigma_{thermal}" />
      <Math tex="\sigma_{L,low} = \nu\,\sigma_{hoop,int} + \sigma_{thermal} - \nu\,\sigma_{hoop,soil} - \sigma_{L,live}" />

      {/* CHAPTER 8 */}
      <h2 style={styles.h1}>8. Equivalent Stress and %SMYS</h2>
      <p>Equivalent stress is computed for all four combinations of (Hoop High/Low) × (Long High/Low):</p>

      <h2 style={styles.h2}>8.1 Tresca Criterion</h2>
      <Math tex="\sigma_{eq} = \max\!\left(|\sigma_H - \sigma_L|,\; \sigma_H,\; \sigma_L\right)" />
      <p>Evaluated for each combination; the maximum across all four is the governing equivalent stress.</p>

      <h2 style={styles.h2}>8.2 Von Mises Criterion</h2>
      <Math tex="\sigma_{eq} = \sqrt{\sigma_H^2 - \sigma_H\,\sigma_L + \sigma_L^2}" />
      <p>Evaluated for each combination; the maximum across all four is the governing equivalent stress.</p>
      <SINote>Both Tresca and Von Mises are dimensionless stress combinations — they work identically in any unit system.</SINote>

      <h2 style={styles.h2}>8.3 Percent SMYS</h2>
      <Math tex="\%\text{SMYS} = \frac{\sigma_{eq,max}}{\text{SMYS}} \times 100" />

      {/* CHAPTER 9 */}
      <h2 style={styles.h1}>9. Pass/Fail Criteria</h2>

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
      <Math tex="\sigma_{L,sustained} = \left|\sigma_{L,int} \pm \sigma_{L,soil} + \sigma_{thermal}\right|" />
      <p>This sustained stress must also remain below the longitudinal limit.</p>

      <h2 style={styles.h2}>9.3 Overall Pass Determination</h2>
      <p>Overall Pass = all of the following must be satisfied:</p>
      <ul>
        <li>Hoop stress ≤ Hoop limit (at both Zero and MOP)</li>
        <li>Longitudinal stress ≤ Long. limit (at both Zero and MOP)</li>
        <li>Equivalent stress ≤ Equiv. limit (at both Zero and MOP)</li>
      </ul>

      {/* CHAPTER 10 */}
      <h2 style={styles.h1}>10. Tire Contact Patch Calculation</h2>
      <p>For 2-Axle and 3-Axle vehicles, the tire contact patch dimensions can be calculated automatically from the axle load and tire inflation pressure.</p>

      <h2 style={styles.h2}>10.1 AUTO Mode Formula</h2>
      <Math tex="\text{Load per tire} = \frac{\text{Axle Load}}{\text{Tires per Axle}}" />
      <Math tex="\text{Contact Area} = \frac{\text{Load per tire}}{\text{Tire Pressure}} \quad (\text{in}^2)" />
      <Math tex="\text{Contact Length} = \frac{\text{Contact Area}}{\text{Tire Width}} \quad (\text{in})" />
      <div style={styles.varDef}>
        <p><strong>Single</strong> configuration: 2 tires/axle (1 per side)</p>
        <p><strong>Dual</strong> configuration: 4 tires/axle (2 per side), contact width per side = tire width × 2</p>
      </div>
      <SINote>These formulas are dimensionless — use consistent units (all in mm and N, or all in inches and lb). The result will be in the same length/area units.</SINote>

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
      <h2 style={styles.h1}>11. Minimum Bend Radius</h2>
      <p>An optional analysis that calculates the tightest horizontal or vertical curve the pipeline can tolerate given the remaining longitudinal stress margin.</p>

      <h2 style={styles.h2}>11.1 Formula</h2>
      <Math tex="R_{min} = \frac{E \cdot D}{2\,\sigma_{remaining}}" />
      <div style={styles.varDef}>
        <p><V tex="\sigma_{remaining} = \sigma_{allowable} - |\sigma_{L,existing}|" /></p>
        <p><V tex="E = 30 \times 10^6" /> psi (207 GPa)</p>
        <p><V tex="D" /> = pipe outside diameter: inches (mm)</p>
      </div>
      <SINote>
        <MathSI tex="R_{min} = \frac{E \cdot D}{2\,\sigma_{remaining}} \quad \text{(mm)}" />
        <div style={styles.varDef}>
          <p>With <V tex="E = 207{,}000" /> MPa and <V tex="D" /> in mm, <V tex="\sigma_{remaining}" /> in MPa → result in mm. Divide by 1000 for metres.</p>
        </div>
      </SINote>

      <h2 style={styles.h2}>11.2 Governing Condition</h2>
      <p>The bend radius is evaluated at both Zero Pressure and MOP conditions. The governing (most restrictive) case is the one with the <strong>smallest remaining margin</strong>. If the remaining margin is ≤ 0, no bend is permissible.</p>

      {/* CHAPTER 12 */}
      <h2 style={styles.h1}>12. Unit Conversions</h2>
      <p>All internal calculations are performed in English (Imperial) units. The following conversion factors are applied when converting between SI and English systems:</p>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Quantity</th><th style={styles.th}>SI</th><th style={styles.th}>EN</th><th style={styles.th}>Factor (SI → EN)</th></tr></thead>
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
        <thead><tr><th style={styles.th}>Constant</th><th style={styles.th}>EN Value</th><th style={styles.th}>SI Value</th><th style={styles.th}>Usage</th></tr></thead>
        <tbody>
          <tr><td style={styles.tdLeft}><V tex="E_{steel}" /></td><td style={styles.td}>30,000,000 psi</td><td style={styles.td}>207 GPa</td><td style={styles.tdLeft}>All stress calculations</td></tr>
          <tr><td style={styles.tdLeft}>Poisson's ratio (<V tex="\nu" />)</td><td style={styles.td} colSpan={2}>0.3 (dimensionless)</td><td style={styles.tdLeft}>Longitudinal Poisson effect, local bending</td></tr>
          <tr><td style={styles.tdLeft}>Thermal expansion (<V tex="\alpha" />)</td><td style={styles.td}>6.5 × 10⁻⁶ /°F</td><td style={styles.td}>11.7 × 10⁻⁶ /°C</td><td style={styles.tdLeft}>Thermal longitudinal stress</td></tr>
          <tr><td style={styles.tdLeft}><V tex="E \cdot \alpha" /></td><td style={styles.td}>195 psi/°F</td><td style={styles.td}>1.344 MPa/°C</td><td style={styles.tdLeft}>Thermal stress shortcut</td></tr>
          <tr><td style={styles.tdLeft}>Boussinesq grid spacing</td><td style={styles.td}>6 inches</td><td style={styles.td}>152 mm</td><td style={styles.tdLeft}>Contact patch discretization</td></tr>
          <tr><td style={styles.tdLeft}>Pipe scan step</td><td style={styles.td}>3 inches</td><td style={styles.td}>76 mm</td><td style={styles.tdLeft}>Peak pressure detection</td></tr>
          <tr><td style={styles.tdLeft}>Depth reduction threshold</td><td style={styles.td}>60 inches (5 ft)</td><td style={styles.td}>1.52 m</td><td style={styles.tdLeft}>Impact factor depth adjustment</td></tr>
          <tr><td style={styles.tdLeft}>Depth reduction rate</td><td style={styles.td}>0.0025 /in</td><td style={styles.td}>0.0984 /m</td><td style={styles.tdLeft}>Impact factor slope</td></tr>
          <tr><td style={styles.tdLeft}>Load spread angle</td><td style={styles.td} colSpan={2}>29.9° (dimensionless)</td><td style={styles.tdLeft}>Load length for bending moment</td></tr>
        </tbody>
      </table>

      <h2 style={styles.h2}>12.2 Unit-Dependent Constants in Formulas</h2>
      <p>The following constants appear in the EN formulas and are purely unit-conversion factors (not empirical):</p>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Constant</th><th style={styles.th}>Origin</th><th style={styles.th}>Purpose</th><th style={styles.th}>SI Equivalent</th></tr></thead>
        <tbody>
          <tr><td style={styles.td}>144</td><td style={styles.td}>12² = 144</td><td style={styles.tdLeft}>Converts ft² → in² (psf → psi)</td><td style={styles.td}>Not needed in SI</td></tr>
          <tr><td style={styles.td}>1728</td><td style={styles.td}>12³ = 1,728</td><td style={styles.tdLeft}>Converts ft³ → in³ (pcf → pci)</td><td style={styles.td}>Not needed in SI</td></tr>
          <tr><td style={styles.td}>12</td><td style={styles.td}>12 in/ft</td><td style={styles.tdLeft}>Converts ft → in</td><td style={styles.td}>Not needed in SI</td></tr>
          <tr><td style={styles.td}>195</td><td style={styles.td}><V tex="E \cdot \alpha" /></td><td style={styles.tdLeft}>Thermal stress (psi/°F)</td><td style={styles.td}>1.344 MPa/°C</td></tr>
        </tbody>
      </table>

      {/* APPENDIX A */}
      <h2 style={styles.h1}>Appendix A: Worked Example — Track Vehicle</h2>
      <p>This example follows CEPA Manual Example 2.</p>

      <h2 style={styles.h2}>A.1 Input Data</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Parameter</th><th style={styles.th}>EN Value</th><th style={styles.th}>SI Value</th></tr></thead>
        <tbody>
          {[
            ['Pipe OD (D)', '12.75 in (NPS 12)', '323.9 mm'],
            ['Wall Thickness (t)', '0.250 in', '6.35 mm'],
            ['MOP', '0 psi (unpressurized)', '0 kPa'],
            ['SMYS', '52,000 psi (X52)', '358 MPa'],
            ['ΔT', '0 °F', '0 °C'],
            ['Soil Density (ρ)', '120 lb/ft³', '1,922 kg/m³'],
            ['Depth of Cover (H)', '4 ft', '1.22 m'],
            ['Bedding Angle', '90°', '90°'],
            ['Soil Load Method', 'Prism', '—'],
            ['E\' Method', 'Lookup — Coarse w/ Fines, 90%', '1,000 psi (6,895 kPa)'],
            ['Track Separation', '6 ft', '1.83 m'],
            ['Track Length', '10 ft', '3.05 m'],
            ['Vehicle Weight', '80,000 lb', '36,287 kg'],
            ['Track Width', '24 in', '610 mm'],
            ['Vehicle Class', 'Track', '—'],
            ['Code Check', 'CSA Z662', '—'],
          ].map(([p, v, si], i) => (
            <tr key={i}><td style={styles.tdLeft}>{p}</td><td style={styles.td}>{v}</td><td style={styles.td}>{si}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={styles.h2}>A.2 Step-by-Step Calculations</h2>

      <h3 style={styles.h3}>Step 1: Bedding Parameters</h3>
      <p>Bedding angle = 90° → <V tex="K_b = 0.157" />, <V tex="K_z = 0.096" />, <V tex="\Theta = 105°" /></p>

      <h3 style={styles.h3}>Step 2: E' (Modulus of Soil Reaction)</h3>
      <p>Soil type: Coarse w/ Fines, Compaction: 90%, Depth: 4 ft (1.22 m), range 0–5 ft (0–1.52 m)</p>
      <p>From CEPA Table 2-3: <strong><V tex="E' = 1{,}000" /> psi (6,895 kPa)</strong></p>

      <h3 style={styles.h3}>Step 3: Soil Load (Prism Method)</h3>
      <Math tex="P_{soil} = \frac{120 \times 4}{144} = 3.333 \;\text{psi}" />
      <SINote>
        <V tex="P_{soil} = \frac{1{,}922 \times 9.81 \times 1.22}{1000} = 22.99 \;\text{kPa}" />
      </SINote>

      <h3 style={styles.h3}>Step 4: Boussinesq Surface Pressure</h3>
      <p>Track load per side = 80,000 / 2 = 40,000 lb (18,144 kg)</p>
      <p>Track area = 24 in × 120 in = 2,880 in² (1.858 m²)</p>
      <p>Grid: <V tex="n_W = \lceil 24/6 \rceil = 4" />, <V tex="n_L = \lceil 120/6 \rceil = 20" /></p>
      <p>Point load = 40,000 / (4 × 20) = 500 lb per point</p>
      <p>Boussinesq is summed over both tracks at measurement points under the tracks and between the tracks. The maximum value is selected.</p>

      <h3 style={styles.h3}>Step 5: Impact Factor</h3>
      <p>Vehicle class = Track → <V tex="IF_{base} = 1.50" /></p>
      <p><V tex="H_{in} = 48" /> in (1.22 m) ≤ 60 in (1.52 m) → no depth reduction → <V tex="IF_{depth} = 1.50" /></p>

      <h3 style={styles.h3}>Step 6: Hoop Stress</h3>
      <Math tex="\text{Denom} = 1 + 3 \times 0.096 \times \frac{0}{30 \times 10^6} \times \left(\frac{12.75}{0.25}\right)^3 + 0.0915 \times \frac{1000}{30 \times 10^6} \times \left(\frac{12.75}{0.25}\right)^3" />
      <p><V tex="\sigma_{hoop,soil}" /> and <V tex="\sigma_{hoop,live}" /> calculated using Spangler formula.</p>

      <h3 style={styles.h3}>Step 7: Longitudinal Stress</h3>
      <p>Thermal component = <V tex="195 \times 0 = 0" /> psi (0 kPa)</p>
      <p>Beam-on-elastic-foundation bending moment computed; local bending added.</p>

      <h3 style={styles.h3}>Step 8: Equivalent Stress (Tresca)</h3>
      <p>All four (Hoop H/L) × (Long H/L) combinations evaluated. Maximum governs.</p>

      <h3 style={styles.h3}>Step 9: Pass/Fail</h3>
      <p>CSA Z662 limit: 90% SMYS = 0.9 × 52,000 = 46,800 psi (322.7 MPa). All stress components compared against this limit.</p>

      {/* APPENDIX B */}
      <h2 style={styles.h1}>Appendix B: Worked Example — 2-Axle Vehicle</h2>

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
      <h2 style={styles.h1}>Appendix C: E' Lookup Table — CEPA Table 2-3</h2>
      <p>Design values of <V tex="E'" /> (Modulus of Soil Reaction) in <strong>psi</strong> with <span style={{ color: '#1565c0' }}>(kPa)</span> equivalents. Organized by soil type, depth range, and degree of compaction.</p>

      <h2 style={styles.h2}>C.1 Fine-Grained Soils</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Depth ft<br /><span style={{ fontSize: 10, fontWeight: 400 }}>(m)</span></th><th style={styles.th}>85%<br /><span style={{ fontSize: 10, fontWeight: 400 }}>psi (kPa)</span></th><th style={styles.th}>90%<br /><span style={{ fontSize: 10, fontWeight: 400 }}>psi (kPa)</span></th><th style={styles.th}>95%<br /><span style={{ fontSize: 10, fontWeight: 400 }}>psi (kPa)</span></th><th style={styles.th}>100%<br /><span style={{ fontSize: 10, fontWeight: 400 }}>psi (kPa)</span></th></tr></thead>
        <tbody>
          <EPrimeRow depth="0–5" depthSI="0–1.5" v85={500} v90={700} v95={1000} v100={1500} />
          <EPrimeRow depth="5–10" depthSI="1.5–3.0" v85={600} v90={1000} v95={1400} v100={2000} />
          <EPrimeRow depth="10–15" depthSI="3.0–4.6" v85={700} v90={1200} v95={1600} v100={2300} />
          <EPrimeRow depth="15–20" depthSI="4.6–6.1" v85={800} v90={1300} v95={1800} v100={2600} />
        </tbody>
      </table>

      <h2 style={styles.h2}>C.2 Coarse-Grained Soils with Fines</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Depth ft<br /><span style={{ fontSize: 10, fontWeight: 400 }}>(m)</span></th><th style={styles.th}>85%<br /><span style={{ fontSize: 10, fontWeight: 400 }}>psi (kPa)</span></th><th style={styles.th}>90%<br /><span style={{ fontSize: 10, fontWeight: 400 }}>psi (kPa)</span></th><th style={styles.th}>95%<br /><span style={{ fontSize: 10, fontWeight: 400 }}>psi (kPa)</span></th><th style={styles.th}>100%<br /><span style={{ fontSize: 10, fontWeight: 400 }}>psi (kPa)</span></th></tr></thead>
        <tbody>
          <EPrimeRow depth="0–5" depthSI="0–1.5" v85={600} v90={1000} v95={1200} v100={1900} />
          <EPrimeRow depth="5–10" depthSI="1.5–3.0" v85={900} v90={1400} v95={1800} v100={2700} />
          <EPrimeRow depth="10–15" depthSI="3.0–4.6" v85={1000} v90={1500} v95={2100} v100={3200} />
          <EPrimeRow depth="15–20" depthSI="4.6–6.1" v85={1100} v90={1600} v95={2400} v100={3700} />
        </tbody>
      </table>

      <h2 style={styles.h2}>C.3 Coarse-Grained Soils without Fines</h2>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Depth ft<br /><span style={{ fontSize: 10, fontWeight: 400 }}>(m)</span></th><th style={styles.th}>85%<br /><span style={{ fontSize: 10, fontWeight: 400 }}>psi (kPa)</span></th><th style={styles.th}>90%<br /><span style={{ fontSize: 10, fontWeight: 400 }}>psi (kPa)</span></th><th style={styles.th}>95%<br /><span style={{ fontSize: 10, fontWeight: 400 }}>psi (kPa)</span></th><th style={styles.th}>100%<br /><span style={{ fontSize: 10, fontWeight: 400 }}>psi (kPa)</span></th></tr></thead>
        <tbody>
          <EPrimeRow depth="0–5" depthSI="0–1.5" v85={700} v90={1000} v95={1600} v100={2500} />
          <EPrimeRow depth="5–10" depthSI="1.5–3.0" v85={1000} v90={1500} v95={2200} v100={3300} />
          <EPrimeRow depth="10–15" depthSI="3.0–4.6" v85={1050} v90={1600} v95={2400} v100={3600} />
          <EPrimeRow depth="15–20" depthSI="4.6–6.1" v85={1100} v90={1700} v95={2500} v100={3800} />
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
