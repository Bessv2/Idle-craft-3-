'use strict';

/* ============================================================
   Extra gameplay loops: mastery, town orders, market demand,
   expeditions & relics, achievements, legacy (prestige).
   Loaded before game.js; only touches game state at call time.
   ============================================================ */

/* ---------- data ---------- */
const RELICS = [
  { id: 'idol',      name: 'Stone Idol',      icon: '🗿', desc: 'Workers gather 10% faster',     eff: { worker: 1.1 } },
  { id: 'fossil',    name: 'Fossil',          icon: '🦴', desc: 'Workers gather 10% faster',     eff: { worker: 1.1 } },
  { id: 'lamp',      name: 'Old Lamp',        icon: '🪔', desc: '+3 per tap',                    eff: { tap: 3 } },
  { id: 'hourglass', name: 'Hourglass',       icon: '⏳', desc: 'Crafting is 10% faster',        eff: { speed: 0.9 } },
  { id: 'shell',     name: 'Singing Shell',   icon: '🐚', desc: 'Crafting is 10% faster',        eff: { speed: 0.9 } },
  { id: 'horn',      name: 'Hunting Horn',    icon: '📯', desc: 'Expeditions are 20% faster',    eff: { exp: 0.8 } },
  { id: 'amphora',   name: 'Ancient Amphora', icon: '🏺', desc: 'Everything sells for 10% more', eff: { price: 1.1 } },
  { id: 'mask',      name: 'Ritual Mask',     icon: '🎭', desc: 'Everything sells for 10% more', eff: { price: 1.1 } },
  { id: 'scroll',    name: 'Lost Scroll',     icon: '📜', desc: 'Mastery grows 50% faster',      eff: { mastery: 1.5 } },
  { id: 'key',       name: 'Golden Key',      icon: '🗝️', desc: 'Orders pay 25% more',           eff: { order: 1.25 } },
];

// time in seconds; loot is [min, max]; relic = chance to find one from `pool`.
const EXPEDITIONS = [
  { id: 'woods', name: 'Deep Woods', icon: '🌲', needs: 'workbench', time: 180,
    cost: { berries: 20, rope: 3 },
    loot: { wood: [40, 80], fiber: [30, 60], berries: [20, 40], herbs: [2, 6] },
    relic: 0.10, pool: ['idol', 'fossil', 'horn'] },
  { id: 'caves', name: 'Echo Caves', icon: '🕳️', needs: 'furnace', time: 600,
    cost: { torch: 6, bread: 4, rope: 4 },
    loot: { copper_ore: [30, 60], coal: [30, 60], iron_ore: [10, 30], crystal: [1, 4] },
    relic: 0.18, pool: ['lamp', 'fossil', 'hourglass', 'idol'] },
  { id: 'ruins', name: 'Sunken Ruins', icon: '🏛️', needs: 'copper_pickaxe', time: 1800,
    cost: { pie: 6, torch: 10, shield: 1 },
    loot: { gold_ore: [10, 25], crystal: [4, 10], brick: [10, 20], glass: [6, 14] },
    relic: 0.28, pool: ['amphora', 'mask', 'scroll', 'shell', 'hourglass'] },
  { id: 'isles', name: 'Far Isles', icon: '🏝️', needs: 'workshop', time: 3600,
    cost: { compass: 1, jam: 8, backpack: 2 },
    loot: { gold_ore: [40, 80], crystal: [20, 40], wool: [40, 80], herbs: [40, 80] },
    relic: 0.45, pool: RELICS.map(r => r.id) },
];

const PERK_MAX = 10;
const PERKS = [
  { id: 'gather',  name: 'Heirloom Tools',   icon: '🪓', desc: '+25% gathering (taps and workers)' },
  { id: 'speed',   name: 'Family Recipes',   icon: '📒', desc: 'Crafting is 15% faster' },
  { id: 'price',   name: 'Trade Routes',     icon: '🗺️', desc: '+20% sell prices' },
  { id: 'start',   name: 'Inheritance',      icon: '💰', desc: 'Start each voyage with more coins' },
  { id: 'mastery', name: 'Apprentice Notes', icon: '✍️', desc: 'Keep 20% more recipe mastery when you sail' },
];

const totalWorkers = () => Object.values(S.workers).reduce((a, b) => a + b, 0);
const seenCount = () => Object.keys(ITEMS).filter(id => id !== 'hand' && S.seen[id]).length;
const relicCount = () => Object.keys(S.relics).length;
const bestMastery = () => Math.max(0, ...Object.keys(S.mastery).map(masteryLvl));

