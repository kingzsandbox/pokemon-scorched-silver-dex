"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { MoveCategoryIcon, TypeBadgeList } from "../components/dex-visuals";
import ItemsReference from "../components/items-reference";
import ItemImage from "../components/item-image";
import PokedexFocus from "./pokedex-focus";
import ReferenceImage from "../components/reference-image";
import { getPokemonDisplayName } from "../lib/presentation";
import type { ItemEntry, PokemonAbilityDisplayRow } from "../lib/types";

type HomeTabKey =
  | "pokedex"
  | "locations"
  | "items"
  | "moves"
  | "machines"
  | "abilities";

type HomePokemonRow = {
  id: string;
  slug: string;
  dexNumber: number;
  name: string;
  types: string[];
  abilities: PokemonAbilityDisplayRow[];
  spriteSrc: string | null;
  spriteScale: number;
  formCount: number;
  formKinds: Array<"mega" | "regional" | "alternate">;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
};

type HomeLocationRow = {
  id: string;
  slug: string;
  name: string;
  region: string;
};

type HomeMoveRow = {
  id: string;
  slug: string;
  name: string;
  type: string | null;
  category: string | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  effectSummary: string;
};

type HomeMachineRow = {
  id: string;
  slug: string;
  code: string;
  moveName: string;
  moveType: string | null;
  category: string | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  effectSummary: string;
};

type HomeAbilityRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

type MoveSortField = "type" | "category" | "power";
type MoveSortDirection = "asc" | "desc";
type MoveSortKey = {
  field: MoveSortField;
  direction: MoveSortDirection;
};

function getHomePokemonHref(slug: string): string {
  return `/?tab=pokedex&focus=${encodeURIComponent(slug)}#pokemon-row-${encodeURIComponent(slug)}`;
}

type HomeLevelCapRow = {
  id: string;
  trainer: string;
  location: string;
  level: number;
};

type HomeShellProps = {
  pokemon: HomePokemonRow[];
  locations: HomeLocationRow[];
  items: ItemEntry[];
  moves: HomeMoveRow[];
  machines: HomeMachineRow[];
  abilities: HomeAbilityRow[];
  battles: [];
  levelCaps: [];
  activeTab: HomeTabKey;
  focusedSlug: string | null;
  pokemonFilter: "all" | "mega" | "regional" | "alternate";
};

const tabs: Array<{ key: HomeTabKey; label: string; href?: string }> = [
  { key: "pokedex", label: "Pokemon" },
  { key: "locations", label: "Locations" },
  { key: "items", label: "Items" },
  { key: "moves", label: "All Moves" },
  { key: "machines", label: "TMs & HMs" },
  { key: "abilities", label: "Abilities" },
];

function getFallbackSpriteUrl(dexNumber: number): string {
  if (dexNumber >= 906) {
    return "";
  }

  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;
}

function bst(stats: HomePokemonRow["baseStats"]): number {
  return (
    stats.hp +
    stats.attack +
    stats.defense +
    stats.specialAttack +
    stats.specialDefense +
    stats.speed
  );
}

function abilitySlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function tableCellStyle(align: "left" | "center" | "right" = "left") {
  return {
    padding: "10px 12px",
    borderBottom: "1px solid var(--border-soft)",
    textAlign: align,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  } as const;
}

function gridCellStyle(align: "left" | "center" | "right" = "left") {
  return {
    ...tableCellStyle(align),
    display: "flex",
    alignItems: "center",
    justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
  } as const;
}

function headerGridCellStyle(align: "left" | "center" | "right" = "left") {
  return {
    ...gridCellStyle(align),
    background: "transparent",
    color: "var(--text-strong)",
  } as const;
}

function tableHeaderCellStyle(stickyTop: number, align: "left" | "center" | "right" = "left") {
  return {
    ...tableCellStyle(align),
    position: "sticky",
    top: stickyTop,
    zIndex: 8,
    background: "var(--surface-table-header)",
    color: "var(--text-strong)",
    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.2)",
  } as const;
}

