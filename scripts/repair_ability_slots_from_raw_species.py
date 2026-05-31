from __future__ import annotations

import csv
import json
from pathlib import Path


FRONTEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = FRONTEND_ROOT.parent
LAB_ROOT = PROJECT_ROOT / "pokemon-resource-extraction-lab"

RAW_SPECIES = LAB_ROOT / "extracted_raw" / "raw_species_data_experimental.tsv"
ABILITIES_JSON = LAB_ROOT / "normalized_json" / "abilities.json"
POKEMON_JSON = FRONTEND_ROOT / "public" / "data" / "pokemon.json"


def load_ability_names() -> dict[int, str]:
    abilities = json.loads(ABILITIES_JSON.read_text(encoding="utf-8"))
    return {int(entry["id"]): entry["name"] for entry in abilities}


def parse_raw_species_ability_slots() -> dict[int, dict[str, int]]:
    slots: dict[int, dict[str, int]] = {}
    with RAW_SPECIES.open("r", encoding="utf-8", newline="") as raw_file:
        reader = csv.DictReader(raw_file, delimiter="\t")
        for row in reader:
            species_id = int(row["inferred_species_id"])
            raw = bytes.fromhex(row["raw_record_hex"])
            if len(raw) < 30:
                raise ValueError(f"Species {species_id} raw record is too short for ability slots.")

            # Scorched Silver stores three ability slots as u16 fields:
            # ability 1 at +0x18, ability 2 at +0x1A, hidden ability at +0x1C.
            slots[species_id] = {
                "ability1": int.from_bytes(raw[0x18:0x1A], "little"),
                "ability2": int.from_bytes(raw[0x1A:0x1C], "little"),
                "hiddenAbility": int.from_bytes(raw[0x1C:0x1E], "little"),
            }
    return slots


def ability_name(ability_id: int, ability_names: dict[int, str]) -> str | None:
    if ability_id == 0:
        return None
    name = ability_names.get(ability_id)
    if not name or name == "-------":
        raise ValueError(f"Ability id {ability_id} did not resolve to a usable ability name.")
    return name


def main() -> None:
    ability_names = load_ability_names()
    raw_slots = parse_raw_species_ability_slots()
    pokemon = json.loads(POKEMON_JSON.read_text(encoding="utf-8"))

    changed = 0
    for entry in pokemon:
        species_id = int(entry["dexNumber"])
        slots = raw_slots.get(species_id)
        if not slots:
            continue

        ability_slots = {
            "ability1": ability_name(slots["ability1"], ability_names),
            "ability2": ability_name(slots["ability2"], ability_names),
            "hiddenAbility": ability_name(slots["hiddenAbility"], ability_names),
        }
        visible_abilities = [
            value
            for value in (
                ability_slots["ability1"],
                ability_slots["ability2"],
                ability_slots["hiddenAbility"],
            )
            if value
        ]

        if entry.get("abilitySlots") != ability_slots or entry.get("abilities") != visible_abilities:
            changed += 1
            entry["abilitySlots"] = ability_slots
            entry["abilities"] = visible_abilities

    POKEMON_JSON.write_text(json.dumps(pokemon, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    count_ability2 = sum(1 for entry in pokemon if entry["abilitySlots"]["ability2"])
    count_hidden = sum(1 for entry in pokemon if entry["abilitySlots"]["hiddenAbility"])
    count_three = sum(
        1
        for entry in pokemon
        if entry["abilitySlots"]["ability1"]
        and entry["abilitySlots"]["ability2"]
        and entry["abilitySlots"]["hiddenAbility"]
    )
    print(f"Updated {changed} Pokemon records in {POKEMON_JSON}")
    print(f"Populated Ability 2 records: {count_ability2}")
    print(f"Populated Hidden Ability records: {count_hidden}")
    print(f"Populated all-three-slot records: {count_three}")


if __name__ == "__main__":
    main()
