import { coreEncounters, coreItemLocations, coreLocations } from "./core";
import type { LocationEntry } from "../types";

export type LocationGroupChild = {
  location: LocationEntry;
  areaLabel: string;
  mapLabel: string | null;
  confidence: string | null;
  isDocumentationOnly: boolean;
};

export type LocationGroup = {
  id: string;
  slug: string;
  name: string;
  region: string;
  description: string | null;
  children: LocationGroupChild[];
  mappedChildren: LocationGroupChild[];
  caveats: string[];
  showInIndex: boolean;
};

const supplementalParentLocations: LocationEntry[] = [];
const supplementalParentLocationIds = new Set(supplementalParentLocations.map((entry) => entry.id));
const FULL_LOCATION_NAMES: Record<string, string> = {
  azalea: "Azalea Town",
  blackthorn: "Blackthorn City",
  cherrygrove: "Cherrygrove City",
  cianwood: "Cianwood City",
  ecruteak: "Ecruteak City",
  goldenrod: "Goldenrod City",
  mahogany: "Mahogany Town",
  "new bark": "New Bark Town",
  olivine: "Olivine City",
  violet: "Violet City",
};

const allLocations = [...(coreLocations as LocationEntry[]), ...supplementalParentLocations];
const encounterLocationIds = new Set((coreEncounters as Array<{ locationId: string }>).map((entry) => entry.locationId));
const itemLocationIds = new Set((coreItemLocations as Array<{ locationId: string }>).map((entry) => entry.locationId));
const encounterStatsByLocation = new Map<string, { minLevel: number; maxLevel: number; methods: Set<string> }>();

for (const encounter of coreEncounters as Array<{ locationId: string; minLevel: number; maxLevel: number; method: string }>) {
  const existing = encounterStatsByLocation.get(encounter.locationId);
  if (existing) {
    existing.minLevel = Math.min(existing.minLevel, encounter.minLevel);
    existing.maxLevel = Math.max(existing.maxLevel, encounter.maxLevel);
    existing.methods.add(encounter.method);
    continue;
  }

  encounterStatsByLocation.set(encounter.locationId, {
    minLevel: encounter.minLevel,
    maxLevel: encounter.maxLevel,
    methods: new Set([encounter.method]),
  });
}
const hiddenLocationSlugs = new Set(
  allLocations
    .filter((entry) => {
      const description = entry.description.trim();
      const hasDescription =
        description.length > 0 && !description.startsWith("Imported location record from source materials for ");
      return !hasDescription && !encounterLocationIds.has(entry.id) && !itemLocationIds.has(entry.id);
    })
    .map((entry) => entry.slug),
);
const locations = allLocations.filter((entry) => !hiddenLocationSlugs.has(entry.slug));
const locationsById = new Map(locations.map((entry) => [entry.id, entry]));
const locationsBySlug = new Map(locations.map((entry) => [entry.slug, entry]));
const locationsByNormalizedName = new Map(
  locations.map((entry) => [normalizeLocationName(entry.name), entry]),
);

function toTitleCase(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      if (/^[A-Z]$/i.test(word)) return word.toUpperCase();
      if (/^(and|of|in|the|a)$/i.test(word)) return word.toLowerCase();
      if (/^(mt\.|tm|hm)$/i.test(word)) return word[0].toUpperCase() + word.slice(1).toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/\bPokemon\b/g, "Pokémon")
    .replace(/\bNewbark\b/g, "New Bark")
    .replace(/\bDragons Den\b/g, "Dragon's Den")
    .replace(/\bIlex Forest\b/g, "Ilex Forest")
    .replace(/\bMt Mortar\b/g, "Mt. Mortar")
    .replace(/\bMt\.\s+/g, "Mt. ");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeLocationName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function canonicalParentName(value: string): string {
  return FULL_LOCATION_NAMES[normalizeLocationName(value)] ?? value;
}

function parseMapLabel(value: string): { group: string; map: string } | null {
  const match = value.match(/^Map\s+(\d+)\/(\d+)$/i);
  if (!match) {
    return null;
  }

  return { group: match[1], map: match[2] };
}

function mapLabelFromLocation(location: LocationEntry): string | null {
  const parsed = parseMapLabel(location.name);
  if (parsed) {
    return `ROM map ${parsed.group}/${parsed.map}`;
  }

  const match = location.description.match(/^Map\s+(\d+)\/(\d+)\./i);
  if (!match) {
    return null;
  }

  return `ROM map ${match[1]}/${match[2]}`;
}

function extractConfidence(description: string): string | null {
  const match = description.match(/Name confidence:\s*([a-z_]+)/i);
  if (!match) {
    return null;
  }

  const value = match[1].toLowerCase();
  if (value === "medium_high") return "high confidence";
  if (value === "medium") return "probable";
  if (value === "low_handler_or_script_context_only") return "script-context only";
  if (value === "unknown") return "name not recovered";
  return value.replace(/_/g, " ");
}

