#!/usr/bin/env python3
"""Packs the game's pixel art into assets/sprites.png and writes js/sprites.js.

The source art is not stored in the repo. Download these free CC0 packs and unzip
them into one folder, then run:  python3 scripts/build-atlas.py <that folder>

  Ninja Adventure Asset Pack by Pixel-boy & AAA   https://pixel-boy.itch.io/ninja-adventure-asset-pack
      -> "<folder>/Ninja Adventure - Asset Pack/"
  496 pixel art icons for RPG by 7Soul            https://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg
      -> "<folder>/rpg/" (the png files directly)
  DungeonTileset II by 0x72                        https://0x72.itch.io/dungeontileset-ii
      -> "<folder>/dt2/0x72_DungeonTilesetII_v1.7/"
"""
import colorsys
import json
import os
import sys

from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else '.'
NA = os.path.join(SRC, 'Ninja Adventure - Asset Pack')
RPG = os.path.join(SRC, 'rpg')
DT2 = os.path.join(SRC, 'dt2', '0x72_DungeonTilesetII_v1.7', 'frames')
ROOT = os.path.join(os.path.dirname(__file__), '..')

_cache = {}


def img(path):
    if path not in _cache:
        _cache[path] = Image.open(path).convert('RGBA')
    return _cache[path]


def trim(im):
    box = im.getbbox()
    return im.crop(box) if box else im


def tint(im, rgb):
    """Recolour keeping the shading: take each pixel's lightness, use the tint's hue."""
    h, s, _ = colorsys.rgb_to_hls(*(c / 255 for c in rgb))
    out = im.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            _, l, _ = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            nr, ng, nb = colorsys.hls_to_rgb(h, l, s)
            px[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), a)
    return out


# ---- source helpers -------------------------------------------------------
def R(name, **o):            # 496 RPG icon
    return ('img', os.path.join(RPG, name + '.png'), None, o)


def N(rel, **o):             # whole Ninja Adventure image
    return ('img', os.path.join(NA, rel), None, o)


def T(tileset, cx, cy, w=1, h=1, **o):   # Ninja Adventure tileset cell(s)
    return ('img', os.path.join(NA, 'Backgrounds/Tilesets', tileset), (cx * 16, cy * 16, (cx + w) * 16, (cy + h) * 16), o)


def F(rel, box, **o):        # crop of any Ninja Adventure image
    return ('img', os.path.join(NA, rel), box, o)


def D(name, **o):            # DungeonTileset II frame
    return ('img', os.path.join(DT2, name + '.png'), None, o)


MON = 'Actor/Monster/'


def mon_sheet(folder):
    p = os.path.join(NA, MON, folder)
    f = [x for x in os.listdir(p) if x.endswith('.png') and 'Faceset' not in x][0]
    return os.path.join(MON, folder, f)


def MF(folder, **o):         # first frame (facing down) of a monster
    return F(mon_sheet(folder), (0, 0, 16, 16), **o)


def CF(folder, **o):         # first frame of a character
    return F(f'Actor/Character/{folder}/SpriteSheet.png', (0, 0, 16, 16), **o)


