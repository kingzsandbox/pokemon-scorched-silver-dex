# Manual QA Route Smoke Test

Date: 2026-05-29

## Method

Started the built production server with:

```powershell
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
```

Then requested representative routes with HTTP checks.

## Results

| Area | URL | HTTP status | Key content rendered | Error |
|---|---:|---:|---|---|
| Home | `/` | 200 | yes | none |
| Pokémon list | `/pokemon` | 200 | yes | none |
| Pokémon detail | `/pokemon/1-bulbasaur` | 200 | yes | none |
| Pokémon detail | `/pokemon/25-pikachu` | 200 | yes | none |
| Pokémon detail | `/pokemon/700-sylveon` | 200 | yes | none |
| Moves list | `/moves` | 200 | yes | none |
| Status/no-power move detail | `/moves/14-swords-dance` | 200 | yes | none |
| Move detail | `/moves/57-surf` | 200 | yes | none |
| Move detail | `/moves/85-thunderbolt` | 200 | yes | none |
| Items list | `/items` | 200 | yes | none |
| Item detail | `/items/1-pok-ball` | 200 | yes | none |
| Item detail | `/items/28-potion` | 200 | yes | none |
| Item detail | `/items/102-rare-candy` | 200 | yes | none |
| Abilities list | `/abilities` | 200 | yes | none |
| Ability detail | `/abilities/65-overgrow` | 200 | yes | none |
| TM/HM list | `/machines` | 200 | yes | none |
| TM detail | `/machines/tm01` | 200 | yes | none |
| Move tutor page | `/move-tutors` | 200 | yes | none |
| Locations list | `/locations` | 200 | yes | none |
| Location detail | `/locations/g0-m16-route-29` | 200 | yes | none |
| Location detail | `/locations/g0-m10-surf-cherrygrove` | 200 | yes | none |
| Location detail | `/locations/g24-m7-union-cave` | 200 | yes | none |
| Documentation-backed location detail | `/locations/doc-cherrygrove` | 200 | yes | none |

## Notes

An initial smoke attempt used guessed slugs for Potion, Rare Candy, Cherrygrove City, and Union Cave. Those guessed URLs returned `404` because the actual generated slugs differ. The corrected data-derived URLs above returned `200`.

Shop/vendor, static/gift Pokémon, script reward, and acquisition data are not separate standalone routes; they are expected to render inside item/location/acquisition sections.
