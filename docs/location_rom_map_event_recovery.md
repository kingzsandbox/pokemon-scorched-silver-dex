# Location ROM Map/Event Recovery

Date: 2026-05-30

This pass went back to the ROM-backed map event layer instead of only using encounter labels.

## Evidence used

- Map group table: `0x5529E4`
- Map event headers from the patched ROM in the extraction lab.
- Warp records parsed as:
  - `x u16`
  - `y u16`
  - elevation byte
  - destination warp id
  - destination map number
  - destination map group

## Area labels recovered from warps

### Dark Cave

| Map | Warp evidence | Frontend area label |
|---|---|---|
| `24/99` | exits to `Route 31`, `Route 46`, and `Dark Cave 24/100` | `Route 31 / Route 46 Side` |
| `24/100` | exits to `Route 45` and `Dark Cave 24/99` | `Route 45 Side` |
| `24/10` | exits to `Union Cave 24/7` | `Union Cave Connector` |

The ROM data distinguishes the maps by exits/connectivity, but the current recovered text does not provide exact floor labels such as `1F` or `B1F`, so those labels were not invented.

### Union Cave

| Map | Warp evidence | Frontend area label |
|---|---|---|
| `24/7` | exits to `Route 32`, `Route 33`, and `Union Cave 24/8` | `Route 32 / Route 33 Entrances` |
| `24/8` | links `Union Cave 24/7`, `Union Cave Lapras Area 24/9`, and `Ruins of Alph` | `Inner Floor / Ruins of Alph Path` |
| `24/9` | links back to `Union Cave 24/8` | `Lapras Area` |

Two additional maps were previously grouped as `Union Cave Lapras Area` by name alone. The ROM warp graph does not support that parent:

| Map | Warp evidence | Frontend correction |
|---|---|---|
| `24/91` | only exits to `Phoenix Hideout 24/88` | moved to `Phoenix Hideout`, area `Northern Cave Connector` |
| `24/93` | exits to `Phoenix Hideout 24/86` and `Phoenix Hideout 24/92` | moved to `Phoenix Hideout`, area `Southern Cave Connector` |

Phoenix Hideout maps now use connectivity-based subarea labels instead of generic encounter buckets:

| Map | Warp evidence | Frontend area label |
|---|---|---|
| `24/86` | external entrance plus links to `24/87` and `24/88` | `Entrance Area` |
| `24/87` | connects several internal hideout passages | `Inner Hall` |
| `24/88` | central connector to `24/86`, `24/90`, `24/92`, and `24/91` | `Central Hideout` |
| `24/89` | one-room branch from `24/87` | `Side Room` |
| `24/90` | one-room branch from `24/88` | `Lower Room` |
| `24/92` | connector back to `24/88` and `24/93` | `Upper Connector` |

## Underwater

Seven underwater encounter maps exist in the extracted data:

- `0/50`
- `0/51`
- `0/52`
- `0/53`
- `0/54`
- `0/55`
- `0/56`

Most only link to other underwater maps or to unnamed maps, so they are still not assigned to a route/city.

One underwater map has strong contextual evidence:

| Underwater map | Evidence | Frontend parent |
|---|---|---|
| `0/53` | destination/nearby map `24/26` has submarine text: `"SUBMARINE EXPLORER 1" ... TEAM AQUA stole in SLATEPORT ... TEAM AQUA must have gone ashore here` | `Seafloor Cavern`, area `Dive / Underwater` |

The remaining underwater maps are still intentionally hidden from the top-level location index until the parent route/city can be recovered safely.

## Frontend rendering changes

- Parent locations with one meaningful subarea now still show the subarea. This matters for `Seafloor Cavern`, which now visibly shows `Dive / Underwater`.
- Generic one-map labels such as `Encounter area (Lv. 5-45)` are not shown as user-facing subarea names for ordinary routes.
- Caveats were rewritten to avoid raw extraction wording such as `candidate`.
