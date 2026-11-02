import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Veines de marbre (dessin vectoriel sans texte) dans le bandeau d'en-tête. */
const VEINS = [
  'M-20 40 C 120 10, 180 90, 320 60 S 520 20, 640 70 S 760 120, 820 90',
  'M-20 110 C 90 80, 160 150, 300 120 S 480 60, 600 130 S 740 170, 820 140',
  'M200 -10 C 230 40, 190 80, 240 140 S 300 190, 280 230',
  'M520 -10 C 560 50, 500 90, 560 150 S 620 200, 600 230',
];

/**
 * Marbre : bandeau de marbre blanc veiné, filets fins dans un ton doré dérivé de l'accent,
 * Cormorant pour le nom, photo cerclée d'or. Sobre et luxueux, une seule colonne.
 */
@Component({
  selector: 'app-cv-marble',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <svg class="slab" viewBox="0 0 800 220" preserveAspectRatio="none" aria-hidden="true">
        @for (vein of veins; track $index) {
          <path [attr.d]="vein" />
        }
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
      </header>
      <div class="body">
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
            <h2>{{ sectionTitle(section) }}</h2>
            @switch (section.kind) {
              @case ('skills') {
                @for (group of skills(section); track group.id) {
                  <p class="skill-row">
                    @if (group.label.trim()) {
                      <strong class="skill-label">{{ group.label }}{{ separator() }}</strong>
                    }
                    <span>{{ keywords(group).join(' · ') }}</span>
                  </p>
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
                <p>{{ interestLine(interests(section)) }}</p>
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
      </div>
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
      background: #fff;
      color: #2a2a2a;
      font-family: var(--cv-body-font, 'Montserrat Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --gold: oklch(from var(--cv-accent) 0.7 0.1 h);
      --gold-deep: oklch(from var(--cv-accent) 0.52 0.1 h);
    }
    .slab {
      position: absolute;
      z-index: -1;
      inset: 0 0 auto;
      width: 100%;
      height: 220px;
      background: linear-gradient(135deg, #f7f7f9, #e9eaef 45%, #f4f4f7 70%, #e4e5eb);
      fill: none;
      stroke: #b9bcc8;
      stroke-width: 1.2;
      opacity: 0.9;
    }
    header {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: calc(42px * var(--cv-space, 1)) 54px calc(26px * var(--cv-space, 1));
      text-align: center;
    }
    .photo {
      width: 110px;
      height: 110px;
      margin-bottom: calc(14px * var(--cv-space, 1));
      border: 2px solid var(--gold);
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 0 0 6px #fff;
    }
    .name {
      color: #1b1b1b;
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 42px;
      font-weight: 600;
      letter-spacing: 0.04em;
      line-height: calc(1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(8px * var(--cv-space, 1));
      color: var(--gold-deep);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .body {
      padding: calc(12px * var(--cv-space, 1)) 60px calc(44px * var(--cv-space, 1));
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: calc(4px * var(--cv-space, 1)) 18px;
      padding-bottom: calc(12px * var(--cv-space, 1));
      border-bottom: 1px solid var(--gold);
      color: #555;
      font-size: 11px;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      color: var(--gold-deep);
    }
    .qr-row {
      display: flex;
      justify-content: center;
      margin-top: calc(12px * var(--cv-space, 1));
    }
    .qr {
      width: 60px;
      height: 60px;
      color: #1b1b1b;
    }
    .summary {
      margin-top: calc(16px * var(--cv-space, 1));
      font-size: 12.5px;
      text-align: center;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(20px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: calc(10px * var(--cv-space, 1));
      color: #1b1b1b;
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.03em;
    }
    h2::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--gold);
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
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .dates {
      flex-shrink: 0;
      color: var(--gold-deep);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .org {
      color: #666;
      font-size: 11px;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--gold);
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill-row + .skill-row {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .skill-label {
      font-weight: 700;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 400px;
    }
    .languages > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: 5px;
    }
    .step {
      width: 8px;
      height: 8px;
      border: 1px solid var(--gold-deep);
      border-radius: 9999px;
    }
    .step.on {
      background: var(--gold);
      border-color: var(--gold);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvMarble extends CvTemplateBase {
  protected readonly veins = VEINS;
}
