'use strict';

/* ============================================================
   The wider world: seasons, farm, tavern meals, pets, the mine,
   research, museum, quest board, wandering trader, tap combos
   and shooting stars. Loaded before game.js.
   ============================================================ */

/* ---------- extra content merged into the base data ---------- */
Object.assign(ITEMS, {
  carrot:    { name: 'Carrot',    icon: '🥕', kind: 'raw', value: 3 },
  tomato:    { name: 'Tomato',    icon: '🍅', kind: 'raw', value: 5 },
  pumpkin:   { name: 'Pumpkin',   icon: '🎃', kind: 'raw', value: 12 },
  grapes:    { name: 'Grapes',    icon: '🍇', kind: 'raw', value: 14 },
  sunflower: { name: 'Sunflower', icon: '🌻', kind: 'raw', value: 40 },
  egg:       { name: 'Egg',       icon: '🥚', kind: 'raw', value: 6 },
  honey:     { name: 'Honey',     icon: '🍯', kind: 'raw', value: 15 },
  salad:     { name: 'Salad',        icon: '🥗', kind: 'good' },
  stew:      { name: 'Stew',         icon: '🍲', kind: 'good' },
  soup:      { name: 'Pumpkin Soup', icon: '🥣', kind: 'good' },
  wine:      { name: 'Wine',         icon: '🍷', kind: 'good' },
  cake:      { name: 'Cake',         icon: '🎂', kind: 'good' },
  feast:     { name: 'Feast',        icon: '🍱', kind: 'good' },
  bouquet:   { name: 'Bouquet',      icon: '💐', kind: 'good' },
  kitchen:   { name: 'Kitchen',      icon: '🍳', kind: 'station' },
});
STATIONS.splice(4, 0, { id: 'kitchen', upgrade: 1500 });
RECIPES.push(
  { id: 'kitchen', at: 'workbench', in: { brick: 8, plank: 6, iron_ingot: 2 }, out: { kitchen: 1 }, t: 12 },
  { id: 'bouquet', at: 'workbench', in: { sunflower: 2, herbs: 2, rope: 1 }, out: { bouquet: 1 }, t: 5 },
  { id: 'salad', at: 'kitchen', in: { carrot: 2, tomato: 2 }, out: { salad: 1 }, t: 3 },
  { id: 'stew',  at: 'kitchen', in: { carrot: 3, tomato: 2, herbs: 1 }, out: { stew: 1 }, t: 6 },
  { id: 'soup',  at: 'kitchen', in: { pumpkin: 2, bread: 1 }, out: { soup: 1 }, t: 6 },
  { id: 'wine',  at: 'kitchen', in: { grapes: 6, glass: 1 }, out: { wine: 1 }, t: 10 },
  { id: 'cake',  at: 'kitchen', in: { wheat: 4, egg: 2, honey: 1, berries: 4 }, out: { cake: 1 }, t: 12 },
  { id: 'feast', at: 'kitchen', in: { stew: 1, pie: 1, wine: 1, cake: 1 }, out: { feast: 1 }, t: 20 },
);
MILESTONES.splice(MILESTONES.indexOf('shears'), 0, 'kitchen');

const SEASONS = [
  { name: 'Spring', icon: '🌸', type: 'farm',   m: 1.5,  desc: 'Crops grow faster' },
  { name: 'Summer', icon: '☀️', type: 'worker', m: 1.2,  desc: 'Workers gather faster' },
  { name: 'Autumn', icon: '🍂', type: 'price',  m: 1.15, desc: 'Everything sells for more' },
  { name: 'Winter', icon: '❄️', type: 'craft',  m: 1.2,  desc: 'Crafting is faster' },
];
const SEASON_LENGTH = 600;

// plots = how many farm plots you need before the crop is available
const CROPS = [
  { id: 'carrot',    time: 60,  yield: 4, plots: 2 },
  { id: 'tomato',    time: 120, yield: 4, plots: 3 },
  { id: 'pumpkin',   time: 300, yield: 3, plots: 4 },
  { id: 'grapes',    time: 600, yield: 5, plots: 6 },
  { id: 'sunflower', time: 900, yield: 2, plots: 8 },
];
const MAX_PLOTS = 9;

// Meals: eat at the tavern for a timed boost. m = multiplier, t = seconds.
const FOODS = {
  bread: { type: 'tap',    m: 2,    t: 180, text: 'Double tap power' },
  pie:   { type: 'worker', m: 1.3,  t: 300, text: 'Workers +30%' },
  jam:   { type: 'price',  m: 1.15, t: 300, text: 'Sell prices +15%' },
  salad: { type: 'farm',   m: 1.5,  t: 300, text: 'Crops grow 50% faster' },
  stew:  { type: 'craft',  m: 1.3,  t: 300, text: 'Crafting 30% faster' },
  soup:  { type: 'mine',   m: 1.5,  t: 300, text: 'Mine power +50%' },
  wine:  { type: 'price',  m: 1.3,  t: 600, text: 'Sell prices +30%' },
  cake:  { type: 'worker', m: 1.6,  t: 600, text: 'Workers +60%' },
  feast: { type: 'all',    m: 1.25, t: 900, text: 'Everything +25%' },
};
const BUFF_LABEL = { tap: 'Tap power', worker: 'Workers', price: 'Sell prices', farm: 'Crop growth', craft: 'Craft speed', mine: 'Mine power', all: 'Everything' };

