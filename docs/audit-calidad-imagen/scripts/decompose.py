"""Descompone la pérdida de nitidez visible: origen vs codificación vs dibujo en navegador."""
import json
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, ".")
from metrics import hf_fraction, lap_var  # noqa: E402

info = json.load(open("cap/info.json"))


def place(img_path, rect, dpr, canvas_size):
    """Escala con Lanczos al rectángulo del motor (en píxeles de dispositivo) sobre un lienzo perla."""
    img = Image.open(img_path).convert("RGB")
    w = round(rect["width"] * dpr)
    h = round(rect["height"] * dpr)
    scaled = img.resize((w, h), Image.LANCZOS)
    canvas = Image.new("RGB", canvas_size, (247, 245, 240))
    canvas.paste(scaled, (round(rect["x"] * dpr), round(rect["y"] * dpr)))
    return canvas


def gray(img):
    a = np.asarray(img, dtype=np.float64) / 255.0
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def crop(g, box):
    x0, y0, x1, y1 = box
    return g[y0:y1, x0:x1]


def ssim_simple(a, b):
    c1, c2 = 0.01**2, 0.03**2
    ma, mb = a.mean(), b.mean()
    va, vb = a.var(), b.var()
    cov = ((a - ma) * (b - mb)).mean()
    return ((2 * ma * mb + c1) * (2 * cov + c2)) / ((ma**2 + mb**2 + c1) * (va + vb + c2))


def run(target, sources, box_rel, display_scale):
    i = info[target]
    rect = i["rect"]
    shot = Image.open(f"cap/{target}.png").convert("RGB")
    size = shot.size
    dpr_draw = i["dpr"]
    # Las capturas están en píxeles físicos (devicePixelRatio), el motor dibuja a `dpr` (con tope).
    scale_to_screen = size[0] / i["css"][0]
    W, H = size
    box = (int(box_rel[0] * W), int(box_rel[1] * H), int(box_rel[2] * W), int(box_rel[3] * H))
    rows = []
    ref_lv = None
    for name, path in sources:
        img = place(path, rect, scale_to_screen, size)
        g = crop(gray(img), box)
        lv = lap_var(g)
        ref_lv = ref_lv or lv
        rows.append((name, lv, hf_fraction(g) * 100, g))
    gb = crop(gray(shot), box)
    rows.append(("B navegador (real)", lap_var(gb), hf_fraction(gb) * 100, gb))
    print(f"\n== {target}  (dibujo a dpr {dpr_draw}, pantalla x{scale_to_screen:g}, ampliación {display_scale})")
    for name, lv, hf, _ in rows:
        print(f"  {name:28s} lapvar {lv:8.2f}  ({lv / ref_lv * 100:5.1f}% de K)   HF {hf:6.3f}%")
    # Cuánto se parece el navegador a un Lanczos ideal del mismo archivo.
    e = rows[-2][3]
    print(f"  SSIM navegador vs Lanczos ideal del mismo AVIF: {ssim_simple(gb, e):.4f}")
    return rows


# Recorte: zona de granos a la derecha, sin texto ni bordes.
desk_box = (0.58, 0.22, 0.92, 0.72)
desk_sources = [
    ("K keyframe Gemini 2752", "p/ref1src_g.png"),
    ("O MP4 original 1280", "p/c1_0_g.png"),
    ("E AVIF publicado 1280", "p/c1_0_avif.png"),
]
for t, sc in [("d1440x900@2", "2,51x"), ("d2560x1440@1", "2,01x"), ("d1920x1080@1", "1,51x"), ("d1440x900@1", "1,26x")]:
    run(t, desk_sources, desk_box, sc)

run("d2560x1440@1-q-low", desk_sources, desk_box, "2,01x (imageSmoothingQuality low)")

mob_box = (0.25, 0.45, 0.95, 0.85)
mob_sources = [
    ("K keyframe Gemini 2752", "p/ref1src_g.png"),
    ("O MP4 original 1280", "p/c1_0_g.png"),
    ("E AVIF móvil 720", "p/m0_avif.png"),
]
run("m390x844@3", mob_sources, mob_box, "3,19x (canvas dpr 2 + compositor 1,5x)")
run("m390x844@3-nocap", mob_sources, mob_box, "3,19x (canvas a dpr 3)")
