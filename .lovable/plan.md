

# Beautiful Formula Rendering with KaTeX

## Problem

Currently, all formulas in the Technical Reference Manual are rendered as plain monospace text inside `<code>` blocks. This looks utilitarian but not professional -- far from textbook quality.

## Solution

Integrate **KaTeX**, a lightweight LaTeX math renderer, to display all formulas with proper mathematical typesetting (fractions, superscripts, subscripts, Greek letters, square roots, etc.) -- exactly like in a printed engineering textbook.

### Example: Before vs After

**Before (current):**
```
P_soil = (DenCoTerm × D) / (2 × K_a) × (1 − e^(−2 × K_a × H_in / D))
```

**After (with KaTeX):**
Properly typeset with real fraction bars, italic variables, upright operators, and proper exponent positioning -- similar to what you'd see in a published technical manual.

## Technical Approach

### Step 1: Install KaTeX

Add `katex` as a dependency (lightweight, ~300KB, no server needed, renders client-side).

### Step 2: Create a reusable `<Math>` component

Replace the current `<F>` (formula) component with a new `<Math>` component that:
- Accepts a LaTeX string (e.g., `P_{soil} = \frac{\rho \times H}{144}`)
- Renders it via `katex.renderToString()` into beautiful HTML
- Supports both inline math and display (block) math
- Keeps the orange left border styling for visual consistency

### Step 3: Convert all formulas to LaTeX notation

Go through every formula in `TechnicalManualContent.tsx` and convert from plain text to LaTeX. Examples:

| Current | LaTeX |
|---------|-------|
| `P_soil = ρ × H / 144` | `P_{soil} = \frac{\rho \times H}{144}` |
| `σ_z = (3P) / (2π H² × ...)` | `\sigma_z = \frac{3P}{2\pi H^2 \left(1 + \left(\frac{R}{H}\right)^2\right)^{2.5}}` |
| `I = (π/4) × (R_out⁴ − R_in⁴)` | `I = \frac{\pi}{4}\left(R_{out}^4 - R_{in}^4\right)` |
| `λ = ((E' × D × Θ / 360) / (4EI))^0.25` | `\lambda = \left(\frac{E' \cdot D \cdot \Theta / 360}{4EI}\right)^{0.25}` |

### Step 4: Update the `<Var>` component

The inline variable references (e.g., "where P = point load") will also use KaTeX inline mode for consistent styling.

## Files

| File | Change |
|------|--------|
| `package.json` | Add `katex` dependency |
| `src/components/documentation/TechnicalManualContent.tsx` | Replace `<F>` with `<Math>`, convert all ~40 formulas to LaTeX notation |

## Notes

- KaTeX renders to static HTML, so it works perfectly with `react-to-pdf` (no canvas or JS needed at render time)
- The orange left-border accent on formula blocks will be preserved
- All variable definition blocks below formulas remain unchanged
- No impact on any other part of the application

