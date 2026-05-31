# Rendered Sprite Trust Audit

Date: 2026-05-29

Source of truth: running site at `http://127.0.0.1:3000/`.

## Rendered Checks

Checked rendered image tags on:

- `/`
- `/pokemon`
- `/pokemon/157-typhlosion`
- `/pokemon/1234-typhlosion`
- `/pokemon/978-slowbro`
- `/pokemon/938-altaria`
- `/pokemon/948-lucario`

## Standardized Frames

- Home Pokédex table: rendered Pokémon sprites now use `width="68" height="68"` inside a 74px framed cell.
- `/pokemon` list: rendered Pokémon sprites use `width="68" height="68"` inside a 74px framed card.
- Pokémon detail hero: rendered primary art/form sprite uses `width="136" height="136"` inside a 144px frame.
- Form selector: rendered form sprites use `width="42" height="42"` inside a 46px frame.
- Evolution tree: rendered sprites use `width="86" height="86"`.

## Sprite Source Evidence

- Typhlosion (Hisui): `https://play.pokemonshowdown.com/sprites/gen5/typhlosion-hisui.png`
- Slowbro (Galar): `https://play.pokemonshowdown.com/sprites/gen5/slowbro-galar.png`
- Mega Altaria: `https://play.pokemonshowdown.com/sprites/gen5/altaria-mega.png`
- Mega Lucario: `https://play.pokemonshowdown.com/sprites/gen5/lucario-mega.png`

## Placeholders

No generic placeholder was displayed as the primary rendered sprite on the checked pages. Neutral fallback images still exist in the React payload for network/image-load failure handling, but the rendered `src` values for checked Pokémon use species/form-specific sprite URLs.

## Known Intentional Fallbacks

Custom Scorched Silver-only forms without a public exact sprite use the closest family/form sprite:

- Typhlosion (Scorched Form): base Typhlosion sprite.
- Typhlosion (Ascended Form): Hisuian Typhlosion sprite.

These are intentional species-specific fallbacks, not generic placeholders.
