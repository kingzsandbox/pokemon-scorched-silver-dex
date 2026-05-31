import evolutionLinksData from "../../../public/data/pokemon-evolutions.json";
import { getPokemonById } from "./pokemon";
import type { PokemonEvolutionLink, PokemonEntry } from "../types";

export type EvolutionTreeNode = {
  pokemon: PokemonEntry;
  children: Array<{
    method: string;
    node: EvolutionTreeNode;
  }>;
};

export type MegaEvolutionLink = {
  method: string;
  pokemon: PokemonEntry;
};

const rawEvolutionLinks = evolutionLinksData as PokemonEvolutionLink[];
const invalidEvolutionLinkIds = new Set([
  "evolution-pokemon-0120-to-pokemon-0230",
  "evolution-pokemon-0220-to-pokemon-0217",
]);
const correctedEvolutionLinks: PokemonEvolutionLink[] = [
  {
    id: "evolution-pokemon-0120-to-pokemon-0121-corrected",
    fromPokemonId: "pokemon-0120",
    toPokemonId: "pokemon-0121",
    method: "Use [Water Stone]",
  },
  {
    id: "evolution-pokemon-0220-to-pokemon-0221-corrected",
    fromPokemonId: "pokemon-0220",
    toPokemonId: "pokemon-0221",
    method: "Level Up [33]",
  },
];

function isMegaEvolutionMethod(method: string): boolean {
  return /^hold \[[^\]]+\]$/i.test(method);
}

function isMegaPokemon(pokemon: PokemonEntry | undefined): boolean {
  return Boolean(pokemon && /\(Mega /i.test(pokemon.name));
}

function isValidEvolutionLink(link: PokemonEvolutionLink): boolean {
  if (link.fromPokemonId === link.toPokemonId) {
    return false;
  }

  const fromPokemon = getPokemonById(link.fromPokemonId);
  const toPokemon = getPokemonById(link.toPokemonId);

  if (!fromPokemon || !toPokemon) {
    return false;
  }

  if (isMegaPokemon(fromPokemon) || isMegaPokemon(toPokemon) || isMegaEvolutionMethod(link.method)) {
    return false;
  }

  return true;
}

const evolutionLinks = [...rawEvolutionLinks.filter((link) => !invalidEvolutionLinkIds.has(link.id)), ...correctedEvolutionLinks]
  .filter(isValidEvolutionLink);
const linksByFromPokemonId = new Map<string, PokemonEvolutionLink[]>();
const linksByToPokemonId = new Map<string, PokemonEvolutionLink[]>();

for (const link of evolutionLinks) {
  const outgoing = linksByFromPokemonId.get(link.fromPokemonId) ?? [];
  outgoing.push(link);
  linksByFromPokemonId.set(link.fromPokemonId, outgoing);

  const incoming = linksByToPokemonId.get(link.toPokemonId) ?? [];
  incoming.push(link);
  linksByToPokemonId.set(link.toPokemonId, incoming);
}

function comparePokemon(left: PokemonEntry, right: PokemonEntry): number {
  if (left.dexNumber !== right.dexNumber) {
    return left.dexNumber - right.dexNumber;
  }

  return left.name.localeCompare(right.name);
}

function compareLinks(left: PokemonEvolutionLink, right: PokemonEvolutionLink): number {
  const leftPokemon = getPokemonById(left.toPokemonId);
  const rightPokemon = getPokemonById(right.toPokemonId);

  if (leftPokemon && rightPokemon) {
    return comparePokemon(leftPokemon, rightPokemon);
  }

  return left.method.localeCompare(right.method);
}

function formatItemName(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\bBlk\b/g, "Black")
    .replace(/\bGalrca\b/g, "Galarica")
    .replace(/\bStrwbry\b/g, "Strawberry")
    .replace(/\s+/g, " ")
    .trim();
}

