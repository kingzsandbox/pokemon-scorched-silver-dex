import Link from "next/link";
import { MoveCategoryIcon, TypeBadgeList } from "../../components/dex-visuals";
import PageNavigation from "../../components/page-navigation";
import { getMoveTutorBrowseEntries } from "../../lib/data/compatibility";
import { getMoveEffectSummary } from "../../lib/data/vanilla";
import { getTutorContextById } from "../../lib/data/acquisition";
import { getLocationByMap, getLocationGroupByLocationId } from "../../lib/data/locations";

function cellStyle(align: "left" | "center" = "left") {
  return {
    padding: "10px 12px",
    borderBottom: "1px solid var(--border-soft)",
    textAlign: align,
    verticalAlign: "top",
  } as const;
}

type MoveTutorBrowseEntry = ReturnType<typeof getMoveTutorBrowseEntries>[number];
type MoveTutorDisplayEntry = MoveTutorBrowseEntry & {
  displayLocation: string;
  specificLocation: string | null;
};

function numericTutorId(code: string): number | null {
  const parsed = Number.parseInt(code.replace(/\D+/g, ""), 10);
  return Number.isFinite(parsed) ? parsed - 1 : null;
}

function cleanMachineLocation(value: string | null): string | null {
  if (!value) {
    return null;
  }

  if (/^Map\s+\d+\/\d+$/i.test(value)) {
    return null;
  }

  const surfMatch = value.match(/^Surf\s+(.+)$/i);
  if (surfMatch) {
    return surfMatch[1].trim().replace(/\bCherrygrove\b/i, "Cherrygrove City");
  }

  return value;
}

function resolveTutorLocation(entry: MoveTutorBrowseEntry): { displayLocation: string; specificLocation: string | null } {
  const tutorId = numericTutorId(entry.machine.code);
  const context = tutorId === null ? undefined : getTutorContextById(tutorId);

  if (entry.move?.name === "BanefulBunkr") {
    return { displayLocation: "Azalea Town", specificLocation: null };
  }

  if (entry.move?.name === "Swords Dance") {
    return { displayLocation: "Cherrygrove City", specificLocation: "Cherrygrove House" };
  }

  const mapLocation = context ? getLocationByMap(context.mapGroup, context.mapNumber) : undefined;
  const group = mapLocation ? getLocationGroupByLocationId(mapLocation.id) : undefined;

  if (group?.name) {
    const isFacilityGroup = /(?:House|Gym|Store|Shop|Corner|Center|Mart)$/i.test(group.name);
    if (isFacilityGroup && group.name === "Cherrygrove House") {
      return { displayLocation: "Cherrygrove City", specificLocation: "Cherrygrove House" };
    }

    return { displayLocation: group.name, specificLocation: null };
  }

  if (mapLocation?.name && !/^Map\s+\d+\/\d+$/i.test(mapLocation.name)) {
    return { displayLocation: mapLocation.name, specificLocation: null };
  }

  const cleanedMachineLocation = cleanMachineLocation(entry.machine.location);
  if (cleanedMachineLocation) {
    return { displayLocation: cleanedMachineLocation, specificLocation: null };
  }

  const cleanedContextLocation = cleanMachineLocation(context?.locationNameCandidate ?? null);
  if (cleanedContextLocation) {
    return { displayLocation: cleanedContextLocation, specificLocation: null };
  }

  return { displayLocation: "Additional tutors", specificLocation: null };
}

function uniqueTutorEntries(entries: MoveTutorBrowseEntry[]): MoveTutorDisplayEntry[] {
  const seen = new Set<string>();
  const uniqueEntries: MoveTutorDisplayEntry[] = [];

  for (const entry of entries) {
    const { displayLocation, specificLocation } = resolveTutorLocation(entry);
    const key = `${displayLocation}|${entry.move?.id ?? entry.machine.moveId ?? entry.machine.id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    uniqueEntries.push({ ...entry, displayLocation, specificLocation });
  }

  return uniqueEntries;
}

export default function MoveTutorsPage() {
  const tutors = uniqueTutorEntries(getMoveTutorBrowseEntries());
  const tutorsByLocation = new Map<string, MoveTutorDisplayEntry[]>();
  for (const tutor of tutors) {
    const location = tutor.displayLocation;
    const rows = tutorsByLocation.get(location) ?? [];
    rows.push(tutor);
    tutorsByLocation.set(location, rows);
  }

  const sections = [...tutorsByLocation.entries()]
    .map(([location, entries]) => ({
      key: location.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: location,
      tutors: entries,
    }))
    .sort((left, right) => left.title.localeCompare(right.title));

  return (
    <main style={{ margin: "0 auto", maxWidth: "1100px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref="/" backLabel="Back to Pokedex" />
      <h1 style={{ marginTop: 0 }}>Move Tutors</h1>

      <div style={{ display: "grid", gap: "28px", marginTop: "24px" }}>
        {sections.map((section) => (
          <section key={section.key}>
            <div
              style={{
                marginBottom: "14px",
              }}
            >
              <div>
                <h2 style={{ marginTop: 0, marginBottom: "8px" }}>{section.title}</h2>
              </div>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              {section.tutors.map(({ machine, move, specificLocation }) => {
                return (
                  <article
                    key={machine.id}
                    id={machine.slug}
                    style={{
                      border: "1px solid var(--border-soft)",
                      borderRadius: "16px",
                      background: "var(--surface-card)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-soft)" }}>
                      <strong>
                        {move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : machine.name}
                      </strong>
                      {specificLocation ? (
                        <div style={{ color: "var(--text-muted)", marginTop: "6px" }}>{specificLocation}</div>
                      ) : null}
                    </div>

                    {move ? (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ background: "var(--surface-muted)" }}>
                              <th style={cellStyle("center")}>Type</th>
                              <th style={cellStyle("center")}>Category</th>
                              <th style={cellStyle("center")}>Power</th>
                              <th style={cellStyle("center")}>Accuracy</th>
                              <th style={cellStyle("center")}>PP</th>
                              <th style={cellStyle()}>Effect</th>
                            </tr>
                        </thead>
                          <tbody>
                            <tr>
                              <td style={cellStyle("center")}>
                                {move.type ? <TypeBadgeList types={[move.type]} /> : "—"}
                              </td>
                              <td style={cellStyle("center")}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                  }}
                                >
                                  <MoveCategoryIcon category={move.category} />
                                </span>
                              </td>
                              <td style={cellStyle("center")}>{move.power ?? "—"}</td>
                              <td style={cellStyle("center")}>{move.accuracy ?? "—"}</td>
                              <td style={cellStyle("center")}>{move.pp ?? "—"}</td>
                              <td style={{ ...cellStyle(), minWidth: "280px", whiteSpace: "normal" }}>
                                {getMoveEffectSummary(move.id) ?? "No effect summary listed."}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: "14px 16px" }}>No move listed.</div>
                    )}

                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
