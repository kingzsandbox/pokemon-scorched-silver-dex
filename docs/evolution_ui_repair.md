# Evolution UI Repair

Date: 2026-05-29

The evolution tree no longer displays raw extracted method labels such as:

- `mega_stone_candidate`
- `regional_or_time_level_variant_candidate`
- `item_candidate`
- `move_known_candidate`

These are formatted into user-facing labels, including:

- `Level 36`
- `Level 36 special variant`
- `Use Typhlosionite`
- `Use Ice Stone`
- `Knows Mimic`
- `High friendship`
- `Special location`

The formatter lives in `src/lib/data/pokemon-evolutions.ts` so the repair applies globally to evolution trees and Mega/special evolution links.
