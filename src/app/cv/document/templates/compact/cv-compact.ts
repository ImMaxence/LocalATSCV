import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Compact : densité maximale pour les parcours longs, texte un peu plus petit, en-tête d'entrée
 * sur une ligne (poste, organisation, dates), titres en bandeau gris. Une seule colonne.
 */
@Component({
  selector: 'app-cv-compact',
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
                  <span class="dot" aria-hidden="true"> | </span>
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
                      <strong>{{ group.label }}{{ separator() }}</strong>
                    }
                    {{ group.keywords }}
                  </li>
                }
              </ul>
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
                  <p class="entry-head">
                    <strong class="title">{{ entry.title }}</strong>
                    @if (organization(entry)) {
                      <span class="org">{{ organization(entry) }}</span>
                    }
                    @if (dates(entry)) {
                      <span class="dates">{{ dates(entry) }}</span>
                    }
                  </p>
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
      padding: calc(40px * var(--cv-space, 1)) 46px;
      background: #fff;
      color: #222;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 10.5px;
      line-height: calc(1.4 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 20px;
      padding-bottom: calc(10px * var(--cv-space, 1));
      border-bottom: 2px solid var(--cv-accent);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: #111;
      font-family: var(--cv-heading-font, inherit);
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.01em;
      line-height: calc(1.1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(2px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-size: 12.5px;
      font-weight: 600;
    }
    .contact {
      margin-top: calc(5px * var(--cv-space, 1));
      color: #555;
      font-size: 10px;
    }
    .dot {
      color: #bbb;
    }
    .photo {
      width: 72px;
      height: 72px;
      flex-shrink: 0;
      border-radius: 4px;
      object-fit: cover;
    }
    .section {
      margin-top: calc(10px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(5px * var(--cv-space, 1));
      padding: calc(2px * var(--cv-space, 1)) 8px;
      background: #f0f1f3;
      border-left: 3px solid var(--cv-accent);
      color: #111;
      font-family: var(--cv-heading-font, inherit);
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .summary {
      white-space: pre-line;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(6px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0 8px;
    }
    .title {
      color: #111;
      font-size: 11.5px;
      font-weight: 700;
    }
    .org {
      color: #444;
    }
    .org::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 4px;
      margin: 0 8px 2px 0;
      border-radius: 9999px;
      background: #bbb;
    }
    .dates {
      margin-left: auto;
      color: #666;
      font-size: 10px;
      white-space: nowrap;
    }
    .bullets {
      margin-top: calc(1px * var(--cv-space, 1));
      padding-left: 14px;
      list-style: disc;
    }
    .plain > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    strong {
      color: #111;
      font-weight: 600;
    }
    .letter {
      margin-top: calc(16px * var(--cv-space, 1));
    }
  `,
})
export class CvCompact extends CvTemplateBase {}
