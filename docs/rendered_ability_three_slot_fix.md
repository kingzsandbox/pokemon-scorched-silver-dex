# Rendered Ability Three-Slot Fix

Date: 2026-05-29

The frontend now renders ability slots from explicit Scorched Silver `abilitySlots` fields:

- `abilitySlots.ability1` -> `Ability 1`
- `abilitySlots.ability2` -> `Ability 2`
- `abilitySlots.hiddenAbility` -> `Hidden Ability`

Missing slots are not faked. Ability 2 is not labeled as Hidden Ability.

## Rendered Proof

Server: `http://127.0.0.1:3000/`

QA marker: `Scorched Silver Dex QA build: 2026-05-29 19:11 PDT`

### Slowbro (Galar)

URL: `/pokemon/978-slowbro`

Rendered ability section:

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

### Bulbasaur

URL: `/pokemon/1-bulbasaur`

Rendered ability section:

```text
Abilities
Ability 1
Overgrow
Ups Grass moves in a pinch.
Hidden Ability
Chlorophyll
Raises Speed in sunshine.
```

Bulbasaur correctly does not render a fake Ability 2.

## Home Pokédex Table

The home Pokédex table now uses the same explicit ability display rows, so compact rows show slot labels instead of unlabeled comma-separated abilities.
