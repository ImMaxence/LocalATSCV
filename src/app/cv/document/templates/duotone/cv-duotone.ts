import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Duotone : grand bandeau partagé, texte sur aplat de couleur à gauche, photo bichromie à droite
 * (noir et blanc multiplié par la couleur d'accent). Sans photo, des rayures prennent sa place.
 */
@Component({
  selector: 'app-cv-duotone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header class="hero">
        <div class="hero-text">
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
        </div>
        <div class="visual" aria-hidden="true">
          @if (photoUrl()) {
            <img class="photo" [src]="photoUrl()" alt="" />
          }
          @if (qr(); as code) {
            <div class="qr">
              <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
            </div>
          }
        </div>
      </header>

      <div class="body">
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
                    {{ keywords(group).join(' · ') }}
                  </p>
                }
              }
              @case ('languages') {
                <ul class="languages">
                  @for (item of languages(section); track item.id) {
                    <li>
                      <span>{{ languageLabel(item) }}</span>
                      @if (languageLevel(item); as level) {
                        <span class="bar" aria-hidden="true">
                          <span class="fill" [style.width.%]="level * 20"></span>
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
      </div>
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
      background: #fff;
      color: #1a1c22;
      font-family: var(--cv-body-font, 'Manrope Variable', sans-serif);
      font-size: 12px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --deep: oklch(from var(--cv-accent) 0.32 0.09 h);
    }
    .hero {
      display: flex;
      min-height: 250px;
      background: var(--cv-accent);
      color: #fff;
    }
    .hero-text {
      display: flex;
      min-width: 0;
      flex: 1;
      flex-direction: column;
      justify-content: flex-end;
      padding: calc(40px * var(--cv-space, 1)) 32px calc(30px * var(--cv-space, 1)) 54px;
    }
    .name {
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 44px;
      font-weight: 800;
      line-height: calc(0.98 * var(--cv-leading, 1));
      letter-spacing: -0.02em;
    }
    .headline {
      margin-top: calc(10px * var(--cv-space, 1));
      color: rgb(255 255 255 / 0.85);
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(5px * var(--cv-space, 1)) 18px;
      margin-top: calc(20px * var(--cv-space, 1));
      font-size: 11.5px;
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(6px * var(--cv-space, 1)) 6px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
    }
    .visual {
      position: relative;
      width: 250px;
      flex-shrink: 0;
      overflow: hidden;
      background:
        repeating-linear-gradient(-45deg, transparent 0 14px, rgb(255 255 255 / 0.12) 14px 28px),
        var(--deep);
    }
    /* Bichromie : photo en noir et blanc, multipliée par la couleur d'accent (image seule). */
    .photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: grayscale(1) contrast(1.1);
      mix-blend-mode: multiply;
    }
    .visual:has(.photo) {
      background: var(--cv-accent);
    }
    .qr {
      position: absolute;
      right: 14px;
      bottom: 14px;
      padding: calc(5px * var(--cv-space, 1)) 5px;
      background: #fff;
    }
    .qr-code {
      width: 60px;
      height: 60px;
      color: #1a1c22;
    }
    .body {
      padding: calc(26px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
    }
    .summary {
      padding-left: 14px;
      border-left: 4px solid var(--cv-accent);
      font-size: 13px;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(20px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(10px * var(--cv-space, 1)) 10px;
      margin-bottom: calc(9px * var(--cv-space, 1));
      color: var(--deep);
      font-family: var(--cv-heading-font, 'Archivo Variable', sans-serif);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    h2::before {
      content: '';
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      background: var(--cv-accent);
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
      font-size: 13.5px;
      font-weight: 700;
    }
    .dates {
      flex-shrink: 0;
      color: var(--cv-accent);
      font-size: 11.5px;
      font-weight: 700;
    }
    .org {
      color: #565b68;
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
    .skill + .skill {
      margin-top: calc(3px * var(--cv-space, 1));
    }
    .skill-label {
      margin-right: 6px;
      font-weight: 700;
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
    .bar {
      width: 110px;
      height: 6px;
      flex-shrink: 0;
      background: #e8eaef;
    }
    .fill {
      display: block;
      height: 100%;
      background: var(--cv-accent);
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvDuotone extends CvTemplateBase {}
