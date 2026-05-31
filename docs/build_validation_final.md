# Build Validation Final

Date: 2026-05-29

## Required Checks

### Typecheck

Command:

```powershell
npm run typecheck
```

Result: passed.

Elapsed behavior: completed normally in about 8 seconds.

### Direct Next Build

Command:

```powershell
node node_modules/next/dist/bin/next build
```

Result: passed.

Elapsed behavior: completed normally in about 32 seconds.

Important output:

- Compiled successfully.
- Generated static pages: `13/13`.
- Built dynamic detail routes for Pokémon, moves, items, locations, machines, abilities, search, and home.

### Optional npm Build Attempt

Command:

```powershell
npm run build
```

Result: hung/timed out.

Elapsed behavior:

- Bounded to 50 seconds.
- Printed only the npm script line and Next banner.
- Did not enter the normal build output that appears when the direct command is used.
- No orphaned Node/npm/Next processes remained afterward.

## Production Server Check

Command:

```powershell
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3031
```

Result: started successfully after a direct build.

Smoke URL:

```text
http://127.0.0.1:3031/
```

Result: HTTP 200.

## Final Recommended Commands

Build:

```powershell
node node_modules/next/dist/bin/next build
```

Production server:

```powershell
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
```

Development server:

```powershell
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000
```
