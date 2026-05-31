# Pokémon Form Detail UX Repair

Date: 2026-05-29

## Change

Pokémon detail pages now show a form selector when multiple form records exist for the same Pokémon name group.

## Behavior

- The current form is highlighted.
- Each form selector entry links to the form's existing species-ID route.
- Switching form updates the entire detail page because each form route loads its own record.
- Form-specific stats, typing, abilities, learnsets, evolutions, TM/HM compatibility, move tutor compatibility, and encounters remain intact.

## Validated Form Groups

- Typhlosion: 157, 997, 1234, 1237.
- Slowbro: 80, 913, 978.
- Mr. Mime: 122, 981.
- Altaria: 334, 938.
- Lucario: 448, 948.

## Rendered Validation

The form selector rendered on the checked Pokémon pages and the active form route returned HTTP 200.
