# Location Missing Data Repair

Date: 2026-05-30

## What changed

This pass removes empty location shells and adds app-facing, documentation-backed data rows where the extraction lab already had evidence.

## Evidence used

- ROM map-section text pointers:
  - `Lazulan City`: text at `0x6B2265`, pointer table reference at `0x6B2B48`.
  - `Route B`: text at `0x6B23A0`, pointer table reference at `0x6B2C48`.
  - `Route D`: text at `0x6B2347`, pointer table reference at `0x6B2BF8`.
  - `Route E`: text at `0x6B235B`, pointer table reference at `0x6B2C08`.
  - `Route F`: text at `0x6B2375`, pointer table reference at `0x6B2C20`.
  - `Goldenvine Sea`: text at `0x6B23B8`, pointer table reference at `0x6B2C60`.
- Attached Pokémon location sheet derivative:
  - `temp_analysis/location_doc_rows.tsv`
  - `Kubfu` -> `Lazulan top right house`
  - `Gloom` -> `Route D`
  - `Luvdisc` -> `Route A, F`
  - `Horsea` / `Staryu` -> `Goldenvine Sea` fishing notes
- Attached item-location sheet derivative:
  - `temp_analysis/item_doc_rows.tsv`
  - Lazulan Lab/Festival Mega Stones and berries
  - Route E Mega Stones
  - Route D berries

## App data added

- `public/data/documented-pokemon-locations.json`
- Documentation-backed location entries in `public/data/locations.json`
- Documentation-backed item locations in `public/data/item-locations.json`

## UI behavior

- Lazulan City now appears as a parent page with actual documented content:
  - Kubfu in the top-right house from the Pokémon location sheet.
  - Lazulan Lab/Festival item rows from the item-location sheet.
- Route D now has Gloom and documented berry items.
- Route E now has documented Mega Stone item rows.
- Route F now has Luvdisc.
- Goldenvine Sea now has Super Rod Pokémon notes and the already-linked underwater ROM encounters.
- Empty label-only parents are no longer injected by frontend code.

## Route B status

`Route B` exists in the ROM map-section label table, but this pass found no linked encounter rows, item-location rows, or Pokémon-location sheet rows for it. It is therefore not shown as a user-facing location page yet; showing it would recreate the empty-page problem.

## Rendered validation

Fresh local build and server validation on `http://127.0.0.1:3000/`:

| Route | Result |
| --- | --- |
| `/locations/lazulan-city` | Renders `Lazulan City`; shows `Kubfu` from the attached Pokémon location sheet and Lazulan item rows from the item-location sheet. |
| `/locations/route-d` | Renders `Route D`; shows `Gloom` from the Pokémon location sheet and Route D berry item rows. |
| `/locations/route-e` | Renders `Route E`; shows documented Route E item rows such as `Pidgeotite`. |
| `/locations/route-f` | Renders `Route F`; shows `Luvdisc` from the Pokémon location sheet. |
| `/locations/goldenvine-sea` | Renders `Goldenvine Sea`; shows underwater ROM encounters and `Horsea` / `Staryu` from the Pokémon location sheet. |
| `/locations/route-b` | Returns 404 intentionally because only the ROM label has been found; no data-bearing rows are linked yet. |

## Regression repair

After the first enrichment pass, documentation-derived names such as `Tohjo Falls Surf`, `Union Cave Good Rod`, and `Goldenvine Sea Super Rod` were incorrectly treated as separate parent locations. The parser now recognizes those as method/area suffixes under the existing parent locations.

The separate `Location Sheet Pokémon` table was also removed from rendered location pages. Documentation-backed Pokémon evidence remains available in app data for future reconciliation, but the user-facing location pages no longer show a noisy sheet-derived table that does not include ROM rates or levels.

Rendered checks after the repair:

| Route | Result |
| --- | --- |
| `/locations` | Does not show `Tohjo Falls Surf`, `Union Cave Good Rod`, or `Goldenvine Sea Super Rod` as parent cards. |
| `/locations/tohjo-falls` | Shows one `Tohjo Falls` parent page. |
| `/locations/union-cave` | Shows one `Union Cave` parent page. |
| `/locations/goldenvine-sea` | Shows one `Goldenvine Sea` parent page. |
| `/locations/lazulan-city` | No separate location-sheet table; item documentation rows are grouped under the parent page. |
