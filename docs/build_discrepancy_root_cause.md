# Build Discrepancy Root Cause

Date: 2026-05-29

## What I Previously Reported

I previously reported that:

- `node node_modules/next/dist/bin/next build` completed successfully.
- The production server started.
- The homepage returned HTTP `200`.

Those results were real for the non-interactive shell path I used, but they did not match the user's actual interactive run path.

## What The User Screenshots Show

The screenshots show this command being run from a PowerShell 7 terminal:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\ReySilva\OneDrive - Sur\Documents\Pokedex making\scorched-silver-dex-app-clean\run-local.ps1"
```

That command explicitly launches `powershell.exe`, which is Windows PowerShell 5.1, not PowerShell 7.

The visible output was:

```text
Building production app...
▲ Next.js 15.3.8
```

It never reached:

```text
Creating an optimized production build ...
```

The browser showed:

```text
127.0.0.1 refused to connect
```

That is expected because the build never completed and the server never started.

## Why The Reports Differed

The successful validation used the direct Next command from the current PowerShell 7/non-interactive tool environment:

```powershell
node node_modules/next/dist/bin/next build
```

The user's failing path used Windows PowerShell 5.1 as an intermediate launcher:

```powershell
powershell -ExecutionPolicy Bypass -File run-local.ps1
```

Reproducing that exact launcher path caused the same failure pattern:

```text
Scorched Silver Dex local runner
Building production app...
▲ Next.js 15.3.8
```

and then no `Creating an optimized production build ...` within the bounded test window.

PowerShell 7 behaved differently: it progressed past Next startup and into the build.

## Actual Root Cause

There were two local-run issues:

1. `run-local.ps1` could be launched by Windows PowerShell 5.1 via `powershell.exe`. In this environment, Next 15.3.8 launched from Windows PowerShell 5.1 can hang before the build startup line.

2. A stale `.next` directory contained OneDrive reparse-point files under `.next/diagnostics`, including `framework.json`. A later relaunch attempt exposed:

```text
EINVAL: invalid argument, readlink '.next\diagnostics\framework.json'
```

This stale `.next` issue could make Next report a build failure, and the previous script did not force native command failures to stop execution.

## Exact Fix

Updated `run-local.ps1` to:

1. Detect Windows PowerShell 5.1.
2. Relaunch itself under PowerShell 7 (`pwsh.exe`) before running Next.
3. Clear stale `.next` before building.
4. Enable `$PSNativeCommandUseErrorActionPreference = $true` under PowerShell 7 so a failed native build stops the script instead of continuing to `next start`.

Relevant behavior now:

```text
Windows PowerShell 5.1... can hang before Next.js build startup.
Relaunching this runner with PowerShell 7...
Clearing stale .next build output...
Building production app...
▲ Next.js 15.3.8
Creating an optimized production build ...
...
Build complete.
Starting local server...
✓ Ready in 716ms
```

## Validation After Fix

Re-tested the user-style command path through `powershell.exe`:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\ReySilva\OneDrive - Sur\Documents\Pokedex making\scorched-silver-dex-app-clean\run-local.ps1"
```

Bounded validation results:

- Relaunched under PowerShell 7: yes.
- Cleared stale `.next`: yes.
- Reached `Creating an optimized production build ...`: yes.
- Compiled successfully: yes.
- Printed `Build complete`: yes.
- Started production server: yes.
- Printed `Ready`: yes.
- Homepage returned HTTP `200`: yes.

## Correct User Command Going Forward

Either command now works because the script self-corrects to PowerShell 7:

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\ReySilva\OneDrive - Sur\Documents\Pokedex making\scorched-silver-dex-app-clean\run-local.ps1"
```

or:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "C:\Users\ReySilva\OneDrive - Sur\Documents\Pokedex making\scorched-silver-dex-app-clean\run-local.ps1"
```

Keep the terminal window open while manually QAing the site.