function parseLocationGrouping(location: LocationEntry): { parentName: string; areaLabel: string; caveat: string | null } {
  const rawName = location.name.trim();
  const mapLabel = mapLabelFromLocation(location);
  const mapEventOverrides: Record<string, { parentName: string; areaLabel: string; caveat?: string | null }> = {
    "location-g00-m053": {
      parentName: "Seafloor Cavern",
      areaLabel: "Dive / Underwater",
      caveat: "Underwater encounters are grouped with the connected cavern entrance.",
    },
    "location-g00-m007": {
      parentName: "Whirl Islands",
      areaLabel: "Surface Water",
    },
    "location-g24-m007": {
      parentName: "Union Cave",
      areaLabel: "1F",
    },
    "location-g24-m008": {
      parentName: "Union Cave",
      areaLabel: "B1F",
    },
    "location-g24-m009": {
      parentName: "Union Cave",
      areaLabel: "B2F",
    },
    "location-g24-m019": {
      parentName: "Sprout Tower",
      areaLabel: "1F",
    },
    "location-g24-m024": {
      parentName: "Sprout Tower",
      areaLabel: "2F",
    },
    "location-g24-m025": {
      parentName: "Sprout Tower",
      areaLabel: "3F",
    },
    "location-g24-m046": {
      parentName: "Ice Path",
      areaLabel: "1F",
    },
    "location-g24-m047": {
      parentName: "Ice Path",
      areaLabel: "B1F",
    },
    "location-g24-m048": {
      parentName: "Ice Path",
      areaLabel: "B2F",
    },
    "location-g24-m083": {
      parentName: "Ice Path",
      areaLabel: "B3F",
    },
    "location-g24-m052": {
      parentName: "Burned Tower",
      areaLabel: "1F",
    },
    "location-g24-m053": {
      parentName: "Burned Tower",
      areaLabel: "B1F",
    },
    "location-g24-m000": {
      parentName: "Mt. Mortar",
      areaLabel: "1F",
    },
    "location-g24-m002": {
      parentName: "Mt. Mortar",
      areaLabel: "B1F",
    },
    "location-g24-m003": {
      parentName: "Mt. Mortar",
      areaLabel: "2F",
    },
    "location-g24-m107": {
      parentName: "Mt. Mortar",
      areaLabel: "B2F",
    },
    "location-g00-m011": {
      parentName: "Mt. Silver",
      areaLabel: "Exterior",
    },
    "location-g26-m066": {
      parentName: "Mt. Silver",
      areaLabel: "1F",
    },
    "location-g26-m067": {
      parentName: "Mt. Silver",
      areaLabel: "2F",
    },
    "location-g26-m068": {
      parentName: "Mt. Silver",
      areaLabel: "3F",
    },
    "location-g26-m069": {
      parentName: "Mt. Silver",
      areaLabel: "4F",
    },
    "location-g26-m070": {
      parentName: "Mt. Silver",
      areaLabel: "Peak",
    },
    "location-g24-m027": {
      parentName: "Whirl Islands",
      areaLabel: "1F",
    },
    "location-g24-m028": {
      parentName: "Whirl Islands",
      areaLabel: "B1F",
    },
    "location-g24-m029": {
      parentName: "Whirl Islands",
      areaLabel: "B1F",
    },
    "location-g24-m030": {
      parentName: "Whirl Islands",
      areaLabel: "B1F",
    },
    "location-g24-m032": {
      parentName: "Whirl Islands",
      areaLabel: "B1F",
    },
    "location-g24-m031": {
      parentName: "Whirl Islands",
      areaLabel: "B2F",
    },
    "location-g24-m033": {
      parentName: "Whirl Islands",
      areaLabel: "B2F",
    },
    "location-g24-m034": {
      parentName: "Whirl Islands",
      areaLabel: "B3F",
    },
    "location-g24-m035": {
      parentName: "Whirl Islands",
      areaLabel: "B4F",
    },
    "location-g24-m036": {
      parentName: "Whirl Islands",
      areaLabel: "B5F",
    },
    "location-g24-m043": {
      parentName: "Victory Road",
      areaLabel: "1F",
    },
    "location-g24-m044": {
      parentName: "Victory Road",
      areaLabel: "2F",
    },
    "location-g24-m045": {
      parentName: "Victory Road",
      areaLabel: "3F",
    },
    "location-g24-m039": {
      parentName: "Goldenrod City Sewer",
      areaLabel: "B1F",
    },
    "location-g24-m040": {
      parentName: "Goldenrod City Sewer",
      areaLabel: "B2F",
    },
    "location-g24-m041": {
      parentName: "Goldenrod City Sewer",
      areaLabel: "B3F",
    },
    "location-g24-m094": {
      parentName: "Goldenrod City Sewer",
      areaLabel: "B1F",
    },
    "location-g24-m066": {
      parentName: "Cherrygrove House",
      areaLabel: "House",
    },
    "location-g24-m084": {
      parentName: "Lighthouse",
      areaLabel: "Lower Floors",
    },
    "location-g24-m085": {
      parentName: "Lighthouse",
      areaLabel: "Top",
    },
    "location-g09-m010": {
      parentName: "Goldenrod Poké Mart",
      areaLabel: "Main Counter",
    },
    "location-g09-m011": {
      parentName: "Goldenrod Poké Mart",
      areaLabel: "Main Counter",
    },
    "location-g10-m003": {
      parentName: "Goldenrod Game Corner",
      areaLabel: "Prize Counter",
    },
    "location-g11-m009": {
      parentName: "Goldenrod Vitamin Supplement Store",
      areaLabel: "Main Counter",
    },
    "location-g13-m015": {
      parentName: "Goldenrod Department Store",
      areaLabel: "1F",
    },
    "location-g13-m016": {
      parentName: "Goldenrod Department Store",
      areaLabel: "2F",
    },
    "location-g13-m017": {
      parentName: "Goldenrod Department Store",
      areaLabel: "3F",
    },
    "location-g13-m018": {
      parentName: "Goldenrod Department Store",
      areaLabel: "4F",
    },
    "location-g13-m019": {
      parentName: "Goldenrod Department Store",
      areaLabel: "5F",
    },
    "location-g17-m001": {
      parentName: "Goldenrod Flower Shop",
      areaLabel: "Main Counter",
    },
    "location-g20-m000": {
      parentName: "Goldenrod Drink Shop",
      areaLabel: "Main Counter",
    },
    "location-g20-m001": {
      parentName: "Goldenrod Drink Shop",
      areaLabel: "Main Counter",
    },
    "location-g24-m049": {
      parentName: "Tohjo Falls",
      areaLabel: "1F",
    },
    "location-g24-m051": {
      parentName: "Tohjo Falls",
      areaLabel: "B1F",
    },
    "location-g24-m071": {
      parentName: "Slowpoke Well",
      areaLabel: "1F",
    },
    "location-g24-m072": {
      parentName: "Slowpoke Well",
      areaLabel: "B1F",
    },
    "location-g24-m086": {
      parentName: "Phoenix Hideout",
      areaLabel: "Entrance Area",
    },
    "location-g24-m087": {
      parentName: "Phoenix Hideout",
      areaLabel: "Inner Hall",
    },
    "location-g24-m088": {
      parentName: "Phoenix Hideout",
      areaLabel: "Central Hideout",
    },
    "location-g24-m089": {
      parentName: "Phoenix Hideout",
      areaLabel: "Side Room",
    },
    "location-g24-m090": {
      parentName: "Phoenix Hideout",
      areaLabel: "Lower Room",
    },
    "location-g24-m091": {
      parentName: "Phoenix Hideout",
      areaLabel: "Northern Cave Connector",
      caveat: "This connector is grouped with Phoenix Hideout based on its connected entrance path.",
    },
    "location-g24-m092": {
      parentName: "Phoenix Hideout",
      areaLabel: "Upper Connector",
    },
    "location-g24-m093": {
      parentName: "Phoenix Hideout",
      areaLabel: "Southern Cave Connector",
      caveat: "This connector is grouped with Phoenix Hideout based on its connected entrance path.",
    },
    "location-g24-m010": {
      parentName: "Dark Cave",
      areaLabel: "Union Cave Entrance",
    },
    "location-g24-m099": {
      parentName: "Dark Cave",
      areaLabel: "Route 31 / Route 46 Entrances",
    },
    "location-g24-m100": {
      parentName: "Dark Cave",
      areaLabel: "Route 45 Entrance",
    },
    "location-g25-m040": {
      parentName: "S.S. Tidal",
      areaLabel: "Cabin Hallway",
    },
    "location-g25-m041": {
      parentName: "S.S. Tidal",
      areaLabel: "Lower Hull",
    },
    "location-g25-m042": {
      parentName: "S.S. Tidal",
      areaLabel: "Passenger Cabins",
    },
    "location-g26-m060": {
      parentName: "Trainer Hill",
      areaLabel: "Reception",
    },
    "location-g26-m088": {
      parentName: "Seashore House",
      areaLabel: "Main Room",
    },
  };
  const cityNames = [
    "Azalea",
    "Blackthorn",
    "Cherrygrove",
    "Cianwood",
    "Darkoal Town",
    "Ecruteak",
    "Goldenrod",
    "Lazulan City",
    "Mahogany",
    "New Bark",
    "Olivine",
    "Roujem City",
    "Apricotta Beach",
    "Violet",
  ];

  const override = mapEventOverrides[location.id];
  if (override) {
    return {
      parentName: override.parentName,
      areaLabel: override.areaLabel,
      caveat: override.caveat ?? null,
    };
  }

  if (location.id.startsWith("location-doc-")) {
    const explicitDocParents: Array<{ pattern: RegExp; parent: string; area: string }> = [
      { pattern: /^Goldenrod\s+Department\s+Store$/i, parent: "Goldenrod Department Store", area: "Shop Floors" },
      { pattern: /^Goldenrod\s+phoenix\s+base$/i, parent: "Phoenix Base", area: "Goldenrod Base" },
      { pattern: /^Goldenrod\s+sewer$/i, parent: "Goldenrod City Sewer", area: "Sewer" },
      { pattern: /^Goldenrod\s+gym$/i, parent: "Goldenrod Gym", area: "Gym" },
      { pattern: /^Goldenrod\s+top\s+left\s+house$/i, parent: "Goldenrod City", area: "Top-left House" },
      { pattern: /^Lighthouse\s+top$/i, parent: "Lighthouse", area: "Top" },
      { pattern: /^Ecruteak\s+phoenix\s+base$/i, parent: "Phoenix Base", area: "Ecruteak Base" },
      { pattern: /^From\s+Dad\s+phoenix\s+hideout$/i, parent: "Phoenix Hideout", area: "Dad" },
    ];

    for (const entry of explicitDocParents) {
      if (entry.pattern.test(rawName)) {
        return {
          parentName: entry.parent,
          areaLabel: entry.area,
          caveat: null,
        };
      }
    }
  }

  if (parseMapLabel(rawName)) {
    return {
      parentName: "Locations Needing Name Review",
      areaLabel: mapLabel ?? "Unlabeled map",
      caveat: "Some maps do not have a recovered in-game location name yet.",
    };
  }

  const underwaterParentByMap: Record<string, string> = {
    "location-g00-m050": "Route 41",
    "location-g00-m051": "Route 41",
    "location-g00-m052": "Goldenvine Sea",
    "location-g00-m053": "Seafloor Cavern",
    "location-g00-m054": "Goldenvine Sea",
    "location-g00-m055": "Goldenvine Sea",
    "location-g00-m056": "Goldenvine Sea",
  };

  if (/^underwater$/i.test(rawName)) {
    const parentName = underwaterParentByMap[location.id] ?? "Goldenvine Sea";
    return {
      parentName,
      areaLabel: "Underwater",
      caveat: null,
    };
  }

  const safariMatch = rawName.match(/^Safari(?:\s+Zone)?(?:\s+(.+))?$/i);
  if (safariMatch || /^Safari\s+Entrance$/i.test(rawName)) {
    return {
      parentName: "Safari Zone",
      areaLabel: safariMatch?.[1] ? toTitleCase(safariMatch[1]) : "Entrance",
      caveat: null,
    };
  }

  const surfAndFishMatch = rawName.match(/^Surf\s+And\s+Fish\s+(.+)$/i);
  if (surfAndFishMatch) {
    return {
      parentName: toTitleCase(surfAndFishMatch[1]),
      areaLabel: "Surf / Fishing",
      caveat: null,
    };
  }

  const surfInMatch = rawName.match(/^Surf\s+In\s+(.+)$/i);
  if (surfInMatch) {
    return {
      parentName: toTitleCase(surfInMatch[1]),
      areaLabel: "Surf",
      caveat: null,
    };
  }

  const surfMatch = rawName.match(/^Surf\s+(.+)$/i);
  if (surfMatch) {
    const parent = surfMatch[1].trim();
    return {
      parentName: /^most areas$/i.test(parent) ? "Shared Water Encounters" : toTitleCase(parent),
      areaLabel: "Surf",
      caveat: /^most areas$/i.test(parent) ? "Shared water encounters are hidden from the location index until their exact parent maps are recovered." : null,
    };
  }

  const rodMatch = rawName.match(/^(Old|Good|Super)\s+Rod\s+(.+)$/i);
  if (rodMatch) {
    return {
      parentName: toTitleCase(rodMatch[2]),
      areaLabel: `${toTitleCase(rodMatch[1])} Rod`,
      caveat: null,
    };
  }

  for (const cityName of cityNames) {
    const escapedCity = cityName.replace(/\s+/g, "\\s+");

    if (new RegExp(`^${escapedCity}(?:\\s+City)?$`, "i").test(rawName)) {
      return {
        parentName: canonicalParentName(cityName),
        areaLabel: mapLabel ?? "Main Area",
        caveat: null,
      };
    }

    const prefixMatch = rawName.match(new RegExp(`^${escapedCity}(?:\\s+City)?\\s+(.+)$`, "i"));
    if (prefixMatch) {
      return {
        parentName: canonicalParentName(cityName),
        areaLabel: toTitleCase(prefixMatch[1]),
        caveat: null,
      };
    }

    const suffixMatch = rawName.match(new RegExp(`^(.+)\\s+${escapedCity}$`, "i"));
    if (suffixMatch) {
      return {
        parentName: canonicalParentName(cityName),
        areaLabel: toTitleCase(suffixMatch[1]),
        caveat: null,
      };
    }
  }

  const routeSurfMatch = rawName.match(/^(Route\s+[A-Z0-9]+)\s*\(([^)]+)\)$/i);
  if (routeSurfMatch) {
    return {
      parentName: toTitleCase(routeSurfMatch[1]),
      areaLabel: toTitleCase(routeSurfMatch[2]),
      caveat: null,
    };
  }

  const routeDocMatch = rawName.match(/^(Route\s+[A-Z0-9]+)(?:\s+(.+))?$/i);
  if (routeDocMatch) {
    return {
      parentName: toTitleCase(routeDocMatch[1]),
      areaLabel: routeDocMatch[2] ? toTitleCase(routeDocMatch[2]) : "Main Area",
      caveat: null,
    };
  }

  const goldenvineDocMatch = rawName.match(/^(Goldenvine\s+Sea)(?:\s+(.+))?$/i);
  if (goldenvineDocMatch) {
    return {
      parentName: "Goldenvine Sea",
      areaLabel: goldenvineDocMatch[2] ? toTitleCase(goldenvineDocMatch[2]) : "Main Area",
      caveat: null,
    };
  }

  const areaSuffixes = [
    { pattern: /^(Mt\.\s+Mortar)\s+Past\s+Waterfall$/i, label: "Past Waterfall" },
    { pattern: /^Deeper\s+(Mt\.\s+Mortar)$/i, label: "Deeper Area" },
    { pattern: /^(Union\s+Cave)\s+Lapras\s+Area$/i, label: "Lapras Area" },
    { pattern: /^(Whirl\s+Islands)\s+Electric\s+Area$/i, label: "Electric Area" },
  ];

  for (const suffix of areaSuffixes) {
    const match = rawName.match(suffix.pattern);
    if (match) {
      return {
        parentName: toTitleCase(match[1]),
        areaLabel: suffix.label,
        caveat: null,
      };
    }
  }

  const documentedParentPrefixes = [
    "Blackthorn",
    "Burned Tower",
    "Cherrygrove",
    "Cianwood",
    "Darkoal Town",
    "Dark Cave",
    "Ecruteak",
    "Goldenrod City",
    "Goldenvine Sea",
    "Ice Path",
    "Ilex Forest",
    "Lazulan City",
    "Mt. Mortar",
    "Mt. Silver",
    "Mt. Tempest",
    "New Bark Town",
    "Olivine",
    "Roujem City",
    "Apricotta Beach",
    "Phoenix Hideout",
    "Ruins of Alph",
    "Safari Zone",
    "Tohjo Falls",
    "Union Cave",
    "Violet",
    "Whirl Islands",
  ];

  for (const parentName of documentedParentPrefixes) {
    const escapedParent = parentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    const match = rawName.match(new RegExp(`^${escapedParent}\\s+(.+)$`, "i"));
    if (!match) {
      continue;
    }

    const suffix = toTitleCase(match[1])
      .replace(/\b2f\b/i, "2F")
      .replace(/\bElec\b/i, "Electric Area")
      .replace(/^Surf$/i, "Surfing")
      .replace(/^Old Rod$/i, "Old Rod")
      .replace(/^Good Rod$/i, "Good Rod")
      .replace(/^Super Rod$/i, "Super Rod")
      .replace(/^Underwater$/i, "Underwater");

    return {
      parentName,
      areaLabel: suffix,
      caveat: null,
    };
  }

  const docLocationPatterns: Array<{ pattern: RegExp; parent: string; area: string }> = [
    { pattern: /^(.+?)\s+gym$/i, parent: "$1", area: "Gym" },
    { pattern: /^(.+?)\s+city\s+girl$/i, parent: "$1", area: "City girl" },
    { pattern: /^(.+?)\s+city\s+old\s+man$/i, parent: "$1", area: "City old man" },
    { pattern: /^(.+?)\s+city,\s*cut\s+tree$/i, parent: "$1", area: "Cut tree" },
    { pattern: /^(.+?)\s+house$/i, parent: "$1", area: "House" },
    { pattern: /^(.+?)\s+north\s+house$/i, parent: "$1", area: "North house" },
    { pattern: /^(.+?)\s+top\s+left\s+house$/i, parent: "$1", area: "Top-left house" },
    { pattern: /^kimono\s+girl\s+(.+)$/i, parent: "$1", area: "Kimono girl" },
    { pattern: /^from\s+oliver\s+in\s+(.+)$/i, parent: "$1", area: "Oliver" },
    { pattern: /^from\s+dad\s+(.+)$/i, parent: "$1", area: "Dad" },
    { pattern: /^(.+?)\s+hideout$/i, parent: "$1", area: "Hideout" },
  ];

  if (location.id.startsWith("location-doc-")) {
    if (supplementalParentLocationIds.has(location.id)) {
      return {
        parentName: toTitleCase(rawName),
        areaLabel: "Reference",
        caveat: "This parent location is confirmed by game text or reference notes, but no encounter map has been confidently linked yet.",
      };
    }

    for (const entry of docLocationPatterns) {
      const match = rawName.match(entry.pattern);
      if (match) {
        return {
          parentName: toTitleCase(entry.parent.replace(/\$(\d+)/g, (_, index) => match[Number.parseInt(index, 10)] ?? "")),
          areaLabel: toTitleCase(entry.area),
          caveat: null,
        };
      }
    }
  }

  const docMatch = rawName.match(/^(.+?)\s+(fisherman|woman|top left house|north)$/i);
  if (location.id.startsWith("location-doc-") && docMatch) {
    return {
      parentName: toTitleCase(docMatch[1]),
      areaLabel: toTitleCase(docMatch[2]),
      caveat: null,
    };
  }

  if (location.id.startsWith("location-doc-")) {
    return {
      parentName: toTitleCase(rawName),
      areaLabel: "Documentation Note",
      caveat: null,
    };
  }

  return {
    parentName: toTitleCase(rawName),
    areaLabel: mapLabel ?? "Main Area",
    caveat: null,
  };
}

