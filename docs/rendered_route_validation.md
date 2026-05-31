# Rendered Route Validation

Date: 2026-05-29

## Build Marker

`Scorched Silver Dex QA build: 2026-05-29 14:04 PDT`

The marker appears in the rendered home page HTML.

## Target Route Results

| Route | Status | Validation |
| --- | ---: | --- |
| `/` | 200 | Marker visible; no forbidden visible terms. |
| `/pokemon` | 200 | Pokédex list renders; no forbidden visible terms. |
| `/pokemon/997-typhlosion` | 200 | Typhlosion route renders; no raw evolution labels. |
| `/pokemon/1234-typhlosion` | 200 | Custom Typhlosion route renders; no raw evolution labels. |
| `/pokemon/1237-typhlosion` | 200 | Custom Typhlosion route renders; no raw evolution labels. |
| `/pokemon/981-mr-mime` | 200 | Mr. Mime/Galar route renders. |
| `/pokemon/978-slowbro` | 200 | Ability 1, Ability 2, and Hidden Ability labels render from explicit slots. |
| `/pokemon/1-bulbasaur` | 200 | Ability 1 and Hidden Ability render; no fake second ability. |
| `/move-tutors` | 200 | Tutor entries render compatibility counts and polished requirement text. |
| `/machines/tm01` | 200 | TM route renders, move data appears, no forbidden visible terms. |
| `/machines/hm03` | 200 | HM route renders, no forbidden visible terms. |
| `/items/102-rare-candy` | 200 | Item locations render polished ROM-backed labels. |
| `/locations/g0-m16-route-29` | 200 | Location page renders polished item labels and no raw candidate text. |

## Ability Slot Rendering Proof

- `/pokemon/978-slowbro`: rendered `Ability 1 Speed Boost`, `Ability 2 Stench`, and `Hidden Ability Regenerator`.
- `/pokemon/1-bulbasaur`: rendered `Ability 1 Overgrow` and `Hidden Ability Chlorophyll`.

## Move Tutor Rendering Proof

- `/move-tutors`: rendered compatible Pokémon counts/lists.
- Requirement text now uses `No explicit requirement found in extracted game data.` when no explicit requirement was recovered.
- Source dialogue is secondary context, not the primary requirement line.