// per = food needed per level to level up
const PETS = [
  { id: 'cat',  name: 'Cat',      icon: '🐈', cost: 300,   food: 'bread',     per: 3,  desc: l => `+${10 * l}% tap power` },
  { id: 'hen',  name: 'Hen',      icon: '🐔', cost: 800,   food: 'wheat',     per: 15, desc: l => `Lays ${l} egg${l > 1 ? 's' : ''} a minute` },
  { id: 'dog',  name: 'Dog',      icon: '🐕', cost: 2500,  food: 'pie',       per: 3,  desc: l => `Expeditions ${5 * l}% faster` },
  { id: 'hog',  name: 'Hedgehog', icon: '🦔', cost: 5000,  food: 'carrot',    per: 15, desc: l => `+${10 * l}% mine power` },
  { id: 'bees', name: 'Beehive',  icon: '🐝', cost: 10000, food: 'sunflower', per: 2,  desc: l => `Makes ${l} honey every 2 minutes` },
  { id: 'owl',  name: 'Owl',      icon: '🦉', cost: 25000, food: 'jam',       per: 3,  desc: l => `+${10 * l}% insight` },
];
const PET_MAX = 10;

const RESEARCH = [
  { id: 'crit',      name: 'Lucky Strikes',   icon: '🍀', cost: 10, desc: 'Taps have a 10% chance to give 10×' },
  { id: 'scarecrow', name: 'Scarecrow',       icon: '🧑‍🌾', cost: 15, desc: 'Farm plots harvest and replant themselves' },
  { id: 'insider',   name: 'Market Insider',  icon: '📈', cost: 15, desc: 'In-demand items sell for 3× instead of 2×' },
  { id: 'stars',     name: 'Stargazing',      icon: '🔭', cost: 15, desc: 'Shooting stars appear twice as often' },
  { id: 'offline',   name: 'Night Shift',     icon: '🌙', cost: 20, desc: 'Offline progress counts for 24 hours instead of 12' },
  { id: 'almanac',   name: 'Almanac',         icon: '📅', cost: 20, desc: 'Season bonuses are doubled' },
  { id: 'haggle',    name: 'Negotiator',      icon: '🤝', cost: 20, desc: 'Orders pay 3× market price instead of 2.5×' },
  { id: 'water',     name: 'Irrigation',      icon: '💧', cost: 25, desc: 'Crops yield 50% more' },
  { id: 'maps',      name: 'Cartography',     icon: '🗺️', cost: 30, desc: 'Expeditions bring back 50% more' },
  { id: 'class',     name: 'Masterclass',     icon: '🎓', cost: 30, desc: 'Mastery double-output chance is 8% per level instead of 5%' },
  { id: 'drill',     name: 'Steam Drill',     icon: '🚂', cost: 35, desc: 'The mine crew digs twice as fast' },
];

// Mine crew outfit: permanent levels paid for with crafted items. p = power per level.
const GEAR = [
  { id: 'torches', name: 'Torches',      icon: '🔥', item: 'torch',        per: 5, p: 1 },
  { id: 'picks',   name: 'Copper Picks', icon: '⛏️', item: 'copper_ingot', per: 4, p: 2 },
  { id: 'shields', name: 'Shields',      icon: '🛡️', item: 'shield',       per: 1, p: 6 },
  { id: 'swords',  name: 'Guards',       icon: '⚔️', item: 'sword',        per: 1, p: 8 },
  { id: 'lamps',   name: 'Lanterns',     icon: '🏮', item: 'lantern',      per: 1, p: 10 },
  { id: 'drills',  name: 'Gearworks',    icon: '⚙️', item: 'gear',         per: 5, p: 12 },
  { id: 'tonics',  name: 'Tonics',       icon: '🧪', item: 'potion',       per: 2, p: 15 },
];

const MUSEUM = [
  { id: 'wood',  name: 'Woodcraft', icon: '🪵', bonus: 'Crafting 15% faster',
    items: ['plank', 'stick', 'basket', 'chest', 'table', 'barrel'] },
  { id: 'smith', name: 'Smithing',  icon: '⚒️', bonus: 'Mine power +25%',
    items: ['copper_ingot', 'iron_ingot', 'steel_ingot', 'gold_ingot', 'nails', 'gear', 'sword', 'shield'] },
  { id: 'cloth', name: 'Textiles',  icon: '🧵', bonus: 'Expedition loot +20%',
    items: ['rope', 'thread', 'cloth', 'backpack', 'rug', 'sail'] },
  { id: 'food',  name: 'Cuisine',   icon: '🍽️', bonus: 'Meals last twice as long',
    items: ['bread', 'pie', 'jam', 'salad', 'stew', 'soup', 'wine', 'cake', 'feast'] },
  { id: 'gems',  name: 'Treasures', icon: '💎', bonus: 'Sell prices +25%',
    items: ['gem', 'ring', 'necklace', 'crown', 'lens', 'potion', 'elixir'] },
  { id: 'tech',  name: 'Marvels',   icon: '🔭', bonus: 'Workers +25%',
    items: ['lantern', 'compass', 'pocket_watch', 'telescope', 'automaton'] },
];
const museumNeed = id => (['automaton', 'feast', 'crown'].includes(id) ? 2 : 10);

const QUESTS = {
  tap:     { text: n => `Tap ${n} times`,           base: 60 },
  craft:   { text: n => `Craft ${n} items`,         base: 25 },
  earn:    { text: n => `Earn ${fmt(n)} coins`,     base: 150 },
  order:   { text: n => `Deliver ${n} order${n > 1 ? 's' : ''}`,  base: 2, cap: 10, ok: () => orderPool().length > 1 },
  harvest: { text: n => `Harvest ${n} crops`,       base: 8,  ok: () => owns('stone_hoe') },
  floor:   { text: n => `Clear ${n} mine floor${n > 1 ? 's' : ''}`, base: 2, cap: 12, ok: () => owns('stone_pickaxe') },
};

