// Génère les vignettes statiques des modèles (public/templates/<id>.<fr|en>.webp) affichées
// dans la galerie : le CV d'exemple complet, rendu dans chaque modèle, en français puis en
// anglais (sans photo, comme le veut la règle des CV en anglais).
//
// Prérequis : l'application tourne (npm run docker:local, ou npm start avec une URL en argument)
// et Microsoft Edge ou Google Chrome est installé. À relancer après tout ajout ou retouche de
// modèle ; un test vérifie que chaque modèle a ses deux vignettes.
//
//   npm run thumbnails                          → http://localhost:8090
//   npm run thumbnails -- http://localhost:4200

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const baseUrl = process.argv[2] ?? 'http://localhost:8090';
const outDir = new URL('../public/templates/', import.meta.url);
/** Largeur des vignettes : 0,6 × la page A4 (794 px), assez pour les écrans haute densité. */
const SCALE = 0.6;
const WIDTH = Math.round(794 * SCALE);
const HEIGHT = Math.round(1123 * SCALE);

async function launchBrowser() {
  for (const channel of ['msedge', 'chrome']) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch {
      // Navigateur absent : on essaie le suivant.
    }
  }
  throw new Error('Microsoft Edge ou Google Chrome est requis pour générer les vignettes.');
}

/** Rend chaque modèle via le volet d'aperçu de la galerie et renvoie son HTML + les styles. */
async function renderAll(page) {
  await page.getByRole('button', { name: /^Ouvrir la galerie des modèles/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  await dialog.getByRole('radio', { name: 'Exemple complet' }).click();
  const cards = dialog.locator('button[data-id]');
  const count = await cards.count();
  const styles = new Set();
  const renders = [];
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const id = await card.getAttribute('data-id');
    await card.click();
    await page.waitForFunction(
      (id) => !!document.querySelector(`app-template-picker app-cv-document app-cv-${id} .cv`),
      id,
    );
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(120);
    const rendered = await page.evaluate(() => ({
      html: document.querySelector('app-template-picker app-cv-document').outerHTML,
      styles: [...document.querySelectorAll('head style')].map((s) => s.textContent),
    }));
    rendered.styles.forEach((css) => styles.add(css));
    renders.push({ id, html: rendered.html });
  }
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  return { css: [...styles].join('\n'), renders };
}

/** Capture un rendu en WebP (encodé par le navigateur lui-même, via un canevas). */
async function snapshot(page, css, html) {
  await page.setViewportSize({ width: WIDTH, height: HEIGHT });
  await page.evaluate(
    ({ css, html, scale, width, height }) => {
      document.body.innerHTML = `<style>${css}
        html, body { margin: 0; background: #fff; }
        .shot { width: ${width}px; height: ${height}px; overflow: hidden; }
        .shot > * { transform: scale(${scale}); transform-origin: top left; }
      </style><div class="shot">${html}</div>`;
    },
    { css, html, scale: SCALE, width: WIDTH, height: HEIGHT },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(80);
  const png = await page.locator('.shot').screenshot({ type: 'png' });
  const dataUrl = await page.evaluate(async (bytes) => {
    const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' });
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0);
    return canvas.toDataURL('image/webp', 0.72);
  }, [...png]);
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

const browser = await launchBrowser();
await mkdir(outDir, { recursive: true });
let total = 0;
try {
  for (const lang of ['fr', 'en']) {
    const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/editor`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: "Partir d'un exemple" }).click();
    await page.waitForURL((url) => url.pathname.startsWith('/editor/'));
    await page.locator('app-cv-editor app-cv-preview').waitFor();
    if (lang === 'en') {
      await page.getByRole('radio', { name: /^en$/i }).click();
      await page.waitForTimeout(200);
    }
    const { css, renders } = await renderAll(page);
    const shot = await context.newPage();
    await shot.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    for (const { id, html } of renders) {
      const webp = await snapshot(shot, css, html);
      await writeFile(new URL(`${id}.${lang}.webp`, outDir), webp);
      total += webp.length;
      console.log(`✓ public/templates/${id}.${lang}.webp (${Math.round(webp.length / 1024)} Ko)`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
console.log(`Total : ${(total / 1024 / 1024).toFixed(1)} Mo`);
