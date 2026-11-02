import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Linéaire : tout sur des filets fins, titres de rubrique en petites capitales grises, dates
 * alignées à droite, l'accent seulement sous le nom. Space Grotesk, une seule colonne.
 */
@Component({
  selector: 'app-cv-linear',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
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
          <p class="summary">{{ summary() }}</p>
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
                <div class="line">
                  <span class="key">{{ group.label }}</span>
                  <span class="value">{{ keywords(group).join(' · ') }}</span>
                </div>
              }
            }
            @case ('languages') {
              @for (item of languages(section); track item.id) {
                <div class="line">
                  <span class="key">{{ item.name }}</span>
                  <span class="value">{{ item.level }}</span>
                </div>
              }
            }
            @case ('interests') {
              <div class="line">
                <span class="value">{{ interestLine(interests(section)) }}</span>
              </div>
            }
            @default {
              @for (entry of entries(section); track entry.id) {
                <div class="line entry">
                  <div class="min-w-0 flex-1">
                    <h3>{{ entry.title }}</h3>
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
                  @if (dates(entry)) {
                    <span class="dates">{{ dates(entry) }}</span>
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
      padding: calc(56px * var(--cv-space, 1)) 60px;
      background: #fff;
      color: #1c1c1e;
      font-family: var(--cv-body-font, 'Space Grotesk Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --rule: #e2e2e6;
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
    .name {
      display: inline-block;
      padding-bottom: calc(6px * var(--cv-space, 1));
      border-bottom: 3px solid var(--cv-accent);
      font-family: var(--cv-heading-font, 'Space Grotesk Variable', sans-serif);
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: calc(1.1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(10px * var(--cv-space, 1));
      font-size: 14px;
      font-weight: 500;
    }
    .photo {
      width: 96px;
      height: 96px;
      flex-shrink: 0;
      object-fit: cover;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(3px * var(--cv-space, 1)) 18px;
      margin-top: calc(14px * var(--cv-space, 1));
      padding: calc(8px * var(--cv-space, 1)) 0;
      border-top: 1px solid var(--rule);
      border-bottom: 1px solid var(--rule);
      color: #5a5a60;
      font-size: 11px;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      margin-bottom: calc(4px * var(--cv-space, 1));
      color: #8a8a92;
      font-family: var(--cv-heading-font, 'Space Grotesk Variable', sans-serif);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .summary {
      padding-top: calc(6px * var(--cv-space, 1));
      border-top: 1px solid var(--rule);
      white-space: pre-line;
    }
    .line {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 20px;
      padding: calc(6px * var(--cv-space, 1)) 0;
      border-top: 1px solid var(--rule);
    }
    .key {
      flex: 0 0 150px;
      color: #5a5a60;
      font-weight: 500;
    }
    .value {
      flex: 1;
      min-width: 0;
    }
    .entry {
      break-inside: avoid;
    }
    h3 {
      font-size: 13px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: #5a5a60;
      font-size: 11px;
      font-variant-numeric: tabular-nums;
    }
    .org {
      color: #5a5a60;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 15px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: #b8b8c0;
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvLinear extends CvTemplateBase {}