ACHIEVEMENTS.push(
  { id: 'mi1', name: 'Spelunker',     desc: 'Reach mine floor 10',   test: () => S.mine.best >= 10 },
  { id: 'mi2', name: 'Deep Delver',   desc: 'Reach mine floor 25',   test: () => S.mine.best >= 25 },
  { id: 'mi3', name: 'Core Seeker',   desc: 'Reach mine floor 50',   test: () => S.mine.best >= 50 },
  { id: 'fa1', name: 'Green Thumb',   desc: 'Harvest 100 crops',     test: () => S.counts.harvest >= 100 },
  { id: 'fa2', name: 'Harvest King',  desc: 'Harvest 5,000 crops',   test: () => S.counts.harvest >= 5000 },
  { id: 'pe1', name: 'Best Friend',   desc: 'Adopt a pet',           test: () => Object.keys(S.pets).length >= 1 },
  { id: 'pe2', name: 'Menagerie',     desc: 'Adopt every pet',       test: () => Object.keys(S.pets).length >= PETS.length },
  { id: 'mu1', name: 'Patron',        desc: 'Complete a museum wing', test: () => MUSEUM.some(wingDone) },
  { id: 'mu2', name: 'Grand Museum',  desc: 'Complete every museum wing', test: () => MUSEUM.every(wingDone) },
  { id: 'rs1', name: 'Bright Idea',   desc: 'Finish a research project', test: () => Object.keys(S.research).length >= 1 },
  { id: 'rs2', name: 'Know-It-All',   desc: 'Finish all research',   test: () => Object.keys(S.research).length >= RESEARCH.length },
  { id: 'qu1', name: 'Odd Jobs',      desc: 'Complete 10 board quests', test: () => S.questsDone >= 10 },
  { id: 'qu2', name: 'Town Hero',     desc: 'Complete 100 board quests', test: () => S.questsDone >= 100 },
  { id: 'st1', name: 'Wish Upon',     desc: 'Catch 10 shooting stars', test: () => S.counts.stars >= 10 },
  { id: 'tr1', name: 'Barterer',      desc: 'Make 10 trades with the trader', test: () => S.counts.trades >= 10 },
  { id: 'fe1', name: 'Banquet',       desc: 'Cook a Feast',          test: () => !!S.seen.feast },
);

/* ---------- state ---------- */
function worldDefaults() {
  return {
    season: { i: 0, t: SEASON_LENGTH },
    farm: { plots: [null, null], last: 'carrot' },
    buffs: {},
    pets: {},
    insight: 0,
    research: {},
    mine: { floor: 1, dmg: 0, best: 0, gear: {}, last: '' },
    quests: [],
    questsDone: 0,
    museum: {},
    trader: null,
    traderIn: 240,
    opt: { haptics: true },
  };
}
// Carried over when you set sail.
const worldKeep = () => ({ pets: S.pets, insight: S.insight, research: S.research, museum: S.museum, questsDone: S.questsDone, opt: S.opt });

/* ---------- multipliers ---------- */
const petLvl = id => (S.pets[id] ? S.pets[id].lvl : 0);
function buffMult(type) {
  const b = S.buffs[type], all = S.buffs.all;
  return (b ? b.m : 1) * (all && type !== 'all' ? all.m : 1);
}
function seasonMult(type) {
  const s = SEASONS[S.season.i];
  if (s.type !== type) return 1;
  return S.research.almanac ? 1 + (s.m - 1) * 2 : s.m;
}
const wingDone = w => w.items.every(id => S.museum[id]);
const wing = id => wingDone(MUSEUM.find(w => w.id === id));
const exhibitCount = () => Object.keys(S.museum).length;
// Combined bonus of meals, seasons, pets and museum for one kind of activity.
function worldMult(type) {
  let m = buffMult(type) * seasonMult(type);
  if (type === 'tap') m *= 1 + 0.1 * petLvl('cat');
  if (type === 'worker' && wing('tech')) m *= 1.25;
  if (type === 'craft' && wing('wood')) m *= 1.15;
  if (type === 'price') m *= (wing('gems') ? 1.25 : 1) * (1 + 0.01 * exhibitCount());
  if (type === 'mine') m *= (1 + 0.1 * petLvl('hog')) * (wing('smith') ? 1.25 : 1) * (S.research.drill ? 2 : 1);
  return m;
}
const hotMult = () => (S.research.insider ? 3 : 2);
const offlineCapHours = () => (S.research.offline ? 24 : OFFLINE_CAP_HOURS);
function gainInsight(n) { S.insight += n * (1 + 0.1 * petLvl('owl')); }

/* ---------- tap combo ---------- */
let combo = 0, lastTapAt = 0, tapLabel = '';
function tapAmount() {
  const now = Date.now();
  combo = now - lastTapAt < 1500 ? combo + 1 : 0;
  lastTapAt = now;
  const mult = 1 + Math.min(combo, 50) / 25; // up to ×3 after 50 quick taps
  const crit = S.research.crit && Math.random() < 0.1;
  tapLabel = crit ? ' ✨' : combo >= 10 ? ` ×${mult.toFixed(1)}` : '';
  return Math.ceil(tapPower() * mult * (crit ? 10 : 1));
}
function buzz() { if (S.opt.haptics && navigator.vibrate) { try { navigator.vibrate(8); } catch (e) { /* not allowed */ } } }

