import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Prisme : en-tête en dégradé maillé (plusieurs halos tirés de la couleur d'accent), carte de
 * contact translucide façon verre, expériences en cartes à bordure dégradée. Pas de flou ni de
 * texte en dégradé : le texte reste plein, donc extractible tel quel.
 */
@Component({
  selector: 'app-cv-prism',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="orb" aria-hidden="true"></div>
      <header class="mesh">
        <div class="hero-main">
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
        </div>
        @if (contactItems().length || qr()) {
          <div class="glass">
            <ul class="contact">
              @for (item of contactItems(); track $index) {
                <li>
                  <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2" />
                  <span>{{ item.text }}</span>
                </li>
              }
            </ul>
            @if (qr(); as code) {
              <div class="qr">
                <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
              </div>
            }
          </div>
        }
      </header>

      <div class="body">
        @if (summary()) {
          <p class="summary">{{ summary() }}</p>
        }

        @if (letter(); as body) {
          <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
        }
        @for (section of cv().sections; track section.id) {
          <section class="section">
            <h2><span class="mark" aria-hidden="true"></span>{{ sectionTitle(section) }}</h2>
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
                        <span class="bar" aria-hidden="true">
                          <span class="fill" [style.width.%]="level * 20"></span>
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
                  <div class="card">
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
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      overflow: hidden;
      background: #fff;
      color: #1b1c22;
      font-family: var(--cv-body-font, 'Manrope Variable', sans-serif);
      font-size: 12px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --a1: oklch(from var(--cv-accent) 0.8 0.13 h);
      --a2: oklch(from var(--cv-accent) 0.83 0.12 calc(h + 60));
      --a3: oklch(from var(--cv-accent) 0.86 0.1 calc(h - 60));
      --a4: oklch(from var(--cv-accent) 0.88 0.09 calc(h + 150));
      --s1: oklch(from var(--cv-accent) 0.62 0.15 h);
      --s2: oklch(from var(--cv-accent) 0.68 0.14 calc(h + 60));
      --deep: oklch(from var(--cv-accent) 0.36 0.1 h);
    }
    .orb {
      position: absolute;
      right: -160px;
      bottom: -160px;
      width: 420px;
      height: 420px;
      border-radius: 9999px;
      background: radial-gradient(circle, var(--a2), transparent 65%);
      opacity: 0.55;
    }
    .mesh {
      position: relative;
      padding: calc(40px * var(--cv-space, 1)) 50px calc(26px * var(--cv-space, 1));
      background:
        linear-gradient(to bottom, transparent 62%, #fff),
        radial-gradient(at 12% 18%, var(--a1), transparent 55%),
        radial-gradient(at 88% 8%, var(--a2), transparent 50%),
        radial-gradient(at 72% 92%, var(--a3), transparent 55%),
        radial-gradient(at 8% 100%, var(--a4), transparent 50%), #fff;
    }
    .hero-main {
      display: flex;
      align-items: center;
      gap: calc(24px * var(--cv-space, 1)) 24px;
    }
    .photo {
      width: 112px;
      height: 112px;
      flex-shrink: 0;
      border: 4px solid #fff;
      border-radius: 32px;
      object-fit: cover;
      box-shadow: 0 14px 30px -14px rgb(20 20 40 / 0.5);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Syne Variable', sans-serif);
      font-size: 40px;
      font-weight: 700;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--deep);
      font-size: 16px;
      font-weight: 600;
    }
    .glass {
      display: flex;
      align-items: center;
      gap: calc(18px * var(--cv-space, 1)) 18px;
      margin-top: calc(22px * var(--cv-space, 1));
      padding: calc(12px * var(--cv-space, 1)) 16px;
      border: 1px solid rgb(255 255 255 / 0.9);
      border-radius: 18px;
      background: rgb(255 255 255 / 0.62);
      box-shadow: 0 12px 30px -16px rgb(20 20 40 / 0.35);
    }
    .contact {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      gap: calc(6px * var(--cv-space, 1)) 18px;
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
    .qr {
      flex-shrink: 0;
      padding: calc(5px * var(--cv-space, 1)) 5px;
      border-radius: 10px;
      background: #fff;
    }
    .qr-code {
      width: 62px;
      height: 62px;
      color: #1b1c22;
    }
    .body {
      position: relative;
      padding: 0 50px calc(40px * var(--cv-space, 1));
    }
    .summary {
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(10px * var(--cv-space, 1)) 10px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Syne Variable', sans-serif);
      font-size: 17px;
      font-weight: 700;
    }
    .mark {
      width: 26px;
      height: 8px;
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--s1), var(--s2));
    }
    .card {
      padding: calc(10px * var(--cv-space, 1)) 14px;
      border: 1.5px solid transparent;
      border-radius: 14px;
      background:
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(135deg, var(--s1), var(--s2), var(--a4)) border-box;
      break-inside: avoid;
    }
    .card + .card {
      margin-top: calc(9px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    h3 {
      font-size: 13.5px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      padding: calc(1px * var(--cv-space, 1)) 10px;
      border-radius: 9999px;
      background: linear-gradient(135deg, var(--a1), var(--a2));
      color: var(--deep);
      font-size: 11px;
      font-weight: 700;
    }
    .org {
      color: #575b68;
    }
    .bullets {
      margin-top: calc(4px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--s1);
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
      border-radius: 9999px;
      background: linear-gradient(135deg, var(--a1), var(--a3));
      font-size: 11.5px;
      font-weight: 500;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: calc(5px * var(--cv-space, 1));
    }
    .bar {
      width: 110px;
      height: 7px;
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 9999px;
      background: #eceef3;
    }
    .fill {
      display: block;
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--s1), var(--s2));
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvPrism extends CvTemplateBase {}
