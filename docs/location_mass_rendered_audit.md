# Location Mass Rendered Audit

Date: 2026-05-30

Scope: rendered location index and every rendered location detail page at `http://127.0.0.1:3000/locations`.

## ROM-backed cleanup performed

- `location-g25-m040`, `location-g25-m041`, and `location-g25-m042` are grouped as `S.S. Tidal`.
  - ROM script text identifies Captain Briney, S.S. TIDAL cabin scripts, passenger cabin dialogue, lower hull dialogue, and the HighHorsepwr tutor.
  - Rendered areas: `Passenger Cabins`, `Lower Hull`.
- `location-g26-m060` is grouped as `Trainer Hill`.
  - ROM script text identifies TRAINER HILL reception/shop scripts.
  - Rendered area: `Reception`.
- `location-g26-m088` is grouped as `Seashore House`.
  - ROM script text identifies the SEASHORE HOUSE battle/shop room.
  - Rendered area: `Main Room`.

## Data-level checks

- Active ROM-backed map/location records missing from frontend grouping: `0`.
- Raw `Map #/#` names in `public/data/locations.json`: `0`.
- `Broken` names in `public/data/locations.json`: `0`.
- Underwater records remain internally mapped to ROM maps, but are grouped under parent locations for UI:
  - `Route 41`
  - `Goldenvine Sea`
  - `Seafloor Cavern`

## Rendered crawl checks

Rendered pages crawled: `79`.

Failed pages: `0`.

The crawl checked for:

- empty location pages with no encounters, items, shops, gifts, tutors, or rewards
- `Map #/#`
- `Broken`
- `Location Sheet Pokémon`
- `Requirement unknown`
- `candidate`
- `raw_`
- `debug`
- `undefined`
- `null`
- `hidden_item_candidate`
- `overworld_ball_candidate`
- `low_handler_or_script_context_only`
- `medium_high`
- `Shared Water`
- `Surf Most Areas`
- `Locations Needing Name Review`
- standalone `Underwater` area labels

No rendered location page contained any of those strings or empty-page failures.

## Targeted rendered checks

- `/locations/s-s-tidal`
  - Renders `S.S. Tidal`.
  - Shows `Leftovers` in `Lower Hull`.
  - Shows `HighHorsepwr` tutor in `Passenger Cabins`.
  - No raw map/debug labels.
- `/locations/trainer-hill`
  - Renders `Trainer Hill`.
  - Shows Trainer Hill shop inventories.
  - No `Broken` label.
- `/locations/seashore-house`
  - Renders `Seashore House`.
  - Shows shop inventory.
  - No `Broken` label.
- `/locations/goldenvine-sea`
  - Does not list `Underwater` as an area.
  - Underwater encounters render as `Dive / Underwater`.
- `/locations/route-41`
  - Does not list `Underwater` as an area.
  - Underwater encounters render as `Dive / Underwater`.
- `/locations/seafloor-cavern`
  - Underwater-linked encounters render as `Dive / Underwater`.
- `/locations/mt-silver`
  - Renders floor/area labels: `Exterior`, `1F`, `2F`, `3F`, `4F`, `Peak`.
- `/locations/whirl-islands`
  - Renders floor/area labels: `Surface Water`, `1F`, `B1F`, `B2F`, `B3F`, `B4F`, `B5F`.

## UI shaping fixes

- Underwater no longer renders as an area chip.
- Underwater-linked encounters render under their parent route/sea/cavern as `Dive / Underwater`.
- Merged encounter rows now average grouped slot rates instead of adding them together, avoiding inflated 100% display from grouped rows.

## Validation

- `npm run typecheck`: passed.
- `node node_modules/next/dist/bin/next build`: passed.
- Local server: running on `http://127.0.0.1:3000/`.
