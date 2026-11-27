"""
Draws public/og-home.jpg, the 1200x630 link-preview card for the home page,
in the same style as the player share cards (backend/flask/share_image.py).
The year is baked in, so re-run it when WRAP_YEAR changes:

    venv/Scripts/python scripts/make_og_home.py 2027
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend" / "flask"))
from PIL import ImageDraw  # noqa: E402
from share_image import (ACCENT, BODY_FONT, BOLD_FONT, DISPLAY_FONT, HEIGHT, MUTED, PAD, TEXT,  # noqa: E402
                         _background, _font)

year = int(sys.argv[1]) if len(sys.argv) > 1 else 2026
canvas = _background("Jax")             # same splash as the home page hero
draw = ImageDraw.Draw(canvas)

draw.text((PAD, 70), "Rifting Wrapped", font=_font(DISPLAY_FONT, 96), fill=TEXT)
draw.text((PAD, 196), f"Your {year} League of Legends\nyear in review", font=_font(BOLD_FONT, 44), fill=TEXT, spacing=8)

for i, line in enumerate(["Top champions", "Hours on the Rift", "Best and worst games", "Weekly recaps and leaderboards"]):
    y = 340 + i * 42
    draw.ellipse((PAD, y + 11, PAD + 10, y + 21), fill=ACCENT)
    draw.text((PAD + 24, y), line, font=_font(BODY_FONT, 28), fill=TEXT)

draw.text((PAD, HEIGHT - 76), "riftingwrapped.com  ·  free, just your Riot ID", font=_font(BODY_FONT, 24), fill=MUTED)

out = ROOT / "public" / "og-home.jpg"
canvas.save(out, "JPEG", quality=86, optimize=True)
print(f"wrote {out}")
