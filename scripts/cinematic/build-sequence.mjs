#!/usr/bin/env node
/**
 * KAZE — pipeline de la secuencia cinematográfica (calidad alta).
 *
 * Los MP4 originales (public/cinematic/kaze-0N.mp4) tienen un único keyframe
 * por clip (GOP de 121 cuadros): no sirven para scrubbing directo. Este script
 * los convierte en secuencias de imágenes con acceso aleatorio exacto.
 *
 * Parámetros validados en docs/audit-calidad-imagen/README.md:
 *  1. Decodificación con croma precisa (lanczos + accurate_rnd + full_chroma_int).
 *  2. Une los 4 clips con fundidos de 4 cuadros y aplica el etalonado perla.
 *  3. Escalado Lanczos + realce CAS 0,35. Sin reducción de ruido: la medición
 *     mostró que el denoise cuadro a cuadro parpadea (+27 % de inestabilidad).
 *  4. Variantes:
 *       desktop  1920 px, todos los cuadros, AVIF crf 28
 *       mobile   1080 px, 1 de cada 2,      AVIF crf 32
 *       lite      720 px, 1 de cada 2,      AVIF crf 33  (equipos modestos)
 *     Cada una con WebP de respaldo.
 *  5. Pósters de los 5 momentos clave y manifest.json con pesos reales.
 *
 * Los originales no se modifican. La salida va a public/cinematic/seq-hq/.
 *
 * Uso:  npm run cinematic:build
 *       FFMPEG=/ruta/ffmpeg npm run cinematic:build
 *       CINEMATIC_SKIP_AVIF=1 npm run cinematic:build   (rápido, solo WebP)
 *       CINEMATIC_ONLY=mobile npm run cinematic:build   (una sola variante)
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { cpus } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC_DIR = path.join(ROOT, "public/cinematic");
const OUT_NAME = "seq-hq";
const OUT_DIR = path.join(SRC_DIR, OUT_NAME);
const TMP_DIR = path.join(ROOT, ".cinematic-tmp");
const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const FFPROBE = FFMPEG.replace(/ffmpeg(\.exe)?$/i, "ffprobe$1");
const SKIP_AVIF = process.env.CINEMATIC_SKIP_AVIF === "1";
const ONLY = process.env.CINEMATIC_ONLY;

const CLIPS = ["kaze-01.mp4", "kaze-02.mp4", "kaze-03.mp4", "kaze-04.mp4"];
const FPS = 24;
const CLIP_FRAMES = 121;
const XFADE_FRAMES = 4;

/** Escalado y conversión de color precisos en todos los pasos. */
const SWS = ["-sws_flags", "lanczos+accurate_rnd+full_chroma_int"];

/** Curvas medidas sobre el fondo original (≈ 244,238,229) → perla (≈ 247,245,240). Solo luces altas. */
const GRADE =
  "curves=r='0/0 0.55/0.55 0.84/0.875 0.957/0.976 1/1'" +
  ":g='0/0 0.55/0.55 0.82/0.865 0.933/0.966 1/1'" +
  ":b='0/0 0.55/0.55 0.78/0.84 0.898/0.948 1/1'";

/** Realce adaptativo validado: +12 % de nitidez, sin inventar textura. */
const SHARPEN = "cas=strength=0.35";

const VARIANTS = [
  { id: "desktop", width: 1920, step: 1, avifCrf: 28, webpQuality: 72 },
  { id: "mobile", width: 1080, step: 2, avifCrf: 32, webpQuality: 70 },
  { id: "lite", width: 720, step: 2, avifCrf: 33, webpQuality: 68 },
].filter((v) => !ONLY || v.id === ONLY);

