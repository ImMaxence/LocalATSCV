import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Rameau de feuilles (dessin vectoriel, aucun texte), répété dans deux angles de la page. */
const SPRIG =
  'M10 190 C 40 150, 60 110, 70 40 M70 40 c -14 -4 -26 6 -24 20 c 14 2 24 -8 24 -20 Z M62 72 c -16 -6 -30 4 -30 20 c 16 4 30 -6 30 -20 Z M54 104 c -18 -6 -32 6 -30 22 c 16 2 30 -8 30 -22 Z M44 136 c -18 -4 -32 8 -28 24 c 16 0 28 -10 28 -24 Z M72 60 c 14 -8 30 -4 36 10 c -14 8 -30 4 -36 -10 Z M64 92 c 14 -8 30 -2 36 12 c -16 8 -30 2 -36 -12 Z M54 124 c 14 -8 30 -2 36 12 c -16 8 -30 2 -36 -12 Z';

/**
 * Botanique : papier crème, rameaux de feuilles dans les angles, serif Cormorant, teinte
 * végétale dérivée de l'accent, filets doubles sous les titres. Une seule colonne.
 */
@Component({
  selector: 'app-cv-botanical',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <svg class="sprig sprig-a" viewBox="0 0 120 200" aria-hidden="true">
        <path [attr.d]="sprig" />
      </svg>
      <svg class="sprig sprig-b" viewBox="0 0 120 200" aria-hidden="true">
        <path [attr.d]="sprig" />
      </svg>
      <header>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
        @if (fullName()) {
          <h1 class="name">{{ fullName() }}</h1>
        }
        @if (cv().profile.title.trim()) {
          <p class="headline">{{ cv().profile.title }}</p>
        }
        @if (contactItems().length) {
          <ul class="contact">
            @for (item of contactItems(); track $index) {
              <li>
                <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="1.75" />
                <span>{{ item.text }}</span>
              </li>
            }
          </ul>
        }
        @if (qr(); as code) {
          <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
        }
      </header>

      @if (summary()) {
        <p class="summary">{{ summary() }}</p>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id) {
        <section class="section">
          <h2>{{ sectionTitle(section) }}</h2>
          @switch (section.kind) {
            @case ('skills') {
              @for (group of skills(section); track group.id) {
                <div class="skill-row">
                  @if (group.label.trim()) {
                    <span class="skill-label">{{ group.label }}</span>
                  }
                  <ul class="chips">
                    @for (keyword of keywords(group); track $index) {
                      <li>{{ keyword }}</li>
                    }
                  </ul>
                </div>
              }
            }
            @case ('languages') {
              <ul class="languages">
                @for (item of languages(section); track item.id) {
                  <li>
                    <span>{{ languageLabel(item) }}</span>
                    @if (languageLevel(item); as level) {
                      <span class="meter" aria-hidden="true">
                        @for (step of levelSteps; track step) {
                          <span class="step" [class.on]="step <= level"></span>
                        }
                      </span>
                    }
                  </li>
                }
              </ul>
            }
            @case ('interests') {
              <ul class="chips">
                @for (item of interests(section); track item.id) {
                  <li>{{ item.label }}</li>
                }
              </ul>
            }
            @default {
              @for (entry of entries(section); track entry.id) {
                <div class="entry">
                  <div class="entry-head">
                    <h3>{{ entry.title }}</h3>
                    @if (dates(entry)) {
                      <span class="dates">{{ dates(entry) }}</span>
                    }
                  </div>
                  @if (organization(entry)) {
                    <p class="org">{{ organization(entry) }}</p>
                  }
                  @if (entry.bullets.length) {
                    <ul class="bullets">
                      @for (bullet of entry.bullets; track bullet.id) {
                        <li><app-cv-rich [text]="bullet.text" /></li>
                      }
                    </ul>
                  }
                </div>
              }
            }
          }
        </section>
      }
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
    .cv {
      position: relative;
      isolation: isolate;
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      overflow: hidden;
      padding: calc(50px * var(--cv-space, 1)) 64px calc(46px * var(--cv-space, 1));
      background: #faf7f0;
      color: #2d3128;
      font-family: var(--cv-body-font, 'Lora Variable', serif);
      font-size: 11.5px;
      line-height: calc(1.55 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --leaf: oklch(from var(--cv-accent) 0.5 0.1 h);
      --leaf-soft: oklch(from var(--cv-accent) 0.9 0.05 h);
      --leaf-line: oklch(from var(--cv-accent) 0.7 0.08 h);
    }
    .sprig {
      position: absolute;
      z-index: -1;
      width: 150px;
      height: 250px;
      fill: var(--leaf-soft);
      stroke: var(--leaf-line);
      stroke-width: 1.5;
    }
    .sprig-a {
      top: -20px;
      left: -30px;
      transform: rotate(20deg);
    }
    .sprig-b {
      right: -30px;
      bottom: -20px;
      transform: rotate(200deg);
    }
    header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .photo {
      width: 112px;
      height: 112px;
      margin-bottom: calc(14px * var(--cv-space, 1));
      border: 3px solid #fff;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 0 0 1px var(--leaf-line);
    }
    .name {
      color: #22261e;
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 40px;
      font-weight: 600;
      letter-spacing: 0.02em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--leaf);
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 18px;
      font-style: italic;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: calc(4px * var(--cv-space, 1)) 18px;
      margin-top: calc(12px * var(--cv-space, 1));
      color: #5a5e52;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      color: var(--leaf);
    }
    .qr {
      width: 60px;
      height: 60px;
      margin-top: calc(12px * var(--cv-space, 1));
      color: #22261e;
    }
    .summary {
      margin-top: calc(22px * var(--cv-space, 1));
      padding-top: calc(14px * var(--cv-space, 1));
      border-top: 1px solid var(--leaf-line);
      font-size: 12.5px;
      text-align: center;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(20px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(10px * var(--cv-space, 1));
      padding-bottom: calc(4px * var(--cv-space, 1));
      border-bottom: 3px double var(--leaf-line);
      color: var(--leaf);
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-align: center;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(10px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
    }
    h3 {
      font-size: 13px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: #6f7466;
      font-size: 11px;
      font-style: italic;
    }
    .org {
      color: var(--leaf);
      font-style: italic;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--leaf-line);
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .skill-row + .skill-row {
      margin-top: calc(6px * var(--cv-space, 1));
    }
    .skill-label {
      flex-shrink: 0;
      max-width: 40%;
      font-weight: 700;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 6px;
    }
    .chips > li {
      padding: 1px 10px;
      border: 1px solid var(--leaf-line);
      border-radius: 9999px;
      background: #fff;
      font-size: 11px;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: 5px;
    }
    .step {
      width: 12px;
      height: 7px;
      border-radius: 9999px 0;
      background: var(--leaf-soft);
      border: 1px solid var(--leaf-line);
    }
    .step.on {
      background: var(--leaf);
      border-color: var(--leaf);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvBotanical extends CvTemplateBase {
  protected readonly sprig = SPRIG;
}
