import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Élégant : en-tête centré, typographie à empattements (Fraunces), filets fins. */
@Component({
  selector: 'app-cv-elegant',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
        @if (fullName()) {
          <h1 class="name">{{ fullName() }}</h1>
        }
        @if (cv().profile.title.trim()) {
          <p class="headline">{{ cv().profile.title }}</p>
        }
        @if (contact().length) {
          <p class="contact">
            @for (item of contact(); track $index) {
              @if (!$first) {
                <span class="sep"> · </span>
              }
              <span>{{ item }}</span>
            }
          </p>
        }
      </header>

      @if (summary()) {
        <section class="section">
          <h2>{{ labels().sections.summary }}</h2>
          <p class="summary">{{ summary() }}</p>
        </section>
      }
      @if (letter(); as body) {
        <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id) {
        <section class="section">
          <h2>{{ sectionTitle(section) }}</h2>
          @switch (section.kind) {
            @case ('skills') {
              <ul class="plain">
                @for (group of skills(section); track group.id) {
                  <li>
                    @if (group.label.trim()) {
                      <strong>{{ group.label }}{{ separator() }}</strong>
                    }
                    {{ group.keywords }}
                  </li>
                }
              </ul>
            }
            @case ('languages') {
              <p class="centered">{{ languageLine(languages(section)) }}</p>
            }
            @case ('interests') {
              <p class="centered">{{ interestLine(interests(section)) }}</p>
            }
            @default {
              @for (entry of entries(section); track entry.id) {
                <div class="entry">
                  <div class="entry-head">
                    <h3>{{ entry.title }}</h3>
                    @if (dates(entry)) {
                      <p class="dates">{{ dates(entry) }}</p>
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
      padding: calc(54px * var(--cv-space, 1)) 66px;
      background: #fff;
      color: #2a2a2a;
      font-family: var(--cv-body-font, var(--font-sans));
      font-size: 12.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
    }
    header {
      padding-bottom: calc(18px * var(--cv-space, 1));
      border-bottom: 3px double #2f2f2f;
      text-align: center;
    }
    .photo {
      width: 92px;
      height: 92px;
      margin: 0 auto calc(14px * var(--cv-space, 1));
      border-radius: 9999px;
      object-fit: cover;
    }
    .name {
      color: #151515;
      font-family: var(--cv-heading-font, var(--font-display));
      font-size: 36px;
      font-weight: 500;
      letter-spacing: 0.01em;
      line-height: calc(1.1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(4px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, var(--font-display));
      font-size: 16px;
      font-style: italic;
    }
    .contact {
      margin-top: calc(10px * var(--cv-space, 1));
      color: #555;
      font-size: 11.5px;
    }
    .sep {
      color: #aaa;
    }
    .section {
      margin-top: calc(22px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(14px * var(--cv-space, 1)) 14px;
      margin-bottom: calc(12px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, var(--font-display));
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    h2::before,
    h2::after {
      content: '';
      height: 1px;
      flex: 1;
      background: #d8d8d8;
    }
    .summary {
      color: #333;
      font-family: var(--cv-heading-font, var(--font-display));
      font-size: 13.5px;
      font-style: italic;
      text-align: center;
      white-space: pre-line;
    }
    .centered {
      text-align: center;
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
      color: #151515;
      font-family: var(--cv-heading-font, var(--font-display));
      font-size: 14.5px;
      font-weight: 600;
    }
    .dates {
      flex-shrink: 0;
      color: #666;
      font-size: 11.5px;
      font-variant: small-caps;
      letter-spacing: 0.04em;
    }
    .org {
      color: #555;
      font-style: italic;
    }
    .bullets {
      margin-top: calc(4px * var(--cv-space, 1));
      padding-left: 18px;
      list-style: '–  ';
    }
    .bullets > li + li {
      margin-top: calc(2px * var(--cv-space, 1));
    }
    .plain > li + li {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    strong {
      color: #151515;
      font-weight: 600;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvElegant extends CvTemplateBase {}
