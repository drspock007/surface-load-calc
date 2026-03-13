

# Fix: Base Case info box is unreadable (black background)

## Problem
The "Base Case" info box at line 230 uses `bg-secondary` which is now black (`0 0% 10%`) after the color palette update. The text inside is also dark, making it completely unreadable.

## Fix
Replace `bg-secondary` with `bg-muted` (a lighter gray) on the base case info div, and ensure the text uses appropriate foreground colors.

| File | Change |
|------|--------|
| `src/pages/Sensitivity.tsx` line 230 | Change `bg-secondary` to `bg-muted` |

This is a one-line class change, no logic or structure affected.

