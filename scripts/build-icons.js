// Generates js/icons.js: the SVG paths for every icon the game uses, plus the table
// that maps each emoji in the game's text to an icon and a colour.
// Icons: game-icons.net (CC BY 3.0). Run with: node scripts/build-icons.js
const fs = require('fs');
const path = require('path');
const set = require('@iconify-json/game-icons/icons.json');

const N = '#cfd6dd'; // neutral steel
const WOOD = '#c8935a', GOLD = '#f5c542', GREEN = '#6fcf6f', STONE = '#9aa0a8';
const MAP = {
  // ui
  '⚒': ['anvil', '#e0a458'], '👇': ['pointing', '#ffe08a'], '💨': ['sprint', '#9fd8ff'], '📣': ['shouting', '#ffb347'], '🪙': ['two-coins', GOLD], '🌲': ['pine-tree', '#3f9d5a'], '🛠': ['hammer-nails', '#d9a55b'],
  '🏪': ['shop', '#e08a3c'], '🏘': ['village', '#d98b5f'], '⚔': ['crossed-swords', N], '⬆': ['upgrade', GREEN],
  '📖': ['open-book', '#d9b98a'], '🌠': ['falling-star', '#ffd84a'], '⭐': ['round-star', '#ffd84a'], '🏅': ['medal', GOLD],
  '✉': ['envelope', '#e8d8a8'], '🔒': ['padlock', STONE], '❓': ['help', '#7d7468'], '▫': ['plain-circle', '#5a5148'],
  '🏆': ['trophy', GOLD], '👷': ['miner', '#e0a458'], '🔁': ['cycle', GREEN], '💡': ['light-bulb', '#ffd84a'],
  '📌': ['nails', N], '❤': ['hearts', '#e5484d'], '☠': ['skull-crossed-bones', '#e05050'], '✨': ['sparkles', '#ffd84a'],
  '💥': ['bright-explosion', '#ffb020'], '💫': ['knocked-out-stars', '#ffd84a'], '🌀': ['whirlwind', '#7fd0f0'],
  '🎁': ['locked-chest', GOLD], '⛺': ['camping-tent', '#e0a458'], '🧝': ['swordman', '#f6e7c8'], '🧳': ['rolling-suitcase', WOOD],
  '🐾': ['paw-print', '#d9a55b'], '➕': ['plant-seed', STONE], '🪧': ['wooden-sign', WOOD], '💰': ['coins-pile', GOLD],
  '📈': ['chart', GREEN], '📅': ['calendar', '#e8d8a8'], '🤝': ['shaking-hands', '#f0c8a0'], '💧': ['water-drop', '#5cb8f0'],
  '🎓': ['graduate-cap', '#b8a0e0'], '🚂': ['steam-locomotive', N], '🍽': ['knife-fork', N], '🍀': ['clover', '#58c07a'],
  '🧑‍🌾': ['scarecrow', '#d9a55b'], '💪': ['biceps', '#f0a070'], '🔪': ['bowie-knife', N], '🗣': ['talk', '#7fc8e0'],
  '🪓': ['wood-axe', N], '📒': ['notebook', '#d9b98a'], '🗺': ['treasure-map', '#e8d8a8'], '✍': ['quill-ink', '#d9b98a'],
  // raw resources
  '🪵': ['log', '#b07a45'], '🪨': ['stone-pile', STONE], '🌿': ['high-grass', '#6fbf5a'], '🫐': ['elderberry', '#7f8ff0'],
  '🟤': ['powder', '#b8754f'], '🏖': ['sand-castle', '#e3c98a'], '🌾': ['wheat', '#e6c44d'], '🟠': ['minerals', '#e08a4a'],
  '⚫': ['coal-pile', '#7a7a88'], '⚪': ['rock', '#c8ccd4'], '🐑': ['wool', '#f0ece0'], '🌱': ['herbs-bundle', '#58c07a'],
  '🟡': ['gold-nuggets', GOLD], '🔷': ['crystal-cluster', '#5cc8f0'],
  '🥕': ['carrot', '#f08a3c'], '🍅': ['tomato', '#e0503c'], '🎃': ['pumpkin', '#f0903c'], '🍇': ['grapes', '#a070e0'],
  '🌻': ['sunflower', GOLD], '🥚': ['big-egg', '#f0e8d8'], '🍯': ['honey-jar', '#f0b030'],
  // materials and goods
  '🟫': ['planks', WOOD], '🥢': ['wood-stick', '#d9b98a'], '🪢': ['rope-coil', '#d2b48c'], '🧺': ['basket', '#d9a55b'],
  '📦': ['wooden-crate', WOOD], '🔥': ['torch', '#ff9d3c'], '🧱': ['brick-pile', '#d0603f'], '🪟': ['window', '#9fd8e8'],
  '🟧': ['metal-bar', '#e08a4a'], '⬜': ['metal-bar', N], '🟨': ['gold-bar', GOLD], '⬛': ['metal-bar', '#7f93b0'],
  '🍞': ['bread', '#e0a458'], '🥧': ['pie-slice', '#d98b5f'], '🫙': ['mason-jar', '#d0507a'],
  '➰': ['wire-coil', '#e08a4a'], '⚙': ['cog', '#b8c0cc'], '🛡': ['checked-shield', '#7fa6d9'], '🪑': ['table', WOOD],
  '🛢': ['barrel', '#b07a45'], '🧵': ['sewing-string', '#e05c7a'], '🏳': ['rolled-cloth', '#e8e0d0'], '🎒': ['backpack', '#7fb36a'],
  '🧶': ['yarn', '#d0507a'], '⛵': ['sail', '#e8e0d0'], '💎': ['gems', '#5cc8f0'], '💍': ['diamond-ring', GOLD],
  '📿': ['gem-necklace', '#b080f0'], '👑': ['crown', GOLD], '🔍': ['magnifying-glass', '#9fd8e8'], '🧪': ['health-potion', '#f0607a'],
  '🏮': ['lantern-flame', '#ffb347'], '⏱': ['pocket-watch', GOLD], '🔭': ['telescope', '#b8a0e0'], '🧭': ['compass', '#e0a458'],
  '🤖': ['vintage-robot', '#9fc0d0'], '🚢': ['sailboat', '#e8e0d0'],
  '🥗': ['fruit-bowl', '#6fbf5a'], '🍲': ['cooking-pot', '#e08a3c'], '🥣': ['hot-meal', '#f0903c'], '🍷': ['wine-glass', '#d0405a'],
  '🎂': ['stairs-cake', '#f0b8c0'], '🍱': ['meal', '#e0a458'], '💐': ['flowers', '#f080a0'],
  // tools and stations
  '⛏': ['war-pick', N], '🪏': ['spade', N], '🧹': ['rake', N], '🔱': ['trident', N], '✂': ['shears', N], '🌙': ['sickle', N],
  '✋': ['hand', '#f0c8a0'], '♨': ['furnace', '#ff7a3c'], '🪡': ['sewing-machine', '#b8c0cc'], '⚖': ['scales', GOLD],
  '⚗': ['round-bottom-flask', '#b080f0'], '🔧': ['spanner', '#b8c0cc'], '🍳': ['saucepan', '#b8c0cc'],
  // relics, places, seasons, pets
  '🗿': ['totem-head', STONE], '🦴': ['broken-bone', '#e8e0d0'], '🪔': ['magic-lamp', GOLD], '⏳': ['hourglass', '#e0c070'],
  '🐚': ['spiral-shell', '#f0b8c0'], '📯': ['hunting-horn', '#d9a55b'], '🏺': ['amphora', '#d98b5f'], '🎭': ['drama-masks', '#c080f0'],
  '📜': ['tied-scroll', '#e8d8a8'], '🗝': ['key', GOLD], '🕳': ['cave-entrance', '#a8a4a0'], '🏛': ['greek-temple', '#d8d0b8'],
  '🏝': ['island', '#6fc8a0'], '🏜': ['desert', '#e3c98a'], '🏔': ['mountains', '#c8d8e8'],
  '🌸': ['spoted-flower', '#f8a0c0'], '☀': ['sun', '#ffd84a'], '🍂': ['maple-leaf', '#e0803c'], '❄': ['snowflake-1', '#a0d8f0'],
  '🐈': ['cat', '#f0b060'], '🐔': ['chicken', '#f0e8d8'], '🐕': ['sitting-dog', WOOD], '🦔': ['hedgehog', '#c0a080'],
  '🐝': ['bee', GOLD], '🦉': ['owl', '#c8b090'],
  // gear
  '🗡': ['plain-dagger', N], '🔨': ['flat-hammer', N], '🥋': ['robe', N], '🦺': ['mail-shirt', N], '🧥': ['cloak', N],
  '🧿': ['charm', N], '🪬': ['tribal-pendant', N],
  // world
  '🌳': ['oak', '#58a85a'], '🌵': ['cactus', '#58a85a'], '🧊': ['ice-cube', '#a0d8f0'], '⛰': ['peaks', STONE],
  '🌊': ['big-wave', '#cfeefa'], '🌴': ['palm-tree', '#58a85a'],
  '🦠': ['slime', '#8fe07a'], '🐗': ['boar', '#c09070'], '🐺': ['wolf-head', '#b8c0d0'], '🐻': ['bear-head', '#c08858'],
  '🦇': ['bat', '#a080d8'], '🕷': ['spider-alt', '#c0a0e0'], '👺': ['goblin-head', '#8fd070'], '🧌': ['troll', '#90b880'],
  '💀': ['death-skull', '#f0e8d8'], '👻': ['ghost', '#d8e8f8'], '🐍': ['snake', '#90d070'], '🦂': ['scorpion', '#f0903c'],
  '🧟': ['shambling-zombie', '#a0c090'], '🦅': ['vulture', '#c0a080'], '🪱': ['worm-mouth', '#f0b080'], '🦌': ['deer', '#d8b080'],
  '🐻‍❄': ['polar-bear', '#f0f6fc'], '⛄': ['snowman', '#f0f6fc'], '🐲': ['dragon-head', '#70d0e8'], '🦀': ['crab', '#f0703c'],
  '🐊': ['croc-jaws', '#7fb36a'], '🐙': ['octopus', '#d070b0'], '🦑': ['giant-squid', '#f07090'],
};

const paths = {};
const missing = [];
for (const [, [name]] of Object.entries(MAP)) {
  const icon = set.icons[name];
  if (!icon) { missing.push(name); continue; }
  paths[name] = [...icon.body.matchAll(/ d="([^"]+)"/g)].map(m => m[1]);
}
if (missing.length) { console.error('Unknown icons:', missing.join(', ')); process.exit(1); }

const out = `// GENERATED by scripts/build-icons.js — do not edit by hand.
// Icons by Lorc, Delapouite and contributors, https://game-icons.net (CC BY 3.0).
const ICON_PATHS = ${JSON.stringify(paths)};
const EMOJI_ICON = ${JSON.stringify(MAP)};
`;
fs.writeFileSync(path.join(__dirname, '../js/icons.js'), out);
console.log(`${Object.keys(paths).length} icons, ${Object.keys(MAP).length} emoji mapped, ${(out.length / 1024).toFixed(0)} KB`);
