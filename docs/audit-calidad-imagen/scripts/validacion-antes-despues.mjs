// Validación antes/después sobre builds aislados.
// Uso: node validate.mjs <url> <etiqueta> <outDir>
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const [, , base, label, outDir] = process.argv;
mkdirSync(outDir, { recursive: true });

const PROFILES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
};
// Red 4G simulada: ~12 Mb/s de bajada, 70 ms de latencia.
const NET = { offline: false, latency: 70, downloadThroughput: (12e6 / 8) | 0, uploadThroughput: (3e6 / 8) | 0 };

/** Memoria privada total (MB) de los procesos de Chrome lanzados por Playwright. */
function chromeMemoryMB(rootPid) {
  const ps = `$all = Get-CimInstance Win32_Process -Filter "Name='chrome.exe'";
$ids = New-Object System.Collections.Generic.HashSet[int]; [void]$ids.Add(${rootPid});
do { $n = $ids.Count; foreach ($p in $all) { if ($ids.Contains([int]$p.ParentProcessId)) { [void]$ids.Add([int]$p.ProcessId) } } } while ($ids.Count -ne $n);
$sum = 0; foreach ($i in $ids) { $p = Get-Process -Id $i -ErrorAction SilentlyContinue; if ($p) { $sum += $p.PrivateMemorySize64 } }; [math]::Round($sum / 1MB)`;
  return Number(execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, " ")}"`).toString().trim());
}

const results = { label };

for (const [name, opts] of Object.entries(PROFILES)) {
  const marker = `kazeval${Date.now()}${name}`;
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", `--${marker}`],
  });
  const rootPid = Number(
    execSync(
      `powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \\"Name='chrome.exe'\\" | Where-Object { $_.CommandLine -like '*${marker}*' -and $_.CommandLine -notlike '*--type=*' } | Select-Object -First 1).ProcessId"`,
    )
      .toString()
      .trim(),
  ) || null;
  console.log(name, "pid raíz de Chrome:", rootPid);
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", NET);
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  // 1. Primera visualización.
  const t0 = Date.now();
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForFunction(() => document.querySelector("canvas")?.style.opacity === "1", null, { timeout: 120000 });
  const firstFrameMs = Date.now() - t0;
  await page.evaluate(() => performance.setResourceTimingBufferSize(5000));
  const seqBytes = () =>
    page.evaluate(() => {
      const r = performance.getEntriesByType("resource").filter((e) => e.name.includes("/cinematic/seq"));
      const frames = r.filter((e) => /\/f\d{4}\./.test(e.name));
      return {
        frames: frames.length,
        bytes: r.reduce((s, e) => s + (e.encodedBodySize || 0), 0),
        sample: frames[0]?.name.replace(location.origin, ""),
      };
    });
  const atFirst = await seqBytes();
  await page.waitForTimeout(8000);
  const idle8s = await seqBytes();
  const memIdle = rootPid ? chromeMemoryMB(rootPid) : null;

  // Sin estrangulamiento para el recorrido (mide el motor, no la red).
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });

  // Oculta textos para comparar solo imagen.
  await page.addStyleTag({ content: ".legibility-wash,.stage-fade,.moment,.brand-header,.scroll-progress{visibility:hidden!important}" });

  // Muestreo de tiempos de cuadro del navegador durante el scroll.
  await page.evaluate(() => {
    window.__ft = [];
    let last = performance.now();
    const loop = (t) => {
      window.__ft.push(t - last);
      last = t;
      if (!window.__stopFt) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });

  const snap = () =>
    page.evaluate(() => {
      const c = document.querySelector("canvas");
      const s = document.createElement("canvas");
      s.width = 96;
      s.height = 54;
      const x = s.getContext("2d", { willReadFrequently: true });
      x.drawImage(c, 0, 0, 96, 54);
      return Array.from(x.getImageData(0, 0, 96, 54).data);
    });
  const mad = (a, b) => {
    let s = 0;
    for (let i = 0; i < a.length; i += 4) s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
    return s / ((a.length / 4) * 3);
  };
  const scrollTo = (p) =>
    page.evaluate(async (p) => {
      const s = document.getElementById("top");
      const target = s.offsetTop + (s.offsetHeight - innerHeight) * p;
      const start = scrollY;
      for (let i = 1; i <= 8; i++) {
        scrollTo(0, start + ((target - start) * i) / 8);
        await new Promise((r) => requestAnimationFrame(r));
      }
    }, p);

  // 2–5. Recorrido de ida y vuelta, 50 posiciones.
  const N = 50;
  const fwd = [];
  const bwd = new Array(N + 1);
  let memPeak = 0;
  for (let i = 0; i <= N; i++) {
    await scrollTo(i / N);
    await page.waitForTimeout(420);
    fwd.push(await snap());
    if (rootPid && i % 10 === 0) memPeak = Math.max(memPeak, chromeMemoryMB(rootPid));
  }
  for (let i = N; i >= 0; i--) {
    await scrollTo(i / N);
    await page.waitForTimeout(420);
    bwd[i] = await snap();
    if (rootPid && i % 10 === 0) memPeak = Math.max(memPeak, chromeMemoryMB(rootPid));
  }
  // Pasada rápida (scroll brusco) para detectar flashes con cuadros sin cargar.
  for (const p of [0, 1, 0.2, 0.8, 0.5, 0]) {
    await scrollTo(p);
    await page.waitForTimeout(120);
  }
  const ft = await page.evaluate(() => {
    window.__stopFt = true;
    const a = window.__ft.slice(5).sort((x, y) => x - y);
    return { n: a.length, p50: a[Math.floor(a.length * 0.5)], p95: a[Math.floor(a.length * 0.95)], over50: a.filter((x) => x > 50).length };
  });

  const steps = fwd.slice(1).map((f, i) => mad(f, fwd[i]));
  const sorted = [...steps].sort((a, b) => a - b);
  const reverse = fwd.map((f, i) => mad(f, bwd[i]));
  const blank = fwd.some((f) => f.slice(0, 400).every((v, k) => (k % 4 === 3 ? true : v < 8)));

  // 6. Capturas (con textos ocultos) en posiciones clave.
  for (const p of [0, 0.3, 0.62, 1]) {
    await scrollTo(p);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${outDir}/${name}_p${String(p).replace(".", "_")}.png` });
  }

  const final = await seqBytes();
  results[name] = {
    firstFrameMs,
    atFirstFrame: atFirst,
    after8sIdle: idle8s,
    afterFullTour: final,
    memoryMB: { idle: memIdle, peak: memPeak },
    frameTimesMs: ft,
    stepDiff: { median: sorted[Math.floor(sorted.length / 2)].toFixed(2), max: sorted[sorted.length - 1].toFixed(2) },
    reverseDiff: { median: [...reverse].sort((a, b) => a - b)[Math.floor(reverse.length / 2)].toFixed(2), max: Math.max(...reverse).toFixed(2) },
    blankFrame: blank,
    errors,
  };
  console.log(name, JSON.stringify(results[name]));
  await browser.close();
}
writeFileSync(`${outDir}/results.json`, JSON.stringify(results, null, 2));
