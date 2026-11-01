import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Vague : grand bandeau de couleur terminé par deux vagues superposées, photo ronde cerclée de
 * blanc, titres soulignés d'une ondulation. Doux et chaleureux, sur une seule colonne.
 */
@Component({
  selector: 'app-cv-wave',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="hero">
        <div class="hero-main">
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
          @if (photoUrl()) {
            <img class="photo" [src]="photoUrl()" alt="" />
          }
        </div>
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
        <svg class="waves" viewBox="0 0 794 80" preserveAspectRatio="none" aria-hidden="true">
          <path class="back" d="M0 26 C 150 92, 310 -8, 470 36 S 690 92, 794 14 L794 80 L0 80 Z" />
          <path class="front" d="M0 54 C 180 104, 340 8, 520 52 S 724 96, 794 40 L794 80 L0 80 Z" />
        </svg>
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
            <h2>
              <svg class="squiggle" viewBox="0 0 30 10" aria-hidden="true">
                <path d="M1 5 Q 4.5 0 8 5 T 15 5 T 22 5 T 29 5" />
              </svg>
              {{ sectionTitle(section) }}
            </h2>
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
      background: #fff;
      color: #1f2430;
      font-family: var(--cv-body-font, 'DM Sans Variable', sans-serif);
      font-size: 12.5px;
      line-height: calc(1.45 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --soft: color-mix(in oklab, var(--cv-accent) 11%, white);
      --light: color-mix(in oklab, var(--cv-accent) 45%, white);
    }
    .hero {
      padding: calc(38px * var(--cv-space, 1)) 54px 0;
      background: linear-gradient(
        160deg,
        color-mix(in oklab, var(--cv-accent) 82%, white),
        var(--cv-accent) 60%
      );
      color: #fff;
    }
    .hero-main {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 22px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 38px;
      font-weight: 800;
      line-height: calc(1.05 * var(--cv-leading, 1));
      letter-spacing: -0.01em;
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      font-size: 16px;
      font-weight: 500;
      color: rgb(255 255 255 / 0.9);
    }
    .qr {
      flex-shrink: 0;
      padding: calc(6px * var(--cv-space, 1)) 6px;
      border-radius: 14px;
      background: #fff;
    }
    .qr-code {
      width: 66px;
      height: 66px;
      color: #1f2430;
    }
    .photo {
      width: 124px;
      height: 124px;
      flex-shrink: 0;
      border: 5px solid #fff;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 14px 30px -14px rgb(0 0 0 / 0.5);
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(6px * var(--cv-space, 1)) 20px;
      margin-top: calc(18px * var(--cv-space, 1));
      font-size: 12px;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(6px * var(--cv-space, 1)) 6px;
    }
    .contact-icon {
      width: 14px;
      height: 14px;
    }
    /* Vagues dans le flux (pas en absolu) : l'en-tête reste en tête du texte du PDF. */
    .waves {
      display: block;
      width: calc(100% + 108px);
      height: 80px;
      margin: calc(18px * var(--cv-space, 1)) -54px calc(-1px * var(--cv-space, 1));
    }
    .waves .back {
      fill: var(--light);
    }
    .waves .front {
      fill: #fff;
    }
    .body {
      padding: calc(2px * var(--cv-space, 1)) 54px calc(42px * var(--cv-space, 1));
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
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 17px;
      font-weight: 800;
    }
    .squiggle {
      width: 30px;
      height: 10px;
      fill: none;
      stroke: var(--cv-accent);
      stroke-linecap: round;
      stroke-width: 2.4;
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
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      padding: calc(1px * var(--cv-space, 1)) 10px;
      border-radius: 9999px;
      background: var(--soft);
      color: var(--cv-accent);
      font-size: 11px;
      font-weight: 700;
    }
    .org {
      color: var(--cv-accent);
      font-weight: 600;
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
      padding: calc(1px * var(--cv-space, 1)) 11px;
      border-radius: 9999px;
      background: var(--soft);
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
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: calc(4px * var(--cv-space, 1)) 4px;
    }
    .step {
      width: 9px;
      height: 9px;
      border-radius: 9999px;
      background: #e6e8ee;
    }
    .step.on {
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvWave extends CvTemplateBase {}
