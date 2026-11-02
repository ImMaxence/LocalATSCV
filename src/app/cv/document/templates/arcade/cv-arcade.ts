import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Arcade : esprit jeu vidéo 8 bits, bandeau à marches pixelisées, titres soulignés de blocs,
 * jauges de langue en cases, cadres à coins crantés. Chasse fixe, une seule colonne.
 */
@Component({
  selector: 'app-cv-arcade',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="banner">
        <header>
          <div class="identity">
            @if (fullName()) {
              <h1 class="name">{{ fullName() }}</h1>
            }
            @if (cv().profile.title.trim()) {
              <p class="headline">{{ cv().profile.title }}</p>
            }
          </div>
          @if (photoUrl()) {
            <img class="photo" [src]="photoUrl()" alt="" />
          } @else if (qr(); as code) {
            <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
          }
        </header>
      </div>
      <div class="steps" aria-hidden="true"></div>

      <div class="body">
        @if (contact().length) {
          <ul class="contact">
            @for (item of contact(); track $index) {
              <li>{{ item }}</li>
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
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      padding-bottom: calc(40px * var(--cv-space, 1));
      background: #f7f7fb;
      color: #1b1b2a;
      font-family: var(--cv-body-font, 'JetBrains Mono Variable', monospace);
      font-size: 11px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --dark: #1b1b2a;
      --light: oklch(from var(--cv-accent) 0.9 0.07 h);
      --px: 6px;
    }
    .banner {
      padding: calc(36px * var(--cv-space, 1)) 48px calc(22px * var(--cv-space, 1));
      background: var(--cv-accent);
      color: #fff;
    }
    .steps {
      height: calc(var(--px) * 3);
      background:
        linear-gradient(var(--cv-accent), var(--cv-accent)) 0 0 / 100% var(--px) no-repeat,
        repeating-linear-gradient(90deg, var(--cv-accent) 0 var(--px), transparent var(--px) calc(var(--px) * 2)) 0 var(--px) / 100% var(--px) no-repeat,
        repeating-linear-gradient(90deg, var(--cv-accent) 0 var(--px), transparent var(--px) calc(var(--px) * 4)) var(--px) calc(var(--px) * 2) / 100% var(--px) no-repeat;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(20px * var(--cv-space, 1)) 24px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'JetBrains Mono Variable', monospace);
      font-size: 30px;
      font-weight: 800;
      line-height: calc(1.1 * var(--cv-leading, 1));
      text-transform: uppercase;
    }
    .headline {
      display: inline-block;
      margin-top: calc(10px * var(--cv-space, 1));
      padding: 2px 10px;
      background: var(--dark);
      font-size: 13px;
      font-weight: 700;
    }
    .photo {
      width: 112px;
      height: 112px;
      flex-shrink: 0;
      border: var(--px) solid var(--dark);
      object-fit: cover;
      image-rendering: auto;
    }
    .qr {
      width: 96px;
      height: 96px;
      flex-shrink: 0;
      padding: 6px;
      border: var(--px) solid var(--dark);
      background: #fff;
      color: var(--dark);
    }
    .body {
      padding: calc(18px * var(--cv-space, 1)) 48px 0;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 8px;
    }
    .contact > li {
      padding: 1px 8px;
      border: 2px solid var(--dark);
      background: #fff;
      box-shadow: 3px 3px 0 var(--dark);
      font-size: 10.5px;
    }
    .summary {
      margin-top: calc(16px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 14px;
      border: 2px solid var(--dark);
      background: #fff;
      box-shadow: 4px 4px 0 var(--cv-accent);
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      display: inline-block;
      margin-bottom: calc(10px * var(--cv-space, 1));
      padding-bottom: 2px;
      color: var(--dark);
      font-family: var(--cv-heading-font, 'JetBrains Mono Variable', monospace);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: repeating-linear-gradient(90deg, var(--cv-accent) 0 var(--px), transparent var(--px) calc(var(--px) * 2)) 0 100% / 100% 4px no-repeat;
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
      font-weight: 800;
    }
    .dates {
      flex-shrink: 0;
      padding: 0 6px;
      background: var(--light);
      color: var(--dark);
      font-size: 10.5px;
      font-weight: 700;
    }
    .org {
      color: var(--cv-accent);
      font-weight: 700;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: square;
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
      font-weight: 800;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 6px;
    }
    .chips > li {
      padding: 0 7px;
      border: 2px solid var(--dark);
      background: #fff;
      font-size: 10.5px;
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
      padding: 2px;
      border: 2px solid var(--dark);
      background: #fff;
    }
    .step {
      width: 12px;
      height: 8px;
      background: var(--light);
    }
    .step.on {
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(20px * var(--cv-space, 1));
      padding: calc(18px * var(--cv-space, 1)) 20px;
      border: 2px solid var(--dark);
      background: #fff;
    }
  `,
})
export class CvArcade extends CvTemplateBase {}
