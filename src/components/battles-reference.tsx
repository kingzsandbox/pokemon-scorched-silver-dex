"use client";

import type { BattleOccurrence } from "../lib/data/battles";

type BattlesReferenceProps = {
  battles: BattleOccurrence[];
  embedded?: boolean;
};

export default function BattlesReference({ embedded = false }: BattlesReferenceProps) {
  const Wrapper = embedded ? "section" : "main";

  return (
    <Wrapper style={embedded ? undefined : { margin: "0 auto", maxWidth: "980px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>Trainer Battles</h1>
      <p style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>
        Trainer-party data has not been extracted from Scorched Silver yet.
      </p>
    </Wrapper>
  );
}
