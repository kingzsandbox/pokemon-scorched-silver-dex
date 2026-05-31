# Ability Data Truth Repair

Date: 2026-05-30

## Root Cause

The frontend inherited ability slot data from the earlier normalized species export, which decoded the Scorched Silver base-stat record ability fields incorrectly. In raw game data, the ability slots are stored as 16-bit IDs:

- Ability 1: raw species record offset `+0x18`
- Ability 2: raw species record offset `+0x1A`
- Hidden Ability: raw species record offset `+0x1C`

The previous normalized data effectively read Ability 2 from the wrong byte position for many species, causing valid second abilities such as Shinx's `Intimidate` to become `null` in the app.

## Concrete Evidence

Shinx raw species record:

- Species ID: `403`
- Raw ability IDs from species bytes: `79 / 22 / 62`
- Resolved names: `Rivalry / Intimidate / Guts`

The app previously displayed:

- Ability 1: `Rivalry`
- Hidden Ability: `Guts`
- Missing Ability 2

## Repair

Created:

`scripts/repair_ability_slots_from_raw_species.py`

The script rewrites `public/data/pokemon.json` ability fields using the raw species records and `normalized_json/abilities.json` for ID-to-name resolution.

The app now preserves populated slots in order:

1. Ability 1
2. Ability 2
3. Hidden Ability

Zero ability IDs remain empty slots rather than being shown as an ability.