const ACHIEVEMENTS = [
  { id: 'tap1', name: 'Callused Hands',  desc: 'Tap 100 times',            test: () => S.stats.taps >= 100 },
  { id: 'tap2', name: 'Tireless',        desc: 'Tap 1,000 times',          test: () => S.stats.taps >= 1000 },
  { id: 'tap3', name: 'Finger of Steel', desc: 'Tap 10,000 times',         test: () => S.stats.taps >= 10000 },
  { id: 'cr1',  name: 'Tinkerer',        desc: 'Craft 50 items',           test: () => S.stats.crafted >= 50 },
  { id: 'cr2',  name: 'Artisan',         desc: 'Craft 1,000 items',        test: () => S.stats.crafted >= 1000 },
  { id: 'cr3',  name: 'Factory Floor',   desc: 'Craft 25,000 items',       test: () => S.stats.crafted >= 25000 },
  { id: 'co1',  name: 'Pocket Change',   desc: 'Earn 1,000 coins',         test: () => S.stats.earned >= 1e3 },
  { id: 'co2',  name: 'Well Off',        desc: 'Earn 100K coins',          test: () => S.stats.earned >= 1e5 },
  { id: 'co3',  name: 'Tycoon',          desc: 'Earn 10M coins',           test: () => S.stats.earned >= 1e7 },
  { id: 'co4',  name: 'Golden Age',      desc: 'Earn 1B coins',            test: () => S.stats.earned >= 1e9 },
  { id: 'di1',  name: 'Curious',         desc: 'Discover 15 items',        test: () => seenCount() >= 15 },
  { id: 'di2',  name: 'Scholar',         desc: 'Discover 40 items',        test: () => seenCount() >= 40 },
  { id: 'di3',  name: 'Encyclopedist',   desc: 'Discover every item',      test: () => seenCount() >= Object.keys(ITEMS).length - 1 },
  { id: 'wo1',  name: 'Small Crew',      desc: 'Employ 10 workers',        test: () => totalWorkers() >= 10 },
  { id: 'wo2',  name: 'Village',         desc: 'Employ 50 workers',        test: () => totalWorkers() >= 50 },
  { id: 'wo3',  name: 'Workforce',       desc: 'Employ 150 workers',       test: () => totalWorkers() >= 150 },
  { id: 'or1',  name: 'Helpful',         desc: 'Deliver 5 orders',         test: () => S.counts.orders >= 5 },
  { id: 'or2',  name: 'Reliable',        desc: 'Deliver 25 orders',        test: () => S.counts.orders >= 25 },
  { id: 'or3',  name: 'Pillar of Town',  desc: 'Deliver 100 orders',       test: () => S.counts.orders >= 100 },
  { id: 'to1',  name: 'Growing Town',    desc: 'Reach town level 5',       test: () => S.town.lvl >= 5 },
  { id: 'to2',  name: 'Bustling Town',   desc: 'Reach town level 10',      test: () => S.town.lvl >= 10 },
  { id: 'ex1',  name: 'Explorer',        desc: 'Complete an expedition',   test: () => S.counts.exps >= 1 },
  { id: 'ex2',  name: 'Pathfinder',      desc: 'Complete 10 expeditions',  test: () => S.counts.exps >= 10 },
  { id: 'ex3',  name: 'Trailblazer',     desc: 'Complete 50 expeditions',  test: () => S.counts.exps >= 50 },
  { id: 're1',  name: 'Lucky Find',      desc: 'Find a relic',             test: () => relicCount() >= 1 },
  { id: 're2',  name: 'Collector',       desc: 'Find 5 relics',            test: () => relicCount() >= 5 },
  { id: 're3',  name: 'Curator',         desc: 'Find every relic',         test: () => relicCount() >= RELICS.length },
  { id: 'ma1',  name: 'Practiced',       desc: 'Reach mastery 5 on a recipe',  test: () => bestMastery() >= 5 },
  { id: 'ma2',  name: 'Grandmaster',     desc: 'Reach mastery 10 on a recipe', test: () => bestMastery() >= 10 },
  { id: 'au1',  name: 'It Lives!',       desc: 'Build an Automaton',       test: () => !!S.seen.automaton },
  { id: 'sh1',  name: 'Shipwright',      desc: 'Build a Ship',             test: () => !!S.seen.ship },
  { id: 'le1',  name: 'New Horizons',    desc: 'Set sail for a new land',  test: () => S.legacy.count >= 1 },
  { id: 'le2',  name: 'Seasoned Sailor', desc: 'Set sail 5 times',         test: () => S.legacy.count >= 5 },
];

