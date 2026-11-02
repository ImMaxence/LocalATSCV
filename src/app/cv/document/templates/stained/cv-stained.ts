import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Panneau de vitrail (dessin vectoriel sans texte) : polygones de verre sertis de plomb. */
const PANES = [
  { d: 'M0 0 H160 L120 90 H0 Z', tone: 0 },
  { d: 'M160 0 H330 L290 60 L120 90 Z', tone: 1 },
  { d: 'M330 0 H520 L470 70 L290 60 Z', tone: 2 },
  { d: 'M520 0 H700 L700 50 L470 70 Z', tone: 3 },
  { d: 'M700 0 H800 V90 H700 Z', tone: 1 },
  { d: 'M0 90 H120 L160 150 H0 Z', tone: 2 },
  { d: 'M120 90 L290 60 L330 150 H160 Z', tone: 3 },
  { d: 'M290 60 L470 70 L500 150 H330 Z', tone: 0 },
  { d: 'M470 70 L700 50 L680 150 H500 Z', tone: 1 },
  { d: 'M700 50 H800 V150 H680 Z', tone: 2 },
];

/**
 * Vitrail : panneau de verres colorés sertis de plomb en tête de page (teintes dérivées de
 * l'accent), filets plomb, triangles de verre devant les titres, Cormorant. Une seule colonne.
 */
@Component({
  selector: 'app-cv-stained',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <svg class="window" viewBox="0 0 800 150" preserveAspectRatio="none" aria-hidden="true">
        @for (pane of panes; track $index) {
          <path [attr.d]="pane.d" [attr.class]="'pane t' + pane.tone" />
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
                  <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="1.75" />
                  <span>{{ item.text }}</span>
                </li>
              }
            </ul>
          }
        </div>
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
      @for (section of cv().sections; track section.id; let i = $index) {
        <section class="section" [attr.data-tone]="i % 4">
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
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      padding: 0 56px calc(46px * var(--cv-space, 1));
      background: #fcfbf8;
      color: #26232a;
      font-family: var(--cv-body-font, 'Lora Variable', serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --lead: #2c2a33;
      --g0: oklch(from var(--cv-accent) 0.62 0.18 h);
      --g1: oklch(from var(--cv-accent) 0.7 0.16 calc(h + 60));
      --g2: oklch(from var(--cv-accent) 0.58 0.17 calc(h + 150));
      --g3: oklch(from var(--cv-accent) 0.75 0.15 calc(h - 50));
    }
    .window {
      display: block;
      width: calc(100% + 112px);
      height: 120px;
      margin: 0 -56px;
      stroke: var(--lead);
      stroke-width: 5;
      stroke-linejoin: round;
    }
    .pane {
      fill-opacity: 0.85;
    }
    .t0 {
      fill: var(--g0);
    }
    .t1 {
      fill: var(--g1);
    }
    .t2 {
      fill: var(--g2);
    }
    .t3 {
      fill: var(--g3);
    }
    header {
      display: flex;
      align-items: flex-end;
      gap: calc(22px * var(--cv-space, 1)) 24px;
      margin-top: calc(-30px * var(--cv-space, 1));
    }
    .photo {
      width: 118px;
      height: 118px;
      flex-shrink: 0;
      border: 5px solid var(--lead);
      border-radius: 9999px;
      object-fit: cover;
      background: #fff;
    }
    .identity {
      min-width: 0;
      flex: 1;
      padding-top: calc(40px * var(--cv-space, 1));
    }
    .name {
      color: var(--lead);
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 40px;
      font-weight: 700;
      line-height: calc(1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--g0);
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 18px;
      font-style: italic;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(10px * var(--cv-space, 1));
      color: #55505c;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      color: var(--lead);
    }
    .qr {
      width: 64px;
      height: 64px;
      flex-shrink: 0;
      padding: 4px;
      border: 3px solid var(--lead);
      background: #fff;
      color: var(--lead);
    }
    .summary {
      margin-top: calc(18px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 0;
      border-top: 3px solid var(--lead);
      border-bottom: 3px solid var(--lead);
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      --glass: var(--g0);
      margin-top: calc(18px * var(--cv-space, 1));
    }
    .section[data-tone='1'] {
      --glass: var(--g1);
    }
    .section[data-tone='2'] {
      --glass: var(--g2);
    }
    .section[data-tone='3'] {
      --glass: var(--g3);
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      color: var(--lead);
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 21px;
      font-weight: 700;
    }
    /* Éclat de verre serti : losange coloré au contour plomb. */
    h2::before {
      content: '';
      width: 13px;
      height: 13px;
      background: var(--glass);
      box-shadow: inset 0 0 0 2.5px var(--lead);
      transform: rotate(45deg);
    }
    h2::after {
      content: '';
      flex: 1;
      height: 3px;
      background: var(--lead);
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
      padding: 0 8px;
      background: var(--glass);
      color: #fff;
      font-size: 10.5px;
      font-weight: 600;
    }
    .org {
      color: #55505c;
      font-style: italic;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: square;
    }
    .bullets > li::marker {
      color: var(--glass);
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
      padding: 1px 9px;
      border: 2px solid var(--lead);
      background: oklch(from var(--glass) 0.93 0.05 h);
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
      gap: 3px;
    }
    .step {
      width: 13px;
      height: 10px;
      border: 2px solid var(--lead);
      background: #fff;
    }
    .step.on {
      background: var(--glass);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvStained extends CvTemplateBase {
  protected readonly panes = PANES;
}
