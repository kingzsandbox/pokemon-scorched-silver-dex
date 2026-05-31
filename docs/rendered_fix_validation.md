# Rendered Fix Validation

Date: 2026-05-29

Source of truth: running site at `http://127.0.0.1:3000/`.

QA marker: `Scorched Silver Dex QA build: 2026-05-29 18:38 PDT`.

## Build And Server

- `npm run typecheck`: passed.
- `node node_modules/next/dist/bin/next build`: passed.
- Server running on `127.0.0.1:3000`.
- Home route returned HTTP 200 and rendered the QA marker.

## Form Grouping

Before:

- Home Pokédex rendered Mega Altaria, Mega Lucario, Silvally forms, Pikachu forms, Typhlosion forms, Meganium custom form, and Feraligatr custom form as top-level rows.

After:

- Home Pokédex no longer renders those forms as top-level rows.
- Home Pokédex renders grouped base entries such as `Silvally 18 forms`, `Pikachu 15 forms`, and `Typhlosion 4 forms`.
- Detail pages render form selectors and preserve direct form routes.

## Display Names

Before:

- Detail pages displayed labels such as `Typhlosion (Species 1234)`.

After:

- `/pokemon/997-typhlosion`: `Typhlosion (Hisui)`.
- `/pokemon/1234-typhlosion`: `Typhlosion (Scorched Form)`.
- `/pokemon/1237-typhlosion`: `Typhlosion (Ascended Form)`.
- `/pokemon/978-slowbro`: `Slowbro (Galar)`.
- `/pokemon/981-mr-mime`: `Mr. Mime (Galar)`.
- `/pokemon/938-altaria`: `Mega Altaria`.
- `/pokemon/948-lucario`: `Mega Lucario`.
- Rendered scan found no `Species ####` labels on checked pages.

## Abilities

Before:

- Ability semantics were unclear from the rendered UI.

After:

- `/pokemon/978-slowbro` visibly renders Ability 1, Ability 2, and Hidden Ability.
- `/pokemon/1-bulbasaur` visibly renders Ability 1 and Hidden Ability only.

## Matchups

Before:

- Pokémon detail pages rendered both Defensive Matchups and Offensive Matchups.

After:

- Checked Pokémon detail pages render Defensive Matchups and no Offensive Matchups.
- Dark matchup cells use dark-mode tokens instead of light pastel backgrounds.

## Sprite Sizing

Before:

- Home Pokédex rendered smaller unframed sprites while other Pokédex views used larger frames.

After:

- Home Pokédex and `/pokemon` list both render 68px contained sprites in stable framed cells.
- Detail hero, form selector, and evolution tree use stable contained sprite dimensions.

## Checked Routes

- `/`
- `/pokemon`
- `/pokemon/157-typhlosion`
- `/pokemon/997-typhlosion`
- `/pokemon/1234-typhlosion`
- `/pokemon/1237-typhlosion`
- `/pokemon/1235-meganium`
- `/pokemon/1236-feraligatr`
- `/pokemon/80-slowbro`
- `/pokemon/978-slowbro`
- `/pokemon/122-mr-mime`
- `/pokemon/981-mr-mime`
- `/pokemon/334-altaria`
- `/pokemon/938-altaria`
- `/pokemon/948-lucario`
- `/pokemon/1-bulbasaur`

All checked routes returned HTTP 200.
