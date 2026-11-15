'use strict';

/* ============================================================
   Tutorial and help: a guide character walks new players through
   the first loop, explains each screen the first time it opens,
   and pops in at milestones. The "?" on every screen replays it.
   ============================================================ */

// Title, one-line subtitle and the guide's explanation for every screen.
const SCREEN_INFO = {
  'gather:wild': { title: 'Gather', sub: 'Tap to collect, hire workers to automate',
    help: `Tap a resource to collect it. Each <b>Hire</b> adds a worker who gathers it for you, even while you're away.
      New gathering spots unlock when you craft the right tool, such as a ⛏️ pickaxe for copper and coal.` },
  'gather:farm': { title: 'Farm', sub: 'Plant crops and harvest them',
    help: `Tap an empty plot to plant seeds. Crops grow on their own; tap a ripe one to harvest it.
      Buying more plots unlocks new crops. Crops are cooked into meals in the 🍳 Kitchen.` },
  'gather:mine': { title: 'Mine', sub: 'Dig deeper for ore and treasure',
    help: `Tap the rock to dig. Each floor you clear drops ore, and every 5th floor hides a 💰 treasure.
      Outfit a crew with crafted gear (torches, picks, shields…) and they keep digging while you're away.` },
  craft: { title: 'Craft', sub: 'Turn materials into tools, stations and goods',
    help: `Pick a station along the top, then tap <b>Craft</b>. Materials are set aside when you queue a craft, and
      cancelling gives them back. Recipes appear once you've found all their ingredients.<br><br>
      Upgrading a station to level 1 unlocks <b>🔁 Auto</b>: it crafts that recipe on its own whenever it has materials.
      Every recipe also gains ★ mastery as you craft it, making it faster with a chance of double output.` },
  'market:sell': { title: 'Market', sub: 'Sell what you make',
    help: `Tap an item to sell it. <b>Auto-sell</b> keeps the amount you choose and sells the rest automatically.
      One item is always <b>in demand</b> and sells for double. A 🧳 trader visits now and then to swap your surplus for other resources.` },
  'market:orders': { title: 'Orders', sub: 'Townsfolk pay extra for what they need',
    help: `Orders pay 2.5× the market price. Every delivery helps the town grow, and a bigger town places
      bigger orders and gives you more order slots. Skip any order you don't want.` },
  'market:board': { title: 'Jobs', sub: 'Odd jobs with no timers',
    help: 'Three jobs are always posted. Finish one, claim the reward, and a new one appears. They pay coins and 💡 insight for Research.' },
  'town:explore': { title: 'Expeditions', sub: 'Send explorers for loot and relics',
    help: `Explorers take supplies and real time, then come back with resources (sometimes ones you can't gather yet)
      and a chance at a rare <b>relic</b>. Relic bonuses are permanent.` },
  'town:tavern': { title: 'Tavern', sub: 'Eat meals for timed boosts',
    help: 'Eat food you have cooked or baked for a boost, such as faster workers or higher prices. Only one meal of each kind works at a time.' },
  'town:pets': { title: 'Pets', sub: 'Companions with lasting bonuses',
    help: 'Adopt pets with coins and level them up by feeding them their favourite food. Pets stay with you forever, even when you set sail.' },
  'town:museum': { title: 'Museum', sub: 'Donate your finest work',
    help: 'Every exhibit adds +1% to sell prices and gives 💡 insight. Finishing a whole wing gives a big permanent bonus.' },
  'hero:world': { title: 'Adventure', sub: 'Explore, fight and loot',
    help: `Drag anywhere on the map to walk. Your hero attacks nearby monsters automatically.
      Walk over resource spots and 🎁 chests to collect them. Use the round buttons for skills and healing
      (food and potions heal you).<br><br>The ☠️ arrow points to the zone's boss. Beat it to open the next zone.
      Glowing <b>elite</b> monsters are tougher but always drop gear.` },
  'hero:gear': { title: 'Gear', sub: 'Equip, upgrade and salvage',
    help: `Better gear has a coloured name: Uncommon, Rare, Epic and Legendary. Uncommon and up also roll ◆ bonus stats.
      Salvage gear you don't need for ✨ essence, and spend essence to upgrade what you wear.` },
  'hero:talents': { title: 'Talents', sub: 'Spend a point every hero level',
    help: 'You get one talent point per hero level. Spend them on attack, defense or loot. Reset any time for free.' },
  'hero:zones': { title: 'Zones', sub: 'Travel and raise the threat',
    help: 'Each zone has its own monsters, resources and boss. Once every boss is down, raise the threat level for stronger foes and better loot.' },
  'upgrades:coins': { title: 'Upgrades', sub: 'Spend coins to grow faster',
    help: 'Global upgrades boost taps, workers, crafting and prices. Station levels unlock auto-crafting and extra crafting slots.' },
  'upgrades:research': { title: 'Research', sub: 'Permanent unlocks paid with insight',
    help: '💡 Insight comes from discoveries, mastery, orders, jobs, expeditions, the museum and bosses. Research is never lost.' },
  'upgrades:legacy': { title: 'Legacy', sub: 'Set sail and start again, stronger',
    help: `Once you build a 🚢 Ship you can set sail for a new land. You start over but earn ⭐ Legacy for permanent perks.
      Your hero, pets, relics, research, museum and achievements all come with you.` },
  book: { title: 'Book', sub: 'Collection, achievements and settings',
    help: 'Everything you have discovered, every achievement (each gives +1% sell prices), your stats, sound settings and save backup.' },
};
const screenKey = () => (SUBS[tab] ? `${tab}:${subTab[tab]}` : tab);
function screenHead() {
  const info = SCREEN_INFO[screenKey()];
  if (!info) return '';
  return `<div class="screen-head"><div><h2>${info.title}</h2><p>${info.sub}</p></div>
    <button class="helpbtn" data-a="help" aria-label="How does this screen work?">?</button></div>`;
}

