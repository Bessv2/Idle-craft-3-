// Copies the game's web files into www/, which is what the Android app bundles.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'www');
const include = ['index.html', 'style.css', 'manifest.webmanifest', 'sw.js', 'js', 'icons'];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const name of include) fs.cpSync(path.join(root, name), path.join(out, name), { recursive: true });
console.log(`Copied ${include.length} entries to www/`);
