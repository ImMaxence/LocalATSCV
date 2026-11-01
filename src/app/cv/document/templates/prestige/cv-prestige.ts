import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Prestige : papier ivoire, double cadre fin, ornements en losange, Cormorant Garamond pour le
 * nom et les titres. En-tête et titres centrés (lignes centrées, sans risque de colonnes),
 * contenu aligné à gauche.
 */
@Component({
  selector: 'app-cv-prestige',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="frame" aria-hidden="true"></div>
      @if (qr(); as code) {
        <div class="qr">
          <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
        </div>
      }
      <header>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
        <svg class="ornament" viewBox="0 0 160 14" aria-hidden="true">
          <line x1="0" y1="7" x2="62" y2="7" />
          <line x1="98" y1="7" x2="160" y2="7" />
          <path d="M80 1 L86 7 L80 13 L74 7 Z" />
          <path class="hollow" d="M68 4 L71 7 L68 10 L65 7 Z" />
          <path class="hollow" d="M92 4 L95 7 L92 10 L89 7 Z" />
        </svg>
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
                <p class="skill">
                  @if (group.label.trim()) {
                    <span class="skill-label">{{ group.label }}</span>
                  }
                  {{ keywords(group).join(' · ') }}
                </p>
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
              <p>{{ interestLine(interests(section)) }}</p>
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
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      padding: calc(46px * var(--cv-space, 1)) 66px calc(44px * var(--cv-space, 1));
      background: #fbf8f1;
      color: #2a2723;
      font-family: var(--cv-body-font, 'Montserrat Variable', sans-serif);
      font-size: 11px;
      line-height: calc(1.6 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --serif: 'Cormorant Garamond Variable', serif;
      --soft: color-mix(in oklab, var(--cv-accent) 55%, #fbf8f1);
    }
    .frame {
      position: absolute;
      inset: 18px;
      border: 1px solid var(--soft);
      pointer-events: none;
    }
    .frame::after {
      content: '';
      position: absolute;
      inset: 4px;
      border: 1px solid var(--soft);
    }
    .qr {
      position: absolute;
      top: 40px;
      right: 42px;
      padding: calc(5px * var(--cv-space, 1)) 5px;
      border: 1px solid var(--soft);
      background: #fff;
    }
    .qr-code {
      width: 58px;
      height: 58px;
      color: #2a2723;
    }
    header {
      text-align: center;
    }
    .photo {
      display: block;
      width: 104px;
      height: 104px;
      margin: 0 auto calc(14px * var(--cv-space, 1));
      border-radius: 9999px;
      object-fit: cover;
      box-shadow:
        0 0 0 4px #fbf8f1,
        0 0 0 5px var(--cv-accent);
    }
    .ornament {
      display: block;
      width: 160px;
      height: 14px;
      margin: 0 auto calc(10px * var(--cv-space, 1));
      fill: var(--cv-accent);
      stroke: var(--cv-accent);
      stroke-width: 1;
    }
    .ornament .hollow {
      fill: none;
    }
    .name {
      font-family: var(--cv-heading-font, var(--serif));
      font-size: 42px;
      font-weight: 600;
      line-height: calc(1.05 * var(--cv-leading, 1));
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .headline {
      margin-top: calc(4px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, var(--serif));
      font-size: 20px;
      font-style: italic;
      font-weight: 500;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: calc(3px * var(--cv-space, 1)) 0;
      margin-top: calc(12px * var(--cv-space, 1));
      font-size: 10.5px;
    }
    .contact > li {
      display: flex;
      align-items: center;
    }
    .contact > li + li::before {
      content: '';
      width: 4px;
      height: 4px;
      margin: 0 11px;
      background: var(--cv-accent);
      transform: rotate(45deg);
    }
    .summary {
      max-width: 580px;
      margin: calc(18px * var(--cv-space, 1)) auto 0;
      font-family: var(--cv-heading-font, var(--serif));
      font-size: 15px;
      font-style: italic;
      line-height: calc(1.45 * var(--cv-leading, 1));
      text-align: center;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(16px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(16px * var(--cv-space, 1)) 16px;
      margin-bottom: calc(10px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, var(--serif));
      font-size: 19px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    h2::before,
    h2::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--soft);
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
      font-family: var(--cv-heading-font, var(--serif));
      font-size: 17px;
      font-weight: 700;
      line-height: calc(1.3 * var(--cv-leading, 1));
    }
    .dates {
      flex-shrink: 0;
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, var(--serif));
      font-size: 14.5px;
      font-style: italic;
      font-weight: 500;
    }
    .org {
      color: #6b6458;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .bullets {
      margin-top: calc(4px * var(--cv-space, 1));
      padding-left: 15px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--cv-accent);
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill + .skill {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .skill-label {
      margin-right: 6px;
      font-family: var(--cv-heading-font, var(--serif));
      font-size: 14.5px;
      font-style: italic;
      font-weight: 700;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
      max-width: 400px;
    }
    .languages > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: calc(6px * var(--cv-space, 1)) 6px;
    }
    .step {
      width: 6px;
      height: 6px;
      border: 1px solid var(--cv-accent);
      transform: rotate(45deg);
    }
    .step.on {
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvPrestige extends CvTemplateBase {}