/* ---------- farm ---------- */
const CROP = Object.fromEntries(CROPS.map(c => [c.id, c]));
const seedCost = c => Math.ceil(c.yield * VALUE[c.id] * 0.35);
const cropYield = c => Math.round(c.yield * (S.research.water ? 1.5 : 1));
const plotCost = () => Math.ceil(100 * Math.pow(2.5, S.farm.plots.length - 2));
const cropUnlocked = c => S.farm.plots.length >= c.plots;
const plotReady = p => !!p && p.t >= CROP[p.c].time;
function plant(i, cropId) {
  const c = CROP[cropId];
  if (S.farm.plots[i] || !cropUnlocked(c) || S.coins < seedCost(c)) return false;
  S.coins -= seedCost(c);
  S.farm.plots[i] = { c: cropId, t: 0 };
  S.farm.last = cropId;
  dirty = true;
  return true;
}
function harvest(i) {
  const p = S.farm.plots[i];
  if (!plotReady(p)) return;
  const n = cropYield(CROP[p.c]);
  add(p.c, n);
  S.counts.harvest += n;
  questProgress('harvest', n);
  S.farm.plots[i] = null;
  dirty = true;
}
function farmStep(dt) {
  const speed = worldMult('farm');
  S.farm.plots.forEach((p, i) => {
    if (!p) return;
    p.t += dt * speed;
    if (plotReady(p) && S.research.scarecrow) { const c = p.c; harvest(i); plant(i, c); }
  });
}

/* ---------- meals ---------- */
function eat(id) {
  const f = FOODS[id];
  if (!f || have(id) < 1) return;
  const cur = S.buffs[f.type];
  if (cur && cur.m > f.m) return toast('A stronger meal of that kind is still active');
  S.items[id] -= 1;
  S.buffs[f.type] = { m: f.m, t: f.t * (wing('food') ? 2 : 1), icon: ITEMS[id].icon };
  toast(`${ITEMS[id].icon} ${f.text} for ${fmtTime(S.buffs[f.type].t)}`);
  dirty = true;
}

/* ---------- pets ---------- */
const petNeed = p => p.per * petLvl(p.id);
function adopt(id) {
  const p = PETS.find(x => x.id === id);
  if (S.pets[id] || S.coins < p.cost) return;
  S.coins -= p.cost;
  S.pets[id] = { lvl: 1 };
  toast(`${p.icon} You adopted a ${p.name}!`, true);
  dirty = true;
}
function feedPet(id) {
  const p = PETS.find(x => x.id === id);
  if (!S.pets[id] || petLvl(id) >= PET_MAX || have(p.food) < petNeed(p)) return;
  S.items[p.food] -= petNeed(p);
  S.pets[id].lvl++;
  toast(`${p.icon} ${p.name} grew to level ${petLvl(id)}`);
  dirty = true;
}

/* ---------- the mine ---------- */
const isTreasure = f => f % 5 === 0;
const mineHp = f => Math.round(30 * Math.pow(1.18, f - 1)) * (isTreasure(f) ? 4 : 1);
const gearLvl = id => S.mine.gear[id] || 0;
const gearCost = g => g.per * (gearLvl(g.id) + 1);
const minePower = () => GEAR.reduce((a, g) => a + gearLvl(g.id) * g.p, 0) * worldMult('mine') * (1 + 0.25 * perk('gather'));
function buyGear(id) {
  const g = GEAR.find(x => x.id === id);
  if (have(g.item) < gearCost(g)) return;
  S.items[g.item] -= gearCost(g);
  S.mine.gear[id] = gearLvl(id) + 1;
  dirty = true;
}
function clearFloor() {
  const f = S.mine.floor;
  const pool = ['stone', 'coal', 'copper_ore'];
  if (f >= 10) pool.push('iron_ore');
  if (f >= 20) pool.push('gold_ore');
  if (f >= 35) pool.push('crystal');
  const id = pool[Math.floor(Math.random() * pool.length)];
  const n = Math.max(1, Math.round((4 + f * 0.8) / Math.sqrt(VALUE[id])));
  add(id, n);
  S.mine.last = `${ITEMS[id].icon} +${fmt(n)}`;
  if (isTreasure(f)) {
    const coins = Math.round(f * f * 8 * priceMult());
    S.coins += coins; S.stats.earned += coins; S.run.earned += coins;
    S.mine.last += ` · 🪙 +${fmt(coins)}`;
    if (f >= 20) { add('gem', Math.floor(f / 10)); S.mine.last += ` · 💎 +${Math.floor(f / 10)}`; }
    gainInsight(2);
    if (!simulatingOffline) toast(`💰 Treasure on floor ${f}! 🪙+${fmt(coins)}`);
  }
  S.mine.floor++;
  S.mine.best = Math.max(S.mine.best, S.mine.floor);
  questProgress('floor', 1);
}
function mineDig(amount) {
  if (!owns('stone_pickaxe') || amount <= 0) return;
  S.mine.dmg += amount;
  let guard = 0;
  while (S.mine.dmg >= mineHp(S.mine.floor)) {
    S.mine.dmg -= mineHp(S.mine.floor);
    clearFloor();
    if (++guard >= 50) { S.mine.dmg = 0; break; }
  }
}

/* ---------- research ---------- */
function buyResearch(id) {
  const r = RESEARCH.find(x => x.id === id);
  if (S.research[id] || S.insight < r.cost) return;
  S.insight -= r.cost;
  S.research[id] = 1;
  toast(`💡 Researched ${r.name}`, true);
  dirty = true;
}

/* ---------- museum ---------- */
function donate(id) {
  if (S.museum[id] || have(id) < museumNeed(id)) return;
  S.items[id] -= museumNeed(id);
  S.museum[id] = 1;
  gainInsight(1);
  const w = MUSEUM.find(x => x.items.includes(id));
  if (wingDone(w)) toast(`🏛️ ${w.name} wing complete! ${w.bonus}`, true);
  dirty = true;
}

