// Génère les captures d'écran du README dans docs/screenshots.
//
// Prérequis : l'application tourne (npm run docker:local, ou npm start avec une URL en argument)
// et Microsoft Edge ou Google Chrome est installé (pas de téléchargement de navigateur).
//
//   npm run screenshots                          → http://localhost:8090
//   npm run screenshots -- http://localhost:4200

import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const baseUrl = process.argv[2] ?? 'http://localhost:8090';
const outDir = new URL('../docs/screenshots/', import.meta.url);

async function launchBrowser() {
  for (const channel of ['msedge', 'chrome']) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch {
      // Navigateur absent : on essaie le suivant.
    }
  }
  throw new Error('Microsoft Edge ou Google Chrome est requis pour générer les captures.');
}

const desktop = { viewport: { width: 1440, height: 900 } };
const mobile = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true };

/** Crée le CV d'exemple via l'interface et ouvre l'éditeur (chaque capture part d'un navigateur vierge). */
async function openSampleCv(page) {
  await page.goto(`${baseUrl}/editor`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: "Partir d'un exemple" }).click();
  await page.locator('app-cv-preview app-cv-document').waitFor();
  await page.waitForTimeout(300);
}

/** Chaque capture : contexte (thème, taille) + ce qu'il faut photographier. */
const shots = [
  { file: 'landing-light.png', context: { ...desktop, colorScheme: 'light' } },
  { file: 'landing-dark.png', context: { ...desktop, colorScheme: 'dark' } },
  {
    file: 'ats-robot-view.png',
    context: { ...desktop, colorScheme: 'light' },
    target: (page) => page.locator('main section').nth(1),
  },
  {
    file: 'privacy.png',
    context: { ...desktop, colorScheme: 'light' },
    target: (page) => page.locator('#privacy'),
  },
  {
    file: 'language-menu.png',
    context: { ...desktop, colorScheme: 'light' },
    prepare: async (page) => {
      await page.locator('app-language-select button').click();
      await page.locator('[cdkmenu], .cdk-overlay-pane').first().waitFor();
    },
    clip: { x: 840, y: 0, width: 600, height: 380 },
  },
  {
    file: 'cv-list.png',
    context: { ...desktop, colorScheme: 'light' },
    prepare: async (page) => {
      await openSampleCv(page);
      await page.goto(`${baseUrl}/editor`, { waitUntil: 'networkidle' });
      await page.locator('app-cv-list app-cv-preview').first().waitFor();
    },
  },
  {
    file: 'editor-light.png',
    context: { ...desktop, colorScheme: 'light' },
    prepare: openSampleCv,
  },
  { file: 'editor-dark.png', context: { ...desktop, colorScheme: 'dark' }, prepare: openSampleCv },
  {
    file: 'editor-version.png',
    context: { ...desktop, colorScheme: 'light' },
    prepare: async (page) => {
      await openSampleCv(page);
      await page.getByRole('button', { name: 'Version affichée' }).click();
      await page.getByRole('menuitem', { name: 'Nouvelle version' }).click();
      await page.getByRole('dialog').getByRole('textbox').fill('Dev Front – Société X');
      await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();
      await page
        .locator('app-entry-editor')
        .nth(1)
        .getByRole('checkbox', { name: 'Inclure dans cette version' })
        .uncheck();
      await page
        .locator('app-section-panel')
        .first()
        .evaluate((el) => el.scrollIntoView({ block: 'start' }));
      await page.mouse.wheel(0, -130);
      await page.waitForTimeout(300);
    },
  },
  { file: 'mobile-light.png', context: { ...mobile, colorScheme: 'light' } },
  { file: 'mobile-dark.png', context: { ...mobile, colorScheme: 'dark' } },
];

await mkdir(outDir, { recursive: true });
const browser = await launchBrowser();

for (const shot of shots) {
  const context = await browser.newContext({
    ...shot.context,
    locale: 'fr-FR',
    // Animations jouées instantanément : captures identiques d'une exécution à l'autre.
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await shot.prepare?.(page);

  const path = new URL(shot.file, outDir).pathname.replace(/^\/([A-Za-z]:)/, '$1');
  if (shot.target) {
    await shot.target(page).screenshot({ path });
  } else {
    await page.screenshot({ path, clip: shot.clip });
  }
  console.log(`✓ docs/screenshots/${shot.file}`);
  await context.close();
}

await browser.close();
