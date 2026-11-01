import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvTemplateBase } from '../cv-template-base';

/** Tech : liseré latéral, titres et dates en chasse fixe, compétences façon `code`. */
@Component({
  selector: 'app-cv-tech',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText],
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
      width: 794px;
      min-height: 1123px;
      padding: 50px 56px 50px 60px;
      border-left: 7px solid var(--cv-accent);
      background: #fff;
      color: #1f2328;
      font-family: var(--cv-body-font, var(--font-sans));
      font-size: 12.5px;
      line-height: 1.5;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    header {
      display: flex;
      align-items: flex-start;
      gap: 24px;
      padding-bottom: 18px;
      border-bottom: 1px dashed #cfd4da;
    }
    .name {
      color: #0d1117;
      font-family: var(--cv-heading-font, var(--font-grotesk));
      font-size: 31px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .headline {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
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
      margin-top: 10px;
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
      margin-top: 20px;
    }
    h2 {
      margin-bottom: 10px;
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
      margin-top: 12px;
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
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
      margin-top: 4px;
      padding-left: 16px;
      list-style: square;
    }
    .bullets > li + li {
      margin-top: 2px;
    }
    .bullets > li::marker {
      color: var(--cv-accent);
    }
    .skill-row + .skill-row {
      margin-top: 7px;
    }
    .skill-label {
      margin-bottom: 4px;
      color: #57606a;
      font-family: var(--font-mono);
      font-size: 10.5px;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .tags > li {
      padding: 1px 7px;
      border: 1px solid #d8dee4;
      border-radius: 5px;
      background: #f6f8fa;
      font-family: var(--font-mono);
      font-size: 11px;
    }
  `,
})
export class CvTech extends CvTemplateBase {}
