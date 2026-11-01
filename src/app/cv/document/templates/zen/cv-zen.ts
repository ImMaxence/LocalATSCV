import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Zen : minimalisme japonais. Papier washi, beaucoup d'air, ensō (cercle zen tracé au pinceau)
 * à la couleur d'accent, trait de pinceau sous le nom et filets fins.
 */
@Component({
  selector: 'app-cv-zen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        <div class="identity">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          <svg class="brush" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M2 10 C 60 2, 140 4, 220 7 S 290 12, 298 6 L 296 11 C 230 15, 120 12, 60 13 S 10 15, 2 10 Z"
            />
          </svg>
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </div>
        <!-- Ensō : cercle tracé d'un seul coup de pinceau, laissé ouvert -->
        <svg class="enso" viewBox="0 0 100 100" aria-hidden="true">
          <path
            class="stroke"
            d="M64 15 C 34 8, 11 32, 15 58 C 19 85, 55 97, 77 80 C 92 68, 93 46, 85 33"
          />
          <path class="tail" d="M85 33 C 81 26, 76 21, 69 18" />
        </svg>
      </header>

      @if (photoUrl() || contact().length || qr()) {
        <div class="meta">
          @if (photoUrl()) {
            <img class="photo" [src]="photoUrl()" alt="" />
          }
          @if (contact().length) {
            <ul class="contact">
              @for (item of contact(); track $index) {
                <li>{{ item }}</li>
              }
            </ul>
          }
          @if (qr(); as code) {
            <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
          }
        </div>
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
                <p class="skill">
                  @if (group.label.trim()) {
                    <span class="skill-label">{{ group.label }}</span>
                  }
                  {{ keywords(group).join(' · ') }}
                </p>
              }
            }
            @case ('languages') {
              <p>{{ languageLine(languages(section)) }}</p>
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
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      padding: calc(60px * var(--cv-space, 1)) 70px calc(50px * var(--cv-space, 1));
      background: #faf8f3;
      color: #2b2a27;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 11.5px;
      font-weight: 400;
      line-height: calc(1.65 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    header {
      display: flex;
      align-items: flex-start;
      gap: calc(24px * var(--cv-space, 1)) 24px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Jost Variable', sans-serif);
      font-size: 34px;
      font-weight: 400;
      line-height: calc(1.1 * var(--cv-leading, 1));
      letter-spacing: 0.04em;
    }
    .brush {
      display: block;
      width: 210px;
      height: 12px;
      margin-top: calc(8px * var(--cv-space, 1));
      fill: var(--cv-accent);
    }
    .headline {
      margin-top: calc(10px * var(--cv-space, 1));
      color: #6d6a63;
      font-size: 13px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .enso {
      width: 64px;
      height: 64px;
      flex-shrink: 0;
      fill: none;
      stroke: var(--cv-accent);
      stroke-linecap: round;
    }
    .enso .stroke {
      stroke-width: 9;
    }
    .enso .tail {
      stroke-width: 4;
    }
    .meta {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 22px;
      margin-top: calc(26px * var(--cv-space, 1));
      padding: calc(14px * var(--cv-space, 1)) 0;
      border-top: 1px solid #d9d4c8;
      border-bottom: 1px solid #d9d4c8;
    }
    .photo {
      width: 66px;
      height: 66px;
      flex-shrink: 0;
      border-radius: 9999px;
      object-fit: cover;
      filter: grayscale(0.3);
    }
    .contact {
      display: flex;
      min-width: 0;
      flex: 1;
      flex-wrap: wrap;
      gap: calc(2px * var(--cv-space, 1)) 20px;
      color: #4d4a44;
    }
    .qr-code {
      width: 56px;
      height: 56px;
      flex-shrink: 0;
      color: #2b2a27;
    }
    .summary {
      margin-top: calc(24px * var(--cv-space, 1));
      color: #4d4a44;
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(24px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(12px * var(--cv-space, 1)) 12px;
      margin-bottom: calc(10px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Jost Variable', sans-serif);
      font-size: 12px;
      font-weight: 500;
      /* Au-delà, l'approche L-A de Jost coupe « LANGUES » en deux mots dans le PDF. */
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    h2::before {
      content: '';
      width: 8px;
      height: 8px;
      flex-shrink: 0;
      border-radius: 9999px;
      background: var(--cv-accent);
    }
    h2::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #d9d4c8;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(13px * var(--cv-space, 1));
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
      color: #8b877d;
      font-size: 11px;
    }
    .org {
      color: #6d6a63;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: '–  ';
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill + .skill {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .skill-label {
      margin-right: 6px;
      font-weight: 600;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvZen extends CvTemplateBase {}
