import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

const SHAPES = ['circle', 'square', 'triangle'] as const;

/**
 * Bauhaus : composition géométrique (cercle, carré, triangle, demi-disque) autour de la photo,
 * typographie géométrique et repères de formes devant les titres. Une seule colonne de lecture :
 * la composition est un dessin, invisible pour un ATS.
 */
@Component({
  selector: 'app-cv-bauhaus',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        <div class="identity">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </div>
        <div class="composition" aria-hidden="true">
          <svg viewBox="0 0 270 240">
            <rect class="yellow" x="180" y="0" width="90" height="90" />
            <rect class="second" x="6" y="44" width="38" height="38" />
            <circle class="accent" cx="140" cy="122" r="94" />
            <path class="ink" d="M0 240 L64 240 L32 186 Z" />
            <path class="second" d="M190 240 A40 40 0 0 1 270 240 Z" />
            <line class="rule" x1="70" y1="6" x2="262" y2="232" />
          </svg>
          @if (photoUrl()) {
            <img class="photo" [src]="photoUrl()" alt="" />
          }
          @if (qr(); as code) {
            <div class="qr">
              <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
            </div>
          }
        </div>
      </header>

      <div class="bar" aria-hidden="true"><span></span><span></span><span></span></div>

      <div class="body">
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

        @if (summary()) {
          <p class="summary">{{ summary() }}</p>
        }

        @if (letter(); as body) {
          <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
        }
        @for (section of cv().sections; track section.id; let i = $index) {
          <section class="section">
            <h2>
              <span class="shape" [class]="shape(i)" aria-hidden="true"></span>
              {{ sectionTitle(section) }}
            </h2>
            @switch (section.kind) {
              @case ('skills') {
                @for (group of skills(section); track group.id; let first = $first) {
                  <div class="skill-row">
                    @if (group.label.trim()) {
                      <span class="skill-label">{{ group.label }}</span>
                    }
                    <ul class="chips" [class.solid]="first">
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
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
    .cv {
      position: relative;
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      background: #fff;
      color: #16161a;
      font-family: var(--cv-body-font, 'Jost Variable', sans-serif);
      font-size: 12.5px;
      line-height: calc(1.45 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --yellow: #f2c12e;
      --second: oklch(from var(--cv-accent) 0.46 0.13 calc(h + 180));
    }
    header {
      display: flex;
      align-items: center;
      min-height: 240px;
      padding: 0 300px 0 54px;
    }
    .name {
      font-family: var(--cv-heading-font, 'Jost Variable', sans-serif);
      font-size: 46px;
      font-weight: 700;
      line-height: calc(1 * var(--cv-leading, 1));
      letter-spacing: 0.01em;
      text-transform: uppercase;
    }
    .headline {
      display: inline-block;
      margin-top: calc(14px * var(--cv-space, 1));
      padding: calc(3px * var(--cv-space, 1)) 12px;
      background: #16161a;
      color: #fff;
      font-size: 15px;
      font-weight: 500;
    }
    .composition {
      position: absolute;
      top: 0;
      right: 0;
      width: 270px;
      height: 240px;
    }
    .composition svg {
      width: 100%;
      height: 100%;
    }
    .yellow {
      fill: var(--yellow);
    }
    .accent {
      fill: var(--cv-accent);
    }
    .second {
      fill: var(--second);
    }
    .ink {
      fill: #16161a;
    }
    .rule {
      stroke: #16161a;
      stroke-width: 3;
    }
    .photo {
      position: absolute;
      top: 40px;
      left: 58px;
      width: 164px;
      height: 164px;
      border-radius: 9999px;
      object-fit: cover;
    }
    .qr {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: calc(5px * var(--cv-space, 1)) 5px;
      background: #fff;
    }
    .qr-code {
      width: 60px;
      height: 60px;
      color: #16161a;
    }
    .bar {
      display: flex;
      height: 8px;
    }
    .bar > span:nth-child(1) {
      width: 54px;
      background: var(--cv-accent);
    }
    .bar > span:nth-child(2) {
      flex: 1;
      background: #16161a;
    }
    .bar > span:nth-child(3) {
      width: 90px;
      background: var(--yellow);
    }
    .body {
      padding: calc(16px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 20px;
      font-size: 12px;
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
      padding-left: 14px;
      border-left: 5px solid var(--yellow);
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(10px * var(--cv-space, 1)) 10px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Jost Variable', sans-serif);
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    h2::after {
      content: '';
      flex: 1;
      height: 2px;
      background: #16161a;
    }
    .shape {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }
    .shape.circle {
      border-radius: 9999px;
      background: var(--cv-accent);
    }
    .shape.square {
      background: var(--yellow);
    }
    .shape.triangle {
      background: var(--second);
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
    }
    .entry {
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
      font-weight: 600;
    }
    .dates {
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 600;
    }
    .org {
      color: var(--cv-accent);
      font-weight: 500;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: square;
    }
    .bullets > li::marker {
      color: var(--second);
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
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: 0 9px;
      border: 1.5px solid #16161a;
      font-size: 11.5px;
    }
    .chips.solid > li {
      border-color: var(--cv-accent);
      background: var(--cv-accent);
      color: #fff;
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
      gap: calc(3px * var(--cv-space, 1)) 3px;
    }
    .step {
      width: 10px;
      height: 10px;
      border: 1.5px solid #16161a;
    }
    .step.on {
      background: var(--yellow);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvBauhaus extends CvTemplateBase {
  protected shape(index: number): string {
    return SHAPES[index % SHAPES.length];
  }
}
