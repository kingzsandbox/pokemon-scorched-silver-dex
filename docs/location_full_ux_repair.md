# Location Full UX Repair

Date: 2026-05-29

Repairs completed:

- Raw `Map X/Y` names are no longer used as primary location titles when no canonical name was recovered; they display as `Unlabeled Area`.
- Map references and confidence are moved into polished supporting text.
- `medium_high`, `unknown`, and handler/script confidence strings are translated into user-facing wording.
- Location pages group encounters, found items, shops, gift/static Pokémon, tutors, and script rewards.
- Shop and reward labels no longer expose raw IDs as the primary display.

Remaining caveat:

- Some ROM maps still do not have canonical recovered names. These are intentionally shown as `Unlabeled Area` with a ROM map reference rather than invented names.