# ---- still sprites (icons, props, tiles) ------------------------------------
STILLS = {
    # raw resources
    'wood': T('TilesetNature.png', 9, 8), 'stone': R('I_Rock01'), 'fiber': N('Items/Resource/Grass.png'),
    'berries': R('I_C_Mulberry'), 'clay': T('TilesetNature.png', 4, 13), 'sand': T('TilesetNature.png', 15, 18),
    'wheat': T('TilesetElement.png', 12, 4), 'copper_ore': R('I_Rock05'), 'coal': R('I_Coal'),
    'iron_ore': R('I_Rock02'), 'wool': T('TilesetNature.png', 10, 12), 'herbs': R('I_Leaf'),
    'gold_ore': R('I_Rock04', tint=(235, 190, 50)), 'crystal': R('I_Crystal01'),
    'carrot': R('I_C_Carrot'), 'tomato': R('I_C_RedPepper'), 'pumpkin': R('I_C_Watermellon'), 'grapes': R('I_C_Grapes'),
    'sunflower': T('TilesetNature.png', 0, 11), 'egg': T('TilesetNature.png', 11, 13), 'honey': N('Items/Food/Honey.png'),
    # materials and goods
    'plank': T('TilesetElement.png', 2, 0), 'stick': N('Items/Resource/Branch.png'),
    'rope': N('Items/Weapons/Whip/Sprite.png'), 'basket': T('TilesetElement.png', 2, 1), 'chest': R('I_Chest01'),
    'torch': R('I_Torch02'), 'brick': T('TilesetNature.png', 0, 16), 'glass': R('I_Bottle03'),
    'copper_ingot': N('Items/Resource/BarCopper.png'), 'iron_ingot': N('Items/Resource/BarIron.png'),
    'gold_ingot': N('Items/Resource/BarGold.png'), 'steel_ingot': N('Items/Resource/BarSilver.png'),
    'bread': R('I_C_Bread'), 'pie': R('I_C_Pie'), 'jam': R('I_Ink'),
    'copper_wire': N('Items/Weapons/Whip/Sprite.png', tint=(230, 130, 60)), 'nails': N('Items/Projectile/Caltrop.png'),
    'gear': T('TilesetElement.png', 8, 3), 'sword': R('W_Sword001'), 'shield': R('E_Wood03'),
    'table': T('TilesetElement.png', 5, 7), 'barrel': R('E_Wood04'),
    'thread': N('Items/Weapons/Whip/Sprite.png', tint=(230, 90, 140)), 'cloth': R('I_Fabric'),
    'backpack': N('Items/Object/Bag.png'), 'rug': T('TilesetElement.png', 15, 3), 'sail': N('Backgrounds/Vehicles/Sail.png'),
    'gem': R('I_Diamond'), 'ring': R('Ac_Ring01'), 'necklace': R('Ac_Necklace03'), 'crown': N('Items/Treasure/GoldCup.png'),
    'lens': R('I_Mirror'), 'potion': R('P_Red01'), 'elixir': R('P_Medicine01'),
    'lantern': MF('LanternRed'), 'pocket_watch': R('I_Clock'), 'telescope': R('I_Telescope'), 'compass': R('I_Map'),
    'automaton': CF('RobotGrey'), 'ship': N('Backgrounds/Vehicles/Boat.png'),
    'salad': N('Items/Food/TeaLeaf.png'), 'stew': R('I_C_Meat'), 'soup': N('Items/Food/Noodle.png'),
    'wine': R('P_Red05'), 'cake': R('I_C_Cheese'), 'feast': N('Items/Food/Sushi.png'), 'bouquet': T('TilesetNature.png', 3, 11),
    # tools
    'pickaxe': N('Items/Tool/Pickaxe.png'), 'shovel': N('Items/Tool/Shovel.png'), 'hoe': N('Items/Tool/Hoe.png'),
    'shears': N('Items/Weapons/Sai/Sprite.png'), 'sickle': N('Items/Tool/Sickle.png'),
    # stations
    'hand': N('Items/Action/Interact.png'), 'workbench': T('TilesetElement.png', 7, 0), 'furnace': T('TilesetElement.png', 6, 2),
    'anvil': N('Items/Tool/Anvil.png'), 'loom': T('TilesetElement.png', 10, 1), 'jeweler': R('Ac_Medal02'),
    'alchemy': T('TilesetElement.png', 0, 10), 'workshop': T('TilesetElement.png', 0, 3, 2, 2), 'kitchen': T('TilesetElement.png', 5, 1),
    # relics, pets and other content
    'idol': T('TilesetElement.png', 13, 0), 'fossil': R('I_Bone'), 'lamp': N('Items/Object/Gourd.png'),
    'hourglass': N('Items/Object/Hourglass.png'), 'shell': R('I_SnailShell'), 'horn': N('Items/Object/PanFlute.png'),
    'amphora': T('TilesetElement.png', 0, 0), 'mask': R('C_Elm01'), 'scroll': R('I_Scroll'), 'key': N('Items/Treasure/GoldKey.png'),
    'cat': F('Actor/Animal/Cat/SpriteSheet.png', (0, 0, 16, 16)), 'hen': F('Actor/Animal/Chicken/SpriteSheetWhite.png', (0, 0, 16, 16)),
    'dog': F('Actor/Animal/Dog/SpriteSheet.png', (0, 0, 16, 16)), 'hamster': F('Actor/Animal/Hamster/SpriteSheet.png', (0, 0, 15, 15)),
    'butterfly': MF('Butterfly'), 'owl': MF('Owl'), 'scarecrow': T('TilesetElement.png', 15, 0),
    'coin': R('I_GoldCoin'), 'heart': N('Ui/Receptacle/IconHeart.png'), 'bag': T('TilesetElement.png', 3, 0),
    'giftbox': N('Items/Treasure/LittleTreasureChest.png'), 'sign': T('TilesetNature.png', 5, 8), 'seed': N('Items/Food/Seed1.png'),
    'gold_chest': N('Items/Treasure/BigTreasureChest.png'), 'medal': R('Ac_Medal01'), 'book': R('W_Book01'), 'letter': N('Items/Other/Letter.png'),
    'moneybag': N('Items/Object/MoneyBag.png'), 'map': R('I_Map'), 'cup': N('Items/Treasure/SilverCup.png'), 'feather': R('I_Feather01'),
    'blue_potion': R('P_Blue01'), 'green_potion': R('P_Green01'), 'helmet': R('C_Elm03'), 'armor': R('A_Armor04'),
    'ring2': R('Ac_Ring02'), 'amulet': R('Ac_Necklace01'), 'dagger': R('W_Dagger001'), 'axe': R('W_Axe001'),
    'mace': R('W_Mace001'), 'spear': R('W_Spear001'), 'staff': R('W_Staff01'), 'bow': R('W_Bow01'),
    'robe': R('A_Clothing01'), 'tunic': R('A_Clothing02'), 'plate': R('A_Armour01'), 'medallion': R('Ac_Medal03'),
    'pendant': R('Ac_Necklace02'), 'orb': R('I_Opal'),
    # world props (drawn on the map)
    'tree_round': T('TilesetNature.png', 0, 0, 2, 2), 'tree_pine': T('TilesetNature.png', 2, 0, 2, 2),
    'tree_dead': T('TilesetNature.png', 4, 0, 2, 2), 'tree_bush': T('TilesetNature.png', 6, 0, 2, 2),
    'tree_snowpine': T('TilesetNature.png', 8, 0, 2, 2), 'tree_snow': T('TilesetNature.png', 12, 0, 2, 2),
    'tree_pink': T('TilesetNature.png', 14, 0, 2, 2), 'tree_autumn': T('TilesetNature.png', 16, 0, 2, 2),
    'palm': T('TilesetDesert.png', 10, 4, 2, 2), 'rock_brown': T('TilesetNature.png', 13, 8, 2, 2),
    'rock_gray': T('TilesetNature.png', 16, 8, 2, 2), 'rock_snow': T('TilesetNature.png', 2, 12, 2, 2),
    'rock_teal': T('TilesetNature.png', 0, 12, 2, 2), 'boulder_brown': T('TilesetNature.png', 16, 10, 3, 3),
    'column': D('column'), 'crate': D('crate'), 'skull': D('skull'),
    'ore_rock': T('TilesetNature.png', 4, 14), 'ore_gem': T('TilesetNature.png', 5, 15), 'ore_dark': T('TilesetNature.png', 4, 16),
    'bush': T('TilesetNature.png', 1, 10), 'bush2': T('TilesetNature.png', 4, 10), 'flower_white': T('TilesetNature.png', 6, 11),
    'grass_tuft': T('TilesetNature.png', 3, 10), 'stump': T('TilesetNature.png', 4, 8), 'mushroom_prop': MF('Mushroom'),
    'snow_bush': T('TilesetNature.png', 9, 12), 'hole': T('TilesetNature.png', 7, 13), 'sand_pile': T('TilesetNature.png', 15, 18),
    'camp': T('tileset_camp.png', 4, 0, 3, 3), 'logs': T('tileset_camp.png', 0, 0, 2, 1),
    'w_water': T('TilesetWater.png', 11, 0), 'w_water1': T('TilesetWater.png', 11, 3), 'w_water2': T('TilesetWater.png', 11, 4), 'guide': F('Actor/Character/OldMan/Faceset.png', (0, 0, 38, 38)),
    # ground tiles: [plain, detail1..4]
    'g_grass': T('TilesetFloor.png', 0, 12), 'g_grass1': T('TilesetFloor.png', 1, 12), 'g_grass2': T('TilesetFloor.png', 2, 12),
    'g_grass3': T('TilesetFloor.png', 3, 12), 'g_grass4': T('TilesetFloor.png', 4, 12),
    'g_dark': T('TilesetFloor.png', 11, 12), 'g_dark1': T('TilesetFloor.png', 12, 12), 'g_dark2': T('TilesetFloor.png', 13, 12),
    'g_dark3': T('TilesetFloor.png', 14, 12), 'g_dark4': T('TilesetFloor.png', 15, 12),
    'g_sand': T('TilesetFloor.png', 0, 5), 'g_sand1': T('TilesetFloor.png', 1, 5), 'g_sand2': T('TilesetFloor.png', 2, 5),
    'g_sand3': T('TilesetFloor.png', 3, 5), 'g_sand4': T('TilesetFloor.png', 4, 5),
    'g_beach': T('TilesetFloor.png', 11, 5), 'g_beach1': T('TilesetFloor.png', 12, 5), 'g_beach2': T('TilesetFloor.png', 13, 5),
    'g_beach3': T('TilesetFloor.png', 14, 5), 'g_beach4': T('TilesetFloor.png', 15, 5),
    'g_snow': ('snow', 0), 'g_snow1': ('snow', 1), 'g_snow2': ('snow', 2), 'g_snow3': ('snow', 3), 'g_snow4': ('snow', 4),
    'g_dirt': T('TilesetFloor.png', 11, 19), 'g_dirt1': T('TilesetFloor.png', 12, 19), 'g_dirt2': T('TilesetFloor.png', 13, 19),
    'g_dirt3': T('TilesetFloor.png', 14, 19), 'g_dirt4': T('TilesetFloor.png', 15, 19),
    'g_dun': D('floor_1'), 'g_dun1': D('floor_2'), 'g_dun2': D('floor_3'), 'g_dun3': D('floor_4'), 'g_dun4': D('floor_6'),
}

