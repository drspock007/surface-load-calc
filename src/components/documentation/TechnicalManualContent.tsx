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
};

/* Display math block with orange left border */
const Math = ({ tex }: { tex: string }) => {
  const html = katex.renderToString(tex, { displayMode: true, throwOnError: false, trust: true });
  return <div style={styles.formulaBlock} dangerouslySetInnerHTML={{ __html: html }} />;
};

/* Inline math for variable references */
const V = ({ tex }: { tex: string }) => {
  const html = katex.renderToString(tex, { displayMode: false, throwOnError: false, trust: true });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

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
          <tr><td style={styles.tdLeft}>Young's Modulus of Steel</td><td style={styles.td}><V tex="E" /></td><td style={styles.td}>30,000,000 psi (207 GPa)</td></tr>
          <tr><td style={styles.tdLeft}>Poisson's Ratio</td><td style={styles.td}><V tex="\nu" /></td><td style={styles.td}>0.3</td></tr>
          <tr><td style={styles.tdLeft}>Thermal Expansion Coefficient</td><td style={styles.td}><V tex="\alpha" /></td><td style={styles.td}>6.5 × 10⁻⁶ /°F (11.7 × 10⁻⁶ /°C)</td></tr>
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
            ['Soil Cohesion', 'c', 'psi', 'psi'],
            ['Coeff. of Lateral Earth Pressure', 'K_r', '—', '—'],
          ].map(([p, s, e, si], i) => (
            <tr key={i}><td style={styles.tdLeft}>{p}</td><td style={styles.td}>{s}</td><td style={styles.td}>{e}</td><td style={styles.td}>{si}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={styles.h2}>2.4 E' — Modulus of Soil Reaction</h2>
      <p><V tex="E'" /> can be determined via direct lookup from CEPA Table 2-3 (based on soil type, compaction level, and depth range) or entered as a user-defined value. The complete lookup table is reproduced in <strong>Appendix C</strong>.</p>

      {/* CHAPTER 3 */}
      <h1 style={styles.h1}>3. Soil Load Calculation</h1>
      <p>Two methods are available for computing the earth pressure acting on the pipe crown.</p>

      <h2 style={styles.h2}>3.1 Prism Method</h2>
      <p>Assumes the full column of soil directly above the pipe transfers its weight:</p>
      <Math tex="P_{soil} = \frac{\rho \times H}{144} \quad \text{(psi)}" />
      <div style={styles.varDef}>
        <p>where <V tex="\rho" /> = soil unit weight (lb/ft³), <V tex="H" /> = depth of cover (ft)</p>
        <p>Division by 144 converts psf to psi.</p>
      </div>

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

      {/* CHAPTER 4 */}
      <h1 style={styles.h1}>4. Boussinesq Surface Pressure</h1>
      <p>Surface loads are transferred to pipe depth using Boussinesq elastic half-space theory. Each vehicle contact patch is discretized into a grid of point loads, and the vertical stress at each measurement point is computed as the superposition of all point load contributions.</p>

      <h2 style={styles.h2}>4.1 Point Load Formula</h2>
      <Math tex="\sigma_z = \frac{3P}{2\pi H^2 \left(1 + \left(\dfrac{R}{H}\right)^2\right)^{2.5}}" />
      <div style={styles.varDef}>
        <p><V tex="P" /> = point load (lb)</p>
        <p><V tex="H" /> = depth of cover (inches)</p>
        <p><V tex="R" /> = horizontal distance from point load to measurement point (inches)</p>
        <p><V tex="R = \sqrt{\Delta x^2 + \Delta y^2}" /></p>
      </div>

      <h2 style={styles.h2}>4.2 Grid Discretization</h2>
      <p>Each rectangular contact patch is divided into a uniform grid with <strong>6-inch spacing</strong>. The number of grid cells:</p>
      <Math tex="n_W = \lceil W / 6 \rceil, \quad n_L = \lceil L / 6 \rceil" />
      <Math tex="\text{Point load} = \frac{\text{Total patch load}}{n_W \times n_L}" />

      <h2 style={styles.h2}>4.3 Vehicle-Specific Patch Layouts</h2>

      <h3 style={styles.h3}>Track Vehicle</h3>
      <p>Two rectangular patches centered at <V tex="\pm(\text{separation}/2)" /> from the vehicle centerline. Each track carries half the total vehicle weight.</p>

      <h3 style={styles.h3}>2-Axle / 3-Axle Vehicles</h3>
      <p>Each axle has two tire patches (left and right) positioned at <V tex="\pm(\text{axleWidth}/2)" /> from the lane offset. For <strong>Single</strong> tire configuration (2 tires/axle), each side uses the tire width. For <strong>Dual</strong> configuration (4 tires/axle), each side uses tire width × 2. Each left/right patch receives half the axle load.</p>

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
        <thead><tr><th style={styles.th}>Vehicle Class</th><th style={styles.th}>Pavement Type</th><th style={styles.th}><V tex="IF_{base}" /></th></tr></thead>
        <tbody>
          <tr><td style={styles.td}>Highway</td><td style={styles.td}>Rigid</td><td style={styles.td}>1.00</td></tr>
          <tr><td style={styles.td}>Highway</td><td style={styles.td}>Flexible</td><td style={styles.td}>1.50</td></tr>
          <tr><td style={styles.td}>Farm</td><td style={styles.td}>—</td><td style={styles.td}>1.25</td></tr>
          <tr><td style={styles.td}>Track</td><td style={styles.td}>—</td><td style={styles.td}>1.50</td></tr>
        </tbody>
      </table>

      <h2 style={styles.h2}>5.2 Depth Reduction</h2>
      <p>For burial depths exceeding 60 inches (5 ft), the impact factor is reduced:</p>
      <Math tex="IF_{depth} = IF_{base} - 0.0025 \times (H_{in} - 60), \quad \min = 1.0" />
      <div style={styles.varDef}>
        <p>where <V tex="H_{in}" /> = depth of cover in inches</p>
      </div>

      {/* CHAPTER 6 */}
      <h1 style={styles.h1}>6. Hoop Stress (Spangler Formula)</h1>

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

      <h2 style={styles.h2}>6.2 Spangler Denominator</h2>
      <Math tex="\text{Denom} = 1 + 3\,K_z \cdot \frac{P_{int}}{E} \cdot \left(\frac{D}{t}\right)^3 + 0.0915 \cdot \frac{E'}{E} \cdot \left(\frac{D}{t}\right)^3" />

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
      <h1 style={styles.h1}>7. Longitudinal Stress</h1>
      <p>Total longitudinal stress consists of multiple components:</p>
      <Math tex="\sigma_L = \sigma_{L,bend} + \sigma_{L,local} + \nu\,\sigma_{hoop,soil} \pm \nu\,\sigma_{hoop,int} + E\,\alpha\,\Delta T" />

      <h2 style={styles.h2}>7.1 Poisson Component</h2>
      <Math tex="\sigma_{L,Poisson,soil} = \nu \cdot \sigma_{hoop,soil}" />
      <Math tex="\sigma_{L,Poisson,int} = \nu \cdot \sigma_{hoop,int} = \nu \cdot \frac{P \cdot D}{2\,t}" />

      <h2 style={styles.h2}>7.2 Thermal Component</h2>
      <Math tex="\sigma_{L,thermal} = E \cdot \alpha \cdot \Delta T = 30 \times 10^6 \times 6.5 \times 10^{-6} \times \Delta T = 195\,\Delta T \;\text{(psi)}" />

      <h2 style={styles.h2}>7.3 Live Load Bending — Beam on Elastic Foundation</h2>

      <h3 style={styles.h3}>Moment of Inertia</h3>
      <Math tex="I = \frac{\pi}{4}\left(R_{out}^4 - R_{in}^4\right)" />
      <div style={styles.varDef}>
        <p><V tex="R_{out} = D/2" />, &nbsp; <V tex="R_{in} = R_{out} - t" /></p>
      </div>

      <h3 style={styles.h3}>Characteristic Parameter (Lambda)</h3>
      <Math tex="\lambda = \left(\frac{E' \cdot D \cdot \Theta / 360}{4\,E\,I}\right)^{0.25}" />
      <div style={styles.varDef}>
        <p><V tex="\Theta" /> = bedding parameter from Table 2-1 (degrees)</p>
      </div>

      <h3 style={styles.h3}>Surface Load on Pipe</h3>
      <Math tex="W_{surf} = \sigma_{bsnq,max} \times \frac{2\pi H^2}{3} \times IF_{depth}" />
      <Math tex="L_{load} = H_{in} \times \tan(29.9°)" />
      <Math tex="P_{pipe} = \frac{W_{surf}}{\pi \cdot L_{load}^2}" />

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

      <h2 style={styles.h2}>7.5 Total Longitudinal Stress</h2>
      <Math tex="\sigma_{L,live} = \sigma_{L,bend} + \sigma_{L,local}" />
      <Math tex="\sigma_{L,high} = \nu\,\sigma_{hoop,soil} + \sigma_{L,live} + \nu\,\sigma_{hoop,int} + \sigma_{thermal}" />
      <Math tex="\sigma_{L,low} = \nu\,\sigma_{hoop,int} + \sigma_{thermal} - \nu\,\sigma_{hoop,soil} - \sigma_{L,live}" />

      {/* CHAPTER 8 */}
      <h1 style={styles.h1}>8. Equivalent Stress and %SMYS</h1>
      <p>Equivalent stress is computed for all four combinations of (Hoop High/Low) × (Long High/Low):</p>

      <h2 style={styles.h2}>8.1 Tresca Criterion</h2>
      <Math tex="\sigma_{eq} = \max\!\left(|\sigma_H - \sigma_L|,\; \sigma_H,\; \sigma_L\right)" />
      <p>Evaluated for each combination; the maximum across all four is the governing equivalent stress.</p>

      <h2 style={styles.h2}>8.2 Von Mises Criterion</h2>
      <Math tex="\sigma_{eq} = \sqrt{\sigma_H^2 - \sigma_H\,\sigma_L + \sigma_L^2}" />
      <p>Evaluated for each combination; the maximum across all four is the governing equivalent stress.</p>

      <h2 style={styles.h2}>8.3 Percent SMYS</h2>
      <Math tex="\%\text{SMYS} = \frac{\sigma_{eq,max}}{\text{SMYS}} \times 100" />

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
      <h1 style={styles.h1}>10. Tire Contact Patch Calculation</h1>
      <p>For 2-Axle and 3-Axle vehicles, the tire contact patch dimensions can be calculated automatically from the axle load and tire inflation pressure.</p>

      <h2 style={styles.h2}>10.1 AUTO Mode Formula</h2>
      <Math tex="\text{Load per tire} = \frac{\text{Axle Load}}{\text{Tires per Axle}}" />
      <Math tex="\text{Contact Area} = \frac{\text{Load per tire}}{\text{Tire Pressure}} \quad (\text{in}^2)" />
      <Math tex="\text{Contact Length} = \frac{\text{Contact Area}}{\text{Tire Width}} \quad (\text{in})" />
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
      <Math tex="R_{min} = \frac{E \cdot D}{2\,\sigma_{remaining}}" />
      <div style={styles.varDef}>
        <p><V tex="\sigma_{remaining} = \sigma_{allowable} - |\sigma_{L,existing}|" /></p>
        <p><V tex="E = 30 \times 10^6" /> psi</p>
        <p><V tex="D" /> = pipe outside diameter (inches)</p>
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
          <tr><td style={styles.tdLeft}><V tex="E_{steel}" /></td><td style={styles.td}>30,000,000 psi</td><td style={styles.td}>All stress calculations</td></tr>
          <tr><td style={styles.tdLeft}>Poisson's ratio (<V tex="\nu" />)</td><td style={styles.td}>0.3</td><td style={styles.td}>Longitudinal Poisson effect, local bending</td></tr>
          <tr><td style={styles.tdLeft}>Thermal expansion (<V tex="\alpha" />)</td><td style={styles.td}>6.5 × 10⁻⁶ /°F</td><td style={styles.td}>Thermal longitudinal stress</td></tr>
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
      <p>Bedding angle = 90° → <V tex="K_b = 0.157" />, <V tex="K_z = 0.096" />, <V tex="\Theta = 105°" /></p>

      <h3 style={styles.h3}>Step 2: E' (Modulus of Soil Reaction)</h3>
      <p>Soil type: Coarse w/ Fines, Compaction: 90%, Depth: 4 ft (range 0–5 ft)</p>
      <p>From CEPA Table 2-3: <strong><V tex="E' = 1{,}000" /> psi</strong></p>

      <h3 style={styles.h3}>Step 3: Soil Load (Prism Method)</h3>
      <Math tex="P_{soil} = \frac{120 \times 4}{144} = 3.333 \;\text{psi}" />

      <h3 style={styles.h3}>Step 4: Boussinesq Surface Pressure</h3>
      <p>Track load per side = 80,000 / 2 = 40,000 lb</p>
      <p>Track area = 24 in × 120 in = 2,880 in²</p>
      <p>Grid: <V tex="n_W = \lceil 24/6 \rceil = 4" />, <V tex="n_L = \lceil 120/6 \rceil = 20" /></p>
      <p>Point load = 40,000 / (4 × 20) = 500 lb per point</p>
      <p>Boussinesq is summed over both tracks at measurement points under the tracks and between the tracks. The maximum value is selected.</p>

      <h3 style={styles.h3}>Step 5: Impact Factor</h3>
      <p>Vehicle class = Track → <V tex="IF_{base} = 1.50" /></p>
      <p><V tex="H_{in} = 48" /> in ≤ 60 in → no depth reduction → <V tex="IF_{depth} = 1.50" /></p>

      <h3 style={styles.h3}>Step 6: Hoop Stress</h3>
      <Math tex="\text{Denom} = 1 + 3 \times 0.096 \times \frac{0}{30 \times 10^6} \times \left(\frac{12.75}{0.25}\right)^3 + 0.0915 \times \frac{1000}{30 \times 10^6} \times \left(\frac{12.75}{0.25}\right)^3" />
      <p><V tex="\sigma_{hoop,soil}" /> and <V tex="\sigma_{hoop,live}" /> calculated using Spangler formula.</p>

      <h3 style={styles.h3}>Step 7: Longitudinal Stress</h3>
      <p>Thermal component = <V tex="30 \times 10^6 \times 6.5 \times 10^{-6} \times 0 = 0" /> psi</p>
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
      <p>Design values of <V tex="E'" /> (Modulus of Soil Reaction) in psi, organized by soil type, depth range, and degree of compaction.</p>

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
