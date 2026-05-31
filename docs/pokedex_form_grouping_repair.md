# Pokédex Form Grouping Repair

Date: 2026-05-29

## Change

The Pokédex list now shows one base entry per Pokémon name group instead of listing every alternate form as a full top-level Pokédex row.

## Implementation

- `src/lib/data/pokemon.ts` now exposes `getPokedexListPokemon()` and `getPokemonFormGroup()`.
- `src/app/pokemon/page.tsx` uses `getPokedexListPokemon()` instead of `getAllPokemon()`.
- Pokémon detail pages keep direct species-ID routes working, but show a form selector near the top when a Pokémon has alternate forms.

## Data Integrity

- Frontend species records remain separate internally.
- Direct URLs for form IDs still work.
- Each form keeps its own stats, types, abilities, learnsets, evolutions, TM/HM compatibility, and encounter/location data.

## Counts

- Frontend species records: 1,237.
- Top-level Pokédex list entries after grouping: 905.
- Form groups with more than one entry: 164.

## Rendered Validation

- `/pokemon` returned HTTP 200.
- `/pokemon/157-typhlosion` shows a form selector with Typhlosion, Typhlosion (Hisui), Typhlosion (Scorched Form), and Typhlosion (Ascended Form).
- `/pokemon/334-altaria` shows Altaria and Mega Altaria as selectable forms.
- Direct form routes such as `/pokemon/1234-typhlosion` and `/pokemon/938-altaria` still return HTTP 200.
