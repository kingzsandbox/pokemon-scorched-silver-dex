"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ItemImage from "./item-image";
import type { ItemEntry } from "../lib/types";

type ItemDisplayCategory =
  | "Key Items"
  | "Evolution Items"
  | "Mega Stones"
  | "Z-Crystals"
  | "Berries"
  | "Held Items"
  | "Poke Balls"
  | "Medicines"
  | "Modifier Items"
  | "Battle Items"
  | "Valuables";

type BrowseItemEntry = ItemEntry & {
  displayCategoryOverride?: ItemDisplayCategory;
  displayDescriptionOverride?: string;
};

type ItemsReferenceProps = {
  items: BrowseItemEntry[];
};

const categoryOrder: Array<"all" | ItemDisplayCategory> = [
  "all",
  "Key Items",
  "Evolution Items",
  "Mega Stones",
  "Z-Crystals",
  "Berries",
  "Poke Balls",
  "Held Items",
  "Medicines",
  "Modifier Items",
  "Battle Items",
  "Valuables",
];

const evolutionItemNames = new Set(
  [
    "Oval Stone",
    "Ice Stone",
    "Sun Stone",
    "Moon Stone",
    "Fire Stone",
    "Water Stone",
    "Thunder Stone",
    "Leaf Stone",
    "Shiny Stone",
    "Dusk Stone",
    "Dawn Stone",
    "King's Rock",
    "Dragon Scale",
    "Prism Scale",
    "Sachet",
    "Whipped Dream",
    "Protector",
    "Electirizer",
    "Magmarizer",
    "Reaper Cloth",
    "Dubious Disc",
    "Razor Fang",
    "Metal Coat",
    "Deep Sea Tooth",
    "Deep Sea Scale",
    "Razor Claw",
    "Sweet Apple",
    "Tart Apple",
    "Galarica Cuff",
    "Galarica Wreath",
    "GalaricaCuff",
    "GalrcaWreath",
    "Trade Stone",
    "Peat Block",
    "Strawberry Sweet",
    "Love Sweet",
    "Berry Sweet",
    "Clover Sweet",
    "Flower Sweet",
    "Star Sweet",
    "Ribbon Sweet",
    "Chipped Pot",
    "Cracked Pot",
    "Upgrade",
  ].map((entry) => entry.toLowerCase()),
);

const medicineKeywords = [
  "restores 20 hp",
  "restores 50 hp",
  "restores 60 hp",
  "restores 80 hp",
  "restores 200 hp",
  "restore the pp",
  "restore 10 pp",
  "restore 5 pp",
  "fully restore the pp",
  "fully restores the hp",
  "revives a fainted pokémon",
  "heals all the status problems",
  "heals any status problem",
  "medicine",
  "medicinal herb",
];

const explicitCategoryOverrides: Record<string, ItemDisplayCategory> = {
  "white-herb": "Battle Items",
  "power-herb": "Battle Items",
  "mental-herb": "Battle Items",
  "lucky-punch": "Held Items",
  "scope-lens": "Held Items",
  "razor-claw": "Held Items",
  "razor-fang": "Held Items",
  "metal-coat": "Held Items",
  "deep-sea-tooth": "Held Items",
  "deep-sea-scale": "Held Items",
  eviolite: "Held Items",
  "flame-orb": "Held Items",
  "toxic-orb": "Held Items",
  "red-orb": "Held Items",
  "blue-orb": "Held Items",
  "relic-band": "Valuables",
  "sacred-ash": "Medicines",
};

function getItemDisplayName(item: BrowseItemEntry): string {
  return item.name.replace(/\s*\[(.+?)\]/g, " $1").replace(/\s+/g, " ").trim();
}

