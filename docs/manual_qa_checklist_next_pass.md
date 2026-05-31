# Manual QA Checklist For Next Pass

Date: 2026-05-29

## Global

- Confirm the silver/gold/near-black visual direction is present and readable.
- Confirm mobile layout is usable on narrow widths.
- Confirm search works for Pokémon, moves, items, abilities, machines, and locations.
- Confirm no page falls back to XY Disruption gameplay content.

## Pokémon

- No blank `#-` Pokémon entry appears.
- No sentinel Pokémon appears in lists, search, compatibility, encounters, or acquisition views.
- Pokémon detail pages show name, types, stats, abilities, evolution data, learnsets, locations, and machine compatibility.
- Duplicate/form names are distinguishable by ID or context.
- Sprites use modern remote image logic or neutral placeholders.

## Abilities

- No blank/sentinel ability appears.
- Ability labels read `Ability 1` and `Ability 2` unless a true hidden slot is proven.
- Missing descriptions display cleanly as unavailable instead of breaking layout.

## Moves

- Move descriptions appear when present in extracted data.
- Status/no-power moves display `—` for power.
- Accuracy, PP, type, category, and effect fields are readable.
- Move tutor links and move pages agree on move names/IDs.

## Machines

- Only TM01-TM50 and HM01-HM08 appear.
- TM51-TM100 do not appear as valid machines.
- Machine move names resolve correctly.
- Compatibility counts exclude sentinel Pokémon.
- Very broad compatibility, if present, is visibly based on Scorched Silver data.

## Move Tutors

- Tutor rows show move, location, script/dialogue context, and caveats.
- Tutor UI does not show raw `Requirement unknown` as the only information.
- Tutor compatibility is handled through the available Scorched Silver compatibility data or clearly caveated.

## Items

- No blank/sentinel item appears.
- Item images use modern remote icon logic or a neutral placeholder.
- Item detail pages show ROM-backed and documentation-backed locations distinctly.
- Old XY item/location fallback data does not appear.

## Locations And Acquisition

- Route/location names are readable and consistent where evidence exists.
- Candidate/uncertain map names show caveats instead of invented certainty.
- Encounter methods are grouped under their linked location.
- Shops, static/gift Pokémon, script rewards, hidden items, item balls, and move tutors appear in acquisition/location views where available.
- Acquisition entries preserve confidence labels and source distinctions.
