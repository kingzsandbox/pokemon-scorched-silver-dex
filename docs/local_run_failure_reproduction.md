# Local Run Failure Reproduction

Date: 2026-05-29

## Exact Folder

`C:\Users\ReySilva\OneDrive - Sur\Documents\Pokedex making\scorched-silver-dex-app-clean`

## Preflight

- `.next` exists: yes
- `public/data` exists: yes
- JSON files in `public/data`: 27
- Port `3000` before start: no listener found
- Node executable: `C:\Program Files\nodejs\node.exe`

## Build Command

```powershell
node node_modules/next/dist/bin/next build
```

Result: passed.

Key output:

- Reached `Creating an optimized production build ...`
- Compiled successfully.
- Generated static pages `13/13`.
- Completed in about 28 seconds.

## Start Command

```powershell
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
```

Result: passed in controlled reproduction.

Captured server output:

```text
▲ Next.js 15.3.8
- Local:        http://127.0.0.1:3000
- Network:      http://127.0.0.1:3000

✓ Starting...
✓ Ready in 709ms
```

Server stayed running during HTTP checks.

Listener:

- Address: `127.0.0.1`
- Port: `3000`
- Owning process: Next/Node process started for validation

## HTTP Checks

| URL | Status | Result |
|---|---:|---|
| `/` | 200 | ok |
| `/pokemon/1-bulbasaur` | 200 | ok |
| `/moves/14-swords-dance` | 200 | ok |
| `/items/1-pok-ball` | 200 | ok |

## Reproduction Conclusion

The local run failure did not reproduce from the clean root with the direct commands. Build, start, listener, and representative HTTP routes all worked.