function featureDefaults() {
  return {
    mastery: {},
    orders: [],
    town: { lvl: 0, xp: 0 },
    hot: null,
    exp: null,
    relics: {},
    ach: {},
    legacy: { pts: 0, total: 0, count: 0, perks: {} },
    run: { earned: 0 },
    counts: { orders: 0, exps: 0, harvest: 0, stars: 0, trades: 0 },
  };
}

/* ---------- multipliers ---------- */
function relicMult(key) {
  let m = 1;
  for (const r of RELICS) if (S.relics[r.id] && r.eff[key]) m *= r.eff[key];
  return m;
}
const relicTap = () => RELICS.reduce((a, r) => a + (S.relics[r.id] && r.eff.tap || 0), 0);
const perk = id => S.legacy.perks[id] || 0;
const achCount = () => Object.keys(S.ach).length;
const achMult = () => 1 + 0.01 * achCount();
const isHot = id => !!S.hot && S.hot.id === id;

/* ---------- mastery ---------- */
const MASTERY_MAX = 10;
const masteryLvl = rid => Math.min(MASTERY_MAX, Math.floor(Math.log2((S.mastery[rid] || 0) / 10 + 1)));
const masteryNext = lvl => 10 * (Math.pow(2, lvl + 1) - 1);
function masteryText(rid) {
  const lvl = masteryLvl(rid);
  if (lvl >= MASTERY_MAX) return `★${lvl} max`;
  return `★${lvl} · ${Math.floor(S.mastery[rid] || 0)}/${masteryNext(lvl)}`;
}
// Called when a non-unique craft finishes. Returns true if the craft yields a bonus batch.
function onCrafted(r) {
  const before = masteryLvl(r.id);
  S.mastery[r.id] = (S.mastery[r.id] || 0) + relicMult('mastery');
  const lvl = masteryLvl(r.id);
  if (lvl > before) {
    dirty = true;
    gainInsight(1);
    if (!simulatingOffline) toast(`★ ${ITEMS[recipeOut(r)].name} mastery ${lvl}`);
  }
  return Math.random() < (S.research.class ? 0.08 : 0.05) * lvl;
}

/* ---------- town orders ---------- */
const orderSlots = () => 3 + (S.town.lvl >= 5 ? 1 : 0) + (S.town.lvl >= 10 ? 1 : 0);
const townNeed = () => 3 + S.town.lvl * 2;
const orderPool = () => Object.keys(ITEMS).filter(id => S.seen[id] && (ITEMS[id].kind === 'mat' || ITEMS[id].kind === 'good'));
function genOrder() {
  let pool = orderPool();
  if (!pool.length) return null;
  // never ask for the same item in two slots; the slot waits until there is something new to ask for
  const taken = new Set(S.orders.map(o => o.item));
  pool = pool.filter(id => !taken.has(id));
  if (!pool.length) return null;
  // finished goods are requested more often than plain materials
  const weighted = pool.flatMap(id => ITEMS[id].kind === 'good' ? [id, id, id] : [id]);
  const item = weighted[Math.floor(Math.random() * weighted.length)];
  const budget = (25 + 20 * S.town.lvl * S.town.lvl) * (0.6 + Math.random() * 0.9);
  return { item, n: Math.max(1, Math.round(budget / VALUE[item])) };
}
const orderReward = o => Math.ceil(VALUE[o.item] * o.n * (S.research.haggle ? 3 : 2.5) * priceMult() * relicMult('order'));

function deliverOrder(i) {
  const o = S.orders[i];
  if (!o || !o.item || have(o.item) < o.n) return;
  S.items[o.item] -= o.n;
  const gain = orderReward(o);
  S.coins += gain;
  S.stats.earned += gain;
  S.run.earned += gain;
  S.counts.orders++;
  questProgress('order', 1);
  gainInsight(1);
  S.town.xp++;
  while (S.town.xp >= townNeed()) {
    S.town.xp -= townNeed();
    S.town.lvl++;
    toast(`🏘️ The town grew to level ${S.town.lvl}!`, true);
  }
  S.orders[i] = { wait: 8 };
  toast(`📦 Order delivered · 🪙+${fmt(gain)}`);
  dirty = true;
}
function dismissOrder(i) {
  if (S.orders[i] && S.orders[i].item) { S.orders[i] = { wait: 20 }; dirty = true; }
}