/* ---------- quest board ---------- */
function genQuest() {
  const taken = new Set(S.quests.map(q => q.type));
  const types = Object.keys(QUESTS).filter(t => !taken.has(t) && (!QUESTS[t].ok || QUESTS[t].ok()));
  if (!types.length) return null;
  const type = types[Math.floor(Math.random() * types.length)];
  const def = QUESTS[type];
  let goal = Math.ceil(def.base * (1 + S.questsDone * 0.12));
  if (def.cap) goal = Math.min(goal, def.cap);
  if (type === 'earn') goal = Math.max(def.base, Math.round(S.run.earned * 0.05));
  return { type, goal, prog: 0 };
}
const questReward = () => Math.max(40, Math.round(S.run.earned * 0.03));
function questProgress(type, n) {
  for (const q of S.quests) {
    if (q.type !== type || q.prog >= q.goal) continue;
    q.prog = Math.min(q.goal, q.prog + n);
    if (q.prog >= q.goal) { dirty = true; if (!simulatingOffline) toast('📌 Quest complete — claim it on the Board'); }
  }
}
function claimQuest(i) {
  const q = S.quests[i];
  if (!q || q.prog < q.goal) return;
  const coins = questReward();
  S.coins += coins; S.stats.earned += coins; S.run.earned += coins;
  gainInsight(2);
  S.questsDone++;
  S.quests.splice(i, 1);
  toast(`📌 Quest reward · 🪙+${fmt(coins)} · 💡+2`);
  dirty = true;
}

/* ---------- wandering trader ---------- */
function spawnTrader() {
  const stock = Object.keys(ITEMS).filter(id => S.seen[id] && !isUnique(id) && have(id) >= 5);
  if (stock.length < 2) { S.traderIn = 60; return; }
  const wants = Object.keys(ITEMS).filter(id => ITEMS[id].kind === 'raw');
  const offers = [];
  const pool = [...stock];
  for (let k = 0; k < 3 && pool.length; k++) {
    const give = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    const n = Math.max(5, Math.round(have(give) * 0.25));
    const options = wants.filter(id => id !== give);
    const get = options[Math.floor(Math.random() * options.length)];
    offers.push({ give, n, get, m: Math.max(1, Math.round(n * VALUE[give] * 1.6 / VALUE[get])) });
  }
  S.trader = { t: 240, offers };
  toast('🧳 A wandering trader has arrived at the market!', true);
  dirty = true;
}
function trade(i) {
  const o = S.trader && S.trader.offers[i];
  if (!o || o.done || have(o.give) < o.n) return;
  S.items[o.give] -= o.n;
  add(o.get, o.m);
  o.done = true;
  S.counts.trades++;
  dirty = true;
}

/* ---------- shooting star ---------- */
let starUntil = 0, starNext = Date.now() + 60000 + Math.random() * 60000;
function scheduleStar() {
  starUntil = 0;
  starNext = Date.now() + (90000 + Math.random() * 120000) / (S.research.stars ? 2 : 1);
}
function catchStar() {
  const el = $('#star');
  if (el.hidden) return;
  el.hidden = true;
  scheduleStar();
  S.counts.stars++;
  const roll = Math.random();
  if (roll < 0.6) {
    const coins = Math.max(25, Math.round(S.run.earned * 0.02));
    S.coins += coins; S.stats.earned += coins; S.run.earned += coins;
    toast(`🌠 A wish come true! 🪙+${fmt(coins)}`, true);
  } else if (roll < 0.85) {
    S.buffs.all = { m: 1.25, t: Math.max(180, S.buffs.all ? S.buffs.all.t : 0), icon: '🌠' };
    toast('🌠 Starlight! Everything +25% for 3 minutes', true);
  } else {
    gainInsight(3);
    toast('🌠 A flash of inspiration! 💡+3', true);
  }
  dirty = true;
}

/* ---------- simulation hooks ---------- */
function worldStep(dt) {
  // seasons
  if ((S.season.t -= dt) <= 0) {
    S.season = { i: (S.season.i + 1) % SEASONS.length, t: SEASON_LENGTH };
    dirty = true;
    if (!simulatingOffline) toast(`${SEASONS[S.season.i].icon} ${SEASONS[S.season.i].name} has come — ${SEASONS[S.season.i].desc.toLowerCase()}`);
  }
  // meals wear off
  for (const k of Object.keys(S.buffs)) if ((S.buffs[k].t -= dt) <= 0) { delete S.buffs[k]; dirty = true; }
  if (owns('stone_hoe')) farmStep(dt);
  mineDig(minePower() * dt);
  // pets that make things
  if (petLvl('hen')) add('egg', petLvl('hen') * dt / 60);
  if (petLvl('bees')) add('honey', petLvl('bees') * dt / 120);
  // quest board keeps three quests posted
  while (S.quests.length < 3) { const q = genQuest(); if (!q) break; S.quests.push(q); dirty = true; }
  // trader comes and goes (never arrives while you are away, but will be waiting soon after)
  if (S.trader) {
    if ((S.trader.t -= dt) <= 0) { S.trader = null; S.traderIn = 420; dirty = true; }
  } else if ((S.traderIn -= dt) <= 0 && !simulatingOffline) spawnTrader();
}

function worldLoop() {
  const now = Date.now();
  const el = $('#star');
  if (starUntil) {
    if (now >= starUntil) { el.hidden = true; scheduleStar(); }
  } else if (now >= starNext) {
    starUntil = now + 12000;
    el.style.left = (10 + Math.random() * 70) + '%';
    el.style.top = (18 + Math.random() * 50) + '%';
    el.hidden = false;
  }
}

function worldRefresh() {
  const s = SEASONS[S.season.i];
  const buffs = Object.values(S.buffs).map(b => `${b.icon}${fmtTime(b.t)}`).join(' ');
  const html = `${s.icon}${buffs ? ' · ' + buffs : ''}${S.trader ? ' · 🧳' : ''}`;
  const el = $('#status');
  if (el.innerHTML !== html) el.innerHTML = html;
}

