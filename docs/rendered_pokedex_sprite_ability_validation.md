# Rendered Pokédex Sprite and Ability Validation

Date: 2026-05-29

Server: `http://127.0.0.1:3000/`

QA marker: `Scorched Silver Dex QA build: 2026-05-29 19:11 PDT`

## Build and Server

- `npm run typecheck`: passed.
- `node node_modules/next/dist/bin/next build`: passed.
- Local server PID during validation: `37612`.
- Homepage returned HTTP 200 and contained the QA marker.

## Rendered Sprite Sizes

| Surface | Before | After rendered proof |
|---|---:|---:|
| Home Pokédex table | 68px sprite in 74px frame | 96px sprite in 104px frame |
| `/pokemon` list | 68px sprite in 74px frame | 96px sprite in 104px frame |
| Pokémon detail hero | 136px sprite in 144px frame | 184px sprite in 196px frame |
| Form selector | 42px sprite in 46px frame | 92px sprite in 100px frame |
| Evolution tree | 86px sprite without a consistent frame | 96px sprite in 104px frame |

Rendered `/pokemon` proof for Bulbasaur:

```json
{
  "width": "96",
  "height": "96",
  "rect": { "w": 96, "h": 96 },
  "src": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
}
```

Rendered `/pokemon/1-bulbasaur` proof for hero art:

```json
{
  "width": "184",
  "height": "184",
  "rect": { "w": 184, "h": 184 }
}
```

## Custom Starter Forms

| URL | Rendered display | Rendered sprite source |
|---|---|---|
| `/pokemon/1234-typhlosion` | Mega Typhlosion | `https://play.pokemonshowdown.com/sprites/gen5/typhlosion.png` |
| `/pokemon/1235-meganium` | Mega Meganium | `https://play.pokemonshowdown.com/sprites/gen5/meganium-mega.png` |
| `/pokemon/1236-feraligatr` | Mega Feraligatr | `https://play.pokemonshowdown.com/sprites/gen5/feraligatr-mega.png` |
| `/pokemon/1237-typhlosion` | Mega Typhlosion (Hisui) | `https://play.pokemonshowdown.com/sprites/gen5/typhlosion-hisui.png` |

## Top-Level Form Grouping Check

Rendered `/pokemon` no longer contains these as top-level list entries:

- `Mega Altaria`
- `Mega Lucario`
- `Silvally (Fire)`
- `Pikachu Rockstar`
- `Mega Typhlosion`

Rendered `/pokemon` still contains base `Silvally` and base `Typhlosion` entries.

## Rendered Ability Proof

`/pokemon/978-slowbro` rendered:

```text
Ability 1
Speed Boost
Ability 2
Stench
Hidden Ability
Regenerator
```

`/pokemon/1-bulbasaur` rendered:

```text
Ability 1
Overgrow
Hidden Ability
Chlorophyll
```

Bulbasaur does not render an empty Ability 2 row.