/* ---------- expeditions ---------- */
const expTime = e => e.time * relicMult('exp') * Math.max(0.5, 1 - 0.05 * petLvl('dog'));
const expLootMult = () => (1 + 0.1 * S.town.lvl) * (1 + 0.25 * perk('gather')) * (S.research.maps ? 1.5 : 1) * (wing('cloth') ? 1.2 : 1);
function startExpedition(id) {
  const e = EXPEDITIONS.find(x => x.id === id);
  if (S.exp || !owns(e.needs) || !canAfford({ in: e.cost })) return;
  consume({ in: e.cost });
  S.exp = { id, end: Date.now() + expTime(e) * 1000 };
  dirty = true;
}
function claimExpedition() {
  if (!S.exp || Date.now() < S.exp.end) return;
  const e = EXPEDITIONS.find(x => x.id === S.exp.id);
  S.exp = null;
  S.counts.exps++;
  gainInsight(3);
  const found = [];
  for (const [id, [lo, hi]] of Object.entries(e.loot)) {
    const n = Math.round((lo + Math.random() * (hi - lo)) * expLootMult());
    add(id, n);
    found.push(`<div class="gain">${ITEMS[id].icon} +${fmt(n)}</div>`);
  }
  let relicHtml = '';
  if (Math.random() < e.relic) {
    const fresh = e.pool.filter(id => !S.relics[id]);
    if (fresh.length) {
      const r = RELICS.find(x => x.id === fresh[Math.floor(Math.random() * fresh.length)]);
      S.relics[r.id] = 1;
      relicHtml = `<div class="relic-found"><span class="big2">${r.icon}</span>
        <div><b>Relic found: ${r.name}</b><div class="muted small">${r.desc}</div></div></div>`;
    } else {
      const coins = Math.ceil(e.time * 2 * priceMult());
      S.coins += coins; S.stats.earned += coins; S.run.earned += coins;
      found.push(`<div class="gain">🪙 +${fmt(coins)}</div>`);
    }
  }
  showModal(`<h2>${e.icon} Back from the ${e.name}</h2>
    <p class="muted">Your explorers brought home:</p>
    <div class="gains">${found.join('')}</div>${relicHtml}
    <button class="btn primary wide" data-a="close-modal">Great</button>`);
  dirty = true;
}

/* ---------- legacy (prestige) ---------- */
const legacyGain = () => Math.max(3, Math.floor(Math.sqrt(S.run.earned / 2500)));
const canSail = () => have('ship') >= 1;
const perkCost = id => perk(id) + 1;
const startCoins = () => perk('start') ? 200 * Math.pow(5, perk('start') - 1) : 0;
function buyPerk(id) {
  if (perk(id) >= PERK_MAX || S.legacy.pts < perkCost(id)) return;
  S.legacy.pts -= perkCost(id);
  S.legacy.perks[id] = perk(id) + 1;
  dirty = true;
}
function setSail() {
  if (!canSail()) return;
  const gain = legacyGain();
  const keepFrac = Math.min(1, 0.2 * perk('mastery'));
  const mastery = {};
  for (const [k, v] of Object.entries(S.mastery)) if (v * keepFrac >= 1) mastery[k] = v * keepFrac;
  const keep = { stats: S.stats, relics: S.relics, ach: S.ach, legacy: S.legacy, counts: S.counts, mastery, ...worldKeep() };
  S = Object.assign(newState(), keep);
  S.legacy.pts += gain;
  S.legacy.total += gain;
  S.legacy.count++;
  S.coins = startCoins();
  save();
  setTab('gather');
  showModal(`<h2>⛵ A new land!</h2>
    <p class="muted">You sailed away and started fresh, carrying your relics, achievements and
    <b>⭐ ${gain} Legacy</b>. Spend it on permanent perks in the Upgrade tab.</p>
    <button class="btn primary wide" data-a="close-modal">Onward</button>`);
}

/* ---------- achievements ---------- */
function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (S.ach[a.id] || !a.test()) continue;
    S.ach[a.id] = 1;
    toast(`🏅 ${a.name}`, true);
    dirty = true;
  }
}

