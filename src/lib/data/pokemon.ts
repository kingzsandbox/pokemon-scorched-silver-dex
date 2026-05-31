import { corePokemon } from "./core";
import { getPokemonDisplayName, getPokemonFormKind, isBrowsablePokedexPokemon } from "../presentation";
import type { PokemonEntry } from "../types";

function normalizePokemonEntry(entry: PokemonEntry): PokemonEntry {
  return {
    ...entry,
    types: [...new Set(entry.types.filter(Boolean))],
  };
}

const pokemon = (corePokemon as PokemonEntry[]).map(normalizePokemonEntry);
const pokemonById = new Map(pokemon.map((entry) => [entry.id, entry]));
const pokemonBySlug = new Map(pokemon.map((entry) => [entry.slug, entry]));
const megaPokemonByStone = new Map<string, PokemonEntry>();
const pokemonByBaseName = new Map<string, PokemonEntry[]>();

for (const entry of pokemon) {
  const key = entry.name.trim().toLowerCase();
  const entries = pokemonByBaseName.get(key) ?? [];
  entries.push(entry);
  pokemonByBaseName.set(key, entries);
}

for (const entries of pokemonByBaseName.values()) {
  entries.sort((left, right) => left.dexNumber - right.dexNumber);
}

const irregularMegaStoneNames: Record<string, string> = {
  "Mega Abomasnow": "Abomasite",
  "Mega Altaria": "Altarianite",
  "Mega Audino": "Audinite",
  "Mega Banette": "Banettite",
  "Mega Diancie": "Diancite",
  "Mega Gallade": "Galladite",
  "Mega Garchomp": "Garchompite",
  "Mega Heracross": "Heracronite",
  "Mega Lopunny": "Lopunnite",
  "Mega Lucario": "Lucarionite",
  "Mega Manectric": "Manectite",
  "Mega Sablenite": "Sablenite",
  "Mega Salamence": "Salamencite",
};

function getMegaStoneNames(entry: PokemonEntry): string[] {
  const displayName = getPokemonDisplayName(entry);
  if (!displayName.startsWith("Mega ")) {
    return [];
  }

  if (irregularMegaStoneNames[displayName]) {
    return [irregularMegaStoneNames[displayName]];
  }

  const megaLabel = displayName.slice(5).trim();
  switch (megaLabel) {
    case "Charizard X":
      return ["Charizardite X"];
    case "Charizard Y":
      return ["Charizardite Y"];
    case "Mewtwo X":
      return ["Mewtwonite X"];
    case "Mewtwo Y":
      return ["Mewtwonite Y"];
    default:
      return [`${megaLabel}ite`];
  }
}

for (const entry of pokemon) {
  for (const stoneName of getMegaStoneNames(entry)) {
    megaPokemonByStone.set(stoneName.toLowerCase(), entry);
  }
}

export function getAllPokemon(): PokemonEntry[] {
  return pokemon;
}

export function getBrowsablePokedexPokemon(): PokemonEntry[] {
  return pokemon.filter(isBrowsablePokedexPokemon);
}

export function getPokedexListPokemon(): PokemonEntry[] {
  return [...pokemonByBaseName.values()]
    .map((entries) => entries.find((entry) => entry.dexNumber <= 905) ?? entries[0])
    .filter((entry): entry is PokemonEntry => Boolean(entry) && isBrowsablePokedexPokemon(entry))
    .sort((left, right) => left.dexNumber - right.dexNumber);
}

function statSignature(entry: PokemonEntry): string {
  const stats = entry.baseStats;
  return [
    stats.hp,
    stats.attack,
    stats.defense,
    stats.specialAttack,
    stats.specialDefense,
    stats.speed,
  ].join("/");
}

function abilitySignature(entry: PokemonEntry): string {
  if (entry.abilitySlots) {
    return [
      entry.abilitySlots.ability1 ?? "",
      entry.abilitySlots.ability2 ?? "",
      entry.abilitySlots.hiddenAbility ?? "",
    ].join("/");
  }

  return entry.abilities.join("/");
}

function hasStatOrAbilityDifference(entry: PokemonEntry, baseEntry: PokemonEntry): boolean {
  return statSignature(entry) !== statSignature(baseEntry) || abilitySignature(entry) !== abilitySignature(baseEntry);
}

export function getPokemonLandingListPokemon(): PokemonEntry[] {
  return [...pokemonByBaseName.values()]
    .flatMap((entries) => {
      const browsable = entries.filter(isBrowsablePokedexPokemon);
      const baseEntry = browsable.find((entry) => entry.dexNumber <= 905) ?? browsable[0];

      if (!baseEntry) {
        return [];
      }

      return browsable.filter((entry) => {
        if (entry.id === baseEntry.id) {
          return true;
        }

        return hasStatOrAbilityDifference(entry, baseEntry);
      });
    })
    .sort((left, right) => {
      const leftGroup = getPokemonFormGroup(left);
      const rightGroup = getPokemonFormGroup(right);
      const leftBase = leftGroup.find((entry) => entry.dexNumber <= 905) ?? leftGroup[0] ?? left;
      const rightBase = rightGroup.find((entry) => entry.dexNumber <= 905) ?? rightGroup[0] ?? right;
      const leftKind = getPokemonFormKind(left);
      const rightKind = getPokemonFormKind(right);

      if (leftBase.dexNumber !== rightBase.dexNumber) {
        return leftBase.dexNumber - rightBase.dexNumber;
      }

      if (leftKind === "base" && rightKind !== "base") {
        return -1;
      }

      if (rightKind === "base" && leftKind !== "base") {
        return 1;
      }

      return getPokemonDisplayName(left).localeCompare(getPokemonDisplayName(right));
    });
}

export function getPokemonFormGroup(entry: PokemonEntry): PokemonEntry[] {
  return pokemonByBaseName.get(entry.name.trim().toLowerCase()) ?? [entry];
}

export function hasPokemonForms(entry: PokemonEntry): boolean {
  return getPokemonFormGroup(entry).length > 1;
}

export function getPokemonBySlug(slug: string): PokemonEntry | undefined {
  return pokemonBySlug.get(slug);
}

export function getPokemonById(id: string): PokemonEntry | undefined {
  return pokemonById.get(id);
}

export function getBattleDisplayPokemon(
  pokemonId: string | null,
  heldItem: string | null,
): PokemonEntry | undefined {
  const basePokemon = pokemonId ? getPokemonById(pokemonId) : undefined;

  if (!basePokemon || !heldItem) {
    return basePokemon;
  }

  const megaPokemon = megaPokemonByStone.get(heldItem.trim().toLowerCase());
  if (!megaPokemon) {
    return basePokemon;
  }

  return megaPokemon.dexNumber === basePokemon.dexNumber ? megaPokemon : basePokemon;
}
