# Scorched Silver Custom Sprite Sources

Date: 2026-05-29

Source page:

`https://www.pokecommunity.com/threads/pok%C3%A9mon-scorched-silver-v1-3-complete.529230/`

The PokéCommunity thread embeds a starter-form banner image:

`https://data.pokecommunity.com/attachments/79/79141-03f5f87712cee09805e656b7cb0e1d43.jpg?hash=A_X4dxLO4J`

That image shows four Scorched Silver starter forms:

1. Typhlosion: Fire/Dark
2. Meganium: Grass/Fairy
3. Feraligatr: Water/Dragon
4. Typhlosion: Fire/Ghost

The frontend evolution data links these species to Mega-stone-style forms:

| Species ID | Frontend name | Evolution evidence | Local sprite |
|---:|---|---|---|
| 1234 | Mega Typhlosion | Typhlosionite from Typhlosion | `/sprites/scorched-custom/mega-typhlosion.png` |
| 1235 | Mega Meganium | Meganiumite from Meganium | `/sprites/scorched-custom/mega-meganium.png` |
| 1236 | Mega Feraligatr | Feraligatite from Feraligatr | `/sprites/scorched-custom/mega-feraligatr.png` |
| 1237 | Mega Typhlosion (Hisui) | Typhlosionite from Hisuian Typhlosion | `/sprites/scorched-custom/mega-typhlosion-hisui.png` |

## Processing

The four sprites were cropped from the source banner, had their panel backgrounds removed, and were saved locally as transparent PNGs. This avoids depending on unstable hotlinked presentation images and replaces the earlier generic/base/Showdown fallback art.