function compareNullableText(left: string | null, right: string | null, direction: MoveSortDirection): number {
  if (!left && !right) {
    return 0;
  }
  if (!left) {
    return 1;
  }
  if (!right) {
    return -1;
  }

  const result = left.localeCompare(right);
  return direction === "asc" ? result : -result;
}

function compareNullableNumber(left: number | null, right: number | null, direction: MoveSortDirection): number {
  if (left === null && right === null) {
    return 0;
  }
  if (left === null) {
    return 1;
  }
  if (right === null) {
    return -1;
  }

  const result = left - right;
  return direction === "asc" ? result : -result;
}

function sortMoves(moves: HomeMoveRow[], sortKeys: MoveSortKey[]): HomeMoveRow[] {
  if (sortKeys.length === 0) {
    return moves;
  }

  return [...moves].sort((left, right) => {
    for (const sortKey of sortKeys) {
      const result =
        sortKey.field === "type"
          ? compareNullableText(left.type, right.type, sortKey.direction)
          : sortKey.field === "category"
            ? compareNullableText(left.category, right.category, sortKey.direction)
            : compareNullableNumber(left.power, right.power, sortKey.direction);

      if (result !== 0) {
        return result;
      }
    }

    return left.name.localeCompare(right.name);
  });
}

function sortButtonLabel(label: string, field: MoveSortField, sortKeys: MoveSortKey[]): string {
  const index = sortKeys.findIndex((sortKey) => sortKey.field === field);
  if (index === -1) {
    return label;
  }

  const sortKey = sortKeys[index];
  return `${label} ${sortKey.direction === "asc" ? "↑" : "↓"} ${index + 1}`;
}

function moveSortButtonStyle(active: boolean) {
  return {
    border: "0",
    padding: 0,
    background: "transparent",
    color: active ? "var(--accent-border)" : "var(--text-strong)",
    font: "inherit",
    fontWeight: 800,
    cursor: "pointer",
  } as const;
}

function normalizeLocalSearch(value: string): string {
  return value.trim().toLowerCase();
}

function includesLocalSearch(parts: Array<string | number | null | undefined>, query: string): boolean {
  if (!query) {
    return true;
  }

  return parts
    .filter((part) => part !== null && part !== undefined)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function LocalTabSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label style={{ display: "block", margin: "0 0 16px" }}>
      <span style={{ display: "block", marginBottom: "6px", color: "var(--text-muted)", fontSize: "0.86rem", fontWeight: 700 }}>
        Filter this page
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "11px 14px",
          border: "1px solid var(--border-soft)",
          borderRadius: "14px",
          background: "var(--surface-glass)",
          color: "var(--text-body)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      />
    </label>
  );
}

