# Move Tutor ROM Sweep

Date: 2026-05-31

## Scope

This pass checked whether the move tutor tab was missing additional ROM-backed tutors after the two unresolved cards appeared under `Additional tutors`.

## Strict Tutor Pattern

The recovered tutor command pattern is:

```text
1A 00 80 <move_id u16>
1A 01 80 01 00
09 00 21
```

A direct sweep of `source_working/Pokemon_Emerald_patched_provided_working.gba` found 34 strict hits. That exactly matches the 34 rows already present in `normalized_json/move_tutors.json` / `move_tutors_enriched.json`.

## Anchor Checks

Strict tutor-pattern hits were not found for:

- `Blast Burn`
- `Frenzy Plant`
- `Hydro Cannon`
- `Draco Meteor`
- `Giga Drain`
- `Knock Off`
- `Thunderbolt`

Some of those values appear in broader script variable scans, but they are not in the recovered tutor command path. For example, `Hydro Cannon` appears as value `308` near script call `0x2900`; the same numeric value also resolves to item `Steelixite` and species `Medicham`, so it is not safe to list as a tutor without handler evidence.

## Location Corrections

- `BanefulBunkr`: raw object-owner candidate is map `3/3`; that map has a single exit to map `0/0`, which the frontend location data names `Azalea Town`.
- `Swords Dance`: map evidence includes `24/66`, which the extraction lab map index names `Cherrygrove House`; the move tutor page now groups this under `Cherrygrove City` and shows `Cherrygrove House` as the specific spot.

## Conclusion

No additional high-confidence move tutors were found beyond the existing 34 strict tutor-pattern rows. Candidate values outside the `09 00 21` tutor path remain unsafe to display as move tutors.
