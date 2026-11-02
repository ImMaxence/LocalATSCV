import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Aéré : grandes marges, texte plus grand, interligne généreux et beaucoup d'espace entre les
 * rubriques. Pour les parcours courts qu'on ne veut pas voir flotter sur une page vide.
 */
@Component({
  selector: 'app-cv-airy',
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
        </div>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
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
                    {{ keywords(group).join(' · ') }}
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
      padding: calc(60px * var(--cv-space, 1)) 72px;
      background: #fff;
      color: #24262b;
      font-family: var(--cv-body-font, 'Manrope Variable', sans-serif);
      font-size: 12.5px;
      line-height: calc(1.6 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(24px * var(--cv-space, 1)) 28px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: #111;
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 36px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: calc(1.1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(8px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-size: 17px;
      font-weight: 600;
    }
    .photo {
      width: 108px;
      height: 108px;
      flex-shrink: 0;
      border-radius: 9999px;
      object-fit: cover;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 22px;
      margin-top: calc(18px * var(--cv-space, 1));
      color: #5b5e66;
      font-size: 12px;
    }
    .summary {
      margin-top: calc(24px * var(--cv-space, 1));
      font-size: 13.5px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(26px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(14px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(14px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
    }
    h3 {
      color: #111;
      font-size: 15px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: #6b6e76;
      font-size: 12px;
    }
    .org {
      color: #5b5e66;
      font-weight: 500;
    }
    .bullets {
      margin-top: calc(6px * var(--cv-space, 1));
      padding-left: 18px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--cv-accent);
    }
    .bullets > li + li {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .plain > li + li {
      margin-top: calc(5px * var(--cv-space, 1));
    }
    strong {
      color: #111;
      font-weight: 700;
    }
    .letter {
      margin-top: calc(30px * var(--cv-space, 1));
    }
  `,
})
export class CvAiry extends CvTemplateBase {}
