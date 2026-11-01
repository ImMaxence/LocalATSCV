import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Brutal : néo-brutalisme. Contours noirs épais, ombres portées franches, aplats vifs tirés de la
 * couleur d'accent et étiquettes noires. Les cartes s'empilent sur une seule colonne : l'ordre de
 * lecture reste celui du document.
 */
@Component({
  selector: 'app-cv-brutal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="hero">
        <svg class="burst" viewBox="0 0 100 100" aria-hidden="true">
          <path
            d="M50 2 L58 30 L84 16 L70 42 L98 50 L70 58 L84 84 L58 70 L50 98 L42 70 L16 84 L30 58 L2 50 L30 42 L16 16 L42 30 Z"
          />
        </svg>
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
        @if (qr(); as code) {
          <div class="qr">
            <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
          </div>
        }
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

      @if (summary()) {
        <section class="section">
          <h2>{{ labels().sections.summary }}</h2>
          <p class="summary">{{ summary() }}</p>
        </section>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter card" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id) {
        <section class="section">
          <h2>{{ sectionTitle(section) }}</h2>
          @switch (section.kind) {
            @case ('skills') {
              <div class="card">
                @for (group of skills(section); track group.id; let first = $first) {
                  <div class="skill-row">
                    @if (group.label.trim()) {
                      <span class="skill-label">{{ group.label }}</span>
                    }
                    <ul class="chips" [class.pop]="first">
                      @for (keyword of keywords(group); track $index) {
                        <li>{{ keyword }}</li>
                      }
                    </ul>
                  </div>
                }
              </div>
            }
            @case ('languages') {
              <ul class="languages">
                @for (item of languages(section); track item.id) {
                  <li>
                    <span>{{ languageLabel(item) }}</span>
                    @if (languageLevel(item); as level) {
                      <span class="bar" aria-hidden="true">
                        <span class="fill" [style.width.%]="level * 20"></span>
                      </span>
                    }
                  </li>
                }
              </ul>
            }
            @case ('interests') {
              <ul class="chips mixed">
                @for (item of interests(section); track item.id) {
                  <li>{{ item.label }}</li>
                }
              </ul>
            }
            @default {
              @for (entry of entries(section); track entry.id) {
                <div class="card entry">
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
      padding: calc(34px * var(--cv-space, 1)) 46px calc(40px * var(--cv-space, 1));
      background: #fff8e8;
      color: #111;
      font-family: var(--cv-body-font, 'Archivo Variable', sans-serif);
      font-size: 12px;
      line-height: calc(1.45 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --pop: oklch(from var(--cv-accent) 0.84 0.13 h);
      --pop2: oklch(from var(--cv-accent) 0.88 0.12 calc(h + 140));
      --line: 2.5px solid #111;
    }
    .hero {
      display: flex;
      align-items: center;
      gap: calc(20px * var(--cv-space, 1)) 20px;
      padding: calc(20px * var(--cv-space, 1)) 22px;
      border: 3px solid #111;
      border-radius: 16px;
      background: var(--pop);
      box-shadow: 6px 6px 0 #111;
    }
    .burst {
      position: absolute;
      top: 15px;
      right: 177px;
      width: 58px;
      height: 58px;
      fill: var(--pop2);
      stroke: #111;
      stroke-width: 3;
      stroke-linejoin: round;
    }
    .photo {
      width: 104px;
      height: 104px;
      flex-shrink: 0;
      border: 3px solid #111;
      border-radius: 14px;
      object-fit: cover;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 40px;
      font-weight: 900;
      line-height: calc(1 * var(--cv-leading, 1));
      letter-spacing: -0.015em;
    }
    .headline {
      display: inline-block;
      margin-top: calc(10px * var(--cv-space, 1));
      padding: calc(3px * var(--cv-space, 1)) 11px;
      border-radius: 8px;
      background: #111;
      color: #fff;
      font-size: 14px;
      font-weight: 700;
    }
    .qr {
      flex-shrink: 0;
      padding: calc(6px * var(--cv-space, 1)) 6px;
      border: 3px solid #111;
      border-radius: 12px;
      background: #fff;
    }
    .qr-code {
      width: 72px;
      height: 72px;
      color: #111;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(7px * var(--cv-space, 1)) 7px;
      margin-top: calc(18px * var(--cv-space, 1));
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(6px * var(--cv-space, 1)) 6px;
      padding: calc(2px * var(--cv-space, 1)) 10px;
      border: 2px solid #111;
      border-radius: 9999px;
      background: #fff;
      font-weight: 500;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
    }
    .section {
      margin-top: calc(16px * var(--cv-space, 1));
    }
    h2 {
      display: inline-block;
      margin-bottom: calc(10px * var(--cv-space, 1));
      padding: calc(3px * var(--cv-space, 1)) 12px;
      border-radius: 8px;
      background: #111;
      color: #fff;
      box-shadow: 3px 3px 0 var(--cv-accent);
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .summary {
      white-space: pre-line;
    }
    .card {
      padding: calc(10px * var(--cv-space, 1)) 14px;
      border: var(--line);
      border-radius: 12px;
      background: #fff;
      box-shadow: 4px 4px 0 #111;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(11px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    h3 {
      font-size: 14px;
      font-weight: 800;
    }
    .dates {
      flex-shrink: 0;
      padding: 0 8px;
      border: 2px solid #111;
      border-radius: 6px;
      background: var(--pop2);
      font-size: 11px;
      font-weight: 700;
    }
    .org {
      margin-top: calc(2px * var(--cv-space, 1));
      color: #333;
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(4px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
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
      margin-top: calc(7px * var(--cv-space, 1));
    }
    .skill-label {
      flex-shrink: 0;
      max-width: 40%;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: 0 8px;
      border: 2px solid #111;
      border-radius: 8px;
      background: #fff;
      font-size: 11.5px;
      font-weight: 600;
    }
    .chips.pop > li {
      background: var(--pop);
    }
    .chips.mixed > li:nth-child(odd) {
      background: var(--pop);
    }
    .chips.mixed > li:nth-child(even) {
      background: var(--pop2);
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
      max-width: 420px;
      font-weight: 500;
    }
    .languages > li + li {
      margin-top: calc(5px * var(--cv-space, 1));
    }
    .bar {
      width: 110px;
      height: 12px;
      flex-shrink: 0;
      overflow: hidden;
      border: 2px solid #111;
      border-radius: 6px;
      background: #fff;
    }
    .fill {
      display: block;
      height: 100%;
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(18px * var(--cv-space, 1));
    }
  `,
})
export class CvBrutal extends CvTemplateBase {}
