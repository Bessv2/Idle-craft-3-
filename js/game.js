'use strict';

/* ============================================================
   Idle Craft — no ads, no paywalls, no tracking.
   ============================================================ */

const SAVE_KEY = 'idlecraft-save-v1';
const OFFLINE_CAP_HOURS = 12;
const WORKER_BASE_RATE = 0.2; // items per second per worker

const RECIPE = Object.fromEntries(RECIPES.map(r => [r.id, r]));
const NODE = Object.fromEntries(NODES.map(n => [n.id, n]));
const STATION = Object.fromEntries(STATIONS.map(s => [s.id, s]));
const isUnique = id => ITEMS[id].kind === 'tool' || ITEMS[id].kind === 'station';
const recipeOut = r => Object.keys(r.out)[0];

/* ---------- item values (derived from recipes) ---------- */
const VALUE = {};
(function computeValues() {
  for (const [id, it] of Object.entries(ITEMS)) if (it.kind === 'raw') VALUE[id] = it.value;
  // Repeat until every craftable item has a value (recipes can reference later items).
  for (let pass = 0; pass < 20; pass++) {
    for (const r of RECIPES) {
      const out = recipeOut(r);
      if (VALUE[out] !== undefined) continue;
      let sum = 0, ok = true;
      for (const [i, n] of Object.entries(r.in)) {
        if (VALUE[i] === undefined) { ok = false; break; }
        sum += VALUE[i] * n;
      }
      if (ok) VALUE[out] = Math.max(1, Math.round(sum / r.out[out] * 1.3 + r.t * 0.4));
    }
  }
})();

/* ---------- state ---------- */
function newState() {
  return {
    v: 1,
    coins: 0,
    items: {},
    seen: { hand: true },
    workers: {},
    upg: { tap: 0, worker: 0, speed: 0, price: 0 },
    st: {},
    autosell: {},
    stats: { earned: 0, crafted: 0, taps: 0, sold: 0, started: Date.now() },
    last: Date.now(),
    ...featureDefaults(),
    ...worldDefaults(),
    ...advDefaults(),
  };
}
let S = newState();

function stationState(id) {
  if (!S.st[id]) S.st[id] = { lvl: 0, queue: [], slots: [], auto: {}, rr: 0 };
  return S.st[id];
}

/* ---------- helpers ---------- */
const have = id => Math.floor((S.items[id] || 0) + 1e-9);
const owns = id => id === 'hand' || have(id) >= 1;
function add(id, n) {
  S.items[id] = (S.items[id] || 0) + n;
  if (!S.seen[id] && S.items[id] >= 1) { S.seen[id] = true; onDiscover(id); }
}
const tapPower = () => Math.ceil((1 + S.upg.tap + relicTap()) * (1 + 0.25 * perk('gather')) * worldMult('tap'));
const workerMult = () => Math.pow(1.25, S.upg.worker) * relicMult('worker') * (1 + 0.25 * perk('gather')) * worldMult('worker') * heroWorkerMult();
const speedMult = () => Math.pow(0.85, S.upg.speed + perk('speed')) * relicMult('speed') / worldMult('craft');
const priceMult = () => Math.pow(1.1, S.upg.price) * relicMult('price') * (1 + 0.2 * perk('price')) * achMult() * worldMult('price');
const nodeRate = id => (S.workers[id] || 0) * WORKER_BASE_RATE * workerMult();
const hireCost = id => Math.ceil(NODE[id].hire * Math.pow(1.17, S.workers[id] || 0));
const upgCost = u => Math.ceil(u.base * Math.pow(u.growth, S.upg[u.id]));
const stationCost = id => Math.ceil(STATION[id].upgrade * Math.pow(4, stationState(id).lvl));
const stationSlots = id => Math.max(1, stationState(id).lvl);
const craftTime = r => r.t * speedMult() * Math.pow(0.95, masteryLvl(r.id));
const sellPrice = id => VALUE[id] * priceMult() * (isHot(id) ? hotMult() : 1);
const nodeUnlocked = n => !n.needs || owns(n.needs);

function canAfford(r, times = 1) {
  for (const [i, n] of Object.entries(r.in)) if (have(i) < n * times) return false;
  return true;
}
function maxCraftable(r) {
  let m = Infinity;
  for (const [i, n] of Object.entries(r.in)) m = Math.min(m, Math.floor(have(i) / n));
  return m;
}
function consume(r, times = 1) { for (const [i, n] of Object.entries(r.in)) S.items[i] -= n * times; }
function refund(r, times = 1) { for (const [i, n] of Object.entries(r.in)) S.items[i] += n * times; }