/* ---------- the guided first steps ---------- */
// target: element to point at; done: when the step is complete; tab: screen the step needs.
const GUIDE = [
  { text: `Welcome, traveller! I'm Bram. This valley is yours to build up. Let's start by gathering —
      <b>tap the Wood</b> a few times.`, target: '[data-a="tap"][data-id="wood"]', tab: 'gather', sub: 'wild',
    done: () => have('wood') >= 6 },
  { text: 'Good! Now <b>tap the Stone</b> a few times too.', target: '[data-a="tap"][data-id="stone"]', tab: 'gather', sub: 'wild',
    done: () => have('stone') >= 4 },
  { text: 'Raw materials become useful things in the workshop. Open the <b>Craft</b> tab.', target: '.nav [data-tab="craft"]',
    done: () => tab === 'craft' },
  { text: 'Planks are made from wood. Tap <b>Max</b> on Plank to turn your wood into planks.',
    target: '[data-a="craft"][data-id="plank"][data-n="max"]', tab: 'craft',
    done: () => have('plank') + inProgress('plank') >= 2 || owns('workbench') },
  { text: `A <b>Workbench</b> needs 4 planks and 4 stone. Gather more if you're short, then craft it — it unlocks tools.`,
    target: '[data-a="craft"][data-id="workbench"]', tab: 'craft', done: () => owns('workbench') || inProgress('workbench') > 0 },
  { text: 'You need coins to grow. Open the <b>Market</b>.', target: '.nav [data-tab="market"]', done: () => tab === 'market' },
  { text: 'Tap any item, then sell some. Berries and sticks are fine to sell.', target: '.mitem.has', tab: 'market', sub: 'sell',
    done: () => S.stats.sold > 0 },
  { text: 'Now let coins work for you. Back on <b>Gather</b>, tap <b>Hire</b> to get a worker who gathers on their own.',
    target: '[data-a="hire"]', tab: 'gather', sub: 'wild', done: () => Object.values(S.workers).some(Boolean) },
  { text: `That's the core loop: <b>gather → craft → sell → hire</b>. The <b>Next goal</b> card always shows what to build next,
      and the <b>?</b> button on each screen explains it. I'll pop in when something new opens up. Have fun!`,
    target: '.goal', tab: 'gather', sub: 'wild', last: true },
];

// Short tips that appear the first time something new becomes available.
const MILESTONE_TIPS = [
  { id: 'm_auto', when: () => owns('workbench') && S.coins >= 40 && stationState('hand').lvl === 0,
    text: `You can afford to upgrade a station! Level 1 unlocks <b>🔁 Auto</b> crafting, so it works while you're away. Try it on <b>Hands</b> in the Craft tab.` },
  { id: 'm_pick', when: () => owns('stone_pickaxe'),
    text: 'A pickaxe! Copper and coal are now on the Gather tab, and the <b>⛏️ Mine</b> is open for digging.' },
  { id: 'm_furnace', when: () => owns('furnace'), text: 'The ♨️ Furnace smelts ore into ingots and bakes bread. Ingots lead to the ⚒️ Anvil and better tools.' },
  { id: 'm_hoe', when: () => owns('stone_hoe'), text: 'With a hoe you can farm. Check the <b>🥕 Farm</b> on the Gather tab.' },
  { id: 'm_orders', when: () => S.orders.some(o => o.item), text: 'Townsfolk have posted <b>orders</b> in the Market. They pay much more than selling normally.' },
  { id: 'm_hero', when: () => S.stats.crafted >= 15, text: `Feeling brave? The <b>⚔️ Hero</b> tab lets you walk the wilds, fight monsters and find gear.
      Food you cook heals your hero.` },
  { id: 'm_talent', when: () => S.adv.lvl >= 2, text: 'Your hero levelled up! Spend your talent point in <b>Hero → Talents</b>.' },
  { id: 'm_boss', when: () => S.adv.bossKills >= 1, text: 'You beat a boss! A new zone is open in <b>Hero → Zones</b>.' },
  { id: 'm_ship', when: () => have('ship') >= 1, text: 'You built a Ship! Look at <b>Upgrade → Legacy</b> to set sail for a fresh start with permanent bonuses.' },
];

