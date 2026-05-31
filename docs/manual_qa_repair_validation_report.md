# Manual QA Repair Validation Report

Date: 2026-05-28

## Commands / Checks Run

- `npm run typecheck`: passed
- JSON parse audit across all `public/data/*.json`: passed
- frontend data integrity script: passed
- source stale-path search: passed for active displayed Pokémon/item sprite paths
- `npm run build`: blocked; timed out repeatedly before `.next` was created
- dev server smoke test: blocked; Next dev server started but did not become route-ready before timeout

## Data Integrity Results

| Dataset | Count |
|---|---:|
| `pokemon.json` | 1,237 |
| `moves.json` | 813 |
| `items.json` | 757 |
| `abilities.json` | 267 |
| `locations.json` | 294 |
| `machines.json` | 92 |
| `move-compatibility.json` | 28,273 |
| `learnsets.json` | 21,316 |
| `pokemon-evolutions.json` | 570 |
| `encounters.json` | 2,616 |
| `item-locations.json` | 4,228 |

## Confirmed Fixes

- `pokemon-0000` is excluded.
- `move-0000` is excluded.
- `item-0000` is excluded.
- `ability-0000` is excluded.
- TM51-TM100 are excluded from displayed machine data.
- `pokemon-0000` has no TM/HM/tutor compatibility rows.
- Move descriptions are sourced from Scorched Silver move data.
- Status/no-power moves export null power/accuracy for `—` rendering.
- Pokémon and item display images no longer use old XY workbook/index assets.
- Tutor compatibility is derived from recovered teachable move lists where available.
- Documentation-backed item locations are present and explicitly labeled non-ROM-backed.

## Build Blocker

`npm run build` repeatedly timed out after several minutes with only the initial Next.js version banner and no `.next` output. This remained true after:

- removing stale client imports of heavy data modules from interactive components
- replacing static core JSON imports with server-side runtime file reads
- neutralizing stale XY public JSON fallbacks
- removing old displayed sprite paths

This appears to be a Next build/startup performance or project scan issue, not a schema validation error. TypeScript and JSON integrity checks pass.

## Recommended Next Technical Step

Before deployment, isolate the Next startup/build hang by temporarily moving nonessential legacy project folders (`raw`, old scripts, and docs) outside the app root or by creating a clean frontend-only repo containing only `src`, `public/data`, required `public/sprites`, package files, and config. The current app root still contains substantial legacy import tooling and archived assets from the XY base, which may be contributing to Next's startup/build scan.

## Deployment Status

Not ready for Vercel deployment yet because production build did not complete.
