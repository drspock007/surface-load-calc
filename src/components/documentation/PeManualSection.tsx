import React from 'react';
import katex from 'katex';

// Local styles kept in sync with TechnicalManualContent to render inside the same PDF
const h1: React.CSSProperties = { fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, borderBottom: '2px solid #ff8e04', paddingBottom: 6 };
const h2: React.CSSProperties = { fontSize: 15, fontWeight: 600, marginTop: 20, marginBottom: 8 };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 8, marginBottom: 12 };
const th: React.CSSProperties = { border: '1px solid #999', padding: '6px 8px', background: '#f2f2f2', textAlign: 'center' };
const td: React.CSSProperties = { border: '1px solid #999', padding: '6px 8px', textAlign: 'center' };
const tdLeft: React.CSSProperties = { border: '1px solid #999', padding: '6px 8px', textAlign: 'left' };

const Eq = ({ tex }: { tex: string }) => (
  <div dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: true, throwOnError: false, trust: true }) }} />
);
const V = ({ tex }: { tex: string }) => (
  <span dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { displayMode: false, throwOnError: false, trust: true }) }} />
);

export const PeManualSection = () => (
  <>
    <h2 style={h1}>13. Polyethylene Pipe Checks (CSA B137.4)</h2>
    <p>
      When the pipe material is set to polyethylene, the soil load and Boussinesq surface pressure are computed
      exactly as for steel, but the pipe response is evaluated with flexible-pipe design checks instead of the
      Spangler/Tresca stress checks. Four verifications are performed: ring deflection, wall bending strain,
      internal pressure capacity and constrained buckling.
    </p>

    <h2 style={h2}>13.1 Ring Deflection — Modified Iowa Formula</h2>
    <p>
      Soil load uses the long-term apparent modulus and the deflection lag factor <V tex="D_L" />; live load uses the
      short-term modulus, per PPI Handbook Chapter 6.
    </p>
    <Eq tex="\Delta y_{soil} = \frac{D_L \, K_b \, W_{soil} \, r^3}{E_{LT} I + 0.061 \, E' r^3}, \qquad \Delta y_{live} = \frac{K_b \, W_{live} \, r^3}{E_{ST} I + 0.061 \, E' r^3}" />
    <Eq tex="I = \frac{t^3}{12}, \qquad r = \frac{D - t}{2}, \qquad W = P \cdot D" />
    <Eq tex="\left(\frac{\Delta y}{D}\right)\% = \frac{\Delta y_{soil} + \Delta y_{live}}{D} \times 100" />

    <h2 style={h2}>13.2 Wall Bending Strain</h2>
    <Eq tex="\varepsilon_b = D_f \cdot \frac{t}{D} \cdot \left(\frac{\Delta y}{D}\right)\%" />
    <p>
      <V tex="D_f" /> is the shape factor depending on bedding quality and pipe stiffness.
    </p>

    <h2 style={h2}>13.3 Allowable Internal Pressure</h2>
    <Eq tex="P_{allow} = \frac{2 \cdot HDB \cdot DF \cdot F_t}{DR - 1}, \qquad DR = \frac{D}{t}" />
    <p>
      <V tex="HDB" /> is the hydrostatic design basis of the resin, <V tex="DF" /> the service design factor and
      <V tex="F_t" /> the temperature de-rating factor. The check compares the MOP with <V tex="P_{allow}" />.
    </p>

    <h2 style={h2}>13.4 Constrained Buckling (AWWA M55 / Luscher)</h2>
    <Eq tex="P_{cr} = 5.65 \sqrt{\frac{R_w B' E' E_{LT} I}{(2r)^3}}, \qquad B' = \frac{1}{1 + 4 e^{-0.213 H}}" />
    <p>
      <V tex="R_w = 1.0" /> (no groundwater assumed) and <V tex="H" /> is the cover depth in feet. The applied
      external pressure <V tex="P_{soil} + P_{live}" /> is compared to <V tex="P_{cr}/2" /> (safety factor of 2).
    </p>

    <h2 style={h2}>13.5 Default Acceptance Limits</h2>
    <table style={table}>
      <thead><tr><th style={th}>Check</th><th style={th}>Default limit</th><th style={th}>Source</th></tr></thead>
      <tbody>
        <tr><td style={tdLeft}>Ring deflection</td><td style={td}>5% of diameter</td><td style={td}>PPI / CSA practice</td></tr>
        <tr><td style={tdLeft}>Wall bending strain</td><td style={td}>5%</td><td style={td}>PE strain limit</td></tr>
        <tr><td style={tdLeft}>Internal pressure</td><td style={td}><V tex="P_{allow}" /></td><td style={td}>CSA B137.4</td></tr>
        <tr><td style={tdLeft}>Buckling</td><td style={td}><V tex="P_{cr}/2" /></td><td style={td}>AWWA M55</td></tr>
      </tbody>
    </table>
  </>
);