/* ---------- state and display ---------- */
function tutState() {
  if (!S.tut) S.tut = window.__skipTut ? { step: 99, seen: new Proxy({}, { get: () => 1 }), off: true } : { step: 0, seen: {}, off: false };
  return S.tut;
}
let guideOpen = null; // { kind: 'step' | 'tip', text, target, key }

function tutorialBlocking() { return !!guideOpen && guideOpen.kind === 'tip' && guideOpen.pause; }

function showGuide(g) {
  guideOpen = g;
  const box = $('#guide');
  box.innerHTML = iconify(`
    <div class="guide-face">${pxTag('guide', 'face')}</div>
    <div class="guide-body">
      <div class="guide-name">Bram</div>
      <div class="guide-text">${g.text}</div>
      <div class="guide-actions">
        ${g.kind === 'step'
          ? `${g.last ? '<button class="btn small primary" data-a="guide-next">Let\'s go!</button>' : ''}
             <button class="linkbtn" data-a="guide-skip">Skip tutorial</button>`
          : '<button class="btn small primary" data-a="guide-close">Got it</button>'}
      </div>
    </div>`);
  box.hidden = false;
  box.classList.toggle('low', !!g.low);
  placePointer();
}
function hideGuide() {
  guideOpen = null;
  $('#guide').hidden = true;
  $('#pointer').hidden = true;
  document.querySelectorAll('.spot').forEach(el => el.classList.remove('spot'));
}

// Point at the step's target, if it is on screen.
function placePointer() {
  const ptr = $('#pointer');
  document.querySelectorAll('.spot').forEach(el => el.classList.remove('spot'));
  if (!guideOpen || !guideOpen.target) { ptr.hidden = true; return; }
  const el = document.querySelector(guideOpen.target);
  if (!el || !el.offsetParent) { ptr.hidden = true; return; }
  el.classList.add('spot');
  const r = el.getBoundingClientRect();
  // keep the guide's speech box clear of whatever it is pointing at
  $('#guide').classList.toggle('top', r.top > window.innerHeight * 0.45);
  ptr.hidden = false;
  ptr.style.left = (r.left + r.width / 2 - 18) + 'px';
  ptr.style.top = (r.top - 44) + 'px';
}

// Called every game tick.
function tutorialTick() {
  const t = tutState();
  if (!t.off && t.step < GUIDE.length) {
    const g = GUIDE[t.step];
    if (g.done && g.done()) { t.step++; sfx('discover'); return tutorialTick(); }
    // the step's screen must be showing; otherwise point at the nav tab to get there
    let target = g.target, text = g.text;
    if (g.tab && tab !== g.tab) target = `.nav [data-tab="${g.tab}"]`;
    else if (g.sub && SUBS[g.tab] && subTab[g.tab] !== g.sub) target = `[data-a="sub"][data-id="${g.tab}:${g.sub}"]`;
    if (!guideOpen || guideOpen.key !== 'step' + t.step || guideOpen.target !== target) {
      showGuide({ kind: 'step', key: 'step' + t.step, text, target, last: g.last, low: true });
    } else placePointer();
    return;
  }
  if (guideOpen && guideOpen.kind === 'step') hideGuide();
  if (guideOpen) { placePointer(); return; }
  // milestone tips, one at a time
  for (const m of MILESTONE_TIPS) {
    if (t.seen[m.id] || !m.when()) continue;
    t.seen[m.id] = 1;
    return showGuide({ kind: 'tip', key: m.id, text: m.text });
  }
  // first visit to a screen
  const key = screenKey();
  if (SCREEN_INFO[key] && !t.seen['s:' + key] && t.step >= GUIDE.length) {
    t.seen['s:' + key] = 1;
    // the first two screens were covered by the walkthrough
    if (key !== 'gather:wild' && key !== 'craft') {
      showGuide({ kind: 'tip', key: 's:' + key, text: SCREEN_INFO[key].help, pause: key === 'hero:world' });
    }
  }
}

function tutorialAction(a) {
  const t = tutState();
  switch (a) {
    case 'guide-next': t.step++; hideGuide(); break;
    case 'guide-skip': t.off = true; t.step = GUIDE.length; hideGuide(); break;
    case 'guide-close': hideGuide(); break;
    case 'help': {
      const info = SCREEN_INFO[screenKey()];
      if (info) showGuide({ kind: 'tip', key: 'help', text: info.help });
      break;
    }
    case 'replay-tutorial': S.tut = { step: 0, seen: {}, off: false }; hideGuide(); setTab('gather'); break;
    default: return false;
  }
  return true;
}
window.addEventListener('resize', () => placePointer());
window.addEventListener('scroll', () => placePointer(), { passive: true });
