import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Kraft : papier kraft brun, étiquettes blanches, titres tamponnés dans un cadre pointillé
 * (encre dérivée de l'accent), ficelle en pointillés. Artisanal, une seule colonne.
 */
@Component({
  selector: 'app-cv-kraft',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="label">
        <span class="hole" aria-hidden="true"></span>
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
        <app-cv-letter class="letter label" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id) {
        <section class="section label">
          <h2><span class="stamp">{{ sectionTitle(section) }}</span></h2>
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
      padding: calc(38px * var(--cv-space, 1)) 46px calc(42px * var(--cv-space, 1));
      /* Fibres du kraft : fines rayures claires et sombres très atténuées. */
      background:
        repeating-linear-gradient(100deg, rgb(255 255 255 / 0.06) 0 2px, transparent 2px 9px),
        repeating-linear-gradient(80deg, rgb(0 0 0 / 0.04) 0 1px, transparent 1px 7px),
        #c9a97e;
      color: #2b2117;
      font-family: var(--cv-body-font, 'Lora Variable', serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --ink: oklch(from var(--cv-accent) 0.42 0.13 h);
      --ink-soft: oklch(from var(--cv-accent) 0.42 0.13 h / 0.12);
    }
    .label {
      padding: calc(14px * var(--cv-space, 1)) 20px calc(14px * var(--cv-space, 1));
      border-radius: 4px;
      background: #fbf7ef;
      box-shadow:
        0 1px 2px rgb(60 35 10 / 0.25),
        0 8px 18px -12px rgb(60 35 10 / 0.6);
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(18px * var(--cv-space, 1)) 20px;
      padding-left: 34px;
    }
    .hole {
      display: block;
      width: 14px;
      height: 14px;
      margin-left: -26px;
      border: 2px solid #b8b0a2;
      border-radius: 9999px;
      background: #c9a97e;
      flex-shrink: 0;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: #2b2117;
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.01em;
      line-height: calc(1.05 * var(--cv-leading, 1));
      text-transform: uppercase;
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--ink);
      font-size: 15px;
      font-style: italic;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 14px;
      margin-top: calc(10px * var(--cv-space, 1));
      color: #5a4b3b;
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
      width: 108px;
      height: 108px;
      flex-shrink: 0;
      border: 4px solid #fff;
      object-fit: cover;
      filter: sepia(0.25);
      box-shadow: 0 2px 6px rgb(60 35 10 / 0.3);
    }
    .qr {
      width: 90px;
      height: 90px;
      flex-shrink: 0;
      padding: 6px;
      background: #fff;
      color: #2b2117;
      box-shadow: 0 2px 6px rgb(60 35 10 / 0.3);
    }
    .summary {
      margin-top: calc(16px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 16px;
      border: 1.5px dashed #fbf7ef;
      border-radius: 4px;
      color: #fbf7ef;
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(16px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(10px * var(--cv-space, 1));
    }
    .stamp {
      display: inline-block;
      padding: 2px 10px;
      border: 2px dashed var(--ink);
      border-radius: 4px;
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: var(--ink-soft);
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(10px * var(--cv-space, 1));
      padding-top: calc(10px * var(--cv-space, 1));
      border-top: 1px dotted #b8a894;
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
    }
    h3 {
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 12.5px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: #7a6a58;
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
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: 1px 9px;
      border: 1px solid #c9a97e;
      border-radius: 3px;
      background: #fff;
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
      width: 10px;
      height: 10px;
      border: 1.5px dashed var(--ink);
      border-radius: 9999px;
    }
    .step.on {
      background: var(--ink);
      border-style: solid;
    }
    .letter {
      margin-top: calc(16px * var(--cv-space, 1));
    }
  `,
})
export class CvKraft extends CvTemplateBase {}
