import { coreMoves } from "./core";
import type {
  BaseStats,
  PokemonAbilityDisplayRow,
  PokemonEntry,
  PokemonStatDisplayRow,
  VanillaMoveReference,
  VanillaPokemonReference,
} from "../types";

export function getVanillaPokemonReference(_pokemonId: string): VanillaPokemonReference | undefined {
  return undefined;
}

export function getVanillaMoveReference(_moveId: string): VanillaMoveReference | undefined {
  return undefined;
}

export function getPokemonStatDisplayRows(pokemon: PokemonEntry): PokemonStatDisplayRow[] {
  const statRows: Array<{ label: string; key: keyof BaseStats }> = [
    { label: "HP", key: "hp" },
    { label: "Attack", key: "attack" },
    { label: "Defense", key: "defense" },
    { label: "Sp. Atk", key: "specialAttack" },
    { label: "Sp. Def", key: "specialDefense" },
    { label: "Speed", key: "speed" },
  ];

  return statRows.map(({ label, key }) => ({
    label,
    value: pokemon.baseStats[key],
    delta: null,
  }));
}

function normalizeAbilityName(value: string): string {
  return value.trim().toLowerCase();
}

export type PokemonAbilitySummaryEntry = {
  value: string;
  isHidden: boolean;
};

function dedupeAbilitySlots(slotEntries: PokemonAbilitySummaryEntry[]): PokemonAbilitySummaryEntry[] {
  const deduped: PokemonAbilitySummaryEntry[] = [];

  for (const entry of slotEntries) {
    const existing = deduped.find(
      (candidate) => normalizeAbilityName(candidate.value) === normalizeAbilityName(entry.value),
    );

    if (!existing) {
      deduped.push({ ...entry });
      continue;
    }

    existing.isHidden = existing.isHidden && entry.isHidden;
  }

  return deduped;
}

export function getPokemonAbilitySummaryEntries(pokemon: PokemonEntry): PokemonAbilitySummaryEntry[] {
  const sourceSlots = pokemon.abilitySlots
    ? [
        pokemon.abilitySlots.ability1
          ? { value: pokemon.abilitySlots.ability1, isHidden: false }
          : null,
        pokemon.abilitySlots.ability2
          ? { value: pokemon.abilitySlots.ability2, isHidden: false }
          : null,
        pokemon.abilitySlots.hiddenAbility
          ? { value: pokemon.abilitySlots.hiddenAbility, isHidden: true }
          : null,
      ].filter((entry): entry is PokemonAbilitySummaryEntry => entry !== null)
    : [];

  if (sourceSlots.length > 0) {
    return dedupeAbilitySlots(sourceSlots);
  }

  return dedupeAbilitySlots(
    pokemon.abilities.map((value, index) => ({
      value,
      isHidden: index === 2,
    })),
  );
}

export function getVisibleAbilitySlots(pokemon: PokemonEntry): PokemonAbilityDisplayRow[] {
  if (pokemon.abilitySlots) {
    const rows: PokemonAbilityDisplayRow[] = [];

    if (pokemon.abilitySlots.ability1) {
      rows.push({ label: "Ability 1", value: pokemon.abilitySlots.ability1 });
    }
    if (pokemon.abilitySlots.ability2) {
      rows.push({ label: "Ability 2", value: pokemon.abilitySlots.ability2 });
    }
    if (pokemon.abilitySlots.hiddenAbility) {
      rows.push({ label: "Hidden Ability", value: pokemon.abilitySlots.hiddenAbility });
    }

    if (rows.length > 0) {
      return rows;
    }
  }

  const summary = getPokemonAbilitySummaryEntries(pokemon);
  if (summary.length > 0) {
    let standardIndex = 0;
    return summary.map((entry) => {
      if (entry.isHidden) {
        return { label: "Hidden Ability", value: entry.value };
      }

      standardIndex += 1;
      return { label: standardIndex === 1 ? "Ability 1" : "Ability 2", value: entry.value };
    });
  }

  return [];
}

export function getPokemonAbilityDisplayRows(pokemon: PokemonEntry): PokemonAbilityDisplayRow[] {
  return getVisibleAbilitySlots(pokemon);
}

export function formatPokemonStatDelta(_delta: number | null): string {
  return "";
}

export function getMoveEffectSummary(moveId: string): string | null {
  const move = coreMoves.find((entry) => entry.id === moveId);
  const summary = move?.notes ?? null;

  if (!summary || summary === "Description unavailable.") {
    return null;
  }

  return summary.replace(/\s+/g, " ").trim();
}
