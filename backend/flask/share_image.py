"""
The 1200x630 preview image shown when someone posts a player's share link
(Discord, X/Twitter, iMessage, Slack...). Link-preview crawlers don't run
JavaScript, so this is drawn on the server: the player's name, headline stats
and their most-played champion's splash art, in the site's colours.

Fonts are bundled in ./fonts (SIL Open Font License; see the OFL-*.txt files)
because the server has no guarantee of any system fonts.
"""

import io
import re
from collections import OrderedDict
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

WIDTH, HEIGHT = 1200, 630
PAD = 64

BG = (10, 14, 20)              # --bg-color
TEXT = (255, 255, 255)
MUTED = (157, 163, 166)        # --text-muted-color
ACCENT = (224, 66, 143)        # --accent-text

FONT_DIR = Path(__file__).resolve().parent / "fonts"
DISPLAY_FONT = FONT_DIR / "BricolageGrotesque-ExtraBold.ttf"
BOLD_FONT = FONT_DIR / "Inter-Bold.ttf"
BODY_FONT = FONT_DIR / "Inter-Medium.ttf"

SPLASH_URL = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/{}_0.jpg"

# Match data's championName -> Data Dragon id / display name, where they differ.
SPLASH_ID_OVERRIDES = {"FiddleSticks": "Fiddlesticks"}
DISPLAY_NAME_OVERRIDES = {
    "MonkeyKing": "Wukong", "FiddleSticks": "Fiddlesticks", "KSante": "K'Sante",
    "Chogath": "Cho'Gath", "Kaisa": "Kai'Sa", "Khazix": "Kha'Zix", "KogMaw": "Kog'Maw",
    "Velkoz": "Vel'Koz", "Belveth": "Bel'Veth", "RekSai": "Rek'Sai", "Nunu": "Nunu & Willump",
    "Renata": "Renata Glasc", "DrMundo": "Dr. Mundo", "JarvanIV": "Jarvan IV",
}

_fonts = {}
_cmap = None
_splash_cache = OrderedDict()   # champion -> RGB image (or None if it couldn't be fetched)
SPLASH_CACHE_SIZE = 40


def _font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    key = (path, size)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(str(path), size)
    return _fonts[key]


def _renderable(text: str) -> bool:
    """True if the bundled fonts have a glyph for every character (Latin scripts)."""
    global _cmap
    if _cmap is None:
        _cmap = set(TTFont(str(DISPLAY_FONT)).getBestCmap()) & set(TTFont(str(BOLD_FONT)).getBestCmap())
    return all(ord(c) in _cmap or c.isspace() for c in text)


def champion_display_name(champion: str) -> str:
    if champion in DISPLAY_NAME_OVERRIDES:
        return DISPLAY_NAME_OVERRIDES[champion]
    return re.sub(r"(?<=[a-z])(?=[A-Z])", " ", champion)   # "LeeSin" -> "Lee Sin"


def _splash(champion: str):
    if not champion:
        return None
    if champion in _splash_cache:
        _splash_cache.move_to_end(champion)
        return _splash_cache[champion]
    image = None
    try:
        resp = requests.get(SPLASH_URL.format(SPLASH_ID_OVERRIDES.get(champion, champion)), timeout=5)
        resp.raise_for_status()
        image = Image.open(io.BytesIO(resp.content)).convert("RGB")
    except Exception:
        pass   # draw without art rather than fail the preview
    _splash_cache[champion] = image
    if len(_splash_cache) > SPLASH_CACHE_SIZE:
        _splash_cache.popitem(last=False)
    return image


def _fit(draw, text: str, path: Path, max_width: int, start: int, smallest: int):
    """Largest font size (stepping down from `start`) at which `text` fits."""
    size = start
    while size > smallest and draw.textlength(text, font=_font(path, size)) > max_width:
        size -= 2
    return _font(path, size)


def _background(champion: str) -> Image.Image:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), BG)
    splash = _splash(champion)
    if splash is not None:
        # Cover the right ~70% of the card, fading into the background on the left.
        scale = HEIGHT / splash.height
        art = splash.resize((round(splash.width * scale), HEIGHT), Image.LANCZOS)
        if art.width < 860:
            art = splash.resize((860, round(splash.height * 860 / splash.width)), Image.LANCZOS)
        x = WIDTH - art.width
        canvas.paste(art, (x, 0))

        fade = Image.new("L", (WIDTH, 1))
        for i in range(WIDTH):
            # Opaque background behind the text, clearing to ~25% over the art.
            t = min(1.0, max(0.0, (i - 360) / 520))
            fade.putpixel((i, 0), round(255 * (1 - 0.75 * t)))
        fade = fade.resize((WIDTH, HEIGHT))
        canvas = Image.composite(Image.new("RGB", (WIDTH, HEIGHT), BG), canvas, fade)

    # Accent stripe down the left edge, the site's brand mark.
    ImageDraw.Draw(canvas).rectangle([0, 0, 8, HEIGHT], fill=ACCENT)
    return canvas


def render_share_image(stats: dict, year: int) -> bytes:
    """
    stats: {"name", "tag", "games", "wins", "hours", "champion", "championGames"}
    Returns JPEG bytes.
    """
    canvas = _background(stats.get("champion"))
    draw = ImageDraw.Draw(canvas)
    text_width = 700

    draw.text((PAD, 58), f"RIFTING WRAPPED {year}", font=_font(BOLD_FONT, 26), fill=ACCENT)

    name, tag = stats.get("name") or "", stats.get("tag") or ""
    if name and _renderable(name + tag):
        name_font = _fit(draw, f"{name}#{tag}", DISPLAY_FONT, text_width, 84, 40)
        draw.text((PAD, 104), name, font=name_font, fill=TEXT)
        draw.text((PAD + draw.textlength(name, font=name_font), 104), f"#{tag}", font=name_font, fill=MUTED)
    else:
        # Names in scripts the bundled fonts don't cover (Korean, Chinese...).
        # The player's name is still in the link's title text.
        draw.text((PAD, 104), "Year in Review", font=_font(DISPLAY_FONT, 84), fill=TEXT)

    games = stats.get("games") or 0
    if games:
        tiles = [
            (f"{games:,}", "games played"),
            (f"{stats.get('hours') or 0:,}", "hours on the Rift"),
            (f"{round(100 * (stats.get('wins') or 0) / games)}%", "win rate"),
        ]
        champ = stats.get("champion")
        if champ:
            tiles.append((champion_display_name(champ), f"most played · {stats.get('championGames', 0):,} games"))

        for i, (value, label) in enumerate(tiles):
            col, row = i % 2, i // 2
            x, y = PAD + col * 340, 262 + row * 130
            value_font = _fit(draw, value, DISPLAY_FONT, 320, 58, 30)
            draw.text((x, y), value, font=value_font, fill=TEXT)
            draw.text((x, y + 70), label, font=_font(BODY_FONT, 22), fill=MUTED)
    else:
        draw.text((PAD, 270), "Their year in League of Legends,\nin stats.", font=_font(BOLD_FONT, 40), fill=TEXT, spacing=10)

    draw.text((PAD, HEIGHT - 76), "riftingwrapped.com  ·  make your own", font=_font(BODY_FONT, 24), fill=MUTED)

    out = io.BytesIO()
    canvas.save(out, "JPEG", quality=86, optimize=True)
    return out.getvalue()
