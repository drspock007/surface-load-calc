## Header Redesign

Update `src/components/Layout.tsx` to a two-column header matching the Giovanni Malagnino Consulting style:

- **Left column (50%)**: existing logo (linked to giovannimalagninoconsulting.com), larger size to match the reference.
- **Right column (50%)**: three stacked lines of text — "Engineering", "Consulting", "Project management" — left-aligned on desktop, centered on tablet/mobile, using the site's foreground color.

Navigation (Home / Calculator / Sensitivity / History / Manual) moves to a second row below the two-column band, keeping the current active-state styling and the orange primary token. No routing or business logic changes.

### Technical notes
- Single file edit: `src/components/Layout.tsx`.
- Use Tailwind grid (`grid-cols-1 md:grid-cols-2`) for the top band; `text-left md:text-left text-center` responsive alignment on the right column.
- Keep semantic `<header>`, `<nav>`, and existing `Link` components; no new dependencies.
