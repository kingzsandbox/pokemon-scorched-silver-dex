import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { MoveCategoryIcon, StatBar, TypeBadgeList, matchupSectionStyle } from "../../../components/dex-visuals";
import PageNavigation from "../../../components/page-navigation";
import ReferenceImage from "../../../components/reference-image";
import { getPokemonMiniSpriteSources, getPokemonPrimaryArt } from "../../../lib/assets";
import {
  getMoveTutorCompatibilityByPokemonId,
  getTmHmCompatibilityByPokemonId,
} from "../../../lib/data/compatibility";
import { getAbilityByName, getAbilityDescription, getAbilityDisplayName } from "../../../lib/data/abilities";
import { getEncounterRowsByPokemonId } from "../../../lib/data/encounters";
import { getLearnsetByPokemonId } from "../../../lib/data/learnsets";
import { getMoveById } from "../../../lib/data/moves";
import { getEvolutionTree, getMegaEvolutionLinks, type EvolutionTreeNode } from "../../../lib/data/pokemon-evolutions";
import { getAllPokemon, getPokemonBySlug, getPokemonFormGroup } from "../../../lib/data/pokemon";
import {
  formatPokemonStatDelta,
  getMoveEffectSummary,
  getPokemonAbilityDisplayRows,
  getPokemonStatDisplayRows,
} from "../../../lib/data/vanilla";
import { getMatchupAbilityView } from "../../../lib/type-chart";
import { getPokemonDisplayName } from "../../../lib/presentation";

function formatValue(value: number | string | null): string {
  return value === null ? "—" : String(value);
}

function formatAbilityDescription(abilityName: string, description: string): string {
  const trimmed = description.trim();
  const prefix = `${abilityName}:`;

  if (!trimmed || trimmed === "Description unavailable.") {
    return "Description unavailable in extracted data.";
  }

  if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
    return trimmed.slice(prefix.length).trim();
  }

  return trimmed;
}

function cellStyle(align: "left" | "center" | "right" = "left"): CSSProperties {
  return {
    padding: "10px 12px",
    borderBottom: "1px solid var(--border-soft)",
    textAlign: align,
    verticalAlign: "top",
  };
}

type PokemonDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    returnTo?: string;
    ability?: string;
  }>;
};

