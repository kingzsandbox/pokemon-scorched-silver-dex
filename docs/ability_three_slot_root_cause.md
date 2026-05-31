# Ability Three-Slot Root Cause

Date: 2026-05-29

## Root Cause

The Scorched Silver frontend data did preserve the three-slot structure, but not every UI surface was rendering that structure directly.

The public data has explicit slots:

- `abilitySlots.ability1`
- `abilitySlots.ability2`
- `abilitySlots.hiddenAbility`

Only two frontend-facing Pokémon currently have all three populated slots:

- `978-slowbro`: Speed Boost / Stench / Regenerator
- `985-slowking`: Sturdy / Stench / Regenerator

Most Pokémon legitimately have only Ability 1 plus Hidden Ability, or Ability 1 only. Bulbasaur has Ability 1 and Hidden Ability, with no populated Ability 2.

## Pipeline Check

| Stage | Result |
|---|---|
| Extracted frontend data | `public/data/pokemon.json` contains `abilitySlots` with three possible fields. |
| Adapter output | All populated slots are preserved in `abilitySlots`. |
| Detail page | Uses `getPokemonAbilityDisplayRows`, which reads `abilitySlots` directly. |
| Home compact Pokédex | Previously used summary entries; now uses the same display-row helper so slot labels are not lost. |

## Fix

The home Pokédex now uses `getPokemonAbilityDisplayRows` instead of summary-only ability entries. This makes compact rows show `Ability 1`, `Ability 2`, and `Hidden Ability` labels when those slots are populated.

The detail page already used explicit slot rows and was revalidated on the rendered website.

## Rendered Proof

Server marker: `Scorched Silver Dex QA build: 2026-05-29 19:31 PDT`

`/pokemon/978-slowbro` rendered:

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

`/pokemon/985-slowking` rendered:

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

`/pokemon/1-bulbasaur` rendered:

```text
Abilities
Ability 1
Overgrow
Ups Grass moves in a pinch.
Hidden Ability
Chlorophyll
Raises Speed in sunshine.
```
