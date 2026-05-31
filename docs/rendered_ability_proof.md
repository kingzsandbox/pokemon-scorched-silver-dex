# Rendered Ability Proof

Date: 2026-05-29

Source of truth: running site at `http://127.0.0.1:3000/`.

## Schema Answer

The frontend species schema supports three possible fields:

- `abilitySlots.ability1`
- `abilitySlots.ability2`
- `abilitySlots.hiddenAbility`

Some species have only Ability 1 plus Hidden Ability. Some species have all three.

## Rendered Proof: Three Populated Slots

URL: `/pokemon/978-slowbro`

Rendered visible text excerpt:

- `Ability 1 Speed Boost`
- `Ability 2 Stench`
- `Hidden Ability Regenerator`

Result: Ability 1, Ability 2, and Hidden Ability are visibly rendered.

## Rendered Proof: Ability 1 + Hidden Ability Only

URL: `/pokemon/1-bulbasaur`

Rendered visible text excerpt:

- `Ability 1 Overgrow`
- `Hidden Ability Chlorophyll`
- `Ability 2`: not present

Result: missing Ability 2 is not faked, and Hidden Ability is not mislabeled as Ability 2.