function EvolutionTreeBranch({
  node,
  currentPokemonId,
  backHref,
}: {
  node: EvolutionTreeNode;
  currentPokemonId: string;
  backHref: string;
}) {
  const sprite = getPokemonMiniSpriteSources(node.pokemon);
  const megaLinks = getMegaEvolutionLinks(node.pokemon.id);

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div
        style={{
          width: "fit-content",
          minWidth: "160px",
          padding: "14px",
          border: node.pokemon.id === currentPokemonId ? "2px solid var(--accent)" : "1px solid var(--border-soft)",
          borderRadius: "16px",
          background: node.pokemon.id === currentPokemonId ? "var(--accent-soft)" : "var(--surface-card)",
          textAlign: "center",
        }}
      >
        <span
          style={{
            width: "90px",
            height: "90px",
            display: "grid",
            placeItems: "center",
            margin: "0 auto",
            border: "1px solid var(--border-soft)",
            borderRadius: "14px",
            background: "var(--surface-muted)",
            overflow: "hidden",
          }}
        >
          <ReferenceImage
            src={sprite.src}
            fallbackSrc={sprite.fallbackSrc}
            alt={node.pokemon.name}
            width={82}
            height={82}


            style={{ width: "82px", height: "82px", objectFit: "contain", imageRendering: "pixelated" }}
          />
        </span>
        <div style={{ marginTop: "8px" }}>
          <Link href={`/pokemon/${node.pokemon.slug}?returnTo=${encodeURIComponent(backHref)}`}>
            {getPokemonDisplayName(node.pokemon)}
          </Link>
        </div>
      </div>

      {node.children.length > 0 ? (
        <div
          style={{
            marginLeft: "24px",
            paddingLeft: "18px",
            borderLeft: "2px solid var(--border-soft)",
            display: "grid",
            gap: "14px",
          }}
        >
          {node.children.map((child) => (
            <div key={`${node.pokemon.id}-${child.node.pokemon.id}`} style={{ display: "grid", gap: "8px" }}>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                }}
              >
                {child.method}
              </div>
              <EvolutionTreeBranch node={child.node} currentPokemonId={currentPokemonId} backHref={backHref} />
            </div>
          ))}
        </div>
      ) : null}

      {megaLinks.length > 0 ? (
        <div
          style={{
            marginLeft: "24px",
            paddingLeft: "18px",
            borderLeft: "2px dashed var(--border-strong)",
            display: "grid",
            gap: "12px",
          }}
        >
          {megaLinks.map((megaLink) => {
            const megaSprite = getPokemonMiniSpriteSources(megaLink.pokemon);
            return (
              <div key={`${node.pokemon.id}-${megaLink.pokemon.id}`} style={{ display: "grid", gap: "8px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.84rem", fontWeight: 700 }}>
                  Mega Evolution • {megaLink.method}
                </div>
                <div
                  style={{
                    width: "fit-content",
                    minWidth: "180px",
                    padding: "14px",
                    border:
                      megaLink.pokemon.id === currentPokemonId
                        ? "2px solid var(--accent)"
                        : "1px dashed var(--border-strong)",
                    borderRadius: "16px",
                    background:
                      megaLink.pokemon.id === currentPokemonId
                        ? "var(--accent-soft)"
                        : "var(--surface-card)",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      width: "90px",
                      height: "90px",
                      display: "grid",
                      placeItems: "center",
                      margin: "0 auto",
                      border: "1px solid var(--border-soft)",
                      borderRadius: "14px",
                      background: "var(--surface-muted)",
                      overflow: "hidden",
                    }}
                  >
                    <ReferenceImage
                      src={megaSprite.src}
                      fallbackSrc={megaSprite.fallbackSrc}
                      alt={megaLink.pokemon.name}
                      width={82}
                      height={82}


                      style={{ width: "82px", height: "82px", objectFit: "contain", imageRendering: "pixelated" }}
                    />
                  </span>
                  <div style={{ marginTop: "8px" }}>
                    <Link href={`/pokemon/${megaLink.pokemon.slug}?returnTo=${encodeURIComponent(backHref)}`}>
                      {getPokemonDisplayName(megaLink.pokemon)}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default async function PokemonDetailPage({
  params,
  searchParams,
}: PokemonDetailPageProps) {
  const { slug } = await params;
  const { returnTo, ability } = await searchParams;
  const pokemon = getPokemonBySlug(slug);

  if (!pokemon) {
    notFound();
  }

  const compatibility = getTmHmCompatibilityByPokemonId(pokemon.id);
  const moveTutorCompatibility = getMoveTutorCompatibilityByPokemonId(pokemon.id);
  const learnset = getLearnsetByPokemonId(pokemon.id);
  const statRows = getPokemonStatDisplayRows(pokemon);
  const abilityRows = getPokemonAbilityDisplayRows(pokemon);
  const encounterRows = getEncounterRowsByPokemonId(pokemon.id);
  const backHref = returnTo ?? "/?tab=pokedex";
  const bst =
    pokemon.baseStats.hp +
    pokemon.baseStats.attack +
    pokemon.baseStats.defense +
    pokemon.baseStats.specialAttack +
    pokemon.baseStats.specialDefense +
    pokemon.baseStats.speed;
  const art = getPokemonPrimaryArt(pokemon);
  const formGroup = getPokemonFormGroup(pokemon);
  const baseEvolutionAnchor =
    /\(Mega /i.test(pokemon.name)
      ? getAllPokemon().find((entry) => entry.dexNumber === pokemon.dexNumber && !/\(Mega /i.test(entry.name))
      : null;
  const evolutionTree = getEvolutionTree(baseEvolutionAnchor?.id ?? pokemon.id);
  const matchupAbilityView = getMatchupAbilityView(pokemon);
  const activeMatchupState =
    matchupAbilityView.states.find((state) => state.id === ability) ?? matchupAbilityView.states[0];
  const abilityCards = abilityRows.map((row) => {
    const abilityEntry = getAbilityByName(row.value);
    const matchupState =
      matchupAbilityView.states.find((state) => state.ability === row.value) ??
      matchupAbilityView.states.find((state) => state.ability === null) ??
      null;

    return {
      ...row,
      slug: abilityEntry?.slug ?? row.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      displayValue: abilityEntry ? getAbilityDisplayName(abilityEntry) : row.value,
      description: abilityEntry
        ? formatAbilityDescription(row.value, getAbilityDescription(abilityEntry))
        : "Description unavailable in extracted data.",
      matchupNote: matchupState?.note ?? null,
    };
  });
  const normalAbilityCards = abilityCards
    .filter((entry) => entry.label !== "Hidden Ability")
    .filter(
      (entry, index, entries) =>
        entries.findIndex((candidate) => candidate.value.toLowerCase() === entry.value.toLowerCase()) === index,
    );
  const hiddenAbilityCard = abilityCards.find((entry) => entry.label === "Hidden Ability");
  const displayName = getPokemonDisplayName(pokemon);

  return (
    <main style={{ margin: "0 auto", maxWidth: "1000px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref={backHref} backLabel="Back to Pokedex" />

      <section>
        <div>
          <h1 style={{ marginTop: 0, marginBottom: "10px" }}>{displayName}</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 0, marginBottom: "14px" }}>#{pokemon.dexNumber}</p>
          <TypeBadgeList types={pokemon.types} />
          {formGroup.length > 1 ? (
            <section style={{ marginTop: "18px", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1rem", margin: "0 0 10px" }}>Forms</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {formGroup.map((form) => {
                  const formSprite = getPokemonMiniSpriteSources(form);
                  const active = form.id === pokemon.id;
                  return (
                    <Link
                      key={form.id}
                      href={`/pokemon/${form.slug}?returnTo=${encodeURIComponent(backHref)}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "94px minmax(0, 1fr)",
                        gap: "12px",
                        alignItems: "center",
                        minWidth: "260px",
                        padding: "10px 12px",
                        borderRadius: "14px",
                        border: active ? "1px solid var(--accent-border)" : "1px solid var(--border-soft)",
                        background: active ? "var(--accent-soft)" : "var(--surface-card)",
                        textDecoration: "none",
                      }}
                    >
                      <span
                        style={{
                          width: "88px",
                          height: "88px",
                          display: "grid",
                          placeItems: "center",
                          borderRadius: "12px",
                          background: "var(--surface-muted)",
                          overflow: "hidden",
                        }}
                      >
                        <ReferenceImage
                          src={formSprite.src}
                          fallbackSrc={formSprite.fallbackSrc}
                          alt={getPokemonDisplayName(form)}
                          width={80}
                          height={80}


                          style={{ width: "80px", height: "80px", objectFit: "contain", imageRendering: "pixelated" }}
                        />
                      </span>
                      <span>
                        <strong style={{ display: "block", color: active ? "var(--accent-border)" : "var(--text-body)" }}>
                          {getPokemonDisplayName(form)}
                        </strong>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>#{form.dexNumber}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "16px",
              marginTop: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "168px",
                  height: "168px",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "14px",
                  background: "var(--surface-card)",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: "6px",
                  overflow: "hidden",
                }}
              >
                <ReferenceImage
                  src={art.src}
                  fallbackSrc={art.fallbackSrc}
                  alt={displayName}
                  width={156}
                  height={156}


                  style={{ width: "156px", height: "156px", objectFit: "contain", imageRendering: "pixelated" }}
                />
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Normal</span>
            </div>
            {art.shinySrc ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "168px",
                    height: "168px",
                    border: "1px solid var(--border-soft)",
                    borderRadius: "14px",
                    background: "var(--surface-card)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: "6px",
                    overflow: "hidden",
                  }}
                >
                  <ReferenceImage
                    src={art.shinySrc}
                    fallbackSrc={null}
                    alt={`${displayName} shiny`}
                    width={156}
                    height={156}


                    style={{ width: "156px", height: "156px", objectFit: "contain", imageRendering: "pixelated" }}
                  />
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Shiny</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Stats</h2>
        <div style={{ display: "grid", gap: "10px" }}>
          {statRows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "grid",
                gridTemplateColumns: "92px 52px 1fr",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <strong>{row.label}</strong>
              <span>
                {row.value}
                {formatPokemonStatDelta(row.delta)}
              </span>
              <StatBar value={row.value} />
            </div>
          ))}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "92px 52px",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <strong>BST</strong>
            <span>{bst}</span>
          </div>
        </div>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Abilities</h2>
        <div style={{ display: "grid", gap: "14px" }}>
          {normalAbilityCards.length > 0 ? (
            <article
              key="normal-abilities"
              style={{
                padding: "16px 18px",
                border: "1px solid var(--border-soft)",
                borderRadius: "16px",
                background: "linear-gradient(180deg, var(--surface-card) 0%, var(--surface-muted) 100%)",
                display: "grid",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "999px",
                    background: "var(--surface-elevated)",
                    color: "var(--text-muted)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                  }}
                >
                  {normalAbilityCards.length > 1 ? "Standard Abilities" : "Standard Ability"}
                </span>
                <strong>
                  {normalAbilityCards.map((ability, index) => (
                    <span key={`${ability.label}-${ability.value}`}>
                      {index > 0 ? <span style={{ color: "var(--text-muted)" }}>, </span> : null}
                      <Link href={`/abilities/${ability.slug}`}>{ability.displayValue}</Link>
                    </span>
                  ))}
                </strong>
              </div>
              <div style={{ display: "grid", gap: "10px" }}>
                {normalAbilityCards.map((ability) => (
                  <div key={`${ability.label}-${ability.value}-description`} style={{ color: "var(--text-body)", lineHeight: 1.6 }}>
                    {normalAbilityCards.length > 1 ? <strong>{ability.displayValue}: </strong> : null}
                    {ability.description}
                  </div>
                ))}
              </div>
              {normalAbilityCards.some((ability) => ability.matchupNote) ? (
                <div style={{ display: "grid", gap: "8px" }}>
                  {normalAbilityCards
                    .filter((ability) => ability.matchupNote)
                    .map((ability) => (
                      <div
                        key={`${ability.label}-${ability.value}-matchup`}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "12px",
                          background: "var(--surface-elevated)",
                          color: "var(--text-body)",
                        }}
                      >
                        <strong style={{ display: "block", marginBottom: "6px" }}>
                          {normalAbilityCards.length > 1 ? `${ability.displayValue} defensive effect` : "Defensive effect"}
                        </strong>
                        <span>{ability.matchupNote}</span>
                      </div>
                    ))}
                </div>
              ) : null}
            </article>
          ) : null}
          {hiddenAbilityCard ? (
            <article
              key={`${hiddenAbilityCard.label}-${hiddenAbilityCard.value}`}
              style={{
                padding: "16px 18px",
                border: "1px solid var(--border-soft)",
                borderRadius: "16px",
                background: "linear-gradient(180deg, var(--surface-card) 0%, var(--surface-muted) 100%)",
                display: "grid",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "999px",
                    background: "var(--surface-elevated)",
                    color: "var(--text-muted)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                  }}
                >
                  Hidden Ability
                </span>
                <strong>
                  <Link href={`/abilities/${hiddenAbilityCard.slug}`}>{hiddenAbilityCard.displayValue}</Link>
                </strong>
              </div>
              <div style={{ color: "var(--text-body)", lineHeight: 1.6 }}>{hiddenAbilityCard.description}</div>
              {hiddenAbilityCard.matchupNote ? (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "12px",
                    background: "var(--surface-elevated)",
                    color: "var(--text-body)",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "6px" }}>Defensive effect</strong>
                  <span>{hiddenAbilityCard.matchupNote}</span>
                </div>
              ) : null}
            </article>
          ) : null}
        </div>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Encounters</h2>
        {encounterRows.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-muted)" }}>
                  <th style={cellStyle()}>Location</th>
                  <th style={cellStyle()}>Encounter Method</th>
                  <th style={cellStyle("right")}>Rate</th>
                  <th style={cellStyle()}>Levels</th>
                  <th style={cellStyle()}>Held Items</th>
                </tr>
              </thead>
              <tbody>
                {encounterRows.map((entry) => (
                  <tr key={entry.encounterId}>
                    <td style={cellStyle()}>
                      <Link href={`/locations/${entry.locationSlug}`}>{entry.locationName}</Link>
                    </td>
                    <td style={cellStyle()}>{entry.methodLabel}</td>
                    <td style={cellStyle("right")}>{entry.encounterRateLabel}</td>
                    <td style={cellStyle()}>{entry.levelRange}</td>
                    <td style={cellStyle()}>
                      {entry.heldItemEntries.length > 0 ? (
                        <div style={{ display: "grid", gap: "4px" }}>
                          {entry.heldItemEntries.map((item) => (
                            <span key={`${entry.encounterId}-${item.itemName}`}>
                              {item.itemSlug ? (
                                <Link href={`/items/${item.itemSlug}`}>
                                  {item.itemName}
                                  {item.chanceLabel ? ` (${item.chanceLabel})` : ""}
                                </Link>
                              ) : (
                                `${item.itemName}${item.chanceLabel ? ` (${item.chanceLabel})` : ""}`
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>No held items listed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No encounter data is currently listed for this Pokémon.</p>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Evolution Tree</h2>
        <div style={{ display: "grid", gap: "18px" }}>
          {evolutionTree.map((root) => (
            <EvolutionTreeBranch
              key={root.pokemon.id}
              node={root}
              currentPokemonId={pokemon.id}
              backHref={backHref}
            />
          ))}
        </div>
      </section>

      <section id="matchups" style={{ marginTop: "24px", display: "grid", gap: "18px", scrollMarginTop: "108px" }}>
        <div>
          <h2>Defensive Matchups</h2>
          {matchupAbilityView.showTabs ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              {matchupAbilityView.states.map((state) => {
                const active = state.id === activeMatchupState.id;
                const params = new URLSearchParams();
                if (returnTo) {
                  params.set("returnTo", returnTo);
                }
                params.set("ability", state.id);
                return (
                  <Link
                    key={`${pokemon.id}-${state.id}`}
                    href={`/pokemon/${pokemon.slug}?${params.toString()}#matchups`}
                    scroll={false}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "999px",
                      border: active ? "1px solid var(--accent-border)" : "1px solid var(--border-soft)",
                      background: active ? "var(--accent)" : "var(--surface-card)",
                      color: active ? "var(--button-text)" : "var(--text-body)",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {state.ability}
                  </Link>
                );
              })}
            </div>
          ) : null}
          <div style={{ display: "grid", gap: "10px" }}>
            {activeMatchupState.defensiveMatchups.map((bucket) => (
              <div
                key={`${bucket.label}-${bucket.multiplier}`}
                style={{
                  ...matchupSectionStyle(bucket.multiplier, "defensive"),
                  padding: "12px 14px",
                  borderRadius: "14px",
                }}
              >
                <strong style={{ display: "block", marginBottom: "8px" }}>{bucket.label}</strong>
                <TypeBadgeList types={bucket.types} />
              </div>
            ))}
          </div>
        </div>

      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Level-Up Learnset</h2>
        {learnset.length === 0 ? (
          <p>No level-up moves listed.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-muted)" }}>
                  <th style={cellStyle()}>Level</th>
                  <th style={cellStyle()}>Move</th>
                  <th style={cellStyle("center")}>Type</th>
                  <th style={cellStyle("center")}>Category</th>
                  <th style={cellStyle("center")}>Power</th>
                  <th style={cellStyle("center")}>Accuracy</th>
                  <th style={cellStyle("center")}>PP</th>
                  <th style={cellStyle()}>Effect</th>
                </tr>
              </thead>
              <tbody>
                {learnset.map((entry) => {
                  const move = entry.moveId ? getMoveById(entry.moveId) : undefined;

                  return (
                    <tr key={entry.learnsetId}>
                      <td style={cellStyle()}>{entry.level !== null ? entry.level : "—"}</td>
                      <td style={cellStyle()}>
                        {move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : entry.moveName}
                      </td>
                      <td style={cellStyle("center")}>
                        {move?.type ? <TypeBadgeList types={[move.type]} /> : "—"}
                      </td>
                      <td style={cellStyle("center")}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                          <MoveCategoryIcon category={move?.category ?? null} />
                        </span>
                      </td>
                      <td style={cellStyle("center")}>{formatValue(move?.power ?? null)}</td>
                      <td style={cellStyle("center")}>{formatValue(move?.accuracy ?? null)}</td>
                      <td style={cellStyle("center")}>{formatValue(move?.pp ?? null)}</td>
                      <td style={cellStyle()}>
                        {(entry.moveId ? getMoveEffectSummary(entry.moveId) : null) ??
                          "No effect summary listed."}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>TMs &amp; HMs</h2>
        {compatibility.length === 0 ? (
          <p>No TM or HM moves listed.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-muted)" }}>
                  <th style={cellStyle()}>TM/HM #</th>
                  <th style={cellStyle()}>Move</th>
                  <th style={cellStyle("center")}>Type</th>
                  <th style={cellStyle("center")}>Category</th>
                  <th style={cellStyle("center")}>Power</th>
                  <th style={cellStyle("center")}>Accuracy</th>
                  <th style={cellStyle("center")}>PP</th>
                  <th style={cellStyle()}>Effect</th>
                  <th style={cellStyle()}>Location</th>
                </tr>
              </thead>
              <tbody>
                {compatibility.map((entry) => {
                  const move = entry.machine.moveId ? getMoveById(entry.machine.moveId) : undefined;
                  const moveLabel = entry.machine.name.split(" - ")[1];
                  return (
                    <tr key={entry.compatibilityId}>
                      <td style={cellStyle()}>{entry.machine.code}</td>
                      <td style={cellStyle()}>
                        {move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : moveLabel}
                      </td>
                      <td style={cellStyle("center")}>
                        {move?.type ? <TypeBadgeList types={[move.type]} /> : "—"}
                      </td>
                      <td style={cellStyle("center")}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                          <MoveCategoryIcon category={move?.category ?? null} />
                        </span>
                      </td>
                      <td style={cellStyle("center")}>{formatValue(move?.power ?? null)}</td>
                      <td style={cellStyle("center")}>{formatValue(move?.accuracy ?? null)}</td>
                      <td style={cellStyle("center")}>{formatValue(move?.pp ?? null)}</td>
                      <td style={cellStyle()}>
                        {(entry.machine.moveId ? getMoveEffectSummary(entry.machine.moveId) : null) ??
                          "No effect summary listed."}
                      </td>
                      <td style={cellStyle()}>{entry.machine.location ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Move Tutors</h2>
        {moveTutorCompatibility.length === 0 ? (
          <p>No move tutor moves listed.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-muted)" }}>
                  <th style={cellStyle()}>Tutor</th>
                  <th style={cellStyle()}>Move</th>
                  <th style={cellStyle("center")}>Type</th>
                  <th style={cellStyle("center")}>Category</th>
                  <th style={cellStyle("center")}>Power</th>
                  <th style={cellStyle("center")}>Accuracy</th>
                  <th style={cellStyle("center")}>PP</th>
                  <th style={cellStyle()}>Effect</th>
                  <th style={cellStyle()}>Location</th>
                </tr>
              </thead>
              <tbody>
                {moveTutorCompatibility.map((entry) => {
                  const move = entry.machine.moveId ? getMoveById(entry.machine.moveId) : undefined;
                  const moveLabel = entry.machine.name.split(" - ")[1];
                  return (
                    <tr key={entry.compatibilityId}>
                      <td style={cellStyle()}>{entry.machine.code}</td>
                      <td style={cellStyle()}>
                        {move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : moveLabel}
                      </td>
                      <td style={cellStyle("center")}>
                        {move?.type ? <TypeBadgeList types={[move.type]} /> : "—"}
                      </td>
                      <td style={cellStyle("center")}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                          <MoveCategoryIcon category={move?.category ?? null} />
                        </span>
                      </td>
                      <td style={cellStyle("center")}>{formatValue(move?.power ?? null)}</td>
                      <td style={cellStyle("center")}>{formatValue(move?.accuracy ?? null)}</td>
                      <td style={cellStyle("center")}>{formatValue(move?.pp ?? null)}</td>
                      <td style={cellStyle()}>
                        {(entry.machine.moveId ? getMoveEffectSummary(entry.machine.moveId) : null) ??
                          "No effect summary listed."}
                      </td>
                      <td style={cellStyle()}>{entry.machine.location ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
