# Ability Slot Direct Answer

Answer: Scorched Silver species records expose Ability 1, Ability 2, and a separate Hidden Ability slot.

Evidence:

- `public/data/pokemon.json` contains `abilitySlots` for every frontend-facing species.
- The slot object has explicit fields: `ability1`, `ability2`, and `hiddenAbility`.
- In the current dataset, 1,237 species have `abilitySlots`, 903 have a populated `hiddenAbility`, and 12 have a populated `ability2`.
- Example: Bulbasaur has `ability1: Overgrow`, `ability2: null`, and `hiddenAbility: Chlorophyll`.

UI rule:

- `ability1` is displayed as `Ability 1`.
- `ability2` is displayed as `Ability 2`.
- `hiddenAbility` is displayed as `Hidden Ability`.
- A second visible ability is not automatically treated as hidden; it is only labeled hidden when it comes from the explicit `hiddenAbility` field.
