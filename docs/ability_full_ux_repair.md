# Ability Full UX Repair

Date: 2026-05-29

Repairs confirmed:

- Blank/sentinel abilities are excluded from frontend data.
- Duplicate ability names such as `As One` are disambiguated by ability ID.
- Ability descriptions display where extracted.
- Missing descriptions use polished copy: `Description unavailable.`
- Pokémon pages label slots according to extracted fields: `Ability 1`, `Ability 2`, and `Hidden Ability`.

Direct semantics:

- `ability2` is a normal second ability.
- `hiddenAbility` is a separate hidden ability slot.