function formatLevelSpan(locationId: string): string | null {
  const stats = encounterStatsByLocation.get(locationId);
  if (!stats) {
    return null;
  }

  return stats.minLevel === stats.maxLevel ? `Lv. ${stats.minLevel}` : `Lv. ${stats.minLevel}-${stats.maxLevel}`;
}

function summarizeMethods(locationId: string): string | null {
  const stats = encounterStatsByLocation.get(locationId);
  if (!stats) {
    return null;
  }

  const methods = stats.methods;
  const hasLand = methods.has("grass") || methods.has("rock_smash");
  const hasWater = methods.has("surf") || methods.has("fishing");

  if (hasLand && hasWater) return "Land / Water";
  if (hasWater) return "Water";
  if (hasLand) return "Land";
  return null;
}

function derivedAreaLabel(child: LocationGroupChild, mapIndex: number): string {
  const levelSpan = formatLevelSpan(child.location.id);
  const methodSummary = summarizeMethods(child.location.id);

  if (child.location.name === "Dark Cave") {
    if (child.location.id === "location-g24-m099") return levelSpan ? `Lower-level area (${levelSpan})` : "Lower-level area";
    if (child.location.id === "location-g24-m010") return levelSpan ? `Middle area (${levelSpan})` : "Middle area";
    if (child.location.id === "location-g24-m100") return levelSpan ? `Deep area (${levelSpan})` : "Deep area";
  }

  if (levelSpan && methodSummary) {
    return `${methodSummary} area (${levelSpan})`;
  }

  if (levelSpan) {
    return `Encounter area (${levelSpan})`;
  }

  return mapIndex === 0 ? "Main Area" : `Area ${mapIndex + 1}`;
}