function inProgress(rid) {
  // How many of this recipe are queued or being crafted.
  const st = S.st[RECIPE[rid].at];
  if (!st) return 0;
  let c = 0;
  for (const q of st.queue) if (q.r === rid) c += q.n;
  for (const s of st.slots) if (s && s.r === rid) c++;
  return c;
}

function recipeVisible(r) {
  if (!owns(r.at)) return false;
  for (const i of Object.keys(r.in)) if (!S.seen[i]) return false;
  const out = recipeOut(r);
  if (isUnique(out) && (owns(out) || inProgress(r.id) > 0)) return false;
  return true;
}

/* ---------- actions ---------- */
function tapNode(id, el) {
  const n = tapAmount(); // includes combo and lucky strikes
  add(id, n);
  S.stats.taps++;
  questProgress('tap', 1);
  buzz();
  floatText(el, '+' + fmt(n) + tapLabel);
}

function hire(id) {
  const c = hireCost(id);
  if (S.coins < c) return;
  S.coins -= c;
  S.workers[id] = (S.workers[id] || 0) + 1;
  dirty = true;
}

function buyUpgrade(id) {
  const u = UPGRADES.find(x => x.id === id);
  const c = upgCost(u);
  if (S.coins < c) return;
  S.coins -= c;
  S.upg[id]++;
  dirty = true;
}

function upgradeStation(id) {
  const c = stationCost(id);
  if (S.coins < c) return;
  S.coins -= c;
  stationState(id).lvl++;
  toast(`${ITEMS[id].icon} ${ITEMS[id].name} is now level ${stationState(id).lvl}`);
  dirty = true;
}

function enqueue(rid, times) {
  const r = RECIPE[rid];
  if (isUnique(recipeOut(r))) times = 1;
  times = Math.min(times, maxCraftable(r));
  if (times < 1) return;
  consume(r, times); // materials are reserved when queued; cancelling refunds them
  const st = stationState(r.at);
  const last = st.queue[st.queue.length - 1];
  if (last && last.r === rid) last.n += times; else st.queue.push({ r: rid, n: times });
  if (isUnique(recipeOut(r))) dirty = true;
}

function cancelQueue(stationId, idx) {
  const st = stationState(stationId);
  const q = st.queue[idx];
  if (!q) return;
  refund(RECIPE[q.r], q.n);
  st.queue.splice(idx, 1);
  dirty = true;
}

function toggleAuto(rid) {
  const r = RECIPE[rid];
  const st = stationState(r.at);
  if (st.lvl < 1) return;
  st.auto[rid] = !st.auto[rid];
  dirty = true;
}

function sell(id, n) {
  n = Math.min(n, have(id));
  if (n < 1 || isUnique(id)) return;
  S.items[id] -= n;
  const gain = sellPrice(id) * n;
  S.coins += gain;
  S.stats.earned += gain;
  S.run.earned += gain;
  questProgress('earn', gain);
  S.stats.sold += n;
}

const KEEP_STEPS = [null, 0, 10, 50, 100, 500, 1000];
function cycleAutosell(id) {
  const cur = S.autosell[id] === undefined ? null : S.autosell[id];
  const next = KEEP_STEPS[(KEEP_STEPS.indexOf(cur) + 1) % KEEP_STEPS.length];
  if (next === null) delete S.autosell[id]; else S.autosell[id] = next;
  dirty = true;
}

/* ---------- simulation ---------- */
function nextJob(stationId) {
  const st = stationState(stationId);
  if (st.queue.length) {
    const q = st.queue[0];
    if (--q.n <= 0) st.queue.shift();
    return { r: q.r, t: 0 };
  }
  if (st.lvl < 1) return null;
  const autos = RECIPES.filter(r => r.at === stationId && st.auto[r.id] && recipeVisible(r));
  for (let k = 0; k < autos.length; k++) {
    const r = autos[(st.rr + k) % autos.length];
    if (canAfford(r)) {
      consume(r);
      st.rr = (st.rr + k + 1) % autos.length;
      return { r: r.id, t: 0 };
    }
  }
  return null;
}

