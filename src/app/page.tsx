import HomeShell from "./home-shell";
import type { ItemEntry } from "../lib/types";
import { getAbilities, getAbilityDescription, getAbilityDisplayName } from "../lib/data/abilities";
import { getMachineBrowseEntries } from "../lib/data/compatibility";
import { getBrowseItems } from "../lib/data/items";
import { getLocationGroupSummary, getLocationGroups } from "../lib/data/locations";
import { getMoves } from "../lib/data/moves";
import { getBrowsablePokedexPokemon, getPokedexListPokemon, getPokemonFormGroup } from "../lib/data/pokemon";
import { getPokemonMiniSprite, getPokemonMiniSpriteSources } from "../lib/assets";
import { getMoveEffectSummary, getPokemonAbilityDisplayRows } from "../lib/data/vanilla";
import { getPokemonFormKind } from "../lib/presentation";

type HomePageProps = {
  searchParams: Promise<{
    tab?: string;
    focus?: string;
    form?: string;
  }>;
};

export const dynamic = "force-dynamic";

const validTabs = new Set([
  "pokedex",
  "locations",
  "items",
  "moves",
  "machines",
  "abilities",
]);

type PokemonFormFilter = "all" | "mega" | "regional" | "alternate";
const validFormFilters = new Set<PokemonFormFilter>(["mega", "regional", "alternate"]);

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tab, focus, form } = await searchParams;
  const activeTab = validTabs.has(tab ?? "") ? tab ?? "pokedex" : "pokedex";
  const pokemonFilter: PokemonFormFilter = validFormFilters.has(form as PokemonFormFilter) ? (form as PokemonFormFilter) : "all";

  const pokemon =
    activeTab === "pokedex"
      ? (pokemonFilter === "all" ? getPokedexListPokemon() : getBrowsablePokedexPokemon().filter((entry) => getPokemonFormKind(entry) === pokemonFilter))
          .map((entry) => {
            const formGroup = getPokemonFormGroup(entry);
            const formKinds = [
              ...new Set(formGroup.map((formEntry) => getPokemonFormKind(formEntry)).filter((kind) => kind !== "base")),
            ];

            return {
              id: entry.id,
              slug: entry.slug,
              dexNumber: entry.dexNumber,
              name: entry.name,
              types: entry.types,
              abilities: getPokemonAbilityDisplayRows(entry),
              spriteSrc: getPokemonMiniSprite(entry),
              spriteScale: getPokemonMiniSpriteSources(entry).visualScale,
              baseStats: entry.baseStats,
              formCount: pokemonFilter === "all" ? formGroup.length : 0,
              formKinds,
            };
          })
      : [];

  const locations =
    activeTab === "locations"
      ? getLocationGroups().map((entry) => ({
          id: entry.id,
          slug: entry.slug,
          name: entry.name,
          region: getLocationGroupSummary(entry),
        }))
      : [];

  const items =
    activeTab === "items"
      ? (getBrowseItems() as ItemEntry[])
      : [];

  const moves =
    activeTab === "moves"
      ? getMoves().map((entry) => ({
          id: entry.id,
          slug: entry.slug,
          name: entry.name,
          type: entry.type,
          category: entry.category,
          power: entry.power,
          accuracy: entry.accuracy,
          pp: entry.pp,
          effectSummary: getMoveEffectSummary(entry.id) ?? "No effect summary listed.",
        }))
      : [];

  const machines =
    activeTab === "machines"
      ? getMachineBrowseEntries().map(({ machine, move }) => ({
          id: machine.id,
          slug: machine.slug,
          code: machine.code,
          moveName: move?.name ?? machine.name.split(" - ")[1] ?? machine.name,
          moveType: move?.type ?? null,
          category: move?.category ?? null,
          power: move?.power ?? null,
          accuracy: move?.accuracy ?? null,
          pp: move?.pp ?? null,
          effectSummary: move ? getMoveEffectSummary(move.id) ?? move.notes ?? "—" : "—",
        }))
      : [];

  const abilities =
    activeTab === "abilities"
      ? getAbilities().map((entry) => ({
          id: entry.id,
          slug: entry.slug,
          name: getAbilityDisplayName(entry),
          description: getAbilityDescription(entry),
        }))
      : [];

  return (
    <HomeShell
      pokemon={pokemon}
      locations={locations}
      items={items}
      moves={moves}
      machines={machines}
      abilities={abilities}
      battles={[]}
      levelCaps={[]}
      activeTab={activeTab as "pokedex" | "locations" | "items" | "moves" | "machines" | "abilities"}
      focusedSlug={focus ?? null}
      pokemonFilter={pokemonFilter}
    />
  );
}