function sortKeyForName(name: string): number {
  const progression: Record<string, number> = {
    "Cherrygrove City": 1,
    "Route 29": 2,
    "New Bark Town": 3,
    "Route 30": 4,
    "Route 31": 5,
    "Dark Cave": 6,
    "Violet City": 7,
    "Sprout Tower": 8,
    "Ruins of Alph": 9,
    "Route 32": 10,
    "Union Cave": 11,
    "Route 33": 12,
    "Azalea Town": 13,
    "Slowpoke Well": 14,
    "Ilex Forest": 15,
    "Route 34": 16,
    "Goldenrod City": 17,
    "Goldenrod Department Store": 18,
    "Goldenrod Poké Mart": 19,
    "Goldenrod Vitamin Supplement Store": 20,
    "Goldenrod Flower Shop": 21,
    "Goldenrod Drink Shop": 22,
    "Goldenrod Game Corner": 23,
    "Goldenrod Gym": 24,
    "Goldenrod City Sewer": 25,
    "National Park": 26,
    "Route 35": 27,
    "Route 36": 28,
    "Route 37": 29,
    "Ecruteak City": 30,
    "Burned Tower": 31,
    "Route 38": 32,
    "Route 39": 33,
    "Olivine City": 34,
    "Lighthouse": 35,
    "Lighthouse Top": 36,
    "Route 40": 37,
    "Route 41": 38,
    "Whirl Islands": 39,
    "Cianwood City": 40,
    "Route 42": 41,
    "Mt. Mortar": 42,
    "Mahogany Town": 43,
    "Route 43": 44,
    "Lake of Rage": 45,
    "Rage Resort": 46,
    "Mt. Rage": 47,
    "Ice Path": 48,
    "Blackthorn City": 49,
    "Dragon's Den": 50,
    "Route 45": 51,
    "Route 46": 52,
    "Route 27": 53,
    "Tohjo Falls": 54,
    "Route 26": 55,
    "Victory Road": 56,
    "Indigo Plateau": 57,
    "Mt. Silver": 58,
    "Route 28": 59,
    "Route A": 60,
    "Route B": 61,
    "Route C": 62,
    "Route D": 63,
    "Route E": 64,
    "Route F": 65,
    "Darkoal Town": 66,
    "Apricotta Beach": 67,
    "Roujem City": 68,
    "Roujem Shipyard": 69,
    "Lazulan City": 70,
    "Goldenvine Sea": 71,
    "Phoenix Base": 72,
    "Phoenix Hideout": 73,
    "Safari Zone": 74,
  };
  if (progression[name] !== undefined) return progression[name];

  const routeMatch = name.match(/^Route\s+(\d+)$/i);
  if (routeMatch) return 200 + Number.parseInt(routeMatch[1], 10);

  const customRouteMatch = name.match(/^Route\s+([A-Z])$/i);
  if (customRouteMatch) return 500 + customRouteMatch[1].charCodeAt(0);

  return 1000;
}

