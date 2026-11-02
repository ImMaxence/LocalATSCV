import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Fiches : chaque rubrique dans une carte blanche à liseré fin et ombre légère, en-tête à filet
 * d'accent, fond gris très clair. Sobre et structuré, une seule colonne.
 */
@Component({
  selector: 'app-cv-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="card head">
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
      </header>

      @if (summary()) {
        <section class="card section">
          <h2>{{ labels().sections.summary }}</h2>
          <p class="summary">{{ summary() }}</p>
        </section>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter card" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id) {
        <section class="card section">
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
                        <span class="fill" [style.width.%]="level * 20"></span>
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
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      padding: calc(36px * var(--cv-space, 1)) 42px calc(40px * var(--cv-space, 1));
      background: #f5f6f8;
      color: #22252b;
      font-family: var(--cv-body-font, 'DM Sans Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .card {
      padding: calc(14px * var(--cv-space, 1)) 20px calc(14px * var(--cv-space, 1));
      border: 1px solid #e3e6eb;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 1px 2px rgb(20 30 50 / 0.05);
    }
    .head {
      display: flex;
      align-items: center;
      gap: calc(20px * var(--cv-space, 1)) 22px;
      padding: calc(20px * var(--cv-space, 1)) 24px;
      border-top: 4px solid var(--cv-accent);
    }
    .photo {
      width: 100px;
      height: 100px;
      flex-shrink: 0;
      border-radius: 10px;
      object-fit: cover;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: #111;
      font-family: var(--cv-heading-font, 'DM Sans Variable', sans-serif);
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: calc(1.1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(4px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-size: 14px;
      font-weight: 600;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(10px * var(--cv-space, 1));
      color: #5c616b;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      color: #8a909b;
    }
    .section {
      margin-top: calc(12px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(8px * var(--cv-space, 1));
      color: #111;
      font-family: var(--cv-heading-font, 'DM Sans Variable', sans-serif);
      font-size: 12px;
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
      margin-top: calc(10px * var(--cv-space, 1));
      padding-top: calc(10px * var(--cv-space, 1));
      border-top: 1px solid #eef0f3;
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
    }
    h3 {
      color: #111;
      font-size: 13px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: #6b7280;
      font-size: 11px;
    }
    .org {
      color: var(--cv-accent);
      font-weight: 600;
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
      padding: 1px 9px;
      border: 1px solid #e3e6eb;
      border-radius: 6px;
      background: #f5f6f8;
      font-size: 11px;
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
      display: block;
      width: 100px;
      height: 6px;
      overflow: hidden;
      border-radius: 3px;
      background: #e3e6eb;
    }
    .fill {
      display: block;
      height: 100%;
      border-radius: 3px;
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(12px * var(--cv-space, 1));
      padding: calc(18px * var(--cv-space, 1)) 22px;
    }
  `,
})
export class CvCards extends CvTemplateBase {}
