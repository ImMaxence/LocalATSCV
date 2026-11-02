import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Finance : classique bancaire, serif Lora, nom en capitales espacées, filet double, dates
 * alignées à droite, encre bleu nuit dérivée de l'accent, ni icône ni pastille. Une colonne.
 */
@Component({
  selector: 'app-cv-finance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        <div class="identity">
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
                  <span class="sep" aria-hidden="true"> | </span>
                }
                <span>{{ item }}</span>
              }
            </p>
          }
        </div>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
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
                      <strong class="label">{{ group.label }}{{ separator() }}</strong>
                    }
                    {{ group.keywords }}
                  </li>
                }
              </ul>
            }
            @case ('languages') {
              <ul class="plain">
                @for (item of languages(section); track item.id) {
                  <li>{{ languageLabel(item) }}</li>
                }
              </ul>
            }
            @case ('interests') {
              <p>{{ interestLine(interests(section)) }}</p>
            }
            @default {
              @for (entry of entries(section); track entry.id) {
                <div class="entry">
                  <div class="entry-head">
                    <h3>{{ entry.subtitle.trim() || entry.title }}</h3>
                    @if (dates(entry)) {
                      <span class="dates">{{ dates(entry) }}</span>
                    }
                  </div>
                  @if (entry.subtitle.trim()) {
                    <p class="role">
                      <em>{{ entry.title }}</em>
                      @if (meta(entry)) {
                        <span class="meta"> — {{ meta(entry) }}</span>
                      }
                    </p>
                  } @else if (meta(entry)) {
                    <p class="role"><span class="meta">{{ meta(entry) }}</span></p>
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
      padding: calc(54px * var(--cv-space, 1)) 64px;
      background: #fff;
      color: #1c1c1c;
      font-family: var(--cv-body-font, 'Lora Variable', serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --navy: oklch(from var(--cv-accent) 0.32 0.08 h);
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(20px * var(--cv-space, 1)) 24px;
      padding-bottom: calc(12px * var(--cv-space, 1));
      border-bottom: 3px double var(--navy);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: var(--navy);
      font-family: var(--cv-heading-font, inherit);
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.05em;
      line-height: calc(1.15 * var(--cv-leading, 1));
      text-transform: uppercase;
    }
    .headline {
      margin-top: calc(4px * var(--cv-space, 1));
      font-size: 13px;
      font-style: italic;
    }
    .contact {
      margin-top: calc(8px * var(--cv-space, 1));
      color: #3c3c3c;
      font-size: 11px;
    }
    .sep {
      color: #999;
    }
    .photo {
      width: 86px;
      height: 106px;
      flex-shrink: 0;
      border: 1px solid #c9c9c9;
      object-fit: cover;
    }
    .section {
      margin-top: calc(16px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(7px * var(--cv-space, 1));
      padding-bottom: calc(2px * var(--cv-space, 1));
      border-bottom: 1px solid var(--navy);
      color: var(--navy);
      font-family: var(--cv-heading-font, inherit);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .summary {
      white-space: pre-line;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(9px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
    }
    h3 {
      color: var(--navy);
      font-size: 12.5px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      font-size: 11px;
    }
    .role {
      font-size: 11.5px;
    }
    .meta {
      color: #555;
    }
    .bullets {
      margin-top: calc(2px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .plain > li + li {
      margin-top: calc(2px * var(--cv-space, 1));
    }
    .label {
      color: var(--navy);
      font-weight: 700;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvFinance extends CvTemplateBase {}