function sortKeyForArea(groupName: string, areaLabel: string): number {
  const normalizedGroup = normalizeLocationName(groupName);
  const normalizedArea = normalizeLocationName(areaLabel);
  const areaPriorities: Record<string, Record<string, number>> = {
    "dark cave": {
      "route 31 / route 46 entrances": 1,
      "union cave entrance": 2,
      "route 45 entrance": 3,
    },
    "union cave": {
      "1f": 1,
      "b1f": 2,
      "b2f": 3,
    },
    "sprout tower": {
      "1f": 1,
      "2f": 2,
      "3f": 3,
    },
    "ice path": {
      "1f": 1,
      "b1f": 2,
      "b2f": 3,
      "b3f": 4,
    },
    "burned tower": {
      "1f": 1,
      "b1f": 2,
    },
    "mt. mortar": {
      "1f": 1,
      "2f": 2,
      "b1f": 3,
      "b2f": 4,
    },
    "mt. silver": {
      "exterior": 1,
      "1f": 2,
      "2f": 3,
      "3f": 4,
      "4f": 5,
      "peak": 6,
    },
    "whirl islands": {
      "surface water": 1,
      "1f": 2,
      "b1f": 3,
      "b2f": 4,
      "b3f": 5,
      "b4f": 6,
      "b5f": 7,
    },
    "victory road": {
      "1f": 1,
      "2f": 2,
      "3f": 3,
      "b1f": 4,
    },
    "goldenrod city sewer": {
      "b1f": 1,
      "b2f": 2,
      "b3f": 3,
    },
    "goldenrod department store": {
      "1f": 1,
      "2f": 2,
      "3f": 3,
      "4f": 4,
      "5f": 5,
      "shop floors": 6,
    },
    "goldenrod poké mart": {
      "main counter": 1,
    },
    "goldenrod vitamin supplement store": {
      "main counter": 1,
    },
    "goldenrod flower shop": {
      "main counter": 1,
    },
    "goldenrod drink shop": {
      "main counter": 1,
    },
    "goldenrod game corner": {
      "prize counter": 1,
    },
    "slowpoke well": {
      "1f": 1,
      "b1f": 2,
    },
    "tohjo falls": {
      "1f": 1,
      "b1f": 2,
    },
    "s.s. tidal": {
      "cabin hallway": 1,
      "passenger cabins": 2,
      "lower hull": 3,
    },
    "phoenix hideout": {
      "entrance area": 1,
      "inner hall": 2,
      "central hideout": 3,
      "side room": 4,
      "lower room": 5,
      "upper connector": 6,
      "northern cave connector": 7,
      "southern cave connector": 8,
    },
    "phoenix base": {
      "goldenrod base": 1,
      "ecruteak base": 2,
    },
  };

  return areaPriorities[normalizedGroup]?.[normalizedArea] ?? 1000;
}

