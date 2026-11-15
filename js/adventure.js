'use strict';

/* ============================================================
   Adventure: a walkable open world with monsters, bosses and
   gear. Runs on a canvas in the Hero tab. Loaded before game.js.
   ============================================================ */

const MAP_N = 36;            // zone size in tiles
const RARITY = [
  { name: 'Common',    color: '#9aa3ad', mult: 1.0 },
  { name: 'Uncommon',  color: '#4caf50', mult: 1.3 },
  { name: 'Rare',      color: '#3d8bfd', mult: 1.7 },
  { name: 'Epic',      color: '#a855f7', mult: 2.2 },
  { name: 'Legendary', color: '#f59e0b', mult: 3.0 },
];
const GEAR_BASES = {
  weapon:  [['Dagger', '🗡️'], ['Sword', '⚔️'], ['Axe', '🪓'], ['Spear', '🔱'], ['Mace', '🔨']],
  armor:   [['Robe', '🥋'], ['Mail', '🦺'], ['Tunic', '🧥'], ['Plate', '🥼'], ['Helm', '🪖']],
  trinket: [['Charm', '🧿'], ['Ring', '💍'], ['Amulet', '📿'], ['Pendant', '🪬']],
};
const SLOT_LABEL = { weapon: 'Weapon', armor: 'Armor', trinket: 'Trinket' };
const BAG_MAX = 24;
const UPGRADE_MAX = 10;
// Crafted goods that can be reforged into adventure gear.
const FORGE = { weapon: 'sword', armor: 'shield', trinket: 'ring' };
const HEALS = [['potion', 0.6], ['stew', 0.4], ['pie', 0.35], ['bread', 0.2], ['elixir', 1]];

// Extra stats rolled onto Uncommon and better gear. v = value per rarity step.
const AFFIXES = {
  crit:   { name: 'Precise',   text: v => `+${v}% crit chance`,      v: 3 },
  critd:  { name: 'Brutal',    text: v => `+${v}% crit damage`,      v: 15 },
  leech:  { name: 'Vampiric',  text: v => `${v}% life steal`,        v: 2 },
  haste:  { name: 'Swift',     text: v => `+${v}% attack speed`,     v: 6 },
  move:   { name: 'Fleet',     text: v => `+${v}% move speed`,       v: 5 },
  greed:  { name: 'Gilded',    text: v => `+${v}% coins from monsters`, v: 12 },
  wisdom: { name: 'Wise',      text: v => `+${v}% hero xp`,          v: 10 },
  forage: { name: 'Gatherer',  text: v => `+${v}% from resource spots`, v: 15 },
};
const AFFIX_COUNT = [0, 1, 1, 2, 3];

// Talents: one point per hero level. Each talent has 5 ranks.
const TALENTS = [
  { tree: 'Might', icon: '⚔️', list: [
    { id: 'sharp',  name: 'Sharpness',   text: r => `+${8 * r}% attack` },
    { id: 'prec',   name: 'Precision',   text: r => `+${3 * r}% crit chance` },
    { id: 'fero',   name: 'Ferocity',    text: r => `+${20 * r}% crit damage` },
    { id: 'cleave', name: 'Cleave',      text: r => `+${25 * r}% skill damage` },
  ] },
  { tree: 'Guard', icon: '🛡️', list: [
    { id: 'vital',  name: 'Vitality',    text: r => `+${10 * r}% health` },
    { id: 'iron',   name: 'Ironskin',    text: r => `+${12 * r}% defense` },
    { id: 'regen',  name: 'Regeneration', text: r => `Recover ${r}% health per second, even in a fight` },
    { id: 'wind',   name: 'Second Wind', text: r => `Healing items restore ${15 * r}% more` },
  ] },
  { tree: 'Fortune', icon: '🪙', list: [
    { id: 'prosp',  name: 'Prospector',  text: r => `+${15 * r}% from resource spots` },
    { id: 'hunt',   name: 'Bounty Hunter', text: r => `+${10 * r}% coins from monsters` },
    { id: 'schol',  name: 'Scholar',     text: r => `+${10 * r}% hero xp` },
    { id: 'luck',   name: 'Lucky Find',  text: r => `+${10 * r}% chance of gear drops` },
  ] },
];
const TALENT_MAX = 5;

// Active skills, unlocked by hero level.
const SKILLS = [
  { id: 'spin', name: 'Whirlwind', icon: '🌀', lvl: 1,  cd: 6,  desc: 'Hit everything around you for 220% damage.' },
  { id: 'dash', name: 'Dash',      icon: '💨', lvl: 5,  cd: 5,  desc: 'Dash forward, slashing everything in your path for 150% damage.' },
  { id: 'cry',  name: 'War Cry',   icon: '📣', lvl: 10, cd: 20, desc: 'Attack 50% harder and faster for 8 seconds.' },
];

// Elite monsters: rare, tougher variants that drop better loot.
const ELITES = [
  { id: 'swift',   name: 'Swift',   color: '#7fd0f0', spd: 1.6 },
  { id: 'brutal',  name: 'Brutal',  color: '#ff6b5a', atk: 1.8 },
  { id: 'armored', name: 'Armored', color: '#b8c0cc', hp: 2.5 },
  { id: 'vampire', name: 'Vampiric', color: '#d070ff', leech: 0.5 },
  { id: 'golden',  name: 'Golden',  color: '#ffd84a', gold: 6 },
];

// Monster base stats are for zone level 1 and scale up with the zone.
// spr = animation in the sprite atlas; i = emoji used for its icon in menus.
const ZONES = [
  { id: 'greenwood', name: 'Greenwood', icon: '🌲', ground: 'g_grass', wallBg: '#5f8d3a', walls: ['tree_round', 'tree_pine', 'tree_bush', 'tree_round'],
    deco: ['bush', 'grass_tuft', 'flower_white', 'bush2'], music: 'forest',
    nodes: [['🪵', 'wood', 8, 'stump'], ['🌿', 'fiber', 8, 'grass_tuft'], ['🫐', 'berries', 8, 'bush']],
    mobs: [{ n: 'Slime', spr: 'mon_Slime', i: '🦠', hp: 12, atk: 3, spd: 1.3 }, { n: 'Shroom', spr: 'mon_Mushroom', i: '🍄', hp: 18, atk: 4, spd: 1.6 },
      { n: 'Racoon', spr: 'mon_Racoon', i: '🦝', hp: 16, atk: 5, spd: 2.4 }],
    boss: { n: 'King Slime', spr: 'boss_GiantSlime', i: '🫧', scale: 2 } },
  { id: 'caves', name: 'Echo Caves', icon: '🕳️', ground: 'g_dun', wallBg: '#2a2530', walls: ['rock_gray', 'rock_brown', 'rock_gray'],
    deco: ['skull', 'ore_dark'], music: 'cave',
    nodes: [['🪨', 'stone', 10, 'ore_dark'], ['⚫', 'coal', 8, 'ore_dark'], ['🟠', 'copper_ore', 8, 'ore_rock'], ['⚪', 'iron_ore', 5, 'ore_gem']],
    mobs: [{ n: 'Bat', spr: 'mon_BlueBat', i: '🦇', hp: 10, atk: 4, spd: 2.8 }, { n: 'Spider', spr: 'mon_SpiderRed', i: '🕷️', hp: 18, atk: 5, spd: 2.0 },
      { n: 'Mole', spr: 'mon_Mole', i: '🐀', hp: 22, atk: 5, spd: 1.9 }],
    boss: { n: 'Cave Cyclops', spr: 'boss_DemonCyclop', i: '👹', scale: 2 } },
  { id: 'ruins', name: 'Sunken Ruins', icon: '🏛️', ground: 'g_dark', wallBg: '#3d5a2e', walls: ['column', 'tree_dead', 'rock_brown', 'tree_dead'],
    deco: ['skull', 'grass_tuft', 'bush'], music: 'ruins',
    nodes: [['🟤', 'clay', 10, 'rock_brown'], ['🌱', 'herbs', 6, 'bush2'], ['🟡', 'gold_ore', 4, 'ore_rock'], ['⚪', 'iron_ore', 6, 'ore_gem']],
    mobs: [{ n: 'Skull', spr: 'mon_Skull', i: '💀', hp: 18, atk: 5, spd: 1.7 }, { n: 'Viper', spr: 'mon_Snake', i: '🐍', hp: 14, atk: 6, spd: 2.5 },
      { n: 'Wisp', spr: 'mon_Spirit', i: '👻', hp: 16, atk: 6, spd: 2.2 }],
    boss: { n: 'Ruin Wraith', spr: 'boss_GiantSpirit', i: '👤', scale: 2 } },
  { id: 'dunes', name: 'Scorched Dunes', icon: '🏜️', ground: 'g_sand', wallBg: '#c98a4a', walls: ['rock_brown', 'palm', 'rock_brown', 'tree_dead'],
    deco: ['sand_pile', 'grass_tuft'], music: 'desert',
    nodes: [['🏖️', 'sand', 12, 'sand_pile'], ['🟡', 'gold_ore', 6, 'ore_rock'], ['🟠', 'copper_ore', 12, 'ore_rock']],
    mobs: [{ n: 'Lizard', spr: 'mon_Lizard', i: '🦎', hp: 16, atk: 6, spd: 2.3 }, { n: 'Ember', spr: 'mon_Flam', i: '🔆', hp: 14, atk: 7, spd: 2.0 },
      { n: 'Dune Raptor', spr: 'mon_Reptile', i: '🦖', hp: 26, atk: 5, spd: 1.8 }],
    boss: { n: 'Flame Titan', spr: 'boss_GiantFlam', i: '☄️', scale: 2 } },
  { id: 'frost', name: 'Frostpeak', icon: '🏔️', ground: 'g_snow', wallBg: '#9fb4c8', walls: ['tree_snowpine', 'tree_snow', 'rock_snow', 'tree_snowpine'],
    deco: ['snow_bush'], music: 'snow',
    nodes: [['🔷', 'crystal', 4, 'ore_gem'], ['⚪', 'iron_ore', 10, 'ore_gem'], ['🐑', 'wool', 8, 'snow_bush']],
    mobs: [{ n: 'Frost Wisp', spr: 'mon_Flam2', i: '🌨️', hp: 20, atk: 6, spd: 2.4 }, { n: 'Snow Mole', spr: 'mon_Mole2', i: '🐁', hp: 28, atk: 6, spd: 1.8 },
      { n: 'Ice Grub', spr: 'mon_Larva2', i: '🐛', hp: 22, atk: 5, spd: 1.5 }],
    boss: { n: 'Frost Toad', spr: 'boss_GiantFrog2', i: '🐲', scale: 3 } },
  { id: 'isles', name: 'Far Isles', icon: '🏝️', ground: 'g_sand', water: true, wallBg: '#3f9fd0', walls: ['palm'],
    deco: ['grass_tuft', 'sand_pile'], music: 'isles',
    nodes: [['🟡', 'gold_ore', 8, 'ore_rock'], ['🔷', 'crystal', 6, 'ore_gem'], ['🌱', 'herbs', 10, 'bush2']],
    mobs: [{ n: 'Octopus', spr: 'mon_Octopus', i: '🐙', hp: 22, atk: 5, spd: 1.9 }, { n: 'Kappa', spr: 'mon_KappaGreen', i: '🐸', hp: 26, atk: 6, spd: 2.1 },
      { n: 'Red Squid', spr: 'mon_RedOctopus', i: '🦑', hp: 20, atk: 7, spd: 1.7 }],
    boss: { n: 'Kraken', spr: 'boss_SquidRed', i: '🦈', scale: 2 } },
];

