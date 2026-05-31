import Link from "next/link";
import ReferenceImage from "../../components/reference-image";
import PageNavigation from "../../components/page-navigation";
import { TypeBadgeList } from "../../components/dex-visuals";
import { getPokemonMiniSpriteSources } from "../../lib/assets";
import { getPokemonFormGroup, getPokemonLandingListPokemon } from "../../lib/data/pokemon";
import { getPokemonDisplayName } from "../../lib/presentation";

export default function PokemonListPage() {
  const pokemon = getPokemonLandingListPokemon();

  return (
    <main style={{ margin: "0 auto", maxWidth: "980px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>Pokémon</h1>

      <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
        {pokemon.map((entry) => {
          const sprite = getPokemonMiniSpriteSources(entry);
          const forms = getPokemonFormGroup(entry);
          return (
            <Link
              key={entry.id}
              href={`/pokemon/${entry.slug}`}
              style={{
                display: "grid",
                gridTemplateColumns: "96px minmax(0, 1fr)",
                gap: "16px",
                alignItems: "center",
                padding: "14px 16px",
                border: "1px solid var(--border-soft)",
                borderRadius: "14px",
                background: "var(--surface-card)",
              }}
            >
              <span
                style={{
                  width: "90px",
                  height: "90px",
                  display: "grid",
                  placeItems: "center",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "14px",
                  background: "var(--surface-muted)",
                  overflow: "hidden",
                }}
              >
                <ReferenceImage
                  src={sprite.src}
                  fallbackSrc={sprite.fallbackSrc}
                  alt={getPokemonDisplayName(entry)}
                  width={82}
                  height={82}
                  style={{ width: "82px", height: "82px", objectFit: "contain", imageRendering: "pixelated" }}
                />
              </span>
              <span>
                <strong style={{ display: "block" }}>{getPokemonDisplayName(entry)}</strong>
                <span style={{ color: "var(--text-muted)", display: "block", marginTop: "6px" }}>
                  #{entry.dexNumber}
                  {forms.length > 1 ? ` • ${forms.length} forms` : ""}
                </span>
                <span style={{ display: "block", marginTop: "8px" }}>
                  <TypeBadgeList types={entry.types} />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
