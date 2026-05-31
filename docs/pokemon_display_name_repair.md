# Pokémon Display Name Repair

Date: 2026-05-29

## Change

Normal user-facing names no longer append `Species ####`.

## Display Rules

- Mega forms render as `Mega [Name]`.
- Primal forms render as `Primal [Name]`.
- Regional forms render as `[Name] (Alola)`, `[Name] (Galar)`, or `[Name] (Hisui)`.
- Scorched Silver custom final starter forms render with polished custom labels.
- Species IDs remain internal and are shown only as Pokédex numbers, not as name disambiguators.

## Specific Validated Names

- `/pokemon/997-typhlosion`: `Typhlosion (Hisui)`
- `/pokemon/1234-typhlosion`: `Typhlosion (Scorched Form)`
- `/pokemon/1237-typhlosion`: `Typhlosion (Ascended Form)`
- `/pokemon/1235-meganium`: `Meganium (Scorched Form)`
- `/pokemon/1236-feraligatr`: `Feraligatr (Scorched Form)`
- `/pokemon/978-slowbro`: `Slowbro (Galar)`
- `/pokemon/981-mr-mime`: `Mr. Mime (Galar)`
- `/pokemon/938-altaria`: `Mega Altaria`
- `/pokemon/948-lucario`: `Mega Lucario`

## Rendered Validation

The target Pokédex routes returned HTTP 200 and visible rendered text did not contain `Species ####`.
