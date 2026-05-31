# Sprite and Ability Rendered Validation

Date: 2026-05-29

This validation uses the rendered website at `http://127.0.0.1:3000/`.

QA marker: `Scorched Silver Dex QA build: 2026-05-29 19:31 PDT`

## Sprite Normalization

The visual inconsistency came from raw sprite canvases having different transparent padding. A small Pokémon sprite could be drawn on a large 96px canvas and therefore look tiny even though the `<img>` element itself was the same size.

Fix:

- `ReferenceImage` now supports `normalizeVisual`.
- For Pokémon sprites, the component reads the loaded image alpha channel, computes the visible bounding box, and scales the image within the fixed frame.
- Pokémon frames now clip overflow, preserving aspect ratio while preventing the transformed image box from affecting layout.

Validated rendered routes:

- `/pokemon/551-sandile`
- `/pokemon/552-krokorok`
- `/pokemon/553-krookodile`
- `/pokemon/1234-typhlosion`
- `/pokemon/1235-meganium`
- `/pokemon/1236-feraligatr`
- `/pokemon/1237-typhlosion`

Rendered proof examples:

```json
[
  {
    "route": "/pokemon/551-sandile",
    "sprite": "Sandile",
    "src": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/551.png",
    "width": "96",
    "height": "96",
    "transform": "matrix(1.55, 0, 0, 1.55, 0, 0)",
    "parentOverflow": "hidden"
  },
  {
    "route": "/pokemon/552-krokorok",
    "sprite": "Krokorok",
    "src": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/552.png",
    "width": "96",
    "height": "96",
    "transform": "matrix(1.3, 0, 0, 1.3, 0, 0)",
    "parentOverflow": "hidden"
  },
  {
    "route": "/pokemon/553-krookodile",
    "sprite": "Krookodile",
    "src": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/553.png",
    "width": "96",
    "height": "96",
    "transform": "matrix(1.12, 0, 0, 1.12, 0, 0)",
    "parentOverflow": "hidden"
  }
]
```

The transforms and clipped parent frames prove the rendered page is no longer relying only on raw image dimensions.

## Scorched Silver Starter Sprites

Rendered routes now use local Scorched Silver sprites:

| URL | Rendered source |
|---|---|
| `/pokemon/1234-typhlosion` | `/sprites/scorched-custom/mega-typhlosion.png` |
| `/pokemon/1235-meganium` | `/sprites/scorched-custom/mega-meganium.png` |
| `/pokemon/1236-feraligatr` | `/sprites/scorched-custom/mega-feraligatr.png` |
| `/pokemon/1237-typhlosion` | `/sprites/scorched-custom/mega-typhlosion-hisui.png` |

## Ability Rendering

Rendered proof:

`/pokemon/978-slowbro`

```text
Abilities
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

`/pokemon/985-slowking`

```text
Abilities
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

`/pokemon/1-bulbasaur`

```text
Abilities
Ability 1
Overgrow
Ups Grass moves in a pinch.
Hidden Ability
Chlorophyll
Raises Speed in sunshine.
```

Bulbasaur does not render a fake Ability 2.
