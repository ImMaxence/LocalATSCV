import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

const HEX = 'M30 2 L56 17 L56 47 L30 62 L4 47 L4 17 Z';

/**
 * Hexa : motif hexagonal. Photo découpée en hexagone, nid d'abeilles dans l'angle, hexagones
 * devant les titres. Seule la photo est découpée : le texte n'a ni masque ni calque.
 */
@Component({
  selector: 'app-cv-hexa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <svg class="honeycomb" viewBox="0 0 240 230" aria-hidden="true">
        @for (cell of honeycomb; track $index) {
          <path [attr.d]="hex" [attr.transform]="cell.transform" [class.filled]="cell.filled" />
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

      @if (contactItems().length || qr()) {
        <div class="contact-row">
          <ul class="contact">
            @for (item of contactItems(); track $index) {
              <li>
                <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2" />
                <span>{{ item.text }}</span>
              </li>
            }
          </ul>
          @if (qr(); as code) {
            <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
          }
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
          <h2>
            <svg class="mark" viewBox="0 0 60 64" aria-hidden="true"><path [attr.d]="hex" /></svg>
            {{ sectionTitle(section) }}
          </h2>
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
                          <svg class="step" [class.on]="step <= level" viewBox="0 0 60 64">
                            <path [attr.d]="hex" />
                          </svg>
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
      padding: calc(44px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
      background: #fff;
      color: #1b1f27;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 12px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --soft: color-mix(in oklab, var(--cv-accent) 14%, white);
      --deep: oklch(from var(--cv-accent) 0.34 0.08 h);
    }
    .honeycomb {
      position: absolute;
      z-index: -1;
      top: -24px;
      right: -30px;
      width: 260px;
      fill: none;
      stroke: color-mix(in oklab, var(--cv-accent) 35%, white);
      stroke-width: 2;
    }
    .honeycomb .filled {
      fill: var(--soft);
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(24px * var(--cv-space, 1)) 24px;
      padding-right: 150px;
    }
    /* Seule l'image est découpée en hexagone. */
    .photo {
      width: 116px;
      height: 124px;
      flex-shrink: 0;
      object-fit: cover;
      clip-path: polygon(50% 0, 100% 24%, 100% 76%, 50% 100%, 0 76%, 0 24%);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: var(--deep);
      font-family: var(--cv-heading-font, 'Space Grotesk Variable', sans-serif);
      font-size: 38px;
      font-weight: 700;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-size: 15px;
      font-weight: 600;
    }
    .contact-row {
      display: flex;
      align-items: center;
      gap: calc(18px * var(--cv-space, 1)) 18px;
      margin-top: calc(20px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 14px;
      border-radius: 12px;
      background: var(--soft);
    }
    .contact {
      display: flex;
      min-width: 0;
      flex: 1;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 18px;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(6px * var(--cv-space, 1)) 6px;
    }
    .contact-icon {
      width: 14px;
      height: 14px;
      color: var(--deep);
    }
    .qr-code {
      width: 58px;
      height: 58px;
      flex-shrink: 0;
      color: #1b1f27;
    }
    .summary {
      margin-top: calc(14px * var(--cv-space, 1));
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(9px * var(--cv-space, 1)) 9px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      color: var(--deep);
      font-family: var(--cv-heading-font, 'Space Grotesk Variable', sans-serif);
      font-size: 17px;
      font-weight: 700;
    }
    .mark {
      width: 18px;
      height: 19px;
      flex-shrink: 0;
      fill: var(--cv-accent);
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
      font-size: 13.5px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      padding: calc(1px * var(--cv-space, 1)) 9px;
      border-radius: 6px;
      background: var(--soft);
      color: var(--deep);
      font-size: 11px;
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
      color: var(--cv-accent);
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
      padding: calc(1px * var(--cv-space, 1)) 10px;
      border-radius: 6px;
      background: var(--soft);
      font-size: 11.5px;
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
      width: 12px;
      height: 13px;
      fill: #e3e6ec;
    }
    .step.on {
      fill: var(--cv-accent);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvHexa extends CvTemplateBase {
  protected readonly hex = HEX;
  /** Nid d'abeilles du coin supérieur droit : quelques cellules pleines. */
  protected readonly honeycomb = [
    [0, 0, false],
    [1, 0, true],
    [2, 0, false],
    [0, 1, true],
    [1, 1, false],
    [2, 1, false],
    [1, 2, false],
    [2, 2, true],
  ].map(([column, row, filled]) => ({
    transform: `translate(${60 + (column as number) * 56 + ((row as number) % 2) * 28} ${(row as number) * 48})`,
    filled: filled as boolean,
  }));
}
