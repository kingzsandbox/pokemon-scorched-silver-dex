import PageNavigation from "../../components/page-navigation";

export default function BattlesPage() {
  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>Battles</h1>
      <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
        Battle and trainer-party data is not part of the current Scorched Silver extraction.
      </p>
    </main>
  );
}
