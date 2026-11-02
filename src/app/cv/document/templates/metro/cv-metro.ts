import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Plan de lignes (dessin vectoriel sans texte) : trois lignes à coudes de 45° et leurs stations. */
const LINES = [
  { d: 'M0 30 H120 L170 80 H300', cls: 'l0' },
  { d: 'M0 70 H80 L130 20 H260 L300 60', cls: 'l1' },
  { d: 'M0 110 H200 L250 60 H300', cls: 'l2' },
];
const STATIONS = [
  [120, 30],
  [170, 80],
  [80, 70],
  [130, 20],
  [200, 110],
  [250, 60],
];

/**
 * Métro : chaque rubrique est une ligne de couleur avec une station par entrée (cercle blanc
 * cerclé), plan de lignes à coudes de 45° dans l'angle, pastilles rondes. Une seule colonne.
 */
@Component({
  selector: 'app-cv-metro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <svg class="map" viewBox="0 0 300 130" aria-hidden="true">
        @for (line of lines; track line.cls) {
          <path [attr.d]="line.d" [class]="line.cls" />
        }
        @for (s of stations; track $index) {
          <circle [attr.cx]="s[0]" [attr.cy]="s[1]" r="5" class="station" />
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
        </div>
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
      @for (section of cv().sections; track section.id; let i = $index) {
        <section class="section" [attr.data-line]="i % 4">
          <h2>{{ sectionTitle(section) }}</h2>
          <div class="track">
            @switch (section.kind) {
              @case ('skills') {
                @for (group of skills(section); track group.id) {
                  <div class="stop skill-row">
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
                @for (item of languages(section); track item.id) {
                  <div class="stop language">
                    <span>{{ languageLabel(item) }}</span>
                    @if (languageLevel(item); as level) {
                      <span class="meter" aria-hidden="true">
                        @for (step of levelSteps; track step) {
                          <span class="step" [class.on]="step <= level"></span>
                        }
                      </span>
                    }
                  </div>
                }
              }
              @case ('interests') {
                <div class="stop">
                  <ul class="chips">
                    @for (item of interests(section); track item.id) {
                      <li>{{ item.label }}</li>
                    }
                  </ul>
                </div>
              }
              @default {
                @for (entry of entries(section); track entry.id) {
                  <div class="stop entry">
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
          </div>
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
      padding: calc(46px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
      background: #fff;
      color: #1b1d22;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --l0: var(--cv-accent);
      --l1: oklch(from var(--cv-accent) 0.65 0.17 calc(h + 90));
      --l2: oklch(from var(--cv-accent) 0.6 0.17 calc(h + 190));
      --l3: oklch(from var(--cv-accent) 0.7 0.16 calc(h - 70));
    }
    .map {
      position: absolute;
      z-index: -1;
      top: 30px;
      right: 40px;
      width: 300px;
      height: 130px;
      fill: none;
      stroke-width: 7;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .l0 {
      stroke: var(--l0);
    }
    .l1 {
      stroke: var(--l1);
    }
    .l2 {
      stroke: var(--l2);
    }
    .station {
      fill: #fff;
      stroke: #1b1d22;
      stroke-width: 2.5;
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(20px * var(--cv-space, 1)) 22px;
      padding-right: 300px;
    }
    .photo {
      width: 104px;
      height: 104px;
      flex-shrink: 0;
      border: 4px solid #1b1d22;
      border-radius: 9999px;
      object-fit: cover;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Inter Variable', sans-serif);
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      display: inline-block;
      margin-top: calc(8px * var(--cv-space, 1));
      padding: 2px 12px;
      border-radius: 9999px;
      background: #1b1d22;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 8px;
      margin-top: calc(18px * var(--cv-space, 1));
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 1px 10px 1px 6px;
      border: 2px solid #e4e6eb;
      border-radius: 9999px;
      font-size: 10.5px;
      font-weight: 500;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      color: var(--l0);
    }
    .qr-row {
      margin-top: calc(10px * var(--cv-space, 1));
    }
    .qr {
      width: 62px;
      height: 62px;
      color: #1b1d22;
    }
    .summary {
      margin-top: calc(16px * var(--cv-space, 1));
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      --line: var(--l0);
      margin-top: calc(18px * var(--cv-space, 1));
    }
    .section[data-line='1'] {
      --line: var(--l1);
    }
    .section[data-line='2'] {
      --line: var(--l2);
    }
    .section[data-line='3'] {
      --line: var(--l3);
    }
    h2 {
      display: inline-block;
      margin-bottom: calc(6px * var(--cv-space, 1));
      padding: 2px 14px;
      border-radius: 9999px;
      background: var(--line);
      color: #fff;
      font-family: var(--cv-heading-font, 'Inter Variable', sans-serif);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    /* La ligne : un trait épais arrondi sous le titre, le long duquel s'arrêtent les stations. */
    .track {
      padding: calc(6px * var(--cv-space, 1)) 0 0 26px;
      background: linear-gradient(var(--line), var(--line)) 8px 0 / 7px 100% no-repeat;
      border-radius: 4px;
    }
    .stop + .stop {
      margin-top: calc(10px * var(--cv-space, 1));
    }
    .stop::before {
      content: '';
      float: left;
      width: 9px;
      height: 9px;
      margin: 5px 0 0 -24px;
      border: 2.5px solid #1b1d22;
      border-radius: 9999px;
      background: #fff;
    }
    .entry {
      break-inside: avoid;
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
      color: var(--line);
      font-size: 11px;
      font-weight: 700;
    }
    .org {
      color: #4d515a;
      font-weight: 500;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--line);
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
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
      border: 2px solid var(--line);
      font-size: 10.5px;
      font-weight: 600;
    }
    .language {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 420px;
    }
    .meter {
      display: flex;
      gap: 4px;
    }
    .step {
      width: 11px;
      height: 11px;
      border: 2px solid var(--line);
      border-radius: 9999px;
      background: #fff;
    }
    .step.on {
      background: var(--line);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvMetro extends CvTemplateBase {
  protected readonly lines = LINES;
  protected readonly stations = STATIONS;
}