function shouldDisambiguateAreaLabel(areaLabel: string): boolean {
  if (/^(Underwater|Surface Water)$/i.test(areaLabel)) {
    return false;
  }

  return !/^(?:\dF|B\dF|\dBF)$/i.test(areaLabel);
}

function buildLocationGroups(): LocationGroup[] {
  const grouped = new Map<string, LocationGroup>();
  const hideFromLanding = new Set([
    "Cherrygrove House",
    "Goldenrod Department Store",
    "Goldenrod Poké Mart",
    "Goldenrod Vitamin Supplement Store",
    "Goldenrod Flower Shop",
    "Goldenrod Drink Shop",
      "Goldenrod Game Corner",
      "Goldenrod Gym",
      "Lighthouse Top",
    ]);

  for (const location of locations) {
    const parsed = parseLocationGrouping(location);
    const key = normalizeLocationName(parsed.parentName);
    const existing = grouped.get(key);
    const confidence = extractConfidence(location.description);
    const mapLabel = mapLabelFromLocation(location);
    const child: LocationGroupChild = {
      location,
      areaLabel: parsed.areaLabel,
      mapLabel,
      confidence,
      isDocumentationOnly: location.id.startsWith("location-doc-"),
    };

    if (existing) {
      existing.children.push(child);
      const supplementalOnlyNoteOnMappedGroup = supplementalParentLocationIds.has(location.id) && existing.children.some((entry) => !entry.isDocumentationOnly);
      if (parsed.caveat && !supplementalOnlyNoteOnMappedGroup && !existing.caveats.includes(parsed.caveat)) {
        existing.caveats.push(parsed.caveat);
      }
      continue;
    }

    grouped.set(key, {
      id: `location-group-${slugify(parsed.parentName)}`,
      slug: slugify(parsed.parentName),
      name: parsed.parentName,
      region: location.region,
      description: null,
      children: [child],
      caveats: parsed.caveat ? [parsed.caveat] : [],
      mappedChildren: [],
      showInIndex:
        !["Locations Needing Name Review", "Shared Water Encounters"].includes(parsed.parentName) &&
        !hideFromLanding.has(parsed.parentName),
    });
  }

  return [...grouped.values()]
    .map((group) => {
      const sortedChildren = group.children.sort((left, right) => {
        const leftAreaKey = sortKeyForArea(group.name, left.areaLabel);
        const rightAreaKey = sortKeyForArea(group.name, right.areaLabel);
        if (leftAreaKey !== rightAreaKey) return leftAreaKey - rightAreaKey;
        if (left.areaLabel !== right.areaLabel) return left.areaLabel.localeCompare(right.areaLabel);
        return left.location.id.localeCompare(right.location.id);
      });
      const mapLikeChildren = sortedChildren.filter((child) => child.mapLabel && child.areaLabel === child.mapLabel);

      const mappedChildren = sortedChildren.map((child) => {
        if (!child.mapLabel || child.areaLabel !== child.mapLabel) {
          return child;
        }

        const mapIndex = mapLikeChildren.findIndex((candidate) => candidate.location.id === child.location.id);
        return {
          ...child,
          areaLabel: derivedAreaLabel(child, mapIndex),
        };
      });
      const seenLabels = new Map<string, number>();

      return {
        ...group,
        children: mappedChildren.map((child) => {
          const seenCount = seenLabels.get(child.areaLabel) ?? 0;
          seenLabels.set(child.areaLabel, seenCount + 1);
          if (seenCount === 0) {
            return child;
          }
          if (!shouldDisambiguateAreaLabel(child.areaLabel)) {
            return child;
          }
          return {
            ...child,
            areaLabel: `${child.areaLabel} ${seenCount + 1}`,
          };
        }),
        mappedChildren: mappedChildren
          .filter((child) => !child.isDocumentationOnly)
          .map((child) => {
            const seenCount = seenLabels.get(`mapped:${child.areaLabel}`) ?? 0;
            seenLabels.set(`mapped:${child.areaLabel}`, seenCount + 1);
            if (seenCount === 0) {
              return child;
            }
            if (!shouldDisambiguateAreaLabel(child.areaLabel)) {
              return child;
            }
            return {
              ...child,
              areaLabel: `${child.areaLabel} ${seenCount + 1}`,
            };
          }),
      };
    })
    .sort((left, right) => {
      const leftKey = sortKeyForName(left.name);
      const rightKey = sortKeyForName(right.name);
      if (leftKey !== rightKey) return leftKey - rightKey;
      return left.name.localeCompare(right.name);
    });
}

