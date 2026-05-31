# Location Parent Page Sweep

Date: 2026-05-30

## Scope

This pass checked parent location pages against raw ROM map-event warp evidence. Existing extracted labels were treated as cross-reference only.

Rules used:

- Vertical multi-map structures should show actual floor labels such as `1F`, `2F`, `B1F`.
- Horizontal non-floor structures should use entrance labels only when useful.
- Encounter methods such as surf/fishing/underwater are not areas.
- Generic labels such as `Encounter area` are not user-facing areas.

## Updated parent pages

| Parent page | Rendered labels after sweep | Evidence basis |
|---|---|---|
| `Union Cave` | `1F`, `B1F`, `B2F` | ROM warp chain from Route 32/33 entrance map through deeper maps; location sheet contains `Union cave 2f` hint |
| `Sprout Tower` | `1F`, `2F`, `3F` | ROM tower map chain `24/19`, `24/24`, `24/25` |
| `Ice Path` | `1F`, `B1F`, `B2F`, `B3F` | ROM warp chain from Route 44-facing map through deeper Ice Path maps |
| `Burned Tower` | `1F`, `B1F` | Ecruteak-facing upper map and lower linked map |
| `Mt. Mortar` | `1F`, `2F`, `B1F`, `B2F` | ROM warp chain among Mt. Mortar maps, excluding named `Past Waterfall` as a floor |
| `Whirl Islands` | `1F`, `B1F`, `B2F`, `B3F`, `B4F`, `B5F` | ROM warp chain from Route 41-facing layer through deeper Whirl Islands maps |
| `Victory Road` | `1F`, `2F`, `3F`, `B1F` | ROM warp chains across both Victory Road map clusters |
| `Goldenrod Sewer` | `B1F`, `B2F`, `B3F` | basement-style ROM warp chain |
| `Tohjo Falls` | `1F`, `B1F` | ROM interior/downward warp pairs |
| `Dark Cave` | `Route 31 / Route 46 Entrances`, `Union Cave Entrance`, `Route 45 Entrance` | no floor chain recovered; horizontal entrance labels are appropriate |

## Rendered validation

Rendered local pages were fetched from `http://127.0.0.1:3000` after rebuilding and restarting the app.

Checked:

- `/locations/whirl-islands`
- `/locations/victory-road`
- `/locations/goldenrod-sewer`
- `/locations/tohjo-falls`
- `/locations/dark-cave`
- `/locations/union-cave`
- `/locations/sprout-tower`
- `/locations/ice-path`
- `/locations/mt-mortar`
- `/locations/burned-tower`
- `/locations/seafloor-cavern`

Results:

- Floor labels render on vertical parent pages.
- Dark Cave renders entrance labels instead of fake floors.
- Seafloor Cavern does not render underwater as an area label.
- Surf/fishing labels are not rendered as area labels.
- Area badge lists deduplicate repeated floor labels.

## Remaining caveats

- Some labels are inferred from ROM warp topology rather than explicit floor-sign text.
- If exact in-game floor sign text is later recovered from scripts/elevator menus, those labels should replace topology-inferred labels.
