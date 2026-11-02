import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Courbes de niveau (dessin vectoriel sans texte) : anneaux irréguliers emboîtés. */
const CONTOURS = [
  'M150 20 C 220 10, 290 40, 300 100 C 310 160, 250 200, 180 195 C 110 190, 40 160, 40 100 C 40 50, 90 28, 150 20 Z',
  'M150 45 C 205 38, 262 60, 270 105 C 278 150, 230 178, 178 174 C 125 170, 68 148, 68 104 C 68 68, 105 50, 150 45 Z',
  'M152 70 C 192 66, 232 82, 238 110 C 244 140, 212 158, 176 154 C 142 150, 98 136, 98 108 C 98 86, 122 74, 152 70 Z',
  'M154 95 C 178 93, 202 102, 206 116 C 210 132, 192 142, 172 139 C 152 136, 128 128, 128 114 C 128 104, 138 97, 154 95 Z',
];

/**
 * Relief : courbes de niveau de carte topographique dans deux angles, teintes terre dérivées
 * de l'accent, titres avec marqueur d'altitude. Une seule colonne.
 */
@Component({
  selector: 'app-cv-topo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <svg class="map map-a" viewBox="0 0 340 220" aria-hidden="true">
        @for (ring of contours; track $index) {
          <path [attr.d]="ring" />
        }
      </svg>
      <svg class="map map-b" viewBox="0 0 340 220" aria-hidden="true">
        @for (ring of contours; track $index) {
          <path [attr.d]="ring" />
        }
      </svg>
      <header>
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
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        } @else if (qr(); as code) {
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
      padding: calc(50px * var(--cv-space, 1)) 56px calc(46px * var(--cv-space, 1));
      background: #f7f4ee;
      color: #2b2a26;
      font-family: var(--cv-body-font, 'Manrope Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --earth: oklch(from var(--cv-accent) 0.45 0.1 h);
      --line: oklch(from var(--cv-accent) 0.75 0.08 h);
      --tint: oklch(from var(--cv-accent) 0.92 0.04 h);
    }
    .map {
      position: absolute;
      z-index: -1;
      width: 420px;
      height: 272px;
      fill: none;
      stroke: var(--line);
      stroke-width: 1.5;
    }
    .map path:nth-child(odd) {
      stroke-width: 2.5;
    }
    .map-a {
      top: -60px;
      right: -90px;
    }
    .map-b {
      bottom: -70px;
      left: -120px;
      transform: rotate(160deg);
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(24px * var(--cv-space, 1)) 28px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: var(--earth);
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      font-size: 15px;
      font-weight: 600;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(12px * var(--cv-space, 1));
      color: #5c5950;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--earth);
    }
    .photo {
      width: 116px;
      height: 116px;
      flex-shrink: 0;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow:
        0 0 0 3px #f7f4ee,
        0 0 0 5px var(--line),
        0 0 0 10px #f7f4ee,
        0 0 0 11.5px var(--line);
    }
    .qr {
      width: 72px;
      height: 72px;
      flex-shrink: 0;
      padding: 5px;
      border: 1.5px solid var(--line);
      border-radius: 8px;
      background: #fff;
      color: var(--earth);
    }
    .summary {
      margin-top: calc(20px * var(--cv-space, 1));
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      color: var(--earth);
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    /* Marqueur d'altitude : triangle plein sur un trait. */
    h2::before {
      content: '';
      width: 0;
      height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-bottom: 12px solid var(--cv-accent);
    }
    h2::after {
      content: '';
      flex: 1;
      height: 1.5px;
      background: var(--line);
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
      color: var(--earth);
      font-size: 11px;
      font-weight: 600;
    }
    .org {
      color: #5c5950;
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--cv-accent);
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
      padding: 1px 10px;
      border-radius: 9999px;
      background: var(--tint);
      color: var(--earth);
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
      align-items: flex-end;
      gap: 3px;
    }
    .step {
      width: 9px;
      background: var(--tint);
      border-radius: 2px 2px 0 0;
    }
    .step:nth-child(1) {
      height: 6px;
    }
    .step:nth-child(2) {
      height: 8px;
    }
    .step:nth-child(3) {
      height: 10px;
    }
    .step:nth-child(4) {
      height: 12px;
    }
    .step:nth-child(5) {
      height: 14px;
    }
    .step.on {
      background: var(--earth);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvTopo extends CvTemplateBase {
  protected readonly contours = CONTOURS;
}
