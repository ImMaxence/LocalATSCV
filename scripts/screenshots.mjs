// Génère les captures d'écran du README dans docs/screenshots.
//
// Prérequis : l'application tourne (npm run docker:local, ou npm start avec une URL en argument)
// et Microsoft Edge ou Google Chrome est installé (pas de téléchargement de navigateur).
//
//   npm run screenshots                          → http://localhost:8090
//   npm run screenshots -- http://localhost:4200

import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const baseUrl = process.argv[2] ?? 'http://localhost:8090';
const outDir = new URL('../docs/screenshots/', import.meta.url);
const publicDir = new URL('../public/', import.meta.url);

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

/** Annonce fictive utilisée pour illustrer « Adapter à une offre ». */
const SAMPLE_JOB_AD = `Développeur Front-end Angular H/F
Rejoignez notre équipe produit à Lyon.
Missions : développer des interfaces en Angular et TypeScript, écrire des tests unitaires,
participer aux cérémonies Scrum. Vous maîtrisez Docker et la CI/CD (GitLab CI).
Profil : anglais courant, sens de l'accessibilité. Stack : Angular, TypeScript, RxJS, Kubernetes.`;

/** Crée le CV d'exemple via l'interface et ouvre l'éditeur (chaque capture part d'un navigateur vierge). */
async function openSampleCv(page) {
  await page.goto(`${baseUrl}/editor`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: "Partir d'un exemple" }).click();
  await page.waitForURL((url) => url.pathname.startsWith('/editor/'));
  await page.locator('app-cv-editor app-cv-preview').waitFor();
  await page.waitForTimeout(300);
}

