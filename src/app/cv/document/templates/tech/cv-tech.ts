import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/** Tech : liseré latéral, titres et dates en chasse fixe, compétences façon `code`. */
@Component({
  selector: 'app-cv-tech',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        <div class="min-w-0 flex-1">
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
                  <span class="sep"> / </span>
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
                  <ul class="tags">
                    @for (keyword of keywords(group); track $index) {
                      <li>{{ keyword }}</li>
                    }
                  </ul>
                </div>
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
                    <h3>
                      {{ entry.title }}
                      @if (entry.subtitle.trim()) {
                        <span class="at">&#64; {{ entry.subtitle }}</span>
                      }
                    </h3>
                    @if (dates(entry)) {
                      <p class="dates">{{ dates(entry) }}</p>
                    }
                  </div>
                  @if (meta(entry)) {
                    <p class="meta">{{ meta(entry) }}</p>
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
      padding: calc(50px * var(--cv-space, 1)) 56px calc(50px * var(--cv-space, 1)) 60px;
      border-left: 7px solid var(--cv-accent);
      background: #fff;
      color: #1f2328;
      font-family: var(--cv-body-font, var(--font-sans));
      font-size: 12.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    header {
      display: flex;
      align-items: flex-start;
      gap: calc(24px * var(--cv-space, 1)) 24px;
      padding-bottom: calc(18px * var(--cv-space, 1));
      border-bottom: 1px dashed #cfd4da;
    }
    .name {
      color: #0d1117;
      font-family: var(--cv-heading-font, var(--font-grotesk));
      font-size: 31px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: calc(1.1 * var(--cv-leading, 1));
    }
    .headline {
      display: flex;
      align-items: center;
      gap: calc(8px * var(--cv-space, 1)) 8px;
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 600;
    }
    .headline::before {
      content: '';
      width: 8px;
      height: 15px;
      background: var(--cv-accent);
    }
    .contact {
      margin-top: calc(10px * var(--cv-space, 1));
      color: #57606a;
      font-family: var(--font-mono);
      font-size: 10.5px;
    }
    .sep {
      color: #b0b7c0;
    }
    .photo {
      width: 96px;
      height: 96px;
      flex-shrink: 0;
      border-radius: 12px;
      object-fit: cover;
    }
    .section {
      margin-top: calc(20px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(10px * var(--cv-space, 1));
      color: #0d1117;
      font-family: var(--font-mono);
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: 0.02em;
      text-transform: lowercase;
    }
    h2::after {
      content: '';
      display: block;
      width: 34px;
      height: 3px;
      margin-top: 4px;
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
      color: #0d1117;
      font-size: 13px;
      font-weight: 650;
    }
    .at {
      color: var(--cv-accent);
      font-weight: 600;
    }
    .dates,
    .meta {
      color: #6e7781;
      font-family: var(--font-mono);
      font-size: 10.5px;
    }
    .dates {
      flex-shrink: 0;
    }
    .bullets {
      margin-top: calc(4px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: square;
    }
    .bullets > li + li {
      margin-top: calc(2px * var(--cv-space, 1));
    }
    .bullets > li::marker {
      color: var(--cv-accent);
    }
    .skill-row + .skill-row {
      margin-top: calc(7px * var(--cv-space, 1));
    }
    .skill-label {
      margin-bottom: calc(4px * var(--cv-space, 1));
      color: #57606a;
      font-family: var(--font-mono);
      font-size: 10.5px;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .tags > li {
      padding: calc(1px * var(--cv-space, 1)) 7px;
      border: 1px solid #d8dee4;
      border-radius: 5px;
      background: #f6f8fa;
      font-family: var(--font-mono);
      font-size: 11px;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvTech extends CvTemplateBase {}
