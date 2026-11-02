import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Gazette : une de journal, nom en manchette Playfair, filets doubles, ligne de date,
 * lettrine sur le résumé et rubriques encadrées de filets gras et fins. Une seule colonne.
 */
@Component({
  selector: 'app-cv-gazette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        <div class="masthead">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </div>
        @if (contact().length) {
          <p class="dateline">
            @for (item of contact(); track $index) {
              @if (!$first) {
                <span class="sep" aria-hidden="true"> | </span>
              }
              <span>{{ item }}</span>
            }
          </p>
        }
      </header>

      @if (photoUrl() || summary() || qr()) {
        <div class="lead">
          @if (photoUrl()) {
            <img class="photo" [src]="photoUrl()" alt="" />
          }
          @if (summary()) {
            <p class="summary">{{ summary() }}</p>
          }
          @if (qr(); as code) {
            <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
          }
        </div>
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
                <p class="skill-row">
                  @if (group.label.trim()) {
                    <strong class="skill-label">{{ group.label }}{{ separator() }}</strong>
                  }
                  <span>{{ keywords(group).join(' · ') }}</span>
                </p>
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
      padding: calc(44px * var(--cv-space, 1)) 58px calc(46px * var(--cv-space, 1));
      background: #fbfaf6;
      color: #1a1a1a;
      font-family: var(--cv-body-font, 'Lora Variable', serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --rule: #1a1a1a;
    }
    header {
      border-top: 4px solid var(--rule);
      border-bottom: 1px solid var(--rule);
    }
    .masthead {
      padding: calc(14px * var(--cv-space, 1)) 0 calc(10px * var(--cv-space, 1));
      border-top: 1px solid var(--rule);
      margin-top: 2px;
      text-align: center;
    }
    .name {
      font-family: var(--cv-heading-font, 'Playfair Display Variable', serif);
      font-size: 46px;
      font-weight: 800;
      letter-spacing: -0.01em;
      line-height: calc(1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(8px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-size: 14px;
      font-style: italic;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .dateline {
      padding: calc(5px * var(--cv-space, 1)) 0;
      border-top: 3px double var(--rule);
      color: #333;
      font-size: 10.5px;
      letter-spacing: 0.02em;
      text-align: center;
    }
    .sep {
      color: #999;
    }
    .lead {
      display: flex;
      align-items: flex-start;
      gap: calc(18px * var(--cv-space, 1)) 20px;
      margin-top: calc(18px * var(--cv-space, 1));
    }
    .photo {
      width: 124px;
      height: 150px;
      flex-shrink: 0;
      border: 1px solid var(--rule);
      object-fit: cover;
      filter: grayscale(1) contrast(1.05);
    }
    .summary {
      flex: 1;
      min-width: 0;
      font-size: 13px;
      white-space: pre-line;
    }
    .summary::first-letter {
      float: left;
      margin: 4px 6px 0 0;
      color: var(--cv-accent);
      font-family: var(--cv-heading-font, 'Playfair Display Variable', serif);
      font-size: 44px;
      font-weight: 800;
      line-height: 0.8;
    }
    .qr {
      width: 70px;
      height: 70px;
      flex-shrink: 0;
      padding: 4px;
      border: 1px solid var(--rule);
      color: #1a1a1a;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(9px * var(--cv-space, 1));
      padding: calc(3px * var(--cv-space, 1)) 0;
      border-top: 2px solid var(--rule);
      border-bottom: 1px solid var(--rule);
      font-family: var(--cv-heading-font, 'Playfair Display Variable', serif);
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-align: center;
      text-transform: uppercase;
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
      font-family: var(--cv-heading-font, 'Playfair Display Variable', serif);
      font-size: 13.5px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: #555;
      font-size: 10.5px;
      font-style: italic;
    }
    .org {
      color: var(--cv-accent);
      font-size: 11.5px;
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
    .skill-row + .skill-row {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .skill-label {
      font-weight: 700;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 400px;
    }
    .languages > li + li {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: 4px;
    }
    .step {
      width: 9px;
      height: 9px;
      border: 1px solid var(--rule);
      border-radius: 9999px;
    }
    .step.on {
      background: var(--rule);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvGazette extends CvTemplateBase {}