ACHIEVEMENTS.push(
  { id: 'ad1', name: 'First Blood',    desc: 'Defeat 10 monsters',        test: () => S.adv.kills >= 10 },
  { id: 'ad2', name: 'Monster Hunter', desc: 'Defeat 500 monsters',       test: () => S.adv.kills >= 500 },
  { id: 'ad3', name: 'Slayer',         desc: 'Defeat 5,000 monsters',     test: () => S.adv.kills >= 5000 },
  { id: 'ad4', name: 'Boss Breaker',   desc: 'Defeat a zone boss',        test: () => S.adv.bossKills >= 1 },
  { id: 'ad5', name: 'World Walker',   desc: 'Defeat every zone boss',    test: () => S.adv.tier >= 1 || ZONES.every(z => S.adv.bosses[z.id]) },
  { id: 'ad6', name: 'Seasoned Hero',  desc: 'Reach hero level 10',       test: () => S.adv.lvl >= 10 },
  { id: 'ad7', name: 'Living Legend',  desc: 'Reach hero level 30',       test: () => S.adv.lvl >= 30 },
  { id: 'ad8', name: 'Shiny!',         desc: 'Find a Legendary item',     test: () => !!S.adv.foundLegendary },
);

/* ---------- saved state ---------- */
function advDefaults() {
  return { adv: {
    zone: 0, tier: 0, lvl: 1, xp: 0, hp: 60, look: 'Knight',
    gear: { weapon: null, armor: null, trinket: null },
    bag: [], essence: 0, bosses: {}, kills: 0, bossKills: 0, eliteKills: 0, uid: 1, foundLegendary: false,
    talents: {},
  } };
}
const advKeep = () => ({ adv: S.adv });

/* ---------- gear ---------- */
const gearBudget = g => Math.pow(1.6, g.il - 1) * RARITY[g.r].mult * (1 + 0.1 * g.up);
function gearStats(g) {
  const b = gearBudget(g);
  if (g.slot === 'weapon') return { atk: Math.round(5 * b), def: 0, hp: 0 };
  if (g.slot === 'armor') return { atk: 0, def: Math.round(1.5 * b), hp: Math.round(15 * b) };
  return { atk: Math.round(2 * b), def: 0, hp: Math.round(8 * b) };
}
const affixPower = g => (g.ax || []).reduce((a, [, v]) => a + v, 0);
const gearPower = g => { if (!g) return 0; const s = gearStats(g); return Math.round(s.atk * 2 + s.def * 3 + s.hp * 0.3 + affixPower(g) * Math.pow(1.6, g.il - 1)); };
function gearName(g) {
  const pre = g.ax && g.ax.length ? AFFIXES[g.ax[0][0]].name + ' ' : '';
  return `${pre}${g.name}${g.up ? ' +' + g.up : ''}`;
}
const zoneIlvl = (zi = S.adv.zone) => zi + 1 + S.adv.tier * ZONES.length;
function rollRarity(boost) {
  const roll = Math.random() * (boost ? 0.35 : 1);
  return roll < 0.01 ? 4 : roll < 0.05 ? 3 : roll < 0.15 ? 2 : roll < 0.40 ? 1 : 0;
}
function makeGear(il, boost, slot, minRarity = 0) {
  slot = slot || ['weapon', 'armor', 'trinket'][Math.floor(Math.random() * 3)];
  const base = GEAR_BASES[slot][Math.floor(Math.random() * GEAR_BASES[slot].length)];
  const r = Math.max(minRarity, rollRarity(boost));
  const keys = Object.keys(AFFIXES).sort(() => Math.random() - 0.5).slice(0, AFFIX_COUNT[r]);
  const ax = keys.map(k => [k, Math.round(AFFIXES[k].v * (r + Math.random()) * 10) / 10]);
  const g = { id: S.adv.uid++, slot, r, il, up: 0, name: base[0], icon: base[1], ax };
  if (r === 4) S.adv.foundLegendary = true;
  return g;
}
const salvageValue = g => Math.max(1, Math.round(Math.pow(1.6, g.il - 1) * (g.r + 1) * 2 * (1 + 0.5 * g.up)));
const upgradeCost = g => Math.round(Math.pow(1.6, g.il - 1) * 5 * (g.up + 1));
function giveGear(g) {
  // Auto-equip into an empty slot, otherwise it goes in the bag (or is salvaged if the bag is full).
  if (!S.adv.gear[g.slot]) { S.adv.gear[g.slot] = g; return 'equipped'; }
  if (S.adv.bag.length >= BAG_MAX) { S.adv.essence += salvageValue(g); return 'salvaged'; }
  S.adv.bag.push(g);
  return 'bag';
}
function equipGear(id) {
  const i = S.adv.bag.findIndex(g => g.id === id);
  if (i < 0) return;
  const g = S.adv.bag[i];
  const old = S.adv.gear[g.slot];
  S.adv.bag.splice(i, 1);
  if (old) S.adv.bag.push(old);
  S.adv.gear[g.slot] = g;
  S.adv.hp = Math.min(S.adv.hp, heroStats().hp);
  sfx('equip');
  dirty = true;
}
function salvageGear(id) {
  const i = S.adv.bag.findIndex(g => g.id === id);
  if (i < 0) return;
  S.adv.essence += salvageValue(S.adv.bag[i]);
  S.adv.bag.splice(i, 1);
  dirty = true;
}
function salvageWeak() {
  // Salvage everything in the bag that is weaker than what is equipped in that slot.
  const keep = [];
  for (const g of S.adv.bag) {
    if (gearPower(g) < gearPower(S.adv.gear[g.slot])) S.adv.essence += salvageValue(g); else keep.push(g);
  }
  S.adv.bag = keep;
  dirty = true;
}
function upgradeGear(slot) {
  const g = S.adv.gear[slot];
  if (!g || g.up >= UPGRADE_MAX || S.adv.essence < upgradeCost(g)) return;
  S.adv.essence -= upgradeCost(g);
  g.up++;
  sfx('upgrade');
  dirty = true;
}
function forgeGear(slot) {
  const item = FORGE[slot];
  if (have(item) < 1) return;
  S.items[item] -= 1;
  const g = makeGear(zoneIlvl(maxZone()), true, slot);
  const where = giveGear(g);
  toast(`${g.icon} Forged <b style="color:${RARITY[g.r].color}">${gearName(g)}</b>${where === 'salvaged' ? ' (bag full — salvaged)' : ''}`);
  sfx('upgrade');
  dirty = true;
}