/* ---------- per-step simulation ---------- */
function featureStep(dt) {
  // orders: fill empty slots, count down waiting ones
  const slots = orderSlots();
  while (S.orders.length < slots) S.orders.push({ wait: 0 });
  for (let i = 0; i < slots; i++) {
    const o = S.orders[i];
    if (o.item) continue;
    o.wait -= dt;
    if (o.wait <= 0) {
      const fresh = genOrder();
      if (fresh) { S.orders[i] = fresh; dirty = true; } else o.wait = 5;
    }
  }
  // market demand: one item sells for double, rotating every 5 minutes
  if (!S.hot || (S.hot.t -= dt) <= 0) {
    const pool = orderPool();
    const next = pool.length ? { id: pool[Math.floor(Math.random() * pool.length)], t: 300 } : null;
    if (next || S.hot) dirty = true;
    S.hot = next;
  }
}

// Called from the main loop (real time, not simulation).
function featureLoop() {
  if (S.exp && !S.exp.ready && Date.now() >= S.exp.end) {
    S.exp.ready = true;
    toast('🧭 Your expedition has returned!', true);
    dirty = true;
  }
  checkAchievements();
}

/* ---------- rendering ---------- */
function costChips(cost) {
  return Object.entries(cost).map(([i, n]) =>
    `<span class="need" data-c="need:${i}:${n}">${ITEMS[i].icon} <span data-k="n:${i}"></span>/${n}</span>`).join('');
}

function renderOrders() {
  const slots = orderSlots();
  const hasPool = orderPool().length > 0;
  return `
    <div class="card">
      <div class="row between"><b>🏘️ Town · Level ${S.town.lvl}</b>
        <span class="muted small">${S.town.xp}/${townNeed()} orders to next level</span></div>
      <div class="pbar"><div style="width:${S.town.xp / townNeed() * 100}%"></div></div>
      <div class="muted small">Deliver orders to grow the town. A bigger town places bigger orders and improves expedition loot.</div>
    </div>

    ${hasPool ? '' : '<p class="muted center">Craft something first — the townsfolk will start asking for it.</p>'}
    ${S.orders.slice(0, slots).map((o, i) => o.item ? `
      <div class="card">
        <div class="row between">
          <div class="rname"><span class="big2">${ITEMS[o.item].icon}</span>
            <div><b>${ITEMS[o.item].name} ×${fmt(o.n)}</b>
              <div class="small"><span class="need" data-c="need:${o.item}:${o.n}">have <span data-k="n:${o.item}"></span></span>
              <span class="muted">· pays 🪙<span data-k="ordreward:${i}"></span></span></div></div>
          </div>
        </div>
        <div class="row actions">
          <button class="btn primary" data-a="deliver" data-n="${i}" data-en="order:${i}">Deliver</button>
          <button class="btn" data-a="dismiss" data-n="${i}">Skip</button>
        </div>
      </div>` : (hasPool ? `<div class="card muted center small">✉️ A new order is on its way…</div>` : '')).join('')}`;
}

function renderExpeditions() {
  return `
    <p class="muted small">Send explorers out with supplies. They return with resources — sometimes ones you can't gather yet — and maybe a relic.</p>
    ${S.exp ? (() => {
      const e = EXPEDITIONS.find(x => x.id === S.exp.id);
      return `<div class="card station">
        <div class="row between"><b>${e.icon} ${e.name}</b>
          ${S.exp.ready
            ? `<button class="btn primary" data-a="claim">Claim loot</button>`
            : `<span class="muted">back in <span data-k="exptime"></span></span>`}</div>
        ${S.exp.ready ? '' : `<div class="pbar"><div data-w="exp"></div></div>`}
      </div>`;
    })() : ''}
    ${EXPEDITIONS.map(e => owns(e.needs) ? `
      <div class="card">
        <div class="row between">
          <div class="rname"><span class="big2">${e.icon}</span>
            <div><b>${e.name}</b>
              <div class="muted small">⏱ ${fmtTime(expTime(e))} · finds ${Object.keys(e.loot).map(i => ITEMS[i].icon).join('')} · relic chance ${Math.round(e.relic * 100)}%</div></div>
          </div>
        </div>
        <div class="inputs">${costChips(e.cost)}</div>
        <div class="row actions">
          <button class="btn" data-a="expedition" data-id="${e.id}" data-en="exp:${e.id}">Send explorers</button>
        </div>
      </div>` : `
      <div class="card locked-row muted">🔒 ${e.icon} ${e.name} — needs ${ITEMS[e.needs].icon} ${ITEMS[e.needs].name}</div>`).join('')}

    <h3>Relics <span class="muted small">${relicCount()}/${RELICS.length}</span></h3>
    <p class="muted small">Rare finds from expeditions. Their bonuses are permanent — even when you set sail.</p>
    ${RELICS.map(r => S.relics[r.id]
      ? `<div class="card rname"><span class="big2">${r.icon}</span><div><b>${r.name}</b><div class="muted small">${r.desc}</div></div></div>`
      : '').join('')}
    <div class="collection">
      ${RELICS.filter(r => !S.relics[r.id]).map(() => `<div class="ci unknown">❓<small>???</small></div>`).join('')}
    </div>`;
}

