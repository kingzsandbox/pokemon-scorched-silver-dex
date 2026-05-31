import Link from "next/link";
import { notFound } from "next/navigation";
import { MoveCategoryIcon, TypeBadgeList } from "../../../components/dex-visuals";
import ItemImage from "../../../components/item-image";
import PageNavigation from "../../../components/page-navigation";
import ReferenceImage from "../../../components/reference-image";
import { getPokemonMiniSpriteSources } from "../../../lib/assets";
import {
  getCompatiblePokemonByMachineId,
  getMachineBySlug,
  getMachineLocationEntry,
  isBrowsableMachine,
} from "../../../lib/data/compatibility";
import { getItemObtainDetails, getMachineItemByCode } from "../../../lib/data/items";
import { getMoveById } from "../../../lib/data/moves";
import { getPokemonDisplayName } from "../../../lib/presentation";
import { getMoveEffectSummary } from "../../../lib/data/vanilla";

function getMachineTypeIconSrc(type: string | null | undefined): string | null {
  if (!type) {
    return null;
  }

  return `/sprites/tm-types/${type.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
}

function getMachineObtainDetails(machineCode: string) {
  const machineItem = getMachineItemByCode(machineCode);

  if (!machineItem) {
    return [];
  }

  type MachineLocationDetail = Omit<ReturnType<typeof getItemObtainDetails>[number], "method" | "detail"> & {
    method: string | null;
    detail: string | null;
  };

  const deduped = new Map<string, MachineLocationDetail>();

  for (const entry of getItemObtainDetails(machineItem.id)
    .filter((entry) => entry.method !== "TM/HM" && entry.locationName !== "Move Tutor")
    .map((entry) => ({
      ...entry,
      method: entry.method === "Item Guide" ? null : entry.method,
      detail:
        entry.detail && entry.detail.toLowerCase() !== entry.locationName.toLowerCase()
          ? entry.detail
          : null,
    }))) {
    const key = entry.locationName.toLowerCase();
    const existing = deduped.get(key);
    if (!existing || (!existing.detail && entry.detail)) {
      deduped.set(key, entry);
    }
  }

  return [...deduped.values()];
}

type MachineDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function MachineDetailPage({ params }: MachineDetailPageProps) {
  const { slug } = await params;
  const machine = getMachineBySlug(slug);

  if (!machine || !isBrowsableMachine(machine)) {
    notFound();
  }

  const move = machine.moveId ? getMoveById(machine.moveId) : undefined;
  const location = getMachineLocationEntry(machine);
  const compatiblePokemon = getCompatiblePokemonByMachineId(machine.id);
  const machineItem = getMachineItemByCode(machine.code);
  const machineTypeIconSrc = getMachineTypeIconSrc(move?.type);
  const obtainDetails = getMachineObtainDetails(machine.code);

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref="/machines" backLabel="Back to TMs & HMs" />
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {machineItem ? (
          <ItemImage item={machineItem} size={52} framed />
        ) : machineTypeIconSrc ? (
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              border: "1px solid var(--border-soft)",
              background: "var(--surface-card)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <img src={machineTypeIconSrc} alt={move?.type ?? machine.code} width={40} height={40} style={{ width: "40px", height: "40px", objectFit: "contain" }} />
          </div>
        ) : null}
        <h1 style={{ marginTop: 0, marginBottom: 0 }}>{machine.code} {move ? move.name : ""}</h1>
      </div>
      <p style={{ color: "var(--text-muted)", textTransform: "uppercase" }}>{machine.kind}</p>

      <section style={{ marginTop: "24px" }}>
        <h2>Move Taught</h2>
        {move ? (
          <div style={{ display: "grid", gap: "10px" }}>
            <p>
              <Link href={`/moves/${move.slug}`}>{move.name}</Link>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              {move.type ? <TypeBadgeList types={[move.type]} /> : null}
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <MoveCategoryIcon category={move.category} />
                <span>{move.category ?? "—"}</span>
              </span>
              <span>Power {move.power ?? "—"}</span>
              <span>Accuracy {move.accuracy ?? "—"}</span>
              <span>PP {move.pp ?? "—"}</span>
            </div>
            <p style={{ lineHeight: 1.6, margin: 0 }}>{getMoveEffectSummary(move.id) ?? "No effect summary listed."}</p>
          </div>
        ) : (
          <p>No move listed.</p>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Location</h2>
        {obtainDetails.length > 0 ? (
          <div style={{ display: "grid", gap: "10px" }}>
            {obtainDetails.map((entry) => (
              <div
                key={entry.itemLocationId}
                style={{
                  display: "grid",
                  gap: "4px",
                  padding: "12px 14px",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "12px",
                  background: "var(--surface-card)",
                }}
              >
                <strong>
                  {entry.locationSlug ? (
                    <Link href={`/locations/${entry.locationSlug}`}>{entry.locationName}</Link>
                  ) : (
                    entry.locationName
                  )}
                </strong>
                <span style={{ color: "var(--text-muted)" }}>
                  {[entry.method, entry.detail].filter(Boolean).join(" - ")}
                </span>
              </div>
            ))}
          </div>
        ) : location ? (
          <p>
            <Link href={`/locations/${location.slug}`}>{location.name}</Link>
          </p>
        ) : machine.location ? (
          <p>{machine.location}</p>
        ) : (
          <p>No obtainment location listed.</p>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Compatibility</h2>
        {compatiblePokemon.length === 0 ? (
          <p>No compatible Pokémon listed.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              {compatiblePokemon.length} Scorched Silver species entries can learn this move.
            </p>
            {compatiblePokemon.map((pokemon) => {
              const sprite = getPokemonMiniSpriteSources(pokemon);
              return (
                <Link
                  key={pokemon.id}
                  href={`/pokemon/${pokemon.slug}?returnTo=${encodeURIComponent(`/machines/${machine.slug}`)}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "52px 72px 1fr auto",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--border-soft)",
                  }}
                >
                  <span
                    style={{
                      width: "44px",
                      height: "44px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ReferenceImage
                      src={sprite.src}
                      fallbackSrc={sprite.fallbackSrc}
                      alt={pokemon.name}
                      width={40}
                      height={40}
                      normalizeVisual
                      visualScaleHint={sprite.visualScale}
                      style={{ width: "40px", height: "40px", objectFit: "contain", imageRendering: "pixelated" }}
                    />
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>#{pokemon.dexNumber}</span>
                  <span style={{ color: "var(--text-body)", fontWeight: 600 }}>{getPokemonDisplayName(pokemon)}</span>
                  <TypeBadgeList types={pokemon.types} />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
