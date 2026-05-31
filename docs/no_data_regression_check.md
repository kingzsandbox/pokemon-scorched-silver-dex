# No Data Regression Check

Date: 2026-05-29

## Commands / Checks Run

### Sentinel Counts

Checked frontend-facing data:

- `public/data/pokemon.json`
- `public/data/abilities.json`
- `public/data/moves.json`
- `public/data/items.json`

Results:

- Pokémon: `1237`, blank/sentinel: `0`
- Abilities: `267`, blank/sentinel: `0`
- Moves: `813`, blank/sentinel: `0`
- Items: `757`, blank/sentinel: `0`

### Machine Counts

Checked `public/data/machines.json`.

Results:

- TM: `50`
- HM: `8`
- MT: `34`
- TM51-TM100 entries: `0`

### Old XY Import/Search Check

Searched `src` for active imports/references to:

- `xy-quarantined`
- `pokemon-workbook`
- `trainers-workbook`
- `item-obtain-vanilla-fallback`
- `vanilla-pokemon-reference`
- `vanilla-move-reference`

Result:

- No active source imports or references found.

### Enriched Acquisition Data

Confirmed source imports exist for:

- `scorched-acquisition-index.json`
- `scorched-move-tutors-enriched.json`
- `move-compatibility.json`
- `machines.json`

Result:

- Scorched Silver acquisition and tutor data remain wired into the frontend data layer.

## Caveats

- Some neutralized legacy JSON files remain in `public/data` as empty arrays, for compatibility with reusable UI code paths.
- They are not active gameplay fallbacks and do not contain XY gameplay records.
- Tutor enriched data preserves script context and caveats. Exact item/cost requirements remain unrecovered where the extracted script evidence did not prove them.

## Conclusion

No regression was found in the targeted checks for sentinel rows, TM51-TM100 display, active XY gameplay imports, or enriched acquisition/tutor data usage.
