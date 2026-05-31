# Change Visibility Validation

Date: 2026-05-29

## Clean Rebuild

Actions performed from the clean app folder:

```text
Removed .next
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
```

Build completed successfully and generated 13 static pages.

## HTTP Checks

All checks were performed against:

```text
http://127.0.0.1:3000
```

| URL | Status | Check | Result |
| --- | ---: | --- | --- |
| `/` | 200 | `Scorched Silver Dex QA build: 2026-05-29 13:16 PDT` | Present |
| `/pokemon/997-typhlosion` | 200 | `typhlosion-hisui.png` | Present |
| `/pokemon/981-mr-mime` | 200 | `mrmime-galar.png` | Present |

## Fresh Server

The server currently listening on port 3000 is the fresh clean-app server:

```text
PID: 35524
Command: "C:\Program Files\nodejs\node.exe" node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
```

## Browser Guidance

If the marker does not appear, the browser is showing cached/stale content. Hard refresh the page with:

```text
Ctrl+F5
```

The expected footer marker is:

```text
Scorched Silver Dex QA build: 2026-05-29 13:16 PDT
```
