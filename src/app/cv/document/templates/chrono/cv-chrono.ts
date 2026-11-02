import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Chrono : grande colonne de dates en gras à gauche, axe vertical ponctué d'un disque par
 * entrée, titres de rubrique sur l'axe. Les dates précèdent chaque entrée dans le document.
 */
@Component({
  selector: 'app-cv-chrono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
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
                  <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2" />
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
      <div class="axis">
        @for (section of cv().sections; track section.id) {
          <section class="section">
            <h2>{{ sectionTitle(section) }}</h2>
            @switch (section.kind) {
              @case ('skills') {
                @for (group of skills(section); track group.id) {
                  <div class="row">
                    <span class="side">{{ group.label }}</span>
                    <ul class="chips">
                      @for (keyword of keywords(group); track $index) {
                        <li>{{ keyword }}</li>
                      }
                    </ul>
                  </div>
                }
              }
              @case ('languages') {
                @for (item of languages(section); track item.id) {
                  <div class="row">
                    <span class="side">{{ item.level }}</span>
                    <span class="language">
                      <span>{{ item.name }}</span>
                      @if (languageLevel(item); as level) {
                        <span class="meter" aria-hidden="true">
                          @for (step of levelSteps; track step) {
                            <span class="step" [class.on]="step <= level"></span>
                          }
                        </span>
                      }
                    </span>
                  </div>
                }
              }
              @case ('interests') {
                <div class="row">
                  <span class="side"></span>
                  <ul class="chips">
                    @for (item of interests(section); track item.id) {
                      <li>{{ item.label }}</li>
                    }
                  </ul>
                </div>
              }
              @default {
                @for (entry of entries(section); track entry.id) {
                  <div class="row entry">
                    <span class="side dates">{{ dates(entry) }}</span>
                    <div class="min-w-0">
                      <h3>{{ entry.title }}</h3>
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
      padding: calc(46px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
      background: #fff;
      color: #1f2328;
      font-family: var(--cv-body-font, 'Manrope Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --side: 118px;
      --tint: oklch(from var(--cv-accent) 0.94 0.03 h);
      --deep: oklch(from var(--cv-accent) 0.42 0.13 h);
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 24px;
    }
    .photo {
      width: 112px;
      height: 112px;
      flex-shrink: 0;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 0 0 4px var(--tint);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: #111;
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(5px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-size: 15px;
      font-weight: 700;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(10px * var(--cv-space, 1));
      color: #4b5159;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--cv-accent);
    }
    .qr {
      width: 66px;
      height: 66px;
      flex-shrink: 0;
      color: #111;
    }
    .summary {
      margin-top: calc(18px * var(--cv-space, 1));
      font-size: 12.5px;
      white-space: pre-line;
    }
    /* L'axe passe au bord droit de la colonne des dates. */
    .axis {
      margin-top: calc(10px * var(--cv-space, 1));
      background: linear-gradient(var(--tint), var(--tint)) var(--side) 0 / 3px 100% no-repeat;
    }
    .section {
      padding-top: calc(16px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 calc(8px * var(--cv-space, 1)) calc(var(--side) - 7px);
      color: var(--deep);
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    h2::before {
      content: '';
      width: 17px;
      height: 17px;
      border-radius: 9999px;
      background: var(--cv-accent);
      box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--tint);
    }
    .row {
      display: grid;
      grid-template-columns: calc(var(--side) - 16px) minmax(0, 1fr);
      gap: 0 28px;
    }
    .row + .row {
      margin-top: calc(8px * var(--cv-space, 1));
    }
    .side {
      color: #6b7280;
      font-size: 11px;
      font-weight: 600;
      text-align: right;
      overflow-wrap: anywhere;
    }
    .dates {
      color: var(--deep);
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 13px;
      font-weight: 800;
      line-height: calc(1.3 * var(--cv-leading, 1));
    }
    .entry {
      break-inside: avoid;
    }
    /* Disque de l'entrée sur l'axe, en flottant devant le contenu. */
    .entry > div::before {
      content: '';
      float: left;
      width: 9px;
      height: 9px;
      margin: 5px 0 0 -22px;
      border: 2px solid var(--cv-accent);
      border-radius: 9999px;
      background: #fff;
    }
    h3 {
      color: #111;
      font-size: 13px;
      font-weight: 700;
    }
    .org {
      color: #4b5159;
      font-weight: 500;
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
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: 1px 9px;
      border-radius: 6px;
      background: var(--tint);
      font-size: 11px;
      font-weight: 600;
    }
    .language {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .meter {
      display: flex;
      gap: 4px;
    }
    .step {
      width: 14px;
      height: 6px;
      border-radius: 3px;
      background: var(--tint);
    }
    .step.on {
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvChrono extends CvTemplateBase {}
