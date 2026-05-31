# Emergency Trust Repair Validation

Date: 2026-05-29

## Summary

The emergency trust repair pass removed the raw extraction labels that were visible in the evolution and acquisition UI, confirmed Scorched Silver ability slot semantics, rebuilt successfully, and started the local production server on `127.0.0.1:3000`.

## Ability Slot Semantics

Answer: Scorched Silver species records expose Ability 1, Ability 2, and a separate Hidden Ability slot.

Evidence:

- `public/data/pokemon.json` uses explicit `abilitySlots.ability1`, `abilitySlots.ability2`, and `abilitySlots.hiddenAbility` fields.
- All 1,237 frontend-facing species have an `abilitySlots` object.
- 903 species have a populated `hiddenAbility`.
- 12 species have a populated `ability2`.
- The UI should only label a slot as Hidden Ability when it comes from `hiddenAbility`.

## Repairs Performed

- Evolution method display now translates internal labels such as `mega_stone_candidate` and `regional_or_time_level_variant_candidate` into user-facing labels such as `Use Typhlosionite`, `Level 36 special variant`, `Use [Item]`, `Knows [Move]`, `Trade`, and `Friendship`.
- Item obtain details now translate ROM recovery notes into polished labels such as `ROM-backed hidden item placement` and `ROM-backed item ball placement`.
- Location found-item sections now use the same polished item-location labels.
- Location page titles use readable location display names instead of raw map placeholders when a recovered name is available.
- Move tutor UI uses a clean requirement fallback: `No explicit requirement was recovered from extracted game data.`
- Move tutor dialogue remains secondary source context instead of primary UI text.

## Route Validation

The following routes returned HTTP 200 and were scanned for raw user-facing extraction labels:

- `/`
- `/pokemon`
- `/pokemon/157-typhlosion`
- `/pokemon/997-typhlosion`
- `/pokemon/1234-typhlosion`
- `/pokemon/1235-meganium`
- `/pokemon/1236-feraligatr`
- `/pokemon/1237-typhlosion`
- `/pokemon/981-mr-mime`
- `/moves/182-protect`
- `/moves/14-swords-dance`
- `/items/102-rare-candy`
- `/items/753-typhlosionite`
- `/abilities/266-as-one`
- `/machines/tm01`
- `/move-tutors`
- `/locations/g0-m16-route-29`

Scanned terms:

- `mega_stone_candidate`
- `regional_or_time_level_variant_candidate`
- `hidden_item_candidate`
- `overworld_ball_candidate`
- `_candidate`
- `Requirement unknown`
- `Unknown location`
- `Name confidence`
- `low_handler`

Result: no matches in rendered HTML for the tested routes.

## Commands Run

- `npm run typecheck`
- `node node_modules/next/dist/bin/next build`
- `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000`

## Results

- Typecheck: passed.
- Direct Next build: passed.
- Production server: running on `http://127.0.0.1:3000/`.
- Home route: HTTP 200.
- QA build marker: present.

## Remaining Caveats

- Some custom Scorched Silver forms may still use intentional family/base-form sprite fallbacks when no exact public modern sprite exists.
- Some location names remain probable/cautious where the ROM-native canonical name was not fully recovered.
- Tutor requirements are shown as unavailable when no explicit requirement was recovered from extracted game data.
