# Location Floor Recovery Pass

Date: 2026-05-30

## Correction from prior pass

The previous location pass incorrectly promoted connectivity labels such as `Route 31 / Route 46 Side`, `Union Cave Connector`, and `Surf / Fishing` into area labels. Those are not floors and should not be presented as location areas.

This pass only promotes labels that are actual floor-style labels (`1F`, `2F`, `3F`, `B1F`, `B2F`, `B3F`) or established Safari Zone zones.

## Raw ROM evidence used

- Parsed raw ROM map event headers from map group table `0x5529E4`.
- Parsed each map's warp records from the patched ROM.
- Used current location names only as a cross-reference, not as proof of floors.
- Checked the attached Pokémon location sheet for hints. It contains some floor-style hints such as `Union cave 2f`, but app labels were not based on the sheet alone.

## Floor labels applied

### Union Cave

| Map | Warp evidence | Label |
|---|---|---|
| `24/7` | exits to Route 32/Route 33 and leads deeper to `24/8` | `1F` |
| `24/8` | links between `24/7`, Ruins of Alph, and `24/9` | `B1F` |
| `24/9` | deeper one-way branch from `24/8`; location sheet also references `Union cave 2f` | `B2F` |

### Sprout Tower

| Map | Warp evidence | Label |
|---|---|---|
| `24/19` | Sprout Tower-labeled encounter map with internal/self warps and upper connection | `1F` |
| `24/24` | links to `24/25` and another tower-adjacent map | `2F` |
| `24/25` | terminal tower map linked back to `24/24` | `3F` |

### Ice Path

| Map | Warp evidence | Label |
|---|---|---|
| `24/46` | route-facing Ice Path map with exits to Route 44 and Ilex side | `1F` |
| `24/47` | next interior layer linked from `24/46` | `B1F` |
| `24/48` | deeper layer linked from `24/47` and `24/83` | `B2F` |
| `24/83` | deepest linked Ice Path map | `B3F` |

### Burned Tower

| Map | Warp evidence | Label |
|---|---|---|
| `24/52` | Ecruteak-facing Burned Tower map with many drops to `24/53` | `1F` |
| `24/53` | lower Burned Tower map linked back to `24/52` | `B1F` |

### Mt. Mortar

| Map | Warp evidence | Label |
|---|---|---|
| `24/0` | Route 42-facing central map | `1F` |
| `24/3` | upper/inner map reached from multiple `24/0` warps | `2F` |
| `24/2` | lower interior map linked from `24/0`, `24/3`, and `24/107` | `B1F` |
| `24/107` | deeper one-link map from `24/2` | `B2F` |

`Mt. Mortar Past Waterfall` remains a named map but was not converted into a floor label because the recovered name is an area descriptor, not a floor.

## Labels intentionally removed from user-facing areas

- `Route 31 / Route 46 Side`
- `Route 45 Side`
- `Union Cave Connector`
- `Surf / Fishing`
- `Dive / Underwater`
- generic `Encounter area (...)`

Underwater should be modeled as a location capability/submethod, not as a parent location or floor.

## Follow-up parent sweep

After the first floor-only pass, additional multi-map parents were checked page by page against raw ROM warps.

### Whirl Islands

Whirl Islands was missing in the first pass. The raw warp graph shows a vertical cave chain from the Route 41 entrance layer down through deeper maps, so the frontend now uses:

- `1F`
- `B1F`
- `B2F`
- `B3F`
- `B4F`
- `B5F`

Multiple ROM maps may share a floor label; the UI now keeps the shared floor label instead of inventing `B1F 2` style labels.

### Victory Road

Victory Road has two connected clusters in the extracted maps. Both are now labeled by vertical floor position where the warp graph shows a layered structure:

- `1F`
- `2F`
- `3F`
- `B1F`

### Goldenrod Sewer

Goldenrod Sewer maps form a basement chain, so they now render as:

- `B1F`
- `B2F`
- `B3F`

### Tohjo Falls

Tohjo Falls maps with direct vertical/interior links now render as:

- `1F`
- `B1F`

### Dark Cave

Dark Cave does not have a clear vertical floor chain in the recovered ROM evidence. It is now labeled by entrances instead of abstract areas:

- `Route 31 / Route 46 Entrances`
- `Union Cave Entrance`
- `Route 45 Entrance`

These are horizontal entrance labels, not floors.
