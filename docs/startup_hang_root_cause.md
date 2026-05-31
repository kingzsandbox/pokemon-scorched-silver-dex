# Startup Hang Root Cause

Date: 2026-05-29

## Result

The current clean app root does not hang in Next startup when the real direct Next entrypoint is used:

```powershell
node node_modules/next/dist/bin/next build
```

After removing stale wrapper scripts, the command reached:

```text
Creating an optimized production build ...
```

and completed successfully.

## Offending File

The offending files were stale wrapper scripts left from earlier npm-wrapper experiments:

- `scripts/build-next.js`
- `scripts/build-next.cmd`
- `scripts/build-next.ps1`

These wrappers were removed.

## Offending Import / Invocation

There was no offending app import chain found that prevented Next startup.

The problematic invocation was the custom wrapper path, especially:

```powershell
node scripts/build-next.js
```

The JavaScript wrapper spawned Next in a detached child process with inherited stdio:

```js
spawn(process.execPath, [nextBin, "build"], {
  detached: true,
  stdio: "inherit",
});
```

In this Windows/OneDrive shell environment, that wrapper could print the Next banner and then leave the caller waiting in a confusing state. It made the failure look like a Next startup hang before compilation.

## Top-Level Import Audit

Reviewed the app startup/config path:

- `next.config.ts`
- `src/app/layout.tsx`
- `src/lib/search.ts`
- `src/lib/data/core.ts`
- `src/lib/data/acquisition.ts`
- `src/lib/data/compatibility.ts`
- `src/lib/data/items.ts`
- `src/lib/data/pokemon.ts`

Findings:

- `next.config.ts` is minimal and does not scan directories or load data.
- `src/app/layout.tsx` imports `getSearchIndex`, but this executes during render/build collection, not before the Next compilation banner.
- `src/lib/data/core.ts` does synchronously read multiple JSON files at module scope.
- `src/lib/data/acquisition.ts` synchronously reads acquisition/tutor JSON at module scope.
- `src/lib/data/items.ts` statically imports `pokemon-evolutions.json`.
- These data imports are heavier than ideal, but they do not block startup in the current clean root. The direct build reaches compilation and completes.

## Why It Hung

The observed “Next banner, then nothing useful” behavior was caused by stale build wrappers, not by a route, layout, data loader, or Next config import.

The wrappers obscured the real process boundary and were a bad fit for this shell environment. Removing them eliminates that false startup-blocker path.

## Exact Fix

1. Deleted stale wrapper files:

   - `scripts/build-next.js`
   - `scripts/build-next.cmd`
   - `scripts/build-next.ps1`

2. Kept `package.json` lifecycle scripts simple:

   - `dev`: `node node_modules/next/dist/bin/next dev`
   - `build`: `node node_modules/next/dist/bin/next build`
   - `start`: `node node_modules/next/dist/bin/next start`

3. Validated the direct build:

   ```powershell
   node node_modules/next/dist/bin/next build
   ```

## Validation

Command:

```powershell
node node_modules/next/dist/bin/next build
```

Result:

- Reached `Creating an optimized production build ...`
- Compiled successfully.
- Generated static pages `13/13`.
- Completed successfully in about 24 seconds.

## Remaining Note

The shared data layer still performs module-scope JSON reads. This is not the current startup blocker, but a future performance cleanup could move those reads behind lazy cached functions to reduce build/render memory pressure.
