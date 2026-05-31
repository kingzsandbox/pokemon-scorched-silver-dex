import { readFileSync } from "node:fs";
import path from "node:path";
import {
  normalizeEncounterEntry,
  normalizeItemEntry,
  normalizeItemLocationEntry,
  normalizeLearnsetEntry,
  normalizeLevelCapEntry,
  normalizeLocationEntry,
  normalizeMachineEntry,
  normalizeMoveEntry,
  normalizeMoveCompatibilityEntry,
  normalizePokemonEntry,
  normalizePickupEntry,
  normalizeTrainerEntry,
} from "../normalize";
import type {
  AbilityEntry,
  DocumentedPokemonLocationEntry,
  EncounterEntry,
  ItemEntry,
  ItemLocationEntry,
  LearnsetEntry,
  LevelCapEntry,
  LocationEntry,
  MachineEntry,
  MoveCompatibilityEntry,
  MoveEntry,
  PickupEntry,
  PokemonEntry,
  TrainerEntry,
} from "../types";
import { validateCoreData } from "../validate";

function readDataFile<T>(fileName: string): T {
  const filePath = path.join(process.cwd(), "public", "data", fileName);
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

const pokemon = readDataFile<PokemonEntry[]>("pokemon.json").map(normalizePokemonEntry);
const locations = readDataFile<LocationEntry[]>("locations.json").map(normalizeLocationEntry);
const items = readDataFile<ItemEntry[]>("items.json").map(normalizeItemEntry);
const abilities = readDataFile<AbilityEntry[]>("abilities.json");
const moves = readDataFile<MoveEntry[]>("moves.json").map(normalizeMoveEntry);
const machines = readDataFile<MachineEntry[]>("machines.json").map(normalizeMachineEntry);
const moveCompatibility = readDataFile<MoveCompatibilityEntry[]>("move-compatibility.json").map(
  normalizeMoveCompatibilityEntry,
);
const learnsets = readDataFile<LearnsetEntry[]>("learnsets.json").map(normalizeLearnsetEntry);
const encounters = readDataFile<EncounterEntry[]>("encounters.json").map(normalizeEncounterEntry);
const itemLocations = readDataFile<ItemLocationEntry[]>("item-locations.json").map(normalizeItemLocationEntry);
const trainers = readDataFile<TrainerEntry[]>("trainers.json").map(normalizeTrainerEntry);
const levelCaps = readDataFile<LevelCapEntry[]>("level-caps.json").map(normalizeLevelCapEntry);
const pickupEntries = readDataFile<PickupEntry[]>("pickup-entries.json").map(normalizePickupEntry);
const documentedPokemonLocations = readDataFile<DocumentedPokemonLocationEntry[]>("documented-pokemon-locations.json");

validateCoreData({
  pokemon,
  locations,
  items,
  moves,
  machines,
  moveCompatibility,
  learnsets,
  encounters,
  itemLocations,
  trainers,
  levelCaps,
  pickupEntries,
});

export const corePokemon = pokemon;
export const coreLocations = locations;
export const coreItems = items;
export const coreAbilities = abilities;
export const coreMoves = moves;
export const coreMachines = machines;
export const coreMoveCompatibility = moveCompatibility;
export const coreLearnsets = learnsets;
export const coreEncounters = encounters;
export const coreItemLocations = itemLocations;
export const coreTrainers = trainers;
export const coreLevelCaps = levelCaps;
export const corePickupEntries = pickupEntries;
export const coreDocumentedPokemonLocations = documentedPokemonLocations;
