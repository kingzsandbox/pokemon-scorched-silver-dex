# Location parent completeness repair

Date: 2026-05-30

Scope: frontend-only location grouping and display repair. Extraction lab outputs were read as evidence but not modified.

## Parent locations added or restored

These parent names were present in ROM text or attached documentation but were not reliably visible as parent pages in the frontend location index:

- `Route B` from ROM text label `0x6B23A0`.
- `Route D` from ROM text label `0x6B2347` and item-location notes.
- `Route E` from ROM text label `0x6B235B` and item-location notes.
- `Route F` from ROM text label `0x6B2375` and Pokémon-location notes.
- `Goldenvine Sea` from ROM text label `0x6B23B8`, NPC dialogue, and Pokémon-location notes.

The new parent-only entries use a clean caveat when no encounter map is confidently linked yet:

`This parent location is confirmed by ROM text or attached reference notes, but no encounter map has been confidently linked yet.`

## Underwater handling

`Underwater` is no longer treated as a standalone parent location. The extracted underwater maps now group under parent water locations:

- `0/50`, `0/51` -> `Route 41`
- `0/52`, `0/54`, `0/55`, `0/56` -> `Goldenvine Sea`
- `0/53` -> `Seafloor Cavern`

The app displays `Underwater` as a condition/area within the parent page, not as a separate location page.

## Location index wording

Removed user-facing `mapped areas` counts from:

- `/locations`
- home Locations tab
- search result subtitles
- parent location detail page header

The location index now uses `Game location`, `Game location with notes`, or `Reference-only location`.

## Encounter row cleanup

Location pages now combine duplicate encounter slots when the same Pokémon, method, and displayed area have close/overlapping level ranges. Rates are combined as slot rates and capped at 100%.

Different level bands remain separate rows so wide level spread does not hide likely missing subarea or rod-method distinctions.

## Rendered validation

Validated against the running site at `http://127.0.0.1:3000/`:

- `/locations` returns 200 and includes `Goldenvine Sea`, `Route B`, `Route D`, `Route E`, and `Route F`.
- `/locations/goldenvine-sea` returns 200 and shows `Underwater` encounters under the parent page.
- `/locations/route-41` returns 200 and shows `Underwater` under Route 41.
- `/locations/safari-zone` returns 200 and no longer appears as multiple parent locations.
- `/locations/whirl-islands` returns 200 and shows floor labels rather than raw map labels.
- Rendered scans found no `mapped areas` text and no visible `Map #/#` labels on the checked pages.

