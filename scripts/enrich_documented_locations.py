from __future__ import annotations

import csv
import json
import re
from pathlib import Path


APP_ROOT = Path(__file__).resolve().parents[1]
LAB_ROOT = APP_ROOT.parent / "pokemon-resource-extraction-lab"
DATA_DIR = APP_ROOT / "public" / "data"
POKEMON_DOC_ROWS = LAB_ROOT / "temp_analysis" / "location_doc_rows.tsv"
ITEM_DOC_ROWS = LAB_ROOT / "temp_analysis" / "item_doc_rows.tsv"
ROM_PATH = LAB_ROOT / "source_working" / "Pokemon_Emerald_patched_provided_working.gba"
MAP_GROUP_TABLE = 0x5529E4
MAP_SECTION_TABLE = 0x6B2AD8
ROM_CONTEXT_LOCATION_OVERRIDES = {
    "location-g25-m040": ("S.S. Tidal", "ROM script text identifies Captain Briney and S.S. TIDAL cabin hallway scripts."),
    "location-g25-m041": ("S.S. Tidal", "ROM warps connect this map to the S.S. TIDAL cabin area; dialogue identifies the lower ship hull."),
    "location-g25-m042": ("S.S. Tidal", "ROM warps connect this map to S.S. TIDAL cabins; passenger dialogue and tutor script are cabin-local."),
    "location-g26-m060": ("Trainer Hill", "ROM dialogue says this is TRAINER HILL and exposes Trainer Hill shops/reception scripts."),
    "location-g26-m088": ("Seashore House", "ROM dialogue identifies the SEASHORE HOUSE battle/shop room."),
}


def slugify(value: str) -> str:
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))


def title_case(value: str) -> str:
    words = []
    for word in re.sub(r"\s+", " ", value.strip()).split(" "):
        if re.fullmatch(r"[A-F]", word, re.I):
            words.append(word.upper())
        elif word.lower() in {"of", "in", "and", "the"}:
            words.append(word.lower())
        elif word.lower() == "mt":
            words.append("Mt.")
        else:
            words.append(word[:1].upper() + word[1:].lower())
    return (
        " ".join(words)
        .replace("Pokemon", "Pokémon")
        .replace("Newbark", "New Bark")
        .replace("Dragon'S Den", "Dragon's Den")
        .replace("Ruins Of Alph", "Ruins of Alph")
    )


def load_json(name: str):
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))


def write_json(name: str, data) -> None:
    (DATA_DIR / name).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def decode_gen3_text(raw: bytes) -> str:
    charmap = {0x00: " ", 0xAB: "!", 0xAC: "?", 0xAD: ".", 0xAE: "-", 0xB8: ",", 0xBA: "/"}
    for i, ch in enumerate("0123456789"):
        charmap[0xA1 + i] = ch
    for i, ch in enumerate("ABCDEFGHIJKLMNOPQRSTUVWXYZ"):
        charmap[0xBB + i] = ch
    for i, ch in enumerate("abcdefghijklmnopqrstuvwxyz"):
        charmap[0xD5 + i] = ch
    out = []
    for byte in raw:
        if byte == 0xFF:
            break
        if byte in (0xFE, 0xFA, 0xFB):
            out.append(" ")
            continue
        out.append(charmap.get(byte, ""))
    return re.sub(r"\s+", " ", "".join(out)).strip()


def rom_pointer_to_offset(pointer: int) -> int | None:
    if 0x08000000 <= pointer < 0x0A000000:
        return pointer - 0x08000000
    return None


def read_u32(raw: bytes, offset: int) -> int:
    return int.from_bytes(raw[offset : offset + 4], "little")


