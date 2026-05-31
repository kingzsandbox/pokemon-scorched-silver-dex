# Local Run Instructions

Date: 2026-05-29

## Recommended One-Command Runner

Open PowerShell and run:

```powershell
& "C:\Users\ReySilva\OneDrive - Sur\Documents\Pokedex making\scorched-silver-dex-app-clean\run-local.ps1"
```

When the script says the server is ready, open:

```text
http://127.0.0.1:3000/
```

Keep the PowerShell window open while using the site. Press `Ctrl+C` in that window to stop the site.

## Manual Commands

If you prefer to run the steps manually:

```powershell
cd "C:\Users\ReySilva\OneDrive - Sur\Documents\Pokedex making\scorched-silver-dex-app-clean"
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
```

Then open:

```text
http://127.0.0.1:3000/
```

## If PowerShell Blocks The Script

Run this version:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\ReySilva\OneDrive - Sur\Documents\Pokedex making\scorched-silver-dex-app-clean\run-local.ps1"
```

## If Port 3000 Is Busy

Close any previous terminal running the app, or stop the process using port `3000`, then run `run-local.ps1` again.

## First QA Pages

- Home: `http://127.0.0.1:3000/`
- Pokémon: `http://127.0.0.1:3000/pokemon/1-bulbasaur`
- Move: `http://127.0.0.1:3000/moves/14-swords-dance`
- Item: `http://127.0.0.1:3000/items/1-pok-ball`
- TM/HM: `http://127.0.0.1:3000/machines/tm01`
- Move Tutors: `http://127.0.0.1:3000/move-tutors`
- Locations: `http://127.0.0.1:3000/locations/g0-m16-route-29`
