import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Bento : en-tête en grille de tuiles arrondies (photo, nom, QR code), puis une tuile par
 * section. Les tuiles de contenu s'empilent sur toute la largeur : jamais deux blocs de texte
 * côte à côte, donc un ordre de lecture sans ambiguïté.
 */
@Component({
  selector: 'app-cv-bento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="top">
        @if (photoUrl()) {
          <img class="tile photo" [src]="photoUrl()" alt="" />
        }
        <div class="tile identity">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </div>
        @if (qr(); as code) {
          <div class="tile qr">
            <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
          </div>
        }
      </header>

      @if (contactItems().length) {
        <ul class="tile contact">
          @for (item of contactItems(); track $index) {
            <li>
              <app-icon class="contact-icon" [name]="item.icon" [strokeWidth]="2" />
              <span>{{ item.text }}</span>
            </li>
          }
        </ul>
      }

      @if (summary()) {
        <p class="tile summary">{{ summary() }}</p>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter tile" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id) {
        <section class="tile section" [class.dark]="section.kind === 'skills'">
          <h2><span class="dot" aria-hidden="true"></span>{{ sectionTitle(section) }}</h2>
          @switch (section.kind) {
            @case ('skills') {
              @for (group of skills(section); track group.id; let first = $first) {
                <div class="skill-row">
                  @if (group.label.trim()) {
                    <span class="skill-label">{{ group.label }}</span>
                  }
                  <ul class="chips" [class.solid]="first">
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
      display: flex;
      flex-direction: column;
      gap: calc(9px * var(--cv-space, 1)) 9px;
      width: calc(794px / var(--cv-zoom, 1));
      zoom: var(--cv-zoom, 1);
      min-height: calc(1123px / var(--cv-zoom, 1));
      padding: calc(30px * var(--cv-space, 1)) 34px calc(32px * var(--cv-space, 1));
      background: color-mix(in oklab, var(--cv-accent) 5%, #f2f3f5);
      color: #1c1d22;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 12px;
      line-height: calc(1.45 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --soft: color-mix(in oklab, var(--cv-accent) 12%, white);
    }
    .tile {
      border-radius: 20px;
      background: #fff;
    }
    .top {
      display: flex;
      gap: calc(9px * var(--cv-space, 1)) 9px;
    }
    .photo {
      width: 148px;
      height: 148px;
      flex-shrink: 0;
      object-fit: cover;
    }
    .identity {
      display: flex;
      min-width: 0;
      flex: 1;
      flex-direction: column;
      justify-content: flex-end;
      overflow: hidden;
      min-height: 148px;
      box-sizing: border-box;
      padding: calc(20px * var(--cv-space, 1)) 24px;
      background:
        radial-gradient(circle at 100% 0%, rgb(255 255 255 / 0.22) 0 70px, transparent 71px),
        radial-gradient(circle at 92% 8%, rgb(255 255 255 / 0.12) 0 120px, transparent 121px),
        var(--cv-accent);
      color: #fff;
    }
    .name {
      font-family: var(--cv-heading-font, 'Bricolage Grotesque Variable', sans-serif);
      font-size: 36px;
      font-weight: 800;
      line-height: calc(1.02 * var(--cv-leading, 1));
      letter-spacing: -0.02em;
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      font-size: 15px;
      font-weight: 500;
      color: rgb(255 255 255 / 0.9);
    }
    .qr {
      display: grid;
      width: 148px;
      flex-shrink: 0;
      place-items: center;
    }
    .qr-code {
      width: 104px;
      height: 104px;
      color: #1c1d22;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(6px * var(--cv-space, 1)) 20px;
      padding: calc(11px * var(--cv-space, 1)) 18px;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(6px * var(--cv-space, 1)) 6px;
    }
    .contact-icon {
      width: 14px;
      height: 14px;
      color: var(--cv-accent);
    }
    .summary {
      padding: calc(14px * var(--cv-space, 1)) 20px;
      background: var(--soft);
      font-size: 12.5px;
      white-space: pre-line;
    }
    .section {
      padding: calc(13px * var(--cv-space, 1)) 20px calc(15px * var(--cv-space, 1));
    }
    .section.dark {
      background: #17181c;
      color: #f2f3f5;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(8px * var(--cv-space, 1)) 8px;
      margin-bottom: calc(8px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Bricolage Grotesque Variable', sans-serif);
      font-size: 16px;
      font-weight: 700;
    }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 9999px;
      background: var(--cv-accent);
    }
    .dark .dot {
      background: oklch(from var(--cv-accent) 0.78 0.13 h);
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(10px * var(--cv-space, 1));
      padding-top: calc(10px * var(--cv-space, 1));
      border-top: 1px solid #ececf0;
    }
    .entry-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    h3 {
      font-size: 13.5px;
      font-weight: 650;
    }
    .dates {
      flex-shrink: 0;
      padding: calc(1px * var(--cv-space, 1)) 10px;
      border-radius: 9999px;
      background: #f1f2f4;
      font-size: 11px;
      font-weight: 600;
    }
    .org {
      color: var(--cv-accent);
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
      color: #a5a8b3;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: calc(1px * var(--cv-space, 1)) 10px;
      border-radius: 9999px;
      background: #f1f2f4;
      font-size: 11.5px;
    }
    .dark .chips > li {
      background: rgb(255 255 255 / 0.1);
    }
    .dark .chips.solid > li {
      background: var(--cv-accent);
      color: #fff;
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
      gap: calc(4px * var(--cv-space, 1)) 4px;
    }
    .step {
      width: 16px;
      height: 7px;
      border-radius: 9999px;
      background: #e6e7eb;
    }
    .step.on {
      background: var(--cv-accent);
    }
    .letter {
      padding: calc(22px * var(--cv-space, 1)) 26px;
    }
  `,
})
export class CvBento extends CvTemplateBase {}
