# Package Script Audit

Date: 2026-05-29

## Scope

Audited `package.json` in:

`C:\Users\ReySilva\OneDrive - Sur\Documents\Pokedex making\scorched-silver-dex-app-clean`

## Current Scripts

- `dev`: `node node_modules/next/dist/bin/next dev`
- `build`: `node node_modules/next/dist/bin/next build`
- `start`: `node node_modules/next/dist/bin/next start`
- `typecheck`: `tsc --noEmit --incremental false`
- `lint`: `next lint`
- import scripts still use shell `&&`, but they are legacy import helpers and are not part of build/start/manual QA.

## Findings

- `build` invokes the same direct Next entrypoint that succeeds outside npm.
- `dev` already used the direct Next entrypoint.
- `start` previously used `next start`; it was changed to the direct Next entrypoint for consistency.
- No `prebuild`, `postbuild`, `prestart`, or `poststart` lifecycle hooks are defined.
- No complex shell syntax is used by `dev`, `build`, `start`, or `typecheck`.
- The npm build hang reproduces even when `npm run build` executes the same command that succeeds directly.

## Conclusion

The package scripts are simple and do not contain a clear app-level cause for the hang. The remaining problem is npm wrapper behavior in this Windows/OneDrive shell context, not Next compilation.
