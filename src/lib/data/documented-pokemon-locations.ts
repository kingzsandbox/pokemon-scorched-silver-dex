import { coreDocumentedPokemonLocations } from "./core";
import type { DocumentedPokemonLocationEntry } from "../types";

const documentedPokemonLocations = coreDocumentedPokemonLocations as DocumentedPokemonLocationEntry[];
const documentedPokemonByLocation = new Map<string, DocumentedPokemonLocationEntry[]>();

for (const entry of documentedPokemonLocations) {
  const rows = documentedPokemonByLocation.get(entry.locationId) ?? [];
  rows.push(entry);
  documentedPokemonByLocation.set(entry.locationId, rows);
}

export function getDocumentedPokemonByLocation(locationId: string): DocumentedPokemonLocationEntry[] {
  return documentedPokemonByLocation.get(locationId) ?? [];
}

