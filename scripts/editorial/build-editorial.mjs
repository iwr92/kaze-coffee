#!/usr/bin/env node
/**
 * KAZE — fotografías editoriales para las secciones posteriores al hero.
 *
 * Fuente: media-src/keyframes/ (keyframes Gemini 2752×1536, detalle real).
 * Los recortes macro se hacen a resolución nativa: no se amplía nada.
 * Mismo etalonado perla que la secuencia cinematográfica, para que todo
 * comparta temperatura. No usa ni modifica public/cinematic/.
 *
 * Uso: npm run editorial:build   (FFMPEG=/ruta/ffmpeg si no está en PATH)
 */
import { spawn } from "node:child_process";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC = path.join(ROOT, "media-src/keyframes");
const OUT = path.join(ROOT, "public/editorial");
const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const SWS = ["-sws_flags", "lanczos+accurate_rnd+full_chroma_int"];
const GRADE =
  "curves=r='0/0 0.55/0.55 0.84/0.875 0.957/0.976 1/1'" +
  ":g='0/0 0.55/0.55 0.82/0.865 0.933/0.966 1/1'" +
  ":b='0/0 0.55/0.55 0.78/0.84 0.898/0.948 1/1'";

/** id · archivo · recorte nativo [w, h, x, y] (null = completo) · anchos de salida */
const IMAGES = [
  { id: "granos-macro", src: "kf1-granos.jpg", crop: [1200, 900, 960, 330], widths: [1200, 700] },
  { id: "ruptura-macro", src: "kf2-ruptura.jpg", crop: [1200, 900, 1240, 480], widths: [1200, 700] },
  { id: "corriente-vertical", src: "kf3-corriente.jpg", crop: [1300, 1536, 1000, 0], widths: [1300, 760] },
  { id: "corriente-taza", src: "kf4-corriente-taza.jpg", crop: null, widths: [2400, 1200] },
  { id: "ritual-amplio", src: "kf5-ritual.jpg", crop: null, widths: [2400, 1400] },
  { id: "ritual-vertical", src: "kf5-ritual.jpg", crop: [1200, 1536, 1330, 0], widths: [1200, 720] },
];

function run(args) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
    p.on("error", reject);
    p.on("exit", (c) => (c === 0 ? resolve() : reject(new Error(`ffmpeg ${c}`))));
  });
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
const manifest = {};
for (const img of IMAGES) {
  const crop = img.crop ? `crop=${img.crop.join(":")},` : "";
  const [cw, ch] = img.crop ?? [2752, 1536];
  manifest[img.id] = { aspect: +(cw / ch).toFixed(4), sources: [] };
  for (const w of img.widths) {
    const vf = `${crop}${GRADE},scale=${w}:-2:flags=lanczos`;
    const base = path.join(OUT, `${img.id}-${w}`);
    await run([...SWS, "-i", path.join(SRC, img.src), "-vf", vf, "-c:v", "libaom-av1", "-still-picture", "1", "-crf", "26", "-cpu-used", "4", "-pix_fmt", "yuv420p", `${base}.avif`]);
    await run([...SWS, "-i", path.join(SRC, img.src), "-vf", vf, "-c:v", "libwebp", "-quality", "80", `${base}.webp`]);
    const kb = ((await stat(`${base}.avif`)).size / 1024).toFixed(0);
    manifest[img.id].sources.push({ width: w, height: Math.round((w * ch) / cw / 2) * 2 });
    console.log(`${img.id} ${w}px · AVIF ${kb} KB`);
  }
}
await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
