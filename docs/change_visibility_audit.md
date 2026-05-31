# Change Visibility Audit

Date: 2026-05-29

## Clean App Folder

Working folder:

```text
C:\Users\ReySilva\OneDrive - Sur\Documents\Pokedex making\scorched-silver-dex-app-clean
```

The latest form sprite fixes are present in this folder.

## Files Containing Latest Fixes

- `src/lib/assets.ts`
  - Contains `expandedPokemonSpriteSlugs`.
  - Contains explicit mappings such as `997: "typhlosion-hisui"` and `981: "mrmime-galar"`.
  - Uses `https://play.pokemonshowdown.com/sprites/gen5` for expanded/form sprites.
  - No longer forces all `dexNumber >= 906` species to a generic placeholder.
- `docs/form_sprite_audit.md`
  - Present.
  - Last write time observed: 2026-05-29 13:05.
- `docs/form_sprite_mapping_repairs.md`
  - Present.
  - Last write time observed: 2026-05-29 13:11.

## Port 3000 / Stale Server

Before restart, port `127.0.0.1:3000` was already occupied by:

```text
PID: 11436
Command: "C:\Program Files\nodejs\node.exe" node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
Created: 2026-05-29 12:22
```

This was an old Next server. It was stopped safely because it was clearly a local Next server on port 3000.

After stopping it, port 3000 was no longer listening.

## Fresh Server

After clearing `.next` and rebuilding, the fresh server is now:

```text
PID: 35524
Command: "C:\Program Files\nodejs\node.exe" node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
Created: 2026-05-29 13:19
```

## Likely Cause

The user was seeing a stale server/build, not the latest clean app changes. The old server was still bound to port 3000 from before the form sprite pass.
