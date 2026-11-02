import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Pistes de circuit imprimé (dessin vectoriel sans texte) dans l'angle supérieur droit. */
const TRACES =
  'M300 0 v60 h-40 v50 h-60 v40 M260 0 v30 h-80 v60 h-40 M220 0 v14 h-50 v30 M300 90 h-20 v70 h-60 v30 M300 130 h-10 v60 h-30';
const PADS = [
  [200, 150],
  [140, 90],
  [170, 44],
  [220, 190],
  [260, 190],
];

/**
 * Circuit : pistes et pastilles de circuit imprimé dans l'angle, titres sur des puces
 * électroniques à broches, chasse fixe pour les détails. Une seule colonne.
 */
@Component({
  selector: 'app-cv-circuit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <svg class="pcb" viewBox="0 0 300 220" aria-hidden="true">
        <path [attr.d]="traces" fill="none" stroke-width="4" stroke-linecap="round" />
        @for (pad of pads; track $index) {
          <circle [attr.cx]="pad[0]" [attr.cy]="pad[1]" r="7" class="pad" />
          <circle [attr.cx]="pad[0]" [attr.cy]="pad[1]" r="2.5" class="hole" />
        }
      </svg>
      <header>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
        <div class="identity">
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
                  <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2" />
                  <span>{{ item.text }}</span>
                </li>
              }
            </ul>
          }
        </div>
      </header>
      @if (qr(); as code) {
        <div class="qr-row">
          <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
        </div>
      }

      @if (summary()) {
        <p class="summary">{{ summary() }}</p>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id) {
        <section class="section">
          <h2><span class="chip-title">{{ sectionTitle(section) }}</span></h2>
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
      padding: calc(48px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
      background: #f6f8f7;
      color: #1d2624;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --board: oklch(from var(--cv-accent) 0.38 0.1 h);
      --trace: oklch(from var(--cv-accent) 0.7 0.12 h);
      --tint: oklch(from var(--cv-accent) 0.93 0.04 h);
      --mono: 'JetBrains Mono Variable', monospace;
    }
    .pcb {
      position: absolute;
      z-index: -1;
      top: 0;
      right: 0;
      width: 300px;
      height: 220px;
      stroke: var(--trace);
    }
    .pad {
      fill: var(--tint);
      stroke: var(--trace);
      stroke-width: 3;
    }
    .hole {
      fill: var(--board);
      stroke: none;
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 22px;
    }
    .photo {
      width: 112px;
      height: 112px;
      flex-shrink: 0;
      border: 3px solid var(--board);
      border-radius: 10px;
      object-fit: cover;
      box-shadow: 0 0 0 3px var(--tint);
    }
    .identity {
      min-width: 0;
      flex: 1;
      padding-right: 150px;
    }
    .name {
      color: var(--board);
      font-family: var(--cv-heading-font, 'Inter Variable', sans-serif);
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-family: var(--mono);
      font-size: 13px;
      font-weight: 600;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(12px * var(--cv-space, 1));
      color: #4b5553;
      font-family: var(--mono);
      font-size: 10.5px;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      color: var(--board);
    }
    .qr-row {
      margin-top: calc(14px * var(--cv-space, 1));
    }
    .qr {
      width: 64px;
      height: 64px;
      padding: 4px;
      border: 2px solid var(--board);
      border-radius: 6px;
      background: #fff;
      color: var(--board);
    }
    .summary {
      margin-top: calc(18px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 14px;
      border: 1.5px solid var(--trace);
      border-radius: 8px;
      background: #fff;
      font-size: 12px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 0;
      margin-bottom: calc(10px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Inter Variable', sans-serif);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    /* Puce électronique : boîtier sombre, broches de chaque côté. */
    .chip-title {
      padding: 3px 14px;
      border-radius: 4px;
      background: var(--board);
      color: #fff;
      border-left: 10px solid var(--board);
      border-right: 10px solid var(--board);
      background-clip: padding-box;
      box-shadow:
        inset 0 0 0 1px rgb(255 255 255 / 0.15);
    }
    h2::before,
    h2::after {
      content: '';
      width: 14px;
      height: 18px;
      background: repeating-linear-gradient(180deg, var(--trace) 0 3px, transparent 3px 6px);
    }
    h2::after {
      flex: 0 0 14px;
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
      color: var(--board);
      font-family: var(--mono);
      font-size: 10.5px;
      font-weight: 600;
    }
    .org {
      color: var(--cv-accent);
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--trace);
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
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: 1px 8px;
      border: 1.5px solid var(--trace);
      border-radius: 4px;
      background: #fff;
      font-family: var(--mono);
      font-size: 10.5px;
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
      gap: 4px;
    }
    .step {
      width: 10px;
      height: 10px;
      border-radius: 9999px;
      border: 2px solid var(--trace);
      background: #fff;
    }
    .step.on {
      background: var(--board);
      border-color: var(--board);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvCircuit extends CvTemplateBase {
  protected readonly traces = TRACES;
  protected readonly pads = PADS;
}