def build_rom_map_section_lookup() -> dict[str, str]:
    rom = ROM_PATH.read_bytes()

    def section_name(section_id: int) -> str | None:
        entry_offset = MAP_SECTION_TABLE + section_id * 8
        name_offset = rom_pointer_to_offset(read_u32(rom, entry_offset))
        if name_offset is None:
            return None
        end = rom.find(b"\xff", name_offset)
        if end < 0:
            return None
        return title_case(decode_gen3_text(rom[name_offset : end + 1]))

    lookup: dict[str, str] = {}
    for group in range(0, 40):
        group_offset = rom_pointer_to_offset(read_u32(rom, MAP_GROUP_TABLE + group * 4))
        if group_offset is None:
            continue
        for map_number in range(0, 180):
            header_offset = rom_pointer_to_offset(read_u32(rom, group_offset + map_number * 4))
            if header_offset is None or header_offset + 21 >= len(rom):
                continue
            section_id = rom[header_offset + 20]
            name = section_name(section_id)
            if name:
                lookup[f"location-g{group:02d}-m{map_number:03d}"] = name
    return lookup


def normalize_pokemon_doc_name(value: str) -> str:
    replacements = {
        "Alolan": "Alola",
        "Galarian": "Galar",
        "Hisuian": "Hisui",
        "White": "White-Striped",
    }
    parts = value.strip().split("-")
    if len(parts) > 1:
        suffix = replacements.get(parts[-1], parts[-1])
        return f"{parts[0]} ({suffix})"
    return value.strip()


def build_pokemon_lookup(pokemon: list[dict]) -> dict[str, dict]:
    lookup: dict[str, dict] = {}
    for entry in pokemon:
        names = {
            entry["name"],
            entry.get("rawName", ""),
            entry["name"].replace(" (", "-").replace(")", ""),
            entry.get("rawName", "").replace(" (", "-").replace(")", ""),
        }
        for name in names:
            normalized = re.sub(r"[^a-z0-9]+", "", name.lower())
            if normalized:
                lookup.setdefault(normalized, entry)
    return lookup


def split_location_fragments(value: str) -> list[str]:
    normalized = value.replace("\n", " ")
    normalized = re.sub(r"\s+", " ", normalized)
    return [part.strip() for part in normalized.split(",") if part.strip()]


