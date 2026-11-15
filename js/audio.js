'use strict';

/* ============================================================
   Music and sound effects (Ninja Adventure pack, CC0).
   Browsers only allow sound after the first tap, so nothing
   plays until the player has touched the screen once.
   ============================================================ */

const SFX_VOL = {
  tap: 0.25, click: 0.3, coin: 0.35, buy: 0.45, levelup: 0.6, victory: 0.6, rare: 0.55, hit: 0.3, crit: 0.45,
  skillhit: 0.35, die: 0.35, bossdie: 0.6, hurt: 0.35, spin: 0.45, dash: 0.45, cry: 0.5, heal: 0.45, pickup: 0.4,
  chest: 0.5, equip: 0.4, ko: 0.5, discover: 0.45, star: 0.5, error: 0.35, craft: 0.25, upgrade: 0.45,
};
const SFX_FILE = { upgrade: 'buy' };
let audioCtx = null;
let audioUnlocked = false;
const sfxBuffers = {};
const sfxLast = {};

function audioOn(kind) { return !S.opt || S.opt[kind] !== false; }

function loadSfx(name) {
  const file = SFX_FILE[name] || name;
  if (sfxBuffers[file] !== undefined) return;
  sfxBuffers[file] = null;
  fetch(`assets/sfx/${file}.ogg`)
    .then(r => r.arrayBuffer())
    .then(b => audioCtx.decodeAudioData(b))
    .then(buf => { sfxBuffers[file] = buf; })
    .catch(() => { /* missing or unsupported: stay silent */ });
}

// Play a short sound. Repeats of the same sound are spaced out so busy moments do not get noisy.
function sfx(name) {
  if (!audioUnlocked || !audioOn('sound') || !SFX_VOL[name] || simulatingOffline) return;
  const now = performance.now();
  if (now - (sfxLast[name] || 0) < 70) return;
  sfxLast[name] = now;
  const file = SFX_FILE[name] || name;
  const buf = sfxBuffers[file];
  if (!buf) { loadSfx(name); return; }
  const src = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  gain.gain.value = SFX_VOL[name];
  src.buffer = buf;
  src.playbackRate.value = 0.94 + Math.random() * 0.12; // slight variety
  src.connect(gain).connect(audioCtx.destination);
  src.start();
}

/* ---------- music ---------- */
let musicEl = null;
let musicWant = 'home';
let musicFade = 0;
function playMusic(track) {
  musicWant = track;
  if (!audioUnlocked) return;
  if (!audioOn('music')) { if (musicEl) musicEl.pause(); return; }
  if (musicEl && musicEl.dataset.track === track) { if (musicEl.paused) musicEl.play().catch(() => {}); return; }
  const old = musicEl;
  const el = new Audio(`assets/music/${track}.ogg`);
  el.dataset.track = track;
  el.loop = true;
  el.volume = 0;
  el.play().catch(() => {});
  musicEl = el;
  // cross-fade over about a second
  clearInterval(musicFade);
  let k = 0;
  musicFade = setInterval(() => {
    k = Math.min(1, k + 0.08);
    el.volume = 0.32 * k;
    if (old) old.volume = Math.max(0, 0.32 * (1 - k));
    if (k >= 1) { clearInterval(musicFade); if (old) old.pause(); }
  }, 80);
}
// The Hero tab picks the zone's track; every other screen plays the home theme.
function syncMusic() { if (tab !== 'hero' || subTab.hero !== 'world') playMusic('home'); }

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    for (const n of ['tap', 'click', 'coin', 'craft', 'buy', 'hit', 'pickup']) loadSfx(n);
  } catch (e) { audioCtx = null; }
  if (!audioCtx) audioUnlocked = false;
  playMusic(musicWant);
}
window.addEventListener('pointerdown', unlockAudio, { once: false, passive: true });

// Pause music when the app goes to the background.
document.addEventListener('visibilitychange', () => {
  if (!musicEl) return;
  if (document.hidden) musicEl.pause();
  else if (audioOn('music')) musicEl.play().catch(() => {});
});

function toggleAudio(kind) {
  S.opt[kind] = !audioOn(kind);
  if (kind === 'music') { if (audioOn('music')) playMusic(musicWant); else if (musicEl) musicEl.pause(); }
  dirty = true;
}

/* ---------- Android back button ---------- */
// Back closes whatever is open first, then returns to the Gather tab, then leaves the app.
(function androidBack() {
  const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (!App) return;
  App.addListener('backButton', () => {
    if (!$('#modal').hidden) closeModal();
    else if (guideOpen && guideOpen.kind === 'tip') hideGuide();
    else if (tab !== 'gather') { setTab('gather'); render(); }
    else { save(); App.minimizeApp(); }
  });
  App.addListener('pause', () => save());
})();
