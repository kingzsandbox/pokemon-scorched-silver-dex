# Location QA Repair Notes

Date: 2026-05-30

## Changes made

- Renamed the location-page section `Acquisition Notes` to `Other Obtainables`.
  - This section is still needed because it contains shops, move tutors, gift/static Pokémon, and script rewards tied to the map.
- Fixed encounter-rate formatting.
  - Frontend encounter data stores slot rates as whole percentages.
  - `rate: 1` now renders as `1%`, not `100%`.
- Grouped water-only names like `Surf And Fish Ecruteak` under their parent location as `Surf / Fishing`.
- Cleaned encounter method labels such as `rock_smash` to `Rock Smash`.
- Kept `Underwater` out of the location landing page.
  - Current extracted data has seven underwater ROM maps (`0/50` through `0/56`) with encounter rows.
  - The extracted map/location index does not identify which route/city each underwater map belongs to.
  - These should be modeled as a `Dive / Underwater` option under parent routes once parent linkage is recovered; they should not appear as standalone location pages.
- Cleaned documentation-backed item-location text into a shorter user-facing label.

## Validation

Rendered HTTP checks were run against:

- `/?tab=locations`
- `/locations/dark-cave`
- `/locations/safari-zone`
- `/locations/ecruteak`
- `/locations/route-32`

Checks passed:

- No `Acquisition Notes` text.
- No `Map #/#` text on tested rendered routes.
- No standalone `Surf And Fish Ecruteak`.
- No `Shared Surf Encounters`.
- No standalone `Underwater`.
- No `100%` encounter-rate display on tested routes.
- No `_candidate` wording on tested routes.
- Safari Zone appears as one parent page with seven mapped areas.

## Remaining caveat

Dark Cave has three ROM-backed encounter maps, but the current extracted data names all three only as `Dark Cave`; it does not recover exact in-game floor labels such as `1F` or `B1F`. The UI now labels those areas by encounter profile/level range rather than inventing floors.