/* ---------- sub-tabs ---------- */
const subTab = { gather: 'wild', town: 'orders', upgrades: 'coins' };
const SUBS = {
  gather: [
    ['wild', '🌲 Wild', () => true, () => renderGather()],
    ['farm', '🥕 Farm', () => owns('stone_hoe'), renderFarm],
    ['mine', '⛏️ Mine', () => owns('stone_pickaxe'), renderMine],
  ],
  town: [
    ['orders', '📦 Orders', () => true, () => renderOrders()],
    ['explore', '🧭 Explore', () => true, () => renderExpeditions()],
    ['tavern', '🍲 Tavern', () => true, renderTavern],
    ['pets', '🐾 Pets', () => true, renderPets],
    ['museum', '🏛️ Museum', () => true, renderMuseum],
    ['board', '📌 Board', () => true, renderBoard],
  ],
  upgrades: [
    ['coins', '🪙 Upgrades', () => true, () => renderUpgrades()],
    ['research', '💡 Research', () => true, renderResearch],
    ['legacy', '⭐ Legacy', () => true, () => renderLegacy()],
  ],
};
function renderSubs(tabId) {
  const list = SUBS[tabId].filter(s => s[2]());
  if (!list.some(s => s[0] === subTab[tabId])) subTab[tabId] = list[0][0];
  const chips = list.length < 2 ? '' : `<div class="chips">${list.map(s =>
    `<button class="chip ${s[0] === subTab[tabId] ? 'on' : ''}" data-a="sub" data-id="${tabId}:${s[0]}">${s[1]}${subBadge(s[0])}</button>`).join('')}</div>`;
  return chips + list.find(s => s[0] === subTab[tabId])[3]();
}
// A dot on a chip when something there is waiting for you.
function subBadge(sub) {
  const on =
    sub === 'farm' ? S.farm.plots.some(plotReady) :
    sub === 'board' ? S.quests.some(q => q.prog >= q.goal) :
    sub === 'explore' ? !!(S.exp && S.exp.ready) :
    sub === 'orders' ? S.orders.some(o => o.item && have(o.item) >= o.n) : false;
  return on ? '<span class="dot">•</span>' : '';
}

/* ---------- renderers ---------- */
function renderFarm() {
  const s = SEASONS[S.season.i];
  const last = CROP[S.farm.last];
  return `
    <div class="goal">${s.icon} <b>${s.name}</b> — ${s.desc.toLowerCase()} · <span data-k="season"></span> left</div>
    <div class="row actions" style="margin:0 0 10px">
      <button class="btn primary" data-a="harvestall" data-en="harvestall">Harvest all</button>
      <button class="btn" data-a="plantall" data-en="plantall">Plant empty: ${ITEMS[last.id].icon} · 🪙${seedCost(last)} each</button>
    </div>
    <div class="plots">
      ${S.farm.plots.map((p, i) => p ? `
        <button class="plot" data-a="plot" data-n="${i}">
          <span class="big">${plotReady(p) ? ITEMS[p.c].icon : '🌱'}</span>
          <span class="nm">${ITEMS[p.c].name}</span>
          <span class="sub" data-k="plot:${i}"></span>
          <span class="pbar"><span data-w="plot:${i}"></span></span>
        </button>` : `
        <button class="plot empty" data-a="plot" data-n="${i}">
          <span class="big">➕</span><span class="nm">Empty plot</span><span class="sub">tap to plant</span>
        </button>`).join('')}
      ${S.farm.plots.length < MAX_PLOTS ? `
        <button class="plot buy" data-a="buyplot" data-en="buyplot">
          <span class="big">🪧</span><span class="nm">New plot</span><span class="sub">🪙${fmt(plotCost())}</span>
        </button>` : ''}
    </div>
    <h3>Crops</h3>
    ${CROPS.map(c => cropUnlocked(c) ? `
      <div class="card row between"><div class="rname"><span class="big2">${ITEMS[c.id].icon}</span>
        <div><b>${ITEMS[c.id].name}</b> <span class="muted small">×<span data-k="n:${c.id}"></span></span>
        <div class="muted small">⏱ ${fmtTime(c.time)} · yields ${cropYield(c)} · seeds 🪙${seedCost(c)}</div></div></div></div>`
      : `<div class="card locked-row muted">🔒 A new crop unlocks at ${c.plots} plots</div>`).join('')}`;
}

function renderMine() {
  return `
    <div class="card station">
      <div class="row between"><b>⛏️ Floor <span data-k="minefloor"></span></b>
        <span class="muted small">deepest <span data-k="minebest"></span> · crew <span data-k="minepower"></span>/s</span></div>
      <button class="rock" data-a="dig"><span class="big" data-k="mineicon"></span><span class="sub" data-k="minehp"></span></button>
      <div class="pbar"><div data-w="mine"></div></div>
      <div class="muted small">Tap to dig. Outfit a crew and they keep digging while you're away. Every 5th floor hides a treasure.
        <span data-k="minelast"></span></div>
    </div>
    <h3>Crew outfit</h3>
    ${GEAR.map(g => S.seen[g.item] ? `
      <div class="card row between">
        <div class="rname"><span class="big2">${g.icon}</span>
          <div><b>${g.name}</b> <span class="muted small">Lv ${gearLvl(g.id)}</span>
          <div class="muted small">+${g.p} dig power per level</div></div></div>
        <button class="btn" data-a="gear" data-id="${g.id}" data-en="gear:${g.id}">${ITEMS[g.item].icon} <span data-k="n:${g.item}"></span>/${gearCost(g)}</button>
      </div>` : `<div class="card locked-row muted">🔒 Undiscovered equipment</div>`).join('')}`;
}