# ---- animated sheets ----------------------------------------------------------
# kind 'dir4': 4 columns (down, up, left, right) x N rows of 16x16 frames.
ANIMS = {}
HEROES = ['Knight', 'NinjaBlue', 'Hunter', 'Princess', 'Samurai', 'Monk']
for h in HEROES:
    ANIMS['hero_' + h] = (os.path.join(NA, f'Actor/Character/{h}/SpriteSheet.png'), 16, 16, 'dir4')
MONSTERS = ['Slime', 'Slime2', 'Mushroom', 'Racoon', 'Bear', 'BlueBat', 'SpiderRed', 'Mole', 'Skull', 'Snake', 'Spirit',
            'Lizard', 'Flam', 'Reptile', 'Flam2', 'Mole2', 'Larva2', 'Octopus', 'KappaGreen', 'RedOctopus', 'Cyclope',
            'Eye', 'Beast', 'TRex', 'SkullBlue', 'Snake3', 'Larva', 'Mollusc', 'Axolot', 'Dragon', 'Owl', 'Butterfly']
for m in MONSTERS:
    ANIMS['mon_' + m] = (os.path.join(NA, mon_sheet(m)), 16, 16, 'dir4')
# kind 'strip': one row of frames
BOSSES = {
    'GiantSlime': ('Actor/Boss/GiantSlime/Idle.png', 62, 52), 'DemonCyclop': ('Actor/Boss/DemonCyclop/Idle.png', 50, 50),
    'GiantSpirit': ('Actor/Boss/GiantSpirit/Idle.png', 50, 50), 'GiantFlam': ('Actor/Boss/GiantFlam/Idle.png', 50, 50),
    'GiantFrog2': ('Actor/Boss/GiantFrog2/Idle.png', 40, 40), 'SquidRed': ('Actor/Boss/SquidRed/Idle.png', 76, 79),
    'GiantRacoon': ('Actor/Boss/GiantRacoon/Idle.png', 60, 60),
}
for b, (p, w, h) in BOSSES.items():
    ANIMS['boss_' + b] = (os.path.join(NA, p), w, h, 'strip')
