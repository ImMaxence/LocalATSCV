import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { CvTemplateBase } from '../cv-template-base';

/** Moderne : bandeau de couleur, titres en Space Grotesk, compétences en pastilles. */
@Component({
  selector: 'app-cv-modern',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
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
                  <app-icon
                    class="contact-icon"
                    [name]="contactIcons[item.kind]"
                    [strokeWidth]="2"
                  />
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
                          <li>{{ bullet.text }}</li>
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
      width: 794px;
      min-height: 1123px;
      background: #fff;
      color: #1f2328;
      font-family: var(--font-sans);
      font-size: 12.5px;
      line-height: 1.45;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .band {
      display: flex;
      align-items: center;
      gap: 26px;
      padding: 44px 58px 30px;
      background: var(--cv-accent);
      color: #fff;
    }
    .name {
      font-family: var(--font-grotesk);
      font-size: 34px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.05;
    }
    .headline {
      margin-top: 6px;
      font-size: 15px;
      font-weight: 500;
      opacity: 0.92;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 16px;
      margin-top: 12px;
      font-size: 11.5px;
      opacity: 0.92;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .contact-icon {
      width: 12px;
      height: 12px;
      opacity: 0.85;
    }
    .band .sep {
      opacity: 0.5;
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
      padding: 22px 58px 48px;
    }
    .section {
      margin-top: 18px;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      color: #111;
      font-family: var(--font-grotesk);
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
      margin-top: 12px;
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
    }
    h3 {
      color: #111;
      font-size: 13.5px;
      font-weight: 650;
    }
    .dates {
      flex-shrink: 0;
      padding: 1px 10px;
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
      margin-top: 4px;
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li + li {
      margin-top: 2px;
    }
    .bullets > li::marker {
      color: var(--cv-accent);
    }
    .skill-row + .skill-row {
      margin-top: 8px;
    }
    .skill-label {
      margin-bottom: 4px;
      color: #666;
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .chips > li {
      padding: 2px 10px;
      border-radius: 9999px;
      background: #f2f3f5;
      color: #222;
      font-size: 11.5px;
    }
  `,
})
export class CvModern extends CvTemplateBase {}
