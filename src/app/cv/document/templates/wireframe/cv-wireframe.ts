import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Fil de fer : maquette d'interface en traits pointillés, repères d'angle, barres grises de
 * substitution comme décor, étiquettes en chasse fixe. Une seule colonne, accent sur les repères.
 */
@Component({
  selector: 'app-cv-wireframe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="box">
        <span class="corner c1" aria-hidden="true"></span>
        <span class="corner c2" aria-hidden="true"></span>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        } @else {
          <span class="placeholder" aria-hidden="true"></span>
        }
        <div class="identity">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
          @if (contact().length) {
            <ul class="contact">
              @for (item of contact(); track $index) {
                <li>{{ item }}</li>
              }
            </ul>
          }
        </div>
        @if (qr(); as code) {
          <app-qr-code class="qr" [value]="code.url" [logo]="code.icon" />
        }
      </header>

      @if (summary()) {
        <p class="summary box">{{ summary() }}</p>
      }

      @if (letter(); as body) {
        <app-cv-letter class="letter box" [letter]="body" [cv]="cv()" />
      }
      @for (section of cv().sections; track section.id) {
        <section class="section box">
          <h2>
            <span class="bars" aria-hidden="true"></span>
            {{ sectionTitle(section) }}
          </h2>
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
                        <span class="fill" [style.width.%]="level * 20"></span>
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
      padding: calc(40px * var(--cv-space, 1)) 48px calc(44px * var(--cv-space, 1));
      background: #fff;
      color: #1f2227;
      font-family: var(--cv-body-font, 'Inter Variable', sans-serif);
      font-size: 11.5px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --wire: #b6bbc6;
      --grey: #e4e7ec;
      --mono: 'JetBrains Mono Variable', monospace;
    }
    .box {
      border: 1.5px dashed var(--wire);
      border-radius: 4px;
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(20px * var(--cv-space, 1)) 22px;
      padding: calc(22px * var(--cv-space, 1)) 24px;
      border-color: var(--cv-accent);
    }
    /* Repères d'angle d'un calque sélectionné (aucun texte). */
    .corner {
      display: block;
      width: 8px;
      height: 8px;
      margin: -26px 0 0 -28px;
      border: 1.5px solid var(--cv-accent);
      background: #fff;
      flex-shrink: 0;
    }
    .c2 {
      margin: 0 -28px -26px 0;
      order: 9;
      align-self: flex-end;
    }
    .photo {
      width: 104px;
      height: 104px;
      flex-shrink: 0;
      border: 1.5px dashed var(--wire);
      object-fit: cover;
    }
    .placeholder {
      display: block;
      width: 104px;
      height: 104px;
      flex-shrink: 0;
      border: 1.5px dashed var(--wire);
      background: linear-gradient(135deg, transparent 49%, var(--wire) 49% 51%, transparent 51%),
        linear-gradient(45deg, transparent 49%, var(--wire) 49% 51%, transparent 51%);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      font-family: var(--cv-heading-font, 'Inter Variable', sans-serif);
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: calc(1.1 * var(--cv-leading, 1));
    }
    .headline {
      margin-top: calc(4px * var(--cv-space, 1));
      color: var(--cv-accent);
      font-family: var(--mono);
      font-size: 13px;
      font-weight: 600;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(3px * var(--cv-space, 1)) 14px;
      margin-top: calc(10px * var(--cv-space, 1));
      color: #5a606b;
      font-family: var(--mono);
      font-size: 10px;
    }
    .qr {
      width: 70px;
      height: 70px;
      flex-shrink: 0;
      padding: 5px;
      border: 1.5px dashed var(--wire);
      color: #1f2227;
    }
    .summary {
      margin-top: calc(14px * var(--cv-space, 1));
      padding: calc(10px * var(--cv-space, 1)) 16px;
      font-size: 12px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(14px * var(--cv-space, 1));
      padding: calc(12px * var(--cv-space, 1)) 16px calc(14px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      font-family: var(--cv-heading-font, 'Inter Variable', sans-serif);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    /* Barres grises de maquette, comme un bloc de texte de substitution. */
    .bars {
      display: block;
      width: 26px;
      height: 14px;
      background:
        linear-gradient(var(--cv-accent), var(--cv-accent)) 0 0 / 100% 4px no-repeat,
        linear-gradient(var(--grey), var(--grey)) 0 5px / 70% 4px no-repeat,
        linear-gradient(var(--grey), var(--grey)) 0 10px / 85% 4px no-repeat;
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(10px * var(--cv-space, 1));
      padding-top: calc(10px * var(--cv-space, 1));
      border-top: 1px dashed var(--grey);
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
    }
    h3 {
      font-size: 13px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      padding: 0 6px;
      border: 1px dashed var(--wire);
      border-radius: 3px;
      color: #5a606b;
      font-family: var(--mono);
      font-size: 10px;
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
    .bullets > li::marker {
      color: var(--wire);
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
      font-weight: 700;
    }
    .chips {
      display: flex;
      min-width: 0;
      flex-wrap: wrap;
      gap: calc(4px * var(--cv-space, 1)) 5px;
    }
    .chips > li {
      padding: 0 8px;
      border: 1px dashed var(--wire);
      border-radius: 3px;
      font-family: var(--mono);
      font-size: 10.5px;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: calc(4px * var(--cv-space, 1));
    }
    .meter {
      display: block;
      width: 110px;
      height: 8px;
      border: 1px dashed var(--wire);
      border-radius: 2px;
    }
    .fill {
      display: block;
      height: 100%;
      background: repeating-linear-gradient(-45deg, var(--cv-accent) 0 3px, transparent 3px 6px);
    }
    .letter {
      margin-top: calc(14px * var(--cv-space, 1));
      padding: calc(16px * var(--cv-space, 1)) 20px;
    }
  `,
})
export class CvWireframe extends CvTemplateBase {}
