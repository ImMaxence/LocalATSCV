import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Douceur : panneaux arrondis dans une teinte très claire de l'accent, icônes de contact,
 * compétences en pastilles, sans aucun trait dur. Sobre et chaleureux, une colonne.
 */
@Component({
  selector: 'app-cv-soft',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="panel">
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
      padding: calc(40px * var(--cv-space, 1)) 48px calc(44px * var(--cv-space, 1));
      background: #fff;
      color: #2b2d33;
      font-family: var(--cv-body-font, 'Manrope Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --tint: oklch(from var(--cv-accent) 0.95 0.03 h);
      --tint-2: oklch(from var(--cv-accent) 0.9 0.05 h);
      --ink: oklch(from var(--cv-accent) 0.42 0.12 h);
    }
    .panel {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 24px;
      padding: calc(24px * var(--cv-space, 1)) 28px;
      border-radius: 20px;
      background: var(--tint);
    }
    .photo {
      width: 112px;
      height: 112px;
      flex-shrink: 0;
      border-radius: 28px;
      object-fit: cover;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: calc(1.1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(4px * var(--cv-space, 1));
      font-size: 15px;
      font-weight: 600;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(12px * var(--cv-space, 1));
      color: #4f535c;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--ink);
    }
    .summary {
      margin-top: calc(18px * var(--cv-space, 1));
      padding: 0 8px;
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
      padding: 0 8px;
    }
    h2 {
      display: inline-block;
      margin-bottom: calc(10px * var(--cv-space, 1));
      padding: 3px 14px;
      border-radius: 9999px;
      background: var(--tint-2);
      color: var(--ink);
      font-family: var(--cv-heading-font, 'Manrope Variable', sans-serif);
      font-size: 12.5px;
      font-weight: 800;
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
      font-size: 13px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: #6b6f78;
      font-size: 11px;
      font-weight: 600;
    }
    .org {
      color: var(--ink);
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--tint-2);
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
      padding: 1px 10px;
      border-radius: 9999px;
      background: var(--tint);
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
      display: block;
      width: 100px;
      height: 8px;
      overflow: hidden;
      border-radius: 9999px;
      background: var(--tint);
    }
    .fill {
      display: block;
      height: 100%;
      border-radius: 9999px;
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(20px * var(--cv-space, 1));
      padding: 0 8px;
    }
  `,
})
export class CvSoft extends CvTemplateBase {}
