import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Riso : impression risographique à deux encres (l'accent et une seconde teinte), aplats légèrement
 * décalés comme un repérage imparfait, grain de points sur le fond. Grotesque grasse, une colonne.
 */
@Component({
  selector: 'app-cv-riso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="grain" aria-hidden="true"></div>
      <div class="plate" aria-hidden="true"></div>
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
      @for (section of cv().sections; track section.id; let i = $index) {
        <section class="section" [class.alt]="i % 2 === 1">
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
      background: #f7f3ea;
      color: #22201c;
      font-family: var(--cv-body-font, 'Archivo Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.45 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --ink1: oklch(from var(--cv-accent) 0.58 0.19 h);
      --ink2: oklch(from var(--cv-accent) 0.62 0.2 calc(h + 150));
      --ink1-soft: oklch(from var(--cv-accent) 0.58 0.19 h / 0.22);
      --ink2-soft: oklch(from var(--cv-accent) 0.62 0.2 calc(h + 150) / 0.22);
    }
    .grain {
      position: absolute;
      z-index: -1;
      inset: 0;
      background-image: radial-gradient(#22201c 0.6px, transparent 0.8px);
      background-size: 4px 4px;
      opacity: 0.12;
    }
    /* Aplat de la seconde encre derrière l'en-tête, décalé comme un repérage imparfait. */
    .plate {
      position: absolute;
      z-index: -1;
      top: 36px;
      left: 46px;
      width: 420px;
      height: 150px;
      background: var(--ink2-soft);
      box-shadow: 6px 6px 0 var(--ink1-soft);
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(22px * var(--cv-space, 1)) 24px;
      min-height: 140px;
    }
    .identity {
      min-width: 0;
      flex: 1;
      padding: calc(10px * var(--cv-space, 1)) 16px 0;
    }
    .name {
      color: var(--ink1);
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 40px;
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: calc(0.98 * var(--cv-leading, 1));
      text-transform: uppercase;
    }
    .headline {
      display: inline-block;
      margin-top: calc(10px * var(--cv-space, 1));
      padding: 1px 8px;
      background: var(--ink2);
      color: #f7f3ea;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 3px 3px 0 var(--ink1);
    }
    .photo {
      width: 124px;
      height: 124px;
      flex-shrink: 0;
      object-fit: cover;
      filter: grayscale(1) contrast(1.1);
      box-shadow: 6px 6px 0 var(--ink2-soft);
    }
    .qr {
      width: 100px;
      height: 100px;
      flex-shrink: 0;
      padding: 6px;
      background: #fff;
      color: var(--ink1);
      box-shadow: 6px 6px 0 var(--ink2-soft);
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(3px * var(--cv-space, 1)) 18px;
      margin-top: calc(14px * var(--cv-space, 1));
      padding-top: calc(8px * var(--cv-space, 1));
      border-top: 3px solid var(--ink1);
      font-size: 11px;
      font-weight: 600;
    }
    .summary {
      margin-top: calc(16px * var(--cv-space, 1));
      font-size: 13px;
      font-weight: 500;
      white-space: pre-line;
    }
    .section {
      --ink: var(--ink1);
      --soft: var(--ink1-soft);
      --other: var(--ink2);
      margin-top: calc(18px * var(--cv-space, 1));
    }
    .section.alt {
      --ink: var(--ink2);
      --soft: var(--ink2-soft);
      --other: var(--ink1);
    }
    h2 {
      display: inline-block;
      margin-bottom: calc(9px * var(--cv-space, 1));
      padding: 1px 10px;
      background: var(--ink);
      color: #f7f3ea;
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      box-shadow: 4px 4px 0 var(--soft);
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
      font-weight: 800;
    }
    .dates {
      flex-shrink: 0;
      color: var(--ink);
      font-size: 11px;
      font-weight: 700;
    }
    .org {
      color: var(--other);
      font-weight: 700;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: square;
    }
    .bullets > li::marker {
      color: var(--ink);
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
      padding: 0 8px;
      background: var(--soft);
      box-shadow: 2px 2px 0 var(--ink);
      font-size: 11px;
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
      gap: 4px;
    }
    .step {
      width: 12px;
      height: 12px;
      border-radius: 9999px;
      background: var(--soft);
    }
    .step.on {
      background: var(--ink);
      box-shadow: 2px 2px 0 var(--other);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvRiso extends CvTemplateBase {}
