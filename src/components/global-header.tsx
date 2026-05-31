"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SearchAutocomplete from "../app/search-autocomplete";
import type { SearchResult } from "../lib/types";

const navItems = [
  { href: "/", label: "Pokemon", match: (pathname: string) => pathname === "/" },
  {
    href: "/?tab=locations",
    label: "Locations",
    match: (pathname: string) => pathname === "/locations" || pathname.startsWith("/locations/"),
  },
  { href: "/?tab=items", label: "Items", match: (pathname: string) => pathname === "/items" || pathname.startsWith("/items/") },
  { href: "/?tab=moves", label: "Moves", match: (pathname: string) => pathname === "/moves" || pathname.startsWith("/moves/") },
  {
    href: "/?tab=machines",
    label: "TMs & HMs",
    match: (pathname: string) => pathname === "/machines" || pathname.startsWith("/machines/"),
  },
  {
    href: "/?tab=abilities",
    label: "Abilities",
    match: (pathname: string) => pathname === "/abilities" || pathname.startsWith("/abilities/"),
  },
  {
    href: "/move-tutors",
    label: "Move Tutors",
    match: (pathname: string) => pathname === "/move-tutors",
  },
] as const;

type GlobalHeaderProps = {
  searchIndex: SearchResult[];
};

function navLinkStyle(active: boolean) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "38px",
    padding: "0 14px",
    borderRadius: "999px",
    border: active ? "1px solid var(--gold-accent)" : "1px solid var(--border-soft)",
    background: active ? "linear-gradient(180deg, rgba(244,246,245,0.95) 0%, rgba(203,209,207,0.96) 100%)" : "var(--surface-glass)",
    color: active ? "var(--button-text)" : "var(--text-body)",
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: active ? "0 0 0 1px rgba(214,180,92,0.18), 0 10px 24px rgba(226,232,229,0.14)" : "var(--shadow-soft)",
  } as const;
}

export default function GlobalHeader({ searchIndex }: GlobalHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeRootTab = searchParams.get("tab");
  const [mobileHeaderVisible, setMobileHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY;
      const isMobile = window.matchMedia("(max-width: 760px)").matches;

      if (!isMobile) {
        setMobileHeaderVisible(true);
        lastScrollYRef.current = currentY;
        return;
      }

      const lastScrollY = lastScrollYRef.current;

      if (currentY < 36 || currentY < lastScrollY - 8) {
        setMobileHeaderVisible(true);
      } else if (currentY > lastScrollY + 8 && currentY > 140) {
        setMobileHeaderVisible(false);
      }

      lastScrollYRef.current = currentY;
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function isActive(item: (typeof navItems)[number]) {
    if (pathname === "/") {
      if (item.label === "Pokemon") {
        return !activeRootTab || activeRootTab === "pokedex";
      }
      if (item.href.startsWith("/?tab=")) {
        return activeRootTab === item.href.replace("/?tab=", "");
      }
    }

    return item.match(pathname);
  }

  return (
    <>
    <header
      className={mobileHeaderVisible ? "site-header" : "site-header site-header-hidden"}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(22px) saturate(1.15)",
        background: "linear-gradient(180deg, rgba(18,19,19,0.9), rgba(11,12,12,0.76))",
        borderBottom: "1px solid var(--border-header)",
        boxShadow: "0 16px 36px rgba(0,0,0,0.34)",
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
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ display: "block", fontSize: "1.15rem", fontWeight: 800, color: "var(--text-strong)" }}>
              Scorched Silver Dex
            </span>
          </Link>

          <nav aria-label="Global" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} style={navLinkStyle(active)}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <SearchAutocomplete
          index={searchIndex}
          action="/search"
          placeholder="Search Pokémon, locations, items, moves, TMs & HMs, move tutors, abilities, and acquisition data..."
        />
      </div>
    </header>
      {!mobileHeaderVisible ? (
        <button
          type="button"
          className="mobile-nav-toggle"
          aria-label="Show navigation"
          onClick={() => setMobileHeaderVisible(true)}
        >
          Menu
        </button>
      ) : null}
    </>
  );
}