function getComparableItemName(item: BrowseItemEntry): string {
  return getItemDisplayName(item)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getItemDisplayDescription(item: BrowseItemEntry): string {
  return item.displayDescriptionOverride ?? item.description;
}

function getCleanItemSlug(item: BrowseItemEntry): string {
  return item.slug.replace(/^item-\d+-/, "").replace(/^\d+-/, "");
}

function isZMoveItem(item: BrowseItemEntry): boolean {
  if (getItemDisplayName(item).toLowerCase() === "z-power ring") {
    return false;
  }

  const normalizedText = `${getItemDisplayName(item)} ${item.category} ${item.description}`.toLowerCase();
  return (
    /\bz[-\s]?crystal\b|\bz[-\s]?move\b|\bz[-\s]?power\b/.test(normalizedText) ||
    /\b[a-z]+ium z\b/.test(normalizedText) ||
    /\b(u-necrozium|aloraichium|decidium|eevium|incinium|kommonium|lunalium|lycanium|marshadium|mewnium|mimikium|pikanium|pikashunium|primarium|snorlium|solganium|tapunium)\s+z\b/.test(
      normalizedText,
    )
  );
}

function isHeldEffectItem(item: BrowseItemEntry): boolean {
  const name = getItemDisplayName(item).toLowerCase();
  const description = item.description.toLowerCase();
  return (
    item.category.toLowerCase().includes("held") ||
    /an item to be held by|if held by a pokémon|when held|holder|boosts the power|raises the holder|hold item|held item|prevents the use of status moves|gradually restores hp|boosts exp|prevents effects of traps|protects from weather effects|boosts the accuracy|ups the power|raises sp\. atk\. if|lowers speed if trick room|switches out the user|forces the user to switch|if hit by a super effective move|inflicts a burn on holder|badly poisons the holder|permits only that move|allows the use of only one move/.test(
      description,
    ) ||
    /^(choice band|choice scarf|choice specs|eject button|eject pack|heavy-dtybts|room service|terainextendr|throat spray|utltyumbrlla|weaknsspolicy|wide lens|wise glasses|adrenalineorb|blundrpolicy)$/.test(name)
  );
}

function isMailItem(item: BrowseItemEntry): boolean {
  const name = getItemDisplayName(item).toLowerCase();
  const description = item.description.toLowerCase();
  return name.endsWith(" mail") || /-print mail|mail to be held by/.test(description);
}

function isModifierItem(item: BrowseItemEntry): boolean {
  const name = getItemDisplayName(item).toLowerCase();
  const description = item.description.toLowerCase();
  return (
    new Set([
      "pp up",
      "pp max",
      "rare candy",
      "mysterious candy",
      "hp up",
      "protein",
      "iron",
      "calcium",
      "zinc",
      "carbos",
      "ability capsule",
      "abilitycapsle",
      "ability patch",
      "abilitypatch",
      "bottle cap",
      "gold bottle cap",
      "goldbottlcap",
      "health wing",
      "muscle wing",
      "resist wing",
      "genius wing",
      "clever wing",
      "swift wing",
    ]).has(name) ||
    /raise the maximum pp|raises the maximum pp|level by one|raises the base points|switches.*ability|bottle cap/.test(
      description,
    )
  );
}

function isBattleItem(item: BrowseItemEntry): boolean {
  const name = getItemDisplayName(item).toLowerCase();
  const description = item.description.toLowerCase();
  return (
    /^x /.test(name) ||
    name === "guard spec." ||
    name === "dire hit" ||
    categoryIncludes(item, "battle") ||
    categoryIncludes(item, "gem") ||
    name.endsWith(" gem") ||
    /during one battle|raised in battle|used only once|single-use item|wears off if the pokémon is withdrawn/.test(description)
  );
}

function isValuableItem(item: BrowseItemEntry): boolean {
  const name = getItemDisplayName(item).toLowerCase();
  const description = item.description.toLowerCase();
  return (
    new Set([
      "nugget",
      "big nugget",
      "pearl",
      "big pearl",
      "pearl string",
      "stardust",
      "star piece",
      "comet shard",
      "big mushroom",
      "tiny mushroom",
      "balm mushroom",
      "rare bone",
      "heart scale",
      "relic band",
      "relic copper",
      "relic silver",
      "relic gold",
      "relic vase",
      "relic crown",
      "relic statue",
    ]).has(name) ||
    categoryIncludes(item, "valuable") ||
    /can be sold at a high price|can be sold for a high price|it would sell at a very high price|sells at a high price/.test(
      description,
    )
  );
}

function categoryIncludes(item: BrowseItemEntry, value: string): boolean {
  return item.category.toLowerCase().includes(value);
}

function getItemDisplayCategory(item: BrowseItemEntry): ItemDisplayCategory {
  if (item.displayCategoryOverride) {
    return item.displayCategoryOverride;
  }

  const category = item.category.toLowerCase();
  const name = getItemDisplayName(item).toLowerCase();
  const comparableName = getComparableItemName(item);
  const description = item.description.toLowerCase();
  const cleanSlug = getCleanItemSlug(item);

  if (explicitCategoryOverrides[item.slug] || explicitCategoryOverrides[cleanSlug]) {
    return explicitCategoryOverrides[item.slug] ?? explicitCategoryOverrides[cleanSlug];
  }

  if (category.includes("key")) return "Key Items";
  if (category.includes("berr")) return "Berries";
  if (isZMoveItem(item)) return "Z-Crystals";
  if (category.includes("mega") || /mega stone|mega evolve/.test(description)) return "Mega Stones";
  if (
    category.includes("evolution") ||
    evolutionItemNames.has(name) ||
    new Set([...evolutionItemNames].map((entry) => entry.replace(/[^a-z0-9]+/g, ""))).has(comparableName) ||
    /makes certain species of pokémon evolve|loved by a certain pokémon|loved by milcery|peculiar box made by silph/.test(description)
  ) return "Evolution Items";
  if (category.includes("ball") || /used for catching|comfortably encapsulating|a somewhat different pok[eé] ball|a quite rare pok[eé] ball/.test(description)) return "Poke Balls";
  if (
    category.includes("medicine") ||
    medicineKeywords.some((keyword) => description.includes(keyword)) ||
    /restores?\s+(?:the\s+)?(?:hp|pp|hp of a pok[eé]mon|pp of a selected move|pp of all moves)\s+(?:of\s+one\s+pok[eé]mon\s+)?by\s+\d+\s+points?/.test(description) ||
    /restores?\s+the\s+pp\s+of\s+(?:all\s+moves|a\s+selected\s+move)\s+by\s+\d+/.test(description) ||
    /fully\s+restores?\s+the\s+pp\s+of\s+(?:a\s+pok[eé]mon's\s+moves|a\s+selected\s+move)/.test(description) ||
    /heals?\s+(?:a\s+)?(?:poisoned|paralyzed|burned|frozen|sleeping)\s+pok[eé]mon/.test(description) ||
    /defrosts?\s+a\s+frozen\s+pok[eé]mon|awakens?\s+a\s+sleeping\s+pok[eé]mon|heals pok[eé]mon of a burn|heals all status problems|bitter powder that heals/.test(description) ||
    /repels weak wild pok[eé]mon|escape instantly from a cave|flee from any battle with a wild pok[eé]mon/.test(description)
  ) return "Medicines";
  if (isModifierItem(item)) return "Modifier Items";
  if (isValuableItem(item)) return "Valuables";
  if (isBattleItem(item)) return "Battle Items";
  if (isHeldEffectItem(item)) return "Held Items";
  return "Modifier Items";
}

export default function ItemsReference({ items }: ItemsReferenceProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | ItemDisplayCategory>("all");

  const visibleItems = useMemo(
    () =>
      items
        .filter((item) => !isMailItem(item))
        .filter((item) => activeCategory === "all" || getItemDisplayCategory(item) === activeCategory),
    [activeCategory, items],
  );

  const groupedItems = useMemo(
    () =>
      visibleItems.reduce<Map<string, BrowseItemEntry[]>>((groups, item) => {
        const displayCategory = getItemDisplayCategory(item);
        const group = groups.get(displayCategory) ?? [];
        group.push(item);
        groups.set(displayCategory, group);
        return groups;
      }, new Map()),
    [visibleItems],
  );

  const sections = [...groupedItems.entries()].sort(
    (left, right) =>
      categoryOrder.indexOf(left[0] as "all" | ItemDisplayCategory) -
      categoryOrder.indexOf(right[0] as "all" | ItemDisplayCategory),
  );

  const visibleFilters = categoryOrder.filter(
    (category) => category === "all" || categoryOrder.includes(category),
  );

  return (
    <>
      <nav
        aria-label="Item category filters"
        style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "24px", marginBottom: "24px" }}
      >
        {visibleFilters.map((category) => {
          const active = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                border: active ? "1px solid var(--accent-border)" : "1px solid var(--border-soft)",
                color: active ? "var(--button-text)" : "var(--text-body)",
                background: active ? "var(--accent)" : "var(--surface-card)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {category === "all" ? "All" : category}
            </button>
          );
        })}
      </nav>

      <div style={{ display: "grid", gap: "24px" }}>
        {sections.length === 0 && (
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            No obtainable Scorched Silver items are listed in this category.
          </p>
        )}
        {sections.map(([category, entries]) => (
          <section key={category}>
            <h2 style={{ marginTop: 0, marginBottom: "12px" }}>{category}</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {entries.map((item) => (
                <Link
                  key={item.id}
                  href={`/items/${item.slug}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px 1fr",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px",
                    border: "1px solid var(--border-soft)",
                    borderRadius: "14px",
                    background: "var(--surface-card)",
                  }}
                >
                  <ItemImage item={item} size={48} framed />
                  <span>
                    <strong>{getItemDisplayName(item)}</strong>
                    <div style={{ color: "var(--text-muted)", marginTop: "6px" }}>{getItemDisplayDescription(item)}</div>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
