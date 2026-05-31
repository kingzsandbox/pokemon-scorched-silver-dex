# Rendered Pokédex Audit

Date: 2026-05-29

Source of truth: running site at `http://127.0.0.1:3000/`.

QA marker: `Scorched Silver Dex QA build: 2026-05-29 18:38 PDT`.

## Before

Rendered home Pokédex output showed alternate forms as top-level rows:

- `Mega Altaria`: present.
- `Mega Lucario`: present.
- `Typhlosion (Hisui)`: present.
- `Typhlosion (Scorched Form)`: present.
- `Meganium (Scorched Form)`: present.
- `Feraligatr (Scorched Form)`: present.
- Silvally type forms were reachable as top-level rendered rows.
- Pikachu variant forms were reachable as top-level rendered rows.

## After

Rendered home Pokédex output after rebuild/restart:

| Group | Top-Level Alternate Form Still Present? | Grouped Base Entry Visible? | Rendered Evidence |
| --- | --- | --- | --- |
| Mega Altaria | No | Yes, `Altaria` | `Mega Altaria` absent from `/`; `Altaria` remains grouped. |
| Mega Lucario | No | Yes, `Lucario` | `Mega Lucario` absent from `/`; `Lucario` remains grouped. |
| Silvally forms | No | Yes, `Silvally 18 forms` | `Silvally (Fire)`/type variants absent from `/`. |
| Pikachu forms | No | Yes, `Pikachu 15 forms` | Pikachu variant names absent from `/`. |
| Typhlosion forms | No | Yes, `Typhlosion 4 forms` | Hisui/Scorched/Ascended names absent from `/`. |
| Meganium forms | No | Yes, `Meganium 2 forms` | Custom form absent from `/`. |
| Feraligatr forms | No | Yes, `Feraligatr 2 forms` | Custom form absent from `/`. |

## Detail Page Grouping

Rendered detail pages show form selectors:

- `/pokemon/157-typhlosion` shows Typhlosion, Typhlosion (Hisui), Typhlosion (Scorched Form), and Typhlosion (Ascended Form).
- `/pokemon/80-slowbro` shows Slowbro, Mega Slowbro, and Slowbro (Galar).
- `/pokemon/122-mr-mime` shows Mr. Mime and Mr. Mime (Galar).
- `/pokemon/334-altaria` shows Altaria and Mega Altaria.
- `/pokemon/448-lucario`/`/pokemon/948-lucario` group Lucario and Mega Lucario.

## Route Status

All checked routes returned HTTP 200.