function formatEvolutionMethod(method: string): string {
  const clean = method.replace(/^\/\s*/g, "").replace(/\s+/g, " ").trim();
  const [rawKind, rawValue] = clean.split(":").map((part) => part?.trim());
  const value = rawValue ? formatItemName(rawValue.replace(/\[([^\]]+)\]/g, "$1")) : null;
  const kind = rawKind.toLowerCase();

  if (kind === "level_candidate" && value) return `Level ${value}`;
  if (kind === "regional_or_time_level_variant_candidate" && value) return `Level ${value} special variant`;
  if (kind === "rockruff_dusk_level_candidate" && value) return `Level ${value} special variant`;
  if (kind === "toxtricity_form_level_candidate" && value) return `Level ${value} special variant`;
  if (kind === "level_rain_candidate" && value) return `Level ${value} while raining`;
  if (kind === "level_ninjask_candidate" && value) return `Level ${value}`;
  if (kind === "shedinja_extra_evolution_candidate" && value) return `Level ${value} with an open party slot`;
  if (kind === "level_male_candidate" && value) return `Level ${value}, male`;
  if (kind === "level_female_candidate" && value) return `Level ${value}, female`;
  if (kind === "level_attack_gt_defense_candidate" && value) return `Level ${value}, Attack higher than Defense`;
  if (kind === "level_attack_eq_defense_candidate" && value) return `Level ${value}, Attack equals Defense`;
  if (kind === "level_attack_lt_defense_candidate" && value) return `Level ${value}, Attack lower than Defense`;
  if (kind === "wurmple_personality_a_candidate" && value) return `Level ${value}, personality variant`;
  if (kind === "wurmple_personality_b_candidate" && value) return `Level ${value}, personality variant`;
  if (kind === "item_candidate" && value) return `Use ${value}`;
  if (kind === "item_trade_or_item_use_candidate" && value) return `Use or trade with ${value}`;
  if (kind === "mega_stone_candidate" && value) return `Use ${value}`;
  if (kind === "primal_orb_candidate" && value) return `Use ${value}`;
  if (kind === "dawn_stone_male_candidate" && value) return `Use ${value}, male`;
  if (kind === "dawn_stone_female_candidate" && value) return `Use ${value}, female`;
  if (kind === "move_known_candidate" && value) return `Knows ${value}`;
  if (kind === "move_known_or_mega_move_candidate" && value) return `Knows ${value}`;
  if (kind === "friendship_candidate") return "High friendship";
  if (kind === "friendship_day_candidate") return "High friendship during the day";
  if (kind === "friendship_night_candidate") return "High friendship at night";
  if (kind === "friendship_known_type_candidate") return "High friendship with a Fairy-type move";
  if (kind === "location_candidate") return "Special location";
  if (kind === "damage_taken_location_candidate") return "Special location after battle damage";
  if (kind === "party_dark_type_candidate" && value) return `Level ${value} with a Dark-type party member`;
  if (kind === "party_species_candidate") return "With a specific party Pokémon";
  if (kind === "critical_hits_candidate") return "After landing critical hits";
  if (kind === "kubfu_tower_form_candidate") return "Special tower training";
  if (kind === "trade_for_species_candidate") return "Trade for a specific Pokémon";

  return clean
    .replace(/_candidate\b/gi, "")
    .replace(/_/g, " ")
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/^level:/i, "Level")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

function getRelatedPokemonIds(pokemonId: string): string[] {
  const visited = new Set<string>();
  const queue = [pokemonId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    for (const link of linksByFromPokemonId.get(current) ?? []) {
      if (!visited.has(link.toPokemonId)) {
        queue.push(link.toPokemonId);
      }
    }

    for (const link of linksByToPokemonId.get(current) ?? []) {
      if (!visited.has(link.fromPokemonId)) {
        queue.push(link.fromPokemonId);
      }
    }
  }

  return [...visited];
}

function buildNode(pokemonId: string, component: Set<string>, visiting: Set<string>): EvolutionTreeNode | null {
  const pokemon = getPokemonById(pokemonId);
  if (!pokemon || visiting.has(pokemonId)) {
    return null;
  }

  visiting.add(pokemonId);

  const children = (linksByFromPokemonId.get(pokemonId) ?? [])
    .filter((link) => component.has(link.toPokemonId))
    .sort(compareLinks)
    .map((link) => {
      const childNode = buildNode(link.toPokemonId, component, visiting);
      if (!childNode) {
        return null;
      }
      return {
        method: formatEvolutionMethod(link.method),
        node: childNode,
      };
    })
    .filter(
      (
        entry,
      ): entry is {
        method: string;
        node: EvolutionTreeNode;
      } => entry !== null,
    );

  visiting.delete(pokemonId);

  return {
    pokemon,
    children,
  };
}

export function getEvolutionLinks(): PokemonEvolutionLink[] {
  return evolutionLinks;
}

export function getMegaEvolutionLinks(pokemonId: string): MegaEvolutionLink[] {
  return rawEvolutionLinks
    .filter((link) => {
      const fromPokemon = getPokemonById(link.fromPokemonId);
      const toPokemon = getPokemonById(link.toPokemonId);
      if (!fromPokemon || !toPokemon) {
        return false;
      }

      return (
        link.fromPokemonId === pokemonId &&
        isMegaEvolutionMethod(link.method) &&
        isMegaPokemon(toPokemon) &&
        fromPokemon.dexNumber === toPokemon.dexNumber
      );
    })
    .sort(compareLinks)
    .map((link) => ({
      method: formatEvolutionMethod(link.method),
      pokemon: getPokemonById(link.toPokemonId)!,
    }));
}

export function getEvolutionTree(pokemonId: string): EvolutionTreeNode[] {
  const componentIds = getRelatedPokemonIds(pokemonId);
  const component = new Set(componentIds);

  const roots = componentIds
    .filter((id) => {
      const incoming = (linksByToPokemonId.get(id) ?? []).filter((link) => component.has(link.fromPokemonId));
      return incoming.length === 0;
    })
    .map((id) => getPokemonById(id))
    .filter((entry): entry is PokemonEntry => entry !== undefined)
    .sort(comparePokemon);

  const rootIds = roots.length > 0 ? roots.map((entry) => entry.id) : componentIds;

  return rootIds
    .map((id) => buildNode(id, component, new Set<string>()))
    .filter((entry): entry is EvolutionTreeNode => entry !== null);
}