function getMachineTypeIconSrc(type: string | null | undefined): string | null {
  if (!type) {
    return null;
  }

  return `/sprites/tm-types/${type.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
}

function CompactLinkList({
  rows,
}: {
  rows: Array<{ id: string; href: string; title: string; meta: string }>;
}) {
  return (
    <div style={{ display: "grid", gap: "8px" }}>
      {rows.map((row) => (
        <Link
          key={row.id}
          href={row.href}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: "16px",
            padding: "16px",
            border: "1px solid var(--border-soft)",
            borderRadius: "14px",
            background: "var(--surface-card)",
          }}
        >
          <span style={{ color: "var(--text-body)", fontWeight: 600 }}>{row.title}</span>
          <span style={{ color: "var(--text-muted)", textAlign: "right" }}>{row.meta}</span>
        </Link>
      ))}
    </div>
  );
}

function HomePokedexTable({
  pokemon,
  focusedSlug,
  pokemonFilter,
}: {
  pokemon: HomePokemonRow[];
  focusedSlug: string | null;
  pokemonFilter: "all" | "mega" | "regional" | "alternate";
}) {
  const visiblePokemon = pokemon;
  const gridTemplateColumns = "56px 340px minmax(260px, 1fr) repeat(7, minmax(56px, 72px))";
  const pokemonCellInnerWidth = "292px";
  const [stickyTop, setStickyTop] = useState(0);

  useEffect(() => {
    function updateStickyTop() {
      const header = document.querySelector("body > header");
      setStickyTop(Math.ceil(header?.getBoundingClientRect().height ?? 0));
    }

    updateStickyTop();
    window.addEventListener("resize", updateStickyTop);
    return () => window.removeEventListener("resize", updateStickyTop);
  }, []);

  return (
    <div style={{ overflow: "visible" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", margin: "0 0 18px" }}>
        {[
          { key: "all", label: "All" },
          { key: "mega", label: "Mega Pokémon" },
          { key: "regional", label: "Regional Forms" },
          { key: "alternate", label: "Alternate Forms" },
        ].map((filter) => {
          const active = pokemonFilter === filter.key;
          const href = filter.key === "all" ? "/?tab=pokedex" : `/?tab=pokedex&form=${filter.key}`;
          return (
            <Link
              key={filter.key}
              href={href}
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                border: active ? "1px solid var(--accent-border)" : "1px solid var(--border-soft)",
                background: active ? "linear-gradient(180deg, rgba(245,248,247,0.16), rgba(190,198,196,0.09))" : "var(--surface-glass)",
                color: active ? "var(--text-strong)" : "var(--text-body)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>
      <PokedexFocus focusedSlug={focusedSlug} />
      <div className="table-scroll">
      <div role="table" style={{ minWidth: "1160px" }}>
        <div
          role="row"
          style={{
            display: "grid",
            gridTemplateColumns,
            position: "sticky",
            top: stickyTop,
            zIndex: 100,
            background: "var(--surface-table-header)",
            boxShadow: "0 1px 0 var(--border-soft), 0 10px 18px rgba(0, 0, 0, 0.34)",
            borderRadius: "18px 18px 0 0",
            overflow: "hidden",
          }}
        >
          <div role="columnheader" style={headerGridCellStyle("right")}>#</div>
          <div role="columnheader" style={headerGridCellStyle("center")}>Pokemon</div>
          <div role="columnheader" style={headerGridCellStyle()}>Ability</div>
          <div role="columnheader" style={headerGridCellStyle("right")}>HP</div>
          <div role="columnheader" style={headerGridCellStyle("right")}>Atk</div>
          <div role="columnheader" style={headerGridCellStyle("right")}>Def</div>
          <div role="columnheader" style={headerGridCellStyle("right")}>SpA</div>
          <div role="columnheader" style={headerGridCellStyle("right")}>SpD</div>
          <div role="columnheader" style={headerGridCellStyle("right")}>Spe</div>
          <div role="columnheader" style={headerGridCellStyle("right")}>BST</div>
        </div>
        <div role="rowgroup">
          {visiblePokemon.map((entry) => {
            const href = `/pokemon/${entry.slug}?returnTo=${encodeURIComponent(getHomePokemonHref(entry.slug))}`;
            const rowId = `pokemon-row-${entry.slug}`;
            const isFocused = focusedSlug === entry.slug;
            const normalAbilities = entry.abilities
              .filter((ability) => ability.label !== "Hidden Ability")
              .filter((ability, index, abilities) => abilities.findIndex((candidate) => candidate.value === ability.value) === index);
            const hiddenAbility = entry.abilities.find((ability) => ability.label === "Hidden Ability");

            return (
              <div
                role="row"
                key={entry.id}
                id={rowId}
                style={{
                  display: "grid",
                  gridTemplateColumns,
                  background: isFocused ? "var(--accent-soft)" : "var(--surface-card)",
                  scrollMarginTop: "96px",
                }}
              >
                <div role="cell" style={gridCellStyle("right")}>{entry.dexNumber}</div>
                <div role="cell" style={{ ...gridCellStyle("center"), whiteSpace: "normal" }}>
                  <Link
                    href={href}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "94px minmax(0, 1fr)",
                      columnGap: "12px",
                      alignItems: "center",
                      width: pokemonCellInnerWidth,
                      maxWidth: "100%",
                      margin: "0 auto",
                      color: "var(--text-body)",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      style={{
                        width: "90px",
                        height: "90px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--border-soft)",
                        borderRadius: "14px",
                        background: "var(--surface-muted)",
                        overflow: "hidden",
                      }}
                    >
                      <ReferenceImage
                        src={entry.spriteSrc}
                        alt={entry.name}
                        width={76}
                        height={76}
                        style={{ width: "76px", height: "76px", objectFit: "contain", imageRendering: "pixelated" }}
                      />
                    </span>
                    <span
                      style={{
                        minWidth: 0,
                        textAlign: "left",
                        whiteSpace: "normal",
                      }}
                    >
                      {getPokemonDisplayName(entry)}
                      {entry.formCount > 1 ? (
                        <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "3px" }}>
                          {entry.formCount} forms
                        </span>
                      ) : null}
                      <span style={{ display: "block", marginTop: "8px" }}>
                        <TypeBadgeList types={entry.types} />
                      </span>
                    </span>
                  </Link>
                </div>
                <div role="cell" style={gridCellStyle()}>
                  <div style={{ display: "grid", gap: "6px", minWidth: "260px" }}>
                    {normalAbilities.length > 0 ? (
                      <div style={{ whiteSpace: "normal", lineHeight: 1.4 }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 700 }}>
                          Ability:
                        </span>{" "}
                        {normalAbilities.map((ability, index) => (
                          <span key={`${ability.label}-${ability.value}`}>
                            {index > 0 ? <span style={{ color: "var(--text-muted)" }}>, </span> : null}
                            <Link href={`/abilities/${abilitySlug(ability.value)}`} style={{ color: "var(--text-body)" }}>
                              {ability.value}
                            </Link>
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {hiddenAbility ? (
                      <div style={{ whiteSpace: "normal", lineHeight: 1.4 }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 700 }}>
                          Hidden Ability:
                        </span>{" "}
                        <Link href={`/abilities/${abilitySlug(hiddenAbility.value)}`} style={{ color: "var(--text-body)" }}>
                          {hiddenAbility.value}
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div role="cell" style={gridCellStyle("right")}>{entry.baseStats.hp}</div>
                <div role="cell" style={gridCellStyle("right")}>{entry.baseStats.attack}</div>
                <div role="cell" style={gridCellStyle("right")}>{entry.baseStats.defense}</div>
                <div role="cell" style={gridCellStyle("right")}>{entry.baseStats.specialAttack}</div>
                <div role="cell" style={gridCellStyle("right")}>{entry.baseStats.specialDefense}</div>
                <div role="cell" style={gridCellStyle("right")}>{entry.baseStats.speed}</div>
                <div role="cell" style={gridCellStyle("right")}>{bst(entry.baseStats)}</div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}

export default function HomeShell({
  pokemon,
  locations,
  items,
  moves,
  machines,
  abilities,
  battles,
  levelCaps,
  activeTab,
  focusedSlug,
  pokemonFilter,
}: HomeShellProps) {
  let tabContent: ReactNode;
  const [stickyTop, setStickyTop] = useState(0);
  const [moveSortKeys, setMoveSortKeys] = useState<MoveSortKey[]>([]);
  const [localSearch, setLocalSearch] = useState("");
  const normalizedLocalSearch = normalizeLocalSearch(localSearch);

  useEffect(() => {
    setLocalSearch("");
  }, [activeTab, pokemonFilter]);

  const filteredPokemon = useMemo(
    () =>
      pokemon.filter((entry) =>
        includesLocalSearch(
          [
            entry.dexNumber,
            getPokemonDisplayName(entry),
            entry.name,
            entry.types.join(" "),
            entry.abilities.map((ability) => ability.value).join(" "),
          ],
          normalizedLocalSearch,
        ),
      ),
    [pokemon, normalizedLocalSearch],
  );
  const filteredLocations = useMemo(
    () => locations.filter((entry) => includesLocalSearch([entry.name, entry.region], normalizedLocalSearch)),
    [locations, normalizedLocalSearch],
  );
  const filteredItems = useMemo(
    () => items.filter((entry) => includesLocalSearch([entry.name, entry.category, entry.description], normalizedLocalSearch)),
    [items, normalizedLocalSearch],
  );
  const filteredMoves = useMemo(
    () =>
      moves.filter((entry) =>
        includesLocalSearch(
          [entry.name, entry.type, entry.category, entry.power, entry.accuracy, entry.pp],
          normalizedLocalSearch,
        ),
      ),
    [moves, normalizedLocalSearch],
  );
  const filteredMachines = useMemo(
    () =>
      machines.filter((entry) =>
        includesLocalSearch(
          [entry.code, entry.moveName, entry.moveType, entry.category, entry.power, entry.accuracy, entry.pp, entry.effectSummary],
          normalizedLocalSearch,
        ),
      ),
    [machines, normalizedLocalSearch],
  );
  const filteredAbilities = useMemo(
    () => abilities.filter((entry) => includesLocalSearch([entry.name, entry.description], normalizedLocalSearch)),
    [abilities, normalizedLocalSearch],
  );
  const sortedMoves = useMemo(() => sortMoves(filteredMoves, moveSortKeys), [filteredMoves, moveSortKeys]);

  useEffect(() => {
    function updateStickyTop() {
      const header = document.querySelector("body > header");
      setStickyTop(Math.ceil(header?.getBoundingClientRect().height ?? 0));
    }

    updateStickyTop();
    window.addEventListener("resize", updateStickyTop);
    return () => window.removeEventListener("resize", updateStickyTop);
  }, []);

  function toggleMoveSort(field: MoveSortField) {
    setMoveSortKeys((current) => {
      const existing = current.find((sortKey) => sortKey.field === field);
      const nextDirection: MoveSortDirection = existing
        ? existing.direction === "asc"
          ? "desc"
          : "asc"
        : field === "power"
          ? "desc"
          : "asc";
      const withoutField = current.filter((sortKey) => sortKey.field !== field);

      return [...withoutField, { field, direction: nextDirection }];
    });
  }

  switch (activeTab) {
    case "locations":
      tabContent = (
        <CompactLinkList
          rows={filteredLocations.map((entry) => ({
            id: entry.id,
            href: `/locations/${entry.slug}`,
            title: entry.name,
            meta: entry.region,
          }))}
        />
      );
      break;
    case "items":
      tabContent = <ItemsReference items={filteredItems} />;
      break;
    case "moves":
      tabContent = (
        <div className="table-scroll">
          <table style={{ width: "100%", minWidth: "980px", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={tableHeaderCellStyle(stickyTop)}>Move</th>
                <th style={tableHeaderCellStyle(stickyTop, "center")}>
                  <button
                    type="button"
                    onClick={() => toggleMoveSort("type")}
                    style={moveSortButtonStyle(moveSortKeys.some((sortKey) => sortKey.field === "type"))}
                  >
                    {sortButtonLabel("Type", "type", moveSortKeys)}
                  </button>
                </th>
                <th style={tableHeaderCellStyle(stickyTop, "center")}>
                  <button
                    type="button"
                    onClick={() => toggleMoveSort("category")}
                    style={moveSortButtonStyle(moveSortKeys.some((sortKey) => sortKey.field === "category"))}
                  >
                    {sortButtonLabel("Category", "category", moveSortKeys)}
                  </button>
                </th>
                <th style={tableHeaderCellStyle(stickyTop, "center")}>
                  <button
                    type="button"
                    onClick={() => toggleMoveSort("power")}
                    style={moveSortButtonStyle(moveSortKeys.some((sortKey) => sortKey.field === "power"))}
                  >
                    {sortButtonLabel("Power", "power", moveSortKeys)}
                  </button>
                </th>
                <th style={tableHeaderCellStyle(stickyTop, "center")}>Accuracy</th>
                <th style={tableHeaderCellStyle(stickyTop, "center")}>PP</th>
                <th style={tableHeaderCellStyle(stickyTop)}>Effect</th>
              </tr>
            </thead>
            <tbody>
              {sortedMoves.map((entry) => (
                <tr key={entry.id}>
                  <td style={tableCellStyle()}>
                    <Link href={`/moves/${entry.slug}`}>{entry.name}</Link>
                  </td>
                  <td style={tableCellStyle("center")}>
                    {entry.type ? <TypeBadgeList types={[entry.type]} /> : "—"}
                  </td>
                  <td style={tableCellStyle("center")}>
                    <MoveCategoryIcon category={entry.category ?? null} />
                  </td>
                  <td style={tableCellStyle("center")}>{entry.power ?? "—"}</td>
                  <td style={tableCellStyle("center")}>{entry.accuracy ?? "—"}</td>
                  <td style={tableCellStyle("center")}>{entry.pp ?? "—"}</td>
                  <td
                    style={{
                      ...tableCellStyle(),
                      whiteSpace: "normal",
                      minWidth: "260px",
                    }}
                  >
                    {entry.effectSummary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      break;
    case "machines":
      tabContent = (
        <div className="table-scroll">
          <table style={{ width: "100%", minWidth: "980px", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={tableHeaderCellStyle(stickyTop)}>TM/HM</th>
                <th style={tableHeaderCellStyle(stickyTop)}>Move</th>
                <th style={tableHeaderCellStyle(stickyTop, "center")}>Type</th>
                <th style={tableHeaderCellStyle(stickyTop, "center")}>Category</th>
                <th style={tableHeaderCellStyle(stickyTop, "center")}>Power</th>
                <th style={tableHeaderCellStyle(stickyTop, "center")}>PP</th>
                <th style={tableHeaderCellStyle(stickyTop, "center")}>Accuracy</th>
                <th style={tableHeaderCellStyle(stickyTop)}>Effect</th>
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map((entry) => (
                <tr key={entry.id}>
                  <td style={tableCellStyle()}>
                    <Link href={`/machines/${entry.slug}`} style={{ color: "var(--text-body)", fontWeight: 800 }}>
                      {entry.code}
                    </Link>
                  </td>
                  <td style={tableCellStyle()}>
                    <Link href={`/machines/${entry.slug}`}>{entry.moveName}</Link>
                  </td>
                  <td style={tableCellStyle("center")}>{entry.moveType ? <TypeBadgeList types={[entry.moveType]} /> : "—"}</td>
                  <td style={tableCellStyle("center")}><MoveCategoryIcon category={entry.category} /></td>
                  <td style={tableCellStyle("center")}>{entry.power ?? "—"}</td>
                  <td style={tableCellStyle("center")}>{entry.pp ?? "—"}</td>
                  <td style={tableCellStyle("center")}>{entry.accuracy ?? "—"}</td>
                  <td style={{ ...tableCellStyle(), whiteSpace: "normal", minWidth: "280px" }}>{entry.effectSummary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      break;
    case "abilities":
      tabContent = (
        <CompactLinkList
          rows={filteredAbilities.map((entry) => ({
            id: entry.id,
            href: `/abilities/${entry.slug}`,
            title: entry.name,
            meta: entry.description,
          }))}
        />
      );
      break;
    case "pokedex":
    default:
      tabContent = <HomePokedexTable pokemon={filteredPokemon} focusedSlug={focusedSlug} pokemonFilter={pokemonFilter} />;
      break;
  }

  return (
    <main style={{ margin: "0 auto", maxWidth: "1400px", padding: "18px 18px 48px" }}>
      <section
        aria-label={tabs.find((tab) => tab.key === activeTab)?.label ?? "Content"}
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-soft)",
          borderRadius: "22px",
          padding: "10px 12px 16px",
          overflow: "visible",
        }}
      >
        <LocalTabSearch
          value={localSearch}
          onChange={setLocalSearch}
          placeholder={
            activeTab === "pokedex"
              ? "Filter Pokémon by name, type, ability, or number..."
              : activeTab === "moves"
                ? "Filter moves by name, type, category, power, or effect..."
                : activeTab === "machines"
                  ? "Filter TMs & HMs by code, move, type, category, or effect..."
                  : activeTab === "items"
                    ? "Filter items by name, category, or description..."
                    : activeTab === "locations"
                      ? "Filter locations by name..."
                      : "Filter abilities by name or description..."
          }
        />
        {tabContent}
      </section>
    </main>
  );
}
