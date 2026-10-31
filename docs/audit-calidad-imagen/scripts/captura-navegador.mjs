// Captura la salida real del navegador con la réplica del motor de dibujo.
// Uso: node capture2.mjs <outDir>
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const out = process.argv[2];
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"],
});

const targets = [
  { id: "d1440x900@1", w: 1440, h: 900, dpr: 1, src: "d0000.avif" },
  { id: "d1440x900@2", w: 1440, h: 900, dpr: 2, src: "d0000.avif" },
  { id: "d1920x1080@1", w: 1920, h: 1080, dpr: 1, src: "d0000.avif" },
  { id: "d2560x1440@1", w: 2560, h: 1440, dpr: 1, src: "d0000.avif" },
  { id: "d2560x1440@1-q-low", w: 2560, h: 1440, dpr: 1, src: "d0000.avif", q: "low" },
  { id: "m390x844@3", w: 390, h: 844, dpr: 3, src: "m0000.avif", mobile: true },
  { id: "m390x844@3-nocap", w: 390, h: 844, dpr: 3, src: "m0000.avif", mobile: true, cap: 3 },
];

const info = {};
for (const t of targets) {
  const ctx = await browser.newContext({
    viewport: { width: t.w, height: t.h },
    deviceScaleFactor: t.dpr,
    isMobile: !!t.mobile,
    hasTouch: !!t.mobile,
  });
  const page = await ctx.newPage();
  const qs = new URLSearchParams({ src: t.src, q: t.q ?? "high", cap: String(t.cap ?? 2) });
  await page.goto(`http://127.0.0.1:8766/index.html?${qs}`);
  await page.waitForFunction(() => document.title === "ready");
  await page.screenshot({ path: `${out}/${t.id}.png` });
  info[t.id] = await page.evaluate(() => window.__info);
  console.log(t.id, JSON.stringify(info[t.id]));
  await ctx.close();
}
writeFileSync(`${out}/info.json`, JSON.stringify(info, null, 2));
await browser.close();
