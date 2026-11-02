import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Monochrome : noir et blanc, contrastes de graisse (nom en très gras, détails fins), un seul
 * carré d'accent devant le nom. Grotesque Archivo, une colonne.
 */
@Component({
  selector: 'app-cv-mono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        <div class="identity">
          <span class="square" aria-hidden="true"></span>
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
          <div class="content">
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
      padding: calc(56px * var(--cv-space, 1)) 60px;
      background: #fff;
      color: #111;
      font-family: var(--cv-body-font, 'Archivo Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: calc(20px * var(--cv-space, 1)) 24px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .square {
      display: block;
      width: 14px;
      height: 14px;
      margin-bottom: calc(14px * var(--cv-space, 1));
      background: var(--cv-accent);
    }
    .name {
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 44px;
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: calc(0.98 * var(--cv-leading, 1));
      text-transform: uppercase;
    }
    .headline {
      margin-top: calc(10px * var(--cv-space, 1));
      font-size: 15px;
      font-weight: 300;
      letter-spacing: 0.01em;
    }
    .photo {
      width: 104px;
      height: 104px;
      flex-shrink: 0;
      object-fit: cover;
      filter: grayscale(1);
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(2px * var(--cv-space, 1)) 20px;
      margin-top: calc(16px * var(--cv-space, 1));
      padding-top: calc(10px * var(--cv-space, 1));
      border-top: 3px solid #111;
      font-size: 11px;
      font-weight: 500;
    }
    .summary {
      margin-top: calc(18px * var(--cv-space, 1));
      font-size: 13px;
      font-weight: 300;
      white-space: pre-line;
    }
    .section {
      display: grid;
      grid-template-columns: 150px minmax(0, 1fr);
      gap: 0 24px;
      margin-top: calc(18px * var(--cv-space, 1));
      padding-top: calc(12px * var(--cv-space, 1));
      border-top: 1px solid #111;
    }
    h2 {
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
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
      font-weight: 800;
    }
    .dates {
      flex-shrink: 0;
      font-size: 10.5px;
      font-weight: 500;
    }
    .org {
      font-weight: 300;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 14px;
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
      font-weight: 800;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 4px;
    }
    .chips > li {
      padding: 0 8px;
      border: 1.5px solid #111;
      font-size: 10.5px;
      font-weight: 500;
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
      width: 14px;
      height: 5px;
      background: #ddd;
    }
    .step.on {
      background: #111;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvMono extends CvTemplateBase {}
