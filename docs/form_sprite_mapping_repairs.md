# Form Sprite Mapping Repairs

Date: 2026-05-29

## Files Changed

- `src/lib/assets.ts`

## Repair

Expanded Scorched Silver species IDs now map by ROM species ID instead of display name. This avoids duplicate-name collisions and prevents form entries from borrowing the wrong base species art.

The sprite source for expanded forms is:

```text
https://play.pokemonshowdown.com/sprites/gen5/<form-slug>.png
```

This source was chosen because named form slugs cover Mega, regional, gender, alternate, Rotom-like, Deoxys-like, Arceus/Silvally type, and many modern forms better than National Dex-number-only sprite URLs.

## Covered Groups

- Mega and Primal forms
- Alolan, Galarian, and Hisuian regional forms
- Typhlosion Hisui and Mr. Mime Galar
- Pikachu costume/cap forms
- Unown forms
- Castform weather forms
- Deoxys forms
- Burmy/Wormadam cloaks
- Rotom appliances
- Origin/sky/therian/alternate legendary forms
- Arceus and Silvally type forms
- Vivillon, Flabebe, Floette, Florges, Furfrou, Pumpkaboo, Gourgeist, Minior, and Alcremie form blocks
- Modern forms including Necrozma, Cramorant, Eiscue, Morpeko, Zacian, Zamazenta, Eternatus, Urshifu, Zarude, and Calyrex

## Fallback Policy

1. Use a species-ID-specific modern form sprite when mapped.
2. Use a species-specific base sprite when a custom Scorched Silver form cannot be proven from extracted data.
3. Use the neutral panel only if the external image itself fails to load.

## Validation

- Typecheck passes after the mapping repair.
- The previous blanket `dexNumber >= 906` placeholder path has been removed.
- Expanded species still route by species ID, so duplicate display names do not collapse.
