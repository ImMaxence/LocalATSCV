import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Machine à écrire : tout en chasse fixe sur papier blanc cassé, titres en capitales espacées
 * soulignés d'un trait plein, ruban rouge-noir (l'accent) pour le titre du poste. Une colonne.
 */
@Component({
  selector: 'app-cv-typewriter',
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
            <ul class="contact">
              @for (item of contact(); track $index) {
                <li>{{ item }}</li>
              }
            </ul>
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
                      <strong>{{ group.label }}{{ separator() }}</strong>
                    }
                    {{ keywords(group).join(', ') }}
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
      padding: calc(58px * var(--cv-space, 1)) 64px;
      background: #fcfbf7;
      color: #1f1d1a;
      font-family: var(--cv-body-font, 'JetBrains Mono Variable', monospace);
      font-size: 10.5px;
      line-height: calc(1.6 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --ribbon: oklch(from var(--cv-accent) 0.5 0.17 h);
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(20px * var(--cv-space, 1)) 24px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'JetBrains Mono Variable', monospace);
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.05em;
      line-height: calc(1.2 * var(--cv-leading, 1));
      text-transform: uppercase;
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--ribbon);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(2px * var(--cv-space, 1)) 16px;
      margin-top: calc(10px * var(--cv-space, 1));
      color: #4a4742;
      font-size: 10px;
    }
    .photo {
      width: 90px;
      height: 110px;
      flex-shrink: 0;
      border: 1px solid #1f1d1a;
      object-fit: cover;
      filter: grayscale(1) contrast(1.1);
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(6px * var(--cv-space, 1));
      padding-bottom: calc(2px * var(--cv-space, 1));
      border-bottom: 1.5px solid #1f1d1a;
      font-family: var(--cv-heading-font, 'JetBrains Mono Variable', monospace);
      font-size: 11.5px;
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
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .dates {
      flex-shrink: 0;
      color: var(--ribbon);
      font-size: 10px;
      font-weight: 700;
    }
    .org {
      color: #4a4742;
    }
    .bullets {
      margin-top: calc(2px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: square;
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .plain > li + li {
      margin-top: calc(2px * var(--cv-space, 1));
    }
    strong {
      font-weight: 700;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvTypewriter extends CvTemplateBase {}