const locationGroups = buildLocationGroups();
const locationGroupsBySlug = new Map(locationGroups.map((entry) => [entry.slug, entry]));
const locationGroupByLocationSlug = new Map<string, LocationGroup>();
const locationGroupByLocationId = new Map<string, LocationGroup>();

for (const group of locationGroups) {
  for (const child of group.children) {
    locationGroupByLocationSlug.set(child.location.slug, group);
    locationGroupByLocationId.set(child.location.id, group);
  }
}

export function getLocationDisplayName(location: Pick<LocationEntry, "name">): string {
  return parseMapLabel(location.name) ? "Unlabeled Area" : location.name;
}

export function getLocationDisplayDescription(location: Pick<LocationEntry, "description">): string | null {
  const description = location.description.trim();
  if (!description || description.startsWith("Imported location record from source materials for ")) {
    return null;
  }

  const mapMatch = description.match(/^Map\s+(\d+)\/(\d+)\.\s*Name confidence:\s*([a-z_]+)\.$/i);
  if (mapMatch) {
    const confidence = extractConfidence(description);
    return confidence ? `Map name is ${confidence}.` : "Map name is under review.";
  }

  return description
    .replace(/Name confidence:\s*medium_high/gi, "name confidence: high")
    .replace(/Name confidence:\s*low_handler_or_script_context_only/gi, "name confidence: script-context only")
    .replace(/Name confidence:\s*unknown/gi, "name not recovered")
    .replace(/_/g, " ");
}

