import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Ruban : titres de sections sur des rubans qui partent du bord de la page et finissent en
 * queue d'aronde, en-tête centré avec le titre du poste sur un ruban. Le ruban est un fond :
 * le titre reste un texte normal.
 */
@Component({
  selector: 'app-cv-ribbon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
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
      </header>

      @if (summary() || qr()) {
        <div class="intro">
          @if (summary()) {
            <p class="summary">{{ summary() }}</p>
          }
          @if (qr(); as code) {
            <div class="qr">
              <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
            </div>
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
      overflow: hidden;
      padding: calc(40px * var(--cv-space, 1)) 56px calc(44px * var(--cv-space, 1));
      background: #fff;
      color: #1e2129;
      font-family: var(--cv-body-font, 'Montserrat Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --dark: oklch(from var(--cv-accent) 0.32 0.08 h);
    }
    header {
      text-align: center;
    }
    .photo {
      display: block;
      width: 104px;
      height: 104px;
      margin: 0 auto calc(12px * var(--cv-space, 1));
      border: 4px solid var(--cv-accent);
      border-radius: 9999px;
      object-fit: cover;
    }
    .name {
      color: var(--dark);
      font-family: var(--cv-heading-font, 'Montserrat Variable', sans-serif);
      font-size: 34px;
      font-weight: 800;
      line-height: calc(1.1 * var(--cv-leading, 1));
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    /* Ruban du titre : bande colorée et deux queues d'aronde dessinées en fond. */
    .headline {
      width: fit-content;
      margin: calc(10px * var(--cv-space, 1)) auto 0;
      padding: calc(4px * var(--cv-space, 1)) 36px;
      background:
        linear-gradient(to bottom right, transparent 50%, #fff 50%) 0 0 / 14px 50% no-repeat,
        linear-gradient(to top right, transparent 50%, #fff 50%) 0 100% / 14px 50% no-repeat,
        linear-gradient(to bottom left, transparent 50%, #fff 50%) 100% 0 / 14px 50% no-repeat,
        linear-gradient(to top left, transparent 50%, #fff 50%) 100% 100% / 14px 50% no-repeat,
        var(--cv-accent);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: calc(5px * var(--cv-space, 1)) 18px;
      margin-top: calc(14px * var(--cv-space, 1));
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(6px * var(--cv-space, 1)) 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--cv-accent);
    }
    .intro {
      display: flex;
      align-items: center;
      gap: calc(22px * var(--cv-space, 1)) 22px;
      margin-top: calc(18px * var(--cv-space, 1));
    }
    .summary {
      min-width: 0;
      flex: 1;
      font-size: 12px;
      white-space: pre-line;
    }
    .qr {
      flex-shrink: 0;
      padding: calc(5px * var(--cv-space, 1)) 5px;
      border: 2px solid var(--cv-accent);
    }
    .qr-code {
      width: 60px;
      height: 60px;
      color: #1e2129;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    /* Ruban de section : part du bord gauche de la page et finit en queue d'aronde. */
    h2 {
      width: fit-content;
      margin: 0 0 calc(10px * var(--cv-space, 1)) -56px;
      padding: calc(5px * var(--cv-space, 1)) 40px calc(5px * var(--cv-space, 1)) 56px;
      background:
        linear-gradient(to bottom left, transparent 50%, #fff 50%) 100% 0 / 16px 50% no-repeat,
        linear-gradient(to top left, transparent 50%, #fff 50%) 100% 100% / 16px 50% no-repeat,
        var(--cv-accent);
      color: #fff;
      font-family: var(--cv-heading-font, 'Montserrat Variable', sans-serif);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(11px * var(--cv-space, 1));
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    h3 {
      color: var(--dark);
      font-size: 13px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: var(--cv-accent);
      font-size: 11px;
      font-weight: 700;
    }
    .org {
      color: #5a5f6c;
      font-weight: 500;
    }
    .bullets {
      margin-top: calc(3px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--cv-accent);
    }
    .bullets > li + li {
      margin-top: calc(1px * var(--cv-space, 1));
    }
    .skill-row {
      display: flex;
      align-items: baseline;
      gap: calc(10px * var(--cv-space, 1)) 10px;
    }
    .skill-row + .skill-row {
      margin-top: calc(6px * var(--cv-space, 1));
    }
    .skill-label {
      flex-shrink: 0;
      max-width: 40%;
      color: var(--dark);
      font-weight: 700;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: 0 9px;
      border: 1.5px solid var(--cv-accent);
      font-size: 11px;
      font-weight: 500;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .meter {
      display: flex;
      gap: calc(3px * var(--cv-space, 1)) 3px;
    }
    .step {
      width: 16px;
      height: 7px;
      background: #e6e8ee;
    }
    .step.on {
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvRibbon extends CvTemplateBase {}
