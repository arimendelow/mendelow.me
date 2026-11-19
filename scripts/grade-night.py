#!/usr/bin/env python3
"""Builds the hero portrait's dusk twin (ari-portrait-night.jpg and its 600w and 800w sizes) from ari-portrait.jpg.

A deterministic photographic grade: no image model touches the photo. Ari is cut out with GrabCut, the background is
graded toward blue hour, the figure gets a soft warm key light, and a few drawn points of light sit far away in the
gorge. Run from anywhere: python3 scripts/grade-night.py [--debug <dir>]   (needs numpy, opencv-python, Pillow)
"""
import hashlib, json, os, sys
import cv2
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
A = os.path.join(ROOT, "public", "assets")
SRC = os.path.join(A, "ari-portrait.jpg")

P = dict(
    grabcut_rect=(235, 350, 940, 1648),  # x0, y0, x1, y1 of the figure, read off the grid look of the photo
    grabcut_iters=8,
    feather_px=1.5,                      # Gaussian sigma of the mask edge
    bg_exposure=0.22,                    # background gain (linear light)
    bg_sky_extra=0.82,                   # extra darkening of the sky, fading out by y = 620
    bg_foot_dark=0.45,                   # darkening of the foreground below y = 1250
    bg_navy=(0.38, 0.85, 1.20),          # the single hue the background's brightness is carried in (linear RGB)
    bg_mono_mix=0.65,                    # share of that hue against the photo's own colour
    bg_wb=(0.52, 0.92, 1.20),            # cooler white balance on the photo's own colour (linear RGB gains)
    bg_tint=(0.0006, 0.0060, 0.0120),       # deep blue-green floor added under the whole background
    bg_floor=1.0,
    fg_exposure=0.56,                    # figure gain (linear light)
    fg_wb=(1.07, 1.00, 0.94),            # warm key
    key_center=(330, 520), key_radius=900, key_strength=0.5,  # soft warm key from the upper left
    vignette=0.30,
    lights=[(1052, 352), (1088, 360), (1121, 347), (1150, 366), (1172, 355), (1010, 372), (905, 381)],  # (x, y) of faint warm windows, far from him (the nearest is about 240px from his head)
    light_color=(1.00, 0.52, 0.18), light_radius=1.1, light_glow=4.0, light_gain=0.6,
    dither=1.4,                          # noise in 8-bit steps before rounding, so the dark gradients do not band
    seed=20261119,
    quality_full=88,                     # a little above the day's 82 and 70, so the dark gradients do not band in the JPEG
    quality_small=80,
)

def s2l(x): return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)
def l2s(x):
    x = np.clip(x, 0, 1)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * x ** (1 / 2.4) - 0.055)

