// Game content: items, gathering nodes, recipes and upgrades.
// Everything here is plain data so it is easy to add new content.

// kind: raw | mat (material) | good (sellable product) | tool (one-time, unlocks a node) | station (one-time, unlocks recipes)
const ITEMS = {
  // --- raw resources ---
  wood:        { name: 'Wood',          icon: '🪵', kind: 'raw', value: 1 },
  stone:       { name: 'Stone',         icon: '🪨', kind: 'raw', value: 1 },
  fiber:       { name: 'Fiber',         icon: '🌿', kind: 'raw', value: 1 },
  berries:     { name: 'Berries',       icon: '🫐', kind: 'raw', value: 1 },
  clay:        { name: 'Clay',          icon: '🟤', kind: 'raw', value: 2 },
  sand:        { name: 'Sand',          icon: '🏖️', kind: 'raw', value: 2 },
  wheat:       { name: 'Wheat',         icon: '🌾', kind: 'raw', value: 2 },
  copper_ore:  { name: 'Copper Ore',    icon: '🟠', kind: 'raw', value: 3 },
  coal:        { name: 'Coal',          icon: '⚫', kind: 'raw', value: 3 },
  iron_ore:    { name: 'Iron Ore',      icon: '⚪', kind: 'raw', value: 5 },
  wool:        { name: 'Wool',          icon: '🐑', kind: 'raw', value: 4 },
  herbs:       { name: 'Herbs',         icon: '🌱', kind: 'raw', value: 4 },
  gold_ore:    { name: 'Gold Ore',      icon: '🟡', kind: 'raw', value: 10 },
  crystal:     { name: 'Crystal',       icon: '🔷', kind: 'raw', value: 15 },

  // --- materials & goods (value is computed from the recipe) ---
  plank:       { name: 'Plank',         icon: '🟫', kind: 'mat' },
  stick:       { name: 'Stick',         icon: '🥢', kind: 'mat' },
  rope:        { name: 'Rope',          icon: '🪢', kind: 'mat' },
  basket:      { name: 'Basket',        icon: '🧺', kind: 'good' },
  chest:       { name: 'Chest',         icon: '📦', kind: 'good' },
  torch:       { name: 'Torch',         icon: '🔥', kind: 'mat' },
  brick:       { name: 'Brick',         icon: '🧱', kind: 'mat' },
  glass:       { name: 'Glass',         icon: '🪟', kind: 'mat' },
  copper_ingot:{ name: 'Copper Ingot',  icon: '🟧', kind: 'mat' },
  iron_ingot:  { name: 'Iron Ingot',    icon: '⬜', kind: 'mat' },
  gold_ingot:  { name: 'Gold Ingot',    icon: '🟨', kind: 'mat' },
  steel_ingot: { name: 'Steel Ingot',   icon: '⬛', kind: 'mat' },
  bread:       { name: 'Bread',         icon: '🍞', kind: 'good' },
  pie:         { name: 'Berry Pie',     icon: '🥧', kind: 'good' },
  jam:         { name: 'Jam',           icon: '🫙', kind: 'good' },
  copper_wire: { name: 'Copper Wire',   icon: '➰', kind: 'mat' },
  nails:       { name: 'Nails',         icon: '📌', kind: 'mat' },
  gear:        { name: 'Gear',          icon: '⚙️', kind: 'mat' },
  sword:       { name: 'Steel Sword',   icon: '⚔️', kind: 'good' },
  shield:      { name: 'Shield',        icon: '🛡️', kind: 'good' },
  table:       { name: 'Table',         icon: '🪑', kind: 'good' },
  barrel:      { name: 'Barrel',        icon: '🛢️', kind: 'good' },
  thread:      { name: 'Thread',        icon: '🧵', kind: 'mat' },
  cloth:       { name: 'Cloth',         icon: '🏳️', kind: 'mat' },
  backpack:    { name: 'Backpack',      icon: '🎒', kind: 'good' },
  rug:         { name: 'Rug',           icon: '🧶', kind: 'good' },
  sail:        { name: 'Sail',          icon: '⛵', kind: 'mat' },
  gem:         { name: 'Cut Gem',       icon: '💎', kind: 'mat' },
  ring:        { name: 'Ring',          icon: '💍', kind: 'good' },
  necklace:    { name: 'Necklace',      icon: '📿', kind: 'good' },
  crown:       { name: 'Crown',         icon: '👑', kind: 'good' },
  lens:        { name: 'Lens',          icon: '🔍', kind: 'mat' },
  potion:      { name: 'Potion',        icon: '🧪', kind: 'good' },
  elixir:      { name: 'Elixir',        icon: '✨', kind: 'good' },
  lantern:     { name: 'Lantern',       icon: '🏮', kind: 'good' },
  pocket_watch:{ name: 'Pocket Watch',  icon: '⏱️', kind: 'good' },
  telescope:   { name: 'Telescope',     icon: '🔭', kind: 'good' },
  compass:     { name: 'Compass',       icon: '🧭', kind: 'good' },
  automaton:   { name: 'Automaton',     icon: '🤖', kind: 'good' },
  ship:        { name: 'Ship',          icon: '🚢', kind: 'good' },

  // --- tools (unlock gathering spots) ---
  stone_pickaxe:  { name: 'Stone Pickaxe',  icon: '⛏️', kind: 'tool' },
  stone_shovel:   { name: 'Stone Shovel',   icon: '🪏', kind: 'tool' },
  stone_hoe:      { name: 'Stone Hoe',      icon: '🔱', kind: 'tool' },
  copper_pickaxe: { name: 'Copper Pickaxe', icon: '⛏️', kind: 'tool' },
  shears:         { name: 'Shears',         icon: '✂️', kind: 'tool' },
  sickle:         { name: 'Sickle',         icon: '🌙', kind: 'tool' },
  iron_pickaxe:   { name: 'Iron Pickaxe',   icon: '⛏️', kind: 'tool' },
  steel_pickaxe:  { name: 'Steel Pickaxe',  icon: '⛏️', kind: 'tool' },

  // --- stations (unlock recipe groups) ---
  hand:      { name: 'Hands',          icon: '✋', kind: 'station' },
  workbench: { name: 'Workbench',      icon: '🛠️', kind: 'station' },
  furnace:   { name: 'Furnace',        icon: '♨️', kind: 'station' },
  anvil:     { name: 'Anvil',          icon: '⚒️', kind: 'station' },
  loom:      { name: 'Loom',           icon: '🪡', kind: 'station' },
  jeweler:   { name: "Jeweler's Bench", icon: '⚖️', kind: 'station' },
  alchemy:   { name: 'Alchemy Table',  icon: '⚗️', kind: 'station' },
  workshop:  { name: 'Workshop',       icon: '🔧', kind: 'station' },
};

