import React from 'react';

// Styles kept in sync with TechnicalManualContent so the section renders identically in the PDF
const h2: React.CSSProperties = { fontSize: 17, fontWeight: 700, marginTop: 24, marginBottom: 8 };
const h3: React.CSSProperties = { fontSize: 15, fontWeight: 700, marginTop: 16, marginBottom: 6 };
const table: React.CSSProperties = { borderCollapse: 'collapse', width: '100%', margin: '12px 0', fontSize: 13 };
const th: React.CSSProperties = { border: '1px solid #333', padding: '6px 10px', background: '#222', color: '#fff', fontWeight: 600, textAlign: 'center' };
const td: React.CSSProperties = { border: '1px solid #999', padding: '5px 10px', textAlign: 'center' };
const tdLeft: React.CSSProperties = { border: '1px solid #999', padding: '5px 10px', textAlign: 'left' };
const note: React.CSSProperties = { background: '#fffbe6', border: '1px solid #e6d600', padding: '8px 12px', margin: '8px 0', fontSize: 12 };

/** Comparison table rows: parameter, steel behaviour, PE behaviour */
const COMPARISON: [string, string, string][] = [
  ['Governing standard', 'CSA Z245.1 (Canada), API 5L / ASME B36.10', 'CSA B137.4 (gas), ASTM D2513'],
  ['Structural behaviour', 'Rigid to semi-rigid: carries load mainly in the pipe wall', 'Flexible: transfers load to the surrounding soil by deflecting'],
  ['Sizing convention', 'NPS + schedule (STD, Sch 40, Sch 80…)', 'Nominal size + DR (D/t), IPS or CTS series'],
  ['Strength parameter', 'SMYS (241–550 MPa depending on grade)', 'HDB at 23 °C (e.g. PE2708 = 8.62 MPa, PE4710 = 11.0 MPa)'],
  ['Elastic modulus', 'E = 207 GPa, constant', 'Time dependent: short term ≈ 800 MPa, long term ≈ 150 MPa'],
  ['Temperature effect', 'Thermal expansion stress (α·ΔT·E)', 'De-rating factor Ft applied to allowable pressure'],
  ['Governing failure mode', 'Yielding (hoop, longitudinal, equivalent stress)', 'Excessive ring deflection, wall strain, buckling'],
  ['Acceptance criterion', '% SMYS limits per ASME B31.4 / B31.8 / CSA Z662', 'Deflection ≤ 5% D, strain ≤ 5%, MOP ≤ Pallow, P ≤ Pcr/2'],
  ['Typical service', 'Transmission lines, high pressure', 'Distribution mains and services, low pressure'],
];

export const MaterialSelectionSection = () => (
  <>
    <h2 style={h2}>1.5 Pipe Material Selection — Steel vs Polyethylene</h2>
    <p>
      The calculator supports two pipe materials, selected with the <strong>Pipe Material</strong> control at the top
      of every analysis form. The surface load model (soil load, Boussinesq pressure distribution, impact factor) is
      <strong> identical for both materials</strong>; only the pipe response and the acceptance criteria differ,
      because a steel pipe behaves as a rigid conduit while a polyethylene pipe behaves as a flexible conduit that
      relies on the surrounding soil for its load capacity.
    </p>

    <h3 style={h3}>1.5.1 Steel (CSA Z245.1 / API 5L)</h3>
    <p>
      Steel pipe is analysed with the classical CEPA methodology described in Sections 3 to 11: circumferential
      (hoop) bending from the Spangler formula, longitudinal stress from bending and thermal effects, and the
      Tresca equivalent stress, all expressed as a percentage of SMYS. Grades are designated X42 to X80 in API 5L
      and by their yield strength in MPa in CSA Z245.1 (CSA 290 to CSA 550); both designations describe the same
      material and are shown side by side in the grade selector.
    </p>

    <h3 style={h3}>1.5.2 Polyethylene (CSA B137.4)</h3>
    <p>
      Polyethylene pipe cannot be assessed against a yield strength: it is a visco-elastic material whose modulus
      decreases with time under sustained load. It is therefore verified with flexible-pipe design checks —
      ring deflection (modified Iowa formula), wall bending strain, allowable internal pressure derived from the
      hydrostatic design basis, and constrained buckling. Sizing uses the dimension ratio DR = D/t rather than a
      pipe schedule. The complete formulation is given in Section 13.
    </p>

    <h3 style={h3}>1.5.3 Side-by-Side Comparison</h3>
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>Characteristic</th>
          <th style={th}>Steel</th>
          <th style={th}>Polyethylene (PE)</th>
        </tr>
      </thead>
      <tbody>
        {COMPARISON.map(([param, steel, pe], i) => (
          <tr key={i}>
            <td style={tdLeft}>{param}</td>
            <td style={tdLeft}>{steel}</td>
            <td style={tdLeft}>{pe}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <h3 style={h3}>1.5.4 What Changes in the Application</h3>
    <table style={table}>
      <thead>
        <tr><th style={th}>Item</th><th style={th}>Steel selected</th><th style={th}>PE selected</th></tr>
      </thead>
      <tbody>
        <tr><td style={tdLeft}>Pipe inputs</td><td style={td}>NPS, schedule, grade, SMYS</td><td style={td}>Nominal size, DR, resin, HDB</td></tr>
        <tr><td style={tdLeft}>Optional inputs</td><td style={td}>ΔT, code selection</td><td style={td}>HDB override, moduli, deflection/strain limits, temperature</td></tr>
        <tr><td style={tdLeft}>Results shown</td><td style={td}>Hoop, longitudinal, equivalent stress, % SMYS</td><td style={td}>Deflection, strain, allowable pressure, buckling</td></tr>
        <tr><td style={tdLeft}>Common results</td><td style={td} colSpan={2}>Soil load, surface pressure, impact factor, max pressure location</td></tr>
      </tbody>
    </table>

    <div style={note}>
      <strong>Implementation note:</strong> when the material is switched, the pipe dimensions are reset to the
      default preset of that material (NPS 4" STD API 5L X52 for steel, the equivalent CSA B137.4 size for PE) to
      avoid carrying over inconsistent geometry. All other inputs (depth, soil, vehicle) are preserved.
    </div>
  </>
);