/* ---------- hero ---------- */
const talent = id => S.adv.talents[id] || 0;
const talentPointsTotal = () => S.adv.lvl - 1;
const talentPointsFree = () => talentPointsTotal() - Object.values(S.adv.talents).reduce((a, b) => a + b, 0);
function learnTalent(id) {
  if (talentPointsFree() < 1 || talent(id) >= TALENT_MAX) return;
  S.adv.talents[id] = talent(id) + 1;
  sfx('upgrade');
  dirty = true;
}
function heroStats() {
  let atk = 5, def = 0, hp = 60;
  const st = { crit: 5, critd: 100, leech: 0, haste: 0, move: 0, greed: 0, wisdom: 0, forage: 0 };
  for (const g of Object.values(S.adv.gear)) if (g) {
    const s = gearStats(g); atk += s.atk; def += s.def; hp += s.hp;
    for (const [k, v] of g.ax || []) st[k] += v;
  }
  const m = 1 + 0.04 * (S.adv.lvl - 1);
  st.atk = atk * m * (1 + 0.08 * talent('sharp'));
  st.def = def * (1 + 0.12 * talent('iron'));
  st.hp = Math.round(hp * m * (1 + 0.1 * talent('vital')));
  st.crit += 3 * talent('prec');
  st.critd += 20 * talent('fero');
  st.greed += 10 * talent('hunt');
  st.wisdom += 10 * talent('schol');
  st.forage += 15 * talent('prosp');
  return st;
}
const xpNeed = () => Math.round(25 * Math.pow(1.35, S.adv.lvl - 1));
const heroWorkerMult = () => 1 + 0.01 * (S.adv.lvl - 1);
function gainXp(n) {
  S.adv.xp += n * (1 + heroStats().wisdom / 100);
  while (S.adv.xp >= xpNeed()) {
    S.adv.xp -= xpNeed();
    S.adv.lvl++;
    S.adv.hp = heroStats().hp;
    const sk = SKILLS.find(k => k.lvl === S.adv.lvl);
    toast(`⭐ Hero level ${S.adv.lvl}! +1 talent point${sk ? ` · new skill: ${sk.name}` : ''}`, true);
    sfx('levelup');
    if (W) W.fx.push({ k: 'lvl', x: W.px, y: W.py, t: 0 });
    dirty = true;
  }
}
// Highest zone you may enter at the current threat tier.
function maxZone() {
  let z = 0;
  while (z < ZONES.length - 1 && S.adv.bosses[ZONES[z].id]) z++;
  return z;
}
const allBossesDown = () => ZONES.every(z => S.adv.bosses[z.id]);
const zoneScale = (zi = S.adv.zone) => Math.pow(1.7, zi + S.adv.tier * ZONES.length);

/* ---------- map generation ---------- */
function mulberry32(a) {
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function bfs(grid, sx, sy) {
  const N = MAP_N, dist = new Int16Array(N * N).fill(-1), q = [sx + sy * N];
  dist[q[0]] = 0;
  let last = q[0];
  for (let h = 0; h < q.length; h++) {
    const c = q[h], x = c % N, y = (c / N) | 0;
    last = c;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = (x + dx) + (y + dy) * N;
      if (grid[n] === 0 && dist[n] < 0) { dist[n] = dist[c] + 1; q.push(n); }
    }
  }
  return { dist, last, cells: q };
}
function genMap(zi, tier) {
  const N = MAP_N, zone = ZONES[zi];
  for (let attempt = 0; attempt < 20; attempt++) {
    const rnd = mulberry32(1000 + zi * 7919 + tier * 104729 + attempt * 31);
    let g = new Uint8Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++)
      g[x + y * N] = (x === 0 || y === 0 || x === N - 1 || y === N - 1 || rnd() < 0.36) ? 1 : 0;
    for (let pass = 0; pass < 3; pass++) { // smooth random noise into clumps
      const n2 = new Uint8Array(g);
      for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
        let c = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) c += g[(x + dx) + (y + dy) * N];
        n2[x + y * N] = c >= 5 ? 1 : 0;
      }
      g = n2;
    }
    // keep only the largest connected open area
    let best = null;
    const seen = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) {
      if (g[i] !== 0 || seen[i]) continue;
      const r = bfs(g, i % N, (i / N) | 0);
      r.cells.forEach(c => { seen[c] = 1; });
      if (!best || r.cells.length > best.cells.length) best = r;
    }
    if (!best || best.cells.length < 380) continue;
    const open = new Set(best.cells);
    for (let i = 0; i < N * N; i++) if (g[i] === 0 && !open.has(i)) g[i] = 1;
    // spawn and boss lair sit at opposite ends of the zone
    const a = bfs(g, best.cells[0] % N, (best.cells[0] / N) | 0).last;
    const fromSpawn = bfs(g, a % N, (a / N) | 0);
    const lair = fromSpawn.last;
    const fromLair = bfs(g, lair % N, (lair / N) | 0);
    const deco = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) deco[i] = Math.floor(rnd() * zone.walls.length);
    const free = best.cells.filter(c => fromSpawn.dist[c] > 3 && fromLair.dist[c] > 2);
    for (let i = free.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [free[i], free[j]] = [free[j], free[i]]; }
    const cell = c => ({ x: c % N + 0.5, y: ((c / N) | 0) + 0.5 });
    const nodes = free.splice(0, 30).map(c => ({ ...cell(c), k: Math.floor(rnd() * zone.nodes.length), t: 0 }));
    const chests = free.splice(0, 4).map(c => ({ ...cell(c), t: 0 }));
    const homes = free.filter(c => fromSpawn.dist[c] > 6).slice(0, 26).map(cell);
    // decorations that you can walk over
    const props = free.slice(40, 110).map(c => ({ ...cell(c), s: zone.deco[Math.floor(rnd() * zone.deco.length)], ox: rnd() - 0.5, oy: rnd() - 0.5 }));
    return { g, deco, spawn: cell(a), lair: cell(lair), nodes, chests, homes, props };
  }
  throw new Error('map generation failed');
}

/* ---------- runtime world (not saved) ---------- */
let W = null;
const keysDown = {};
let joy = null;
let advCanvas = null, advCtx = null, advRaf = 0, advLast = 0;

function spawnMob(home, boss) {
  const zone = ZONES[W.zi], s = zoneScale(W.zi);
  const base = boss ? zone.boss : zone.mobs[Math.floor(Math.random() * zone.mobs.length)];
  // about 1 in 12 monsters is an elite with a special trait
  const elite = !boss && Math.random() < 0.08 ? ELITES[Math.floor(Math.random() * ELITES.length)] : null;
  const hp = Math.round((boss ? 150 : base.hp) * s * (elite ? (elite.hp || 1.6) : 1));
  return { n: base.n, spr: base.spr, i: base.i, boss: !!boss, elite, x: home.x, y: home.y, home, hp, max: hp,
    atk: (boss ? 7 : base.atk) * s * (elite ? (elite.atk || 1.25) : 1), spd: (boss ? 1.6 : base.spd) * (elite && elite.spd || 1),
    scale: boss ? base.scale : 1, cd: 0, wander: null, wt: 0, deadUntil: 0, hurt: 0, dir: 0, moving: false, kx: 0, ky: 0 };
}
function enterZone(zi) {
  S.adv.zone = Math.min(zi, maxZone());
  const map = genMap(S.adv.zone, S.adv.tier);
  W = { zi: S.adv.zone, map, time: 0, px: map.spawn.x, py: map.spawn.y, atkCd: 0, cds: {}, healCd: 0, lastHit: -99,
    floaters: [], fx: [], mobs: [], dir: 0, moving: false, cry: 0, shake: 0, seen: new Uint8Array(MAP_N * MAP_N) };
  W.mobs = map.homes.map(h => spawnMob(h, false));
  W.mobs.push(spawnMob(map.lair, true));
  S.adv.hp = heroStats().hp;
  playMusic(ZONES[W.zi].music);
  dirty = true;
}
const solid = (x, y) => W.map.g[(x | 0) + (y | 0) * MAP_N] !== 0;
function moveBody(b, dx, dy) {
  const r = 0.28;
  const nx = b.x + dx;
  if (!solid(nx - r, b.y - r) && !solid(nx + r, b.y - r) && !solid(nx - r, b.y + r) && !solid(nx + r, b.y + r)) b.x = nx;
  const ny = b.y + dy;
  if (!solid(b.x - r, ny - r) && !solid(b.x + r, ny - r) && !solid(b.x - r, ny + r) && !solid(b.x + r, ny + r)) b.y = ny;
}
// 0 = down, 1 = up, 2 = left, 3 = right (column order in the sprite sheets)
const dirOf = (dx, dy) => (Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0));
function floater(x, y, text, color, big) { W.floaters.push({ x, y, text, color, t: 0, big }); }

