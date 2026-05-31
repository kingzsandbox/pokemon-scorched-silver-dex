# Rendered Forbidden Text Scan

Date: 2026-05-29

## Method

Fetched rendered HTML from the running production server at `http://127.0.0.1:3000/`, stripped script/style/framework payloads, and scanned visible text.

The word `null` was not used as a blanket failure because `Type: Null` is a legitimate Pokémon species name. Broken `undefined` text was still scanned.

## Forbidden Terms

- `mega_stone_candidate`
- `regional_or_time_level_variant_candidate`
- `hidden_item_candidate`
- `overworld_ball_candidate`
- `_candidate`
- `requirement unknown`
- `requirement missing`
- `No explicit requirement was recovered`
- `raw_`
- `debug`
- `undefined`

## Routes Scanned

- `/`
- `/pokemon`
- `/moves`
- `/items`
- `/abilities`
- `/machines`
- `/move-tutors`
- `/locations`
- `/pokemon/157-typhlosion`
- `/pokemon/997-typhlosion`
- `/pokemon/1234-typhlosion`
- `/pokemon/1235-meganium`
- `/pokemon/1236-feraligatr`
- `/pokemon/1237-typhlosion`
- `/pokemon/981-mr-mime`
- `/pokemon/978-slowbro`
- `/pokemon/1-bulbasaur`
- `/moves/182-protect`
- `/moves/14-swords-dance`
- `/moves/85-thunderbolt`
- `/items/102-rare-candy`
- `/items/753-typhlosionite`
- `/items/28-potion`
- `/abilities/266-as-one`
- `/abilities/267-as-one`
- `/abilities/65-overgrow`
- `/machines/tm01`
- `/machines/hm03`
- `/locations/g0-m16-route-29`
- `/locations/g0-m34-route-27`
- `/locations/g0-m0-route-30-surf`

## Result

All scanned routes returned HTTP 200 and no forbidden visible text remained.
