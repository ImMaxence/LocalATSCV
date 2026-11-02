import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Contour : tout est filet fin et angles droits, titres dans un onglet accolé au cadre de
 * chaque rubrique, aucune surface colorée hors l'onglet. Space Grotesk, une colonne.
 */
@Component({
  selector: 'app-cv-outline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="box">
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
        <section class="section">
          <h2>{{ labels().sections.summary }}</h2>
          <div class="box body">
            <p class="summary">{{ summary() }}</p>
          </div>
        </section>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id) {
        <section class="section">
          <h2>{{ sectionTitle(section) }}</h2>
          <div class="box body">
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
                          @for (step of levelSteps; track step) {
                            <span class="step" [class.on]="step <= level"></span>
                          }
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
          </div>
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
      padding: calc(48px * var(--cv-space, 1)) 54px;
      background: #fff;
      color: #1c1c1e;
      font-family: var(--cv-body-font, 'Space Grotesk Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --line: #1c1c1e;
    }
    .box {
      border: 1.5px solid var(--line);
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(20px * var(--cv-space, 1)) 24px;
      padding: calc(22px * var(--cv-space, 1)) 26px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Space Grotesk Variable', sans-serif);
      font-size: 34px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: calc(1.05 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-size: 14px;
      font-weight: 600;
    }
    .photo {
      width: 100px;
      height: 100px;
      flex-shrink: 0;
      border: 1.5px solid var(--line);
      object-fit: cover;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      border: 1.5px solid var(--line);
      border-top: 0;
    }
    .contact > li {
      padding: calc(4px * var(--cv-space, 1)) 12px;
      border-right: 1.5px solid var(--line);
      font-size: 10.5px;
    }
    .contact > li:last-child {
      border-right: 0;
    }
    .section {
      margin-top: calc(16px * var(--cv-space, 1));
    }
    h2 {
      display: inline-block;
      margin-bottom: -1.5px;
      padding: 2px 12px;
      border: 1.5px solid var(--line);
      border-bottom: 0;
      background: var(--cv-accent);
      color: #fff;
      font-family: var(--cv-heading-font, 'Space Grotesk Variable', sans-serif);
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .body {
      padding: calc(12px * var(--cv-space, 1)) 16px;
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
      border-top: 1px dashed #b5b5b8;
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
      color: #58585c;
      font-size: 10.5px;
    }
    .org {
      color: var(--cv-accent);
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 15px;
      list-style: square;
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
      gap: calc(4px * var(--cv-space, 1)) 4px;
    }
    .chips > li {
      padding: 0 8px;
      border: 1px solid var(--line);
      font-size: 10.5px;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 400px;
    }
    .languages > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: 3px;
    }
    .step {
      width: 12px;
      height: 8px;
      border: 1px solid var(--line);
    }
    .step.on {
      background: var(--cv-accent);
      border-color: var(--cv-accent);
    }
    .letter {
      margin-top: calc(18px * var(--cv-space, 1));
      padding: calc(16px * var(--cv-space, 1)) 20px;
      border: 1.5px solid var(--line);
    }
  `,
})
export class CvOutline extends CvTemplateBase {}