function killMob(m) {
  const s = zoneScale(W.zi), zone = ZONES[W.zi], st = heroStats();
  m.deadUntil = W.time + (m.boss ? 120 : 30);
  W.fx.push({ k: 'smoke', x: m.x, y: m.y, t: 0, sc: m.boss ? 3 : 1.4 });
  S.adv.kills++;
  if (m.elite) S.adv.eliteKills = (S.adv.eliteKills || 0) + 1;
  gainXp(Math.round((m.boss ? 60 : m.elite ? 18 : 6) * Math.pow(1.4, W.zi + S.adv.tier * ZONES.length)));
  const coins = Math.round((m.boss ? 60 : 4) * s * priceMult() * (1 + st.greed / 100) * (m.elite && m.elite.gold || (m.elite ? 2 : 1)));
  S.coins += coins; S.stats.earned += coins; S.run.earned += coins;
  floater(m.x, m.y - 0.3, `🪙+${fmt(coins)}`, '#ffd84a');
  sfx(m.boss ? 'bossdie' : 'die');
  if (Math.random() < 0.5 || m.boss || m.elite) {
    const node = zone.nodes[Math.floor(Math.random() * zone.nodes.length)];
    const n = Math.ceil((1 + Math.random() * 3) * (m.boss ? 6 : m.elite ? 3 : 1));
    add(node[1], n);
    floater(m.x, m.y - 0.7, `${node[0]}+${n}`, '#fff');
  }
  const dropChance = 0.12 * (1 + 0.1 * talent('luck'));
  if (m.boss || m.elite || Math.random() < dropChance) {
    const g = makeGear(zoneIlvl(W.zi), m.boss || !!m.elite, null, m.boss ? 2 : m.elite ? 1 : 0);
    const where = giveGear(g);
    floater(m.x, m.y - 1.1, `${g.icon} ${RARITY[g.r].name}!`, RARITY[g.r].color, true);
    if (g.r >= 2 || m.boss) toast(`${g.icon} Found <b style="color:${RARITY[g.r].color}">${gearName(g)}</b>${where === 'equipped' ? ' — equipped' : where === 'salvaged' ? ' — bag full, salvaged' : ''}`);
    if (g.r >= 3) sfx('rare');
    dirty = true;
  }
  if (m.boss) {
    S.adv.bossKills++;
    gainInsight(5);
    W.shake = 0.5;
    const first = !S.adv.bosses[zone.id];
    S.adv.bosses[zone.id] = 1;
    if (first) {
      const next = ZONES[W.zi + 1];
      sfx('victory');
      showModal(`<h2>${m.i} ${m.n} defeated!</h2>
        <p class="muted">${next ? `The way to <b>${next.icon} ${next.name}</b> is open. Travel there from the Zones tab.`
          : 'You have conquered every zone! Raise the threat level in the Zones tab for stronger monsters and better gear.'}</p>
        <button class="btn primary wide" data-a="close-modal">Onward</button>`);
    }
    dirty = true;
  }
}
function hitMob(m, dmg, kind) {
  const st = heroStats();
  const crit = Math.random() * 100 < st.crit;
  dmg = Math.max(1, Math.round(dmg * (0.9 + Math.random() * 0.2) * (crit ? st.critd / 100 + 1 : 1) * (W.cry > W.time ? 1.5 : 1)));
  m.hp -= dmg;
  m.hurt = W.time + 5;
  m.flash = W.time;
  // knock the monster back a little, away from the hero
  const d = Math.hypot(m.x - W.px, m.y - W.py) || 1;
  if (!m.boss) moveBody(m, (m.x - W.px) / d * 0.18, (m.y - W.py) / d * 0.18);
  if (st.leech) S.adv.hp = Math.min(st.hp, S.adv.hp + dmg * st.leech / 100);
  floater(m.x, m.y - 0.5, (crit ? '💥' : '') + fmt(dmg), crit ? '#ffb020' : '#fff', crit);
  if (crit) W.shake = Math.max(W.shake, 0.12);
  sfx(kind === 'skill' ? 'skillhit' : crit ? 'crit' : 'hit');
  if (m.hp <= 0) killMob(m);
}
function heroDown() {
  toast('💫 You were knocked out and carried back to camp');
  sfx('ko');
  W.px = W.map.spawn.x; W.py = W.map.spawn.y;
  S.adv.hp = heroStats().hp;
  for (const m of W.mobs) { m.hurt = 0; if (!m.deadUntil) m.hp = m.max; }
}
const skillReady = id => !W.cds[id] || W.cds[id] <= W.time;
const skillUnlocked = sk => S.adv.lvl >= sk.lvl;
function useSkill(id) {
  const sk = SKILLS.find(k => k.id === id);
  if (!W || !sk || !skillUnlocked(sk) || !skillReady(id)) return;
  W.cds[id] = W.time + sk.cd;
  const st = heroStats(), mult = 1 + 0.25 * talent('cleave');
  if (id === 'spin') {
    W.fx.push({ k: 'spin', x: W.px, y: W.py, t: 0 });
    for (const m of W.mobs) if (!m.deadUntil && Math.hypot(m.x - W.px, m.y - W.py) < 2.3) hitMob(m, st.atk * 2.2 * mult, 'skill');
    sfx('spin');
  } else if (id === 'dash') {
    const v = [[0, 1], [0, -1], [-1, 0], [1, 0]][W.dir];
    const hitSet = new Set();
    for (let i = 0; i < 12; i++) {
      const hero = { x: W.px, y: W.py };
      moveBody(hero, v[0] * 0.3, v[1] * 0.3);
      W.px = hero.x; W.py = hero.y;
      W.fx.push({ k: 'ghost', x: W.px, y: W.py, t: -i * 0.02, dir: W.dir });
      for (const m of W.mobs) if (!m.deadUntil && !hitSet.has(m) && Math.hypot(m.x - W.px, m.y - W.py) < 1.1) { hitSet.add(m); hitMob(m, st.atk * 1.5 * mult, 'skill'); }
    }
    sfx('dash');
  } else if (id === 'cry') {
    W.cry = W.time + 8;
    W.fx.push({ k: 'cry', x: W.px, y: W.py, t: 0 });
    floater(W.px, W.py - 1, 'War Cry!', '#ffb020', true);
    sfx('cry');
  }
  buzz();
}
function healItem() { return HEALS.find(([id]) => have(id) >= 1); }
function advHeal() {
  const h = healItem(), max = heroStats().hp;
  if (!W || W.healCd > 0) return;
  if (!h) return toast('No food or potions to use. Bread, pie, stew and potions all heal.');
  if (S.adv.hp >= max) return;
  S.items[h[0]] -= 1;
  const amt = h[1] * (1 + 0.15 * talent('wind'));
  S.adv.hp = Math.min(max, S.adv.hp + max * amt);
  W.healCd = 3;
  W.fx.push({ k: 'heal', x: W.px, y: W.py, t: 0 });
  floater(W.px, W.py - 0.8, `${ITEMS[h[0]].icon} +${Math.round(amt * 100)}%`, '#7be08a');
  sfx('heal');
  dirty = true;
}

