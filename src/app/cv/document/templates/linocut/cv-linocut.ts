import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Frise gravée (dessin vectoriel sans texte) : feuilles et traits taillés dans la gomme. */
const FRIEZE =
  'M0 20 h40 c10 -14 20 -14 30 0 c10 14 20 14 30 0 h20 c6 -10 10 -14 20 -16 c-4 8 -8 12 -20 16 c12 4 16 8 20 16 c-10 -2 -14 -6 -20 -16 h20 c10 -14 20 -14 30 0 c10 14 20 14 30 0 h40 c10 -14 20 -14 30 0 c10 14 20 14 30 0 h20 c6 -10 10 -14 20 -16 c-4 8 -8 12 -20 16 c12 4 16 8 20 16 c-10 -2 -14 -6 -20 -16 h20 c10 -14 20 -14 30 0 c10 14 20 14 30 0 h40 c10 -14 20 -14 30 0 c10 14 20 14 30 0 h20 c6 -10 10 -14 20 -16 c-4 8 -8 12 -20 16 c12 4 16 8 20 16 c-10 -2 -14 -6 -20 -16 h20 c10 -14 20 -14 30 0 c10 14 20 14 30 0 h40';

/**
 * Linogravure : traits noirs épais comme taillés dans la gomme, un seul aplat de couleur derrière
 * le nom, frise gravée en haut et en bas, serif grasse. Une seule colonne.
 */
@Component({
  selector: 'app-cv-linocut',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <svg class="frieze" viewBox="0 0 800 40" preserveAspectRatio="none" aria-hidden="true">
        <path [attr.d]="frieze" />
      </svg>
      <header>
        <div class="plate">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
        </div>
        <div class="under">
          <div class="identity">
            @if (cv().profile.title.trim()) {
              <p class="headline">{{ cv().profile.title }}</p>
            }
            @if (contact().length) {
              <ul class="contact">
                @for (item of contact(); track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            }
          </div>
          @if (photoUrl()) {
            <img class="photo" [src]="photoUrl()" alt="" />
          } @else if (qr(); as code) {
            <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
          }
        </div>
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
      <svg class="frieze frieze-bottom" viewBox="0 0 800 40" preserveAspectRatio="none" aria-hidden="true">
        <path [attr.d]="frieze" />
      </svg>
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
    .cv {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      padding: calc(28px * var(--cv-space, 1)) 54px calc(24px * var(--cv-space, 1));
      background: #f6f1e6;
      color: #1a1714;
      font-family: var(--cv-body-font, 'Lora Variable', serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --ink: #1a1714;
      --spot: oklch(from var(--cv-accent) 0.66 0.17 h);
    }
    .frieze {
      display: block;
      width: 100%;
      height: 26px;
      flex-shrink: 0;
      fill: none;
      stroke: var(--ink);
      stroke-width: 4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .frieze-bottom {
      margin-top: auto;
      padding-top: calc(18px * var(--cv-space, 1));
      transform: scaleY(-1);
    }
    header {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    .plate {
      padding: calc(14px * var(--cv-space, 1)) 20px;
      border: 4px solid var(--ink);
      background: var(--spot);
      box-shadow: 8px 8px 0 var(--ink);
    }
    .name {
      color: #fff;
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 40px;
      font-weight: 900;
      letter-spacing: -0.01em;
      line-height: calc(1 * var(--cv-leading, 1));
      text-transform: uppercase;
    }
    .under {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 24px;
      margin-top: calc(22px * var(--cv-space, 1));
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .headline {
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 18px;
      font-weight: 700;
      font-style: italic;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(8px * var(--cv-space, 1));
      font-size: 11px;
      font-weight: 600;
    }
    .photo {
      width: 108px;
      height: 108px;
      flex-shrink: 0;
      border: 4px solid var(--ink);
      object-fit: cover;
      filter: grayscale(1) contrast(1.25);
    }
    .qr {
      width: 90px;
      height: 90px;
      flex-shrink: 0;
      padding: 5px;
      border: 4px solid var(--ink);
      background: #fff;
      color: var(--ink);
    }
    .summary {
      margin-top: calc(18px * var(--cv-space, 1));
      padding-left: 18px;
      border-left: 6px solid var(--spot);
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 18px;
      font-weight: 900;
      text-transform: uppercase;
    }
    h2::before {
      content: '';
      width: 0;
      height: 0;
      border-top: 9px solid transparent;
      border-bottom: 9px solid transparent;
      border-left: 16px solid var(--spot);
    }
    h2::after {
      content: '';
      flex: 1;
      height: 4px;
      background: var(--ink);
      border-radius: 2px;
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
      font-size: 13.5px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      padding: 0 8px;
      background: var(--ink);
      color: #f6f1e6;
      font-size: 10.5px;
      font-weight: 700;
    }
    .org {
      color: var(--spot);
      font-weight: 700;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: square;
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
      padding: 0 8px;
      border: 2.5px solid var(--ink);
      font-size: 11px;
      font-weight: 600;
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
      width: 12px;
      height: 12px;
      border: 2.5px solid var(--ink);
    }
    .step.on {
      background: var(--spot);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvLinocut extends CvTemplateBase {
  protected readonly frieze = FRIEZE;
}
