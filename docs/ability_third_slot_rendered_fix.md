# Ability Third Slot Rendered Fix

Date: 2026-05-29

## Data Trace

`public/data/pokemon.json` preserves three explicit ability fields:

- `abilitySlots.ability1`
- `abilitySlots.ability2`
- `abilitySlots.hiddenAbility`

Examples:

- `978-slowbro`: Ability 1 `Speed Boost`, Ability 2 `Stench`, Hidden Ability `Regenerator`.
- `1-bulbasaur`: Ability 1 `Overgrow`, no Ability 2, Hidden Ability `Chlorophyll`.
- `985-slowking`: Ability 1 `Sturdy`, Ability 2 `Stench`, Hidden Ability `Regenerator`.

## Actual Slot Distribution

The frontend-facing Scorched Silver data contains:

- Ability 1 + Ability 2 + Hidden Ability: 2 species/forms.
- Ability 1 + Ability 2 only: 10 species/forms.
- Ability 1 + Hidden Ability only: 901 species/forms.
- Ability 1 only: 324 species/forms.

## Root Cause

The extracted data was not missing the third slot. The confusing rendered behavior came from checking base-form pages that legitimately have only two populated slots, plus older compact render paths that used flattened ability summaries. The Pokemon detail page and Pokédex table now render through `getVisibleAbilitySlots`/`getPokemonAbilityDisplayRows`, which reads `abilitySlots` directly and keeps the slot order:

1. Ability 1
2. Ability 2
3. Hidden Ability

Missing slots are not faked.

## Rendered Validation

Rendered validation is recorded in `docs/rendered_pokemon_page_sprite_ability_validation.md`.