function advUpdate(dt) {
  const st = heroStats();
  W.time += dt;
  W.healCd -= dt;
  W.shake = Math.max(0, W.shake - dt);

  // hero movement: joystick or keyboard
  let dx = 0, dy = 0;
  if (joy) { dx = joy.dx; dy = joy.dy; }
  if (keysDown.ArrowLeft || keysDown.a) dx -= 1;
  if (keysDown.ArrowRight || keysDown.d) dx += 1;
  if (keysDown.ArrowUp || keysDown.w) dy -= 1;
  if (keysDown.ArrowDown || keysDown.s) dy += 1;
  const len = Math.hypot(dx, dy);
  W.moving = len > 0.1;
  if (W.moving) {
    W.dir = dirOf(dx, dy);
    const sp = 3.6 * (1 + st.move / 100) * Math.min(1, len) / len;
    const hero = { x: W.px, y: W.py };
    moveBody(hero, dx * sp * dt, dy * sp * dt);
    W.px = hero.x; W.py = hero.y;
    if ((W.stepT = (W.stepT || 0) - dt) <= 0) { W.stepT = 0.32; sfx('step'); }
  }
  // fog of war: remember what you have seen for the minimap
  for (let yy = -5; yy <= 5; yy++) for (let xx = -5; xx <= 5; xx++) {
    const cx = (W.px | 0) + xx, cy = (W.py | 0) + yy;
    if (cx >= 0 && cy >= 0 && cx < MAP_N && cy < MAP_N && xx * xx + yy * yy < 30) W.seen[cx + cy * MAP_N] = 1;
  }

  // monsters
  let nearest = null, nearD = 1.35;
  for (const m of W.mobs) {
    if (m.deadUntil) {
      if (W.time >= m.deadUntil) Object.assign(m, spawnMob(m.home, m.boss));
      continue;
    }
    const d = Math.hypot(m.x - W.px, m.y - W.py);
    const reach = m.boss ? 1.6 : 0.8;
    if (d < nearD + (m.boss ? 0.6 : 0)) { nearD = d; nearest = m; }
    m.cd -= dt;
    const aggro = d < (m.boss ? 6.5 : 5) || (m.hurt > W.time && d < 12);
    const ox = m.x, oy = m.y;
    if (aggro) {
      if (d > reach) moveBody(m, (W.px - m.x) / d * m.spd * dt, (W.py - m.y) / d * m.spd * dt);
      else if (m.cd <= 0) {
        m.cd = m.boss ? 1.4 : 1.1;
        m.lunge = W.time;
        const dmg = Math.max(1, Math.round((m.atk - st.def * 0.6) * (0.85 + Math.random() * 0.3)));
        S.adv.hp -= dmg;
        W.lastHit = W.time;
        if (m.elite && m.elite.leech) m.hp = Math.min(m.max, m.hp + dmg * m.elite.leech * 4);
        floater(W.px, W.py - 0.6, '-' + fmt(dmg), '#ff5b4d');
        W.shake = Math.max(W.shake, m.boss ? 0.25 : 0.08);
        sfx('hurt');
      }
    } else {
      if ((m.wt -= dt) <= 0) {
        m.wt = 2 + Math.random() * 3;
        m.wander = Math.random() < 0.6 ? { x: m.home.x + (Math.random() * 4 - 2), y: m.home.y + (Math.random() * 4 - 2) } : null;
      }
      if (m.wander) {
        const wd = Math.hypot(m.wander.x - m.x, m.wander.y - m.y);
        if (wd > 0.2) moveBody(m, (m.wander.x - m.x) / wd * m.spd * 0.4 * dt, (m.wander.y - m.y) / wd * m.spd * 0.4 * dt);
      }
      if (m.hp < m.max) m.hp = Math.min(m.max, m.hp + m.max * 0.1 * dt);
    }
    const mdx = m.x - ox, mdy = m.y - oy;
    m.moving = Math.abs(mdx) + Math.abs(mdy) > 0.001;
    if (m.moving) m.dir = dirOf(mdx, mdy);
    else if (aggro) m.dir = dirOf(W.px - m.x, W.py - m.y);
  }
  if (S.adv.hp <= 0) heroDown();
  // hero auto-attacks the nearest monster in reach
  W.atkCd -= dt * (1 + st.haste / 100) * (W.cry > W.time ? 1.5 : 1);
  if (nearest && W.atkCd <= 0) {
    W.atkCd = 0.55;
    W.attackT = W.time;
    W.dir = dirOf(nearest.x - W.px, nearest.y - W.py);
    W.fx.push({ k: 'slash', x: (W.px + nearest.x) / 2, y: (W.py + nearest.y) / 2, t: 0, dir: W.dir });
    hitMob(nearest, st.atk);
  }
  // regeneration: talents always, resting when nothing has hit you for a while
  const regen = st.hp * (0.01 * talent('regen') + (W.time - W.lastHit > 4 ? 0.05 : 0));
  if (S.adv.hp < st.hp) S.adv.hp = Math.min(st.hp, S.adv.hp + regen * dt);

  // gathering nodes and chests: stand on them
  const zone = ZONES[W.zi];
  for (const n of W.map.nodes) {
    if (n.t > W.time || Math.hypot(n.x - W.px, n.y - W.py) > 0.6) continue;
    const def = zone.nodes[n.k];
    const amt = Math.ceil(def[2] * (0.6 + Math.random() * 0.8) * (1 + 0.25 * perk('gather')) * (1 + st.forage / 100));
    add(def[1], amt);
    n.t = W.time + 45;
    floater(n.x, n.y - 0.4, `${def[0]}+${amt}`, '#fff');
    sfx('pickup');
    buzz();
  }
  for (const c of W.map.chests) {
    if (c.t > W.time || Math.hypot(c.x - W.px, c.y - W.py) > 0.6) continue;
    c.t = W.time + 600;
    const coins = Math.round(25 * zoneScale(W.zi) * priceMult());
    S.coins += coins; S.stats.earned += coins; S.run.earned += coins;
    floater(c.x, c.y - 0.4, `🪙+${fmt(coins)}`, '#ffd84a', true);
    if (Math.random() < 0.5) {
      const g = makeGear(zoneIlvl(W.zi), false);
      giveGear(g);
      floater(c.x, c.y - 0.9, `${g.icon} ${RARITY[g.r].name}!`, RARITY[g.r].color);
      dirty = true;
    }
    sfx('chest');
    buzz();
  }
  for (const f of W.floaters) f.t += dt;
  W.floaters = W.floaters.filter(f => f.t < 1);
  for (const f of W.fx) f.t += dt;
  W.fx = W.fx.filter(f => f.t < 0.6);
}

/* ---------- drawing ---------- */
// Cheap repeatable noise so every tile keeps the same decoration.
const tileHash = (x, y) => { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function shadow(ctx, x, y, r) {
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.4, 0, 0, 7); ctx.fill();
}
// One frame of a 4-direction sheet (column = direction, row = animation frame).
function drawDir4(ctx, name, x, y, sc, dir, frame, white) {
  const a = ANIM[name];
  if (!a) return;
  const fx = dir * a.fw, fy = (frame % a.rows) * a.fh;
  drawSprite(ctx, name, x, y, sc, fx, fy, a.fw, a.fh);
  if (white) { ctx.globalCompositeOperation = 'source-atop'; ctx.globalCompositeOperation = 'source-over'; }
}
function drawStrip(ctx, name, x, y, sc, frame, flip) {
  const a = ANIM[name];
  if (!a) return;
  drawSprite(ctx, name, x, y, sc, (frame % a.cols) * a.fw, 0, a.fw, a.fh, flip);
}
// A white silhouette of a frame, for the hit flash.
const flashCache = new Map();
function drawFlash(ctx, name, x, y, sc, sx, sy, sw, sh) {
  const key = name + sx + ',' + sy;
  let c = flashCache.get(key);
  if (!c) {
    const r = SPR[name];
    c = document.createElement('canvas'); c.width = sw; c.height = sh;
    const g = c.getContext('2d');
    g.drawImage(ATLAS_IMG, r[0] + sx, r[1] + sy, sw, sh, 0, 0, sw, sh);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, sw, sh);
    flashCache.set(key, c);
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(c, Math.round(x - sw * sc / 2), Math.round(y - sh * sc / 2), sw * sc, sh * sc);
}

