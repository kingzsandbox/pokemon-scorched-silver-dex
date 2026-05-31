# Manual QA Issue Tracker

Date: 2026-05-28

## 1. Blank Pokémon `#-`

- Status: fixed
- Root cause: frontend adapter exported extraction sentinel species `0` (`??????????`) into `public/data/pokemon.json`.
- Files inspected: `scripts/adapt_scorched_silver_data.py`, `public/data/pokemon.json`.
- Files changed: `scripts/adapt_scorched_silver_data.py`, regenerated `public/data/pokemon.json`.
- Validation performed: data integrity check confirms `pokemon-0000` and blank names are absent; frontend Pokémon count is now 1,237.
- Remaining caveats: none for this issue.

## 2. Old XY Sprites

- Status: fixed for displayed Pokémon/item images
- Root cause: `src/lib/assets.ts` and the home page used XY workbook sprite references and generated XY sprite indexes.
- Files inspected: `src/lib/assets.ts`, `src/app/page.tsx`, `public/data/pokemon-sprites.json`, `public/data/item-images.json`.
- Files changed: `src/lib/assets.ts`, `src/app/page.tsx`, old sprite/index JSON neutralized to `[]`.
- Validation performed: source search no longer finds displayed `pokemon-workbook` or `generation-vi/x-y` sprite paths in `src`; Pokémon images now use PokeAPI official artwork/sprites, item icons use PokeAPI item sprites or TM type icons.
- Remaining caveats: species/forms above canonical PokeAPI artwork coverage fall back to the neutral silver placeholder.

## 3. Ability Labels

- Status: fixed
- Root cause: previous display logic mixed fallback ability arrays and vanilla reference logic; this could label a second displayed ability as hidden in the wrong path.
- Files inspected: `src/lib/data/vanilla.ts`, `public/data/pokemon.json`, extraction `species_with_ability_names.json`.
- Files changed: `src/lib/data/vanilla.ts`, `scripts/adapt_scorched_silver_data.py`.
- Validation performed: UI ability rows now prefer Scorched Silver slot fields directly: `Ability 1`, `Ability 2`, and `Hidden Ability` only when the extracted hidden slot is present.
- Remaining caveats: duplicated abilities are still de-duped in summary chips, but detail rows preserve slot labels.

## 4. Old XY Gameplay Data

- Status: fixed for active data paths
- Root cause: the base app still imported vanilla references, supplemental Kalos items, old item-obtain fallbacks, and workbook sprite indexes.
- Files inspected: `public/data`, `src`, `scripts`.
- Files changed: `src/lib/data/items.ts`, `src/lib/data/vanilla.ts`, `src/lib/assets.ts`, old public fallback JSON files neutralized to `[]`.
- Validation performed: active source no longer imports vanilla move/Pokémon references or supplemental item-obtain data; generated frontend datasets come from `scripts/adapt_scorched_silver_data.py`.
- Remaining caveats: legacy scripts remain in `scripts/` for historical import tooling but are not active frontend data paths.

## 5. Location Details

- Status: partially fixed
- Root cause: adapter used raw candidate labels without ordering/normalizing subarea-style labels.
- Files inspected: `map_location_index.json`, `encounters.json`, `item_locations.json`, `acquisition_index_enriched.json`.
- Files changed: `scripts/adapt_scorched_silver_data.py`.
- Validation performed: locations now sort route numbers earlier where detectable and labels like `Surf Route 30` render as `Route 30 (Surf)`.
- Remaining caveats: canonical ROM-native map names remain candidate-level where extraction only has map group/number or documentation labels.

## 6. Item Data

- Status: partially fixed
- Root cause: item sentinel row and Gen III control tokens were exported; frontend also lacked documentation-backed item locations from the attached workbook.
- Files inspected: `items.json`, `item_locations.json`, extraction `temp_analysis/item_doc_rows.tsv`.
- Files changed: `scripts/adapt_scorched_silver_data.py`, regenerated `public/data/items.json`, `public/data/item-locations.json`, `public/data/locations.json`.
- Validation performed: item `0` excluded, `Pok<0x1B>` displays as `Poké`, 58 documentation-backed item location rows added with explicit non-ROM notes.
- Remaining caveats: documentation-backed item locations are intentionally labeled as documentation-backed, not ROM-backed.

## 7. Move Data

- Status: fixed
- Root cause: move pages used old vanilla move references instead of Scorched Silver move descriptions; no-power moves kept raw `0` or `1`.
- Files inspected: `moves.json`, `src/lib/data/vanilla.ts`, move pages.
- Files changed: `scripts/adapt_scorched_silver_data.py`, `src/lib/data/vanilla.ts`.
- Validation performed: moves now use extracted `notes` descriptions; status/no-power moves export `power: null` and `accuracy: null`, rendering as `—`.
- Remaining caveats: moves with unresolved extracted descriptions show a clean unavailable state.

## 8. TM/HM Compatibility

- Status: fixed
- Root cause: sentinel species was included and generated machine data did not explicitly guard against undefined TM51-TM100 display.
- Files inspected: `tm_hm_move_map.json`, `tm_hm_compatibility.json`, `public/data/machines.json`, `public/data/move-compatibility.json`.
- Files changed: `scripts/adapt_scorched_silver_data.py`.
- Validation performed: no TM over 50 appears, HMs remain, `pokemon-0000` compatibility rows are absent, all compatibility references resolve.
- Remaining caveats: broad compatibility counts can still be legitimate because the recovered teachable list includes universal/common teachable moves like Return.

## 9. Blank Ability

- Status: fixed
- Root cause: ability ID `0` (`-------`) was exported into frontend abilities.
- Files inspected: `abilities.json`, `public/data/abilities.json`.
- Files changed: `scripts/adapt_scorched_silver_data.py`, regenerated `public/data/abilities.json`.
- Validation performed: `ability-0000` and blank ability names are absent; all species ability names resolve to exported ability names.
- Remaining caveats: unresolved descriptions use `Description unavailable.`

## 10. Move Tutor Context / Compatibility

- Status: partially fixed
- Root cause: tutor UI showed raw `Requirement unknown` and had no compatibility derivation.
- Files inspected: `move_tutors_enriched.json`, `tm_hm_compatibility.json`, `acquisition_index_enriched.json`.
- Files changed: `scripts/adapt_scorched_silver_data.py`, `src/lib/data/acquisition.ts`, `src/app/move-tutors/page.tsx`, `src/app/locations/[slug]/page.tsx`.
- Validation performed: tutor compatibility is derived from each species' recovered `teachable_move_ids_raw`; 2,934 tutor compatibility rows are now generated. Tutor rows display nearby decoded dialogue/context or `No requirement found in extracted script context.`
- Remaining caveats: many custom tutor moves do not appear in the recovered teachable move lists, so those tutor pages correctly show no compatible Pokémon found rather than invented compatibility.
