# Rendered Site Truth Check

Date: 2026-05-29

## Clean Start

- Stopped the existing Node/Next listener on port 3000.
- Removed `.next`.
- Rebuilt with `node node_modules/next/dist/bin/next build`.
- Started the production server with `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000`.

## Running Process

- Server address: `http://127.0.0.1:3000/`
- Listening address: `127.0.0.1:3000`
- Current server PID is stored in `temp-next-server.pid`.

## Build Marker

Visible marker:

`Scorched Silver Dex QA build: 2026-05-29 14:04 PDT`

## Rendered Proof

- Route checked: `/`
- HTTP status: 200
- Rendered HTML contains the marker: yes

This confirms the running site is serving the latest rebuilt app, not a stale server or old `.next` output.
