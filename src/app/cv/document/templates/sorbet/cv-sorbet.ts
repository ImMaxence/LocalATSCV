import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Sorbet : une couleur pastel par section (teintes voisines de l'accent), titres en pastilles
 * arrondies, halo multicolore derrière l'en-tête. Doux et joyeux, sur une seule colonne.
 */
@Component({
  selector: 'app-cv-sorbet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="halo" aria-hidden="true"></div>
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
          <div class="qr">
            <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
          </div>
        }
      </header>

      @if (summary()) {
        <p class="summary">{{ summary() }}</p>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id; let i = $index) {
        <section class="section" [attr.data-tone]="i % 5">
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
      padding: calc(44px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
      background: #fff;
      color: #24222b;
      font-family: var(--cv-body-font, 'Poppins', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --t0: oklch(from var(--cv-accent) 0.93 0.05 h);
      --t1: oklch(from var(--cv-accent) 0.93 0.05 calc(h + 60));
      --t2: oklch(from var(--cv-accent) 0.93 0.05 calc(h + 130));
      --t3: oklch(from var(--cv-accent) 0.93 0.05 calc(h + 200));
      --t4: oklch(from var(--cv-accent) 0.93 0.05 calc(h + 270));
      --ink: oklch(from var(--cv-accent) 0.38 0.09 h);
    }
    .halo {
      position: absolute;
      z-index: -1;
      top: -120px;
      right: -100px;
      width: 520px;
      height: 360px;
      border-radius: 9999px;
      background:
        radial-gradient(circle at 30% 40%, var(--t1), transparent 60%),
        radial-gradient(circle at 70% 60%, var(--t3), transparent 60%),
        radial-gradient(circle at 50% 30%, var(--t0), transparent 70%);
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(24px * var(--cv-space, 1)) 24px;
    }
    .photo {
      width: 118px;
      height: 118px;
      flex-shrink: 0;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow:
        0 0 0 6px var(--t1),
        0 0 0 12px var(--t3);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 34px;
      font-weight: 700;
      line-height: calc(1.1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(2px * var(--cv-space, 1));
      font-size: 15px;
      font-weight: 500;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(12px * var(--cv-space, 1));
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(6px * var(--cv-space, 1)) 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--ink);
    }
    .qr {
      flex-shrink: 0;
      padding: calc(6px * var(--cv-space, 1)) 6px;
      border-radius: 14px;
      background: #fff;
      box-shadow: 0 0 0 3px var(--t2);
    }
    .qr-code {
      width: 62px;
      height: 62px;
      color: #24222b;
    }
    .summary {
      margin-top: calc(18px * var(--cv-space, 1));
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      --tone: var(--t0);
      margin-top: calc(16px * var(--cv-space, 1));
    }
    .section[data-tone='1'] {
      --tone: var(--t1);
    }
    .section[data-tone='2'] {
      --tone: var(--t2);
    }
    .section[data-tone='3'] {
      --tone: var(--t3);
    }
    .section[data-tone='4'] {
      --tone: var(--t4);
    }
    h2 {
      width: fit-content;
      margin-bottom: calc(9px * var(--cv-space, 1));
      padding: calc(3px * var(--cv-space, 1)) 14px;
      border-radius: 9999px;
      background: var(--tone);
      font-family: var(--cv-heading-font, 'Poppins', sans-serif);
      font-size: 14px;
      font-weight: 600;
    }
    .entry {
      padding-left: 14px;
      border-left: 4px solid var(--tone);
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(10px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    h3 {
      font-size: 13px;
      font-weight: 600;
    }
    .dates {
      flex-shrink: 0;
      color: #6b6878;
      font-size: 11px;
      font-weight: 500;
    }
    .org {
      color: var(--ink);
      font-weight: 500;
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
      gap: calc(10px * var(--cv-space, 1)) 10px;
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
      padding: calc(1px * var(--cv-space, 1)) 10px;
      border-radius: 9999px;
      background: var(--tone);
      font-size: 11px;
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
      width: 18px;
      height: 8px;
      border-radius: 9999px;
      background: #eeedf2;
    }
    .step.on {
      background: var(--ink);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvSorbet extends CvTemplateBase {}