function renderTavern() {
  const active = Object.entries(S.buffs);
  const known = Object.keys(FOODS).filter(id => S.seen[id]);
  return `
    <div class="card">
      <b>🍲 Tavern</b>
      <div class="muted small">Eat what you cook for a timed boost. One meal of each kind at a time.</div>
      ${active.length ? `<div class="gains">${active.map(([k, b]) =>
        `<div class="gain">${b.icon} ${BUFF_LABEL[k]} ×${b.m} · <span data-k="buff:${k}"></span></div>`).join('')}</div>` : ''}
    </div>
    ${known.length ? '' : '<p class="muted center">Bake some bread in a Furnace to get started.</p>'}
    ${known.map(id => `
      <div class="card row between">
        <div class="rname"><span class="big2">${ITEMS[id].icon}</span>
          <div><b>${ITEMS[id].name}</b> <span class="muted small">×<span data-k="n:${id}"></span></span>
          <div class="muted small">${FOODS[id].text} · ${fmtTime(FOODS[id].t * (wing('food') ? 2 : 1))}</div></div></div>
        <button class="btn" data-a="eat" data-id="${id}" data-en="sell:${id}">Eat</button>
      </div>`).join('')}
    ${known.length < Object.keys(FOODS).length ? `<p class="muted center">❓ ${Object.keys(FOODS).length - known.length} more meals to discover.</p>` : ''}`;
}

function renderPets() {
  return `
    <p class="muted small">Pets stay with you forever — even when you set sail. Feed them their favourite food to level them up.</p>
    ${PETS.map(p => {
      const l = petLvl(p.id);
      if (!l) return `
        <div class="card row between">
          <div class="rname"><span class="big2">${p.icon}</span>
            <div><b>${p.name}</b><div class="muted small">${p.desc(1)} · loves ${ITEMS[p.food].icon}</div></div></div>
          <button class="btn" data-a="adopt" data-id="${p.id}" data-en="adopt:${p.id}">Adopt · 🪙${fmt(p.cost)}</button>
        </div>`;
      return `
        <div class="card row between">
          <div class="rname"><span class="big2">${p.icon}</span>
            <div><b>${p.name}</b> <span class="muted small">Lv ${l}${l >= PET_MAX ? ' max' : ''}</span>
            <div class="muted small">${p.desc(l)}</div></div></div>
          ${l >= PET_MAX ? '' : `<button class="btn" data-a="feed" data-id="${p.id}" data-en="feed:${p.id}">Feed ${ITEMS[p.food].icon} <span data-k="n:${p.food}"></span>/${petNeed(p)}</button>`}
        </div>`;
    }).join('')}`;
}

function renderMuseum() {
  return `
    <p class="muted small">Donate your finest work. Every exhibit adds +1% sell prices and 💡 insight, and each finished wing
      gives a permanent bonus that survives setting sail. <b>${exhibitCount()}</b> exhibits so far.</p>
    ${MUSEUM.map(w => `
      <div class="card">
        <div class="row between"><b>${w.icon} ${w.name}</b>
          <span class="small ${wingDone(w) ? 'hot' : 'muted'}">${wingDone(w) ? '✓ ' : ''}${w.bonus}</span></div>
        <div class="exhibits">
          ${w.items.map(id => S.museum[id] ? `<span class="ex done" title="${ITEMS[id].name}">${ITEMS[id].icon}</span>`
            : S.seen[id] ? `<button class="ex" data-a="donate" data-id="${id}" data-en="donate:${id}" title="${ITEMS[id].name}">${ITEMS[id].icon}<small><span data-k="n:${id}"></span>/${museumNeed(id)}</small></button>`
            : `<span class="ex unknown">❓</span>`).join('')}
        </div>
      </div>`).join('')}`;
}

function renderBoard() {
  return `
    <p class="muted small">Odd jobs from around town. No timers, no pressure — a new one is posted whenever you finish one.
      Each pays 🪙${fmt(questReward())} and 💡2. Done so far: <b>${S.questsDone}</b>.</p>
    ${S.quests.map((q, i) => `
      <div class="card">
        <div class="row between"><b>📌 ${QUESTS[q.type].text(q.goal)}</b>
          ${q.prog >= q.goal ? `<button class="btn primary small" data-a="quest" data-n="${i}">Claim</button>`
            : `<span class="muted small"><span data-k="quest:${i}"></span></span>`}</div>
        <div class="pbar"><div data-w="quest:${i}"></div></div>
      </div>`).join('')}`;
}

function renderResearch() {
  return `
    <div class="card"><b>💡 Insight: <span data-k="insight"></span></b>
      <div class="muted small">Earned by discovering items, gaining mastery, delivering orders, expeditions, quests,
        museum donations and mine treasures. Research is permanent.</div></div>
    ${RESEARCH.map(r => `
      <div class="card row between ${S.research[r.id] ? 'researched' : ''}">
        <div class="rname"><span class="big2">${r.icon}</span>
          <div><b>${r.name}</b><div class="muted small">${r.desc}</div></div></div>
        ${S.research[r.id] ? '<span class="hot">✓</span>'
          : `<button class="btn" data-a="research" data-id="${r.id}" data-en="research:${r.id}">💡${r.cost}</button>`}
      </div>`).join('')}`;
}

function renderTrader() {
  if (!S.trader) return '';
  return `
    <div class="card trader">
      <div class="row between"><b>🧳 Wandering trader</b><span class="muted small">leaves in <span data-k="trader"></span></span></div>
      ${S.trader.offers.map((o, i) => `
        <div class="row between offer">
          <span>${ITEMS[o.give].icon} ${fmt(o.n)} <span class="muted">→</span> ${ITEMS[o.get].icon} <b>${fmt(o.m)}</b> <span class="muted small">${ITEMS[o.get].name}</span></span>
          ${o.done ? '<span class="muted small">traded</span>'
            : `<button class="btn small" data-a="trade" data-n="${i}" data-en="trade:${i}">Trade</button>`}
        </div>`).join('')}
    </div>`;
}

