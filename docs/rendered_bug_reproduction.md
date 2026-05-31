# Rendered Bug Reproduction

Date: 2026-05-29

## Source Of Truth

All checks were performed against the running site at `http://127.0.0.1:3000/` after a clean `.next` removal, rebuild, and restart.

## Bugs Found In Rendered Output

### Item And Location Acquisition Notes

- URL: `/items/102-rare-candy`
- Bad visible text found before fix: `hidden_item_candidate`
- Responsible files:
  - `src/lib/data/items.ts`
  - `src/app/locations/[slug]/page.tsx`
- Fix applied:
  - ROM-backed item placement notes now render as polished labels such as `ROM-backed hidden item placement` and `ROM-backed item ball placement`.
- Rendered proof after fix:
  - `/items/102-rare-candy` returned 200.
  - `/locations/g0-m16-route-29` returned 200.
  - Visible rendered text scan found no `hidden_item_candidate`, `overworld_ball_candidate`, or `_candidate`.

### Move Tutor Requirement Text

- URL: `/move-tutors`
- Bad visible text found before fix: `No explicit requirement was recovered from extracted game data.`
- Responsible file:
  - `src/lib/data/acquisition.ts`
  - `src/app/move-tutors/page.tsx`
  - `src/app/locations/[slug]/page.tsx`
- Fix applied:
  - The old placeholder requirement sentence is now treated as unresolved data, not a valid recovered condition.
  - The UI now renders `No explicit requirement found in extracted game data.`
  - Dialogue remains in secondary source context only.
- Rendered proof after fix:
  - `/move-tutors` returned 200.
  - Visible rendered text scan found no `Requirement unknown`, `requirement missing`, or old `No explicit requirement was recovered...` wording.

### Evolution Method Labels

- URLs:
  - `/pokemon/997-typhlosion`
  - `/pokemon/1234-typhlosion`
  - `/pokemon/1237-typhlosion`
- Bad visible text from user screenshot:
  - `mega_stone_candidate`
  - `regional_or_time_level_variant_candidate`
- Responsible file:
  - `src/lib/data/pokemon-evolutions.ts`
- Fix applied:
  - Evolution method formatting now converts extraction labels into polished user-facing text such as `Use Typhlosionite`, `Level 36 special variant`, `Trade`, `Friendship`, `Use [Item]`, and `Knows [Move]`.
- Rendered proof after fix:
  - Target Typhlosion routes returned 200.
  - Visible rendered text scan found no `mega_stone_candidate`, `regional_or_time_level_variant_candidate`, or `_candidate`.

### Ability Slot Labels

- URLs:
  - `/pokemon/978-slowbro`
  - `/pokemon/1-bulbasaur`
- Verified behavior:
  - Slowbro renders `Ability 1`, `Ability 2`, and `Hidden Ability`.
  - Bulbasaur renders `Ability 1` and `Hidden Ability`, with no fake `Ability 2`.
- Source evidence:
  - `public/data/pokemon.json` exposes explicit `abilitySlots.ability1`, `abilitySlots.ability2`, and `abilitySlots.hiddenAbility`.

## Remaining Rendered Findings

The string `Type: Null` appears on Pokémon lists and tutor compatibility lists. This is legitimate Pokémon species text, not a broken null value.
