"""카탈로그용 이미지를 만듭니다.

1. 공급사 시트(aowe-supplier-sheet.jpg)에서 LED 배너 두 대만 잘라 3배로 키우고
   배경의 AOWE 워터마크를 지웁니다.
2. 화면 부분에는 render-screens.mjs 로 만든 예시 화면을 원근에 맞춰 입히고
   (IT 오피스용, 공장용 두 가지), 어두운 배경에 맞게 화면 빛 번짐을 넣습니다.
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
# sign = 왼쪽(접이식) 배너, photo = 오른쪽(세운) 배너
SCREENS = {
    "sign": [(806, 914), (948, 920), (948, 1232), (806, 1227)],
    "photo": [(1111, 766), (1239, 726), (1239, 1265), (1111, 1252)],
}
VERSIONS = ["it", "factory"]  # IT 오피스용, 공장용
PAD = 70  # 빛 번짐이 들어갈 여백 (배율 적용 전)


def over(dst_p, dst_a, src_rgb, src_a):
    """premultiplied 합성: src 를 dst 위에 올림."""
    sa = src_a[..., None]
    return src_rgb * sa + dst_p * (1 - sa), src_a + dst_a * (1 - src_a)


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


def build_led(version):
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
    screen_rgb = np.zeros_like(a)
    screen_a = np.zeros(a.shape[:2])
    for name, quad in SCREENS.items():
        q = [((x - CROP[0]) * SCALE, (y - CROP[1]) * SCALE) for x, y in quad]
        content = Image.open(BUILD / f"screen-{version}-{name}.png").convert("RGB")
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
        screen_rgb = np.where(m[..., None], wa, screen_rgb)
        screen_a = np.maximum(screen_a, m.astype(float))

        # 화면 가장자리에 남은 원래 화면 색은 테두리 색으로 덮음
        around = ndimage.binary_dilation(inner, iterations=5 * SCALE)
        fringe = around & (sat > 0.22) & ~m
        a[fringe] = (52, 53, 56)

    # 흰 배경과 섞여 있던 가장자리 픽셀을 주변 어두운 색으로 바꿔 흰 테두리를 없앰
    edge = keep & ~ndimage.binary_erosion(keep, iterations=3 * SCALE)
    darker = np.dstack([ndimage.minimum_filter(a[..., i], size=4 * SCALE + 1) for i in range(3)])
    a = np.where(edge[..., None], darker, a)
    keep_in = ndimage.binary_erosion(keep, iterations=SCALE)
    alpha_np = ndimage.gaussian_filter(keep_in.astype(float), 1.0)

    # 어두운 배경에 올릴 이미지: 여백을 두고 화면 빛 번짐과 바닥 빛을 깔아 줌
    P = PAD * SCALE
    H, W = alpha_np.shape
    pad = lambda arr: np.pad(arr, [(P, P), (P, P)] + [(0, 0)] * (arr.ndim - 2))
    rgb_c, a_c = pad(a), pad(alpha_np)
    srgb, sa = pad(screen_rgb), pad(screen_a)

    out_p = np.zeros_like(rgb_c)
    out_a = np.zeros(a_c.shape)

    # 1) 화면에서 번지는 빛
    radius = 26 * SCALE
    glow_p = np.dstack([ndimage.gaussian_filter(srgb[..., i] * sa, radius) for i in range(3)])
    glow_a = ndimage.gaussian_filter(sa, radius)
    glow_rgb = glow_p / np.maximum(glow_a[..., None], 1e-6)
    out_p, out_a = over(out_p, out_a, glow_rgb, np.clip(glow_a * 1.1, 0, 1) * 0.5)

    # 2) 받침대 아래 바닥에 비친 빛
    from PIL import ImageDraw

    pool = Image.new("L", (W + 2 * P, H + 2 * P), 0)
    d = ImageDraw.Draw(pool)
    for (x0, y0, x1, y1) in [(10, 488, 250, 540), (300, 512, 530, 578)]:
        d.ellipse(((x0 + PAD) * SCALE, (y0 + PAD) * SCALE, (x1 + PAD) * SCALE, (y1 + PAD) * SCALE), fill=255)
    pool = np.asarray(pool.filter(ImageFilter.GaussianBlur(16 * SCALE))).astype(float) / 255
    mean = (srgb * sa[..., None]).sum((0, 1)) / max(sa.sum(), 1)
    pool_rgb = np.broadcast_to(mean, rgb_c.shape)
    out_p, out_a = over(out_p, out_a, pool_rgb, pool * 0.32)

    # 3) 제품
    out_p, out_a = over(out_p, out_a, rgb_c, a_c)

    rgb = out_p / np.maximum(out_a[..., None], 1e-6)
    rgba = np.dstack([np.clip(rgb, 0, 255), np.clip(out_a, 0, 1) * 255]).astype(np.uint8)
    full = Image.fromarray(rgba, "RGBA")
    full = full.crop(full.getbbox())
    full.save(OUT / f"led-{version}.png", optimize=True)
    full.resize((full.width // 2, full.height // 2), Image.LANCZOS).save(
        OUT / "web" / f"led-{version}.png", optimize=True
    )


def build_web_photos():
    for p in SRC.glob("pod-*.jpg"):
        im = Image.open(p).convert("RGB")
        im.thumbnail((1600, 1600), Image.LANCZOS)
        im.save(OUT / "web" / p.name, quality=78, optimize=True, progressive=True)


if __name__ == "__main__":
    (OUT / "web").mkdir(parents=True, exist_ok=True)
    for v in VERSIONS:
        build_led(v)
    build_web_photos()
    print("done")
