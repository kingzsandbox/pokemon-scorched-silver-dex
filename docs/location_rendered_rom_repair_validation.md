# Location Rendered ROM Repair Validation

Date: 2026-05-30

## What changed

- Location grouping now uses ROM map-event warp evidence for Dark Cave, Union Cave, Phoenix Hideout, and the recovered Seafloor Cavern underwater map.
- Single-map parent locations only show an area label when the label is meaningful. Generic labels like `Encounter area (Lv. 5-45)` are hidden for ordinary one-map routes.
- `Seafloor Cavern` now visibly shows `Dive / Underwater`.
- `Union Cave` no longer absorbs the Phoenix Hideout connector maps that were previously named `Union Cave Lapras Area`.
- `Phoenix Hideout` now has connectivity-based subareas instead of generic encounter buckets.

## Rendered pages checked

All pages below returned HTTP `200` from the running local site at `http://127.0.0.1:3000`.

| URL | Rendered result |
|---|---|
| `/?tab=locations` | no `Map #/#`, no `Surf And Fish`, no `Shared Surf`, no standalone underwater bucket |
| `/locations/dark-cave` | shows `Route 31 / Route 46 Side`, `Union Cave Connector`, `Route 45 Side` |
| `/locations/union-cave` | shows `Route 32 / Route 33 Entrances`, `Inner Floor / Ruins of Alph Path`, `Lapras Area` |
| `/locations/phoenix-hideout` | shows `Entrance Area`, `Inner Hall`, `Central Hideout`, `Side Room`, `Lower Room`, `Upper Connector`, `Northern Cave Connector`, `Southern Cave Connector` |
| `/locations/seafloor-cavern` | shows `Dive / Underwater` and underwater encounters under Seafloor Cavern |
| `/locations/ecruteak` | shows `Surf / Fishing` under Ecruteak rather than a separate surf location |
| `/locations/route-32` | no generic single-map area label; route encounters render directly |
| `/locations/safari-zone` | renders one Safari Zone parent with seven subareas |

## Forbidden rendered text scan

The rendered checks above found none of:

- `Map 0/`
- `Map 24/`
- `Surf And Fish`
- `Shared Surf`
- `Unassigned Underwater`
- `100%`
- `candidate`
- `debug`
- `raw_`
- `Acquisition Notes`

## Remaining caveat

Only underwater map `0/53` is assigned to a parent, because it has strong ROM context through the submarine/Seafloor Cavern warp chain. The other underwater maps remain hidden from the top-level index until a parent route/city can be proven from ROM map connectivity or script context.
