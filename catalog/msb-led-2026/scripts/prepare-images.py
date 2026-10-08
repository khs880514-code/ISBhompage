"""카탈로그용 이미지를 만듭니다.

1. 공급사 시트(aowe-supplier-sheet.jpg)에서 LED 배너 두 대만 잘라 3배로 키우고
   배경의 AOWE 워터마크를 지웁니다.
2. 화면 부분에는 render-screens.mjs 로 만든 예시 화면을 원근에 맞춰 입힙니다.
3. 이메일용으로 사진을 작게 줄인 파일을 만듭니다.

사용법: python3 scripts/prepare-images.py   (numpy, scipy, pillow 필요)
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "img" / "source"
BUILD = ROOT / "build"
OUT = ROOT / "src" / "img"

SCALE = 3
# 공급사 시트에서 배너 두 대가 있는 영역 (원본 픽셀 좌표)
CROP = (768, 712, 1300, 1292)

# 화면 네 모서리 (공급사 시트 원본 좌표). 아래쪽 두 점은 받침대에 가려지는 부분까지 연장.
SCREENS = {
    "lobby": [(806, 914), (948, 920), (948, 1232), (806, 1227)],
    "lounge": [(1111, 766), (1239, 726), (1239, 1265), (1111, 1252)],
}


def perspective_coeffs(dst, src):
    """dst 사각형 좌표 -> src 좌표로 가는 PIL PERSPECTIVE 계수."""
    rows, rhs = [], []
    for (x, y), (u, v) in zip(dst, src):
        rows.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        rows.append([0, 0, 0, x, y, 1, -v * x, -v * y])
        rhs.extend([u, v])
    return np.linalg.solve(np.array(rows, float), np.array(rhs, float)).tolist()


def polygon_mask(size, pts):
    from PIL import ImageDraw

    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    return np.asarray(m) > 0


def build_led():
    sheet = Image.open(SRC / "aowe-supplier-sheet.jpg").convert("RGB")
    crop = sheet.crop(CROP)
    w, h = crop.size
    big = crop.resize((w * SCALE, h * SCALE), Image.LANCZOS)
    a = np.asarray(big).astype(float)

    mx, mn = a.max(2), a.min(2)
    sat = (mx - mn) / np.maximum(mx, 1)

    # 제품(진한 색 또는 채도 있는 픽셀)만 남기고 연한 회색 워터마크는 배경으로 처리
    obj = (mn < 222) | (sat > 0.12)
    obj = ndimage.binary_closing(obj, iterations=4)
    obj = ndimage.binary_fill_holes(obj)
    labels, n = ndimage.label(obj)
    sizes = ndimage.sum(obj, labels, range(1, n + 1))
    cy = ndimage.center_of_mass(obj, labels, range(1, n + 1))
    # 배너가 아닌 것(작은 조각, 왼쪽 위에 걸친 다른 제품)은 버림
    good = [i + 1 for i, (sz, (y, _)) in enumerate(zip(sizes, cy)) if sz > 40000 and y > 120 * SCALE]
    keep = np.isin(labels, good)
    keep = ndimage.binary_fill_holes(keep)
    alpha = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    alpha_np = np.asarray(alpha).astype(float) / 255

    # 화면 교체
    dark = mx < 95  # 테두리·받침대
    for name, quad in SCREENS.items():
        q = [((x - CROP[0]) * SCALE, (y - CROP[1]) * SCALE) for x, y in quad]
        content = Image.open(BUILD / f"screen-{name}.png").convert("RGB")
        cw, ch = content.size
        coeffs = perspective_coeffs(q, [(0, 0), (cw, 0), (cw, ch), (0, ch)])
        warped = content.transform(big.size, Image.PERSPECTIVE, coeffs, Image.BICUBIC)
        inner = polygon_mask(big.size, q)
        m = inner & ~dark
        m = ndimage.binary_opening(m, iterations=2)
        mf = np.asarray(
            Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
        ).astype(float)[..., None] / 255
        # LED 화면 느낌: 아주 약한 빛 반사
        yy, xx = np.mgrid[0 : big.size[1], 0 : big.size[0]]
        sheen = np.clip(1 - np.abs((xx - q[0][0]) * 0.5 - (yy - q[0][1]) * 0.25) / 900, 0, 1)[..., None]
        wa = np.asarray(warped).astype(float)
        wa = wa + (255 - wa) * 0.06 * sheen
        a = a * (1 - mf) + wa * mf

        # 화면 가장자리에 남은 원래 화면 색은 테두리 색으로 덮음
        around = ndimage.binary_dilation(inner, iterations=5 * SCALE)
        fringe = around & (sat > 0.22) & ~m
        a[fringe] = (52, 53, 56)

    # 바닥 그림자 (받침대 아래 부드럽게)
    shadow = Image.new("L", big.size, 0)
    from PIL import ImageDraw

    d = ImageDraw.Draw(shadow)
    d.ellipse((30 * SCALE, 494 * SCALE, 227 * SCALE, 528 * SCALE), fill=70)
    d.ellipse((327 * SCALE, 520 * SCALE, 505 * SCALE, 566 * SCALE), fill=70)
    shadow = shadow.filter(ImageFilter.GaussianBlur(10 * SCALE))

    # 색 배경 위에 올릴 수 있도록 투명 배경으로 저장 (그림자 포함)
    shade = np.asarray(shadow).astype(float) / 255 * 0.55 * (1 - alpha_np)
    rgb = np.where(alpha_np[..., None] > 0, a, 0)
    total_a = np.clip(alpha_np + shade, 0, 1)
    rgba = np.dstack([np.clip(rgb, 0, 255), total_a * 255]).astype(np.uint8)
    full = Image.fromarray(rgba, "RGBA")
    full = full.crop(full.getbbox())  # 투명 여백 잘라냄
    full.save(OUT / "led-banners-alpha.png", optimize=True)
    full.resize((full.width // 2, full.height // 2), Image.LANCZOS).save(
        OUT / "web" / "led-banners-alpha.png", optimize=True
    )


def build_web_photos():
    for p in SRC.glob("pod-*.jpg"):
        im = Image.open(p).convert("RGB")
        im.thumbnail((1600, 1600), Image.LANCZOS)
        im.save(OUT / "web" / p.name, quality=78, optimize=True, progressive=True)


if __name__ == "__main__":
    (OUT / "web").mkdir(parents=True, exist_ok=True)
    build_led()
    build_web_photos()
    print("done")
