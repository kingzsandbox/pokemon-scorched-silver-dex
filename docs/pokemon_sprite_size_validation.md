# Pokémon Sprite Size Validation

Date: 2026-05-29

## Change

Pokémon sprites now render inside consistent frames in the Pokédex list, Pokémon detail hero, form selector, and evolution tree.

## Applied Sizing

- Pokédex list: 74px frame with 68px contained sprite.
- Detail hero: 144px frame with 136px contained sprite.
- Form selector: 46px frame with 42px contained sprite.
- Evolution tree: 86px contained sprite.

## Rules

- Preserve aspect ratio.
- Use `object-fit: contain`.
- Keep layout dimensions stable.
- Keep pixel-art rendering for sprite assets.

## Rendered Validation

Checked `/pokemon`, Typhlosion form pages, Meganium/Feraligatr custom form pages, Mr. Mime/Galar, Mega Altaria, and Mega Lucario. Routes returned HTTP 200.