function renderAchievements() {
  return `
    <h3>Achievements <span class="muted small">${achCount()}/${ACHIEVEMENTS.length} · +${achCount()}% sell prices</span></h3>
    <div class="achs">
      ${ACHIEVEMENTS.map(a => `
        <div class="ach ${S.ach[a.id] ? 'done' : ''}">
          <span>${S.ach[a.id] ? '🏅' : '▫️'}</span>
          <div><b>${a.name}</b><div class="muted small">${a.desc}</div></div>
        </div>`).join('')}
    </div>`;
}

function renderLegacy() {
  return `
    <h3>Legacy <span class="muted small">⭐ ${S.legacy.pts} to spend</span></h3>
    <div class="card">
      <p class="muted small">Build a 🚢 Ship, then set sail for a new land. You start over, but earn
      ⭐ Legacy for permanent perks. Relics, pets, research, the museum and achievements are kept.</p>
      <div class="row between">
        <span class="small">${canSail() ? `Sailing now earns <b>⭐ ${legacyGain()}</b>` : 'You need a Ship to set sail.'}</span>
        <button class="btn primary" data-a="sail" ${canSail() ? '' : 'disabled'}>⛵ Set sail</button>
      </div>
    </div>
    ${PERKS.map(p => `
      <div class="card row between">
        <div class="rname"><span class="big2">${p.icon}</span>
          <div><b>${p.name}</b> <span class="muted small">Lv ${perk(p.id)}</span>
          <div class="muted small">${p.desc}</div></div></div>
        ${perk(p.id) >= PERK_MAX ? '<span class="muted small">max</span>'
          : `<button class="btn" data-a="perk" data-id="${p.id}" data-en="perk:${p.id}">⭐${perkCost(p.id)}</button>`}
      </div>`).join('')}`;
}

/* ---------- bindings merged into the main UI ---------- */
const FEATURE_K = {
  ordreward: i => { const o = S.orders[+i]; return o && o.item ? fmt(orderReward(o)) : ''; },
  exptime: () => S.exp ? fmtTime(Math.max(0, (S.exp.end - Date.now()) / 1000)) : '',
  mast: rid => masteryText(rid),
  hot: () => S.hot ? fmtTime(S.hot.t) : '',
};
const FEATURE_E = {
  order: i => { const o = S.orders[+i]; return !!(o && o.item && have(o.item) >= o.n); },
  exp: id => !S.exp && canAfford({ in: EXPEDITIONS.find(e => e.id === id).cost }),
  perk: id => S.legacy.pts >= perkCost(id),
};

function featureAction(a, id, n) {
  switch (a) {
    case 'deliver': deliverOrder(+n); break;
    case 'dismiss': dismissOrder(+n); break;
    case 'expedition': startExpedition(id); break;
    case 'claim': claimExpedition(); break;
    case 'perk': buyPerk(id); break;
    case 'sail':
      showModal(`<h2>⛵ Set sail?</h2>
        <p class="muted">You will leave everything behind — coins, items, workers, upgrades and stations —
        and start again in a new land with <b>⭐ ${legacyGain()} Legacy</b>.</p>
        <p class="muted small">Kept: relics, pets, research, museum, achievements, stats and Legacy perks.</p>
        <div class="row actions"><button class="btn primary" data-a="do-sail">Set sail</button>
        <button class="btn" data-a="close-modal">Stay</button></div>`);
      break;
    case 'do-sail': closeModal(); setSail(); break;
    default: return worldAction(a, id, n);
  }
  return true;
}
