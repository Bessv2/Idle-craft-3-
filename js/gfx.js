'use strict';

/* ============================================================
   Graphics: turns the emoji used throughout the game's text into
   drawn icons, both in the page (inline SVG) and on the canvas.
   Loaded after icons.js and before everything else.
   ============================================================ */

// Pixel-art sprites win over vector icons for the same emoji.
const EMOJI_KEYS = [...new Set([...Object.keys(PX_EMOJI), ...Object.keys(EMOJI_ICON)])].sort((a, b) => b.length - a.length);
const ATLAS_IMG = new Image();
ATLAS_IMG.src = 'assets/sprites.png';
document.documentElement.style.setProperty('--aw', ATLAS.w);
document.documentElement.style.setProperty('--ah', ATLAS.h);
const EMOJI_SRC = '(' + EMOJI_KEYS.map(k => k.replace(/️/g, '')).join('|') + ')\\uFE0F?';
const EMOJI_RE = new RegExp(EMOJI_SRC, 'g');
const EMOJI_TEST = new RegExp(EMOJI_SRC);

// One hidden sprite sheet; every icon in the page is a tiny <use> pointing into it.
(function injectSprites() {
  const symbols = Object.entries(ICON_PATHS).map(([name, ds]) =>
    `<symbol id="gi-${name}" viewBox="0 0 512 512">${ds.map(d => `<path d="${d}"/>`).join('')}</symbol>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `<svg id="gi-sprites" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">${symbols}</svg>`);
})();

// A pixel sprite from the atlas, sized by the --s custom property (see style.css).
function pxTag(name, cls = '') {
  const r = SPR[name];
  return `<i class="px ${cls}" style="--x:${r[0]};--y:${r[1]}" aria-hidden="true"></i>`;
}
function iconTag(emoji) {
  if (PX_EMOJI[emoji]) return pxTag(PX_EMOJI[emoji]);
  const [name, color] = EMOJI_ICON[emoji];
  return `<svg class="gi" viewBox="0 0 512 512" style="color:${color}" aria-hidden="true"><use href="#gi-${name}"/></svg>`;
}

// Replace emoji with icons in a chunk of HTML, leaving tags and their attributes alone.
function iconify(html) {
  html = String(html);
  if (!EMOJI_TEST.test(html)) return html;
  return html.replace(/(<[^>]*>)|([^<]+)/g, (m, tag, text) => tag || text.replace(EMOJI_RE, (mm, e) => iconTag(e)));
}

/* ---------- canvas ---------- */
const spriteCache = new Map();
const pathCache = {};
// A pre-rendered, outlined icon at a given pixel size.
function iconSprite(emoji, px, color) {
  const entry = EMOJI_ICON[emoji.replace(/️/g, '')];
  if (!entry) return null;
  const dpr = window.devicePixelRatio || 1;
  const size = Math.max(8, Math.round(px * dpr));
  const key = entry[0] + '|' + (color || entry[1]) + '|' + size;
  let c = spriteCache.get(key);
  if (c) return c;
  const pad = Math.ceil(size * 0.12);
  c = document.createElement('canvas');
  c.width = c.height = size + pad * 2;
  const ctx = c.getContext('2d');
  ctx.translate(pad, pad);
  ctx.scale(size / 512, size / 512);
  const paths = pathCache[entry[0]] || (pathCache[entry[0]] = ICON_PATHS[entry[0]].map(d => new Path2D(d)));
  ctx.lineJoin = 'round';
  ctx.lineWidth = 44;
  ctx.strokeStyle = '#17110c';
  for (const p of paths) ctx.stroke(p);
  ctx.fillStyle = color || entry[1];
  for (const p of paths) ctx.fill(p);
  // soft top highlight so sprites do not look flat
  ctx.globalCompositeOperation = 'source-atop';
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, 'rgba(255,255,255,.22)');
  g.addColorStop(0.55, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(0,0,0,.22)');
  ctx.fillStyle = g;
  ctx.fillRect(-60, -60, 632, 632);
  c.cssSize = (size + pad * 2) / dpr;
  spriteCache.set(key, c);
  return c;
}
// Draw a named atlas sprite (or one frame of it) centred on x,y.
function drawSprite(ctx, name, x, y, scale, sx = 0, sy = 0, sw, sh, flip) {
  const r = SPR[name];
  if (!r || !ATLAS_IMG.complete) return;
  sw = sw || r[2]; sh = sh || r[3];
  const w = sw * scale, h = sh * scale;
  ctx.imageSmoothingEnabled = false;
  if (flip) {
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(-1, 1);
    ctx.drawImage(ATLAS_IMG, r[0] + sx, r[1] + sy, sw, sh, -w / 2, -h / 2, w, h);
    ctx.restore();
  } else ctx.drawImage(ATLAS_IMG, r[0] + sx, r[1] + sy, sw, sh, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
}
function drawIcon(ctx, emoji, x, y, px, color) {
  const key = emoji.replace(/\uFE0F/g, '');
  if (PX_EMOJI[key] && !color) return drawSprite(ctx, PX_EMOJI[key], x, y, px / 34 * 1.2);
  const s = iconSprite(emoji, px, color);
  if (s) ctx.drawImage(s, x - s.cssSize / 2, y - s.cssSize / 2, s.cssSize, s.cssSize);
}
// Draws text that may contain emoji, centred on x, with the emoji drawn as icons.
function drawLabel(ctx, text, x, y, px, color) {
  const parts = text.split(EMOJI_RE).filter(p => p !== undefined && p !== '');
  const isIcon = p => EMOJI_ICON[p] || PX_EMOJI[p];
  ctx.font = `${px}px "Lilita One", system-ui, sans-serif`;
  ctx.textAlign = 'left';
  const widths = parts.map(p => (isIcon(p) ? px * 1.15 : ctx.measureText(p).width));
  let cx = x - widths.reduce((a, b) => a + b, 0) / 2;
  parts.forEach((p, i) => {
    if (isIcon(p)) drawIcon(ctx, p, cx + widths[i] / 2, y, px * 1.1);
    else {
      ctx.lineWidth = Math.max(3, px * 0.22);
      ctx.strokeStyle = 'rgba(20,14,10,.85)';
      ctx.strokeText(p, cx, y);
      ctx.fillStyle = color;
      ctx.fillText(p, cx, y);
    }
    cx += widths[i];
  });
  ctx.textAlign = 'center';
}
