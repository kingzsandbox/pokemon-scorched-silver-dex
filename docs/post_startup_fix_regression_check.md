# Post Startup Fix Regression Check

Date: 2026-05-29

## Sentinel Data

Checked frontend-facing core datasets.

| Dataset | Count | Blank/sentinel count |
|---|---:|---:|
| Pokémon | 1237 | 0 |
| Moves | 813 | 0 |
| Items | 757 | 0 |
| Abilities | 267 | 0 |

## Machines

Checked `public/data/machines.json`.

| Kind | Count |
|---|---:|
| TM | 50 |
| HM | 8 |
| MT | 34 |

TM entries above TM50: `0`.

## Old XY Data

Searched active source files for references to:

- `xy-quarantined`
- `pokemon-workbook`
- `trainers-workbook`
- `item-obtain-vanilla-fallback`
- `vanilla-pokemon-reference`
- `vanilla-move-reference`

Result: no active source references found.

## Enriched Data Wiring

Confirmed package scripts no longer reference deleted wrapper files.

Confirmed active source references remain for Scorched Silver data paths including:

- `scorched-acquisition-index.json`
- `scorched-move-tutors-enriched.json`
- `move-compatibility.json`
- `machines.json`

## Conclusion

The startup fix did not regress the prior QA repairs. The app still excludes sentinel records, does not expose TM51-TM100 as valid machines, avoids active old XY gameplay imports, and keeps enriched acquisition/tutor data wired into the frontend.
