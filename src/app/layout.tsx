import type { Metadata } from "next";
import { Suspense } from "react";
import GlobalHeader from "../components/global-header";
import ScrollToTopButton from "../components/scroll-to-top-button";
import { getSearchIndex } from "../lib/search";
import "./globals.css";

const qaBuildMarker = "Scorched Silver Dex QA build: 2026-05-30 17:05 PDT";

export const metadata: Metadata = {
  title: "Scorched Silver Dex",
  description: "A static reference for Pokémon, moves, items, locations, and acquisition data in Scorched Silver.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

function HeaderFallback() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(14px)",
        background: "var(--surface-elevated)",
        borderBottom: "1px solid var(--border-header)",
      }}
    >
      <div style={{ margin: "0 auto", maxWidth: "1400px", padding: "16px 18px 18px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            marginBottom: "14px",
          }}
        >
          <a href="/" style={{ textDecoration: "none", fontSize: "1.15rem", fontWeight: 800, color: "var(--text-strong)" }}>
            Scorched Silver Dex
          </a>
        </div>

        <form action="/search" method="get" style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <input
            name="q"
            type="search"
            placeholder="Search Pokémon, locations, items, moves, TMs & HMs, move tutors, abilities, and acquisition data..."
            style={{
              width: "100%",
              minWidth: 0,
              padding: "11px 14px",
              border: "1px solid var(--border-soft)",
              borderRadius: "12px",
              background: "var(--surface-card)",
              color: "var(--text-body)",
              flex: 1,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "11px 16px",
              border: "1px solid var(--accent-border)",
              borderRadius: "12px",
              background: "var(--accent)",
              color: "var(--button-text)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  const searchIndex = getSearchIndex();

  return (
    <html lang="en">
      <body>
        <Suspense fallback={<HeaderFallback />}>
          <GlobalHeader searchIndex={searchIndex} />
        </Suspense>
        {children}
        <footer
          style={{
            margin: "0 auto",
            maxWidth: "1400px",
            padding: "18px 24px 32px",
            color: "var(--text-muted)",
            fontSize: "0.82rem",
            textAlign: "center",
          }}
        >
          {qaBuildMarker}
        </footer>
        <ScrollToTopButton />
      </body>
    </html>
  );
}
