# Manual QA Checklist

Date: 2026-05-29

Use this checklist for the next manual QA pass.

1. No blank Pokémon entries appear anywhere.
2. No blank moves, items, or abilities appear anywhere.
3. Pokémon sprites look modern and not XY-specific.
4. Item icons are present, or missing icons use an acceptable neutral placeholder.
5. Move descriptions show on move detail pages.
6. Status/no-power moves show `—` for power.
7. Ability labels show `Ability 1` / `Ability 2` correctly.
8. TM/HM pages show only TM01-TM50 and HM01-HM08.
9. TM/HM compatibility counts look plausible.
10. Tutor pages show move, location/context, and compatibility where available.
11. Tutor requirements do not show raw broken `Requirement unknown` as the only context.
12. Item pages show ROM-backed and documentation-backed locations clearly.
13. Location pages have readable names and visible caveats when names are candidate/documentation-backed.
14. Shops/vendors display item inventories where extracted.
15. Static/gift Pokémon display where extracted.
16. Script rewards display where extracted.
17. Acquisition sections remain coherent across Pokémon, item, move, and location pages.
18. Silver/gold/near-black visual identity is consistent.
19. Mobile layout is usable.
20. Search returns Scorched Silver data only.

## Suggested First Routes

- `/`
- `/pokemon`
- `/pokemon/1-bulbasaur`
- `/pokemon/25-pikachu`
- `/pokemon/700-sylveon`
- `/moves/14-swords-dance`
- `/items/102-rare-candy`
- `/abilities/65-overgrow`
- `/machines/tm01`
- `/move-tutors`
- `/locations/g0-m16-route-29`
- `/locations/g24-m7-union-cave`
