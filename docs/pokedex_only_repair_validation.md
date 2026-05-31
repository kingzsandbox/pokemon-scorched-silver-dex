# Pokédex-Only Repair Validation

Date: 2026-05-29

## Commands

- `npm run typecheck`
- `node node_modules/next/dist/bin/next build`
- `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000`

## Results

- Typecheck: passed.
- Direct Next build: passed.
- Local server: running at `http://127.0.0.1:3000/`.
- QA marker: `Scorched Silver Dex QA build: 2026-05-29 18:38 PDT`.

## Rendered Routes Checked

- `/pokemon`
- `/pokemon/157-typhlosion`
- `/pokemon/997-typhlosion`
- `/pokemon/1234-typhlosion`
- `/pokemon/1237-typhlosion`
- `/pokemon/1235-meganium`
- `/pokemon/1236-feraligatr`
- `/pokemon/80-slowbro`
- `/pokemon/978-slowbro`
- `/pokemon/122-mr-mime`
- `/pokemon/981-mr-mime`
- `/pokemon/334-altaria`
- `/pokemon/938-altaria`
- `/pokemon/948-lucario`
- `/pokemon/1-bulbasaur`

## Rendered Checks

- No checked page showed `Species ####` in the normal display name.
- No checked page showed `Offensive Matchups`.
- Checked Pokémon detail pages showed `Defensive Matchups`.
- Typhlosion forms showed canonical labels.
- Mega Altaria and Mega Lucario showed Mega labels.
- Ability labels matched explicit ability slots.
- Pokédex list uses grouped base entries and form counts instead of every alternate form as a top-level row.