export function getLocations(): LocationEntry[] {
  return locations;
}

export function getLocationGroups(): LocationGroup[] {
  return locationGroups.filter((group) => group.showInIndex && (group.mappedChildren.length > 0 || group.children.length > 0));
}

export function getLocationGroupSummary(group: Pick<LocationGroup, "mappedChildren" | "children" | "caveats">): string {
  if (group.mappedChildren.length > 0) return "Location";
  return "Item or facility reference";
}

export function getLocationGroupBySlug(slug: string): LocationGroup | undefined {
  return locationGroupsBySlug.get(slug) ?? locationGroupByLocationSlug.get(slug);
}

export function getLocationFacilityGroups(parentName: string): LocationGroup[] {
  const facilityGroupsByParent: Record<string, string[]> = {
    "Cherrygrove City": [
      "Cherrygrove House",
    ],
    "Goldenrod City": [
      "Goldenrod Department Store",
      "Goldenrod Vitamin Supplement Store",
      "Goldenrod Flower Shop",
      "Goldenrod Drink Shop",
      "Goldenrod Game Corner",
      "Goldenrod Gym",
    ],
  };

  const names = facilityGroupsByParent[parentName] ?? [];
  return names
    .map((name) => locationGroups.find((group) => group.name === name))
    .filter((group): group is LocationGroup => group !== undefined);
}

export function getLocationGroupByLocationId(locationId: string): LocationGroup | undefined {
  return locationGroupByLocationId.get(locationId);
}

export function getLocationPageHref(location: LocationEntry): string {
  const group = getLocationGroupByLocationId(location.id);
  return `/locations/${group?.slug ?? location.slug}`;
}

export function getLocationBySlug(slug: string): LocationEntry | undefined {
  return locationsBySlug.get(slug);
}

export function getLocationById(id: string): LocationEntry | undefined {
  return locationsById.get(id);
}

export function getLocationByMap(mapGroup: number | null, mapNumber: number | null): LocationEntry | undefined {
  if (mapGroup === null || mapNumber === null) {
    return undefined;
  }

  return locations.find((entry) => {
    const mapEntry = entry as LocationEntry & { mapGroup?: number; mapNumber?: number };
    return mapEntry.mapGroup === mapGroup && mapEntry.mapNumber === mapNumber;
  });
}

export function getLocationByName(name: string): LocationEntry | undefined {
  return locationsByNormalizedName.get(normalizeLocationName(name));
}