function run(args, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", ...args], {
      stdio: ["ignore", "inherit", "inherit"],
    });
    child.on("error", (err) =>
      reject(new Error(`No se pudo ejecutar ffmpeg (${FFMPEG}). Instalalo o definí FFMPEG. ${err.message}`)),
    );
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${label}: ffmpeg salió con ${code}`))));
  });
}

function probeSize(file) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFPROBE, ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0", file]);
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.on("error", reject);
    p.on("exit", () => {
      const [w, h] = out.trim().split(",").map(Number);
      if (w && h) resolve([w, h]);
      else reject(new Error(`No se pudo medir ${file}`));
    });
  });
}

async function pool(items, size, worker) {
  let next = 0;
  let done = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await worker(item);
      done++;
      if (done % 40 === 0 || done === items.length) process.stdout.write(`  ${done}/${items.length}\r`);
    }
  });
  await Promise.all(runners);
  process.stdout.write("\n");
}

async function dirBytes(dir) {
  let total = 0;
  for (const name of await readdir(dir)) total += (await stat(path.join(dir, name))).size;
  return total;
}

const pad = (n) => String(n).padStart(4, "0");

async function main() {
  for (const clip of CLIPS) {
    if (!existsSync(path.join(SRC_DIR, clip))) throw new Error(`Falta ${clip} en public/cinematic/`);
  }
  const t0 = Date.now();
  await rm(TMP_DIR, { recursive: true, force: true });
  await mkdir(TMP_DIR, { recursive: true });

  // Al regenerar una sola variante se conserva el resto del manifiesto.
  let previous = null;
  if (ONLY && existsSync(path.join(OUT_DIR, "manifest.json"))) {
    previous = JSON.parse(await readFile(path.join(OUT_DIR, "manifest.json"), "utf8"));
    for (const v of VARIANTS) await rm(path.join(OUT_DIR, v.id), { recursive: true, force: true });
  } else {
    await rm(OUT_DIR, { recursive: true, force: true });
  }

  // 1. Master continuo, sin pérdida: fundidos entre clips y etalonado.
  const clipSec = CLIP_FRAMES / FPS;
  const fadeSec = XFADE_FRAMES / FPS;
  const inputs = CLIPS.flatMap((c) => ["-i", path.join(SRC_DIR, c)]);
  const prep = CLIPS.map((_, i) => `[${i}:v]fps=${FPS},settb=AVTB,format=yuv420p[v${i}]`).join(";");
  let chain = "";
  let prev = "v0";
  for (let i = 1; i < CLIPS.length; i++) {
    const offset = (i * (clipSec - fadeSec)).toFixed(4);
    const out = i === CLIPS.length - 1 ? "xf" : `x${i}`;
    chain += `;[${prev}][v${i}]xfade=transition=fade:duration=${fadeSec.toFixed(4)}:offset=${offset}[${out}]`;
    prev = out;
  }
  const master = path.join(TMP_DIR, "master.mkv");
  console.log("Master con fundidos y etalonado");
  await run(
    [...SWS, ...inputs, "-filter_complex", `${prep}${chain};[xf]${GRADE}[out]`, "-map", "[out]", "-an", "-c:v", "ffv1", master],
    "master",
  );

  const totalFrames = CLIPS.length * CLIP_FRAMES - (CLIPS.length - 1) * XFADE_FRAMES;
  // Momentos clave: inicio, centro de cada fundido, final.
  const keyFrames = [0];
  for (let i = 1; i < CLIPS.length; i++) {
    keyFrames.push(Math.round(i * (CLIP_FRAMES - XFADE_FRAMES) + XFADE_FRAMES / 2));
  }
  keyFrames.push(totalFrames - 1);

  const manifest = previous ?? {
    version: 1,
    fps: FPS,
    frameCount: totalFrames,
    keyFrames,
    processing: {
      decode: "lanczos+accurate_rnd+full_chroma_int",
      scale: "lanczos",
      sharpen: SHARPEN,
      denoise: "none",
    },
    variants: {},
  };

  // 2. Variantes.
  for (const v of VARIANTS) {
    const tv = Date.now();
    console.log(`Variante ${v.id}: ${v.width} px, 1 de cada ${v.step}`);
    const pngDir = path.join(TMP_DIR, `${v.id}-png`);
    const webpDir = path.join(OUT_DIR, v.id, "webp");
    const avifDir = path.join(OUT_DIR, v.id, "avif");
    await mkdir(pngDir, { recursive: true });
    await mkdir(webpDir, { recursive: true });
    const select = v.step > 1 ? `select='not(mod(n\\,${v.step}))',` : "";
    const filters = `${select}scale=${v.width}:-2:flags=lanczos,${SHARPEN}`;

    await run([...SWS, "-i", master, "-vf", filters, "-fps_mode", "passthrough", "-pix_fmt", "rgb24", path.join(pngDir, "f%04d.png")], "png");
    await run(
      [...SWS, "-i", master, "-vf", filters, "-fps_mode", "passthrough", "-c:v", "libwebp", "-quality", String(v.webpQuality),
        "-compression_level", "5", "-start_number", "0", path.join(webpDir, "f%04d.webp")],
      "webp",
    );
    const pngs = (await readdir(pngDir)).sort();
    const count = pngs.length;

    const formats = { webp: `${v.id}/webp/f{i}.webp` };
    const bytes = { webp: await dirBytes(webpDir) };

    if (!SKIP_AVIF) {
      await mkdir(avifDir, { recursive: true });
      const jobs = pngs.map((name, i) => ({ src: path.join(pngDir, name), dst: path.join(avifDir, `f${pad(i)}.avif`) }));
      await pool(jobs, Math.max(2, Math.min(8, cpus().length - 1)), (job) =>
        run([...SWS, "-i", job.src, "-c:v", "libaom-av1", "-still-picture", "1", "-crf", String(v.avifCrf), "-cpu-used", "6",
          "-pix_fmt", "yuv420p", job.dst], "avif"),
      );
      formats.avif = `${v.id}/avif/f{i}.avif`;
      bytes.avif = await dirBytes(avifDir);
    }

    // Pósters de los momentos clave, con el mismo procesado.
    const posterDir = path.join(OUT_DIR, v.id, "poster");
    await mkdir(posterDir, { recursive: true });
    const posters = [];
    for (const [k, frame] of manifest.keyFrames.entries()) {
      const dst = path.join(posterDir, `moment-${k + 1}.webp`);
      await run([...SWS, "-i", master, "-vf", `select='eq(n\\,${frame})',scale=${v.width}:-2:flags=lanczos,${SHARPEN}`,
        "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", dst], "poster");
      posters.push(`${v.id}/poster/moment-${k + 1}.webp`);
    }

    const [width, height] = await probeSize(path.join(pngDir, pngs[0]));
    manifest.variants[v.id] = { width, height, step: v.step, count, formats, bytes, posters };
    const mb = (b) => (b / 1e6).toFixed(1);
    console.log(
      `  ${width}×${height} · ${count} cuadros · WebP ${mb(bytes.webp)} MB${bytes.avif ? ` · AVIF ${mb(bytes.avif)} MB` : ""} · ${((Date.now() - tv) / 1000).toFixed(0)} s`,
    );
  }

  await writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  await rm(TMP_DIR, { recursive: true, force: true });
  console.log(`Listo en ${((Date.now() - t0) / 1000).toFixed(0)} s: public/cinematic/${OUT_NAME}/manifest.json`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
