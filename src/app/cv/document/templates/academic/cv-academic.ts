import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Académique : format universitaire classique, nom centré en capitales, titres soulignés sur
 * toute la largeur, serif Lora, aucune couleur hors un filet. Une seule colonne.
 */
@Component({
  selector: 'app-cv-academic',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
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
                <span class="dot" aria-hidden="true"> • </span>
              }
              <span>{{ item }}</span>
            }
          </p>
        }
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
                      <em class="label">{{ group.label }}{{ separator() }}</em>
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
      padding: calc(56px * var(--cv-space, 1)) 68px;
      background: #fff;
      color: #1a1a1a;
      font-family: var(--cv-body-font, 'Lora Variable', serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .name {
      font-family: var(--cv-heading-font, inherit);
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.06em;
      line-height: calc(1.2 * var(--cv-leading, 1));
      text-transform: uppercase;
    }
    .headline {
      margin-top: calc(4px * var(--cv-space, 1));
      font-size: 13px;
      font-style: italic;
    }
    .contact {
      margin-top: calc(6px * var(--cv-space, 1));
      color: #333;
      font-size: 11px;
    }
    .dot {
      color: #888;
    }
    .photo {
      width: 88px;
      height: 110px;
      margin-top: calc(14px * var(--cv-space, 1));
      border: 1px solid #ccc;
      object-fit: cover;
    }
    .section {
      margin-top: calc(16px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(7px * var(--cv-space, 1));
      padding-bottom: calc(2px * var(--cv-space, 1));
      border-bottom: 1px solid #1a1a1a;
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
      margin-top: calc(8px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
    }
    h3 {
      font-size: 12px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      font-size: 11px;
    }
    .org {
      font-style: italic;
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
      font-style: italic;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvAcademic extends CvTemplateBase {}
