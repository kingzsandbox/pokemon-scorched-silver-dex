import { getTrainerImageSrcByCanonicalRule, getTrainerImageSrcById, getTrainerImageSrcByManifestReuse } from './data/trainer-images';
import type { ItemEntry, PokemonEntry } from './types';

type TrainerImageTarget = {
  trainerId: string;
  trainerSlug?: string | null;
  ruleset?: string | null;
  source?: string | null;
  location?: string | null;
  trainerName?: string | null;
};

export type TrainerPortraitLayout = 'single' | 'duo';

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function fallbackPanelSvg(background: string): string {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="18" fill="${background}" />
      <rect x="18" y="18" width="60" height="60" rx="14" fill="rgba(255,255,255,0.18)" />
    </svg>
  `);
}

const pokemonFallbackPanel = fallbackPanelSvg('#d7dee9');
const expandedFormStart = 906;
const showdownDexSpriteBase = "https://play.pokemonshowdown.com/sprites/gen5";

const customPokemonSpriteSources: Record<number, string> = {
  913: "/sprites/pokemon-forms/slowbro-mega.png",
  997: "/sprites/pokemon-forms/typhlosion-hisui.png",
  978: "/sprites/pokemon-forms/slowbro-galar.png",
  985: "/sprites/pokemon-forms/slowking-galar.png",
  1234: "/sprites/scorched-custom/mega-typhlosion.png",
  1235: "/sprites/scorched-custom/mega-meganium.png",
  1236: "/sprites/scorched-custom/mega-feraligatr.png",
  1237: "/sprites/scorched-custom/mega-typhlosion-hisui.png",
};

function getNormalizedPokedexSprite(dexNumber: number): string {
  return `/sprites/pokedex-normalized/${String(dexNumber).padStart(4, "0")}.png?v=area-normalized-20260530`;
}

const expandedPokemonSpriteSlugs: Record<number, string> = {
  906: "venusaur-mega",
  907: "charizard-megax",
  908: "charizard-megay",
  909: "blastoise-mega",
  910: "beedrill-mega",
  911: "pidgeot-mega",
  912: "alakazam-mega",
  913: "slowbro-mega",
  914: "gengar-mega",
  915: "kangaskhan-mega",
  916: "pinsir-mega",
  917: "gyarados-mega",
  918: "aerodactyl-mega",
  919: "mewtwo-megax",
  920: "mewtwo-megay",
  921: "ampharos-mega",
  922: "steelix-mega",
  923: "scizor-mega",
  924: "heracross-mega",
  925: "houndoom-mega",
  926: "tyranitar-mega",
  927: "sceptile-mega",
  928: "blaziken-mega",
  929: "swampert-mega",
  930: "gardevoir-mega",
  931: "sableye-mega",
  932: "mawile-mega",
  933: "aggron-mega",
  934: "medicham-mega",
  935: "manectric-mega",
  936: "sharpedo-mega",
  937: "camerupt-mega",
  938: "altaria-mega",
  939: "banette-mega",
  940: "absol-mega",
  941: "glalie-mega",
  942: "salamence-mega",
  943: "metagross-mega",
  944: "latias-mega",
  945: "latios-mega",
  946: "lopunny-mega",
  947: "garchomp-mega",
  948: "lucario-mega",
  949: "abomasnow-mega",
  950: "gallade-mega",
  951: "audino-mega",
  952: "diancie-mega",
  953: "rayquaza-mega",
  954: "kyogre-primal",
  955: "groudon-primal",
  956: "rattata-alola",
  957: "raticate-alola",
  958: "raichu-alola",
  959: "sandshrew-alola",
  960: "sandslash-alola",
  961: "vulpix-alola",
  962: "ninetales-alola",
  963: "diglett-alola",
  964: "dugtrio-alola",
  965: "meowth-alola",
  966: "persian-alola",
  967: "geodude-alola",
  968: "graveler-alola",
  969: "golem-alola",
  970: "grimer-alola",
  971: "muk-alola",
  972: "exeggutor-alola",
  973: "marowak-alola",
  974: "meowth-galar",
  975: "ponyta-galar",
  976: "rapidash-galar",
  977: "slowpoke-galar",
  978: "slowbro-galar",
  979: "farfetchd-galar",
  980: "weezing-galar",
  981: "mrmime-galar",
  982: "articuno-galar",
  983: "zapdos-galar",
  984: "moltres-galar",
  985: "slowking-galar",
  986: "corsola-galar",
  987: "zigzagoon-galar",
  988: "linoone-galar",
  989: "darumaka-galar",
  990: "darmanitan-galar",
  991: "yamask-galar",
  992: "stunfisk-galar",
  993: "growlithe-hisui",
  994: "arcanine-hisui",
  995: "voltorb-hisui",
  996: "electrode-hisui",
  997: "typhlosion-hisui",
  998: "qwilfish-hisui",
  999: "sneasel-hisui",
  1000: "samurott-hisui",
  1001: "lilligant-hisui",
  1002: "zorua-hisui",
  1003: "zoroark-hisui",
  1004: "braviary-hisui",
  1005: "sliggoo-hisui",
  1006: "goodra-hisui",
  1007: "avalugg-hisui",
  1008: "decidueye-hisui",
  1009: "pikachu-rockstar",
  1010: "pikachu-belle",
  1011: "pikachu-popstar",
  1012: "pikachu-phd",
  1013: "pikachu-libre",
  1014: "pikachu-cosplay",
  1015: "pikachu-original",
  1016: "pikachu-hoenn",
  1017: "pikachu-sinnoh",
  1018: "pikachu-unova",
  1019: "pikachu-kalos",
  1020: "pikachu-alola",
  1021: "pikachu-partner",
  1022: "pikachu-world",
  1023: "pichu-spiky-eared",
  1051: "castform-sunny",
  1052: "castform-rainy",
  1053: "castform-snowy",
  1054: "deoxys-attack",
  1055: "deoxys-defense",
  1056: "deoxys-speed",
  1057: "burmy-sandy",
  1058: "burmy-trash",
  1059: "wormadam-sandy",
  1060: "wormadam-trash",
  1061: "cherrim-sunshine",
  1062: "shellos-east",
  1063: "gastrodon-east",
  1064: "rotom-heat",
  1065: "rotom-wash",
  1066: "rotom-frost",
  1067: "rotom-fan",
  1068: "rotom-mow",
  1069: "dialga-origin",
  1070: "palkia-origin",
  1071: "giratina-origin",
  1072: "shaymin-sky",
  1090: "basculin-bluestriped",
  1091: "basculin-whitestriped",
  1092: "darmanitan-zen",
  1093: "darmanitan-galarzen",
  1094: "deerling-summer",
  1095: "deerling-autumn",
  1096: "deerling-winter",
  1097: "sawsbuck-summer",
  1098: "sawsbuck-autumn",
  1099: "sawsbuck-winter",
  1100: "tornadus-therian",
  1101: "thundurus-therian",
  1102: "landorus-therian",
  1103: "enamorus-therian",
  1104: "kyurem-white",
  1105: "kyurem-black",
  1106: "keldeo-resolute",
  1107: "meloetta-pirouette",
  1108: "genesect-douse",
  1109: "genesect-shock",
  1110: "genesect-burn",
  1111: "genesect-chill",
  1112: "greninja-bond",
  1113: "greninja-ash",
  1137: "floette-eternal",
  1155: "meowstic-f",
  1156: "aegislash-blade",
  1157: "pumpkaboo-small",
  1158: "pumpkaboo-large",
  1159: "pumpkaboo-super",
  1160: "gourgeist-small",
  1161: "gourgeist-large",
  1162: "gourgeist-super",
  1163: "xerneas-neutral",
  1164: "zygarde-10",
  1165: "zygarde-complete",
  1166: "zygarde-10-power-construct",
  1167: "zygarde-complete",
  1168: "hoopa-unbound",
  1169: "oricorio-pompom",
  1170: "oricorio-pau",
  1171: "oricorio-sensu",
  1172: "rockruff-own-tempo",
  1173: "lycanroc-midnight",
  1174: "lycanroc-dusk",
  1175: "wishiwashi-school",
  1193: "minior-orange",
  1194: "minior-yellow",
  1195: "minior-green",
  1196: "minior-blue",
  1197: "minior-indigo",
  1198: "minior-violet",
  1199: "minior-red",
  1200: "minior-orange",
  1201: "minior-yellow",
  1202: "minior-green",
  1203: "minior-blue",
  1204: "minior-indigo",
  1205: "minior-violet",
  1206: "mimikyu-busted",
  1207: "necrozma-duskmane",
  1208: "necrozma-dawnwings",
  1209: "necrozma-ultra",
  1210: "magearna-original",
  1211: "cramorant-gulping",
  1212: "cramorant-gorging",
  1213: "toxtricity-lowkey",
  1214: "sinistea-antique",
  1215: "polteageist-antique",
  1224: "eiscue-noice",
  1225: "indeedee-f",
  1226: "morpeko-hangry",
  1227: "zacian-crowned",
  1228: "zamazenta-crowned",
  1229: "eternatus-eternamax",
  1230: "urshifu-rapidstrike",
  1231: "zarude-dada",
  1232: "calyrex-ice",
  1233: "calyrex-shadow",
  1235: "meganium-mega",
  1236: "feraligatr-mega",
  1237: "typhlosion-hisui",
};

const typeFormNames = [
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
];

for (let index = 0; index < typeFormNames.length; index += 1) {
  expandedPokemonSpriteSlugs[1073 + index] = `arceus-${typeFormNames[index]}`;
  expandedPokemonSpriteSlugs[1176 + index] = `silvally-${typeFormNames[index]}`;
}

const unownForms = [
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
];

for (let index = 0; index < unownForms.length; index += 1) {
  expandedPokemonSpriteSlugs[1024 + index] = `unown-${unownForms[index]}`;
}

const vivillonForms = [
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
];

for (let index = 0; index < vivillonForms.length; index += 1) {
  expandedPokemonSpriteSlugs[1114 + index] = `vivillon-${vivillonForms[index]}`;
}

const flowerForms = ["yellow", "orange", "blue", "white"];
for (let index = 0; index < flowerForms.length; index += 1) {
  expandedPokemonSpriteSlugs[1133 + index] = `flabebe-${flowerForms[index]}`;
  expandedPokemonSpriteSlugs[1138 + index] = `floette-${flowerForms[index]}`;
  expandedPokemonSpriteSlugs[1142 + index] = `florges-${flowerForms[index]}`;
}

const furfrouForms = ["heart", "star", "diamond", "debutante", "matron", "dandy", "lareine", "kabuki", "pharaoh"];
for (let index = 0; index < furfrouForms.length; index += 1) {
  expandedPokemonSpriteSlugs[1146 + index] = `furfrou-${furfrouForms[index]}`;
}

const alcremieForms = ["rubycream", "matchacream", "mintcream", "lemoncream", "saltedcream", "ruby swirl", "caramel swirl", "rainbow swirl"];
for (let index = 0; index < alcremieForms.length; index += 1) {
  expandedPokemonSpriteSlugs[1216 + index] = `alcremie-${alcremieForms[index].replace(/\s+/g, "")}`;
}

function normalizeAssetSlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const supplementalItemSpriteOverrides: Record<string, string> = {
  "adventure-rules": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/town-map.png",
  nugget: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/nugget.png",
  pearl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pearl.png",
  "big-pearl": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/big-pearl.png",
  stardust: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/stardust.png",
  "star-piece": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/star-piece.png",
  "relic-band": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-band.png",
  "relic-copper": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-copper.png",
  "relic-silver": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-silver.png",
  "relic-gold": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-gold.png",
  "relic-vase": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-vase.png",
  "relic-crown": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-crown.png",
  "relic-statue": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-statue.png",
  bicycle: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/bicycle.png",
  "dowsing-machine": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dowsing-machine.png",
  "exp-share": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/exp-share.png",
  "good-rod": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/good-rod.png",
  "dna-splicers": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dna-splicers.png",
  "old-rod": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/old-rod.png",
  "super-rod": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-rod.png",
  "mega-ring": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mega-ring.png",
  "town-map": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/town-map.png",
  "vs-recorder": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/vs-recorder.png",
  "holo-caster": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tea.png",
  "lens-case": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/scope-lens.png",
  "deep-sea-tooth": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/deep-sea-tooth.png",
  "kings-rock": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kings-rock.png",
  sachet: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sachet.png",
  "whipped-dream": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/whipped-dream.png",
  protector: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/protector.png",
  electirizer: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/electirizer.png",
  magmarizer: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/magmarizer.png",
  "reaper-cloth": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/reaper-cloth.png",
  "dubious-disc": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dubious-disc.png",
  "razor-fang": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/razor-fang.png",
  "x-attack": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-attack.png",
  "x-defense": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-defense.png",
  "x-sp-atk": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-sp-atk.png",
  "x-sp-def": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-sp-def.png",
  "x-speed": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-speed.png",
  "x-accuracy": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-accuracy.png",
  "king-s-rock": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kings-rock.png",
  "cell-key": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/card-key.png",
  "key-to-room-1": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/storage-key.png",
  "key-to-room-2": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/storage-key.png",
  "key-to-room-4": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/storage-key.png",
  "key-to-room-6": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/storage-key.png",
  charizarditex: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/charizardite-x.png",
  charizarditey: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/charizardite-y.png",
  feraligatite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/blastoisinite.png",
  meganiumite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/venusaurite.png",
  typhlosionite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/charizardite-x.png",
  protectvepads: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/protective-pads.png",
  ragecandybar: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rage-candy-bar.png",
  abilitycapsle: "https://archives.bulbagarden.net/wiki/Special:Redirect/file/Bag_Ability_Capsule_Sprite.png",
  abilitypatch: "https://archives.bulbagarden.net/wiki/Special:Redirect/file/Bag_Ability_Patch_Sprite.png",
  adrenalineorb: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/adrenaline-orb.png",
  blundrpolicy: "https://archives.bulbagarden.net/wiki/Special:Redirect/file/Bag_Blunder_Policy_Sprite.png",
  galaricacuff: "https://archives.bulbagarden.net/wiki/Special:Redirect/file/Bag_Galarica_Cuff_Sprite.png",
  galrcawreath: "https://archives.bulbagarden.net/wiki/Special:Redirect/file/Bag_Galarica_Wreath_Sprite.png",
  goldbottlcap: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/gold-bottle-cap.png",
  "heavy-dtybts": "https://archives.bulbagarden.net/wiki/Special:Redirect/file/Bag_Heavy-Duty_Boots_Sprite.png",
  "peat-block": "https://archives.bulbagarden.net/wiki/Special:Redirect/file/Bag_Peat_Block_LA_Sprite.png",
  strwbrysweet: "https://archives.bulbagarden.net/wiki/Special:Redirect/file/Bag_Strawberry_Sweet_Sprite.png",
  terainextendr: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/terrain-extender.png",
  "throat-spray": "https://archives.bulbagarden.net/wiki/Special:Redirect/file/Bag_Throat_Spray_Sprite.png",
  "trade-stone": "https://archives.bulbagarden.net/wiki/Special:Redirect/file/Bag_Linking_Cord_LA_Sprite.png",
  utltyumbrlla: "https://archives.bulbagarden.net/wiki/Special:Redirect/file/Bag_Utility_Umbrella_Sprite.png",
  weaknsspolicy: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/weakness-policy.png",
  "never-meltice": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/never-melt-ice.png",
};

function isLikelyDuoName(name: string | null | undefined): boolean {
  if (!name) {
    return false;
  }

  return (
    name.includes(' & ') ||
    name.includes(' / ') ||
    name.includes('Calem / Serena') ||
    name.includes('Grunts (') ||
    name.startsWith('Twins ') ||
    name.includes('Family ')
  );
}

function determineTrainerPortraitLayout(trainerName: string | null | undefined): TrainerPortraitLayout {
  if (isLikelyDuoName(trainerName)) {
    return 'duo';
  }

  return 'single';
}

function extractMachineLabel(item: Pick<ItemEntry, 'name'>): { code: string; moveName: string | null } | null {
  const match = item.name.match(/^(TM|HM)\d+\s*\[(.+)\]$/i);
  if (match) {
    return {
      code: match[1].toUpperCase() + item.name.match(/\d+/)?.[0],
      moveName: match[2]?.trim() ?? null,
    };
  }

  const plainMachineMatch = item.name.match(/^(TM|HM)\d+$/i);
  if (!plainMachineMatch) {
    return null;
  }

  return {
    code: plainMachineMatch[0].toUpperCase(),
    moveName: null,
  };
}

function getMachineItemImageSrc(item: Pick<ItemEntry, 'name'>): string {
  return `/sprites/tm-types/normal.png`;
}

function getCanonicalItemAssetSlug(item: Pick<ItemEntry, 'name' | 'slug'>): string {
  const cleanSlug = item.slug.replace(/^item-\d+-/, "").replace(/^\d+-/, "");
  const cleanName = item.name.replace(/\s*\[(.+?)\]/g, " $1").replace(/\s+/g, " ").trim();
  return normalizeAssetSlug(cleanName) || normalizeAssetSlug(cleanSlug);
}

function getBulbagardenItemSpriteSrc(item: Pick<ItemEntry, 'name'>): string {
  const cleanName = item.name.replace(/\s*\[(.+?)\]/g, " $1").replace(/\s+/g, " ").trim();
  const fileName = `Bag_${cleanName.replace(/[.']/g, "").replace(/\s+/g, "_")}_Sprite.png`;
  return `https://archives.bulbagarden.net/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}`;
}

function getShowdownDexSprite(slug: string): string {
  return `${showdownDexSpriteBase}/${slug}.png`;
}

function getExpandedPokemonSpriteSlug(pokemon: Pick<PokemonEntry, 'name' | 'dexNumber'>): string {
  return expandedPokemonSpriteSlugs[pokemon.dexNumber] ?? normalizeAssetSlug(pokemon.name);
}

export function getPokemonPrimaryArt(pokemon: PokemonEntry): {
  src: string;
  shinySrc: string | null;
  fallbackSrc: string | null;
  visualScale: number;
} {
  if (pokemon.dexNumber >= expandedFormStart) {
    return {
      src: getNormalizedPokedexSprite(pokemon.dexNumber),
      shinySrc: null,
      fallbackSrc: pokemonFallbackPanel,
      visualScale: 1,
    };
  }

  return {
    src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.dexNumber}.png`,
    shinySrc: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.dexNumber}.png`,
    fallbackSrc: pokemonFallbackPanel,
    visualScale: 1,
  };
}

export function getPokemonMiniSprite(
  pokemon: Pick<PokemonEntry, 'id' | 'dexNumber'> & Partial<Pick<PokemonEntry, 'name'>>,
): string | null {
  return getNormalizedPokedexSprite(pokemon.dexNumber);
}

export function getPokemonMiniSpriteSources(
  pokemon: Pick<PokemonEntry, 'id' | 'dexNumber'> & Partial<Pick<PokemonEntry, 'name'>>,
): { src: string | null; fallbackSrc: string; visualScale: number } {
  return {
    src: getPokemonMiniSprite(pokemon),
    fallbackSrc: pokemonFallbackPanel,
    visualScale: 1,
  };
}

export function getBattlePokemonImageSources(
  pokemon: (Pick<PokemonEntry, 'id' | 'dexNumber'> & Partial<Pick<PokemonEntry, 'name'>>) | null,
): { src: string | null; fallbackSrc: string } {
  return {
    src: pokemon ? getPokemonMiniSprite(pokemon) : null,
    fallbackSrc: pokemonFallbackPanel,
  };
}

export function getItemImageSources(item: ItemEntry): { src: string | null; fallbackSrc: string } {
  const machine = extractMachineLabel(item);

  if (machine) {
    const machineSrc = getMachineItemImageSrc(item);
    return {
      src: machineSrc,
      fallbackSrc: machineSrc,
    };
  }

  const canonicalSlug = getCanonicalItemAssetSlug(item);
  const overrideSrc = supplementalItemSpriteOverrides[item.slug] ?? supplementalItemSpriteOverrides[canonicalSlug];
  const publicArchiveSrc = getBulbagardenItemSpriteSrc(item);
  const remoteSpriteSrc =
    overrideSrc ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${canonicalSlug}.png`;

  return {
    src: remoteSpriteSrc,
    fallbackSrc: publicArchiveSrc,
  };
}

export function getTrainerImageSources(target: TrainerImageTarget): {
  src: string | null;
  layout: TrainerPortraitLayout;
} {
  const src =
    getTrainerImageSrcById(target.trainerId) ??
    getTrainerImageSrcByCanonicalRule(target.trainerName) ??
    getTrainerImageSrcByManifestReuse(target.trainerId, target.trainerName);
  return {
    src,
    layout: determineTrainerPortraitLayout(target.trainerName),
  };
}

export function getMoveTutorImageSource(machineCode: string, locationName: string | null | undefined): string | null {
  return null;
}