def normalize_location_fragment(fragment: str, previous_method: str | None, previous_route_prefix: str | None):
    raw = fragment.strip()
    lower = raw.lower()

    if not raw:
        return None

    if re.search(r"\b(use|stone|trade|evolv|level up|hatch|breed)\b", lower):
        return None

    method = previous_method
    method_patterns = [
        (r"\bold\s+rod\b", "Old Rod"),
        (r"\bgood\s+rod\b", "Good Rod"),
        (r"\bsuper\s+rod\b|\bsuper\s+route\b", "Super Rod"),
        (r"\bsurf\b", "Surf"),
        (r"\brock\s+smash\b", "Rock Smash"),
        (r"\bevent\b", "Event"),
        (r"\btrade\b", "Trade"),
    ]
    for pattern, label in method_patterns:
        if re.search(pattern, lower):
            method = label
            raw = re.sub(pattern, "", raw, flags=re.I).strip()
            lower = raw.lower()
            break

    raw = re.sub(r"^(in|at|on)\s+", "", raw, flags=re.I).strip()
    raw = re.sub(r"\s+", " ", raw)

    if re.fullmatch(r"[A-F]", raw, re.I) and previous_route_prefix == "Route":
        raw = f"Route {raw.upper()}"

    route_number = re.fullmatch(r"(\d+)", raw)
    if route_number and previous_route_prefix == "Route":
        raw = f"Route {route_number.group(1)}"

    parent = None
    area = None

    route_match = re.match(r"^route\s+([A-F]|\d+)\b(?:\s+(.+))?$", raw, re.I)
    if route_match:
        parent = f"Route {route_match.group(1).upper()}"
        area = title_case(route_match.group(2) or method or "Main Area")
        return parent, area, method, "Route"

    safari_match = re.match(r"^safari(?:\s+zone)?(?:\s+(.+))?$", raw, re.I)
    if safari_match or re.match(r"^safari\s+entrance$", raw, re.I):
        parent = "Safari Zone"
        area_text = safari_match.group(1) if safari_match else "Entrance"
        area = title_case(area_text or "Entrance").replace("Sandstorm Area", "Sandstorm Area")
        return parent, area, method, previous_route_prefix

    lazulan_match = re.match(r"^lazulan(?:\s+city)?(?:\s+(.+))?$", raw, re.I)
    if lazulan_match:
        parent = "Lazulan City"
        area = title_case(lazulan_match.group(1) or "Main Area")
        return parent, area, method, previous_route_prefix

    goldenvine_match = re.match(r"^goldenvine\s+sea$", raw, re.I)
    if goldenvine_match:
        return "Goldenvine Sea", title_case(method or "Main Area"), method, previous_route_prefix

    underwater_route = re.match(r"^underwater\s+(\d+)$", raw, re.I)
    if underwater_route:
        return f"Route {underwater_route.group(1)}", "Underwater", "Underwater", "Route"

    if re.match(r"^underwater(?:\s+caves?)?$", raw, re.I):
        # Generic underwater notes do not name a parent route/city. The ROM-backed
        # underwater maps provide the parent assignment used by the app.
        return None

    known_simple = {
        "whirl islands": "Whirl Islands",
        "union cave": "Union Cave",
        "dark cave": "Dark Cave",
        "ice path": "Ice Path",
        "ilex forest": "Ilex Forest",
        "tohjo falls": "Tohjo Falls",
        "ruins of alph": "Ruins of Alph",
        "olivine": "Olivine",
        "newbark": "New Bark",
        "cherrygrove": "Cherrygrove",
        "violet": "Violet",
        "ecruteak": "Ecruteak",
        "cianwood": "Cianwood",
        "blackthorn": "Blackthorn",
        "darkoal": "Darkoal Town",
        "darkoal town": "Darkoal Town",
        "goldenrod sewer": "Goldenrod Sewer",
        "roujem": "Roujem City",
        "roujem city": "Roujem City",
        "roujem shipyard": "Roujem Shipyard",
        "apricotta": "Apricotta Beach",
        "apricotta beach": "Apricotta Beach",
        "phoenix hideout": "Phoenix Hideout",
        "mt tempest": "Mt. Tempest",
        "mt mortar": "Mt. Mortar",
        "mt silver": "Mt. Silver",
        "national park": "National Park",
    }

    for key, name in known_simple.items():
        if lower == key:
            return name, title_case(method or "Main Area"), method, previous_route_prefix
        if lower.startswith(key + " "):
            return name, title_case(raw[len(key) :].strip()), method, previous_route_prefix

    return None


def location_entry(parent: str, area: str) -> dict:
    label = parent if area == "Main Area" else f"{parent} {area}"
    slug = slugify(label)
    return {
        "id": f"location-doc-{slug}",
        "slug": f"doc-{slug}",
        "name": label,
        "region": "Documentation",
        "description": "Documentation-backed location note from attached location/item references; not a ROM map assertion.",
    }


