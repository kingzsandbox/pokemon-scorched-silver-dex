# Local Run Root Cause

Date: 2026-05-29

## Findings

The app itself starts correctly from the clean root.

Validated:

- Build creates `.next`.
- `public/data` exists.
- Port `3000` was free before start.
- Server listens on `127.0.0.1:3000`.
- Node/Next process stays alive while the terminal/process is running.
- Home route returns HTTP `200`.
- Pokémon, move, and item detail routes return HTTP `200`.
- No runtime exception appeared in captured stderr.

## Most Likely User-Facing Cause

Because the exact direct commands work in reproduction, the local website failure is most likely operational rather than code-related:

1. The command may have been run from the wrong folder.
2. The server terminal may have been closed after starting the site.
3. Another process may have been using port `3000` during the user's attempt.
4. The browser may have been pointed at the wrong URL or a stale route.

## Fix

Created `run-local.ps1` to remove ambiguity.

The script:

- Sets the working directory to the clean app root automatically.
- Verifies `node_modules` exists.
- Verifies `public/data` exists.
- Checks whether port `3000` is already in use.
- Runs the direct Next production build.
- Starts the direct Next production server on `127.0.0.1:3000`.
- Prints the exact URL to open.
- Keeps the server attached to the PowerShell window.

## Important Usage Detail

The terminal window must stay open while manually QAing the site. Closing the terminal stops the local website.
