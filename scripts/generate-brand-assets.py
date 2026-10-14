#!/usr/bin/env python3
"""
Regenerates every icon, splash image and in-app logo from the brand source files.

    python3 scripts/generate-brand-assets.py        (needs Pillow + numpy)

Sources (keep these as the master copies):
    assets/brand/source/logo-mark.png       N Seoul Tower mark on white
    assets/brand/source/logo-wordmark.png   "UNRAVEL KOREA" wordmark on white
    assets/brand/source/logo-stacked.png    mark + wordmark on white
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "brand" / "source"
IMAGES = ROOT / "assets" / "images"
BRAND = ROOT / "assets" / "brand"

WHITE = (255, 255, 255, 255)
DARK_BG = (14, 21, 32, 255)  # theme dark background, #0E1520
LIGHT_INK = np.array([232, 240, 250], dtype=np.float32)  # navy is redrawn in this on dark backgrounds
INK_FLOOR = 0.08  # below this it is paper texture
INK_SOLID = 0.40  # at or above this it is solid ink (the light-blue wave is ~0.62)


def color_to_alpha(path: Path) -> Image.Image:
    """
    Lifts the artwork off its white paper and crops to it.

    Solid ink becomes fully opaque in its original colour (so the blue looks identical on light and
    dark backgrounds); only faint edge pixels stay translucent for anti-aliasing.
    """
    rgb = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    ink = (255.0 - rgb).max(axis=2) / 255.0  # 0 = paper white, 1 = full-strength ink
    alpha = np.clip((ink - INK_FLOOR) / (INK_SOLID - INK_FLOOR), 0.0, 1.0)
    # Edge pixels: recover the ink colour that was blended with white. Solid pixels: keep as drawn.
    unblended = 255.0 - (255.0 - rgb) / np.maximum(ink, 1e-3)[..., None]
    color = np.where((alpha < 1.0)[..., None], np.clip(unblended, 0, 255), rgb)
    out = Image.fromarray(np.dstack([color, alpha * 255.0]).astype(np.uint8), "RGBA")
    return out.crop(out.getbbox())


def for_dark_background(img: Image.Image) -> Image.Image:
    """Redraws the dark navy ink in a light tone so the logo reads on dark backgrounds."""
    a = np.asarray(img).astype(np.float32)
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    navy = (lum < 85) & (a[..., 3] > 0)
    a[navy, :3] = LIGHT_INK
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def fit(art: Image.Image, size: tuple[int, int], max_w: float, max_h: float, bg=(0, 0, 0, 0)) -> Image.Image:
    """Scales `art` to fit within max_w x max_h (fractions of the canvas) and centers it."""
    w, h = size
    scale = min(w * max_w / art.width, h * max_h / art.height)
    scaled = art.resize((round(art.width * scale), round(art.height * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", size, bg)
    canvas.alpha_composite(scaled, ((w - scaled.width) // 2, (h - scaled.height) // 2))
    return canvas


def save(img: Image.Image, path: Path, rgb: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    (img.convert("RGB") if rgb else img).save(path, optimize=True)
    print(f"  {path.relative_to(ROOT)}  {img.width}x{img.height}")


def main() -> None:
    mark = color_to_alpha(SRC / "logo-mark.png")
    wordmark = color_to_alpha(SRC / "logo-wordmark.png")
    stacked = color_to_alpha(SRC / "logo-stacked.png")

    print("In-app logos")
    save(fit(wordmark, (1200, round(1200 * wordmark.height / wordmark.width)), 1, 1), BRAND / "wordmark.png")
    save(for_dark_background(Image.open(BRAND / "wordmark.png")), BRAND / "wordmark-dark.png")
    save(fit(stacked, (900, round(900 * stacked.height / stacked.width)), 1, 1), BRAND / "logo-stacked.png")
    save(for_dark_background(Image.open(BRAND / "logo-stacked.png")), BRAND / "logo-stacked-dark.png")
    save(fit(mark, (600, round(600 * mark.height / mark.width)), 1, 1), BRAND / "mark.png")

    print("App icons")
    # iOS + legacy Android + store: opaque, white like the logo artwork.
    save(fit(mark, (1024, 1024), 0.62, 0.74, WHITE), IMAGES / "icon.png", rgb=True)
    # Android adaptive icon: artwork inside the 66% safe zone so circle/squircle masks never clip it.
    save(fit(mark, (1024, 1024), 0.50, 0.60), IMAGES / "android-icon-foreground.png")
    save(Image.new("RGBA", (1024, 1024), WHITE), IMAGES / "android-icon-background.png", rgb=True)
    mono = fit(mark, (1024, 1024), 0.50, 0.60)
    mono_alpha = mono.getchannel("A")
    save(Image.merge("RGBA", (*Image.new("RGB", mono.size, (0, 0, 0)).split(), mono_alpha)),
         IMAGES / "android-icon-monochrome.png")
    save(fit(mark, (48, 48), 0.80, 0.90, WHITE), IMAGES / "favicon.png", rgb=True)

    print("Splash")
    save(fit(mark, (600, 760), 1, 1), IMAGES / "splash-icon.png")

    print("Store")
    save(fit(mark, (512, 512), 0.62, 0.74, WHITE), ROOT / "store" / "icon-512.png", rgb=True)


if __name__ == "__main__":
    main()
