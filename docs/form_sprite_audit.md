# Form Sprite Audit

Date: 2026-05-29

## Result

- Generic placeholder species before this pass: 332 expanded/form entries.
- Generic placeholder species after this pass: 0 by frontend routing logic.
- Explicit modern form sprite mappings added: 329.
- Species-specific fallback mappings: 3.

## Cause

The previous repair intentionally blocked all species IDs `906+` from using National Dex-number sprite URLs. That prevented wrong duplicate-name sprites, but it also forced every Mega, regional form, alternate form, and custom Scorched Silver variant into a neutral placeholder.

## Placeholder Causes Found

- Sprite unavailable: no local form sprite pack exists in this clean app root.
- Mapping missing: expanded species IDs do not carry form labels in `public/data/pokemon.json`.
- Naming mismatch: duplicate names such as `Typhlosion`, `Mr. Mime`, `Charizard`, and `Pikachu` need species-ID-specific sprite mapping.
- Form resolution failure: the old logic only knew `dexNumber >= 906`, not which form each ID represented.

## Remaining Species-Specific Fallbacks

These entries do not map cleanly to a canonical public form sprite from the extracted data alone, so they use the base species sprite rather than a generic placeholder:

- `1234 Typhlosion`
- `1235 Meganium`
- `1236 Feraligatr`

This is intentional: a base species image is more trustworthy than showing a blank/neutral panel or guessing an undocumented custom form.
