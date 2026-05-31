import { readFileSync } from "node:fs";
import path from "node:path";
import type { LocationAcquisitionEntry } from "../types";

type RawAcquisitionLocation = {
  location_name: string | null;
  map_group: number | null;
  map_number: number | null;
  shops?: Array<{
    shop_id: string;
    inventory_items?: Array<{ item_id: number; item_name: string }>;
    extraction_confidence?: string | null;
  }>;
  static_gift_pokemon?: Array<{
    acquisition_id: string;
    species_id: number;
    species_name: string;
    level: number | null;
    extraction_confidence?: string | null;
  }>;
  move_tutors?: Array<{
    tutor_id: number;
    move_id: number;
    move_name: string;
    requirement_type?: string | null;
    condition_text_candidate?: string | null;
    requirement_confidence?: string | null;
  }>;
  script_rewards?: Array<{
    reward_id: string;
    reward_type: string;
    item_id: number | null;
    item_name: string | null;
    quantity: number | null;
    extraction_confidence?: string | null;
  }>;
};

function readDataFile<T>(fileName: string): T {
  return JSON.parse(readFileSync(path.join(process.cwd(), "public", "data", fileName), "utf8")) as T;
}

type RawTutorContext = {
  tutor_id: number;
  map_group?: number | null;
  map_number?: number | null;
  location_name_candidate?: string | null;
  requirement_type?: string | null;
  condition_text_candidate?: string | null;
  dialogue_context?: Array<{ decoded_text?: string | null }>;
  requirement_confidence?: string | null;
};

const NO_EXPLICIT_TUTOR_REQUIREMENT = "No explicit requirement found in extracted game data.";

export type TutorContext = {
  tutorId: number;
  mapGroup: number | null;
  mapNumber: number | null;
  locationNameCandidate: string | null;
  requirementType: string;
  conditionText: string;
  dialogueContext: string[];
  confidence: string;
};

function hasRecoveredCondition(value: string | null | undefined): value is string {
  const normalized = value?.trim();
  return Boolean(
    normalized &&
      normalized.toLowerCase() !== "requirement unknown" &&
      normalized.toLowerCase() !== "no explicit requirement was recovered from extracted game data.",
  );
}

function normalizeTutorRequirement(row: RawTutorContext): TutorContext {
  const dialogueContext = (row.dialogue_context ?? [])
    .map((entry) => entry.decoded_text?.trim())
    .filter((entry): entry is string => Boolean(entry));
  const extractedCondition = row.condition_text_candidate?.trim();
  const conditionText =
    hasRecoveredCondition(extractedCondition)
      ? extractedCondition
      : NO_EXPLICIT_TUTOR_REQUIREMENT;

  return {
    tutorId: row.tutor_id,
    mapGroup: row.map_group ?? null,
    mapNumber: row.map_number ?? null,
    locationNameCandidate: row.location_name_candidate ?? null,
    requirementType: row.requirement_type ?? "unknown",
    conditionText,
    dialogueContext,
    confidence: row.requirement_confidence ?? "context_only",
  };
}

function locationKey(group: number | null, number: number | null): string {
  return `${group ?? "unknown"}:${number ?? "unknown"}`;
}

function uniqueBy<T>(entries: T[], keyForEntry: (entry: T) => string): T[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = keyForEntry(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeLocation(row: RawAcquisitionLocation): LocationAcquisitionEntry {
  const shops = uniqueBy(row.shops ?? [], (shop) =>
    (shop.inventory_items ?? []).map((item) => item.item_id).join(","),
  );
  const staticGiftPokemon = uniqueBy(row.static_gift_pokemon ?? [], (gift) =>
    `${gift.species_id}|${gift.level ?? ""}`,
  );
  const moveTutors = uniqueBy(row.move_tutors ?? [], (tutor) => `${tutor.tutor_id}|${tutor.move_id}`);
  const scriptRewards = uniqueBy(row.script_rewards ?? [], (reward) =>
    `${reward.reward_type}|${reward.item_id ?? ""}|${reward.item_name ?? ""}|${reward.quantity ?? ""}`,
  );

  return {
    locationName: row.location_name ?? "unknown",
    mapGroup: row.map_group,
    mapNumber: row.map_number,
    shops: shops.map((shop) => ({
      shopId: shop.shop_id,
      inventoryItems: (shop.inventory_items ?? []).map((item) => ({
        itemId: item.item_id,
        itemName: item.item_name,
      })),
      extractionConfidence: shop.extraction_confidence ?? null,
    })),
    staticGiftPokemon: staticGiftPokemon.map((gift) => ({
      acquisitionId: gift.acquisition_id,
      speciesId: gift.species_id,
      speciesName: gift.species_name,
      level: gift.level,
      extractionConfidence: gift.extraction_confidence ?? null,
    })),
    moveTutors: moveTutors.map((tutor) => ({
      tutorId: tutor.tutor_id,
      moveId: tutor.move_id,
      moveName: tutor.move_name,
      requirementType: tutor.requirement_type ?? "unknown",
      conditionTextCandidate: hasRecoveredCondition(tutor.condition_text_candidate)
        ? tutor.condition_text_candidate
        : NO_EXPLICIT_TUTOR_REQUIREMENT,
      requirementConfidence: tutor.requirement_confidence ?? "unknown",
    })),
    scriptRewards: scriptRewards.map((reward) => ({
      rewardId: reward.reward_id,
      rewardType: reward.reward_type,
      itemId: reward.item_id,
      itemName: reward.item_name,
      quantity: reward.quantity,
      extractionConfidence: reward.extraction_confidence ?? null,
    })),
  };
}

const acquisitions = readDataFile<RawAcquisitionLocation[]>("scorched-acquisition-index.json").map(normalizeLocation);
const tutorContexts = readDataFile<RawTutorContext[]>("scorched-move-tutors-enriched.json").map(normalizeTutorRequirement);
const tutorContextById = new Map(tutorContexts.map((entry) => [entry.tutorId, entry]));
const acquisitionsByMap = new Map(
  acquisitions.map((entry) => [locationKey(entry.mapGroup, entry.mapNumber), entry]),
);

export function getAcquisitionByMap(
  mapGroup: number | null,
  mapNumber: number | null,
): LocationAcquisitionEntry | undefined {
  return acquisitionsByMap.get(locationKey(mapGroup, mapNumber));
}

export function getTutorContextById(tutorId: number): TutorContext | undefined {
  return tutorContextById.get(tutorId);
}
