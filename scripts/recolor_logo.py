from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "images" / "brands" / "Cabinetprosupply.png"
BACKUP = ROOT / "images" / "cabinet-pro-supply-logo-source.png"
HEADER_OUT = ROOT / "images" / "cabinet-pro-supply-logo.png"
FOOTER_OUT = ROOT / "images" / "cabinet-pro-supply-logo-footer.png"

BRAND_RED = (0xC8, 0x10, 0x2E)
SLATE = (0x33, 0x41, 0x55)  # slate-700 — readable on white
OLD_RED = (220, 42, 11)
OLD_GREY_A = (192, 192, 192)
OLD_GREY_B = (183, 183, 183)


def color_distance(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def is_red(r: int, g: int, b: int) -> bool:
    if color_distance((r, g, b), OLD_RED) <= 55:
        return True
    return r > 140 and r > g + 40 and r > b + 40 and g < 120


def is_grey(r: int, g: int, b: int) -> bool:
    if color_distance((r, g, b), OLD_GREY_A) <= 35:
        return True
    if color_distance((r, g, b), OLD_GREY_B) <= 35:
        return True
    return abs(r - g) <= 12 and abs(g - b) <= 12 and 140 <= r <= 220


def remap_red(r: int, g: int, b: int) -> tuple[int, int, int]:
    return BRAND_RED


def remap_grey(r: int, g: int, b: int) -> tuple[int, int, int]:
    luminance = r / 255
    shade = 0.85 + luminance * 0.2
    return (
        min(255, int(SLATE[0] * shade)),
        min(255, int(SLATE[1] * shade)),
        min(255, int(SLATE[2] * shade)),
    )


def recolor(source: Path) -> Image.Image:
    img = Image.open(source).convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a < 10:
                continue
            if is_red(r, g, b):
                pixels[x, y] = (*remap_red(r, g, b), a)
            elif is_grey(r, g, b):
                pixels[x, y] = (*remap_grey(r, g, b), a)

    return img


def add_white_background(logo: Image.Image, padding: int = 14) -> Image.Image:
    width, height = logo.size
    canvas = Image.new(
        "RGBA",
        (width + padding * 2, height + padding * 2),
        (255, 255, 255, 255),
    )
    canvas.paste(logo, (padding, padding), logo)
    return canvas


def main() -> None:
    if not BACKUP.exists():
        Image.open(SRC).save(BACKUP)

    header = recolor(SRC)
    header.save(HEADER_OUT)

    footer = add_white_background(header)
    footer.save(FOOTER_OUT)

    print(f"Saved header: {HEADER_OUT}")
    print(f"Saved footer: {FOOTER_OUT}")


if __name__ == "__main__":
    main()
