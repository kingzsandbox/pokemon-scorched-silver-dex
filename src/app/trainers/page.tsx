import PageNavigation from "../../components/page-navigation";

export default function TrainersPage() {
  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>Trainers</h1>
      <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
        Trainer parties have not been extracted from Scorched Silver yet.
      </p>
    </main>
  );
}