function advDraw() {
  const c = advCanvas, ctx = advCtx, dpr = window.devicePixelRatio || 1;
  const w = c.clientWidth, h = c.clientHeight;
  if (!w || !h) return;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const SC = w < 520 ? 3 : 4;          // whole-number pixel scale keeps the art crisp
  const T = 16 * SC;
  const zone = ZONES[W.zi], map = W.map;
  const sh = W.shake > 0 ? (Math.random() - 0.5) * 10 * W.shake / 0.25 : 0;
  const camX = Math.round(W.px * T - w / 2 + sh), camY = Math.round(W.py * T - h / 2 + sh);
  ctx.fillStyle = zone.wallBg;
  ctx.fillRect(0, 0, w, h);
  const x0 = Math.floor(camX / T) - 1, x1 = Math.ceil((camX + w) / T) + 1;
  const y0 = Math.floor(camY / T) - 1, y1 = Math.ceil((camY + h) / T) + 2;
  const inMap = (x, y) => x >= 0 && y >= 0 && x < MAP_N && y < MAP_N;
  const isWall = (x, y) => !inMap(x, y) || map.g[x + y * MAP_N] !== 0;
  const at = (x, y) => [x * T - camX, y * T - camY];

  // ground tiles (and water under island walls)
  const gTile = (x, y) => { const r = tileHash(x, y); return r < 0.72 ? zone.ground : zone.ground + (1 + Math.floor((r - 0.72) / 0.07)); };
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const sx = x * T - camX + T / 2, sy = y * T - camY + T / 2;
    if (isWall(x, y) && zone.water) {
      const r = tileHash(x + 3, y + 9);
      drawSprite(ctx, r < 0.9 ? 'w_water' : r < 0.95 ? 'w_water1' : 'w_water2', sx, sy, SC);
      continue;
    }
    drawSprite(ctx, gTile(x, y), sx, sy, SC);
    if (isWall(x, y)) { ctx.fillStyle = 'rgba(20,30,10,.35)'; ctx.fillRect(sx - T / 2, sy - T / 2, T, T); }
  }
  // big props (trees, boulders, the tent) are drawn one size smaller so they fit the grid
  const propScale = name => (SPR[name][2] > 20 ? SC - 1 : SC);
  // walkable decorations
  for (const p of map.props) {
    const [sx, sy] = at(p.x + p.ox * 0.4, p.y + p.oy * 0.4);
    if (sx < -T || sy < -T || sx > w + T || sy > h + T) continue;
    drawSprite(ctx, p.s, sx, sy, propScale(p.s));
  }
  // draw everything with depth: walls, nodes, chests, monsters and the hero, sorted by y
  const items = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!isWall(x, y)) continue;
    let name;
    const r = tileHash(x + 91, y + 17);
    if (zone.water) {
      // palms only along the shore
      const shore = !isWall(x + 1, y) || !isWall(x - 1, y) || !isWall(x, y + 1) || !isWall(x, y - 1);
      if (!shore || r > 0.45) continue;
      name = 'palm';
    } else name = zone.walls[inMap(x, y) ? map.deco[x + y * MAP_N] : Math.floor(tileHash(x, y + 5) * zone.walls.length)];
    items.push({ y: y + 0.5, draw: () => {
      const [sx, sy] = at(x + 0.5 + (r - 0.5) * 0.25, y + 0.5);
      const spr = SPR[name], sc = propScale(name);
      shadow(ctx, sx, sy + T * 0.42, T * 0.5);
      drawSprite(ctx, name, sx, sy + T / 2 - spr[3] * sc / 2, sc);
    } });
  }
  const pulse = Math.sin(W.time * 4);
  for (const n of map.nodes) if (n.t <= W.time) items.push({ y: n.y, draw: () => {
    const [sx, sy] = at(n.x, n.y);
    const def = zone.nodes[n.k];
    ctx.fillStyle = `rgba(255,236,150,${0.16 + pulse * 0.06})`;
    ctx.beginPath(); ctx.ellipse(sx, sy + T * 0.3, T * 0.45, T * 0.2, 0, 0, 7); ctx.fill();
    drawSprite(ctx, def[3], sx, sy, propScale(def[3]));
    drawSprite(ctx, PX_EMOJI[def[0].replace(/️/g, '')], sx + T * 0.32, sy - T * 0.42, 1);
  } });
  for (const ch of map.chests) if (ch.t <= W.time) items.push({ y: ch.y, draw: () => {
    const [sx, sy] = at(ch.x, ch.y);
    ctx.fillStyle = `rgba(255,216,74,${0.25 + pulse * 0.08})`;
    ctx.beginPath(); ctx.arc(sx, sy, T * 0.55, 0, 7); ctx.fill();
    shadow(ctx, sx, sy + T * 0.32, T * 0.35);
    drawSprite(ctx, 'giftbox', sx, sy - Math.abs(pulse) * 3, SC);
  } });
  { const [sx, sy] = at(map.spawn.x - 1.1, map.spawn.y - 0.9); items.push({ y: map.spawn.y - 1.1, draw: () => drawSprite(ctx, 'camp', sx, sy, propScale('camp')) }); }

  for (const m of W.mobs) {
    if (m.deadUntil) continue;
    items.push({ y: m.y, draw: () => drawMob(ctx, m, at, SC, T) });
  }
  items.push({ y: W.py, draw: () => drawHero(ctx, w / 2 - sh, h / 2 - sh, SC, T) });
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.draw();

  // effects
  for (const f of W.fx) {
    if (f.t < 0) continue;
    const [sx, sy] = at(f.x, f.y);
    if (f.k === 'slash') {
      const a = ANIM.fx_slash, fr = Math.min(a.cols - 1, Math.floor(f.t / 0.3 * a.cols));
      if (f.t < 0.3) drawStrip(ctx, 'fx_slash', sx, sy, SC * 0.8, fr, f.dir === 2);
    } else if (f.k === 'spin') {
      const a = ANIM.fx_spin, fr = Math.min(a.cols - 1, Math.floor(f.t / 0.4 * a.cols));
      if (f.t < 0.4) drawStrip(ctx, 'fx_spin', sx, sy, SC * 1.2, fr);
    } else if (f.k === 'smoke') {
      const a = ANIM.fx_smoke, fr = Math.min(a.cols - 1, Math.floor(f.t / 0.5 * a.cols));
      if (f.t < 0.5) drawStrip(ctx, 'fx_smoke', sx, sy, SC * f.sc / 1.4, fr);
    } else if (f.k === 'ghost') {
      ctx.globalAlpha = Math.max(0, 0.5 - f.t);
      drawDir4(ctx, 'hero_' + S.adv.look, sx, sy, SC, f.dir, 1);
      ctx.globalAlpha = 1;
    } else if (f.k === 'heal' || f.k === 'lvl' || f.k === 'cry') {
      const col = f.k === 'heal' ? '120,230,140' : f.k === 'cry' ? '255,160,40' : '255,216,74';
      ctx.strokeStyle = `rgba(${col},${0.8 - f.t * 1.3})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, T * (0.4 + f.t * 2), 0, 7); ctx.stroke();
    }
  }
  for (const f of W.floaters) {
    const [sx, sy] = at(f.x, f.y - f.t * 0.9);
    ctx.globalAlpha = Math.min(1, 1.6 - f.t * 1.6);
    drawLabel(ctx, f.text, sx, sy, f.big ? T * 0.42 : T * 0.32, f.color);
  }
  ctx.globalAlpha = 1;

  // soft vignette
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  if (W.time - W.lastHit < 0.25) { ctx.fillStyle = `rgba(200,0,0,${0.18 - (W.time - W.lastHit) * 0.7})`; ctx.fillRect(0, 0, w, h); }

  // pointer toward the boss lair when it is off screen
  const boss = W.mobs[W.mobs.length - 1];
  const [bx, by] = at(map.lair.x, map.lair.y);
  if (!boss.deadUntil && (bx < 0 || bx > w || by < 0 || by > h)) {
    const ang = Math.atan2(by - h / 2, bx - w / 2), r = Math.min(w, h) / 2 - 34;
    drawIcon(ctx, '☠', w / 2 + Math.cos(ang) * r, h / 2 + Math.sin(ang) * r, T * 0.5 * (1 + pulse * 0.08));
  }
  drawMinimap(ctx, w);
  if (joy) {
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(joy.ox, joy.oy, 46, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(joy.ox + joy.dx * 46, joy.oy + joy.dy * 46, 20, 0, 7); ctx.fill();
  }
}

function drawMob(ctx, m, at, SC, T) {
  const [sx, sy] = at(m.x, m.y);
  const flash = W.time - (m.flash || -9) < 0.1;
  const lunge = W.time - (m.lunge || -9) < 0.15 ? 4 : 0;
  if (m.boss) {
    const a = ANIM[m.spr], sc = m.scale;
    ctx.fillStyle = `rgba(192,38,211,${0.18 + Math.sin(W.time * 4) * 0.05})`;
    ctx.beginPath(); ctx.ellipse(sx, sy + a.fh * sc * 0.4, a.fw * sc * 0.55, a.fw * sc * 0.2, 0, 0, 7); ctx.fill();
    const fr = Math.floor(W.time * 6) % a.cols;
    if (flash) drawFlash(ctx, m.spr, sx, sy - a.fh * sc * 0.2, sc, fr * a.fw, 0, a.fw, a.fh);
    else drawStrip(ctx, m.spr, sx, sy - a.fh * sc * 0.2 + lunge, sc, fr, W.px < m.x);
    hpBar(ctx, m, sx, sy - a.fh * sc * 0.75, T * 1.8, T);
    drawLabel(ctx, m.n, sx, sy - a.fh * sc * 0.75 - 14, T * 0.3, '#f6d0ff');
    return;
  }
  const sc = SC * (m.elite ? 1.25 : 1);
  if (m.elite) {
    ctx.fillStyle = m.elite.color + '55';
    ctx.beginPath(); ctx.arc(sx, sy, T * 0.6, 0, 7); ctx.fill();
  }
  shadow(ctx, sx, sy + T * 0.4, T * 0.32);
  const fr = m.moving ? Math.floor(W.time * 8 + m.home.x) % 4 : 0;
  const ly = sy - (m.dir === 1 ? -lunge : lunge);
  if (flash) drawFlash(ctx, m.spr, sx, ly, sc, m.dir * 16, fr * 16, 16, 16);
  else drawDir4(ctx, m.spr, sx, ly, sc, m.dir, fr);
  if (m.hp < m.max || m.elite) hpBar(ctx, m, sx, sy - T * 0.75, T * 0.9, T);
  if (m.elite) drawLabel(ctx, m.elite.name, sx, sy - T * 0.98, T * 0.26, m.elite.color);
}
function hpBar(ctx, m, x, y, bw) {
  ctx.fillStyle = '#17110c'; ctx.fillRect(Math.round(x - bw / 2 - 2), Math.round(y - 2), Math.round(bw + 4), 9);
  ctx.fillStyle = m.boss ? '#c026d3' : '#e5484d'; ctx.fillRect(Math.round(x - bw / 2), Math.round(y), Math.round(bw * Math.max(0, m.hp / m.max)), 5);
  ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(Math.round(x - bw / 2), Math.round(y), Math.round(bw * Math.max(0, m.hp / m.max)), 2);
}
function drawHero(ctx, hx, hy, SC, T) {
  const name = 'hero_' + S.adv.look;
  shadow(ctx, hx, hy + T * 0.42, T * 0.32);
  if (W.cry > W.time) {
    ctx.fillStyle = `rgba(255,160,40,${0.22 + Math.sin(W.time * 10) * 0.08})`;
    ctx.beginPath(); ctx.arc(hx, hy, T * 0.65, 0, 7); ctx.fill();
  }
  // row 4 of the sheet is the attack pose; rows 0-3 are the walk cycle
  const attacking = W.time - (W.attackT || -9) < 0.18;
  const row = attacking ? 4 : W.moving ? Math.floor(W.time * 9) % 4 : 0;
  if (W.time - W.lastHit < 0.1) drawFlash(ctx, name, hx, hy, SC, W.dir * 16, row * 16, 16, 16);
  else drawDir4(ctx, name, hx, hy, SC, W.dir, row);
}
function drawMinimap(ctx, w) {
  const s = 2.4, size = MAP_N * s, x0 = w - size - 8, y0 = 8;
  ctx.fillStyle = 'rgba(10,8,6,.55)'; ctx.fillRect(x0 - 3, y0 - 3, size + 6, size + 6);
  const map = W.map;
  for (let y = 0; y < MAP_N; y++) for (let x = 0; x < MAP_N; x++) {
    if (!W.seen[x + y * MAP_N]) continue;
    ctx.fillStyle = map.g[x + y * MAP_N] ? 'rgba(90,80,70,.8)' : 'rgba(220,210,180,.85)';
    ctx.fillRect(x0 + x * s, y0 + y * s, s, s);
  }
  ctx.fillStyle = '#ffd84a';
  for (const c of map.chests) if (c.t <= W.time && W.seen[(c.x | 0) + (c.y | 0) * MAP_N]) ctx.fillRect(x0 + c.x * s - 1.5, y0 + c.y * s - 1.5, 3, 3);
  const boss = W.mobs[W.mobs.length - 1];
  if (!boss.deadUntil) { ctx.fillStyle = '#e040fb'; ctx.fillRect(x0 + map.lair.x * s - 2, y0 + map.lair.y * s - 2, 4, 4); }
  ctx.fillStyle = '#fff'; ctx.fillRect(x0 + W.px * s - 2, y0 + W.py * s - 2, 4, 4);
}

function advFrame(ts) {
  advRaf = 0;
  if (!advCanvas || !advCanvas.isConnected || tab !== 'hero' || subTab.hero !== 'world') return;
  const dt = Math.min(0.05, (ts - advLast) / 1000 || 0);
  advLast = ts;
  if ($('#modal').hidden && !tutorialBlocking()) advUpdate(dt);
  advDraw();
  advRaf = requestAnimationFrame(advFrame);
}

// Called after every render: put the persistent canvas back in place and keep the loop running.
function advMount() {
  const host = document.getElementById('advhost');
  if (!host) return;
  if (!advCanvas) {
    advCanvas = document.createElement('canvas');
    advCanvas.id = 'advcanvas';
    advCtx = advCanvas.getContext('2d');
    advCanvas.addEventListener('pointerdown', e => {
      const r = advCanvas.getBoundingClientRect();
      joy = { id: e.pointerId, ox: e.clientX - r.left, oy: e.clientY - r.top, dx: 0, dy: 0 };
      e.preventDefault();
    });
    window.addEventListener('pointermove', e => {
      if (!joy || e.pointerId !== joy.id) return;
      const r = advCanvas.getBoundingClientRect();
      const dx = (e.clientX - r.left - joy.ox) / 42, dy = (e.clientY - r.top - joy.oy) / 42, l = Math.hypot(dx, dy);
      joy.dx = l > 1 ? dx / l : dx; joy.dy = l > 1 ? dy / l : dy;
    });
    const end = e => { if (joy && e.pointerId === joy.id) joy = null; };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('keydown', e => {
      keysDown[e.key] = true;
      if (tab === 'hero' && W) {
        if (e.key === ' ') { useSkill('spin'); e.preventDefault(); }
        if (e.key === 'Shift') useSkill('dash');
        if (e.key === 'e') useSkill('cry');
        if (e.key === 'q') advHeal();
      }
    });
    window.addEventListener('keyup', e => { keysDown[e.key] = false; });
  }
  if (!W || W.zi !== S.adv.zone) enterZone(S.adv.zone);
  else playMusic(ZONES[W.zi].music);
  if (advCanvas.parentNode !== host) host.appendChild(advCanvas);
  if (!advRaf) { advLast = performance.now(); advRaf = requestAnimationFrame(advFrame); }
}

/* ---------- renderers ---------- */
function renderAdvWorld() {
  const zone = ZONES[S.adv.zone];
  return `
    <div id="advwrap">
      <div class="advhud">
        <div class="row between"><b>${zone.icon} ${zone.name}${S.adv.tier ? ` · threat ${S.adv.tier}` : ''}</b>
          <span class="small">Lv ${S.adv.lvl} · ❤️ <span data-k="advhp"></span></span></div>
        <div class="pbar hp"><div data-w="advhp"></div></div>
        <div class="pbar xp"><div data-w="advxp"></div></div>
      </div>
      <div id="advhost"></div>
      <div class="advbtns">
        <button class="advbtn" data-a="advheal" aria-label="Heal"><span data-k="advhealicon"></span><small data-k="advhealn"></small></button>
        ${SKILLS.map(sk => skillUnlocked(sk) ? `
          <button class="advbtn" data-a="skill" data-id="${sk.id}" aria-label="${sk.name}"><span class="sk">${sk.icon}</span><small data-k="skillcd:${sk.id}"></small></button>` : '').join('')}
      </div>
    </div>
    <p class="muted small center">Drag anywhere to walk. You attack nearby monsters automatically.
      Walk over resources and 🎁 chests to collect them. ☠️ points to the boss.</p>`;
}

function affixLines(g) {
  return (g.ax || []).map(([k, v]) => `<div class="affix">◆ ${AFFIXES[k].text(v)}</div>`).join('');
}
function gearCard(g, equipped) {
  const s = gearStats(g);
  const stats = [s.atk && `⚔️${fmt(s.atk)}`, s.def && `🛡️${fmt(s.def)}`, s.hp && `❤️${fmt(s.hp)}`].filter(Boolean).join(' ');
  const cur = S.adv.gear[g.slot];
  const better = !equipped && gearPower(g) > gearPower(cur);
  return `
    <div class="card gear r${g.r}">
      <div class="row between">
        <div class="rname"><span class="big2 rar r${g.r}">${g.icon}</span>
          <div><b style="color:${RARITY[g.r].color}">${gearName(g)}</b>
            <div class="muted small">${RARITY[g.r].name} ${SLOT_LABEL[g.slot].toLowerCase()} · ilvl ${g.il} · ${stats}${better ? ' <span class="hot">▲ better</span>' : ''}</div>
            ${affixLines(g)}</div></div>
      </div>
      <div class="row actions">
        ${equipped
          ? (g.up >= UPGRADE_MAX ? '<span class="muted small">fully upgraded</span>'
            : `<button class="btn small" data-a="gearup" data-id="${g.slot}" data-en="gearup:${g.slot}">Upgrade · ✨${fmt(upgradeCost(g))}</button>`)
          : `<button class="btn small ${better ? 'primary' : ''}" data-a="equip" data-n="${g.id}">Equip</button>
             <button class="btn small" data-a="salvage" data-n="${g.id}">Salvage · ✨${fmt(salvageValue(g))}</button>`}
      </div>
    </div>`;
}

function renderAdvGear() {
  const st = heroStats();
  const bag = [...S.adv.bag].sort((a, b) => gearPower(b) - gearPower(a));
  const extra = [['crit', 'crit', '%'], ['critd', 'crit dmg', '%'], ['leech', 'life steal', '%'], ['haste', 'atk speed', '%'],
    ['move', 'move speed', '%'], ['greed', 'coins', '%'], ['wisdom', 'xp', '%'], ['forage', 'gathering', '%']]
    .filter(([k]) => st[k] && !(k === 'crit' && st[k] === 5) && !(k === 'critd' && st[k] === 100));
  return `
    <div class="card herocard">
      <div class="heroport">${pxTag('i:hero_' + S.adv.look, 'port')}</div>
      <div class="grow">
        <div class="row between"><b>Hero · Level ${S.adv.lvl}</b><span class="muted small">${fmt(S.adv.xp)}/${fmt(xpNeed())} xp</span></div>
        <div class="gains"><div class="gain">⚔️ ${fmt(st.atk)}</div><div class="gain">🛡️ ${fmt(st.def)}</div><div class="gain">❤️ ${fmt(st.hp)}</div>
          <div class="gain">✨ <span data-k="essence"></span></div></div>
        ${extra.length ? `<div class="muted small" style="margin-top:6px">${extra.map(([k, l, u]) => `${l} ${k === 'crit' || k === 'critd' ? '' : '+'}${Math.round(st[k] * 10) / 10}${u}`).join(' · ')}</div>` : ''}
      </div>
    </div>
    <h3>Equipped</h3>
    ${['weapon', 'armor', 'trinket'].map(slot => S.adv.gear[slot] ? gearCard(S.adv.gear[slot], true)
      : `<div class="card locked-row muted">${SLOT_LABEL[slot]} — empty</div>`).join('')}
    <h3>Forge</h3>
    <div class="card">
      <div class="muted small">Reforge goods from your workshops into gear (item level ${zoneIlvl(maxZone())}, better odds of rare quality).</div>
      <div class="row actions">
        ${Object.entries(FORGE).map(([slot, item]) => `
          <button class="btn small" data-a="forge" data-id="${slot}" data-en="sell:${item}">${SLOT_LABEL[slot]} · ${ITEMS[item].icon} <span data-k="n:${item}"></span>/1</button>`).join('')}
      </div>
    </div>
    <h3>Bag <span class="muted small">${bag.length}/${BAG_MAX}</span></h3>
    ${bag.length ? `<div class="row actions" style="margin:0 0 10px"><button class="btn small" data-a="salvageweak">Salvage everything weaker than equipped</button></div>` : '<p class="muted center">Empty. Monsters, bosses and 🎁 chests drop gear.</p>'}
    ${bag.map(g => gearCard(g, false)).join('')}
    <h3>Appearance</h3>
    <div class="looks">${HEROES.map(h => `<button class="lookbtn ${S.adv.look === h ? 'on' : ''}" data-a="look" data-id="${h}">${pxTag('i:hero_' + h)}</button>`).join('')}</div>`;
}

function renderAdvTalents() {
  const free = talentPointsFree();
  return `
    <div class="card row between"><div><b>Talent points: <span class="hot">${free}</span></b>
      <div class="muted small">You earn one point every hero level. Each talent goes up to rank ${TALENT_MAX}.</div></div>
      <button class="btn small" data-a="respec" ${Object.keys(S.adv.talents).length ? '' : 'disabled'}>Reset</button></div>
    ${TALENTS.map(t => `
      <h3>${t.icon} ${t.tree}</h3>
      ${t.list.map(tl => `
        <div class="card row between talent">
          <div><b>${tl.name}</b> <span class="pips">${'●'.repeat(talent(tl.id))}${'○'.repeat(TALENT_MAX - talent(tl.id))}</span>
            <div class="muted small">${tl.text(Math.max(1, talent(tl.id)))}${talent(tl.id) ? '' : ' (at rank 1)'}</div></div>
          ${talent(tl.id) >= TALENT_MAX ? '<span class="muted small">max</span>'
            : `<button class="btn small ${free ? 'primary' : ''}" data-a="talent" data-id="${tl.id}" ${free ? '' : 'disabled'}>+1</button>`}
        </div>`).join('')}`).join('')}
    <h3>Skills</h3>
    ${SKILLS.map(sk => `
      <div class="card row between ${skillUnlocked(sk) ? '' : 'locked-row'}">
        <div class="rname"><span class="big2"><span class="sk">${sk.icon}</span></span>
          <div><b>${sk.name}</b> <span class="muted small">${skillUnlocked(sk) ? `${sk.cd}s cooldown` : `unlocks at hero level ${sk.lvl}`}</span>
          <div class="muted small">${sk.desc}</div></div></div>
      </div>`).join('')}`;
}

function renderAdvZones() {
  const mz = maxZone();
  return `
    <p class="muted small">Defeat a zone's boss to open the next one. Tougher zones drop higher-level gear.
      Glowing <b>elite</b> monsters are rare and always drop gear.</p>
    ${ZONES.map((z, i) => i <= mz ? `
      <div class="card row between">
        <div class="rname"><span class="big2">${z.icon}</span>
          <div><b>${z.name}</b> <span class="muted small">item level ${zoneIlvl(i)}</span>
            <div class="small">${z.mobs.map(m => m.i).join(' ')} <span class="muted">· boss</span> ${z.boss.i} <span class="muted">${z.boss.n}</span> ${S.adv.bosses[z.id] ? '<span class="hot">✓</span>' : ''}</div></div></div>
        ${i === S.adv.zone ? '<span class="hot small">here</span>' : `<button class="btn small" data-a="travel" data-n="${i}">Travel</button>`}
      </div>` : `
      <div class="card locked-row muted">🔒 ${z.icon} ${z.name} — defeat ${ZONES[i - 1].boss.i} ${ZONES[i - 1].boss.n} first</div>`).join('')}
    ${allBossesDown() ? `
      <div class="card">
        <b>☠️ Raise the threat level</b>
        <div class="muted small">Every zone gets much stronger monsters and gear ${ZONES.length} item levels higher. Bosses must be beaten again to reopen the zones.</div>
        <div class="row actions"><button class="btn danger" data-a="threat">Raise threat to ${S.adv.tier + 1}</button></div>
      </div>` : ''}`;
}

SUBS.hero = [
  ['world', '🗺️ World', () => true, renderAdvWorld],
  ['gear', '🛡️ Gear', () => true, renderAdvGear],
  ['talents', '⭐ Talents', () => true, renderAdvTalents],
  ['zones', '🧭 Zones', () => true, renderAdvZones],
];
subTab.hero = 'world';

Object.assign(WIDTHS, {
  advhp: () => Math.max(0, S.adv.hp / heroStats().hp * 100),
  advxp: () => S.adv.xp / xpNeed() * 100,
});
const ADV_K = {
  advhp: () => `${fmt(Math.max(0, S.adv.hp))}/${fmt(heroStats().hp)}`,
  skillcd: id => (W && !skillReady(id) ? Math.ceil(W.cds[id] - W.time) + 's' : ''),
  advhealicon: () => { const h = healItem(); return h ? ITEMS[h[0]].icon : '🧪'; },
  advhealn: () => { const h = healItem(); return h ? fmt(have(h[0])) : '0'; },
  essence: () => fmt(S.adv.essence),
};
const ADV_E = {
  gearup: slot => { const g = S.adv.gear[slot]; return !!g && S.adv.essence >= upgradeCost(g); },
};

function advAction(a, id, n) {
  switch (a) {
    case 'skill': useSkill(id); break;
    case 'advheal': advHeal(); break;
    case 'equip': equipGear(+n); break;
    case 'salvage': salvageGear(+n); break;
    case 'salvageweak': salvageWeak(); break;
    case 'gearup': upgradeGear(id); break;
    case 'forge': forgeGear(id); break;
    case 'talent': learnTalent(id); break;
    case 'respec': S.adv.talents = {}; dirty = true; break;
    case 'look': S.adv.look = id; dirty = true; break;
    case 'travel': enterZone(+n); subTab.hero = 'world'; break;
    case 'threat':
      if (!allBossesDown()) break;
      S.adv.tier++; S.adv.bosses = {};
      enterZone(0); subTab.hero = 'world';
      toast(`☠️ Threat level ${S.adv.tier} — the world grows more dangerous`, true);
      break;
    default: return false;
  }
  return true;
}