function finishJob(job) {
  const r = RECIPE[job.r];
  const unique = isUnique(recipeOut(r));
  const bonus = !unique && onCrafted(r) ? 2 : 1; // mastery can double a batch
  for (const [i, n] of Object.entries(r.out)) add(i, n * bonus);
  S.stats.crafted++;
  questProgress('craft', 1);
  if (unique) {
    const it = ITEMS[recipeOut(r)];
    toast(`${it.icon} Built ${it.name}!`, true);
    dirty = true;
  }
}

function step(dt) {
  // gathering
  for (const n of NODES) {
    if (!nodeUnlocked(n)) continue;
    const r = nodeRate(n.id);
    if (r > 0) add(n.id, r * dt);
  }
  // crafting
  for (const s of STATIONS) {
    if (!owns(s.id)) continue;
    const st = stationState(s.id);
    const slots = stationSlots(s.id);
    while (st.slots.length < slots) st.slots.push(null);
    for (let i = 0; i < slots; i++) {
      let remaining = dt;
      for (let guard = 0; guard < 100; guard++) {
        if (!st.slots[i]) st.slots[i] = nextJob(s.id);
        const job = st.slots[i];
        if (!job) break;
        const need = craftTime(RECIPE[job.r]) - job.t;
        if (remaining >= need) {
          remaining -= need;
          finishJob(job);
          st.slots[i] = null;
        } else {
          job.t += remaining;
          break;
        }
      }
    }
  }
  // auto-sell
  for (const [id, keep] of Object.entries(S.autosell)) {
    const extra = have(id) - keep;
    if (extra > 0) sell(id, extra);
  }
  featureStep(dt);
  worldStep(dt);
}

function advance(seconds) {
  while (seconds > 0) {
    const dt = Math.min(1, seconds);
    step(dt);
    seconds -= dt;
  }
}

/* ---------- discovery ---------- */
let pendingDiscoveries = [];
let simulatingOffline = false;
function onDiscover(id) {
  dirty = true;
  gainInsight(3);
  if (simulatingOffline) return;
  const it = ITEMS[id];
  if (it.kind === 'raw' || it.kind === 'mat' || it.kind === 'good') {
    pendingDiscoveries.push(id);
  }
}

/* ---------- save / load ---------- */
function save() {
  S.last = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ }
}

function load() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { /* storage unavailable */ }
  if (!raw) return;
  try { S = Object.assign(newState(), JSON.parse(raw)); } catch (e) { return; }
  S.upg = Object.assign(newState().upg, S.upg);
  S.stats = Object.assign(newState().stats, S.stats);
  const d = featureDefaults();
  for (const k of ['town', 'legacy', 'run', 'counts']) S[k] = Object.assign(d[k], S[k]);
  const w = worldDefaults();
  for (const k of ['season', 'farm', 'mine', 'opt']) S[k] = Object.assign(w[k], S[k]);
  S.adv = Object.assign(advDefaults().adv, S.adv);
  S.legacy.perks = S.legacy.perks || {};
}

function applyOffline() {
  const away = Math.min(Date.now() - (S.last || Date.now()), offlineCapHours() * 3600e3) / 1000;
  if (away < 30) return;
  const beforeCoins = S.coins;
  const beforeItems = { ...S.items };
  simulatingOffline = true;
  advance(away);
  simulatingOffline = false;
  const gains = Object.keys(S.items)
    .map(id => [id, have(id) - Math.floor(beforeItems[id] || 0)])
    .filter(([, d]) => d > 0)
    .sort((a, b) => b[1] * VALUE[b[0]] - a[1] * VALUE[a[0]])
    .slice(0, 8);
  const coinGain = S.coins - beforeCoins;
  if (!gains.length && coinGain < 1) return;
  showModal(`
    <h2>Welcome back!</h2>
    <p class="muted">You were away for ${fmtTime(away)}. Your workers kept busy:</p>
    <div class="gains">
      ${coinGain >= 1 ? `<div class="gain">🪙 +${fmt(coinGain)}</div>` : ''}
      ${gains.map(([id, d]) => `<div class="gain">${ITEMS[id].icon} +${fmt(d)}</div>`).join('')}
    </div>
    <button class="btn primary wide" data-a="close-modal">Nice</button>`);
}

