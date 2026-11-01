import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Moderne : bandeau de couleur, titres en Space Grotesk, compétences en pastilles. */
@Component({
  selector: 'app-cv-modern',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, Icon, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="band">
        <div class="min-w-0 flex-1">
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
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
      </header>

      <div class="body">
        @if (summary()) {
          <section class="section">
            <h2>{{ labels().sections.summary }}</h2>
            <p class="whitespace-pre-line">{{ summary() }}</p>
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
                @for (group of skills(section); track group.id) {
                  <div class="skill-row">
                    @if (group.label.trim()) {
                      <p class="skill-label">{{ group.label }}</p>
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
                <ul class="chips">
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
                        <p class="dates">{{ dates(entry) }}</p>
                      }
                    </div>
                    @if (entry.subtitle.trim() || meta(entry)) {
                      <p class="org">
                        <span class="company">{{ entry.subtitle }}</span>
                        @if (entry.subtitle.trim() && meta(entry)) {
                          <span class="sep"> · </span>
                        }
                        <span>{{ meta(entry) }}</span>
                      </p>
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
      </div>
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
      background: #fff;
      color: #1f2328;
      font-family: var(--cv-body-font, var(--font-sans));
      font-size: 12.5px;
      line-height: calc(1.45 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .band {
      display: flex;
      align-items: center;
      gap: calc(26px * var(--cv-space, 1)) 26px;
      padding: calc(44px * var(--cv-space, 1)) 58px calc(30px * var(--cv-space, 1));
      background: var(--cv-accent);
      color: #fff;
    }
    .name {
      font-family: var(--cv-heading-font, var(--font-grotesk));
      font-size: 34px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      font-size: 15px;
      font-weight: 500;
      color: rgb(255 255 255 / 0.92);
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 16px;
      margin-top: calc(12px * var(--cv-space, 1));
      font-size: 11.5px;
      color: rgb(255 255 255 / 0.92);
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      opacity: 0.85;
    }
    .band .sep {
      color: rgb(255 255 255 / 0.5);
    }
    .photo {
      width: 108px;
      height: 108px;
      flex-shrink: 0;
      border: 3px solid rgb(255 255 255 / 0.55);
      border-radius: 9999px;
      object-fit: cover;
    }
    .body {
      padding: calc(22px * var(--cv-space, 1)) 58px calc(48px * var(--cv-space, 1));
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(10px * var(--cv-space, 1)) 10px;
      margin-bottom: calc(10px * var(--cv-space, 1));
      color: #111;
      font-family: var(--cv-heading-font, var(--font-grotesk));
      font-size: 15px;
      font-weight: 700;
    }
    h2::before {
      content: '';
      width: 10px;
      height: 10px;
      flex-shrink: 0;
      border-radius: 3px;
      background: var(--cv-accent);
    }
    h2::after {
      content: '';
      height: 1px;
      flex: 1;
      background: #e6e6e6;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(12px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    h3 {
      color: #111;
      font-size: 13.5px;
      font-weight: 650;
    }
    .dates {
      flex-shrink: 0;
      padding: calc(1px * var(--cv-space, 1)) 10px;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--cv-accent) 11%, white);
      color: var(--cv-accent);
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }
    .org {
      color: #666;
      font-size: 12px;
    }
    .company {
      color: var(--cv-accent);
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(4px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: calc(2px * var(--cv-space, 1));
    }
    .bullets > li::marker {
      color: var(--cv-accent);
    }
    .skill-row + .skill-row {
      margin-top: calc(8px * var(--cv-space, 1));
    }
    .skill-label {
      margin-bottom: calc(4px * var(--cv-space, 1));
      color: #666;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: calc(2px * var(--cv-space, 1)) 10px;
      border-radius: 9999px;
      background: #f2f3f5;
      color: #222;
      font-size: 11.5px;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvModern extends CvTemplateBase {}
