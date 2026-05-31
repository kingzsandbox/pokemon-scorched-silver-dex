import type { ItemEntry, PokemonEntry } from "./types";

const megaFormLabels: Record<number, string> = {
  906: "Mega Venusaur",
  907: "Mega Charizard X",
  908: "Mega Charizard Y",
  909: "Mega Blastoise",
  910: "Mega Beedrill",
  911: "Mega Pidgeot",
  912: "Mega Alakazam",
  913: "Mega Slowbro",
  914: "Mega Gengar",
  915: "Mega Kangaskhan",
  916: "Mega Pinsir",
  917: "Mega Gyarados",
  918: "Mega Aerodactyl",
  919: "Mega Mewtwo X",
  920: "Mega Mewtwo Y",
  921: "Mega Ampharos",
  922: "Mega Steelix",
  923: "Mega Scizor",
  924: "Mega Heracross",
  925: "Mega Houndoom",
  926: "Mega Tyranitar",
  927: "Mega Sceptile",
  928: "Mega Blaziken",
  929: "Mega Swampert",
  930: "Mega Gardevoir",
  931: "Mega Sableye",
  932: "Mega Mawile",
  933: "Mega Aggron",
  934: "Mega Medicham",
  935: "Mega Manectric",
  936: "Mega Sharpedo",
  937: "Mega Camerupt",
  938: "Mega Altaria",
  939: "Mega Banette",
  940: "Mega Absol",
  941: "Mega Glalie",
  942: "Mega Salamence",
  943: "Mega Metagross",
  944: "Mega Latias",
  945: "Mega Latios",
  946: "Mega Lopunny",
  947: "Mega Garchomp",
  948: "Mega Lucario",
  949: "Mega Abomasnow",
  950: "Mega Gallade",
  951: "Mega Audino",
  952: "Mega Diancie",
  953: "Mega Rayquaza",
  954: "Primal Kyogre",
  955: "Primal Groudon",
};

const regionalFormRanges: Array<{ start: number; end: number; label: string }> = [
  { start: 956, end: 973, label: "Alola" },
  { start: 974, end: 992, label: "Galar" },
  { start: 993, end: 1008, label: "Hisui" },
];

const explicitFormLabels: Record<number, string> = {
  1234: "Mega Typhlosion",
  1235: "Mega Meganium",
  1236: "Mega Feraligatr",
  1237: "Mega Typhlosion (Hisui)",
};

const typeFormSpecies = new Set(["Arceus", "Silvally"]);

function cleanFormLabel(label: string): string {
  return label
    .replace(/\bForme\b/g, "")
    .replace(/\bForm\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getRegionalLabel(dexNumber: number | undefined): string | null {
  if (!dexNumber) {
    return null;
  }

  return regionalFormRanges.find((range) => dexNumber >= range.start && dexNumber <= range.end)?.label ?? null;
}

export function getPokemonFormKind(
  pokemon: Pick<PokemonEntry, "name"> & Partial<Pick<PokemonEntry, "dexNumber" | "types">>,
): "base" | "mega" | "regional" | "alternate" {
  if (pokemon.dexNumber && (explicitFormLabels[pokemon.dexNumber] || megaFormLabels[pokemon.dexNumber])) {
    const displayName = getPokemonDisplayName(pokemon);
    return displayName.startsWith("Mega ") || displayName.startsWith("Primal ") ? "mega" : "alternate";
  }

  if (getRegionalLabel(pokemon.dexNumber)) {
    return "regional";
  }

  if (typeFormSpecies.has(pokemon.name) && "types" in pokemon && pokemon.dexNumber && pokemon.dexNumber > 905) {
    return "alternate";
  }

  if (pokemon.dexNumber && pokemon.dexNumber > 1008) {
    return "alternate";
  }

  const match = pokemon.name.match(/^(.+?) \((.+)\)$/);
  if (match) {
    const label = cleanFormLabel(match[2].trim()).toLowerCase();
    if (label.startsWith("mega ")) {
      return "mega";
    }
    if (/(alola|galar|hisui|paldea)/i.test(label)) {
      return "regional";
    }
    return "alternate";
  }

  return "base";
}

export function getPokemonDisplayName(pokemon: Pick<PokemonEntry, "name"> & Partial<Pick<PokemonEntry, "dexNumber">>): string {
  if (pokemon.dexNumber && explicitFormLabels[pokemon.dexNumber]) {
    return explicitFormLabels[pokemon.dexNumber];
  }

  if (pokemon.dexNumber && megaFormLabels[pokemon.dexNumber]) {
    return megaFormLabels[pokemon.dexNumber];
  }

  const regionalLabel = getRegionalLabel(pokemon.dexNumber);
  if (regionalLabel) {
    return `${pokemon.name} (${regionalLabel})`;
  }

  if (typeFormSpecies.has(pokemon.name) && "types" in pokemon) {
    const typeName = (pokemon as Partial<Pick<PokemonEntry, "types">>).types?.[0];
    if (typeName && pokemon.dexNumber && pokemon.dexNumber > 905) {
      return `${pokemon.name} (${typeName})`;
    }
  }

  const match = pokemon.name.match(/^(.+?) \((.+)\)$/);

  if (!match) {
    return pokemon.name;
  }

  const baseName = match[1].trim();
  const rawLabel = match[2].trim();
  const cleanedLabel = cleanFormLabel(rawLabel);
  const normalizedLabel = cleanedLabel
    .replace(/\bZen Mode\b/i, "Zen")
    .replace(/\bStandard Mode\b/i, "Standard")
    .replace(/\bAttack Forme\b/i, "Attack")
    .replace(/\bDefense Forme\b/i, "Defense")
    .replace(/\bNormal Forme\b/i, "Normal")
    .replace(/\bSpeed Forme\b/i, "Speed")
    .replace(/\bAverage Size\b/i, "Average")
    .replace(/\bLarge Size\b/i, "Large")
    .replace(/\bSmall Size\b/i, "Small")
    .replace(/\bSuper Size\b/i, "Super")
    .replace(/\bPlant Cloak\b/i, "Plant Cloak")
    .replace(/\bSandy Cloak\b/i, "Sandy Cloak")
    .replace(/\bTrash Cloak\b/i, "Trash Cloak")
    .trim();

  if (normalizedLabel.toLowerCase().startsWith("mega ")) {
    return normalizedLabel;
  }

  if (normalizedLabel.toLowerCase() === "eternal floette") {
    return "Eternal Floette";
  }

  if (normalizedLabel.toLowerCase().includes(baseName.toLowerCase())) {
    return normalizedLabel;
  }

  const displayName = `${baseName} ${normalizedLabel}`.replace(/\s+/g, " ").trim();
  return displayName;
}

export function isBrowsablePokedexPokemon(pokemon: PokemonEntry): boolean {
  return Boolean(pokemon.name?.trim()) && pokemon.id !== "pokemon-0000";
}

export function getItemDisplayName(item: Pick<ItemEntry, "name">): string {
  return item.name;
}