function renderOptions() {
  return `<button class="btn" data-a="haptics">Vibration: ${S.opt.haptics ? 'on' : 'off'}</button>`;
}

/* ---------- bindings ---------- */
const WORLD_K = {
  season: () => fmtTime(S.season.t),
  plot: i => { const p = S.farm.plots[+i]; return !p ? '' : plotReady(p) ? 'Ready!' : fmtTime((CROP[p.c].time - p.t) / worldMult('farm')); },
  minefloor: () => String(S.mine.floor),
  minebest: () => String(Math.max(S.mine.best, S.mine.floor)),
  minepower: () => fmt(minePower(), 1),
  mineicon: () => (isTreasure(S.mine.floor) ? '💰' : '🪨'),
  minehp: () => `${fmt(Math.max(0, mineHp(S.mine.floor) - S.mine.dmg))} left`,
  minelast: () => (S.mine.last ? `Last find: ${S.mine.last}` : ''),
  buff: k => (S.buffs[k] ? fmtTime(S.buffs[k].t) : ''),
  quest: i => { const q = S.quests[+i]; return q ? `${fmt(q.prog)}/${fmt(q.goal)}` : ''; },
  insight: () => fmt(S.insight),
  trader: () => (S.trader ? fmtTime(S.trader.t) : ''),
};
const WORLD_E = {
  harvestall: () => S.farm.plots.some(plotReady),
  plantall: () => S.farm.plots.some(p => !p) && S.coins >= seedCost(CROP[S.farm.last]),
  buyplot: () => S.coins >= plotCost(),
  gear: id => { const g = GEAR.find(x => x.id === id); return have(g.item) >= gearCost(g); },
  adopt: id => S.coins >= PETS.find(p => p.id === id).cost,
  feed: id => { const p = PETS.find(x => x.id === id); return have(p.food) >= petNeed(p); },
  donate: id => have(id) >= museumNeed(id),
  research: id => S.insight >= RESEARCH.find(r => r.id === id).cost,
  trade: i => { const o = S.trader && S.trader.offers[+i]; return !!o && have(o.give) >= o.n; },
};
// Progress bar widths, in percent.
const WIDTHS = {
  exp: () => {
    const e = S.exp && EXPEDITIONS.find(x => x.id === S.exp.id);
    return e ? Math.min(100, (1 - Math.max(0, S.exp.end - Date.now()) / 1000 / expTime(e)) * 100) : 0;
  },
  plot: i => { const p = S.farm.plots[+i]; return p ? Math.min(100, p.t / CROP[p.c].time * 100) : 0; },
  mine: () => Math.min(100, S.mine.dmg / mineHp(S.mine.floor) * 100),
  quest: i => { const q = S.quests[+i]; return q ? q.prog / q.goal * 100 : 0; },
};

function worldAction(a, id, n, el) {
  switch (a) {
    case 'sub': { const [t, s] = id.split(':'); subTab[t] = s; dirty = true; break; }
    case 'plot': {
      const p = S.farm.plots[+n];
      if (plotReady(p)) harvest(+n);
      else if (!p) showModal(`<h2>Plant what?</h2>
        ${CROPS.filter(cropUnlocked).map(c => `
          <button class="btn wide" data-a="plant" data-id="${c.id}" data-n="${n}" ${S.coins < seedCost(c) ? 'disabled' : ''}>
            ${ITEMS[c.id].icon} ${ITEMS[c.id].name} · ⏱ ${fmtTime(c.time)} · yields ${cropYield(c)} · 🪙${seedCost(c)}</button>`).join('')}
        <button class="btn wide" data-a="close-modal">Cancel</button>`);
      break;
    }
    case 'plant': plant(+n, id); closeModal(); break;
    case 'plantall': S.farm.plots.forEach((p, i) => { if (!p) plant(i, S.farm.last); }); break;
    case 'harvestall': S.farm.plots.forEach((p, i) => harvest(i)); break;
    case 'buyplot':
      if (S.coins >= plotCost() && S.farm.plots.length < MAX_PLOTS) { S.coins -= plotCost(); S.farm.plots.push(null); dirty = true; }
      break;
    case 'dig': mineDig(tapPower() * 2 + minePower() * 0.5); S.stats.taps++; buzz(); break;
    case 'gear': buyGear(id); break;
    case 'eat': eat(id); break;
    case 'adopt': adopt(id); break;
    case 'feed': feedPet(id); break;
    case 'donate': donate(id); break;
    case 'quest': claimQuest(+n); break;
    case 'research': buyResearch(id); break;
    case 'trade': trade(+n); break;
    case 'star': catchStar(); break;
    case 'haptics': S.opt.haptics = !S.opt.haptics; dirty = true; break;
    case 'status': {
      const s = SEASONS[S.season.i];
      const buffs = Object.entries(S.buffs);
      showModal(`<h2>${s.icon} ${s.name}</h2>
        <p class="muted">${s.desc}. Next season in ${fmtTime(S.season.t)}.</p>
        ${buffs.length ? `<p><b>Active boosts</b></p><div class="gains">${buffs.map(([k, b]) =>
          `<div class="gain">${b.icon} ${BUFF_LABEL[k]} ×${b.m} · ${fmtTime(b.t)}</div>`).join('')}</div>`
          : '<p class="muted small">No meals active. Eat at the Tavern (Town tab) for a boost.</p>'}
        ${S.trader ? '<p>🧳 A trader is waiting in the Market.</p>' : ''}
        <button class="btn primary wide" data-a="close-modal">OK</button>`);
      break;
    }
    default: return advAction(a, id, n);
  }
  return true;
}
