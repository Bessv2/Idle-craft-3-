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
- **Book**: your collection, stats, and save export/import.

Progress saves on your device and keeps running while you're away (up to 12 hours).

## Running it

It's a plain static web page, with no build step and no dependencies.

- **Locally:** run `python3 -m http.server` in this folder and open http://localhost:8000
- **On your phone:** host it on GitHub Pages (below), open the link, and choose
  *Add to Home screen*. It installs like an app and works offline.

### GitHub Pages

1. Merge into `main`.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The included workflow publishes it at `https://<your-username>.github.io/<repo-name>/`.

## Adding content

All items, gathering spots, recipes and upgrades live in [`js/data.js`](js/data.js).
Add an item to `ITEMS` and a recipe to `RECIPES`; sell prices are worked out
automatically from the ingredients and craft time.
