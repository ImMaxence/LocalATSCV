import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Typo : la typographie comme seul décor. Nom immense, prénom plein et nom en contour, titres
 * très grands, filet épais. Le nom reste une seule ligne de texte pour les ATS.
 */
@Component({
  selector: 'app-cv-typo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        <div class="identity">
          @if (fullName()) {
            <h1 class="name">
              <span class="first">{{ cv().profile.firstName.trim() }}</span>
              {{ ' ' }}<span class="last">{{ cv().profile.lastName.trim() }}</span>
            </h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </div>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
      </header>

      <div class="contact-row">
        @if (contact().length) {
          <p class="contact">{{ contact().join(' / ') }}</p>
        }
        @if (qr(); as code) {
          <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
        }
      </div>

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
                <p class="skill">
                  @if (group.label.trim()) {
                    <span class="skill-label">{{ group.label }}</span>
                  }
                  {{ keywords(group).join(', ') }}
                </p>
              }
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
      padding: calc(46px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
      background: #fff;
      color: #0f0f12;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 12px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    header {
      display: flex;
      align-items: flex-end;
      gap: calc(24px * var(--cv-space, 1)) 24px;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 58px;
      font-weight: 900;
      line-height: calc(0.95 * var(--cv-leading, 1));
      letter-spacing: -0.03em;
      text-transform: uppercase;
    }
    .last {
      color: transparent;
      -webkit-text-stroke: 1.6px var(--cv-accent);
    }
    .headline {
      margin-top: calc(12px * var(--cv-space, 1));
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .photo {
      width: 104px;
      height: 130px;
      flex-shrink: 0;
      object-fit: cover;
      filter: grayscale(1);
    }
    .contact-row {
      display: flex;
      align-items: center;
      gap: calc(20px * var(--cv-space, 1)) 20px;
      margin-top: calc(18px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 0;
      border-top: 6px solid #0f0f12;
      border-bottom: 1px solid #0f0f12;
    }
    .contact {
      min-width: 0;
      flex: 1;
      font-size: 11.5px;
      font-weight: 500;
    }
    .qr-code {
      width: 56px;
      height: 56px;
      flex-shrink: 0;
      color: #0f0f12;
    }
    .summary {
      margin-top: calc(16px * var(--cv-space, 1));
      font-size: 14px;
      font-weight: 500;
      line-height: calc(1.45 * var(--cv-leading, 1));
      white-space: pre-line;
    }
    .section {
      margin-top: calc(20px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: baseline;
      gap: calc(8px * var(--cv-space, 1)) 8px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 22px;
      font-weight: 900;
      line-height: calc(1 * var(--cv-leading, 1));
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }
    h2::after {
      content: '';
      width: 9px;
      height: 9px;
      flex-shrink: 0;
      background: var(--cv-accent);
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
      font-size: 14px;
      font-weight: 800;
    }
    .dates {
      flex-shrink: 0;
      font-size: 11.5px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .org {
      color: var(--cv-accent);
      font-weight: 600;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: square;
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill + .skill {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .skill-label {
      margin-right: 6px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvTypo extends CvTemplateBase {}
