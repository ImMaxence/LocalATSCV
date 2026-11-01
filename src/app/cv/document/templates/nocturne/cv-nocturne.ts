import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';
import { QrCode } from '../../parts/qr-code';
import { RichText } from '../../parts/rich-text';
import { CvLetter } from '../../parts/cv-letter';
import { CvTemplateBase } from '../cv-template-base';

/**
 * Nocturne : CV en mode sombre. Fond nuit, halos et accents néon tirés de la couleur d'accent,
 * frise lumineuse. Le texte clair sur fond sombre reste du vrai texte : la couleur n'a aucun
 * effet sur la lecture par un ATS.
 */
@Component({
  selector: 'app-cv-nocturne',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, QrCode, RichText, CvLetter],
  template: `
    <article class="cv" [attr.lang]="cv().language" [style.--cv-accent]="cv().accentColor">
      <header>
        @if (photoUrl()) {
          <img class="photo" [src]="photoUrl()" alt="" />
        }
        <div class="identity">
          @if (fullName()) {
            <h1 class="name">{{ fullName() }}</h1>
          }
          @if (cv().profile.title.trim()) {
            <p class="headline">{{ cv().profile.title }}</p>
          }
        </div>
        @if (qr(); as code) {
          <div class="qr">
            <app-qr-code class="qr-code" [value]="code.url" [logo]="code.icon" />
          </div>
        }
      </header>

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
                      <span class="bar" aria-hidden="true">
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
              <div class="timeline">
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
              </div>
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
      padding: calc(44px * var(--cv-space, 1)) 54px calc(44px * var(--cv-space, 1));
      background:
        radial-gradient(circle at 92% 4%, var(--glow), transparent 32%),
        radial-gradient(circle at 0% 100%, var(--glow2), transparent 36%), #0f1115;
      color: #e6e8ee;
      font-family: var(--cv-body-font, 'Manrope Variable', sans-serif);
      font-size: 12px;
      line-height: calc(1.5 * var(--cv-leading, 1));
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      --neon: oklch(from var(--cv-accent) 0.8 0.15 h);
      --neon2: oklch(from var(--cv-accent) 0.8 0.13 calc(h + 70));
      --glow: oklch(from var(--cv-accent) 0.55 0.16 h / 0.35);
      --glow2: oklch(from var(--cv-accent) 0.55 0.14 calc(h + 70) / 0.22);
      --muted: #9ba3b4;
    }
    header {
      display: flex;
      align-items: center;
      gap: calc(24px * var(--cv-space, 1)) 24px;
    }
    .photo {
      width: 104px;
      height: 104px;
      flex-shrink: 0;
      border: 2px solid var(--neon);
      border-radius: 26px;
      object-fit: cover;
      box-shadow: 0 0 26px -4px var(--neon);
    }
    .identity {
      min-width: 0;
      flex: 1;
    }
    .name {
      color: #fff;
      font-family: var(--cv-heading-font, 'Space Grotesk Variable', sans-serif);
      font-size: 40px;
      font-weight: 700;
      line-height: calc(1.05 * var(--cv-leading, 1));
      letter-spacing: -0.01em;
    }
    .headline {
      margin-top: calc(6px * var(--cv-space, 1));
      color: var(--neon);
      font-size: 16px;
      font-weight: 600;
    }
    .qr {
      flex-shrink: 0;
      padding: calc(6px * var(--cv-space, 1)) 6px;
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 0 24px -6px var(--neon);
    }
    .qr-code {
      width: 70px;
      height: 70px;
      color: #0f1115;
    }
    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: calc(6px * var(--cv-space, 1)) 6px;
      margin-top: calc(20px * var(--cv-space, 1));
    }
    .contact > li {
      display: flex;
      align-items: center;
      gap: calc(6px * var(--cv-space, 1)) 6px;
      padding: calc(2px * var(--cv-space, 1)) 11px;
      border: 1px solid rgb(255 255 255 / 0.12);
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.05);
      font-size: 11.5px;
    }
    .contact-icon {
      width: 13px;
      height: 13px;
      color: var(--neon);
    }
    .summary {
      margin-top: calc(16px * var(--cv-space, 1));
      color: #cfd3dc;
      white-space: pre-line;
    }
    .section {
      margin-top: calc(18px * var(--cv-space, 1));
    }
    h2 {
      display: flex;
      align-items: center;
      gap: calc(12px * var(--cv-space, 1)) 12px;
      margin-bottom: calc(10px * var(--cv-space, 1));
      color: var(--neon);
      font-family: var(--cv-heading-font, 'Space Grotesk Variable', sans-serif);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h2::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, var(--neon), transparent);
      opacity: 0.6;
    }
    .timeline {
      margin-left: 4px;
      padding-left: 20px;
      border-left: 1px solid rgb(255 255 255 / 0.14);
    }
    .entry {
      break-inside: avoid;
    }
    .entry + .entry {
      margin-top: calc(12px * var(--cv-space, 1));
    }
    /* Pastille en flottant, pas en absolu : dans le PDF, le texte garde l'ordre du document. */
    .entry::before {
      content: '';
      float: left;
      margin: 5px 0 0 -25px;
      width: 9px;
      height: 9px;
      border-radius: 9999px;
      background: var(--neon);
      box-shadow: 0 0 10px 1px var(--neon);
    }
    .entry-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
    }
    h3 {
      color: #fff;
      font-size: 13.5px;
      font-weight: 600;
    }
    .dates {
      flex-shrink: 0;
      color: var(--neon2);
      font-size: 11.5px;
      font-weight: 600;
    }
    .org {
      color: var(--muted);
    }
    .bullets {
      margin-top: calc(4px * var(--cv-space, 1));
      padding-left: 16px;
      list-style: disc;
    }
    .bullets > li::marker {
      color: var(--neon);
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
      color: var(--muted);
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
      padding: 0 10px;
      border: 1px solid color-mix(in oklab, var(--neon) 70%, transparent);
      border-radius: 9999px;
      color: #fff;
      font-size: 11.5px;
    }
    .chips.solid > li {
      border-color: var(--neon);
      background: var(--neon);
      color: #0f1115;
      font-weight: 600;
    }
    .languages > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(16px * var(--cv-space, 1)) 16px;
      max-width: 420px;
    }
    .languages > li + li {
      margin-top: calc(5px * var(--cv-space, 1));
    }
    .bar {
      width: 110px;
      height: 6px;
      flex-shrink: 0;
      overflow: hidden;
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.1);
    }
    .fill {
      display: block;
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--neon), var(--neon2));
    }
    .letter {
      margin-top: calc(22px * var(--cv-space, 1));
    }
  `,
})
export class CvNocturne extends CvTemplateBase {}