ANIMS['fx_slash'] = (os.path.join(NA, 'FX/Slash/SpriteSheetArc.png'), 38, 34, 'strip')
ANIMS['fx_spin'] = (os.path.join(NA, 'FX/Slash/SpriteSheetCircular.png'), 54, 55, 'strip')
ANIMS['fx_smoke'] = (os.path.join(NA, 'FX/Smoke/Smoke/SpriteSheet.png'), 32, 32, 'strip')
ANIMS['fx_coin'] = (None, 16, 16, 'strip')  # built from DT2 frames below
ANIMS['water'] = (os.path.join(NA, 'Backgrounds/Animated/Water Ripples/SpriteSheet16x16.png'), 16, 16, 'strip')

# Emoji used in the game's text -> sprite. Anything not listed keeps its vector icon.
EMOJI = {
    '🪵': 'wood', '🪨': 'stone', '🌿': 'fiber', '🫐': 'berries', '🟤': 'clay', '🏖': 'sand', '🌾': 'wheat',
    '🟠': 'copper_ore', '⚫': 'coal', '⚪': 'iron_ore', '🐑': 'wool', '🌱': 'herbs', '🟡': 'gold_ore', '🔷': 'crystal',
    '🥕': 'carrot', '🍅': 'tomato', '🎃': 'pumpkin', '🍇': 'grapes', '🌻': 'sunflower', '🥚': 'egg', '🍯': 'honey',
    '🟫': 'plank', '🥢': 'stick', '🪢': 'rope', '🧺': 'basket', '📦': 'chest', '🔥': 'torch', '🧱': 'brick', '🪟': 'glass',
    '🟧': 'copper_ingot', '⬜': 'iron_ingot', '🟨': 'gold_ingot', '⬛': 'steel_ingot', '🍞': 'bread', '🥧': 'pie',
    '🫙': 'jam', '➰': 'copper_wire', '📌': 'nails', '⚙': 'gear', '⚔': 'sword', '🛡': 'shield', '🪑': 'table',
    '🛢': 'barrel', '🧵': 'thread', '🏳': 'cloth', '🎒': 'backpack', '🧶': 'rug', '⛵': 'sail', '💎': 'gem', '💍': 'ring',
    '📿': 'necklace', '👑': 'crown', '🔍': 'lens', '🧪': 'potion', '🍶': 'elixir', '🏮': 'lantern', '⏱': 'pocket_watch',
    '🔭': 'telescope', '🧭': 'compass', '🤖': 'automaton', '🚢': 'ship', '🥗': 'salad', '🍲': 'stew', '🥣': 'soup',
    '🍷': 'wine', '🎂': 'cake', '🍱': 'feast', '💐': 'bouquet',
    '⛏': 'pickaxe', '🪏': 'shovel', '🧹': 'hoe', '✂': 'shears', '🌙': 'sickle',
    '✋': 'hand', '🛠': 'workbench', '♨': 'furnace', '⚒': 'anvil', '🪡': 'loom', '⚖': 'jeweler', '⚗': 'alchemy',
    '🔧': 'workshop', '🍳': 'kitchen',
    '🗿': 'idol', '🦴': 'fossil', '🪔': 'lamp', '⏳': 'hourglass', '🐚': 'shell', '📯': 'horn', '🏺': 'amphora',
    '🎭': 'mask', '📜': 'scroll', '🗝': 'key',
    '🐈': 'cat', '🐔': 'hen', '🐕': 'dog', '🦔': 'hamster', '🐝': 'butterfly', '🦉': 'owl', '🧑‍🌾': 'scarecrow',
    '🪙': 'coin', '❤': 'heart', '🧳': 'bag', '🎁': 'giftbox', '🪧': 'sign', '➕': 'seed', '💰': 'moneybag',
    '🏅': 'medal', '📖': 'book', '✉': 'letter', '🗺': 'map', '🏆': 'cup', '🌲': 'tree_pine', '🌳': 'tree_round',
    '🌴': 'palm', '🕳': 'hole', '🏛': 'column', '🏝': 'palm', '🏜': 'rock_brown', '🏔': 'tree_snowpine', '⛺': 'camp',
    '🗡': 'dagger', '🔨': 'mace', '🪓': 'axe', '🔱': 'spear', '🥋': 'robe', '🦺': 'armor', '🧥': 'tunic', '🥼': 'plate', '🪖': 'helmet',
    '🧿': 'orb', '🪬': 'pendant',
    # monsters (first frame of their animation)
    '🦠': 'mon_Slime', '🍄': 'mon_Mushroom', '🦝': 'mon_Racoon', '🦇': 'mon_BlueBat', '🕷': 'mon_SpiderRed',
    '🐀': 'mon_Mole', '💀': 'mon_Skull', '🐍': 'mon_Snake', '👻': 'mon_Spirit', '🦎': 'mon_Lizard', '🔆': 'mon_Flam',
    '🦖': 'mon_Reptile', '🌨': 'mon_Flam2', '🐁': 'mon_Mole2', '🐛': 'mon_Larva2', '🐙': 'mon_Octopus',
    '🐸': 'mon_KappaGreen', '🦑': 'mon_RedOctopus', '🫧': 'boss_GiantSlime', '👹': 'boss_DemonCyclop',
    '👤': 'boss_GiantSpirit', '☄': 'boss_GiantFlam', '🐲': 'boss_GiantFrog2', '🦈': 'boss_SquidRed', '🧝': 'hero_Knight',
}


