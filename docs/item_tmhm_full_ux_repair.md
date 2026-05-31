# Item and TM/HM Full UX Repair

Date: 2026-05-29

Repairs confirmed:

- Item pages use modern item icon URLs with a polished neutral fallback.
- TM/HM pages show machine icons or type-based fallback icons.
- TM/HM pages only expose the recovered TM01-TM50 and HM01-HM08 set.
- Item pages label obtain sources as `ROM-backed` or `Documentation-backed`.
- Documentation-backed item-location entries are surfaced where available.
- Raw source keys are translated before display.

Remaining caveat:

- Some machine location fields are genuinely not listed in the recovered data; these display as clean unavailable states rather than raw `null` values.
