# Local Manual QA Instructions

Date: 2026-05-29

## Folder To Open

Use this clean app root going forward:

```powershell
cd "C:\Users\ReySilva\OneDrive - Sur\Documents\Pokedex making\scorched-silver-dex-app-clean"
```

## Build For Production QA

Use the direct Next command:

```powershell
node node_modules/next/dist/bin/next build
```

Do not use `npm run build` for the next QA pass; the npm wrapper is currently unreliable in this environment even though the direct build succeeds.

## Start Production Server

After the build completes:

```powershell
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
```

Open:

```text
http://127.0.0.1:3000/
```

## Start Dev Server

For live editing QA:

```powershell
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000
```

Open:

```text
http://127.0.0.1:3000/
```

## First Pages To Inspect

Start with these representative routes:

- Home: `http://127.0.0.1:3000/`
- Pokémon list: `http://127.0.0.1:3000/pokemon`
- Bulbasaur detail: `http://127.0.0.1:3000/pokemon/1-bulbasaur`
- Moves list: `http://127.0.0.1:3000/moves`
- Swords Dance detail: `http://127.0.0.1:3000/moves/14-swords-dance`
- Items list: `http://127.0.0.1:3000/items`
- Poké Ball detail: `http://127.0.0.1:3000/items/1-pok-ball`
- Abilities list: `http://127.0.0.1:3000/abilities`
- Overgrow detail: `http://127.0.0.1:3000/abilities/65-overgrow`
- Machines list: `http://127.0.0.1:3000/machines`
- TM01 detail: `http://127.0.0.1:3000/machines/tm01`
- Move tutors: `http://127.0.0.1:3000/move-tutors`
- Locations list: `http://127.0.0.1:3000/locations`
- Route 29 detail: `http://127.0.0.1:3000/locations/g0-m16-route-29`