// Gathering spots. `needs` is the tool required to unlock it.
// `hire` is the base coin cost of the first worker.
const NODES = [
  { id: 'wood',       place: 'Forest',      needs: null,             hire: 10 },
  { id: 'stone',      place: 'Rocky Field', needs: null,             hire: 10 },
  { id: 'fiber',      place: 'Meadow',      needs: null,             hire: 12 },
  { id: 'berries',    place: 'Bushes',      needs: null,             hire: 12 },
  { id: 'clay',       place: 'Riverbank',   needs: 'stone_shovel',   hire: 40 },
  { id: 'sand',       place: 'Beach',       needs: 'stone_shovel',   hire: 40 },
  { id: 'wheat',      place: 'Farm',        needs: 'stone_hoe',      hire: 50 },
  { id: 'copper_ore', place: 'Copper Vein', needs: 'stone_pickaxe',  hire: 60 },
  { id: 'coal',       place: 'Coal Seam',   needs: 'stone_pickaxe',  hire: 60 },
  { id: 'iron_ore',   place: 'Iron Mine',   needs: 'copper_pickaxe', hire: 200 },
  { id: 'wool',       place: 'Sheep Pen',   needs: 'shears',         hire: 180 },
  { id: 'herbs',      place: 'Herb Garden', needs: 'sickle',         hire: 180 },
  { id: 'gold_ore',   place: 'Gold Mine',   needs: 'iron_pickaxe',   hire: 800 },
  { id: 'crystal',    place: 'Crystal Cave',needs: 'steel_pickaxe',  hire: 2500 },
];

// Stations in display order. `upgrade` is the base cost of station levels
// (level 1 = auto-crafting, every level after that adds a crafting slot).
const STATIONS = [
  { id: 'hand',      upgrade: 40 },
  { id: 'workbench', upgrade: 100 },
  { id: 'furnace',   upgrade: 300 },
  { id: 'anvil',     upgrade: 1000 },
  { id: 'loom',      upgrade: 2000 },
  { id: 'jeweler',   upgrade: 6000 },
  { id: 'alchemy',   upgrade: 6000 },
  { id: 'workshop',  upgrade: 15000 },
];

