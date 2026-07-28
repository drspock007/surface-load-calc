Add a footer to the app matching the source site https://giovannimalagninoconsulting.com/ footer content and style.

## What to build

Create a new `src/components/Footer.tsx` component and render it inside `src/components/Layout.tsx` at the bottom of the page (after `<main>`, inside the same wrapper so the orange side borders keep going).

## Layout

Three columns on desktop (`grid md:grid-cols-3 gap-8`), stacked and centered on mobile. White background, black text, matching the Habibi/serif tone used in the header slogan for consistency with the source site. Add a top border in muted gray for separation.

### Column 1 — Address Italy
```
Giovanni Malagnino Consulting
Address in Italy:
Via Selva 79
63835 Montappone FM
Italie
+39 392 729 0392
giovanni@giovannimalagninoconsulting.com
```
Email rendered as a `mailto:` link, phone as a `tel:` link.

### Column 2 — Address Canada
```
(blank line for vertical alignment)
Address in Canada:
1395, Rue Fleury Est, Bureau 102.2
Montréal, QC, H2C 1R7
Canada
+1 438 448 0997
```
Phone as `tel:` link.

### Column 3 — Social links (right-aligned on desktop, centered on mobile)
- Facebook → https://www.facebook.com/giovannimalagninoconsulting
- LinkedIn → https://www.linkedin.com/in/giovannimalagnino/

Use `Facebook` and `Linkedin` icons from `lucide-react` in small circular buttons using the primary orange (`bg-primary text-primary-foreground`), opening in a new tab with `rel="noopener noreferrer"` and `aria-label`.

## Technical notes

- Component is a pure presentational function with a header JSDoc comment (per project convention: English, no emoticons).
- Only two files touched: `src/components/Footer.tsx` (new), `src/components/Layout.tsx` (import and render `<Footer />` after `<main>`).
- No changes to routes, business logic, or design tokens.
- Adjust `Layout.tsx` root to `flex flex-col min-h-screen` so the footer sits at the bottom on short pages.
