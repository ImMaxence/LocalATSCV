import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Cahier : page de cahier à lignes avec marge rouge et perforations, titres surlignés au
 * marqueur dans la couleur d'accent, résumé sur un post-it. Une seule colonne.
 */
@Component({
  selector: 'app-cv-notebook',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="holes" aria-hidden="true"></div>
      <div class="page">
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
            <h2><span class="mark">{{ sectionTitle(section) }}</span></h2>
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
      display: flex;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      /* Lignes toutes les 24 px, marge rouge à 80 px. */
      background:
        linear-gradient(90deg, transparent 78px, #e8a0a0 78px, #e8a0a0 80px, transparent 80px),
        repeating-linear-gradient(180deg, transparent 0 23px, #cfdcec 23px 24px),
        #fffefb;
      color: #26303a;
      font-family: var(--cv-body-font, 'Lora Variable', serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --mark: oklch(from var(--cv-accent) 0.85 0.12 h / 0.75);
      --ink: oklch(from var(--cv-accent) 0.4 0.12 h);
    }
    .holes {
      position: absolute;
      z-index: -1;
      top: 60px;
      bottom: 60px;
      left: 28px;
      width: 18px;
      background: radial-gradient(circle, #e6e2d8 7px, #cfcabd 7.5px, transparent 8.5px) 0 0 / 18px
        140px repeat-y;
    }
    .page {
      flex: 1;
      min-width: 0;
      padding: calc(44px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1)) 100px;
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(24px * var(--cv-space, 1)) 26px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 42px;
      font-weight: 700;
      font-style: italic;
      line-height: calc(1 * var(--cv-leading, 1));
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
      color: #4f5a64;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      color: var(--ink);
    }
    .photo {
      width: 110px;
      height: 130px;
      flex-shrink: 0;
      border: 6px solid #fff;
      object-fit: cover;
      box-shadow: 0 2px 8px rgb(0 0 0 / 0.18);
    }
    .qr {
      width: 92px;
      height: 92px;
      flex-shrink: 0;
      padding: 6px;
      background: #fff;
      color: #26303a;
      box-shadow: 0 2px 8px rgb(0 0 0 / 0.18);
    }
    .summary {
      width: fit-content;
      max-width: 100%;
      margin-top: calc(20px * var(--cv-space, 1));
      padding: calc(12px * var(--cv-space, 1)) 18px;
      background: #fff6b3;
      font-size: 12.5px;
      white-space: pre-line;
      box-shadow: 0 4px 10px -4px rgb(0 0 0 / 0.25);
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(8px * var(--cv-space, 1));
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Cormorant Garamond Variable', serif);
      font-size: 22px;
      font-weight: 700;
    }
    .mark {
      padding: 0 6px;
      background: linear-gradient(transparent 35%, var(--mark) 35%, var(--mark) 92%, transparent 92%);
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
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
      color: #6d7883;
      font-size: 11px;
      font-style: italic;
    }
    .org {
      color: var(--ink);
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
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
      border-bottom: 2px solid var(--cv-accent);
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
      gap: 4px;
    }
    .step {
      width: 11px;
      height: 11px;
      border: 1.5px solid var(--ink);
      border-radius: 2px;
    }
    .step.on {
      background: var(--mark);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvNotebook extends CvTemplateBase {}
