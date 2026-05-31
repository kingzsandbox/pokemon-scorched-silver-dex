import { notFound } from "next/navigation";
import Link from "next/link";
import { EncounterMethodBadge, TypeBadgeList } from "../../../components/dex-visuals";
import ItemImage from "../../../components/item-image";
import PageNavigation from "../../../components/page-navigation";
import ReferenceImage from "../../../components/reference-image";
import { getPokemonMiniSpriteSources } from "../../../lib/assets";
import { getAcquisitionByMap } from "../../../lib/data/acquisition";
import { formatEncounterRate, getEncounterHeldItemDetails, getEncountersByLocation } from "../../../lib/data/encounters";
import { getItemById, getItemDisplayName, getItemsByLocation } from "../../../lib/data/items";
import { getLocationFacilityGroups, getLocationGroupBySlug } from "../../../lib/data/locations";
import { getMoveById } from "../../../lib/data/moves";
import { getPokemonDisplayName } from "../../../lib/presentation";
import { getPokemonById } from "../../../lib/data/pokemon";
import type { EncounterEntry } from "../../../lib/types";

type LocationDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    area?: string;
  }>;
};

function formatDocLocationText(value: string, parentName: string): string {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/\bhouse\b/gi, "House")
    .replace(/\bnerdy guy\b/gi, "Nerdy Guy")
    .replace(/^Lighthouse\s+top$/i, "Top")
    .trim();
  const parentWithoutSuffix = parentName.replace(/\s+(City|Town)$/i, "");
  const detailMatch = cleaned.match(new RegExp(`^${parentWithoutSuffix}\\s*-\\s*(.+)$`, "i"));
  if (detailMatch) {
    return detailMatch[1].trim();
  }
  if (cleaned.toLowerCase() === parentWithoutSuffix.toLowerCase()) {
    return parentName;
  }
  return cleaned;
}

function joinUniqueDisplayParts(parts: Array<string | null | undefined>): string {
  const seen = new Set<string>();
  const uniqueParts: string[] = [];
  for (const part of parts) {
    const trimmed = part?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueParts.push(trimmed);
  }
  return uniqueParts.join(" • ");
}

function formatLocationItemNote(notes: string, parentName: string): string {
  const trimmed = notes.trim();
  const docMatch = trimmed.match(/^Documentation-backed location:\s*(.+?)\.\s*Source:\s*attached\s+ScorchedSilver_Items\.xls\s+row\s+(\d+);\s*not ROM-backed\.?$/i);
  if (docMatch) {
    return formatDocLocationText(docMatch[1], parentName);
  }

  if (/^ROM-backed/i.test(trimmed)) {
    if (/hidden_item_candidate|hidden_bg_event_kind_7/i.test(trimmed)) {
      return "Hidden item";
    }

    if (/overworld_ball_candidate|visible_item_ball_script_pattern/i.test(trimmed)) {
      return "Item ball";
    }

    return "Found item";
  }

  const scriptRewardMatch = trimmed.match(/^Script reward(?:\s+x(\d+))?/i);
  if (scriptRewardMatch) {
    return scriptRewardMatch[1] ? `Event reward x${scriptRewardMatch[1]}` : "Event reward";
  }

  const tmShopMatch = trimmed.match(/^Shop - TMs; price ([\d.]+)$/i);
  if (tmShopMatch) {
    const price = Number.parseFloat(tmShopMatch[1]);
    return Number.isFinite(price) ? `TM Shop • ${new Intl.NumberFormat('en-US').format(price)}` : 'TM Shop';
  }

  return trimmed
    .replace(/confidence\s+medium_high/gi, "high confidence")
    .replace(/^Shop - TMs/i, 'TM Shop')
    .replace(/^Shop - /i, 'Shop • ')
    .replace(/;\s*price\s*([\d.]+)/gi, (_, value) => {
      const price = Number.parseFloat(value);
      return Number.isFinite(price) ? ` • ${new Intl.NumberFormat('en-US').format(price)}` : '';
    })
    .replace(/;\s*hidden item/gi, ' • Hidden item')
    .replace(/;\s*hidden/gi, ' • Hidden')
    .replace(/;\s*/g, ' • ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseMapFromLocationId(locationId: string): { mapGroup: number | null; mapNumber: number | null } {
  const match = locationId.match(/^location-g(\d+)-m(\d+)$/);
  if (!match) {
    return { mapGroup: null, mapNumber: null };
  }

  return {
    mapGroup: Number.parseInt(match[1], 10),
    mapNumber: Number.parseInt(match[2], 10),
  };
}

function badgeStyle() {
  return {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    minHeight: "26px",
    padding: "0 9px",
    borderRadius: "999px",
    border: "1px solid var(--border-soft)",
    background: "var(--surface-muted)",
    color: "var(--text-muted)",
    fontSize: "0.78rem",
    fontWeight: 700,
  } as const;
}

function confidenceLabel(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "high" || normalized === "medium_high" || normalized === "medium") return null;
  if (normalized === "low") return "Needs review";
  if (normalized.includes("handler") || normalized.includes("script")) return null;
  return value.replace(/_/g, " ").replace(/\bcandidate\b/gi, "").trim();
}

function rewardTypeLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\bcandidate\b/gi, "")
    .replace(/\bitem\b/i, "Item")
    .replace(/\bpokemon\b/i, "Pokémon")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

function tutorRequirementText(value: string | null | undefined): string {
  if (!value || /requirement\s+(unknown|missing)/i.test(value) || /no explicit requirement/i.test(value)) {
    return "";
  }

  return value.replace(/_/g, " ").replace(/\bcandidate\b/gi, "").trim();
}

function isEventRewardItemNote(notes: string): boolean {
  return /^Script reward\b/i.test(notes.trim());
}

function isGuideListedItemNote(notes: string): boolean {
  return /^Documentation-backed location:/i.test(notes.trim());
}

function isShopLikeGuideNote(notes: string): boolean {
  const lower = notes.toLowerCase();
  return (
    lower.includes("department store") ||
    lower.includes("sweet shop") ||
    lower.includes(" tm shop") ||
    lower.includes(" shop") ||
    lower.includes("mart") ||
    lower.includes("vendor")
  );
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

function isRenderableAreaLabel(groupName: string, value: string | null): value is string {
  if (!value) {
    return false;
  }

  if (/^(?:\dF|B\dF|\dBF)$/i.test(value)) {
    return true;
  }

  if (/^Safari Zone$/i.test(groupName)) {
    return /^(Entrance|North|Northeast|Northwest|South|Southeast|Southwest)$/i.test(value);
  }

  if (/^Dark Cave$/i.test(groupName)) {
    return /Entrance/i.test(value);
  }

  if (/^Mt\.?\s+Silver$/i.test(groupName)) {
    return /^(Exterior|Peak)$/i.test(value);
  }

  if (/^Whirl Islands$/i.test(groupName) && /^Surface Water$/i.test(value)) {
    return true;
  }

  if (/^Ilex Forest$/i.test(groupName)) {
    return /^(Past|Present)$/i.test(value);
  }

  if (/^Lighthouse$/i.test(groupName)) {
    return /^(Lower Floors|Top)$/i.test(value);
  }

  if (/^S\.S\.\s+Tidal$/i.test(groupName)) {
    return /^(Cabin Hallway|Passenger Cabins|Lower Hull)$/i.test(value);
  }

  if (/^Trainer Hill$/i.test(groupName)) {
    return /^Reception$/i.test(value);
  }

  if (/^Seashore House$/i.test(groupName)) {
    return /^Main Room$/i.test(value);
  }

  if (/^Phoenix Base$/i.test(groupName)) {
    return /^(Goldenrod Base|Ecruteak Base)$/i.test(value);
  }

  return false;
}

function renderAreaLabel(groupName: string, value: string | null | undefined): string | null {
  return isRenderableAreaLabel(groupName, value ?? null) ? value ?? null : null;
}

function slugifyArea(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type EncounterWithArea = EncounterEntry & {
  areaLabel: string;
  mapLabel: string | null;
};

type DisplayEncounter = {
  id: string;
  pokemonId: string;
  rawSpecies?: string;
  method: string;
  areaLabel: string | null;
  rate: number;
  minLevel: number;
  maxLevel: number;
  entries: EncounterWithArea[];
};

function splitIlexForestEncounter(
  encounter: EncounterWithArea,
  selectedArea: string | null,
): EncounterWithArea[] {
  const normalizedMethod = encounter.method.toLowerCase();

  if (normalizedMethod === "grass") {
    const era = encounter.maxLevel <= 10 ? "Past" : "Present";
    return selectedArea === null || selectedArea === era ? [{ ...encounter, areaLabel: era }] : [];
  }

  if (normalizedMethod === "surf" || normalizedMethod === "fishing") {
    if (selectedArea) {
      return [{ ...encounter, areaLabel: selectedArea }];
    }

    return [
      { ...encounter, areaLabel: "Past" },
      { ...encounter, areaLabel: "Present" },
    ];
  }

  return selectedArea === null ? [encounter] : [];
}

function displayEncounterMethod(encounter: Pick<EncounterWithArea, "method" | "areaLabel" | "maxLevel">): string {
  if (/underwater/i.test(encounter.areaLabel)) {
    return "Dive / Underwater";
  }

  if (encounter.method.toLowerCase() === "fishing") {
    if (encounter.maxLevel <= 10) return "Fishing - Old Rod";
    if (encounter.maxLevel <= 30) return "Fishing - Good Rod";
    return "Fishing - Super Rod";
  }

  return encounter.method;
}

function canMergeEncounterBand(row: DisplayEncounter, encounter: EncounterWithArea): boolean {
  const minLevel = Math.min(row.minLevel, encounter.minLevel);
  const maxLevel = Math.max(row.maxLevel, encounter.maxLevel);
  const overlapsOrTouches = encounter.minLevel <= row.maxLevel + 2 && encounter.maxLevel >= row.minLevel - 2;

  return overlapsOrTouches && maxLevel - minLevel <= 20;
}

function combineEncounterRows(locationName: string, encounters: EncounterWithArea[]): DisplayEncounter[] {
  const grouped = new Map<string, DisplayEncounter[]>();

  for (const encounter of encounters) {
    const areaLabel = renderAreaLabel(locationName, encounter.areaLabel);
    const method = displayEncounterMethod(encounter);
    const groupKey = [encounter.pokemonId, method, areaLabel ?? ""].join("|");
    const rows = grouped.get(groupKey) ?? [];
    const existing = rows.find((row) => canMergeEncounterBand(row, encounter));

    if (existing) {
      existing.rate = Math.round((existing.rate * existing.entries.length + encounter.rate) / (existing.entries.length + 1));
      existing.minLevel = Math.min(existing.minLevel, encounter.minLevel);
      existing.maxLevel = Math.max(existing.maxLevel, encounter.maxLevel);
      existing.entries.push(encounter);
      continue;
    }

    rows.push({
      id: `${groupKey}|${encounter.id}`,
      pokemonId: encounter.pokemonId,
      rawSpecies: encounter.rawSpecies,
      method,
      areaLabel,
      rate: encounter.rate,
      minLevel: encounter.minLevel,
      maxLevel: encounter.maxLevel,
      entries: [encounter],
    });
    grouped.set(groupKey, rows);
  }

  return [...grouped.values()]
    .flat()
    .sort((left, right) => {
      const leftPokemon = getPokemonById(left.pokemonId);
      const rightPokemon = getPokemonById(right.pokemonId);
      const leftNumber = leftPokemon?.dexNumber ?? Number.MAX_SAFE_INTEGER;
      const rightNumber = rightPokemon?.dexNumber ?? Number.MAX_SAFE_INTEGER;

      const leftMethodOrder = encounterMethodOrder(left.method);
      const rightMethodOrder = encounterMethodOrder(right.method);
      if (leftMethodOrder !== rightMethodOrder) return leftMethodOrder - rightMethodOrder;
      if (left.rate !== right.rate) return right.rate - left.rate;
      if ((left.areaLabel ?? "") !== (right.areaLabel ?? "")) {
        return (left.areaLabel ?? "").localeCompare(right.areaLabel ?? "");
      }
      if (leftNumber !== rightNumber) return leftNumber - rightNumber;
      if (left.minLevel !== right.minLevel) return left.minLevel - right.minLevel;
      return left.method.localeCompare(right.method);
    });
}

function getDisplayHeldItems(row: DisplayEncounter) {
  const seen = new Set<string>();
  return row.entries
    .flatMap((entry) => getEncounterHeldItemDetails(entry))
    .filter((item) => {
      const key = `${item.itemName}|${item.chanceLabel}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function encounterMethodOrder(method: string): number {
  const normalized = method.toLowerCase();
  if (normalized.includes("gift") || normalized.includes("static")) return 0;
  if (normalized === "grass") return 1;
  if (normalized.includes("rock")) return 2;
  if (normalized === "surf") return 3;
  if (normalized.includes("underwater")) return 4;
  if (normalized.includes("old rod")) return 5;
  if (normalized.includes("good rod")) return 6;
  if (normalized.includes("super rod")) return 7;
  if (normalized.includes("fishing")) return 8;
  return 20;
}

function shopDisplayName(
  groupName: string,
  shop: { areaLabel: string; inventoryItems: Array<{ itemId: number; itemName: string }> },
): string {
  const renderedArea = renderAreaLabel(groupName, shop.areaLabel);
  const names = shop.inventoryItems.map((item) => item.itemName.toLowerCase());
  const hasAny = (patterns: RegExp[]) => names.some((name) => patterns.some((pattern) => pattern.test(name)));

  if (hasAny([/^tm\d+/, /^hm\d+/])) return renderedArea ? `${renderedArea} TM Shop` : "TM Shop";
  if (hasAny([/level ball/, /lure ball/, /moon ball/, /friend ball/, /love ball/, /fast ball/, /heavy ball/])) {
    return renderedArea ? `${renderedArea} Ball Shop` : "Ball Shop";
  }
  if (hasAny([/hp up/, /protein/, /iron/, /calcium/, /zinc/, /carbos/, /pp up/, /pp max/])) {
    return renderedArea ? `${renderedArea} Vitamin Shop` : "Vitamin Shop";
  }
  if (hasAny([/pok[eé] ball/, /potion/, /repel/, /escape rope/, /antidote/, /paralyze heal/, /awakening/, /burn heal/, /ice heal/])) {
    return renderedArea ? `${renderedArea} Poké Mart` : "Poké Mart";
  }
  if (hasAny([/incense/, /cracked pot/, /chipped pot/, /sweet/, /nectar/, /herb/, /big root/])) {
    return renderedArea ? `${renderedArea} Specialty Shop` : "Specialty Shop";
  }
  if (hasAny([/moomoo milk/, /fresh water/, /soda pop/, /lemonade/, /ragecandybar/])) {
    return renderedArea ? `${renderedArea} Drink Shop` : "Drink Shop";
  }

  return renderedArea ? `${renderedArea} Shop` : "Shop";
}

function baseShopKind(shop: { inventoryItems: Array<{ itemId: number; itemName: string }> }): string {
  return shopDisplayName("", { ...shop, areaLabel: "" });
}

function inventorySignature(shop: { inventoryItems: Array<{ itemId: number }> }): string {
  return shop.inventoryItems.map((item) => item.itemId).join(",");
}

function floorSortValue(areaLabel: string): number {
  if (/^1F$/i.test(areaLabel)) return 1;
  if (/^2F$/i.test(areaLabel)) return 2;
  if (/^3F$/i.test(areaLabel)) return 3;
  if (/^4F$/i.test(areaLabel)) return 4;
  if (/^5F$/i.test(areaLabel)) return 5;
  return 99;
}

type RawDisplayShop = {
  shopId: string;
  areaLabel: string;
  facilityName: string | null;
  extractionConfidence: string | null;
  inventoryItems: Array<{ itemId: number; itemName: string }>;
};

type DisplayShop = {
  key: string;
  title: string;
  areaLabel: string | null;
  extractionConfidence: string | null;
  inventoryItems: Array<{ itemId: number; itemName: string }>;
};

function uniqueInventoryItems(items: Array<{ itemId: number; itemName: string }>): Array<{ itemId: number; itemName: string }> {
  const byId = new Map<number, { itemId: number; itemName: string }>();
  for (const item of items) {
    byId.set(item.itemId, item);
  }
  return [...byId.values()];
}

function buildDisplayShops(rawShops: RawDisplayShop[]): DisplayShop[] {
  const departmentStoreShops = rawShops.filter((shop) => shop.facilityName === "Goldenrod Department Store");
  const nonDepartmentStoreShops = rawShops.filter((shop) => shop.facilityName !== "Goldenrod Department Store");
  const assignedDepartmentInventories = new Map<string, RawDisplayShop>();

  for (const shop of departmentStoreShops) {
    const key = inventorySignature(shop);
    const existing = assignedDepartmentInventories.get(key);
    if (!existing || floorSortValue(shop.areaLabel) > floorSortValue(existing.areaLabel)) {
      assignedDepartmentInventories.set(key, shop);
    }
  }

  const departmentByFloor = new Map<string, RawDisplayShop[]>();
  for (const shop of assignedDepartmentInventories.values()) {
    const floor = /^[1-5]F$/i.test(shop.areaLabel) ? shop.areaLabel.toUpperCase() : "Floor";
    departmentByFloor.set(floor, [...(departmentByFloor.get(floor) ?? []), shop]);
  }

  const displayShops: DisplayShop[] = [...departmentByFloor.entries()]
    .sort(([left], [right]) => floorSortValue(left) - floorSortValue(right))
    .map(([floor, shops]) => ({
      key: `Goldenrod Department Store|${floor}`,
      title: `Goldenrod Department Store - ${floor}`,
      areaLabel: floor,
      extractionConfidence: shops.find((shop) => shop.extractionConfidence)?.extractionConfidence ?? null,
      inventoryItems: uniqueInventoryItems(shops.flatMap((shop) => shop.inventoryItems)),
    }));

  const normalShopGroups = new Map<string, RawDisplayShop[]>();
  for (const shop of nonDepartmentStoreShops) {
    const facility = shop.facilityName ?? "";
    const kind = baseShopKind(shop);
    const key = `${facility}|${kind}`;
    normalShopGroups.set(key, [...(normalShopGroups.get(key) ?? []), shop]);
  }

  for (const [key, shops] of normalShopGroups.entries()) {
    const [facility, kind] = key.split("|");
    displayShops.push({
      key,
      title: facility ? `${facility} - ${kind}` : kind,
      areaLabel: shops[0]?.areaLabel ?? null,
      extractionConfidence: shops.find((shop) => shop.extractionConfidence)?.extractionConfidence ?? null,
      inventoryItems: uniqueInventoryItems(shops.flatMap((shop) => shop.inventoryItems)),
    });
  }

  return displayShops.filter((shop) => shop.inventoryItems.length > 0);
}

export default async function LocationDetailPage({ params, searchParams }: LocationDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const locationGroup = getLocationGroupBySlug(slug);

  if (!locationGroup) {
    notFound();
  }

  const baseRenderedAreaLabels = [
    ...new Set(
      locationGroup.mappedChildren
        .map((child) => renderAreaLabel(locationGroup.name, child.areaLabel))
        .filter((label): label is string => label !== null),
    ),
  ];
  const renderedAreaLabels = locationGroup.name === "Ilex Forest" ? ["Past", "Present"] : baseRenderedAreaLabels;
  const selectedArea =
    renderedAreaLabels.length > 1
      ? renderedAreaLabels.find((areaLabel) => slugifyArea(areaLabel) === resolvedSearchParams.area) ?? renderedAreaLabels[0]
      : null;
  const scopedMappedChildren = selectedArea
    ? locationGroup.name === "Ilex Forest"
      ? locationGroup.mappedChildren
      : locationGroup.mappedChildren.filter((child) => renderAreaLabel(locationGroup.name, child.areaLabel) === selectedArea)
    : locationGroup.mappedChildren;
  const scopedChildren = selectedArea
    ? locationGroup.name === "Ilex Forest"
      ? locationGroup.children
      : locationGroup.children.filter((child) => renderAreaLabel(locationGroup.name, child.areaLabel) === selectedArea)
    : locationGroup.children;

  const rawEncounterCandidates = scopedMappedChildren.flatMap((child) =>
    getEncountersByLocation(child.location.id).map((encounter) => ({
      ...encounter,
      areaLabel: child.areaLabel,
      mapLabel: child.mapLabel,
    })),
  );
  const rawEncounters =
    locationGroup.name === "Ilex Forest"
      ? rawEncounterCandidates.flatMap((encounter) => splitIlexForestEncounter(encounter, selectedArea))
      : rawEncounterCandidates;
  const encounters = combineEncounterRows(locationGroup.name, rawEncounters);
  const hasHeldItemColumn = encounters.some((encounter) => getDisplayHeldItems(encounter).length > 0);
  const facilityGroups = getLocationFacilityGroups(locationGroup.name);
  const facilityChildren = facilityGroups.flatMap((group) =>
    group.children.map((child) => ({
      ...child,
      facilityName: group.name,
    })),
  );
  const acquisitions = scopedChildren
    .map((child) => {
      const mapRef = parseMapFromLocationId(child.location.id);
      if (mapRef.mapGroup === null || mapRef.mapNumber === null) {
        return null;
      }
      const acquisition = getAcquisitionByMap(mapRef.mapGroup, mapRef.mapNumber);
      return acquisition
        ? {
            ...acquisition,
            areaLabel: child.areaLabel,
            mapLabel: child.mapLabel,
          }
        : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  const facilityAcquisitions = facilityChildren
    .map((child) => {
      const mapRef = parseMapFromLocationId(child.location.id);
      if (mapRef.mapGroup === null || mapRef.mapNumber === null) {
        return null;
      }
      const acquisition = getAcquisitionByMap(mapRef.mapGroup, mapRef.mapNumber);
      return acquisition
        ? {
            ...acquisition,
            areaLabel: child.areaLabel,
            mapLabel: child.mapLabel,
            facilityName: child.facilityName,
          }
        : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  const allAcquisitions = [...acquisitions, ...facilityAcquisitions];
  const showAreaLabels = renderedAreaLabels.length > 1;
  const hasShops = allAcquisitions.some((entry) => entry.shops.length > 0);
  const itemSourceChildren = [...scopedChildren, ...facilityChildren];
  const rawFoundItems = itemSourceChildren.flatMap((child) =>
    getItemsByLocation(child.location.id).map((item) => ({
      ...item,
      areaLabel: child.areaLabel,
      mapLabel: child.mapLabel,
      facilityName: "facilityName" in child && typeof child.facilityName === "string" ? child.facilityName : null,
    })),
  );
  const concreteItemIds = new Set(
    rawFoundItems
      .filter((item) => !isGuideListedItemNote(item.notes))
      .map((item) => item.item.id),
  );
  const foundItems = rawFoundItems.filter((item) => {
    const notes = item.notes.trim();
    if (/^Shop\s+-/i.test(notes)) return false;
    if (isEventRewardItemNote(notes)) return false;
    if (hasShops && isShopLikeGuideNote(notes)) return false;
    if (isGuideListedItemNote(notes) && concreteItemIds.has(item.item.id)) return false;
    return true;
  });
  const hasStaticGiftPokemon = allAcquisitions.some((entry) => entry.staticGiftPokemon.length > 0);
  const hasMoveTutors = allAcquisitions.some((entry) => entry.moveTutors.length > 0);
  const hasScriptRewards = allAcquisitions.some((entry) => entry.scriptRewards.length > 0);
  const hasOtherObtainables = hasShops || hasStaticGiftPokemon || hasMoveTutors || hasScriptRewards;
  const showEncounterAreaColumn = showAreaLabels && selectedArea === null;
  const displayShops = buildDisplayShops(
    allAcquisitions.flatMap((entry) =>
      entry.shops.map((shop) => ({
        ...shop,
        areaLabel: entry.areaLabel,
        facilityName: "facilityName" in entry && typeof entry.facilityName === "string" ? entry.facilityName : null,
      })),
    ),
  );
  const displayStaticGiftPokemon = uniqueBy(
    allAcquisitions.flatMap((entry) =>
      entry.staticGiftPokemon.map((gift) => ({ ...gift, areaLabel: entry.areaLabel, facilityName: "facilityName" in entry ? entry.facilityName : null })),
    ),
    (gift) => `${gift.facilityName ?? ""}|${renderAreaLabel(locationGroup.name, gift.areaLabel) ?? ""}|${gift.speciesId}|${gift.level ?? ""}`,
  );
  const displayMoveTutors = uniqueBy(
    acquisitions.flatMap((entry) => entry.moveTutors.map((tutor) => ({ ...tutor, areaLabel: entry.areaLabel, facilityName: null }))),
    (tutor) => `${renderAreaLabel(locationGroup.name, tutor.areaLabel) ?? ""}|${tutor.moveId}`,
  );
  const displayScriptRewards = uniqueBy(
    acquisitions.flatMap((entry) => entry.scriptRewards.map((reward) => ({ ...reward, areaLabel: entry.areaLabel, facilityName: null }))),
    (reward) => `${renderAreaLabel(locationGroup.name, reward.areaLabel) ?? ""}|${reward.itemId ?? ""}|${reward.itemName ?? ""}|${reward.quantity ?? ""}`,
  );

  return (
    <main style={{ margin: "0 auto", maxWidth: "980px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref="/locations" backLabel="Back to Locations" />
      <h1 style={{ marginTop: 0 }}>{locationGroup.name}</h1>
      {locationGroup.caveats.length > 0 ? (
        <div
          style={{
            display: "grid",
            gap: "6px",
            padding: "12px 14px",
            border: "1px solid var(--border-soft)",
            borderRadius: "14px",
            background: "var(--surface-card)",
            color: "var(--text-muted)",
          }}
        >
          {locationGroup.caveats.map((caveat) => (
            <span key={caveat}>{caveat}</span>
          ))}
        </div>
      ) : null}

      {showAreaLabels ? (
        <section style={{ marginTop: "24px" }}>
          <h2>Areas</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {renderedAreaLabels.map((areaLabel) => (
              <Link
                key={areaLabel}
                href={`/locations/${locationGroup.slug}?area=${slugifyArea(areaLabel)}`}
                style={{
                  ...badgeStyle(),
                  textDecoration: "none",
                  borderColor: areaLabel === selectedArea ? "var(--accent-gold)" : "var(--border-soft)",
                  color: areaLabel === selectedArea ? "var(--accent-gold)" : "var(--text-muted)",
                  background: areaLabel === selectedArea ? "rgba(214, 176, 81, 0.12)" : "var(--surface-muted)",
                }}
              >
                {areaLabel}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section style={{ marginTop: "24px" }}>
        <h2>Encounters</h2>
        {encounters.length === 0 ? (
          <p>
            No wild Pokémon listed.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-muted)" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)" }}>
                    Pokémon
                  </th>
                  <th style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid var(--border-soft)" }}>
                    Type
                  </th>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)" }}>
                    Method
                  </th>
                  {showEncounterAreaColumn ? (
                    <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)" }}>
                      Area
                    </th>
                  ) : null}
                  <th style={{ padding: "10px 12px", textAlign: "right", borderBottom: "1px solid var(--border-soft)" }}>
                    Encounter Rate
                  </th>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)" }}>
                    Level
                  </th>
                  {hasHeldItemColumn ? (
                    <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)" }}>
                      Held Item
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {encounters.map((encounter) => {
                  const pokemon = getPokemonById(encounter.pokemonId);
                  const heldItems = getDisplayHeldItems(encounter);
                  const sprite = pokemon ? getPokemonMiniSpriteSources(pokemon) : null;
                  return (
                    <tr key={encounter.id}>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "44px 52px 1fr", gap: "10px", alignItems: "center" }}>
                          {pokemon && sprite ? (
                            <ReferenceImage
                              src={sprite.src}
                              fallbackSrc={sprite.fallbackSrc}
                              alt={pokemon.name}
                              width={40}
                              height={40}
                              normalizeVisual
                              visualScaleHint={sprite.visualScale}
                              style={{ imageRendering: "pixelated" }}
                            />
                          ) : (
                          <span />
                        )}
                          <span style={{ color: "var(--text-muted)" }}>{pokemon ? `#${pokemon.dexNumber}` : "—"}</span>
                          <span>
                            {pokemon ? (
                              <Link href={`/pokemon/${pokemon.slug}?returnTo=${encodeURIComponent(`/?tab=locations`)}`}>
                                {getPokemonDisplayName(pokemon)}
                              </Link>
                            ) : (
                              encounter.rawSpecies ?? encounter.pokemonId
                            )}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid var(--border-soft)" }}>
                        <TypeBadgeList types={pokemon?.types ?? []} />
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
                        <EncounterMethodBadge method={encounter.method} />
                      </td>
                      {showEncounterAreaColumn ? (
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
                          <span style={{ color: "var(--text-body)" }}>{encounter.areaLabel ?? "—"}</span>
                        </td>
                      ) : null}
                      <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: "1px solid var(--border-soft)" }}>
                        {formatEncounterRate(encounter.rate)}
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
                        {encounter.minLevel === encounter.maxLevel
                          ? `Lv. ${encounter.minLevel}`
                          : `Lv. ${encounter.minLevel}-${encounter.maxLevel}`}
                      </td>
                      {hasHeldItemColumn ? (
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
                          {heldItems.length > 0 ? (
                            <div style={{ display: "grid", gap: "4px" }}>
                              {heldItems.map((item) => (
                                <span key={`${encounter.id}-${item.itemName}`}>
                                  {item.itemSlug ? (
                                    <Link href={`/items/${item.itemSlug}`}>
                                      {item.itemName} ({item.chanceLabel})
                                    </Link>
                                  ) : (
                                    `${item.itemName} (${item.chanceLabel})`
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ marginTop: "28px" }}>
        <h2>Items Found Here</h2>
        {foundItems.length === 0 ? (
          <p>No items listed.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {foundItems.map((item) => (
              <Link
                key={item.itemLocationId}
                href={`/items/${item.item.slug}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px minmax(0, 1fr)",
                  gap: "12px",
                  alignItems: "center",
                  padding: "12px 14px",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "14px",
                  background: "var(--surface-card)",
                  textDecoration: "none",
                }}
              >
                <ItemImage item={item.item} size={34} framed />
                <span>
                  <strong style={{ color: "var(--text-body)", display: "block" }}>{getItemDisplayName(item.item)}</strong>
                  <span style={{ color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                    {joinUniqueDisplayParts([
                      item.facilityName ?? (showAreaLabels ? renderAreaLabel(locationGroup.name, item.areaLabel) : null),
                      item.notes ? formatLocationItemNote(item.notes, locationGroup.name) : null,
                    ])}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {hasOtherObtainables ? (
        <section style={{ marginTop: "28px" }}>
          <h2>Other Obtainables</h2>
          <div style={{ display: "grid", gap: "18px" }}>
            {hasShops ? (
              <section>
                <h3>Shops</h3>
                <div style={{ display: "grid", gap: "10px" }}>
                  {displayShops.map((shop) => (
                    <article
                      key={shop.key}
                      style={{
                        border: "1px solid var(--border-soft)",
                        borderRadius: "12px",
                        background: "var(--surface-card)",
                        padding: "14px",
                      }}
                    >
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                        <strong>{shop.title}</strong>
                        {showAreaLabels && shop.areaLabel && renderAreaLabel(locationGroup.name, shop.areaLabel) ? <span style={badgeStyle()}>{shop.areaLabel}</span> : null}
                        {confidenceLabel(shop.extractionConfidence) ? (
                          <span style={badgeStyle()}>{confidenceLabel(shop.extractionConfidence)}</span>
                        ) : null}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px", marginTop: "10px" }}>
                        {shop.inventoryItems.map((entry) => {
                          const item = getItemById(`item-${String(entry.itemId).padStart(4, "0")}`);
                          return item ? (
                            <Link key={`${shop.key}-${entry.itemId}`} href={`/items/${item.slug}`}>
                              {getItemDisplayName(item)}
                            </Link>
                          ) : (
                            <span key={`${shop.key}-${entry.itemId}`}>{entry.itemName}</span>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {hasStaticGiftPokemon ? (
              <section>
                <h3>Gift / Static Pokémon</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 14px" }}>
                  {displayStaticGiftPokemon.map((gift) => {
                    const pokemon = getPokemonById(`pokemon-${String(gift.speciesId).padStart(4, "0")}`);
                    return (
                      <span key={gift.acquisitionId}>
                        {pokemon ? (
                          <Link href={`/pokemon/${pokemon.slug}`}>{getPokemonDisplayName(pokemon)}</Link>
                        ) : (
                          gift.speciesName
                        )}
                        {gift.facilityName ? ` • ${gift.facilityName}` : ""}
                        {showAreaLabels && renderAreaLabel(locationGroup.name, gift.areaLabel) ? ` • ${gift.areaLabel}` : ""}
                        {gift.level ? ` Lv. ${gift.level}` : ""}
                        {confidenceLabel(gift.extractionConfidence) ? ` (${confidenceLabel(gift.extractionConfidence)})` : ""}
                      </span>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {hasMoveTutors ? (
              <section>
                <h3>Move Tutors</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 14px" }}>
                  {displayMoveTutors.map((tutor) => {
                    const move = getMoveById(`move-${String(tutor.moveId).padStart(4, "0")}`);
                    return (
                      <span key={`tutor-${tutor.tutorId}`}>
                        {move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : tutor.moveName}
                        {showAreaLabels && renderAreaLabel(locationGroup.name, tutor.areaLabel) ? ` • ${tutor.areaLabel}` : ""}
                        {tutorRequirementText(tutor.conditionTextCandidate) ? (
                          <>
                            {" - "}
                            <span style={{ color: "var(--text-muted)" }}>
                              {tutorRequirementText(tutor.conditionTextCandidate)}
                            </span>
                          </>
                        ) : null}
                      </span>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {hasScriptRewards ? (
              <section>
                <h3>Event Rewards</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 14px" }}>
                  {displayScriptRewards.map((reward) => {
                    const item = reward.itemId !== null ? getItemById(`item-${String(reward.itemId).padStart(4, "0")}`) : null;
                    return (
                      <span key={reward.rewardId}>
                        {item ? <Link href={`/items/${item.slug}`}>{getItemDisplayName(item)}</Link> : reward.itemName ?? rewardTypeLabel(reward.rewardType)}
                        {showAreaLabels && renderAreaLabel(locationGroup.name, reward.areaLabel) ? ` • ${reward.areaLabel}` : ""}
                        {reward.quantity ? ` x${reward.quantity}` : ""}
                      </span>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
