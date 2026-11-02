import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Mosaïque : bandeau composé de carreaux dans les teintes de l'accent, petit damier devant
 * chaque titre, étiquettes carrées. Une seule colonne, photo carrée.
 */
@Component({
  selector: 'app-cv-mosaic',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="tiles" aria-hidden="true"></div>
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
      padding: calc(46px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
      background: #fff;
      color: #1f2326;
      font-family: var(--cv-body-font, 'Archivo Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --t1: oklch(from var(--cv-accent) 0.88 0.07 h);
      --t2: oklch(from var(--cv-accent) 0.78 0.12 h);
      --t3: oklch(from var(--cv-accent) 0.6 0.15 h);
      --t4: oklch(from var(--cv-accent) 0.42 0.12 h);
      --tile: 28px;
    }
    .tiles {
      position: absolute;
      z-index: -1;
      inset: 0 0 auto;
      height: 168px;
      background-color: var(--t2);
      background-image:
        linear-gradient(90deg, var(--t4) 0 25%, transparent 25% 50%, var(--t1) 50% 75%, transparent 75%),
        linear-gradient(0deg, var(--t3) 0 25%, transparent 25% 50%, var(--t4) 50% 75%, transparent 75%),
        linear-gradient(90deg, transparent 0 50%, var(--t3) 50%);
      background-size:
        calc(var(--tile) * 4) calc(var(--tile) * 4),
        calc(var(--tile) * 4) calc(var(--tile) * 4),
        calc(var(--tile) * 2) calc(var(--tile) * 2);
      background-blend-mode: normal;
    }
    .tiles::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(#fff 1.5px, transparent 1.5px),
        linear-gradient(90deg, #fff 1.5px, transparent 1.5px);
      background-size: var(--tile) var(--tile);
    }
    header {
      display: flex;
      align-items: flex-end;
      gap: calc(20px * var(--cv-space, 1)) 24px;
      padding-top: calc(78px * var(--cv-space, 1));
    }
    .identity {
      min-width: 0;
      flex: 1;
      padding: calc(14px * var(--cv-space, 1)) 20px 0 0;
      background: #fff;
    }
    .name {
      color: var(--t4);
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(5px * var(--cv-space, 1));
      color: var(--t3);
      font-size: 15px;
      font-weight: 600;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(10px * var(--cv-space, 1));
      color: #4b5156;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--t3);
    }
    .photo {
      width: 140px;
      height: 140px;
      flex-shrink: 0;
      border: 6px solid #fff;
      object-fit: cover;
      box-shadow: 0 8px 20px -10px rgb(0 0 0 / 0.4);
    }
    .qr {
      width: 76px;
      height: 76px;
      flex-shrink: 0;
      padding: 6px;
      border: 6px solid #fff;
      background: #fff;
      color: var(--t4);
      box-shadow: 0 8px 20px -10px rgb(0 0 0 / 0.4);
    }
    .summary {
      margin-top: calc(18px * var(--cv-space, 1));
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
      color: var(--t4);
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    h2::before {
      content: '';
      width: 16px;
      height: 16px;
      background:
        linear-gradient(90deg, var(--t4) 50%, var(--t2) 50%) 0 0 / 100% 50% no-repeat,
        linear-gradient(90deg, var(--t2) 50%, var(--t4) 50%) 0 100% / 100% 50% no-repeat;
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
      background: var(--t1);
      color: var(--t4);
      font-size: 10.5px;
      font-weight: 700;
    }
    .org {
      color: var(--t3);
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: square;
    }
    .bullets > li::marker {
      color: var(--t3);
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
      gap: calc(4px * var(--cv-space, 1)) 4px;
    }
    .chips > li {
      padding: 1px 9px;
      background: var(--t1);
      color: var(--t4);
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
      gap: 3px;
    }
    .step {
      width: 12px;
      height: 12px;
      background: var(--t1);
    }
    .step.on {
      background: var(--t3);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvMosaic extends CvTemplateBase {}
