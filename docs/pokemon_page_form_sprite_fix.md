# Pokemon Page Form Sprite Fix

Date: 2026-05-29

## Root Cause

The Pokemon detail page Forms section used `getPokemonMiniSpriteSources`, which resolved expanded forms through remote Pokemon Showdown URLs. In the rendered browser, the Slowbro form-card URLs loaded as broken images:

- `https://play.pokemonshowdown.com/sprites/gen5/slowbro-mega.png`
- `https://play.pokemonshowdown.com/sprites/gen5/slowbro-galar.png`

The rendered image elements reported `naturalWidth: 0` and `naturalHeight: 0`, so the Forms cards appeared blank even though the source strings looked plausible in code.

## Fix

The affected form sprites were localized and routed through the same sprite resolver used by detail pages, form cards, and evolution tiles.

| Form | Species ID | Previous Source | New Source |
|---|---:|---|---|
| Mega Slowbro | 913 | Remote Showdown URL | `/sprites/pokemon-forms/slowbro-mega.png` |
| Slowbro (Galar) | 978 | Remote Showdown URL | `/sprites/pokemon-forms/slowbro-galar.png` |
| Typhlosion (Hisui) | 997 | Remote Showdown URL | `/sprites/pokemon-forms/typhlosion-hisui.png` |
| Slowking (Galar) | 985 | Remote Showdown URL | `/sprites/pokemon-forms/slowking-galar.png` |
| Mega Typhlosion | 1234 | Scorched custom source | `/sprites/scorched-custom/mega-typhlosion.png` |
| Mega Meganium | 1235 | Scorched custom source | `/sprites/scorched-custom/mega-meganium.png` |
| Mega Feraligatr | 1236 | Scorched custom source | `/sprites/scorched-custom/mega-feraligatr.png` |
| Mega Typhlosion (Hisui) | 1237 | Scorched custom source | `/sprites/scorched-custom/mega-typhlosion-hisui.png` |

The Scorched custom starter sprites came from the Pokemon Scorched Silver PokéCommunity page:

`https://www.pokecommunity.com/threads/pok%C3%A9mon-scorched-silver-v1-3-complete.529230/`

## Rendered Validation

Rendered validation is recorded in `docs/rendered_pokemon_page_sprite_ability_validation.md`.
