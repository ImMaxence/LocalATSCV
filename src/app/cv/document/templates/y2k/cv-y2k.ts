import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Étoile à quatre branches (éclat), dessin vectoriel sans texte. */
const SPARKLE = 'M50 0 C54 30 70 46 100 50 C70 54 54 70 50 100 C46 70 30 54 0 50 C30 46 46 30 50 0 Z';

/**
 * Y2K : bandeau chromé irisé (violet, bleu, argent dérivés de l'accent), éclats, pastilles
 * bombées et titres en capsules brillantes. Une seule colonne.
 */
@Component({
  selector: 'app-cv-y2k',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="chrome" aria-hidden="true"></div>
      <svg class="sparkle sparkle-a" viewBox="0 0 100 100" aria-hidden="true">
        <path [attr.d]="sparkle" />
      </svg>
      <svg class="sparkle sparkle-b" viewBox="0 0 100 100" aria-hidden="true">
        <path [attr.d]="sparkle" />
      </svg>
      <svg class="sparkle sparkle-c" viewBox="0 0 100 100" aria-hidden="true">
        <path [attr.d]="sparkle" />
      </svg>
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
        </div>
        @if (qr(); as code) {
          <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
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
      position: relative;
      isolation: isolate;
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      overflow: hidden;
      padding: calc(40px * var(--cv-space, 1)) 50px calc(44px * var(--cv-space, 1));
      background: #f4f2fb;
      color: #1c1830;
      font-family: var(--cv-body-font, 'Space Grotesk Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --violet: oklch(from var(--cv-accent) 0.6 0.2 calc(h + 40));
      --blue: oklch(from var(--cv-accent) 0.7 0.17 calc(h - 40));
      --silver: #d9dbe6;
      --ink: oklch(from var(--cv-accent) 0.4 0.17 calc(h + 20));
    }
    .chrome {
      position: absolute;
      z-index: -1;
      inset: 0 0 auto;
      height: 230px;
      background: linear-gradient(
        180deg,
        #fff 0%,
        var(--silver) 18%,
        #8f93a6 34%,
        #fff 50%,
        var(--violet) 70%,
        var(--blue) 100%
      );
    }
    .sparkle {
      position: absolute;
      z-index: -1;
      fill: #fff;
    }
    .sparkle-a {
      top: 24px;
      right: 70px;
      width: 54px;
      height: 54px;
    }
    .sparkle-b {
      top: 150px;
      right: 160px;
      width: 26px;
      height: 26px;
    }
    .sparkle-c {
      top: 110px;
      left: 30px;
      width: 36px;
      height: 36px;
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(20px * var(--cv-space, 1)) 22px;
      min-height: 150px;
    }
    .photo {
      width: 116px;
      height: 116px;
      flex-shrink: 0;
      border: 4px solid #fff;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow:
        0 0 0 3px var(--violet),
        0 10px 24px -8px rgb(60 40 120 / 0.5);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      display: inline-block;
      padding: 4px 18px;
      border: 2px solid #fff;
      border-radius: 9999px;
      background: linear-gradient(180deg, #fff, var(--silver));
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Syne Variable', sans-serif);
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: calc(1.1 * var(--cv-leading, 1));
      box-shadow: 0 6px 16px -8px rgb(60 40 120 / 0.6);
    }
    .headline {
      display: inline-block;
      margin-top: calc(8px * var(--cv-space, 1));
      padding: 2px 12px;
      border-radius: 9999px;
      background: var(--ink);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
    }
    .qr {
      width: 68px;
      height: 68px;
      flex-shrink: 0;
      padding: 5px;
      border: 2px solid #fff;
      border-radius: 14px;
      background: #fff;
      color: var(--ink);
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 8px;
      margin-top: calc(24px * var(--cv-space, 1));
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 1px 10px;
      border-radius: 9999px;
      background: #fff;
      box-shadow: inset 0 -2px 0 var(--silver);
      font-size: 10.5px;
      font-weight: 500;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      color: var(--violet);
    }
    .summary {
      margin-top: calc(16px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 16px;
      border-radius: 18px;
      background: #fff;
      box-shadow: inset 0 -3px 0 var(--silver);
      font-size: 12px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(16px * var(--cv-space, 1));
    }
    h2 {
      display: inline-block;
      margin-bottom: calc(9px * var(--cv-space, 1));
      padding: 2px 14px;
      border-radius: 9999px;
      background: linear-gradient(180deg, var(--violet), var(--blue));
      color: #fff;
      font-family: var(--cv-heading-font, 'Syne Variable', sans-serif);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      box-shadow:
        inset 0 2px 0 rgb(255 255 255 / 0.55),
        0 4px 10px -6px rgb(60 40 120 / 0.6);
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
      color: var(--ink);
      font-size: 11px;
      font-weight: 700;
    }
    .org {
      color: var(--violet);
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--blue);
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
      padding: 1px 10px;
      border-radius: 9999px;
      background: linear-gradient(180deg, #fff, #ece9f7);
      box-shadow: inset 0 -2px 0 var(--silver), 0 0 0 1px #e2dff0;
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
      width: 12px;
      height: 12px;
      border-radius: 9999px;
      background: radial-gradient(circle at 35% 30%, #fff 20%, var(--silver) 70%);
    }
    .step.on {
      background: radial-gradient(circle at 35% 30%, #fff 10%, var(--violet) 55%, var(--blue));
    }
    .letter {
      margin-top: calc(20px * var(--cv-space, 1));
    }
  `,
})
export class CvY2k extends CvTemplateBase {
  protected readonly sparkle = SPARKLE;
}
