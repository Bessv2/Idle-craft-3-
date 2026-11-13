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
  weapon:  [['Dagger', '🗡️'], ['Sword', '⚔️'], ['Axe', '🪓'], ['Trident', '🔱'], ['Hammer', '🔨']],
  armor:   [['Tunic', '🥋'], ['Mail', '🦺'], ['Plate', '🛡️'], ['Cloak', '🧥']],
  trinket: [['Charm', '🧿'], ['Ring', '💍'], ['Amulet', '📿'], ['Talisman', '🪬']],
};
const SLOT_LABEL = { weapon: 'Weapon', armor: 'Armor', trinket: 'Trinket' };
const BAG_MAX = 24;
const UPGRADE_MAX = 10;
// Crafted goods that can be reforged into adventure gear.
const FORGE = { weapon: 'sword', armor: 'shield', trinket: 'ring' };
const HEALS = [['potion', 0.6], ['stew', 0.4], ['pie', 0.35], ['bread', 0.2], ['elixir', 1]];

// Monster base stats are for zone level 1 and scale up with the zone.
const ZONES = [
  { id: 'greenwood', name: 'Greenwood', icon: '🌲', ground: '#86b86b', alt: '#7dae63', wallBg: '#5e8f4c', walls: ['🌲', '🌳'],
    nodes: [['🪵', 'wood', 8], ['🌿', 'fiber', 8], ['🫐', 'berries', 8]],
    mobs: [{ n: 'Slime', i: '🦠', hp: 12, atk: 3, spd: 1.3 }, { n: 'Boar', i: '🐗', hp: 20, atk: 4, spd: 1.8 }, { n: 'Wolf', i: '🐺', hp: 16, atk: 5, spd: 2.4 }],
    boss: { n: 'Elder Bear', i: '🐻' } },
  { id: 'caves', name: 'Echo Caves', icon: '🕳️', ground: '#8d8a86', alt: '#85827e', wallBg: '#55524f', walls: ['🪨'],
    nodes: [['🪨', 'stone', 10], ['⚫', 'coal', 8], ['🟠', 'copper_ore', 8], ['⚪', 'iron_ore', 5]],
    mobs: [{ n: 'Bat', i: '🦇', hp: 10, atk: 4, spd: 2.8 }, { n: 'Spider', i: '🕷️', hp: 18, atk: 5, spd: 2.0 }, { n: 'Goblin', i: '👺', hp: 22, atk: 5, spd: 1.9 }],
    boss: { n: 'Cave Troll', i: '🧌' } },
  { id: 'ruins', name: 'Sunken Ruins', icon: '🏛️', ground: '#b9ad8c', alt: '#b0a483', wallBg: '#7c7359', walls: ['🏛️', '🗿', '🪨'],
    nodes: [['🟤', 'clay', 10], ['🌱', 'herbs', 6], ['🟡', 'gold_ore', 4], ['⚪', 'iron_ore', 6]],
    mobs: [{ n: 'Skeleton', i: '💀', hp: 18, atk: 5, spd: 1.7 }, { n: 'Ghost', i: '👻', hp: 14, atk: 6, spd: 2.2 }, { n: 'Serpent', i: '🐍', hp: 16, atk: 6, spd: 2.5 }],
    boss: { n: 'Stone Guardian', i: '🗿' } },
  { id: 'dunes', name: 'Scorched Dunes', icon: '🏜️', ground: '#e3c98a', alt: '#dbc081', wallBg: '#b99655', walls: ['🌵', '🪨'],
    nodes: [['🏖️', 'sand', 12], ['🟡', 'gold_ore', 6], ['🟠', 'copper_ore', 12]],
    mobs: [{ n: 'Scorpion', i: '🦂', hp: 16, atk: 6, spd: 2.3 }, { n: 'Mummy', i: '🧟', hp: 26, atk: 5, spd: 1.4 }, { n: 'Vulture', i: '🦅', hp: 12, atk: 6, spd: 3.0 }],
    boss: { n: 'Sand Wyrm', i: '🪱' } },
  { id: 'frost', name: 'Frostpeak', icon: '🏔️', ground: '#e6eef5', alt: '#dbe5ee', wallBg: '#a9bccd', walls: ['🌲', '🧊', '⛰️'],
    nodes: [['🔷', 'crystal', 4], ['⚪', 'iron_ore', 10], ['🐑', 'wool', 8]],
    mobs: [{ n: 'Frost Stag', i: '🦌', hp: 20, atk: 5, spd: 2.6 }, { n: 'Snow Bear', i: '🐻‍❄️', hp: 28, atk: 6, spd: 1.8 }, { n: 'Snowman', i: '⛄', hp: 22, atk: 5, spd: 1.5 }],
    boss: { n: 'Frost Wyrm', i: '🐲' } },
  { id: 'isles', name: 'Far Isles', icon: '🏝️', ground: '#f0dfae', alt: '#e8d6a3', wallBg: '#4aa3c7', walls: ['🌊', '🌴'],
    nodes: [['🟡', 'gold_ore', 8], ['🔷', 'crystal', 6], ['🌱', 'herbs', 10]],
    mobs: [{ n: 'Crab', i: '🦀', hp: 22, atk: 5, spd: 1.9 }, { n: 'Croc', i: '🐊', hp: 26, atk: 6, spd: 2.1 }, { n: 'Octopus', i: '🐙', hp: 20, atk: 7, spd: 1.7 }],
    boss: { n: 'Kraken', i: '🦑' } },
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
    zone: 0, tier: 0, lvl: 1, xp: 0, hp: 60,
    gear: { weapon: null, armor: null, trinket: null },
    bag: [], essence: 0, bosses: {}, kills: 0, bossKills: 0, uid: 1, foundLegendary: false,
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
const gearPower = g => { if (!g) return 0; const s = gearStats(g); return Math.round(s.atk * 2 + s.def * 3 + s.hp * 0.3); };
const gearName = g => `${RARITY[g.r].name} ${g.name}${g.up ? ' +' + g.up : ''}`;
const zoneIlvl = (zi = S.adv.zone) => zi + 1 + S.adv.tier * ZONES.length;
function rollRarity(boost) {
  const roll = Math.random() * (boost ? 0.35 : 1);
  return roll < 0.01 ? 4 : roll < 0.05 ? 3 : roll < 0.15 ? 2 : roll < 0.40 ? 1 : 0;
}
function makeGear(il, boost, slot) {
  slot = slot || ['weapon', 'armor', 'trinket'][Math.floor(Math.random() * 3)];
  const base = GEAR_BASES[slot][Math.floor(Math.random() * GEAR_BASES[slot].length)];
  const g = { id: S.adv.uid++, slot, r: rollRarity(boost), il, up: 0, name: base[0], icon: base[1] };
  if (g.r === 4) S.adv.foundLegendary = true;
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
  dirty = true;
}
function forgeGear(slot) {
  const item = FORGE[slot];
  if (have(item) < 1) return;
  S.items[item] -= 1;
  const g = makeGear(zoneIlvl(maxZone()), true, slot);
  const where = giveGear(g);
  toast(`${g.icon} Forged ${gearName(g)}${where === 'salvaged' ? ' (bag full — salvaged)' : ''}`);
  dirty = true;
}

/* ---------- hero ---------- */
function heroStats() {
  let atk = 5, def = 0, hp = 60;
  for (const g of Object.values(S.adv.gear)) if (g) { const s = gearStats(g); atk += s.atk; def += s.def; hp += s.hp; }
  const m = 1 + 0.04 * (S.adv.lvl - 1);
  return { atk: atk * m, def, hp: Math.round(hp * m) };
}
const xpNeed = () => Math.round(25 * Math.pow(1.35, S.adv.lvl - 1));
const heroWorkerMult = () => 1 + 0.01 * (S.adv.lvl - 1);
function gainXp(n) {
  S.adv.xp += n;
  while (S.adv.xp >= xpNeed()) {
    S.adv.xp -= xpNeed();
    S.adv.lvl++;
    S.adv.hp = heroStats().hp;
    toast(`⭐ Hero level ${S.adv.lvl}!`, true);
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
    return { g, deco, spawn: cell(a), lair: cell(lair), nodes, chests, homes };
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
  const hp = Math.round((boss ? 150 : base.hp) * s);
  return { n: base.n, i: base.i, boss: !!boss, x: home.x, y: home.y, home, hp, max: hp,
    atk: (boss ? 7 : base.atk) * s, spd: boss ? 1.6 : base.spd, cd: 0, wander: null, wt: 0, deadUntil: 0, hurt: 0 };
}
function enterZone(zi) {
  S.adv.zone = Math.min(zi, maxZone());
  const map = genMap(S.adv.zone, S.adv.tier);
  W = { zi: S.adv.zone, map, time: 0, px: map.spawn.x, py: map.spawn.y, atkCd: 0, skillCd: 0, healCd: 0, lastHit: -99,
    floaters: [], mobs: [], gather: null };
  W.mobs = map.homes.map(h => spawnMob(h, false));
  W.mobs.push(spawnMob(map.lair, true));
  S.adv.hp = heroStats().hp;
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
function floater(x, y, text, color) { W.floaters.push({ x, y, text, color, t: 0 }); }

function killMob(m) {
  const s = zoneScale(W.zi), zone = ZONES[W.zi];
  m.deadUntil = W.time + (m.boss ? 120 : 30);
  S.adv.kills++;
  gainXp(Math.round((m.boss ? 60 : 6) * Math.pow(1.4, W.zi + S.adv.tier * ZONES.length)));
  const coins = Math.round((m.boss ? 60 : 4) * s * priceMult());
  S.coins += coins; S.stats.earned += coins; S.run.earned += coins;
  floater(m.x, m.y - 0.3, `🪙+${fmt(coins)}`, '#f5c542');
  if (Math.random() < 0.5 || m.boss) {
    const node = zone.nodes[Math.floor(Math.random() * zone.nodes.length)];
    const n = Math.ceil((1 + Math.random() * 3) * (m.boss ? 6 : 1));
    add(node[1], n);
    floater(m.x, m.y - 0.7, `${node[0]}+${n}`, '#fff');
  }
  if (m.boss || Math.random() < 0.12) {
    const g = makeGear(zoneIlvl(W.zi), m.boss);
    const where = giveGear(g);
    floater(m.x, m.y - 1.1, `${g.icon} ${RARITY[g.r].name}!`, RARITY[g.r].color);
    if (g.r >= 2 || m.boss) toast(`${g.icon} Found ${gearName(g)}${where === 'equipped' ? ' — equipped' : where === 'salvaged' ? ' — bag full, salvaged' : ''}`);
    dirty = true;
  }
  if (m.boss) {
    S.adv.bossKills++;
    gainInsight(5);
    const first = !S.adv.bosses[zone.id];
    S.adv.bosses[zone.id] = 1;
    if (first) {
      const next = ZONES[W.zi + 1];
      showModal(`<h2>${m.i} ${m.n} defeated!</h2>
        <p class="muted">${next ? `The way to <b>${next.icon} ${next.name}</b> is open. Travel there from the Zones tab.`
          : 'You have conquered every zone! Raise the threat level in the Zones tab for stronger monsters and better gear.'}</p>
        <button class="btn primary wide" data-a="close-modal">Onward</button>`);
    }
    dirty = true;
  }
}
function hitMob(m, dmg) {
  const crit = Math.random() < 0.1;
  dmg = Math.max(1, Math.round(dmg * (0.9 + Math.random() * 0.2) * (crit ? 2 : 1)));
  m.hp -= dmg;
  m.hurt = W.time + 5;
  m.flash = W.time;
  floater(m.x, m.y - 0.5, (crit ? '💥' : '') + fmt(dmg), crit ? '#ffb020' : '#fff');
  if (m.hp <= 0) killMob(m);
}
function heroDown() {
  toast('💫 You were knocked out and carried back to camp');
  W.px = W.map.spawn.x; W.py = W.map.spawn.y;
  S.adv.hp = heroStats().hp;
  for (const m of W.mobs) { m.hurt = 0; if (!m.deadUntil) m.hp = m.max; }
}
function advSkill() {
  if (!W || W.skillCd > 0) return;
  W.skillCd = 6;
  W.spin = W.time;
  const st = heroStats();
  let hit = 0;
  for (const m of W.mobs) if (!m.deadUntil && Math.hypot(m.x - W.px, m.y - W.py) < 2.3) { hitMob(m, st.atk * 2.2); hit++; }
  if (hit) buzz();
}
function healItem() { return HEALS.find(([id]) => have(id) >= 1); }
function advHeal() {
  const h = healItem(), max = heroStats().hp;
  if (!W || W.healCd > 0) return;
  if (!h) return toast('No food or potions to use. Bread, pie, stew and potions all heal.');
  if (S.adv.hp >= max) return;
  S.items[h[0]] -= 1;
  S.adv.hp = Math.min(max, S.adv.hp + max * h[1]);
  W.healCd = 3;
  floater(W.px, W.py - 0.8, `${ITEMS[h[0]].icon} +${Math.round(h[1] * 100)}%`, '#7be08a');
  dirty = true;
}

function advUpdate(dt) {
  const st = heroStats();
  W.time += dt;
  W.atkCd -= dt; W.skillCd -= dt; W.healCd -= dt;

  // hero movement: joystick or keyboard
  let dx = 0, dy = 0;
  if (joy) { dx = joy.dx; dy = joy.dy; }
  if (keysDown.ArrowLeft || keysDown.a) dx -= 1;
  if (keysDown.ArrowRight || keysDown.d) dx += 1;
  if (keysDown.ArrowUp || keysDown.w) dy -= 1;
  if (keysDown.ArrowDown || keysDown.s) dy += 1;
  const len = Math.hypot(dx, dy);
  W.moving = len > 0.05;
  if (Math.abs(dx) > 0.1) W.face = dx < 0 ? -1 : 1;
  if (len > 0.05) {
    const sp = 3.6 * Math.min(1, len) / len;
    const hero = { x: W.px, y: W.py };
    moveBody(hero, dx * sp * dt, dy * sp * dt);
    W.px = hero.x; W.py = hero.y;
  }

  // monsters
  let nearest = null, nearD = 1.35;
  for (const m of W.mobs) {
    if (m.deadUntil) {
      if (W.time >= m.deadUntil) Object.assign(m, spawnMob(m.home, m.boss));
      continue;
    }
    const d = Math.hypot(m.x - W.px, m.y - W.py);
    if (d < nearD) { nearD = d; nearest = m; }
    m.cd -= dt;
    const aggro = d < (m.boss ? 6.5 : 5) || (m.hurt > W.time && d < 12);
    if (aggro) {
      if (d > 0.8) moveBody(m, (W.px - m.x) / d * m.spd * dt, (W.py - m.y) / d * m.spd * dt);
      else if (m.cd <= 0) {
        m.cd = 1.1;
        const dmg = Math.max(1, Math.round((m.atk - st.def * 0.6) * (0.85 + Math.random() * 0.3)));
        S.adv.hp -= dmg;
        W.lastHit = W.time;
        floater(W.px, W.py - 0.6, '-' + fmt(dmg), '#ff5b4d');
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
  }
  if (S.adv.hp <= 0) heroDown();
  // hero auto-attacks the nearest monster in reach
  if (nearest && W.atkCd <= 0) {
    W.atkCd = 0.55;
    W.slash = { x: nearest.x, y: nearest.y, t: W.time };
    W.face = nearest.x < W.px ? -1 : 1;
    hitMob(nearest, st.atk);
  }
  // rest when nothing has hit you for a while
  if (W.time - W.lastHit > 4 && S.adv.hp < st.hp) S.adv.hp = Math.min(st.hp, S.adv.hp + st.hp * 0.05 * dt);

  // gathering nodes and chests: stand on them
  const zone = ZONES[W.zi];
  for (const n of W.map.nodes) {
    if (n.t > W.time || Math.hypot(n.x - W.px, n.y - W.py) > 0.6) continue;
    const def = zone.nodes[n.k];
    const amt = Math.ceil(def[2] * (0.6 + Math.random() * 0.8) * (1 + 0.25 * perk('gather')));
    add(def[1], amt);
    n.t = W.time + 45;
    floater(n.x, n.y - 0.4, `${def[0]}+${amt}`, '#fff');
    buzz();
  }
  for (const c of W.map.chests) {
    if (c.t > W.time || Math.hypot(c.x - W.px, c.y - W.py) > 0.6) continue;
    c.t = W.time + 600;
    const coins = Math.round(25 * zoneScale(W.zi) * priceMult());
    S.coins += coins; S.stats.earned += coins; S.run.earned += coins;
    floater(c.x, c.y - 0.4, `🪙+${fmt(coins)}`, '#f5c542');
    if (Math.random() < 0.5) {
      const g = makeGear(zoneIlvl(W.zi), false);
      giveGear(g);
      floater(c.x, c.y - 0.9, `${g.icon} ${RARITY[g.r].name}!`, RARITY[g.r].color);
      dirty = true;
    }
    buzz();
  }
  for (const f of W.floaters) f.t += dt;
  W.floaters = W.floaters.filter(f => f.t < 1);
}

/* ---------- drawing ---------- */
// Cheap repeatable noise so every tile keeps the same decoration.
const tileHash = (x, y) => { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = v => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}
function shadow(ctx, x, y, r) {
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.38, 0, 0, 7); ctx.fill();
}

function advDraw() {
  const c = advCanvas, ctx = advCtx, dpr = window.devicePixelRatio || 1;
  const w = c.clientWidth, h = c.clientHeight;
  if (!w || !h) return;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const T = Math.max(40, Math.min(56, w / 8));
  const zone = ZONES[W.zi], map = W.map;
  const camX = Math.round(W.px * T - w / 2), camY = Math.round(W.py * T - h / 2);
  ctx.fillStyle = shade(zone.wallBg, 0.8);
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // the visible range runs past the map edge so the world never ends in a blank strip
  const x0 = Math.floor(camX / T), x1 = Math.ceil((camX + w) / T);
  const y0 = Math.floor(camY / T), y1 = Math.ceil((camY + h) / T);
  const inMap = (x, y) => x >= 0 && y >= 0 && x < MAP_N && y < MAP_N;
  const isWall = (x, y) => !inMap(x, y) || map.g[x + y * MAP_N] !== 0;

  // ground, with speckles and a darker lip under walls
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const sx = x * T - camX, sy = y * T - camY, r = tileHash(x, y);
    if (isWall(x, y)) {
      ctx.fillStyle = shade(zone.wallBg, 0.94 + r * 0.06);
      ctx.fillRect(sx, sy, T + 1, T + 1);
      continue;
    }
    ctx.fillStyle = shade(zone.ground, 0.98 + r * 0.04);
    ctx.fillRect(sx, sy, T + 1, T + 1);
    ctx.fillStyle = shade(zone.ground, 0.82);
    for (let k = 0; k < 3; k++) {
      const a = tileHash(x * 3 + k, y * 7 - k), b = tileHash(x * 5 - k, y * 2 + k);
      if (a < 0.6) ctx.fillRect(sx + a * 1.5 * T, sy + b * T * 0.9, 3, 6);
    }
    if (r > 0.93) { ctx.fillStyle = shade(zone.ground, 1.18); ctx.beginPath(); ctx.arc(sx + T * 0.5, sy + T * 0.5, T * 0.07, 0, 7); ctx.fill(); }
    if (isWall(x, y - 1)) { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(sx, sy, T + 1, T * 0.22); }
  }
  // walls drawn back to front so tall things overlap the tile above
  for (let y = y0; y <= y1 + 1; y++) for (let x = x0; x <= x1; x++) {
    if (!isWall(x, y)) continue;
    const sx = (x + 0.5) * T - camX, sy = (y + 0.5) * T - camY, r = tileHash(x + 91, y + 17);
    const deco = inMap(x, y) ? map.deco[x + y * MAP_N] : Math.floor(tileHash(x, y + 5) * zone.walls.length);
    shadow(ctx, sx, sy + T * 0.36, T * 0.4);
    drawIcon(ctx, zone.walls[deco], sx + (r - 0.5) * T * 0.14, sy - T * 0.1, T * (0.92 + r * 0.16));
  }

  const at = (x, y) => [x * T - camX, y * T - camY];
  const pulse = 1 + Math.sin(W.time * 4) * 0.05;
  for (const n of map.nodes) if (n.t <= W.time) {
    const [sx, sy] = at(n.x, n.y);
    shadow(ctx, sx, sy + T * 0.28, T * 0.26);
    drawIcon(ctx, zone.nodes[n.k][0], sx, sy, T * 0.6 * pulse);
  }
  for (const ch of map.chests) if (ch.t <= W.time) {
    const [sx, sy] = at(ch.x, ch.y);
    ctx.fillStyle = 'rgba(255,216,74,.22)'; ctx.beginPath(); ctx.arc(sx, sy, T * 0.5 * pulse, 0, 7); ctx.fill();
    shadow(ctx, sx, sy + T * 0.3, T * 0.3);
    drawIcon(ctx, '🎁', sx, sy, T * 0.7);
  }
  { const [sx, sy] = at(map.spawn.x, map.spawn.y); shadow(ctx, sx, sy + T * 0.36, T * 0.45); drawIcon(ctx, '⛺', sx, sy - T * 0.05, T * 0.95); }

  // monsters, sorted so lower ones draw on top
  const alive = W.mobs.filter(m => !m.deadUntil).sort((a, b) => a.y - b.y);
  for (const m of alive) {
    const [sx, sy] = at(m.x, m.y);
    const size = T * (m.boss ? 1.7 : 0.82);
    const bob = Math.sin(W.time * 6 + m.home.x * 3) * T * 0.03;
    const hitT = W.time - (m.flash || -9);
    if (m.boss) {
      ctx.fillStyle = 'rgba(192,38,211,.18)';
      ctx.beginPath(); ctx.arc(sx, sy, size * 0.62 * pulse, 0, 7); ctx.fill();
    }
    shadow(ctx, sx, sy + size * 0.42, size * 0.36);
    const pop = hitT < 0.12 ? 1.18 : 1;
    drawIcon(ctx, m.i, sx, sy - size * 0.05 + bob, size * pop, hitT < 0.1 ? '#ffffff' : undefined);
    if (m.hp < m.max || m.boss) {
      const bw = T * (m.boss ? 1.7 : 0.9), by = sy - size * 0.66;
      ctx.fillStyle = '#17110c'; ctx.fillRect(sx - bw / 2 - 2, by - 2, bw + 4, 9);
      ctx.fillStyle = m.boss ? '#c026d3' : '#e5484d'; ctx.fillRect(sx - bw / 2, by, bw * Math.max(0, m.hp / m.max), 5);
      ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(sx - bw / 2, by, bw * Math.max(0, m.hp / m.max), 2);
      if (m.boss) drawLabel(ctx, m.n, sx, by - 12, T * 0.3, '#f6d0ff');
    }
  }

  // hero
  {
    const hx = w / 2, hy = h / 2;
    const bob = W.moving ? Math.abs(Math.sin(W.time * 12)) * T * 0.07 : Math.sin(W.time * 3) * T * 0.015;
    shadow(ctx, hx, hy + T * 0.4, T * 0.32);
    ctx.save();
    ctx.translate(hx, hy - T * 0.05 - bob);
    if (W.face < 0) ctx.scale(-1, 1);
    drawIcon(ctx, '🧝', 0, 0, T * 0.95, W.time - W.lastHit < 0.12 ? '#ff8a80' : undefined);
    ctx.restore();
  }
  // attack slash
  if (W.slash && W.time - W.slash.t < 0.16) {
    const k = (W.time - W.slash.t) / 0.16;
    const [sx, sy] = at(W.slash.x, W.slash.y);
    const ang = Math.atan2(sy - h / 2, sx - w / 2);
    ctx.strokeStyle = `rgba(255,255,255,${0.9 - k * 0.9})`;
    ctx.lineWidth = T * 0.14 * (1 - k * 0.5);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(w / 2, h / 2, T * 0.85, ang - 0.9 + k * 0.6, ang + 0.2 + k * 0.9); ctx.stroke();
  }
  if (W.spin && W.time - W.spin < 0.35) {
    const k = (W.time - W.spin) / 0.35;
    ctx.strokeStyle = `rgba(127,208,240,${0.8 - k * 0.8})`;
    ctx.lineWidth = T * 0.2 * (1 - k);
    ctx.beginPath(); ctx.arc(w / 2, h / 2, T * (0.6 + k * 1.8), 0, 7); ctx.stroke();
  }

  for (const f of W.floaters) {
    const [sx, sy] = at(f.x, f.y - f.t * 0.9);
    ctx.globalAlpha = Math.min(1, 1.6 - f.t * 1.6);
    drawLabel(ctx, f.text, sx, sy, T * 0.36, f.color);
  }
  ctx.globalAlpha = 1;

  // vignette for depth
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.38)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);

  // pointer toward the boss lair when it is off screen
  const boss = W.mobs[W.mobs.length - 1];
  const [bx, by] = at(map.lair.x, map.lair.y);
  if (!boss.deadUntil && (bx < 0 || bx > w || by < 0 || by > h)) {
    const ang = Math.atan2(by - h / 2, bx - w / 2), r = Math.min(w, h) / 2 - 30;
    drawIcon(ctx, '☠', w / 2 + Math.cos(ang) * r, h / 2 + Math.sin(ang) * r, T * 0.55 * pulse);
  }
  if (joy) {
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(joy.ox, joy.oy, 46, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(joy.ox + joy.dx * 46, joy.oy + joy.dy * 46, 20, 0, 7); ctx.fill();
  }
}

function advFrame(ts) {
  advRaf = 0;
  if (!advCanvas || !advCanvas.isConnected || tab !== 'hero' || subTab.hero !== 'world') return;
  const dt = Math.min(0.05, (ts - advLast) / 1000 || 0);
  advLast = ts;
  if ($('#modal').hidden) advUpdate(dt);
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
    window.addEventListener('keydown', e => { keysDown[e.key] = true; if (e.key === ' ' && tab === 'hero') { advSkill(); e.preventDefault(); } });
    window.addEventListener('keyup', e => { keysDown[e.key] = false; });
  }
  if (!W || W.zi !== S.adv.zone) enterZone(S.adv.zone);
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
        <button class="advbtn" data-a="advskill" aria-label="Whirlwind attack"><span data-k="advskill"></span></button>
      </div>
    </div>
    <p class="muted small center">Drag anywhere to walk (or use arrow keys). You attack nearby monsters automatically.
      Walk over resources and 🎁 to collect them. ☠️ points to the boss.</p>`;
}

function gearCard(g, equipped) {
  const s = gearStats(g);
  const stats = [s.atk && `⚔️${fmt(s.atk)}`, s.def && `🛡️${fmt(s.def)}`, s.hp && `❤️${fmt(s.hp)}`].filter(Boolean).join(' ');
  const cur = S.adv.gear[g.slot];
  const better = !equipped && gearPower(g) > gearPower(cur);
  return `
    <div class="card gear" style="border-left:5px solid ${RARITY[g.r].color}">
      <div class="row between">
        <div class="rname"><span class="big2">${g.icon}</span>
          <div><b style="color:${RARITY[g.r].color}">${gearName(g)}</b>
            <div class="muted small">${SLOT_LABEL[g.slot]} · item level ${g.il} · ${stats}${better ? ' <span class="hot">▲ better</span>' : ''}</div></div></div>
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
  return `
    <div class="card">
      <div class="row between"><b>🧝 Hero · Level ${S.adv.lvl}</b><span class="muted small">${fmt(S.adv.xp)}/${fmt(xpNeed())} xp</span></div>
      <div class="gains"><div class="gain">⚔️ ${fmt(st.atk)}</div><div class="gain">🛡️ ${fmt(st.def)}</div><div class="gain">❤️ ${fmt(st.hp)}</div>
        <div class="gain">✨ <span data-k="essence"></span> essence</div></div>
      <div class="muted small" style="margin-top:6px">Each hero level adds +4% attack and health, and +1% worker speed back home.</div>
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
    ${bag.map(g => gearCard(g, false)).join('')}`;
}

function renderAdvZones() {
  const mz = maxZone();
  return `
    <p class="muted small">Defeat a zone's boss to open the next one. Tougher zones drop higher-level gear.</p>
    ${ZONES.map((z, i) => i <= mz ? `
      <div class="card row between">
        <div class="rname"><span class="big2">${z.icon}</span>
          <div><b>${z.name}</b> <span class="muted small">item level ${zoneIlvl(i)}</span>
            <div class="muted small">${z.mobs.map(m => m.i).join(' ')} · boss ${z.boss.i} ${z.boss.n} ${S.adv.bosses[z.id] ? '✓' : ''}</div></div></div>
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
  ['zones', '🧭 Zones', () => true, renderAdvZones],
];
subTab.hero = 'world';

Object.assign(WIDTHS, {
  advhp: () => Math.max(0, S.adv.hp / heroStats().hp * 100),
  advxp: () => S.adv.xp / xpNeed() * 100,
});
const ADV_K = {
  advhp: () => `${fmt(Math.max(0, S.adv.hp))}/${fmt(heroStats().hp)}`,
  advskill: () => (W && W.skillCd > 0 ? Math.ceil(W.skillCd) + 's' : '🌀'),
  advhealicon: () => { const h = healItem(); return h ? ITEMS[h[0]].icon : '🧪'; },
  advhealn: () => { const h = healItem(); return h ? fmt(have(h[0])) : '0'; },
  essence: () => fmt(S.adv.essence),
};
const ADV_E = {
  gearup: slot => { const g = S.adv.gear[slot]; return !!g && S.adv.essence >= upgradeCost(g); },
};

function advAction(a, id, n) {
  switch (a) {
    case 'advskill': advSkill(); break;
    case 'advheal': advHeal(); break;
    case 'equip': equipGear(+n); break;
    case 'salvage': salvageGear(+n); break;
    case 'salvageweak': salvageWeak(); break;
    case 'gearup': upgradeGear(id); break;
    case 'forge': forgeGear(id); break;
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
