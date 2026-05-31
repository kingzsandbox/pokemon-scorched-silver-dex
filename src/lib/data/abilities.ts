import { coreAbilities } from "./core";
import type { AbilityEntry } from "../types";

const asOneDescription =
  "Combines Calyrex's Unnerve with Glastrier's Chilling Neigh or Spectrier's Grim Neigh.";

const abilities = (coreAbilities as AbilityEntry[])
  .filter((ability) => ability.id !== "ability-0267")
  .slice()
  .sort((left, right) => left.name.localeCompare(right.name));
const abilitiesById = new Map(abilities.map((entry) => [entry.id, entry]));
const abilitiesBySlug = new Map((coreAbilities as AbilityEntry[]).map((entry) => [entry.slug, entry]));
const abilitiesByName = new Map(abilities.map((entry) => [entry.name.toLowerCase(), entry]));
const duplicateAbilityNames = new Set<string>();
const abilityNameCounts = abilities.reduce((counts, ability) => {
  const key = ability.name.toLowerCase();
  counts.set(key, (counts.get(key) ?? 0) + 1);
  return counts;
}, new Map<string, number>());

for (const [name, count] of abilityNameCounts) {
  if (count > 1) {
    duplicateAbilityNames.add(name);
  }
}

function abilityNumber(ability: AbilityEntry): string {
  return ability.id.replace(/\D+/g, "").replace(/^0+/, "") || ability.id;
}

export function getAbilityDisplayName(ability: AbilityEntry): string {
  if (ability.name === "As One") {
    return "As One";
  }

  return duplicateAbilityNames.has(ability.name.toLowerCase())
    ? `${ability.name} (Ability ${abilityNumber(ability)})`
    : ability.name;
}

export function getAbilityDescription(ability: AbilityEntry): string {
  if (ability.name === "As One") {
    return asOneDescription;
  }

  return ability.description && ability.description !== "Description unavailable."
    ? ability.description
    : "Description unavailable.";
}

export function getAbilities(): AbilityEntry[] {
  return abilities;
}

export function getAbilityById(id: string): AbilityEntry | undefined {
  return abilitiesById.get(id);
}

export function getAbilityBySlug(slug: string): AbilityEntry | undefined {
  return abilitiesBySlug.get(slug);
}

export function getAbilityByName(name: string): AbilityEntry | undefined {
  return abilitiesByName.get(name.toLowerCase());
}