/** Imprime le CV d'exemple en PDF (comme le fera l'export) pour alimenter l'analyseur. */
async function samplePdf(page) {
  await openSampleCv(page);
  await page.evaluate(() => {
    const doc = document.querySelector('app-cv-preview app-cv-document');
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin:0;background:#fff';
    document.body.appendChild(doc);
  });
  const path = join(tmpdir(), 'localatscv-exemple.pdf');
  await page.pdf({
    path,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  return path;
}

/**
 * Rend le CV d'exemple dans plusieurs modèles et renvoie leur HTML avec les styles nécessaires
 * (Angular retire les styles d'un modèle dès qu'il n'est plus affiché).
 */
async function renderTemplates(page, names) {
  await openSampleCv(page);
  const styles = new Set();
  const cvs = [];
  for (const name of names) {
    await page.getByRole('button', { name: /^Ouvrir la galerie des modèles/ }).click();
    const dialog = page.getByRole('dialog');
    // Un clic sélectionne le modèle dans le volet d'aperçu ; « Utiliser ce modèle » l'applique.
    await dialog.getByRole('button', { name: new RegExp(`^${name}$`) }).click();
    await dialog.getByRole('button', { name: 'Utiliser ce modèle' }).click();
    await dialog.waitFor({ state: 'detached' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const rendered = await page.evaluate(() => ({
      html: document.querySelector('app-cv-preview app-cv-document').outerHTML,
      styles: [...document.querySelectorAll('head style')].map((s) => s.textContent),
    }));
    rendered.styles.forEach((css) => styles.add(css));
    cvs.push(rendered.html);
  }
  return { css: [...styles].join('\n'), cvs };
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
    file: 'templates.png',
    context: { ...desktop, colorScheme: 'light' },
    prepare: async (page) => {
      await openSampleCv(page);
      await page.getByRole('button', { name: /^Ouvrir la galerie des modèles/ }).click();
      await page.getByRole('dialog').waitFor();
      await page.waitForTimeout(800);
    },
  },
  {
    file: 'templates-showcase.png',
    context: { viewport: { width: 1440, height: 1010 }, colorScheme: 'light' },
    prepare: async (page) => {
      const { css, cvs } = await renderTemplates(page, [
        'Memphis',
        'Cosmos',
        'Nocturne',
        'Art déco',
        'Sorbet',
        'Gazette',
        'Vitrail',
        'Terminal',
      ]);
      await page.evaluate(
        ({ css, cvs }) => {
          document.body.innerHTML = `<style>${css}
          .showcase { display: grid; grid-template-columns: repeat(4, 318px); justify-content: center; gap: 24px; padding: 40px; background: #f3f1ec; }
          .showcase > div { width: 318px; height: 449px; overflow: hidden; border-radius: 6px; box-shadow: 0 12px 32px -12px rgb(0 0 0 / 0.35); }
          .showcase > div > * { transform: scale(0.4); transform-origin: top left; }
        </style><div class="showcase">${cvs.map((html) => `<div>${html}</div>`).join('')}</div>`;
        },
        { css, cvs },
      );
      await page.waitForTimeout(400);
    },
    target: (page) => page.locator('.showcase'),
  },
  {
    // Image des aperçus de liens (Open Graph) : public/og-image.png, 1200 × 630.
    file: 'og-image.png',
    dir: publicDir,
    context: { viewport: { width: 1200, height: 630 }, colorScheme: 'light' },
    prepare: async (page) => {
      const { css, cvs } = await renderTemplates(page, ['Nocturne', 'Bento', 'Bauhaus']);
      await page.evaluate(
        ({ css, cvs }) => {
          document.body.innerHTML = `<style>${css}
          .og { position: relative; display: flex; width: 1200px; height: 630px; overflow: hidden; background: radial-gradient(circle at 85% 20%, #d9efe5, transparent 45%), #f6f4ee; font-family: 'Inter Variable', sans-serif; color: #17181b; }
          .og .text { width: 560px; padding: 64px 0 0 64px; }
          .og .text .brand { display: flex; align-items: center; gap: 14px; font-size: 30px; font-weight: 700; letter-spacing: -0.02em; }
          .og .text .brand img { width: 52px; height: 52px; }
          .og .text .brand b { color: #11795a; }
          .og .text h1 { margin-top: 44px; font-family: 'Fraunces Variable', serif; font-size: 50px; font-weight: 600; line-height: 1.08; letter-spacing: -0.02em; }
          .og .text ul { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 38px; }
          .og .text li { padding: 8px 16px; border-radius: 9999px; background: #11795a; color: #fff; font-size: 19px; font-weight: 600; }
          .og .text li + li { background: #fff; color: #17181b; box-shadow: inset 0 0 0 1.5px #d8d4cc; }
          .og .card { position: absolute; width: 318px; height: 449px; overflow: hidden; border-radius: 8px; box-shadow: 0 24px 48px -16px rgb(0 0 0 / 0.45); }
          .og .card > * { transform: scale(0.4); transform-origin: top left; }
          .og .card-1 { top: 120px; left: 620px; transform: rotate(-7deg); }
          .og .card-2 { top: 70px; left: 760px; transform: rotate(2deg); z-index: 1; }
          .og .card-3 { top: 140px; left: 900px; transform: rotate(9deg); z-index: 2; }
        </style><div class="og"><div class="text">
          <div class="brand"><img src="/favicon.svg" alt="" /><span>Local<b>ATS</b>CV</span></div>
          <h1>Le CV qui décroche l'entretien, prêt en quelques minutes</h1>
          <ul><li>Gratuit</li><li>Sans inscription</li><li>72 modèles</li><li>100 % privé</li></ul>
        </div>${cvs.map((html, i) => `<div class="card card-${i + 1}">${html}</div>`).join('')}</div>`;
        },
        { css, cvs },
      );
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
    },
    target: (page) => page.locator('.og'),
  },
  {
    file: 'letter.png',
    context: { ...desktop, colorScheme: 'light' },
    prepare: async (page) => {
      await openSampleCv(page);
      await page.getByRole('tab', { name: 'Lettre de motivation' }).click();
      await page.waitForTimeout(500);
    },
  },
  {
    file: 'page-fit.png',
    context: { ...desktop, colorScheme: 'light' },
    prepare: async (page) => {
      await openSampleCv(page);
      for (let i = 0; i < 3; i++) {
        await page
          .locator('app-entry-editor')
          .first()
          .getByRole('button', { name: 'Actions' })
          .click();
        await page.getByRole('menuitem', { name: 'Dupliquer' }).click();
      }
      await page.locator('app-page-fit button[aria-expanded]').click();
      await page.waitForTimeout(500);
    },
  },
  {
    file: 'analyze.png',
    context: { viewport: { width: 1440, height: 1250 }, colorScheme: 'light' },
    prepare: async (page) => {
      const pdf = await samplePdf(page);
      await page.goto(`${baseUrl}/analyze`, { waitUntil: 'networkidle' });
      await page.locator('app-analyze input[type=file]').setInputFiles(pdf);
      await page.locator('app-analyze aside').waitFor();
      await page.waitForTimeout(400);
    },
  },
  {
    file: 'changelog.png',
    context: { ...desktop, colorScheme: 'light' },
    prepare: async (page) => {
      await page.goto(`${baseUrl}/changelog`, { waitUntil: 'networkidle' });
      await page.locator('app-changelog ol').waitFor();
    },
  },
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
  {
    file: 'job-match.png',
    context: { ...desktop, colorScheme: 'light' },
    prepare: async (page) => {
      await openSampleCv(page);
      await page.locator('app-job-panel > section > button').click();
      await page.locator('app-job-panel textarea').fill(SAMPLE_JOB_AD);
      await page.waitForTimeout(1200);
    },
  },
  {
    file: 'import-linkedin.png',
    context: { ...desktop, colorScheme: 'light' },
    prepare: async (page) => {
      await page.goto(`${baseUrl}/editor`, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Importer depuis LinkedIn' }).click();
      await page.getByRole('dialog').waitFor();
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

  const path = new URL(shot.file, shot.dir ?? outDir).pathname.replace(/^\/([A-Za-z]:)/, '$1');
  if (shot.target) {
    await shot.target(page).screenshot({ path });
  } else {
    await page.screenshot({ path, clip: shot.clip });
  }
  console.log(`✓ ${shot.dir ? 'public' : 'docs/screenshots'}/${shot.file}`);
  await context.close();
}

await browser.close();
