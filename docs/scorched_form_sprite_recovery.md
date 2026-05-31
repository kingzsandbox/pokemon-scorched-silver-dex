# Scorched Form Sprite Recovery

Date: 2026-05-29

This pass checked the custom Johto starter forms from rendered frontend data and public sprite sources. The frontend evolution data confirms these are Mega-form entries:

| Species ID | Display name | Evidence | Sprite source used | Validation result |
|---:|---|---|---|---|
| 1234 | Mega Typhlosion | `pokemon-evolutions.json`: `Typhlosionite` -> `pokemon-1234` | Species-specific fallback: `https://play.pokemonshowdown.com/sprites/gen5/typhlosion.png` | Exact Mega Typhlosion sprite not found in accessible sources during this pass. |
| 1235 | Mega Meganium | `pokemon-evolutions.json`: `Meganiumite` -> `pokemon-1235` | `https://play.pokemonshowdown.com/sprites/gen5/meganium-mega.png` | Rendered route uses the Mega Meganium sprite. |
| 1236 | Mega Feraligatr | `pokemon-evolutions.json`: `Feraligatite` -> `pokemon-1236` | `https://play.pokemonshowdown.com/sprites/gen5/feraligatr-mega.png` | Rendered route uses the Mega Feraligatr sprite. |
| 1237 | Mega Typhlosion (Hisui) | `pokemon-evolutions.json`: Hisuian Typhlosion + `Typhlosionite` -> `pokemon-1237` | Species-specific fallback: `https://play.pokemonshowdown.com/sprites/gen5/typhlosion-hisui.png` | Exact Hisuian Mega Typhlosion sprite not found in accessible sources during this pass. |

## Sources Checked

- Scorched Silver wiki image API: `https://pokemon-scorched-silver.fandom.com/api.php?action=query&list=allimages&ailimit=500&format=json`
- PokéCommunity thread URL candidates: direct HTTP requests returned Cloudflare/403 from this environment, so I did not scrape or bypass it.
- Pokémon Showdown sprite paths:
  - `meganium-mega.png`: HTTP 200
  - `feraligatr-mega.png`: HTTP 200
  - `typhlosion-mega.png`: HTTP 404
  - Hisuian/Typhlosion Mega slug variants tested: HTTP 404

## Current Caveat

Mega Typhlosion and Mega Typhlosion (Hisui) still need the actual Scorched Silver sprite source if the user can provide a direct image URL or if the PokéCommunity page becomes accessible without a challenge page. The UI now avoids generic placeholders for them and uses species-specific Typhlosion fallbacks until an exact sprite is available.
