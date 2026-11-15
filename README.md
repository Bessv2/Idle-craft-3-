# ⚒️ Idle Craft

A free idle crafting game. **No ads, no paywalls, no tracking, no accounts.**

Gather resources, discover recipes, build crafting stations, hire workers and automate
everything until you can build a ship.

## How to play

- **Gather**: tap a resource to collect it. Hire workers to collect it for you.
- **Craft**: turn resources into materials, tools and goods. Tools unlock new gathering
  spots, and stations unlock new recipes. Recipes appear once you've found all their ingredients.
- **Market**: sell what you make for coins. Auto-sell keeps a set amount and sells the rest.
- **Upgrade**: spend coins on faster workers, faster crafting, better prices and stronger taps.
  Level 1 of a station turns on **auto-crafting**, and every level after that adds a crafting slot.
- **Town**: deliver orders from the townsfolk for 2.5× the market price. Orders level up the
  town, which brings bigger orders. Send explorers on **expeditions** (they cost supplies and
  take real time) for bulk resources and a chance at rare **relics** with permanent bonuses.
- **Mastery**: every recipe levels up as you craft it — faster crafting and a chance of double output.
- **In demand**: one item sells for double in the market, rotating every 5 minutes.
- **Legacy**: once you build a Ship you can set sail for a new land. You start over, but earn
  ⭐ Legacy to spend on permanent perks. Relics, achievements and stats are kept.
- **Farm** (Gather tab, needs a Stone Hoe): buy plots, plant crops, harvest. More plots unlock new crops.
- **Mine** (Gather tab, needs a Stone Pickaxe): tap to dig down floor by floor. Outfit a crew with
  crafted gear and they dig while you're away. Every 5th floor hides a treasure.
- **Kitchen and Tavern**: cook crops into meals, then eat them for timed boosts.
- **Pets**: adopt six animals, each with its own bonus, and level them up with their favourite food.
- **Museum**: donate crafted items. Each exhibit adds +1% sell prices, and each finished wing gives a permanent bonus.
- **Quest board**: three odd jobs at a time, with no timers.
- **Research**: spend 💡 insight (earned all over the game) on permanent unlocks like self-harvesting plots.
- **Seasons** change every 10 minutes, each boosting a different part of the game.
- **Wandering trader**: turns up in the Market now and then to swap your surplus for other resources.
- **Combos and shooting stars**: quick taps build up to a 3× combo, and a 🌠 sometimes drifts by — catch it for a gift.
- **Hero**: walk a hero around open zones with an on-screen joystick. Monsters roam, you attack automatically,
  and they drop coins, materials and gear in five rarities. Each zone has a boss that opens the next zone.
  Reforge your crafted swords, shields and rings into gear, upgrade it with essence, and raise the threat
  level once every boss is beaten.
- **Tutorial**: Bram the guide walks you through the first loop, explains each screen the first time
  you open it, and pops in when something new unlocks. Every screen has a **?** button.
- **Hero depth**: six heroes to choose from, gear with bonus stats, a talent tree, three skills
  (Whirlwind, Dash, War Cry), rare elite monsters and a minimap.
- **Book** (top-right button): your collection, achievements (each adds +1% sell prices), stats, and save export/import.

Progress saves on your device and keeps running while you're away (up to 12 hours).

## Running it

It's a plain static web page, with no build step and no dependencies.

- **Locally:** run `python3 -m http.server` in this folder and open http://localhost:8000
- **On your phone:** host it on GitHub Pages (below), open the link, and choose
  *Add to Home screen*. It installs like an app and works offline.

### Android app (APK)

Every push to `main` builds an APK automatically. On your phone, open the repository's
**Releases** page, pick **Latest APK**, download `idle-craft.apk` and open it. Android will ask
you to allow installing apps from your browser the first time.

Newer builds install over older ones and keep your save. To build it yourself you need Node 20+,
Java 21 and the Android SDK, then run `npm install && npm run android:apk`.

`android-debug.keystore` is a shared, non-secret debug signing key so that every build has the
same signature. A Play Store release would need its own private key instead.

### GitHub Pages

1. Merge into `main`.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The included workflow publishes it at `https://<your-username>.github.io/<repo-name>/`.

## Art and credits

- Pixel art, music and sound effects: [Ninja Adventure](https://pixel-boy.itch.io/ninja-adventure-asset-pack) by Pixel-boy & AAA (CC0).
- Item icons: [496 pixel art icons for RPG](https://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg) by 7Soul (CC0).
- Dungeon tiles: [DungeonTileset II](https://0x72.itch.io/dungeontileset-ii) by 0x72 (CC0).
- UI icons: Lorc, Delapouite and contributors from [game-icons.net](https://game-icons.net) (CC BY 3.0).
- Fonts: Lilita One and Nunito (SIL Open Font License).

The game's text uses emoji as shorthand; `js/gfx.js` swaps each one for a pixel sprite or icon when the page renders.
The pixel art is packed into `assets/sprites.png` by `scripts/build-atlas.py`; the source packs are not stored in
the repo, and the script's header says where to download them. Vector UI icons come from `scripts/build-icons.js`.

## Adding content

All items, gathering spots, recipes and upgrades live in [`js/data.js`](js/data.js).
Relics, expeditions, legacy perks and achievements are at the top of [`js/features.js`](js/features.js).
Zones, monsters and gear are at the top of [`js/adventure.js`](js/adventure.js).
Crops, meals, pets, research, mine gear, museum wings and quests are at the top of [`js/world.js`](js/world.js).
Add an item to `ITEMS` and a recipe to `RECIPES`; sell prices are worked out
automatically from the ingredients and craft time.
