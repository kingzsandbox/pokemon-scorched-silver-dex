import Link from "next/link";
import { MoveCategoryIcon, TypeBadgeList } from "../../components/dex-visuals";
import PageNavigation from "../../components/page-navigation";
import { getMoveEffectSummary } from "../../lib/data/vanilla";
import { getMoves } from "../../lib/data/moves";

function cellStyle(align: "left" | "center" | "right" = "left") {
  return {
    padding: "10px 12px",
    borderBottom: "1px solid var(--border-soft)",
    textAlign: align,
    verticalAlign: "top",
  } as const;
}

function headerCellStyle(align: "left" | "center" | "right" = "left") {
  return {
    ...cellStyle(align),
    position: "sticky",
    top: 0,
    zIndex: 8,
    background: "var(--surface-table-header)",
    color: "var(--text-strong)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
  } as const;
}

export default function MovesPage() {
  const moves = getMoves();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>All Moves</h1>
      <div className="table-scroll" style={{ marginTop: "24px" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={headerCellStyle()}>Move</th>
              <th style={headerCellStyle("center")}>Type</th>
              <th style={headerCellStyle("center")}>Category</th>
              <th style={headerCellStyle("center")}>Power</th>
              <th style={headerCellStyle("center")}>Accuracy</th>
              <th style={headerCellStyle("center")}>PP</th>
              <th style={headerCellStyle()}>Effect Summary</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((move) => (
              <tr key={move.id}>
                <td style={cellStyle()}>
                  <Link href={`/moves/${move.slug}`}>{move.name}</Link>
                </td>
                <td style={cellStyle("center")}>
                  {move.type ? <TypeBadgeList types={[move.type]} /> : "—"}
                </td>
                <td style={cellStyle("center")}>
                  <MoveCategoryIcon category={move.category} />
                </td>
                <td style={cellStyle("center")}>{move.power ?? "—"}</td>
                <td style={cellStyle("center")}>{move.accuracy ?? "—"}</td>
                <td style={cellStyle("center")}>{move.pp ?? "—"}</td>
                <td style={{ ...cellStyle(), whiteSpace: "normal", minWidth: "280px" }}>
                  {getMoveEffectSummary(move.id) ?? "No effect summary listed."}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
