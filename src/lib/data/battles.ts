export type BattleCategory = "unavailable";
export type BattleFilter = "all";

export type BattleVariant = {
  id: string;
  trainerId: string;
  trainerSlug: string;
  source: string;
  ruleset: string;
  format: string;
  indexNumber: number | null;
  variantLabel: string;
  team: never[];
};

export type BattleOccurrence = {
  id: string;
  slug: string;
  trainerName: string;
  trainerClass: string | null;
  location: string;
  section: string | null;
  category: BattleCategory;
  categoryLabel: string;
  optional: boolean;
  chronologyOrder: number;
  occurrenceKey: string;
  filters: BattleFilter[];
  variantKinds: string[];
  variants: BattleVariant[];
};

export function getBattles(): BattleOccurrence[] {
  return [];
}
