# Pokédex Ability Slot Validation

Date: 2026-05-29

## Direct Answers

- Does the schema support three potential slots? Yes.
- Which field is Ability 1? `abilitySlots.ability1`.
- Which field is Ability 2? `abilitySlots.ability2`.
- Which field is Hidden Ability? `abilitySlots.hiddenAbility`.
- Can a Pokémon have Ability 1 + Hidden Ability but no Ability 2? Yes.
- Can a Pokémon have Ability 1 + Ability 2 + Hidden Ability? Yes.

## Dataset Counts

- Frontend species records: 1,237.
- Records with `abilitySlots`: 1,237.
- Records with populated Ability 2: 12.
- Records with populated Hidden Ability: 903.
- Records with both Ability 2 and Hidden Ability: 2.

## Rendered Examples

- `/pokemon/1-bulbasaur`: renders `Ability 1 Overgrow` and `Hidden Ability Chlorophyll`; no fake Ability 2.
- `/pokemon/978-slowbro`: renders `Ability 1 Speed Boost`, `Ability 2 Stench`, and `Hidden Ability Regenerator`.

## UI Rule

Show Ability 1 when present. Show Ability 2 only when `abilitySlots.ability2` is populated. Show Hidden Ability only when `abilitySlots.hiddenAbility` is populated. Do not infer hidden ability from Ability 2.
