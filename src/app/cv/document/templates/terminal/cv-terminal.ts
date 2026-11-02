import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Terminal : fenêtre de console sombre, chasse fixe, invite de commande devant chaque titre,
 * compétences en étiquettes et niveaux de langue en barres de blocs. Les invites (curseur,
 * chevrons) sont dessinées en CSS, sans caractère généré : rien ne s'ajoute au texte lu par un ATS.
 */
@Component({
  selector: 'app-cv-terminal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="titlebar" aria-hidden="true">
        <span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span>
      </div>
      <header>
        <div class="identity">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
          @if (contact().length) {
            <ul class="contact">
              @for (item of contact(); track $index) {
                <li>{{ item }}</li>
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
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      padding: 0 0 calc(40px * var(--cv-space, 1));
      background: #11141a;
      color: #d7dce5;
      font-family: var(--cv-body-font, 'JetBrains Mono Variable', monospace);
      font-size: 11px;
      line-height: calc(1.55 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --glow: oklch(from var(--cv-accent) 0.78 0.16 h);
      --dim: oklch(from var(--cv-accent) 0.78 0.16 h / 0.14);
    }
    .titlebar {
      display: flex;
      gap: 8px;
      padding: 14px 20px;
      border-bottom: 1px solid #262b35;
      background: #1a1e27;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 9999px;
    }
    .dot-r {
      background: #ff5f57;
    }
    .dot-y {
      background: #febc2e;
    }
    .dot-g {
      background: #28c840;
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(20px * var(--cv-space, 1)) 24px;
      padding: calc(32px * var(--cv-space, 1)) 48px 0;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: #fff;
      font-family: var(--cv-heading-font, 'JetBrains Mono Variable', monospace);
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: calc(1.1 * var(--cv-leading, 1));
    }
    .name::before {
      content: '';
      display: inline-block;
      width: 14px;
      height: 26px;
      margin-right: 12px;
      vertical-align: -3px;
      border-radius: 2px;
      background: var(--glow);
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--glow);
      font-size: 14px;
      font-weight: 600;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(2px * var(--cv-space, 1)) 18px;
      margin-top: calc(12px * var(--cv-space, 1));
      color: #9aa3b2;
    }
    .contact > li::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 7px;
      vertical-align: 1px;
      border-radius: 1px;
      background: #5c6676;
    }
    .photo {
      width: 108px;
      height: 108px;
      flex-shrink: 0;
      border: 2px solid var(--glow);
      border-radius: 8px;
      object-fit: cover;
      box-shadow: 0 0 0 4px var(--dim);
    }
    .qr {
      width: 92px;
      height: 92px;
      flex-shrink: 0;
      padding: 6px;
      border-radius: 6px;
      background: #fff;
      color: #11141a;
    }
    .summary {
      margin: calc(18px * var(--cv-space, 1)) 48px 0;
      padding: calc(10px * var(--cv-space, 1)) 14px;
      border-left: 3px solid var(--glow);
      background: #171b23;
      color: #c3cad6;
      white-space: pre-line;
    }
    .section {
      margin: calc(18px * var(--cv-space, 1)) 48px 0;
    }
    h2 {
      margin-bottom: calc(8px * var(--cv-space, 1));
      color: #fff;
      font-family: var(--cv-heading-font, 'JetBrains Mono Variable', monospace);
      font-size: 14px;
      font-weight: 700;
      text-transform: lowercase;
    }
    h2::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 10px;
      vertical-align: 1px;
      border-top: 2.5px solid var(--glow);
      border-right: 2.5px solid var(--glow);
      transform: rotate(45deg);
    }
    h2::after {
      content: '';
      display: block;
      height: 1px;
      margin-top: calc(6px * var(--cv-space, 1));
      background: linear-gradient(90deg, var(--glow), #262b35 50%, transparent);
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
      color: #fff;
      font-size: 12.5px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: var(--glow);
      font-size: 10.5px;
    }
    .org {
      color: #9aa3b2;
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
      color: #fff;
      font-weight: 700;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 6px;
    }
    .chips > li {
      padding: 0 7px;
      border: 1px solid #343a47;
      border-radius: 4px;
      background: #171b23;
      color: #e3e8f0;
      font-size: 10.5px;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: 3px;
    }
    .step {
      width: 14px;
      height: 9px;
      background: #262b35;
    }
    .step.on {
      background: var(--glow);
    }
    .letter {
      margin: calc(22px * var(--cv-space, 1)) 48px 0;
    }
  `,
})
export class CvTerminal extends CvTemplateBase {}
