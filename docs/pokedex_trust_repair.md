# Pokedex Trust Repair

Date: 2026-05-29

Repairs completed:

- Valid Scorched Silver species/form IDs remain separate frontend entries.
- Duplicate names are not used as routing keys; routes use species slugs with numeric IDs.
- Sentinel and blank species remain excluded.
- Expanded species/form sprites use species-ID-specific mappings, not name matching.
- Typhlosion, Mr. Mime, Meganium, and Feraligatr custom/variant IDs are handled intentionally.
- Species `1234`, `1235`, and `1236` use species-specific base-family sprites when a proven custom sprite is not available.
- Species `1237` maps to the Hisuian Typhlosion sprite.

Remaining caveat:

- Custom Scorched-only variants without a proven public form sprite intentionally avoid guessed art.
