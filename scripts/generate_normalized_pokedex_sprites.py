from __future__ import annotations

import json
import re
import ssl
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
POKEMON_JSON = ROOT / "public" / "data" / "pokemon.json"
ASSETS_TS = ROOT / "src" / "lib" / "assets.ts"
OUT_DIR = ROOT / "public" / "sprites" / "pokedex-normalized"

CANVAS_SIZE = 90
TARGET_VISIBLE_AREA = 4300
MAX_OCCUPANCY = 82
POKEAPI_SPRITE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{dex}.png"
SHOWDOWN_SPRITE = "https://play.pokemonshowdown.com/sprites/gen5/{slug}.png"


def normalize_slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def showdown_base_slug(name: str) -> str:
    special = {
        "Nidoran[f]": "nidoranf",
        "Nidoran[m]": "nidoranm",
        "Farfetch'd": "farfetchd",
        "Mr. Mime": "mrmime",
        "Mime Jr.": "mimejr",
        "Flabébé": "flabebe",
        "Sirfetch'd": "sirfetchd",
        "Mr. Rime": "mrrime",
        "Polteageis": "polteageist",
    }
    return special.get(name, normalize_slug(name).replace("-", ""))


def parse_ts_number_map(name: str) -> dict[int, str]:
    text = ASSETS_TS.read_text(encoding="utf-8")
    match = re.search(rf"const {re.escape(name)}:[^=]+=\s*\{{(.*?)\}};", text, re.S)
    if not match:
        return {}
    return {int(key): value for key, value in re.findall(r"(\d+):\s*['\"]([^'\"]+)['\"]", match.group(1))}


CUSTOM_SOURCES = parse_ts_number_map("customPokemonSpriteSources")
EXPANDED_SLUGS = parse_ts_number_map("expandedPokemonSpriteSlugs")

TYPE_FORM_NAMES = [
    "fighting",
    "flying",
    "poison",
    "ground",
    "rock",
    "bug",
    "ghost",
    "steel",
    "fire",
    "water",
    "grass",
    "electric",
    "psychic",
    "ice",
    "dragon",
    "dark",
    "fairy",
]

for index, type_name in enumerate(TYPE_FORM_NAMES):
    EXPANDED_SLUGS[1073 + index] = f"arceus-{type_name}"
    EXPANDED_SLUGS[1176 + index] = f"silvally-{type_name}"

UNOWN_FORMS = [
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "exclamation",
    "question",
]

for index, form_name in enumerate(UNOWN_FORMS):
    EXPANDED_SLUGS[1024 + index] = f"unown-{form_name}"

VIVILLON_FORMS = [
    "archipelago",
    "continental",
    "elegant",
    "garden",
    "highplains",
    "icysnow",
    "jungle",
    "marine",
    "modern",
    "monsoon",
    "ocean",
    "polar",
    "river",
    "sandstorm",
    "savanna",
    "sun",
    "tundra",
    "pokeball",
    "fancy",
]

for index, form_name in enumerate(VIVILLON_FORMS):
    EXPANDED_SLUGS[1114 + index] = f"vivillon-{form_name}"

FLOWER_FORMS = ["yellow", "orange", "blue", "white"]
for index, form_name in enumerate(FLOWER_FORMS):
    EXPANDED_SLUGS[1133 + index] = f"flabebe-{form_name}"
    EXPANDED_SLUGS[1138 + index] = f"floette-{form_name}"
    EXPANDED_SLUGS[1142 + index] = f"florges-{form_name}"

FURFROU_FORMS = ["heart", "star", "diamond", "debutante", "matron", "dandy", "lareine", "kabuki", "pharaoh"]
for index, form_name in enumerate(FURFROU_FORMS):
    EXPANDED_SLUGS[1146 + index] = f"furfrou-{form_name}"

ALCREMIE_FORMS = ["rubycream", "matchacream", "mintcream", "lemoncream", "saltedcream", "rubyswirl", "caramelswirl", "rainbowswirl"]
for index, form_name in enumerate(ALCREMIE_FORMS):
    EXPANDED_SLUGS[1216 + index] = f"alcremie-{form_name}"


def read_image(source: str) -> Image.Image:
    if source.startswith("/"):
        return Image.open(ROOT / "public" / source.lstrip("/")).convert("RGBA")

    request = urllib.request.Request(source, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=10, context=ssl._create_unverified_context()) as response:
        return Image.open(BytesIO(response.read())).convert("RGBA")


def normalize_image(image: Image.Image) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    if not bbox:
        return canvas

    cropped = image.crop(bbox)
    width, height = cropped.size
    area_scale = (TARGET_VISIBLE_AREA / (width * height)) ** 0.5
    max_dimension_scale = MAX_OCCUPANCY / max(width, height)
    scale = min(area_scale, max_dimension_scale)
    size = (max(1, round(width * scale)), max(1, round(height * scale)))
    resample = Image.Resampling.NEAREST if max(width, height) <= 160 else Image.Resampling.LANCZOS
    resized = cropped.resize(size, resample)
    canvas.alpha_composite(resized, ((CANVAS_SIZE - size[0]) // 2, (CANVAS_SIZE - size[1]) // 2))
    return canvas


def candidates_for(entry: dict) -> list[str]:
    dex = int(entry["dexNumber"])
    name = entry.get("name") or entry.get("slug") or str(dex)
    candidates: list[str] = []

    if dex in CUSTOM_SOURCES:
        candidates.append(CUSTOM_SOURCES[dex])

    if dex >= 906:
        expanded_slug = EXPANDED_SLUGS.get(dex) or normalize_slug(name)
        candidates.append(SHOWDOWN_SPRITE.format(slug=expanded_slug))

    if name == "Pichu":
        candidates.append(POKEAPI_SPRITE.format(dex=172))
    elif name == "Unown":
        letter_match = re.search(r"-(\d+)-unown", entry.get("slug", ""))
        candidates.append(SHOWDOWN_SPRITE.format(slug="unown"))
    elif dex < 906:
        candidates.append(SHOWDOWN_SPRITE.format(slug=showdown_base_slug(name)))
        candidates.append(POKEAPI_SPRITE.format(dex=dex))
    else:
        # Last resort: use the base species name sprite when a form-specific sprite is not available.
        candidates.append(SHOWDOWN_SPRITE.format(slug=normalize_slug(name)))

    return list(dict.fromkeys(candidates))


def build_one(entry: dict) -> tuple[int, str, str | None]:
    dex = int(entry["dexNumber"])
    out = OUT_DIR / f"{dex:04d}.png"
    errors: list[str] = []

    for source in candidates_for(entry):
        try:
            image = read_image(source)
            normalize_image(image).save(out)
            return dex, source, None
        except Exception as error:
            errors.append(f"{source} ({type(error).__name__}: {error!r})")

    fallback = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    fallback.save(out)
    return dex, "", "; ".join(errors[:3])


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    pokemon = json.loads(POKEMON_JSON.read_text(encoding="utf-8"))
    generated: list[tuple[int, str, str | None]] = []

    for entry in pokemon:
        generated.append(build_one(entry))

    failures = [f"{dex}: {error}" for dex, _source, error in generated if error]
    report = {
        "generated": len(generated),
        "failed": failures,
        "canvas_size": CANVAS_SIZE,
        "target_visible_area": TARGET_VISIBLE_AREA,
        "max_occupancy": MAX_OCCUPANCY,
    }
    (OUT_DIR / "manifest.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({**report, "failed": failures[:20]}, indent=2))


if __name__ == "__main__":
    main()
