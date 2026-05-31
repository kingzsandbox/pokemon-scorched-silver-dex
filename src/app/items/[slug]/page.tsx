import { notFound } from "next/navigation";
import Link from "next/link";
import ItemImage from "../../../components/item-image";
import PageNavigation from "../../../components/page-navigation";
import {
  getItemBySlug,
  getItemDisplayCategory,
  getItemDisplayDescription,
  getItemDisplayName,
  getItemObtainDetails,
} from "../../../lib/data/items";
import { getLocationBySlug, getLocationDisplayName } from "../../../lib/data/locations";

type ItemDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const foundLocations = getItemObtainDetails(item.id);
  const sourceLabel = (source: "internal" | "vanilla") =>
    source === "internal" ? "Game data" : "Item guide";

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref="/items" backLabel="Back to Items" />
      <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "12px" }}>
        <ItemImage item={item} size={84} />
        <div>
          <h1 style={{ marginTop: 0, marginBottom: "6px" }}>{getItemDisplayName(item)}</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>{getItemDisplayCategory(item)}</p>
        </div>
      </div>
      <p style={{ lineHeight: 1.6 }}>{getItemDisplayDescription(item)}</p>

      {foundLocations.length > 0 ? (
        <section style={{ marginTop: "24px" }}>
          <h2>Where to Obtain</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-muted)" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)", background: "var(--surface-muted)" }}>Location</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)", background: "var(--surface-muted)" }}>How</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)", background: "var(--surface-muted)" }}>Details</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)", background: "var(--surface-muted)" }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {foundLocations.map((entry) => {
                  const linkedLocation = entry.locationSlug ? getLocationBySlug(entry.locationSlug) : undefined;
                  const displayLocation = linkedLocation ? getLocationDisplayName(linkedLocation) : entry.locationName;
                  return (
                  <tr key={entry.itemLocationId}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
                      {entry.locationSlug ? (
                        <Link href={`/locations/${entry.locationSlug}`}>{displayLocation}</Link>
                      ) : (
                        displayLocation
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>{entry.method}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>{entry.detail ?? "—"}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 8px",
                          borderRadius: "999px",
                          border: "1px solid var(--border-soft)",
                          background: "var(--surface-muted)",
                          color: "var(--text-muted)",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {sourceLabel(entry.source)}
                      </span>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section style={{ marginTop: "24px" }}>
          <h2>Where to Obtain</h2>
          <p>No obtain source is listed for this item.</p>
        </section>
      )}
    </main>
  );
}