// Recipes. `at` = station, `in` = inputs, `out` = outputs, `t` = seconds.
const RECIPES = [
  // Hands
  { id: 'plank',      at: 'hand', in: { wood: 2 }, out: { plank: 1 }, t: 2 },
  { id: 'stick',      at: 'hand', in: { wood: 1 }, out: { stick: 2 }, t: 1 },
  { id: 'rope',       at: 'hand', in: { fiber: 3 }, out: { rope: 1 }, t: 2 },
  { id: 'workbench',  at: 'hand', in: { plank: 4, stone: 4 }, out: { workbench: 1 }, t: 5 },

  // Workbench
  { id: 'stone_pickaxe', at: 'workbench', in: { stick: 2, stone: 3, rope: 1 }, out: { stone_pickaxe: 1 }, t: 4 },
  { id: 'stone_shovel',  at: 'workbench', in: { stick: 2, stone: 2, rope: 1 }, out: { stone_shovel: 1 }, t: 4 },
  { id: 'stone_hoe',     at: 'workbench', in: { stick: 2, stone: 2, rope: 1 }, out: { stone_hoe: 1 }, t: 4 },
  { id: 'basket',     at: 'workbench', in: { rope: 4, stick: 2 }, out: { basket: 1 }, t: 4 },
  { id: 'chest',      at: 'workbench', in: { plank: 6, rope: 2 }, out: { chest: 1 }, t: 6 },
  { id: 'torch',      at: 'workbench', in: { stick: 1, coal: 1 }, out: { torch: 2 }, t: 1 },
  { id: 'table',      at: 'workbench', in: { plank: 4, nails: 8 }, out: { table: 1 }, t: 6 },
  { id: 'barrel',     at: 'workbench', in: { plank: 6, nails: 4 }, out: { barrel: 1 }, t: 6 },
  { id: 'furnace',    at: 'workbench', in: { stone: 15, clay: 5 }, out: { furnace: 1 }, t: 8 },
  { id: 'anvil',      at: 'workbench', in: { copper_ingot: 5, stone: 10 }, out: { anvil: 1 }, t: 10 },
  { id: 'loom',       at: 'workbench', in: { plank: 8, rope: 6, copper_ingot: 2 }, out: { loom: 1 }, t: 10 },
  { id: 'jeweler',    at: 'workbench', in: { gold_ingot: 4, glass: 2, steel_ingot: 2 }, out: { jeweler: 1 }, t: 15 },
  { id: 'alchemy',    at: 'workbench', in: { glass: 4, brick: 6, gold_ingot: 2 }, out: { alchemy: 1 }, t: 15 },
  { id: 'workshop',   at: 'workbench', in: { brick: 12, gear: 4, nails: 10 }, out: { workshop: 1 }, t: 15 },

  // Furnace
  { id: 'charcoal',     at: 'furnace', in: { wood: 3 }, out: { coal: 1 }, t: 3 },
  { id: 'brick',        at: 'furnace', in: { clay: 2 }, out: { brick: 1 }, t: 3 },
  { id: 'glass',        at: 'furnace', in: { sand: 2, coal: 1 }, out: { glass: 1 }, t: 4 },
  { id: 'copper_ingot', at: 'furnace', in: { copper_ore: 2, coal: 1 }, out: { copper_ingot: 1 }, t: 4 },
  { id: 'iron_ingot',   at: 'furnace', in: { iron_ore: 2, coal: 1 }, out: { iron_ingot: 1 }, t: 5 },
  { id: 'gold_ingot',   at: 'furnace', in: { gold_ore: 2, coal: 1 }, out: { gold_ingot: 1 }, t: 6 },
  { id: 'steel_ingot',  at: 'furnace', in: { iron_ingot: 1, coal: 2 }, out: { steel_ingot: 1 }, t: 6 },
  { id: 'bread',        at: 'furnace', in: { wheat: 3 }, out: { bread: 1 }, t: 4 },
  { id: 'pie',          at: 'furnace', in: { wheat: 2, berries: 4 }, out: { pie: 1 }, t: 5 },
  { id: 'jam',          at: 'furnace', in: { berries: 5, glass: 1 }, out: { jam: 1 }, t: 4 },

  // Anvil
  { id: 'copper_pickaxe', at: 'anvil', in: { copper_ingot: 3, stick: 2 }, out: { copper_pickaxe: 1 }, t: 6 },
  { id: 'shears',         at: 'anvil', in: { copper_ingot: 2 }, out: { shears: 1 }, t: 5 },
  { id: 'sickle',         at: 'anvil', in: { copper_ingot: 2, stick: 1 }, out: { sickle: 1 }, t: 5 },
  { id: 'iron_pickaxe',   at: 'anvil', in: { iron_ingot: 3, stick: 2 }, out: { iron_pickaxe: 1 }, t: 8 },
  { id: 'steel_pickaxe',  at: 'anvil', in: { steel_ingot: 3, stick: 2 }, out: { steel_pickaxe: 1 }, t: 10 },
  { id: 'copper_wire',    at: 'anvil', in: { copper_ingot: 1 }, out: { copper_wire: 3 }, t: 3 },
  { id: 'nails',          at: 'anvil', in: { iron_ingot: 1 }, out: { nails: 5 }, t: 3 },
  { id: 'gear',           at: 'anvil', in: { steel_ingot: 1 }, out: { gear: 2 }, t: 5 },
  { id: 'sword',          at: 'anvil', in: { steel_ingot: 3, plank: 1 }, out: { sword: 1 }, t: 10 },
  { id: 'shield',         at: 'anvil', in: { plank: 4, iron_ingot: 2, nails: 4 }, out: { shield: 1 }, t: 8 },

  // Loom
  { id: 'thread',   at: 'loom', in: { wool: 2 }, out: { thread: 1 }, t: 3 },
  { id: 'cloth',    at: 'loom', in: { thread: 3 }, out: { cloth: 1 }, t: 5 },
  { id: 'backpack', at: 'loom', in: { cloth: 4, rope: 2 }, out: { backpack: 1 }, t: 8 },
  { id: 'rug',      at: 'loom', in: { cloth: 5, herbs: 3 }, out: { rug: 1 }, t: 10 },
  { id: 'sail',     at: 'loom', in: { cloth: 8, rope: 4 }, out: { sail: 1 }, t: 12 },

  // Jeweler
  { id: 'gem',      at: 'jeweler', in: { crystal: 2 }, out: { gem: 1 }, t: 8 },
  { id: 'lens',     at: 'jeweler', in: { glass: 2 }, out: { lens: 1 }, t: 5 },
  { id: 'ring',     at: 'jeweler', in: { gold_ingot: 1, gem: 1 }, out: { ring: 1 }, t: 10 },
  { id: 'necklace', at: 'jeweler', in: { gold_ingot: 2, gem: 2, thread: 2 }, out: { necklace: 1 }, t: 12 },
  { id: 'crown',    at: 'jeweler', in: { gold_ingot: 6, gem: 4 }, out: { crown: 1 }, t: 20 },

  // Alchemy
  { id: 'potion', at: 'alchemy', in: { herbs: 3, berries: 2, glass: 1 }, out: { potion: 1 }, t: 8 },
  { id: 'elixir', at: 'alchemy', in: { potion: 2, gem: 1 }, out: { elixir: 1 }, t: 15 },

  // Workshop
  { id: 'lantern',      at: 'workshop', in: { glass: 1, iron_ingot: 2, torch: 1 }, out: { lantern: 1 }, t: 8 },
  { id: 'compass',      at: 'workshop', in: { copper_ingot: 1, glass: 1, iron_ingot: 1 }, out: { compass: 1 }, t: 8 },
  { id: 'pocket_watch', at: 'workshop', in: { gear: 2, gold_ingot: 1, glass: 1 }, out: { pocket_watch: 1 }, t: 12 },
  { id: 'telescope',    at: 'workshop', in: { lens: 2, copper_ingot: 2, gear: 1 }, out: { telescope: 1 }, t: 15 },
  { id: 'automaton',    at: 'workshop', in: { gear: 6, steel_ingot: 4, copper_wire: 6, elixir: 1 }, out: { automaton: 1 }, t: 40 },
  { id: 'ship',         at: 'workshop', in: { sail: 4, plank: 30, nails: 40, compass: 1 }, out: { ship: 1 }, t: 60 },
];

// Global coin upgrades. cost(level) = base * growth^level
const UPGRADES = [
  { id: 'tap',    name: 'Better Grip',      icon: '💪', desc: '+1 per tap',                     base: 25,  growth: 2.2 },
  { id: 'worker', name: 'Hearty Meals',     icon: '🍲', desc: 'Workers gather 25% faster',      base: 100, growth: 3 },
  { id: 'speed',  name: 'Sharper Tools',    icon: '🔪', desc: 'Crafting is 15% faster',         base: 75,  growth: 2.5 },
  { id: 'price',  name: 'Haggling',         icon: '🗣️', desc: 'Everything sells for 10% more',  base: 150, growth: 2.8 },
];

// Order of milestones shown in the "Next goal" hint.
const MILESTONES = [
  'workbench', 'stone_pickaxe', 'stone_shovel', 'furnace', 'stone_hoe', 'anvil',
  'copper_pickaxe', 'shears', 'loom', 'sickle', 'iron_pickaxe', 'steel_pickaxe',
  'alchemy', 'jeweler', 'workshop', 'automaton', 'ship',
];
