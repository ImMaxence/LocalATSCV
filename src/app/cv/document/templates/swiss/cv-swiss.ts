import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Suisse : style typographique international façon affiche. Nom immense en grotesque serrée,
 * bande de couleur sur le bord gauche, gros filets noirs et rubriques numérotées, sans icônes.
 */
@Component({
  selector: 'app-cv-swiss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <div class="band" aria-hidden="true"></div>
      <header>
        <div class="identity">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </div>
        @if (qr(); as code) {
          <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
        }
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
        <section class="row">
          <h2><span class="num">00</span>{{ labels().sections.summary }}</h2>
          <p class="summary">{{ summary() }}</p>
        </section>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id; let i = $index) {
        <section class="row">
          <h2>
            <span class="num">{{ number(i) }}</span
            >{{ sectionTitle(section) }}
          </h2>
          @switch (section.kind) {
            @case ('skills') {
              @for (group of skills(section); track group.id) {
                <p class="skill">
                  @if (group.label.trim()) {
                    <strong>{{ group.label }}</strong>
                  }
                  {{ keywords(group).join(', ') }}
                </p>
              }
            }
            @case ('languages') {
              <ul class="plain">
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
      position: relative;
      box-sizing: border-box;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      padding: calc(50px * var(--cv-space, 1)) 56px calc(44px * var(--cv-space, 1)) 78px;
      background: #fff;
      color: #111;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 12px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .band {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 18px;
      background: var(--cv-accent);
    }
    header {
      display: flex;
      align-items: flex-start;
      gap: calc(18px * var(--cv-space, 1)) 18px;
      padding-bottom: calc(20px * var(--cv-space, 1));
      border-bottom: 7px solid #111;
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Inter Variable', sans-serif);
      font-size: 60px;
      font-weight: 800;
      line-height: calc(0.92 * var(--cv-leading, 1));
      letter-spacing: -0.04em;
    }
    .headline {
      margin-top: calc(14px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-size: 19px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .qr-code {
      width: 72px;
      height: 72px;
      flex-shrink: 0;
      color: #111;
    }
    .photo {
      width: 112px;
      height: 112px;
      flex-shrink: 0;
      object-fit: cover;
      filter: grayscale(1);
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(3px * var(--cv-space, 1)) 22px;
      margin-top: calc(12px * var(--cv-space, 1));
      font-size: 11.5px;
      font-weight: 500;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(7px * var(--cv-space, 1)) 7px;
    }
    .contact > li::before {
      content: '';
      width: 6px;
      height: 6px;
      background: var(--cv-accent);
    }
    .row {
      margin-top: calc(18px * var(--cv-space, 1));
      padding-top: calc(8px * var(--cv-space, 1));
      border-top: 2.5px solid #111;
    }
    h2 {
      margin-bottom: calc(9px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Inter Variable', sans-serif);
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .num {
      margin-right: 14px;
      color: var(--cv-accent);
    }
    .summary {
      font-size: 13px;
      white-space: pre-line;
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
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .dates {
      flex-shrink: 0;
      font-size: 11.5px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .org {
      color: #555;
      font-weight: 500;
    }
    .bullets {
      margin-top: calc(4px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--cv-accent);
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill + .skill,
    .plain > li + li {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .skill strong {
      margin-right: 6px;
      font-weight: 700;
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvSwiss extends CvTemplateBase {
  protected number(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
