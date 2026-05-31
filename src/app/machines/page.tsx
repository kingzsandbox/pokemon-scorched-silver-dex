import Link from "next/link";
import { MoveCategoryIcon, TypeBadgeList } from "../../components/dex-visuals";
import ItemImage from "../../components/item-image";
import { getMachineBrowseEntries } from "../../lib/data/compatibility";
import { getMachineItemByCode } from "../../lib/data/items";
import { getMoveEffectSummary } from "../../lib/data/vanilla";

function formatMoveNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : String(value);
}

function getMoveEffectText(moveId: string | null | undefined, fallback: string | null | undefined): string {
  if (!moveId) {
    return "—";
  }

  return getMoveEffectSummary(moveId) ?? fallback ?? "—";
}

const tableHeaderStyle = {
  position: "sticky",
  top: 0,
  zIndex: 8,
  padding: "12px 10px",
  borderBottom: "1px solid var(--border-soft)",
  background: "var(--surface-elevated)",
  color: "var(--text-strong)",
  textAlign: "left",
  verticalAlign: "bottom",
  boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
} as const;

function tableCellStyle(align: "left" | "center" = "left") {
  return {
    padding: "14px 10px",
    borderBottom: "1px solid var(--border-soft)",
    textAlign: align,
    verticalAlign: "top",
  } as const;
}

export default function MachinesPage() {
  const machines = getMachineBrowseEntries();

  return (
    <main style={{ margin: "0 auto", maxWidth: "1400px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>TMs &amp; HMs</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Browse TM and HM records by machine code, taught move, battle data, obtainment, and compatibility.
      </p>

      <div className="table-scroll" style={{ marginTop: "24px" }}>
        <table style={{ width: "100%", minWidth: "1180px", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ ...tableHeaderStyle, width: "190px" }}>Machine</th>
              <th style={tableHeaderStyle}>Move</th>
              <th style={tableHeaderStyle}>Type</th>
              <th style={tableHeaderStyle}>Category</th>
              <th style={{ ...tableHeaderStyle, textAlign: "center" }}>Power</th>
              <th style={{ ...tableHeaderStyle, textAlign: "center" }}>Acc.</th>
              <th style={{ ...tableHeaderStyle, textAlign: "center" }}>PP</th>
              <th style={{ ...tableHeaderStyle, minWidth: "300px" }}>Effect</th>
            </tr>
          </thead>
          <tbody>
        {machines.map(({ machine, move }) => {
          const machineItem = getMachineItemByCode(machine.code);
          return (
            <tr
              key={machine.id}
            >
              <td style={tableCellStyle()}>
                <Link href={`/machines/${machine.slug}`} style={{ display: "inline-grid", gridTemplateColumns: "42px 1fr", gap: "10px", alignItems: "center" }}>
                  {machineItem ? <ItemImage item={machineItem} size={38} framed /> : <span />}
                  <span>
                    <strong>{machine.code}</strong>
                    <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.88rem" }}>{machine.kind.toUpperCase()}</span>
                  </span>
                </Link>
              </td>
              <td style={tableCellStyle()}>{move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : machineItem?.name ?? machine.code}</td>
              <td style={tableCellStyle("center")}>{move?.type ? <TypeBadgeList types={[move.type]} /> : "—"}</td>
              <td style={tableCellStyle("center")}>{move ? <MoveCategoryIcon category={move.category} /> : "—"}</td>
              <td style={tableCellStyle("center")}>{formatMoveNumber(move?.power)}</td>
              <td style={tableCellStyle("center")}>{formatMoveNumber(move?.accuracy)}</td>
              <td style={tableCellStyle("center")}>{formatMoveNumber(move?.pp)}</td>
              <td style={{ ...tableCellStyle(), color: "var(--text-muted)", lineHeight: 1.45 }}>
                {getMoveEffectText(move?.id, move?.notes)}
              </td>
            </tr>
          );
        })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
