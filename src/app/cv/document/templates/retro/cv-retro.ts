import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Rétro : bandes de couleurs années 70 (quatre teintes dérivées de l'accent) en haut de page et
 * en arcs de soleil dans un angle, serif arrondie, titres sur pastilles. Une seule colonne.
 */
@Component({
  selector: 'app-cv-retro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="stripes" aria-hidden="true"></div>
      <div class="sun" aria-hidden="true"></div>
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
      @for (section of cv().sections; track section.id; let i = $index) {
        <section class="section" [attr.data-tone]="i % 4">
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
      padding: calc(52px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
      background: #fbf6ea;
      color: #3a2f25;
      font-family: var(--cv-body-font, 'Jost Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --c0: oklch(from var(--cv-accent) 0.62 0.17 h);
      --c1: oklch(from var(--cv-accent) 0.72 0.16 calc(h + 30));
      --c2: oklch(from var(--cv-accent) 0.8 0.14 calc(h + 60));
      --c3: oklch(from var(--cv-accent) 0.5 0.12 calc(h - 30));
      --brown: #4a3a2c;
    }
    .stripes {
      position: absolute;
      z-index: -1;
      inset: 0 0 auto;
      height: 22px;
      background: linear-gradient(
        180deg,
        var(--c3) 0 25%,
        var(--c0) 25% 50%,
        var(--c1) 50% 75%,
        var(--c2) 75%
      );
    }
    .sun {
      position: absolute;
      z-index: -1;
      right: -140px;
      bottom: -140px;
      width: 420px;
      height: 420px;
      border-radius: 9999px;
      background: repeating-radial-gradient(
        circle,
        var(--c2) 0 26px,
        var(--c1) 26px 52px,
        var(--c0) 52px 78px,
        var(--c3) 78px 104px,
        #fbf6ea 104px 150px
      );
      opacity: 0.35;
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 24px;
    }
    .photo {
      width: 118px;
      height: 118px;
      flex-shrink: 0;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow:
        0 0 0 5px #fbf6ea,
        0 0 0 9px var(--c1),
        0 0 0 13px var(--c2);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: var(--brown);
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 38px;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: calc(1.02 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--c0);
      font-size: 15px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(12px * var(--cv-space, 1));
      color: #6b5c4e;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--c3);
    }
    .qr {
      width: 70px;
      height: 70px;
      flex-shrink: 0;
      padding: 6px;
      border: 3px solid var(--c1);
      border-radius: 12px;
      background: #fff;
      color: var(--brown);
    }
    .summary {
      margin-top: calc(20px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 16px;
      border-radius: 14px;
      background: #fff;
      border: 2px solid var(--c2);
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      --tone: var(--c0);
      margin-top: calc(18px * var(--cv-space, 1));
    }
    .section[data-tone='1'] {
      --tone: var(--c1);
    }
    .section[data-tone='2'] {
      --tone: var(--c3);
    }
    .section[data-tone='3'] {
      --tone: var(--c2);
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      color: var(--brown);
      font-family: var(--cv-heading-font, 'Fraunces Variable', serif);
      font-size: 18px;
      font-weight: 700;
    }
    h2::before {
      content: '';
      width: 18px;
      height: 18px;
      border-radius: 9999px;
      background: var(--tone);
      box-shadow: inset 0 0 0 4px #fbf6ea, inset 0 0 0 6px var(--tone);
    }
    h2::after {
      content: '';
      flex: 1;
      height: 4px;
      border-radius: 2px;
      background: repeating-linear-gradient(90deg, var(--tone) 0 10px, transparent 10px 16px);
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
      font-size: 13.5px;
      font-weight: 600;
    }
    .dates {
      flex-shrink: 0;
      padding: 0 9px;
      border-radius: 9999px;
      background: var(--tone);
      color: #fff;
      font-size: 10.5px;
      font-weight: 600;
    }
    .org {
      color: var(--c3);
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
      font-weight: 600;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: 1px 10px;
      border: 2px solid var(--tone);
      border-radius: 9999px;
      background: #fff;
      font-size: 11px;
      font-weight: 500;
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
      width: 16px;
      height: 10px;
      border-radius: 9999px;
      background: #eadfcc;
    }
    .step.on {
      background: var(--tone);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvRetro extends CvTemplateBase {}