function exportSave() {
  save();
  return btoa(unescape(encodeURIComponent(JSON.stringify(S))));
}
function importSave(str) {
  const data = JSON.parse(decodeURIComponent(escape(atob(str.trim()))));
  if (typeof data !== 'object' || data.items === undefined) throw new Error('bad save');
  S = Object.assign(newState(), data);
  save();
  load();
}

/* ---------- formatting ---------- */
const SUFFIX = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
function fmt(n, dec = 0) {
  if (n < 1000) return dec && n % 1 ? n.toFixed(dec) : String(Math.floor(n));
  const e = Math.min(SUFFIX.length - 1, Math.floor(Math.log10(n) / 3));
  const v = n / Math.pow(1000, e);
  return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + SUFFIX[e];
}
function fmtTime(s) {
  s = Math.round(s);
  if (s < 60) return s + 's';
  if (s < 3600) return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
  return Math.floor(s / 3600) + 'h ' + Math.floor((s % 3600) / 60) + 'm';
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ============================================================
   UI
   ============================================================ */
const $ = sel => document.querySelector(sel);
const view = $('#view');
let tab = 'gather';
let craftStation = 'hand';
let marketFilter = 'all';
let dirty = true;

function setTab(t) {
  tab = t;
  document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  dirty = true;
  view.scrollTop = 0;
  window.scrollTo(0, 0);
}

function nextGoal() {
  for (const id of MILESTONES) {
    if (owns(id)) continue;
    const r = RECIPES.find(x => recipeOut(x) === id);
    const st = ITEMS[r.at];
    const parts = Object.entries(r.in).map(([i, n]) =>
      S.seen[i] ? `${ITEMS[i].icon}${n}` : `❓${n}`).join(' ');
    const where = owns(r.at) ? `at the ${st.name}` : `(needs ${st.icon} ${st.name})`;
    return `<b>${ITEMS[id].icon} ${ITEMS[id].name}</b> ${where} — ${parts}`;
  }
  return '<b>🏆 You built everything!</b> Keep growing your empire.';
}

/* ---------- tab renderers ---------- */
function renderGather() {
  const unlocked = NODES.filter(nodeUnlocked);
  const locked = NODES.filter(n => !nodeUnlocked(n));
  return `
    <div class="goal"><span class="tag">Next goal</span> ${nextGoal()}</div>
    <div class="grid">
      ${unlocked.map(n => {
        const it = ITEMS[n.id];
        return `
        <div class="card node">
          <button class="tap" data-a="tap" data-id="${n.id}" aria-label="Gather ${it.name}">
            <span class="big">${it.icon}</span>
            <span class="nm">${it.name}</span>
            <span class="cnt" data-k="n:${n.id}"></span>
            <span class="sub">${n.place} · <span data-k="rate:${n.id}"></span>/s</span>
          </button>
          <button class="btn small" data-a="hire" data-id="${n.id}" data-en="hire:${n.id}">
            👷 Hire <span class="muted">(${S.workers[n.id] || 0})</span> · 🪙<span data-k="hirecost:${n.id}"></span>
          </button>
        </div>`;
      }).join('')}
      ${locked.map(n => `
        <div class="card node locked">
          <div class="tap"><span class="big">🔒</span>
            <span class="nm">${S.seen[n.id] ? ITEMS[n.id].name : n.place}</span>
            <span class="sub">Needs ${ITEMS[n.needs].icon} ${ITEMS[n.needs].name}</span>
          </div>
        </div>`).join('')}
    </div>`;
}

function renderCraft() {
  const owned = STATIONS.filter(s => owns(s.id));
  if (!owns(craftStation)) craftStation = 'hand';
  const sid = craftStation;
  const st = stationState(sid);
  const slots = stationSlots(sid);
  const all = RECIPES.filter(r => r.at === sid);
  const visible = all.filter(recipeVisible);
  const hidden = all.filter(r => !recipeVisible(r) && !(isUnique(recipeOut(r)) && owns(recipeOut(r))) && inProgress(r.id) === 0).length;

  return `
    <div class="chips">
      ${owned.map(s => `<button class="chip ${s.id === sid ? 'on' : ''}" data-a="station" data-id="${s.id}">
        ${ITEMS[s.id].icon} ${ITEMS[s.id].name}<span class="dot" data-k="busy:${s.id}"></span></button>`).join('')}
    </div>

    <div class="card station">
      <div class="row between">
        <div><b>${ITEMS[sid].icon} ${ITEMS[sid].name}</b>
          <span class="muted">· Lv ${st.lvl} · ${slots} slot${slots > 1 ? 's' : ''}${st.lvl >= 1 ? ' · auto ✓' : ''}</span></div>
        <button class="btn small" data-a="upstation" data-id="${sid}" data-en="upstation:${sid}">
          ⬆️ ${st.lvl === 0 ? 'Unlock auto' : '+1 slot'} · 🪙<span data-k="stcost:${sid}"></span>
        </button>
      </div>
      ${Array.from({ length: slots }, (_, i) => `
        <div class="slot"><div class="bar" data-w="slot:${sid}:${i}"></div><span data-k="slot:${sid}:${i}"></span></div>`).join('')}
      <div class="queue" data-k="queue:${sid}"></div>
    </div>

    ${visible.length ? '' : '<p class="muted center">Nothing to craft here yet — gather more materials.</p>'}
    ${visible.map(r => {
      const out = recipeOut(r);
      const it = ITEMS[out];
      const uniq = isUnique(out);
      return `
      <div class="card recipe ${uniq ? 'unique' : ''}">
        <div class="row between">
          <div class="rname"><span class="big2">${it.icon}</span>
            <div><b>${it.name}${r.out[out] > 1 ? ' ×' + r.out[out] : ''}</b>
              <div class="muted small">${uniq ? (it.kind === 'tool' ? 'Tool · unlocks a new gathering spot' : 'Station · unlocks new recipes')
                : `🪙${fmt(sellPrice(out))} each`} · ⏱ ${craftTime(r).toFixed(1)}s</div>
            </div>
          </div>
          <div class="ownbox"><span class="own" data-k="n:${out}"></span>
            ${uniq ? '' : `<span class="mast" data-k="mast:${r.id}" title="Mastery: faster crafting and a chance of double output"></span>`}</div>
        </div>
        <div class="inputs">
          ${Object.entries(r.in).map(([i, n]) => `
            <span class="need" data-c="need:${i}:${n}">${ITEMS[i].icon} <span data-k="n:${i}"></span>/${n}</span>`).join('')}
        </div>
        <div class="row actions">
          <button class="btn" data-a="craft" data-id="${r.id}" data-n="1" data-en="craft:${r.id}:1">Craft</button>
          ${uniq ? '' : `
          <button class="btn" data-a="craft" data-id="${r.id}" data-n="10" data-en="craft:${r.id}:1">×10</button>
          <button class="btn" data-a="craft" data-id="${r.id}" data-n="max" data-en="craft:${r.id}:1">Max</button>
          ${st.lvl >= 1
            ? `<button class="btn toggle ${st.auto[r.id] ? 'on' : ''}" data-a="auto" data-id="${r.id}">🔁 Auto</button>`
            : `<button class="btn toggle" disabled title="Upgrade station to unlock auto-craft">🔁 🔒</button>`}`}
        </div>
      </div>`;
    }).join('')}
    ${hidden ? `<p class="muted center">❓ ${hidden} more recipe${hidden > 1 ? 's' : ''} to discover here.</p>` : ''}
  `;
}

function renderMarket() {
  const filters = [['all', 'All'], ['raw', 'Raw'], ['mat', 'Materials'], ['good', 'Goods']];
  const list = Object.keys(ITEMS).filter(id => S.seen[id] && !isUnique(id) &&
    (marketFilter === 'all' || ITEMS[id].kind === marketFilter));
  list.sort((a, b) => (isHot(b) - isHot(a)) || VALUE[a] - VALUE[b]);
  return `
    ${renderTrader()}
    <div class="chips">
      ${filters.map(([k, l]) => `<button class="chip ${k === marketFilter ? 'on' : ''}" data-a="mfilter" data-id="${k}">${l}</button>`).join('')}
    </div>
    ${S.hot ? `<div class="goal"><span class="tag">In demand</span> ${ITEMS[S.hot.id].icon} <b>${ITEMS[S.hot.id].name}</b> sells for ${hotMult()}× · <span data-k="hot"></span> left</div>` : ''}
    <div class="card row between">
      <span class="muted small">Sell every finished good (not materials)</span>
      <button class="btn primary small" data-a="sellgoods">Sell goods</button>
    </div>
    ${list.length ? '' : '<p class="muted center">Nothing here yet.</p>'}
    ${list.map(id => {
      const it = ITEMS[id];
      const as = S.autosell[id];
      return `
      <div class="card mrow">
        <div class="rname"><span class="big2">${it.icon}</span>
          <div><b>${it.name}</b> <span class="muted small">×<span data-k="n:${id}"></span></span>
            <div class="muted small">🪙${fmt(sellPrice(id), 1)} each${isHot(id) ? ' <span class="hot">⭐ in demand</span>' : ''}</div></div>
        </div>
        <div class="row actions">
          <button class="btn small" data-a="sell" data-id="${id}" data-n="1" data-en="sell:${id}">1</button>
          <button class="btn small" data-a="sell" data-id="${id}" data-n="10" data-en="sell:${id}">10</button>
          <button class="btn small" data-a="sell" data-id="${id}" data-n="all" data-en="sell:${id}">All</button>
          <button class="btn small toggle ${as !== undefined ? 'on' : ''}" data-a="autosell" data-id="${id}"
            title="Automatically sell everything above the amount to keep">
            ${as === undefined ? 'Auto-sell' : `Auto · keep ${as}`}</button>
        </div>
      </div>`;
    }).join('')}`;
}

function renderUpgrades() {
  return `
    <h3>Upgrades</h3>
    ${UPGRADES.map(u => `
      <div class="card row between">
        <div class="rname"><span class="big2">${u.icon}</span>
          <div><b>${u.name}</b> <span class="muted small">Lv ${S.upg[u.id]}</span>
          <div class="muted small">${u.desc}</div></div></div>
        <button class="btn" data-a="upg" data-id="${u.id}" data-en="upg:${u.id}">🪙<span data-k="upgcost:${u.id}"></span></button>
      </div>`).join('')}
    <h3>Stations</h3>
    <p class="muted small">Level 1 unlocks auto-crafting. Every level after that adds a crafting slot.</p>
    ${STATIONS.filter(s => owns(s.id)).map(s => {
      const st = stationState(s.id);
      return `
      <div class="card row between">
        <div class="rname"><span class="big2">${ITEMS[s.id].icon}</span>
          <div><b>${ITEMS[s.id].name}</b> <span class="muted small">Lv ${st.lvl}</span>
          <div class="muted small">${stationSlots(s.id)} slot(s)${st.lvl >= 1 ? ', auto-craft' : ''}</div></div></div>
        <button class="btn" data-a="upstation" data-id="${s.id}" data-en="upstation:${s.id}">🪙<span data-k="stcost:${s.id}"></span></button>
      </div>`;
    }).join('')}`;
}

function renderStats() {
  const ids = Object.keys(ITEMS).filter(id => id !== 'hand');
  const found = ids.filter(id => S.seen[id]).length;
  const workers = Object.values(S.workers).reduce((a, b) => a + b, 0);
  return `
    <h3>Collection <span class="muted small">${found}/${ids.length}</span></h3>
    <div class="collection">
      ${ids.map(id => S.seen[id]
        ? `<div class="ci" title="${esc(ITEMS[id].name)}">${ITEMS[id].icon}<small>${esc(ITEMS[id].name)}</small></div>`
        : `<div class="ci unknown">❓<small>???</small></div>`).join('')}
    </div>
    ${renderAchievements()}
    <h3>Stats</h3>
    <div class="card stats">
      <div>Coins earned</div><div>🪙 ${fmt(S.stats.earned)}</div>
      <div>Items crafted</div><div>${fmt(S.stats.crafted)}</div>
      <div>Items sold</div><div>${fmt(S.stats.sold)}</div>
      <div>Taps</div><div>${fmt(S.stats.taps)}</div>
      <div>Workers</div><div>${workers}</div>
      <div>Orders delivered</div><div>${fmt(S.counts.orders)}</div>
      <div>Expeditions</div><div>${fmt(S.counts.exps)}</div>
      <div>Voyages</div><div>${S.legacy.count}</div>
      <div>Playing since</div><div>${new Date(S.stats.started).toLocaleDateString()}</div>
    </div>
    <h3>Save</h3>
    <div class="card">
      <p class="muted small">Progress saves automatically on this device. Offline progress is counted for up to ${offlineCapHours()} hours.
      Use export/import to move your save to another device.</p>
      <div class="row actions">
        <button class="btn" data-a="export">Export</button>
        <button class="btn" data-a="import">Import</button>
        ${renderOptions()}
        <button class="btn danger" data-a="reset">Reset</button>
      </div>
    </div>
    <p class="muted small center">Idle Craft · free forever · no ads · no tracking<br>Icons by Lorc, Delapouite and contributors, game-icons.net (CC BY 3.0)</p>`;
}

const RENDER = {
  gather: () => renderSubs('gather'), town: () => renderSubs('town'), upgrades: () => renderSubs('upgrades'),
  craft: renderCraft, market: renderMarket, stats: renderStats, hero: () => renderSubs('hero'),
};

function render() {
  dirty = false;
  view.innerHTML = iconify(RENDER[tab]());
  advMount();
  refresh();
}

/* ---------- live value bindings ---------- */
function slotInfo(sid, i) {
  const st = S.st[sid];
  const job = st && st.slots[i];
  if (!job) return null;
  const r = RECIPE[job.r];
  return { r, p: Math.min(1, job.t / craftTime(r)) };
}

const K = {
  n: id => fmt(have(id)),
  rate: id => fmt(nodeRate(id), 1),
  hirecost: id => fmt(hireCost(id)),
  upgcost: id => fmt(upgCost(UPGRADES.find(u => u.id === id))),
  stcost: id => fmt(stationCost(id)),
  slot: (sid, i) => {
    const s = slotInfo(sid, +i);
    if (!s) return 'Idle';
    const it = ITEMS[recipeOut(s.r)];
    return `${it.icon} ${it.name} · ${Math.max(0, craftTime(s.r) * (1 - s.p)).toFixed(1)}s`;
  },
  queue: sid => {
    const st = S.st[sid];
    if (!st || !st.queue.length) return '';
    return st.queue.map((q, idx) => `<button class="qi" data-a="cancel" data-id="${sid}" data-n="${idx}" title="Cancel and refund">${ITEMS[recipeOut(RECIPE[q.r])].icon}×${q.n} ✕</button>`).join('');
  },
  busy: sid => {
    const st = S.st[sid];
    return st && (st.slots.some(Boolean) || st.queue.length) ? '•' : '';
  },
};
Object.assign(K, FEATURE_K, WORLD_K, ADV_K);
const HTML_KEYS = new Set(['queue']);
const E = {
  hire: id => S.coins >= hireCost(id),
  upg: id => S.coins >= upgCost(UPGRADES.find(u => u.id === id)),
  upstation: id => S.coins >= stationCost(id),
  craft: (rid, n) => canAfford(RECIPE[rid], +n),
  sell: id => have(id) >= 1,
};
Object.assign(E, FEATURE_E, WORLD_E, ADV_E);

function call(map, key) {
  const [name, ...args] = key.split(':');
  return map[name](...args);
}

function refresh() {
  $('#coins').textContent = fmt(S.coins);
  worldRefresh();
  view.querySelectorAll('[data-k]').forEach(el => {
    const v = call(K, el.dataset.k);
    if (el._v === v) return;
    el._v = v;
    // values may contain markup (the queue) or emoji that become icons
    if (HTML_KEYS.has(el.dataset.k.split(':')[0]) || EMOJI_TEST.test(v)) el.innerHTML = iconify(v);
    else el.textContent = v;
  });
  view.querySelectorAll('[data-en]').forEach(el => { el.disabled = !call(E, el.dataset.en); });
  view.querySelectorAll('[data-w]').forEach(el => {
    const [kind, ...args] = el.dataset.w.split(':');
    if (WIDTHS[kind]) { el.style.width = WIDTHS[kind](...args) + '%'; return; }
    const [, sid, i] = el.dataset.w.split(':');
    const s = slotInfo(sid, +i);
    el.style.width = (s ? s.p * 100 : 0) + '%';
  });
  view.querySelectorAll('[data-c]').forEach(el => {
    const [, id, n] = el.dataset.c.split(':');
    el.classList.toggle('ok', have(id) >= +n);
  });
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a], .nav button');
  if (!b) return;
  if (b.dataset.tab) return setTab(b.dataset.tab);
  const { a, id, n } = b.dataset;
  switch (a) {
    case 'tap': tapNode(id, b); break;
    case 'hire': hire(id); break;
    case 'upg': buyUpgrade(id); break;
    case 'upstation': upgradeStation(id); break;
    case 'station': craftStation = id; dirty = true; break;
    case 'craft': enqueue(id, n === 'max' ? Infinity : +n); break;
    case 'cancel': cancelQueue(id, +n); break;
    case 'auto': toggleAuto(id); break;
    case 'sell': sell(id, n === 'all' ? Infinity : +n); break;
    case 'sellgoods':
      for (const k of Object.keys(ITEMS)) if (ITEMS[k].kind === 'good') sell(k, Infinity);
      break;
    case 'autosell': cycleAutosell(id); break;
    case 'mfilter': marketFilter = id; dirty = true; break;
    case 'export': {
      const code = exportSave();
      showModal(`<h2>Export save</h2><p class="muted small">Copy this code and keep it somewhere safe.</p>
        <textarea readonly rows="6">${code}</textarea>
        <div class="row actions"><button class="btn primary" data-a="copy">Copy</button><button class="btn" data-a="close-modal">Close</button></div>`);
      break;
    }
    case 'copy': {
      const ta = $('#modal textarea');
      ta.select();
      (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject())
        .then(() => toast('Copied!'), () => { document.execCommand('copy'); toast('Copied!'); });
      break;
    }
    case 'import':
      showModal(`<h2>Import save</h2><p class="muted small">Paste a save code. This replaces your current progress.</p>
        <textarea rows="6" placeholder="Paste code here"></textarea>
        <div class="row actions"><button class="btn primary" data-a="do-import">Import</button><button class="btn" data-a="close-modal">Cancel</button></div>`);
      break;
    case 'do-import':
      try { importSave($('#modal textarea').value); closeModal(); toast('Save imported'); dirty = true; }
      catch (err) { toast('That code did not work'); }
      break;
    case 'reset':
      showModal(`<h2>Reset everything?</h2><p class="muted">All progress on this device will be deleted. This cannot be undone.</p>
        <div class="row actions"><button class="btn danger" data-a="do-reset">Delete progress</button><button class="btn" data-a="close-modal">Cancel</button></div>`);
      break;
    case 'do-reset':
      S = newState(); save(); closeModal(); setTab('gather'); toast('Fresh start!');
      break;
    case 'close-modal': closeModal(); break;
    default: featureAction(a, id, n);
  }
  if (dirty) render(); else refresh();
});

