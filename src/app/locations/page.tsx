import Link from "next/link";
import PageNavigation from "../../components/page-navigation";
import { getLocationGroups } from "../../lib/data/locations";

export default function LocationsPage() {
  const locationGroups = getLocationGroups();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>Locations</h1>

      <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
        {locationGroups.map((location) => (
          <Link
            key={location.id}
            href={`/locations/${location.slug}`}
            style={{
              display: "block",
              alignItems: "center",
              padding: "16px",
              border: "1px solid var(--border-soft)",
              borderRadius: "14px",
              background: "var(--surface-card)",
              textDecoration: "none",
            }}
          >
            <strong style={{ color: "var(--text-body)" }}>{location.name}</strong>
          </Link>
        ))}
      </div>
    </main>
  );
}
