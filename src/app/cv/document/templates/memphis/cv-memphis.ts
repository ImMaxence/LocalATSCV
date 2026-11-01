import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Memphis : confettis géométriques des années 80 (zigzags, pois, triangles, gribouillis) dans les
 * marges, couleurs franches et titres soulignés d'un zigzag. Le décor est sous le texte, qui reste
 * sur une seule colonne.
 */
@Component({
  selector: 'app-cv-memphis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <svg class="confetti top" viewBox="0 0 260 200" aria-hidden="true">
        <circle class="c1" cx="190" cy="60" r="44" />
        <path class="zig" d="M40 30 l18 18 l18 -18 l18 18 l18 -18 l18 18" />
        <g class="dots">
          @for (dot of dots; track $index) {
            <circle [attr.cx]="dot[0]" [attr.cy]="dot[1]" r="3.2" />
          }
        </g>
        <path class="c3" d="M228 150 l26 -46 l26 46 Z" />
        <path class="squiggle" d="M100 170 q14 -24 28 0 t28 0 t28 0" />
      </svg>
      <svg class="confetti bottom" viewBox="0 0 220 180" aria-hidden="true">
        <path class="c2" d="M20 160 l40 -70 l40 70 Z" />
        <rect class="c1" x="120" y="96" width="46" height="46" transform="rotate(18 143 119)" />
        <path class="squiggle" d="M8 60 q14 -24 28 0 t28 0 t28 0 t28 0" />
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
        </div>
        @if (qr(); as code) {
          <div class="qr">
            <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
          </div>
        }
      </header>

      @if (contactItems().length) {
        <ul class="contact">
          @for (item of contactItems(); track $index) {
            <li>
              <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2.25" />
              <span>{{ item.text }}</span>
            </li>
          }
        </ul>
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
              @for (group of skills(section); track group.id; let i = $index) {
                <div class="skill-row">
                  @if (group.label.trim()) {
                    <span class="skill-label">{{ group.label }}</span>
                  }
                  <ul class="chips" [attr.data-tone]="i % 3">
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
              <ul class="chips" data-tone="1">
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
      padding: calc(46px * var(--cv-space, 1)) 56px calc(44px * var(--cv-space, 1));
      background: #fffdf8;
      color: #17161d;
      font-family: var(--cv-body-font, 'DM Sans Variable', sans-serif);
      font-size: 12.5px;
      line-height: calc(1.45 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --pink: oklch(from var(--cv-accent) 0.72 0.17 calc(h + 70));
      --sun: #ffcf33;
      --mint: oklch(from var(--cv-accent) 0.86 0.09 h);
    }
    .confetti {
      position: absolute;
      z-index: -1;
      pointer-events: none;
    }
    .confetti.top {
      top: -14px;
      right: -30px;
      width: 290px;
    }
    .confetti.bottom {
      bottom: -10px;
      left: -16px;
      width: 230px;
    }
    .c1 {
      fill: var(--sun);
    }
    .c2 {
      fill: var(--pink);
    }
    .c3 {
      fill: var(--cv-accent);
    }
    .dots {
      fill: #17161d;
    }
    .zig,
    .squiggle {
      fill: none;
      stroke: var(--cv-accent);
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 6;
    }
    .squiggle {
      stroke: var(--pink);
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 22px;
      padding-right: 150px;
    }
    .photo {
      width: 108px;
      height: 108px;
      flex-shrink: 0;
      border: 4px solid #17161d;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 7px 7px 0 var(--pink);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Syne Variable', sans-serif);
      font-size: 40px;
      font-weight: 800;
      line-height: calc(1.02 * var(--cv-leading, 1));
      text-shadow: 3px 3px 0 var(--sun);
    }
    .headline {
      display: inline-block;
      margin-top: calc(10px * var(--cv-space, 1));
      padding: calc(2px * var(--cv-space, 1)) 12px;
      border: 2px solid #17161d;
      border-radius: 9999px;
      background: var(--mint);
      font-size: 14px;
      font-weight: 700;
    }
    .qr {
      flex-shrink: 0;
      padding: calc(6px * var(--cv-space, 1)) 6px;
      border: 2px solid #17161d;
      background: #fff;
    }
    .qr-code {
      width: 62px;
      height: 62px;
      color: #17161d;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(6px * var(--cv-space, 1)) 18px;
      margin-top: calc(20px * var(--cv-space, 1));
      font-weight: 500;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(6px * var(--cv-space, 1)) 6px;
    }
    .contact-icon {
      width: 14px;
      height: 14px;
      color: var(--cv-accent);
    }
    .summary {
      margin-top: calc(14px * var(--cv-space, 1));
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      width: fit-content;
      margin-bottom: calc(10px * var(--cv-space, 1));
      padding-bottom: calc(8px * var(--cv-space, 1));
      background: linear-gradient(135deg, transparent 33%, var(--pink) 33% 66%, transparent 66%) 0
        100% / 12px 8px repeat-x;
      font-family: var(--cv-heading-font, 'Syne Variable', sans-serif);
      font-size: 17px;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .entry {
      padding-left: 14px;
      border-left: 3px dotted var(--cv-accent);
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(11px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    h3 {
      font-size: 14px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      padding: 0 8px;
      background: var(--sun);
      font-size: 11px;
      font-weight: 700;
    }
    .org {
      color: #4c4a57;
      font-weight: 500;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--pink);
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill-row {
      display: flex;
      align-items: baseline;
      gap: calc(10px * var(--cv-space, 1)) 10px;
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
      padding: 0 9px;
      border: 1.5px solid #17161d;
      border-radius: 9999px;
      background: var(--mint);
      font-size: 11.5px;
      font-weight: 600;
    }
    .chips[data-tone='1'] > li {
      background: var(--sun);
    }
    .chips[data-tone='2'] > li {
      background: color-mix(in oklab, var(--pink) 35%, white);
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: calc(4px * var(--cv-space, 1)) 4px;
    }
    .step {
      width: 10px;
      height: 10px;
      border: 1.5px solid #17161d;
      border-radius: 9999px;
    }
    .step.on {
      background: var(--pink);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvMemphis extends CvTemplateBase {
  /** Grille de pois du décor (coordonnées dans le dessin). */
  protected readonly dots = Array.from({ length: 12 }, (_, i) => [
    96 + (i % 4) * 14,
    84 + Math.floor(i / 4) * 14,
  ]);
}
