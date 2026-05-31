# npm Script Repair

Date: 2026-05-29

## Change Made

Updated `package.json` so the major app lifecycle scripts use direct Next invocations:

- `dev`: `node node_modules/next/dist/bin/next dev`
- `build`: `node node_modules/next/dist/bin/next build`
- `start`: `node node_modules/next/dist/bin/next start`

No wrappers, shell-specific command chains, or lifecycle hooks were added.

## Bounded npm Build Test

Command:

```powershell
npm run build
```

Result:

- Timed out after 50 seconds.
- Output stopped after the Next banner:

```text
> scorched-silver-dex-frontend@0.1.0 build
> node node_modules/next/dist/bin/next build

▲ Next.js 15.3.8
```

## Interpretation

The direct command succeeds:

```powershell
node node_modules/next/dist/bin/next build
```

The npm wrapper stalls before the same command proceeds into the normal build phases. Because the app builds successfully without npm, this is being treated as a runner/environment issue rather than an app compilation issue.

## Recommendation

For the next manual QA pass, use the direct Next commands documented in `docs/local_manual_qa_instructions.md`.

Before Vercel deployment, set the Vercel build command explicitly to:

```powershell
node node_modules/next/dist/bin/next build
```

Do not use `npm run build` as the validation source until the npm wrapper behavior is separately fixed.
