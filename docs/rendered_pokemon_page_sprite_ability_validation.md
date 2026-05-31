# Rendered Pokemon Page Sprite + Ability Validation

Date: 2026-05-29

QA marker: `Scorched Silver Dex QA build: 2026-05-29 20:00 PDT`

Latest QA marker: `Scorched Silver Dex QA build: 2026-05-29 20:24 PDT`

## Validation Targets

- `/pokemon/80-slowbro`
- `/pokemon/978-slowbro`
- `/pokemon/1-bulbasaur`
- `/pokemon/985-slowking`
- `/pokemon/1234-typhlosion`

## Rendered Form Sprite Proof

On `/pokemon/80-slowbro`, the Forms section rendered these image sources:

- `Mega Slowbro`: `http://127.0.0.1:3000/sprites/pokemon-forms/slowbro-mega.png`, `naturalWidth: 96`, `naturalHeight: 96`.
- `Slowbro (Galar)`: `http://127.0.0.1:3000/sprites/pokemon-forms/slowbro-galar.png`, `naturalWidth: 96`, `naturalHeight: 96`.

On `/pokemon/1234-typhlosion`, Scorched custom form assets rendered locally:

- `Typhlosion (Hisui)`: `/sprites/pokemon-forms/typhlosion-hisui.png`, `naturalWidth: 96`, `naturalHeight: 96`.
- `Mega Typhlosion`: `/sprites/scorched-custom/mega-typhlosion.png`.
- `Mega Typhlosion (Hisui)`: `/sprites/scorched-custom/mega-typhlosion-hisui.png`.

On `/pokemon/985-slowking`, the Galar form rendered locally:

- `Slowking (Galar)`: `/sprites/pokemon-forms/slowking-galar.png`, `naturalWidth: 96`, `naturalHeight: 96`.

## Rendered Ability Proof

On `/pokemon/978-slowbro`, the rendered ability section contained:

```text
Ability 1
Speed Boost
Gradually boosts Speed.
Ability 2
Stench
May cause a foe to flinch.
Hidden Ability
Regenerator
Description unavailable.
```

On `/pokemon/1-bulbasaur`, the rendered ability section contained:

```text
Ability 1
Overgrow
Ups Grass moves in a pinch.
Hidden Ability
Chlorophyll
Raises Speed in sunshine.
```

Bulbasaur correctly does not render a fake Ability 2.

On `/pokemon/985-slowking`, the rendered ability section contained:

```text
Ability 1
Sturdy
Negates 1-hit KO attacks.
Ability 2
Stench
May cause a foe to flinch.
Hidden Ability
Regenerator
Description unavailable.
```

## Remaining Caveats

Base Slowbro (`/pokemon/80-slowbro`) has only Ability 1 and Hidden Ability in the extracted data. It should not show an Ability 2 row.

## Sprite Frame + Image Size Adjustment

The user clarified that the sprite-to-frame proportion was acceptable; the whole frame/sprite unit was too large. The internal visual occupancy normalization was therefore restored, and the frame/image dimensions were reduced instead.

Rendered before examples:

- Bulbasaur detail artwork rendered at `184x184`.
- Sandile evolution sprite rendered at `163x163`.

Rendered after examples:

- Bulbasaur detail artwork renders at `156x156`.
- Pokédex/list sprites render at `82x82`.
- Slowbro form-card sprites render at `80x80`.
- Sandile evolution sprite renders at `127x127`.
