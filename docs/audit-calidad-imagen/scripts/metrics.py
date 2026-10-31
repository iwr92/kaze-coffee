"""Métricas de nitidez y resolución efectiva (auditoría KAZE)."""
import sys
import numpy as np
from PIL import Image


def load_gray(path):
    img = Image.open(path)
    if img.mode not in ("L", "RGB"):
        img = img.convert("RGB")
    if img.mode == "RGB":
        a = np.asarray(img, dtype=np.float64) / 255.0
        # Luma BT.709
        return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    return np.asarray(img, dtype=np.float64) / 255.0


def lap_var(g):
    lap = (
        -4 * g[1:-1, 1:-1]
        + g[:-2, 1:-1]
        + g[2:, 1:-1]
        + g[1:-1, :-2]
        + g[1:-1, 2:]
    )
    return float(lap.var() * 1e4)


def hf_fraction(g, cutoff=0.5):
    """Energía espectral por encima de `cutoff` × Nyquist (sin DC)."""
    h, w = g.shape
    win = np.outer(np.hanning(h), np.hanning(w))
    f = np.fft.fftshift(np.fft.fft2((g - g.mean()) * win))
    p = np.abs(f) ** 2
    fy = np.fft.fftshift(np.fft.fftfreq(h))
    fx = np.fft.fftshift(np.fft.fftfreq(w))
    r = np.sqrt(fy[:, None] ** 2 + fx[None, :] ** 2) / 0.5  # 1.0 = Nyquist
    total = p[r > 0.01].sum()
    return float(p[r > cutoff].sum() / total)


def psnr(a, b):
    mse = np.mean((a - b) ** 2)
    return 99.0 if mse == 0 else float(10 * np.log10(1.0 / mse))


def effective_width(g, threshold=42.0):
    """Ancho mínimo al que el cuadro sobrevive reducción + ampliación con PSNR ≥ umbral."""
    h, w = g.shape
    img = Image.fromarray(np.clip(g * 255, 0, 255).astype(np.uint8))
    best = w
    for s in [0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4]:
        dw, dh = max(8, int(round(w * s))), max(8, int(round(h * s)))
        back = img.resize((dw, dh), Image.LANCZOS).resize((w, h), Image.LANCZOS)
        val = psnr(np.asarray(img, dtype=np.float64) / 255, np.asarray(back, dtype=np.float64) / 255)
        if val >= threshold:
            best = dw
        else:
            break
    return best


def report(path, crop=None):
    g = load_gray(path)
    if crop:
        x, y, cw, ch = crop
        g = g[y : y + ch, x : x + cw]
    return {
        "lapvar": round(lap_var(g), 2),
        "hf50": round(hf_fraction(g) * 100, 3),
        "effw": effective_width(g),
        "w": g.shape[1],
    }


if __name__ == "__main__":
    for p in sys.argv[1:]:
        print(p.split("/")[-1], report(p))