def segment(bgr):
    h, w = bgr.shape[:2]
    x0, y0, x1, y1 = P["grabcut_rect"]
    m = np.full((h, w), cv2.GC_BGD, np.uint8)
    m[y0:y1, x0:x1] = cv2.GC_PR_FGD
    # the head and the middle of the torso are certainly him; the rect's corners are probably not
    m[440:560, 525:605] = cv2.GC_FGD
    m[820:1560, 470:820] = cv2.GC_FGD
    m[1385:1415, 861:867] = cv2.GC_BGD
    m[1424:1434, 846:858] = cv2.GC_BGD  # day background left inside the curled fingers
    m[1362:1388, 928:934] = cv2.GC_BGD  # a grass tuft by the knuckle
    m[y0:y0 + 150, x0:x0 + 160] = cv2.GC_PR_BGD
    small = 2
    sm = cv2.resize(bgr, (w // small, h // small), interpolation=cv2.INTER_AREA)
    mm = cv2.resize(m, (w // small, h // small), interpolation=cv2.INTER_NEAREST)
    bgd = np.zeros((1, 65)); fgd = np.zeros((1, 65))
    cv2.setRNGSeed(P["seed"])
    cv2.grabCut(sm, mm, None, bgd, fgd, P["grabcut_iters"], cv2.GC_INIT_WITH_MASK)
    hard = np.where((mm == cv2.GC_FGD) | (mm == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(hard)
    hard = np.where(lab == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    hard = cv2.morphologyEx(hard, cv2.MORPH_CLOSE, k)
    hard = cv2.morphologyEx(hard, cv2.MORPH_OPEN, k)
    inv = 255 - hard
    n, lab, stats, _ = cv2.connectedComponentsWithStats(inv)  # fill holes
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] < 60: hard[lab == i] = 255
    hard = cv2.resize(hard, (w, h), interpolation=cv2.INTER_LINEAR)
    hard = (hard > 127).astype(np.uint8) * 255
    hard = cv2.erode(hard, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))  # keep the matte just inside his edge
    return hard

def grade(bgr, hard):
    h, w = bgr.shape[:2]
    rng = np.random.default_rng(P["seed"])
    rgb = s2l(bgr[:, :, ::-1].astype(np.float32) / 255)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)

    # background: keep the day's texture, push it to deep blue, darken the sky most, add a deep blue-green floor
    lum = (rgb * np.array([0.2126, 0.7152, 0.0722], np.float32)).sum(2, keepdims=True)
    mono = lum * np.array(P["bg_navy"], np.float32)
    col = rgb * np.array(P["bg_wb"], np.float32)
    bg = (P["bg_mono_mix"] * mono + (1 - P["bg_mono_mix"]) * col) * P["bg_exposure"]
    sky = np.clip(1 - yy / 620, 0, 1)[..., None] ** 1.2
    bg = bg * (1 - P["bg_sky_extra"] * sky)
    bg = bg * (1 - P["bg_foot_dark"] * np.clip((yy - 1250) / 400, 0, 1))[..., None]  # the foreground grass falls into shadow
    bg = bg + np.array(P["bg_tint"], np.float32) * P["bg_floor"]

    # figure: a little darker overall, warm, with a soft key on the upper left
    fg = rgb * P["fg_exposure"] * np.array(P["fg_wb"], np.float32)
    cx, cy = P["key_center"]
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / P["key_radius"]
    key = (1 + P["key_strength"] * np.clip(1 - d, 0, 1) ** 1.5)[..., None]
    fg = fg * key
    fg = fg * 1.25 / (1 + 0.55 * fg)  # a soft shoulder, so the white shirt does not outshine his face
    fg = fg * (1 - 0.5 * np.clip((yy - 1250) / 400, 0, 1))[..., None]
    fg[..., 0] *= 1 + 0.06 * np.clip(1 - d, 0, 1) ** 1.5

    m = cv2.GaussianBlur(hard.astype(np.float32) / 255, (0, 0), P["feather_px"])[..., None]
    out = fg * m + bg * (1 - m)

    # a vignette, then the lights
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h * 0.45) / (h * 0.6)) ** 2)
    out = out * (1 - P["vignette"] * np.clip(r - 0.55, 0, 1) ** 1.6)[..., None]
    pts = np.zeros((h, w), np.float32)
    for i, (x, y) in enumerate(P["lights"]):
        pts[y, x] = 0.6 + 0.4 * ((i * 37) % 11) / 10  # each light a little different
    core = cv2.GaussianBlur(pts, (0, 0), P["light_radius"]) * (2 * np.pi * P["light_radius"] ** 2)
    glow = cv2.GaussianBlur(pts, (0, 0), P["light_glow"]) * (2 * np.pi * P["light_glow"] ** 2) * 0.10
    lc = np.array(P["light_color"], np.float32)
    out = out + (core + glow)[..., None] * lc * P["light_gain"] * (1 - m)

    srgb = l2s(out) * 255
    srgb = srgb + rng.uniform(-P["dither"], P["dither"], srgb.shape).astype(np.float32) 
    return np.clip(np.round(srgb), 0, 255).astype(np.uint8)

def main():
    dbg = sys.argv[sys.argv.index("--debug") + 1] if "--debug" in sys.argv else None
    bgr = cv2.imread(SRC)
    hard = segment(bgr)
    out = grade(bgr, hard)
    full = Image.fromarray(out)
    full.save(os.path.join(A, "ari-portrait-night.jpg"), quality=P["quality_full"], subsampling=0, progressive=True, optimize=True)
    for width in (600, 800):
        full.resize((width, round(full.height * width / full.width)), Image.LANCZOS).save(
            os.path.join(A, f"ari-portrait-night-{width}.jpg"), quality=P["quality_small"], progressive=True, optimize=True)
    if dbg:
        os.makedirs(dbg, exist_ok=True)
        cv2.imwrite(os.path.join(dbg, "mask.png"), hard)
        ov = bgr.copy(); ov[hard > 0] = (0.5 * ov[hard > 0] + 0.5 * np.array([0, 0, 255])).astype(np.uint8)
        cv2.imwrite(os.path.join(dbg, "overlay.jpg"), ov)
    print(json.dumps({"source_sha256": hashlib.sha256(open(SRC, "rb").read()).hexdigest()}))

if __name__ == "__main__":
    main()