def snow_tile(seed):
    """A seamless 16x16 snow tile with a few sparkles; the pack's snow tiles have borders."""
    import random
    rnd = random.Random(seed * 7919 + 13)
    im = Image.new('RGBA', (16, 16), (240, 242, 248, 255))
    px = im.load()
    for _ in range(4 + seed * 2):
        x, y = rnd.randrange(16), rnd.randrange(16)
        px[x, y] = (214, 220, 234, 255)
        if seed and rnd.random() < 0.5:
            px[(x + 1) % 16, y] = (214, 220, 234, 255)
    if seed >= 3:
        x, y = rnd.randrange(2, 13), rnd.randrange(2, 13)
        for dx, dy in ((0, 0), (1, 0), (0, 1), (1, 1), (2, 1)):
            px[x + dx, y + dy] = (200, 208, 226, 255)
    return im


def load_still(spec):
    if spec[0] == 'snow':
        return snow_tile(spec[1])
    _, path, box, o = spec
    im = img(path)
    if box:
        im = im.crop(box)
    im = trim(im)
    if 'tint' in o:
        im = tint(im, o['tint'])
    return im


def main():
    pieces = {}
    for name, spec in STILLS.items():
        pieces[name] = load_still(spec)
    anim_meta = {}
    for name, (path, fw, fh, kind) in ANIMS.items():
        if name == 'fx_coin':
            frames = [img(os.path.join(DT2, f'coin_anim_f{i}.png')) for i in range(4)]
            sheet = Image.new('RGBA', (16 * 4, 16))
            for i, f in enumerate(frames):
                sheet.paste(f, (i * 16 + (16 - f.width) // 2, (16 - f.height) // 2))
        else:
            sheet = img(path)
        cols = sheet.width // fw
        rows = sheet.height // fh
        pieces[name] = sheet.crop((0, 0, cols * fw, rows * fh))
        anim_meta[name] = {'fw': fw, 'fh': fh, 'cols': cols, 'rows': rows, 'kind': kind}

    # UI icons: every emoji gets a 34x34 square, art scaled by a whole number and centred
    ICON = 34
    icon_names = list(EMOJI.items()) + [(None, 'hero_' + h) for h in HEROES]
    for e, n in icon_names:
        key = 'i:' + n
        if key in pieces:
            continue
        src = pieces[n]
        if n in anim_meta:
            m = anim_meta[n]
            src = trim(src.crop((0, 0, m['fw'], m['fh'])))
        k = max(1, ICON // max(src.width, src.height))
        im = src.resize((src.width * k, src.height * k), Image.NEAREST) if k > 1 else src
        if max(im.size) > ICON:
            im = im.resize((min(ICON, im.width), min(ICON, im.height)), Image.NEAREST) if False else im
            im.thumbnail((ICON, ICON), Image.NEAREST)
        sq = Image.new('RGBA', (ICON, ICON))
        sq.paste(im, ((ICON - im.width) // 2, (ICON - im.height) // 2))
        pieces[key] = sq

    # shelf-pack, tallest first, 1px padding so neighbours never bleed
    order = sorted(pieces, key=lambda n: (-pieces[n].height, -pieces[n].width))
    W, pad = 1024, 1
    x = y = shelf = 0
    pos = {}
    for n in order:
        im = pieces[n]
        if x + im.width + pad > W:
            x, y, shelf = 0, y + shelf + pad, 0
        pos[n] = (x, y, im.width, im.height)
        x += im.width + pad
        shelf = max(shelf, im.height)
    H = y + shelf
    atlas = Image.new('RGBA', (W, H))
    for n, (px, py, _, _) in pos.items():
        atlas.paste(pieces[n], (px, py))
    os.makedirs(os.path.join(ROOT, 'assets'), exist_ok=True)
    atlas.save(os.path.join(ROOT, 'assets', 'sprites.png'), optimize=True)

    spr = {n: list(pos[n]) for n in pos}
    for n, m in anim_meta.items():
        m['x'], m['y'] = pos[n][0], pos[n][1]
    missing = [e for e, n in EMOJI.items() if n not in spr]
    if missing:
        sys.exit(f'emoji mapped to unknown sprites: {missing}')
    js = ('// GENERATED by scripts/build-atlas.py from CC0 art — do not edit by hand.\n'
          '// Ninja Adventure by Pixel-boy & AAA; 496 RPG icons by 7Soul; DungeonTileset II by 0x72.\n'
          f'const ATLAS = {{ w: {W}, h: {H} }};\n'
          f'const SPR = {json.dumps(spr, separators=(",", ":"))};\n'
          f'const ANIM = {json.dumps(anim_meta, separators=(",", ":"))};\n'
          f'const PX_EMOJI = {json.dumps({e: "i:" + n for e, n in EMOJI.items()}, ensure_ascii=False, separators=(",", ":"))};\n'
          f'const HEROES = {json.dumps(HEROES)};\n')
    with open(os.path.join(ROOT, 'js', 'sprites.js'), 'w', encoding='utf8') as f:
        f.write(js)
    print(f'atlas {W}x{H}, {len(spr)} sprites, {len(anim_meta)} animations, {len(EMOJI)} emoji')


if __name__ == '__main__':
    main()