def main() -> None:
    pokemon = load_json("pokemon.json")
    items = load_json("items.json")
    locations = load_json("locations.json")
    item_locations = load_json("item-locations.json")

    pokemon_lookup = build_pokemon_lookup(pokemon)
    item_ids = {entry["id"] for entry in items}
    location_by_id = {entry["id"]: entry for entry in locations}
    item_location_keys = {(entry["itemId"], entry["locationId"], entry["notes"]) for entry in item_locations}
    documented_pokemon: list[dict] = []
    documented_keys = set()

    def ensure_location(parent: str, area: str) -> str:
        entry = location_entry(parent, area)
        if entry["id"] not in location_by_id:
            locations.append(entry)
            location_by_id[entry["id"]] = entry
        return entry["id"]

    with POKEMON_DOC_ROWS.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            raw_name = row["pokemon"].strip()
            raw_location = row["location"].strip()
            if not raw_name or not raw_location:
                continue
            display_name = normalize_pokemon_doc_name(raw_name)
            pokemon_entry = pokemon_lookup.get(re.sub(r"[^a-z0-9]+", "", display_name.lower()))
            if not pokemon_entry:
                continue

            previous_method = None
            previous_route_prefix = None
            for fragment in split_location_fragments(raw_location):
                parsed = normalize_location_fragment(fragment, previous_method, previous_route_prefix)
                if parsed is None:
                    continue
                parent, area, method, route_prefix = parsed
                previous_method = method or previous_method
                previous_route_prefix = route_prefix or previous_route_prefix
                location_id = location_entry(parent, area)["id"]
                key = (pokemon_entry["id"], location_id, method or "Documented")
                if key in documented_keys:
                    continue
                documented_keys.add(key)
                documented_pokemon.append(
                    {
                        "id": f"docmon-{pokemon_entry['id']}-{slugify(parent + '-' + area + '-' + (method or 'documented'))}",
                        "pokemonId": pokemon_entry["id"],
                        "pokemonName": pokemon_entry["name"],
                        "locationId": location_id,
                        "parentName": parent,
                        "areaLabel": area,
                        "method": method or "Documented",
                        "sourceText": raw_location,
                        "sourceReference": f"Attached Pokémon location sheet row {row['row']}",
                    }
                )

    with ITEM_DOC_ROWS.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            definition = (row["item_or_move"].strip() or row["label"].strip())
            raw_location = row["location_note"].strip()
            match = re.search(r"\b(\d+)\b", definition)
            if not match or not raw_location:
                continue
            item_id = f"item-{int(match.group(1)):04d}"
            if item_id not in item_ids:
                continue

            previous_method = None
            previous_route_prefix = None
            for fragment in split_location_fragments(raw_location):
                parsed = normalize_location_fragment(fragment, previous_method, previous_route_prefix)
                if parsed is None:
                    continue
                parent, area, method, route_prefix = parsed
                previous_method = method or previous_method
                previous_route_prefix = route_prefix or previous_route_prefix
                location_id = ensure_location(parent, area)
                note = f"Documentation-backed location: {parent}{'' if area == 'Main Area' else ' - ' + area}. Source: attached ScorchedSilver_Items.xls row {row['row']}; not ROM-backed."
                key = (item_id, location_id, note)
                if key in item_location_keys:
                    continue
                item_location_keys.add(key)
                item_locations.append(
                    {
                        "id": f"docitem-{item_id.removeprefix('item-')}-{slugify(parent + '-' + area)}-{row['row']}",
                        "itemId": item_id,
                        "locationId": location_id,
                        "notes": note,
                    }
                )

    rom_section_lookup = build_rom_map_section_lookup()
    for location in locations:
        section_name = rom_section_lookup.get(location["id"])
        if section_name:
            location["name"] = section_name
            location["slug"] = f"{slugify(section_name)}-{location['id'].replace('location-', '')}"
            location["description"] = f"ROM map section: {section_name}."

        override = ROM_CONTEXT_LOCATION_OVERRIDES.get(location["id"])
        if override:
            override_name, evidence = override
            location["name"] = override_name
            location["slug"] = f"{slugify(override_name)}-{location['id'].replace('location-', '')}"
            location["description"] = f"ROM script/warp context: {evidence}"

    item_location_ids = {entry["locationId"] for entry in item_locations}
    locations = [
        entry
        for entry in locations
        if not entry["id"].startswith("location-doc-") or entry["id"] in item_location_ids
    ]

    locations.sort(key=lambda entry: entry["id"])
    item_locations.sort(key=lambda entry: entry["id"])
    documented_pokemon.sort(key=lambda entry: (entry["parentName"], entry["areaLabel"], entry["pokemonName"], entry["method"]))

    write_json("locations.json", locations)
    write_json("item-locations.json", item_locations)
    write_json("documented-pokemon-locations.json", documented_pokemon)

    print(f"locations={len(locations)}")
    print(f"item_locations={len(item_locations)}")
    print(f"documented_pokemon_locations={len(documented_pokemon)}")


if __name__ == "__main__":
    main()