/* ---------- toasts, floaters, modal ---------- */
function toast(msg, big) {
  const t = document.createElement('div');
  t.className = 'toast' + (big ? ' big' : '');
  t.innerHTML = iconify(msg);
  const box = $('#toasts');
  box.appendChild(t);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => t.classList.add('out'), 2200);
  setTimeout(() => t.remove(), 2700);
}

function floatText(el, text) {
  const r = el.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'float';
  f.innerHTML = iconify(text);
  f.style.left = (r.left + r.width / 2 + (Math.random() * 30 - 15)) + 'px';
  f.style.top = (r.top + r.height / 3) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 800);
}

function showModal(html) {
  $('#modal .box').innerHTML = iconify(html);
  $('#modal').hidden = false;
}
function closeModal() { $('#modal').hidden = true; }

/* ---------- main loop ---------- */
let lastTick = Date.now();
function loop() {
  const now = Date.now();
  const dt = Math.min((now - lastTick) / 1000, offlineCapHours() * 3600);
  lastTick = now;
  advance(dt);
  if (pendingDiscoveries.length) {
    const ids = pendingDiscoveries.splice(0);
    const shown = ids.slice(0, 4).map(id => `${ITEMS[id].icon} ${ITEMS[id].name}`).join(', ');
    toast('New: ' + shown + (ids.length > 4 ? ` +${ids.length - 4} more` : ''));
  }
  featureLoop();
  worldLoop();
  if (dirty) render(); else refresh();
}

// swap the emoji in the static page (header, tabs) for icons
for (const el of document.querySelectorAll('.brand, .nav button span, .coins, #star')) {
  for (const node of [...el.childNodes]) if (node.nodeType === 3 && EMOJI_TEST.test(node.textContent)) {
    const span = document.createElement('span'); span.innerHTML = iconify(node.textContent); node.replaceWith(...span.childNodes);
  }
}

load();
applyOffline();
setTab('gather');
render();
setInterval(loop, 200);
setInterval(save, 10000);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
window.addEventListener('pagehide', save);

// Offline cache for the web version; the Android app already ships its files, so it skips this.
if ('serviceWorker' in navigator && location.protocol.startsWith('http') && window.top === window.self && !window.Capacitor) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
